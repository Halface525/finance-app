import { useState, useEffect, useRef } from 'react';
import { Plus, Edit2, Trash2, Filter, ChevronLeft, ChevronRight, Upload, Download } from 'lucide-react';
import TransactionForm from '../components/TransactionForm';
import type { Transaction, Category } from '../types';
import { getTransactions, deleteTransaction, exportTransactionsCSV, importTransactionsCSV } from '../api/transactions';
import { getCategories } from '../api/categories';

export default function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState<Transaction | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadTransactions();
  }, [page, typeFilter]);

  useEffect(() => {
    getCategories().then(setCategories);
  }, []);

  const loadTransactions = async () => {
    const type = typeFilter === 'all' ? undefined : typeFilter;
    const data = await getTransactions(page, 10, type);
    setTransactions(data.transactions);
    setTotalPages(data.totalPages);
  };

  const handleEdit = (transaction: Transaction) => {
    setEditData(transaction);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('确定删除这条记录吗？')) {
      await deleteTransaction(id);
      loadTransactions();
    }
  };

  const getCategoryName = (categoryId: string) => {
    return categories.find((cat) => cat.id === categoryId)?.name || '未知';
  };

  const getCategoryColor = (categoryId: string) => {
    return categories.find((cat) => cat.id === categoryId)?.color || '#6b7280';
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
  };

  const handleExportCSV = async () => {
    try {
      const blob = await exportTransactionsCSV();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      alert('导出失败');
    }
  };

  const handleImportCSV = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const content = e.target?.result as string;
      try {
        const result = await importTransactionsCSV(content);
        alert(`导入完成：成功 ${result.success} 条，失败 ${result.failed} 条`);
        if (result.errors.length > 0) {
          console.log('导入错误:', result.errors);
        }
        loadTransactions();
      } catch (error) {
        alert('导入失败');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold" style={{ color: '#4a3728' }}>收支记录</h2>
          <p className="text-gray-600 mt-1">📊 管理你的每一笔收支</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleExportCSV}
            className="hand-drawn-btn hand-drawn-btn-success flex items-center gap-2 text-sm sm:text-lg px-3 sm:px-4 py-2"
          >
            <Download className="w-5 h-5" />
            <span className="hidden sm:inline">导出CSV</span>
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="hand-drawn-btn hand-drawn-btn-purple flex items-center gap-2 text-sm sm:text-lg px-3 sm:px-4 py-2"
          >
            <Upload className="w-5 h-5" />
            <span className="hidden sm:inline">导入CSV</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportCSV}
            accept=".csv"
            className="hidden"
          />
          <button
            onClick={() => { setEditData(null); setShowForm(true); }}
            className="hand-drawn-btn hand-drawn-btn-blue flex items-center gap-2 text-sm sm:text-lg px-3 sm:px-4 py-2"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">添加记录</span>
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3 p-4 bg-white rounded-xl border-3 border-[#4a3728] shadow-[3px_3px_0_#4a3728] filter-bar">
        <Filter className="w-6 h-6 text-[#4a3728]" />
        <span className="font-bold text-gray-700">筛选：</span>
        {['all', 'income', 'expense'].map((type) => (
          <button
            key={type}
            onClick={() => { setTypeFilter(type); setPage(1); }}
            className={`px-4 py-2 rounded-lg font-bold transition-all ${
              typeFilter === type
                ? 'bg-gradient-to-br from-[#4dabf7] to-[#339af0] text-white border-3 border-[#1565c0] shadow-[2px_2px_0_#1565c0]'
                : 'bg-[#f5f5f5] text-gray-600 border-3 border-[#ddd] hover:border-[#4dabf7]'
            }`}
          >
            {type === 'all' ? '全部' : type === 'income' ? '💰 收入' : '💸 支出'}
          </button>
        ))}
      </div>

      <div className="hand-drawn-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
          <thead>
            <tr className="bg-gradient-to-r from-[#f0e6d2] to-[#e6d5b8]">
              <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 table-header-text">📅 日期</th>
              <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 table-header-text">🏷️ 分类</th>
              <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 table-header-text">📝 备注</th>
              <th className="px-6 py-4 text-right text-sm font-bold text-gray-700 table-header-text">💰 金额</th>
              <th className="px-6 py-4 text-center text-sm font-bold text-gray-700 table-header-text">⚙️ 操作</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => (
              <tr key={transaction.id} className="border-b-2 border-dashed border-[#ddd] hover:bg-[#fafafa] transition-colors">
                <td className="px-6 py-4 font-medium">{formatDate(transaction.date)}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: getCategoryColor(transaction.categoryId) }}
                    />
                    {getCategoryName(transaction.categoryId)}
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-600">{transaction.description || '-'}</td>
                <td className={`px-6 py-4 text-right font-bold text-lg ${
                  transaction.type === 'income' ? 'text-[#6bcb77]' : 'text-[#ff6b6b]'
                }`}>
                  {transaction.type === 'income' ? '+' : '-'}{transaction.amount.toLocaleString()}
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => handleEdit(transaction)}
                      className="w-10 h-10 flex items-center justify-center rounded-full bg-[#e3f2fd] hover:bg-[#bbdefb] transition-colors hand-drawn-wiggle"
                      title="编辑"
                    >
                      <Edit2 className="w-5 h-5 text-[#4dabf7]" />
                    </button>
                    <button
                      onClick={() => handleDelete(transaction.id)}
                      className="w-10 h-10 flex items-center justify-center rounded-full bg-[#ffebee] hover:bg-[#ffcdd2] transition-colors hand-drawn-wiggle"
                      title="删除"
                    >
                      <Trash2 className="w-5 h-5 text-[#ff6b6b]" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {transactions.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center">
                  <p className="text-4xl mb-2">📭</p>
                  <p className="text-gray-400">暂无记录，快添加一条吧！</p>
                </td>
              </tr>
            )}
          </tbody>
          </table>
        </div>

        <div className="flex justify-between items-center px-6 py-4 bg-[#fafafa] border-t-3 border-[#ddd]">
          <p className="text-sm text-gray-600 font-medium">
            显示第 {page} 页，共 {totalPages} 页
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="w-10 h-10 flex items-center justify-center rounded-lg border-3 border-[#4a3728] hover:bg-[#f0e6d2] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="px-4 py-2 bg-[#4dabf7] text-white font-bold rounded-lg shadow-[2px_2px_0_#1565c0]">
              {page}
            </span>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="w-10 h-10 flex items-center justify-center rounded-lg border-3 border-[#4a3728] hover:bg-[#f0e6d2] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {showForm && (
        <TransactionForm
          categories={categories}
          onClose={() => setShowForm(false)}
          onSubmit={loadTransactions}
          editData={editData}
        />
      )}
    </div>
  );
}
