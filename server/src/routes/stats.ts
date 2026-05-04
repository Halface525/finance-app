import express from 'express';
import { query, get } from '../database/db.js';
import { MonthlyStats, CategoryStats } from '../types/index.js';

const router = express.Router();

router.get('/monthly/:year/:month', async (req, res) => {
  try {
    const { year, month } = req.params;
    const monthStr = month.padStart(2, '0');

    const incomeResult = await get<{ total: number }>(
      `SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE type = 'income' AND date LIKE '${year}-${monthStr}%'`
    );

    const expenseResult = await get<{ total: number }>(
      `SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE type = 'expense' AND date LIKE '${year}-${monthStr}%'`
    );

    const income = incomeResult?.total || 0;
    const expense = expenseResult?.total || 0;

    const stats: MonthlyStats = {
      month: `${year}-${monthStr}`,
      monthLabel: `${parseInt(month)}月`,
      income,
      expense,
      balance: income - expense,
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/categories/:year/:month/:type', async (req, res) => {
  try {
    const { year, month, type } = req.params;
    const monthStr = month.padStart(2, '0');

    if (type !== 'income' && type !== 'expense') {
      return res.status(400).json({ error: 'Invalid type' });
    }

    const stats = await query<CategoryStats>(`
      SELECT 
        c.id as categoryId,
        c.name as categoryName,
        COALESCE(SUM(t.amount), 0) as amount,
        c.color
      FROM categories c
      LEFT JOIN transactions t ON c.id = t.categoryId
        AND t.type = ?
        AND t.date LIKE '${year}-${monthStr}%'
      WHERE c.type = ?
      GROUP BY c.id, c.name, c.color
      ORDER BY amount DESC
    `, [type, type]);

    const total = stats.reduce((sum, item) => sum + item.amount, 0);

    const result = stats.map((item) => ({
      ...item,
      percentage: total > 0 ? ((item.amount / total) * 100).toFixed(1) : '0',
    }));

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
