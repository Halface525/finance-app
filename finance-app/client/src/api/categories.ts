import axios from './axios';
import type { Category } from '../types';

export const getCategories = async (type?: 'income' | 'expense') => {
  const url = type ? `/categories?type=${type}` : '/categories';
  const response = await axios.get(url);
  return response.data as Category[];
};

export const getCategoryById = async (id: string) => {
  const response = await axios.get(`/categories/${id}`);
  return response.data;
};

export const createCategory = async (data: Omit<Category, 'id'>) => {
  const response = await axios.post('/categories', data);
  return response.data;
};

export const updateCategory = async (id: string, data: Partial<Category>) => {
  const response = await axios.put(`/categories/${id}`, data);
  return response.data;
};

export const deleteCategory = async (id: string) => {
  const response = await axios.delete(`/categories/${id}`);
  return response.data;
};
