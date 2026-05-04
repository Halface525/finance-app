import express from 'express';
import { query, run, get } from '../database/db';
import { Transaction } from '../types';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, type } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    let sql = 'SELECT * FROM transactions ORDER BY date DESC, createdAt DESC';
    let countSql = 'SELECT COUNT(*) as count FROM transactions';
    const params: unknown[] = [];
    const countParams: unknown[] = [];

    if (type && (type === 'income' || type === 'expense')) {
      sql += ' WHERE type = ?';
      countSql += ' WHERE type = ?';
      params.push(type);
      countParams.push(type);
    }

    sql += ' LIMIT ? OFFSET ?';
    params.push(limitNum, offset);

    const [transactions, countResult] = await Promise.all([
      query<Transaction>(sql, params),
      get<{ count: number }>(countSql, countParams),
    ]);

    const totalItems = countResult?.count || 0;
    const totalPages = Math.ceil(totalItems / limitNum);

    res.json({ transactions, totalItems, totalPages, currentPage: pageNum });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/recent', async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    const limitNum = parseInt(limit as string);

    const transactions = await query<Transaction>(
      'SELECT * FROM transactions ORDER BY date DESC, createdAt DESC LIMIT ?',
      [limitNum]
    );

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const transaction = await get<Transaction>('SELECT * FROM transactions WHERE id = ?', [id]);

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json(transaction);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { amount, description, categoryId, type, date } = req.body;

    if (!amount || !categoryId || !type || !date) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (type !== 'income' && type !== 'expense') {
      return res.status(400).json({ error: 'Invalid type' });
    }

    const category = await get<{ type: string }>('SELECT type FROM categories WHERE id = ?', [categoryId]);
    if (!category) {
      return res.status(400).json({ error: 'Invalid category' });
    }

    if (category.type !== type) {
      return res.status(400).json({ error: 'Category type mismatch' });
    }

    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();

    await run(
      'INSERT INTO transactions (id, amount, description, categoryId, type, date, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, amount, description || null, categoryId, type, date, createdAt]
    );

    const newTransaction = await get<Transaction>('SELECT * FROM transactions WHERE id = ?', [id]);
    res.status(201).json(newTransaction);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, description, categoryId, type, date } = req.body;

    const existing = await get<Transaction>('SELECT * FROM transactions WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    const updates: string[] = [];
    const params: unknown[] = [];

    if (amount !== undefined) {
      updates.push('amount = ?');
      params.push(amount);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      params.push(description);
    }
    if (categoryId) {
      const category = await get<{ type: string }>('SELECT type FROM categories WHERE id = ?', [categoryId]);
      if (!category) {
        return res.status(400).json({ error: 'Invalid category' });
      }
      updates.push('categoryId = ?');
      params.push(categoryId);
      updates.push('type = ?');
      params.push(category.type);
    }
    if (type && (type === 'income' || type === 'expense')) {
      updates.push('type = ?');
      params.push(type);
    }
    if (date) {
      updates.push('date = ?');
      params.push(date);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No updates provided' });
    }

    params.push(id);
    await run(`UPDATE transactions SET ${updates.join(', ')} WHERE id = ?`, params);

    const updated = await get<Transaction>('SELECT * FROM transactions WHERE id = ?', [id]);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await get<Transaction>('SELECT * FROM transactions WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    await run('DELETE FROM transactions WHERE id = ?', [id]);
    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/export/csv', async (req, res) => {
  try {
    const { year, month, type } = req.query;

    let sql = `
      SELECT t.*, c.name as categoryName 
      FROM transactions t 
      LEFT JOIN categories c ON t.categoryId = c.id
    `;
    const params: unknown[] = [];
    const conditions: string[] = [];

    if (year && month) {
      const monthStr = String(month).padStart(2, '0');
      conditions.push(`t.date LIKE ?`);
      params.push(`${year}-${monthStr}%`);
    }

    if (type && (type === 'income' || type === 'expense')) {
      conditions.push(`t.type = ?`);
      params.push(type);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    sql += ' ORDER BY t.date DESC, t.createdAt DESC';

    const transactions = await query<Transaction & { categoryName: string }>(sql, params);

    const headers = ['日期', '类型', '分类', '金额', '备注'];
    const csvRows = [headers.join(',')];

    for (const t of transactions) {
      const row = [
        t.date,
        t.type === 'income' ? '收入' : '支出',
        t.categoryName || '',
        t.amount.toString(),
        `"${(t.description || '').replace(/"/g, '""')}"`,
      ];
      csvRows.push(row.join(','));
    }

    const csvContent = '\ufeff' + csvRows.join('\n');
    const filename = `transactions_${year || 'all'}_${month || 'all'}.csv`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csvContent);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/import/csv', async (req, res) => {
  try {
    const { csvContent } = req.body;

    if (!csvContent) {
      return res.status(400).json({ error: 'CSV content is required' });
    }

    const lines = csvContent.split('\n').filter((line: string) => line.trim());
    if (lines.length < 2) {
      return res.status(400).json({ error: 'CSV must have header and at least one data row' });
    }

    const categories = await query<{ id: string; name: string; type: string }>(
      'SELECT id, name, type FROM categories'
    );
    const categoryMap = new Map<string, string>();
    categories.forEach((cat) => {
      categoryMap.set(cat.name, cat.id);
      categoryMap.set(cat.type === 'income' ? '收入' : '支出', cat.id);
    });

    const results = { success: 0, failed: 0, errors: [] as string[] };
    const skipHeader = lines[0].includes('日期') || lines[0].includes('type');

    for (let i = skipHeader ? 1 : 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const values = line.match(/("([^"]|"")*"|[^,]+)/g) || [];
      const cleanValues = values.map((v: string) => v.replace(/^"|"$/g, '').replace(/""/g, '"').trim());

      const [date, typeStr, categoryName, amountStr, description] = cleanValues;

      const type = typeStr === '收入' ? 'income' : typeStr === '支出' ? 'expense' : null;
      const amount = parseFloat(amountStr);

      if (!date || !type || isNaN(amount)) {
        results.failed++;
        results.errors.push(`行 ${i + 1}: 数据格式错误`);
        continue;
      }

      let categoryId = categoryMap.get(categoryName);
      if (!categoryId) {
        const defaultCat = categories.find((c) => c.type === type);
        categoryId = defaultCat?.id;
      }

      if (!categoryId) {
        results.failed++;
        results.errors.push(`行 ${i + 1}: 无法找到分类 "${categoryName}"`);
        continue;
      }

      const id = crypto.randomUUID();
      const createdAt = new Date().toISOString();

      await run(
        'INSERT INTO transactions (id, amount, description, categoryId, type, date, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [id, amount, description || null, categoryId, type, date, createdAt]
      );
      results.success++;
    }

    res.json({
      message: `导入完成`,
      success: results.success,
      failed: results.failed,
      errors: results.errors.slice(0, 10),
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
