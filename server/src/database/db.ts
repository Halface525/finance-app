import sqlite3 from 'sqlite3';
import { Category, Transaction } from '../types';

const db = new sqlite3.Database('./finance.db');

export const initDatabase = () => {
  db.run(`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
      color TEXT NOT NULL
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      amount REAL NOT NULL,
      description TEXT,
      categoryId TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
      date TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (categoryId) REFERENCES categories(id)
    )
  `);

  initDefaultCategories();
};

const initDefaultCategories = () => {
  db.get('SELECT COUNT(*) as count FROM categories', (err, row) => {
    if (err) return;
    if ((row as { count: number }).count === 0) {
      const defaultCategories: Omit<Category, 'id'>[] = [
        { name: '工资', type: 'income', color: '#22c55e' },
        { name: '奖金', type: 'income', color: '#14b8a6' },
        { name: '投资收益', type: 'income', color: '#3b82f6' },
        { name: '其他收入', type: 'income', color: '#8b5cf6' },
        { name: '餐饮', type: 'expense', color: '#ef4444' },
        { name: '交通', type: 'expense', color: '#f97316' },
        { name: '购物', type: 'expense', color: '#eab308' },
        { name: '娱乐', type: 'expense', color: '#ec4899' },
        { name: '医疗', type: 'expense', color: '#6b7280' },
        { name: '教育', type: 'expense', color: '#0ea5e9' },
        { name: '住房', type: 'expense', color: '#8b5cf6' },
        { name: '其他支出', type: 'expense', color: '#6b7280' },
      ];

      defaultCategories.forEach((cat) => {
        const id = crypto.randomUUID();
        db.run('INSERT INTO categories (id, name, type, color) VALUES (?, ?, ?, ?)', [
          id, cat.name, cat.type, cat.color
        ]);
      });
    }
  });
};

export const query = <T>(sql: string, params: unknown[] = []): Promise<T[]> => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows as T[]);
    });
  });
};

export const run = (sql: string, params: unknown[] = []): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
};

export const get = <T>(sql: string, params: unknown[] = []): Promise<T | undefined> => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row as T);
    });
  });
};

export default db;
