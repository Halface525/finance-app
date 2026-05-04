import express from 'express';
import { query, run, get } from '../database/db';
import { Category } from '../types';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { type } = req.query;
    let sql = 'SELECT * FROM categories';
    const params: unknown[] = [];
    
    if (type && (type === 'income' || type === 'expense')) {
      sql += ' WHERE type = ?';
      params.push(type);
    }
    
    const categories = await query<Category>(sql, params);
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const category = await get<Category>('SELECT * FROM categories WHERE id = ?', [id]);
    
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, type, color } = req.body;
    
    if (!name || !type || !color) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    if (type !== 'income' && type !== 'expense') {
      return res.status(400).json({ error: 'Invalid type' });
    }
    
    const id = crypto.randomUUID();
    await run('INSERT INTO categories (id, name, type, color) VALUES (?, ?, ?, ?)', [id, name, type, color]);
    
    const newCategory = await get<Category>('SELECT * FROM categories WHERE id = ?', [id]);
    res.status(201).json(newCategory);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, color } = req.body;
    
    const existing = await get<Category>('SELECT * FROM categories WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    const updates: string[] = [];
    const params: unknown[] = [];
    
    if (name) {
      updates.push('name = ?');
      params.push(name);
    }
    if (type && (type === 'income' || type === 'expense')) {
      updates.push('type = ?');
      params.push(type);
    }
    if (color) {
      updates.push('color = ?');
      params.push(color);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({ error: 'No updates provided' });
    }
    
    params.push(id);
    await run(`UPDATE categories SET ${updates.join(', ')} WHERE id = ?`, params);
    
    const updated = await get<Category>('SELECT * FROM categories WHERE id = ?', [id]);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const existing = await get<Category>('SELECT * FROM categories WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    const count = await get<{ count: number }>(
      'SELECT COUNT(*) as count FROM transactions WHERE categoryId = ?',
      [id]
    );
    
    if (count?.count && count.count > 0) {
      return res.status(400).json({ error: 'Cannot delete category with existing transactions' });
    }
    
    await run('DELETE FROM categories WHERE id = ?', [id]);
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
