export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  color: string;
}

export interface Transaction {
  id: string;
  amount: number;
  description: string;
  categoryId: string;
  type: 'income' | 'expense';
  date: string;
  createdAt: string;
}

export interface MonthlyStats {
  month: string;
  monthLabel: string;
  income: number;
  expense: number;
  balance: number;
}

export interface CategoryStats {
  categoryId: string;
  categoryName: string;
  amount: number;
  percentage: number;
  color: string;
}
