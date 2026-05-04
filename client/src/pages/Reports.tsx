import { useState, useEffect } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { BarChart3, PieChart, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import type { CategoryStats, MonthlyStats } from '../types';
import { getCategoryStats, getMonthlyStats } from '../api/transactions';
import { useTheme } from '../context/ThemeContext';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

export default function Reports() {
  const { theme } = useTheme();
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [incomeStats, setIncomeStats] = useState<CategoryStats[]>([]);
  const [expenseStats, setExpenseStats] = useState<CategoryStats[]>([]);
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStats>({ month: '', monthLabel: '', income: 0, expense: 0, balance: 0 });
  const [last6Months, setLast6Months] = useState<MonthlyStats[]>([]);

  useEffect(() => {
    loadReports();
    loadLast6Months();
  }, [year, month]);

  const loadReports = async () => {
    const [income, expense, stats] = await Promise.all([
      getCategoryStats(year, month, 'income'),
      getCategoryStats(year, month, 'expense'),
      getMonthlyStats(year, month),
    ]);
    setIncomeStats(income);
    setExpenseStats(expense);
    setMonthlyStats(stats);
  };

  const loadLast6Months = async () => {
    const months: MonthlyStats[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const stats = await getMonthlyStats(d.getFullYear(), d.getMonth() + 1);
      months.push(stats);
    }
    setLast6Months(months);
  };

  const pieChartData = (data: CategoryStats[]) => ({
    labels: data.map((item) => item.categoryName),
    datasets: [
      {
        data: data.map((item) => item.amount),
        backgroundColor: data.map((item) => item.color),
        borderWidth: 3,
        borderColor: theme === 'dark' ? '#e94560' : '#4a3728',
      },
    ],
  });

  const barChartData = {
    labels: last6Months.map((item) => item.month),
    datasets: [
      {
        label: '收入',
        data: last6Months.map((item) => item.income),
        backgroundColor: '#6bcb77',
        borderWidth: 2,
        borderColor: theme === 'dark' ? '#e94560' : '#2e7d32',
      },
      {
        label: '支出',
        data: last6Months.map((item) => item.expense),
        backgroundColor: '#ff6b6b',
        borderWidth: 2,
        borderColor: theme === 'dark' ? '#e94560' : '#c62828',
      },
    ],
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          font: {
            family: "'ZCOOL KuaiLe', 'Noto Sans SC'",
            size: 14,
          },
          color: theme === 'dark' ? '#eaeaea' : '#4a3728',
          padding: 20,
        },
      },
    },
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          font: {
            family: "'ZCOOL KuaiLe', 'Noto Sans SC'",
            size: 14,
          },
          color: theme === 'dark' ? '#eaeaea' : '#4a3728',
          padding: 20,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: theme === 'dark' ? 'rgba(233, 69, 96, 0.2)' : '#ddd',
          lineWidth: 2,
        },
        ticks: {
          font: {
            family: "'ZCOOL KuaiLe', 'Noto Sans SC'",
          },
          color: theme === 'dark' ? '#eaeaea' : '#4a3728',
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            family: "'ZCOOL KuaiLe', 'Noto Sans SC'",
          },
          color: theme === 'dark' ? '#eaeaea' : '#4a3728',
        },
      },
    },
  };

  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const years = [year - 1, year, year + 1];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold" style={{ color: '#4a3728' }}>统计报表</h2>
          <p className="text-gray-600 mt-1">📊 分析你的财务数据</p>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            className="hand-drawn-select text-lg"
          >
            {years.map((y) => (
              <option key={y} value={y}>{y}年</option>
            ))}
          </select>
          <select
            value={month}
            onChange={(e) => setMonth(parseInt(e.target.value))}
            className="hand-drawn-select text-lg"
          >
            {months.map((m) => (
              <option key={m} value={m}>{m}月</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="hand-drawn-card p-6 bg-gradient-to-br from-[#e8f5e9] to-[#c8e6c9]">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-[#6bcb77]" />
            </div>
            <p className="text-gray-700 font-medium">当月收入</p>
          </div>
          <p className="text-3xl font-bold text-[#2e7d32]">{monthlyStats.income.toLocaleString()}</p>
          <p className="text-sm text-gray-600 mt-1">元</p>
        </div>
        <div className="hand-drawn-card p-6 bg-gradient-to-br from-[#ffebee] to-[#ffcdd2]">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-[#ff6b6b]" />
            </div>
            <p className="text-gray-700 font-medium">当月支出</p>
          </div>
          <p className="text-3xl font-bold text-[#c62828]">{monthlyStats.expense.toLocaleString()}</p>
          <p className="text-sm text-gray-600 mt-1">元</p>
        </div>
        <div className="hand-drawn-card p-6 bg-gradient-to-br from-[#e3f2fd] to-[#bbdefb]">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
              <Wallet className="w-6 h-6 text-[#4dabf7]" />
            </div>
            <p className="text-gray-700 font-medium">当月结余</p>
          </div>
          <p className={`text-3xl font-bold ${monthlyStats.balance >= 0 ? 'text-[#1565c0]' : 'text-[#c62828]'}`}>
            {monthlyStats.balance.toLocaleString()}
          </p>
          <p className="text-sm text-gray-600 mt-1">元</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="hand-drawn-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-[#e8f5e9] flex items-center justify-center">
              <PieChart className="w-6 h-6 text-[#6bcb77]" />
            </div>
            <h3 className="font-bold text-lg text-[#2e7d32]">收入分布</h3>
          </div>
          {incomeStats.length > 0 ? (
            <Pie data={pieChartData(incomeStats)} options={pieOptions} />
          ) : (
            <div className="text-center py-8">
              <p className="text-4xl mb-2">📭</p>
              <p className="text-gray-400">暂无收入数据</p>
            </div>
          )}
        </div>
        <div className="hand-drawn-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-[#ffebee] flex items-center justify-center">
              <PieChart className="w-6 h-6 text-[#ff6b6b]" />
            </div>
            <h3 className="font-bold text-lg text-[#c62828]">支出分布</h3>
          </div>
          {expenseStats.length > 0 ? (
            <Pie data={pieChartData(expenseStats)} options={pieOptions} />
          ) : (
            <div className="text-center py-8">
              <p className="text-4xl mb-2">📭</p>
              <p className="text-gray-400">暂无支出数据</p>
            </div>
          )}
        </div>
      </div>

      <div className="hand-drawn-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-[#e3f2fd] flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-[#4dabf7]" />
          </div>
          <h3 className="font-bold text-lg">近6个月收支趋势</h3>
        </div>
        {last6Months.length > 0 ? (
          <Bar data={barChartData} options={barOptions} />
        ) : (
          <div className="text-center py-8">
            <p className="text-4xl mb-2">📭</p>
            <p className="text-gray-400">暂无数据</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="hand-drawn-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-[#e8f5e9] flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-[#6bcb77]" />
            </div>
            <h3 className="font-bold text-lg text-[#2e7d32]">收入明细</h3>
          </div>
          <div className="space-y-3">
            {incomeStats.map((item) => (
              <div key={item.categoryId} className="flex items-center justify-between py-2 border-b-2 border-dashed border-[#ddd]">
                <div className="flex items-center gap-3">
                  <div
                    className="w-6 h-6 rounded-full shadow-[2px_2px_0_#4a3728]"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="font-bold text-gray-700">{item.categoryName}</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-[#6bcb77]">{item.amount.toLocaleString()}</span>
                  <span className="text-gray-400 text-sm ml-2">({item.percentage}%)</span>
                </div>
              </div>
            ))}
            {incomeStats.length === 0 && (
              <div className="text-center py-4">
                <p className="text-gray-400">暂无数据</p>
              </div>
            )}
          </div>
        </div>
        <div className="hand-drawn-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-[#ffebee] flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-[#ff6b6b]" />
            </div>
            <h3 className="font-bold text-lg text-[#c62828]">支出明细</h3>
          </div>
          <div className="space-y-3">
            {expenseStats.map((item) => (
              <div key={item.categoryId} className="flex items-center justify-between py-2 border-b-2 border-dashed border-[#ddd]">
                <div className="flex items-center gap-3">
                  <div
                    className="w-6 h-6 rounded-full shadow-[2px_2px_0_#4a3728]"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="font-bold text-gray-700">{item.categoryName}</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-[#ff6b6b]">{item.amount.toLocaleString()}</span>
                  <span className="text-gray-400 text-sm ml-2">({item.percentage}%)</span>
                </div>
              </div>
            ))}
            {expenseStats.length === 0 && (
              <div className="text-center py-4">
                <p className="text-gray-400">暂无数据</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
