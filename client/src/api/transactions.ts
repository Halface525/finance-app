import axios from './axios';
import type { Transaction, MonthlyStats, CategoryStats } from '../types';

export const getTransactions = async (page = 1, limit = 10, type?: string) => {
  const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
  if (type) params.append('type', type);
  const response = await axios.get(`/transactions?${params}`);
  return response.data;
};

export const getTransactionById = async (id: string) => {
  const response = await axios.get(`/transactions/${id}`);
  return response.data;
};

export const createTransaction = async (data: Omit<Transaction, 'id' | 'createdAt'>) => {
  const response = await axios.post('/transactions', data);
  return response.data;
};

export const updateTransaction = async (id: string, data: Partial<Transaction>) => {
  const response = await axios.put(`/transactions/${id}`, data);
  return response.data;
};

export const deleteTransaction = async (id: string) => {
  const response = await axios.delete(`/transactions/${id}`);
  return response.data;
};

export const getMonthlyStats = async (year: number, month: number) => {
  const response = await axios.get(`/stats/monthly/${year}/${month}`);
  return response.data as MonthlyStats;
};

export const getCategoryStats = async (year: number, month: number, type: 'income' | 'expense') => {
  const response = await axios.get(`/stats/categories/${year}/${month}/${type}`);
  return response.data as CategoryStats[];
};

export const getRecentTransactions = async (limit = 5) => {
  const response = await axios.get(`/transactions/recent?limit=${limit}`);
  return response.data as Transaction[];
};

export const exportTransactionsCSV = async (year?: number, month?: number, type?: string) => {
  const params = new URLSearchParams();
  if (year) params.append('year', year.toString());
  if (month) params.append('month', month.toString());
  if (type) params.append('type', type);

  const response = await axios.get(`/transactions/export/csv?${params}`, {
    responseType: 'blob',
  });
  return response.data;
};

export const importTransactionsCSV = async (csvContent: string) => {
  const response = await axios.post('/transactions/import/csv', { csvContent });
  return response.data;
};
