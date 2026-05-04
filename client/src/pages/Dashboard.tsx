import { useState, useEffect } from 'react';
import { Plus, TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import StatCard from '../components/StatCard';
import TransactionForm from '../components/TransactionForm';
import type { Transaction, Category, MonthlyStats } from '../types';
import { getRecentTransactions, getMonthlyStats } from '../api/transactions';
import { getCategories } from '../api/categories';

export default function Dashboard() {
  const [stats, setStats] = useState({ income: 0, expense: 0, balance: 0 });
  const [lastMonthStats, setLastMonthStats] = useState({ income: 0, expense: 0 });
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [last6Months, setLast6Months] = useState<MonthlyStats[]>([]);

  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    
    const monthsData = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthStats = await getMonthlyStats(d.getFullYear(), d.getMonth() + 1);
      monthsData.push({
        ...monthStats,
        monthLabel: `${d.getMonth() + 1}月`,
        fullYear: d.getFullYear(),
        fullMonth: d.getMonth() + 1,
      });
    }
    
    const [statsData, lastMonthData, transactions, cats] = await Promise.all([
      getMonthlyStats(year, month),
      getMonthlyStats(lastMonth.getFullYear(), lastMonth.getMonth() + 1),
      getRecentTransactions(5),
      getCategories(),
    ]);
    setStats(statsData);
    setLastMonthStats({ income: lastMonthData.income, expense: lastMonthData.expense });
    setRecentTransactions(transactions);
    setCategories(cats);
    setLast6Months(monthsData);
  };

  const getChangePercent = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  const formatAmount = (amount: number) => {
    if (amount >= 10000) {
      return `${(amount / 10000).toFixed(1)}万`;
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(1)}k`;
    }
    return amount.toString();
  };

  const getCategoryName = (categoryId: string) => {
    return categories.find((cat) => cat.id === categoryId)?.name || '未知';
  };

  const getCategoryColor = (categoryId: string) => {
    return categories.find((cat) => cat.id === categoryId)?.color || '#6b7280';
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold" style={{ color: '#4a3728' }}>仪表盘</h2>
          <p className="text-gray-600 mt-1">📅 {year}年{month}月的财务概览</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="hand-drawn-btn hand-drawn-btn-primary flex items-center gap-2 text-lg"
        >
          <Plus className="w-6 h-6" />
          添加记录
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="本月收入" value={stats.income} type="income" />
        <StatCard title="本月支出" value={stats.expense} type="expense" />
        <StatCard title="本月结余" value={stats.balance} type="balance" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="hand-drawn-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#e8f5e9] flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-[#6bcb77]" />
              </div>
              <div>
                <h3 className="font-bold text-lg">收入趋势</h3>
                <p className="text-sm text-gray-500">近6个月</p>
              </div>
            </div>
            <div className={`flex items-center gap-1 px-3 py-1 rounded-full ${getChangePercent(stats.income, lastMonthStats.income) >= 0 ? 'bg-[#4caf50] text-white' : 'bg-[#f44336] text-white'}`}>
              {getChangePercent(stats.income, lastMonthStats.income) >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              <span className="font-bold">{Math.abs(getChangePercent(stats.income, lastMonthStats.income))}%</span>
            </div>
          </div>
          <div className="flex items-end justify-between h-48" style={{ minHeight: '180px' }}>
            {last6Months.map((monthData, i) => {
              const incomes = last6Months.map(m => Number(m.income));
              const validIncomes = incomes.filter(e => e > 0);
              const maxVal = validIncomes.length > 0 ? Math.max(...validIncomes) : 1;
              const currentIncome = Number(monthData.income);
              const height = validIncomes.length > 0 && currentIncome > 0 
                ? Math.max((currentIncome / maxVal) * 100, 2) 
                : 0;
              return (
                <div key={i} className="flex flex-col items-center gap-1 flex-1" style={{ height: '100%' }}>
                  <div className="relative w-full flex justify-center items-end" style={{ height: '100%' }}>
                    <div
                      className="w-10 bg-gradient-to-t from-[#6bcb77] to-[#a5d6a7] rounded-t-lg transition-all hover:from-[#5ab062] cursor-pointer income-bar relative"
                      style={{ height: `${height}%`, minHeight: currentIncome > 0 ? '4px' : '0px' }}
                    >
                      {currentIncome > 0 && (
                        <span className="absolute left-1/2 transform -translate-x-1/2 -top-5 text-xs font-bold text-[#6bcb77] whitespace-nowrap">
                          ¥{formatAmount(currentIncome)}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">{monthData.monthLabel}</span>
                </div>
              );
            })}
          </div>
          <div className="text-center text-gray-400 text-sm mt-2">本月收入: ¥{stats.income.toLocaleString()}</div>
        </div>

        <div className="hand-drawn-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#ffebee] flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-[#ff6b6b]" />
              </div>
              <div>
                <h3 className="font-bold text-lg">支出趋势</h3>
                <p className="text-sm text-gray-500">近6个月</p>
              </div>
            </div>
            <div className={`flex items-center gap-1 px-3 py-1 rounded-full ${getChangePercent(stats.expense, lastMonthStats.expense) >= 0 ? 'bg-[#f44336] text-white' : 'bg-[#4caf50] text-white'}`}>
              {getChangePercent(stats.expense, lastMonthStats.expense) >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              <span className="font-bold">{Math.abs(getChangePercent(stats.expense, lastMonthStats.expense))}%</span>
            </div>
          </div>
          <div className="flex items-end justify-between h-48" style={{ minHeight: '180px' }}>
            {last6Months.map((monthData, i) => {
              const expenses = last6Months.map(m => Number(m.expense));
              const validExpenses = expenses.filter(e => e > 0);
              const maxVal = validExpenses.length > 0 ? Math.max(...validExpenses) : 1;
              const currentExpense = Number(monthData.expense);
              const height = validExpenses.length > 0 && currentExpense > 0 
                ? Math.max((currentExpense / maxVal) * 100, 2) 
                : 0;
              return (
                <div key={i} className="flex flex-col items-center gap-1 flex-1" style={{ height: '100%' }}>
                  <div className="relative w-full flex justify-center items-end" style={{ height: '100%' }}>
                    <div
                      className="w-10 bg-gradient-to-t from-[#ff6b6b] to-[#ffcdd2] rounded-t-lg transition-all hover:from-[#ee5a5a] cursor-pointer expense-bar relative"
                      style={{ height: `${height}%`, minHeight: currentExpense > 0 ? '4px' : '0px' }}
                    >
                      {currentExpense > 0 && (
                        <span className="absolute left-1/2 transform -translate-x-1/2 -top-5 text-xs font-bold text-[#ff6b6b] whitespace-nowrap">
                          ¥{formatAmount(currentExpense)}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">{monthData.monthLabel}</span>
                </div>
              );
            })}
          </div>
          <div className="text-center text-gray-400 text-sm mt-2">本月支出: ¥{stats.expense.toLocaleString()}</div>
        </div>
      </div>

      <div className="hand-drawn-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-[#e3f2fd] flex items-center justify-center">
            <Wallet className="w-6 h-6 text-[#4dabf7]" />
          </div>
          <h3 className="font-bold text-lg">最近记录</h3>
        </div>
        <div className="space-y-3">
          {recentTransactions.map((transaction) => (
            <div key={transaction.id} className="flex items-center justify-between py-3 border-b-2 border-dashed border-[#ddd] hover:bg-[#fafafa] px-3 rounded-lg transition-all">
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: getCategoryColor(transaction.categoryId) + '30' }}
                >
                  <span style={{ color: getCategoryColor(transaction.categoryId) }}>
                    {transaction.type === 'income' ? '+' : '-'}
                  </span>
                </div>
                <div>
                  <p className="font-bold">{transaction.description || getCategoryName(transaction.categoryId)}</p>
                  <p className="text-sm text-gray-500">{getCategoryName(transaction.categoryId)} · {formatDate(transaction.date)}</p>
                </div>
              </div>
              <p className={`text-xl font-bold ${transaction.type === 'income' ? 'text-[#6bcb77]' : 'text-[#ff6b6b]'}`}>
                {transaction.type === 'income' ? '+' : '-'}{transaction.amount.toLocaleString()}
              </p>
            </div>
          ))}
          {recentTransactions.length === 0 && (
            <div className="text-center py-8">
              <p className="text-4xl mb-2">📝</p>
              <p className="text-gray-400">还没有记录，快添加第一条吧！</p>
            </div>
          )}
        </div>
      </div>

      {showForm && (
        <TransactionForm
          categories={categories}
          onClose={() => setShowForm(false)}
          onSubmit={loadData}
        />
      )}
    </div>
  );
}
