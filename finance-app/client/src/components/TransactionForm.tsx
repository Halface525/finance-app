import { useState } from 'react';
import { X } from 'lucide-react';
import type { Transaction, Category } from '../types';
import { createTransaction, updateTransaction } from '../api/transactions';

interface TransactionFormProps {
  categories: Category[];
  onClose: () => void;
  onSubmit: () => void;
  editData?: Transaction | null;
}

export default function TransactionForm({ categories, onClose, onSubmit, editData }: TransactionFormProps) {
  const [type, setType] = useState<'income' | 'expense'>(editData?.type || 'expense');
  const [amount, setAmount] = useState(editData?.amount.toString() || '');
  const [description, setDescription] = useState(editData?.description || '');
  const [categoryId, setCategoryId] = useState(editData?.categoryId || '');
  const [date, setDate] = useState(editData?.date || new Date().toISOString().split('T')[0]);

  const filteredCategories = categories.filter((cat) => cat.type === type);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !categoryId) return;

    const data = {
      amount: parseFloat(amount),
      description,
      categoryId,
      type,
      date,
    };

    if (editData) {
      await updateTransaction(editData.id, data);
    } else {
      await createTransaction(data);
    }
    onSubmit();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white hand-drawn-card w-full max-w-md">
        <div className="flex justify-between items-center p-6 border-b-3 border-[#4a3728]">
          <h2 className="text-xl font-bold" style={{ color: '#4a3728' }}>{editData ? '编辑记录' : '添加记录'}</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-[#ffebee] hover:bg-[#ffcdd2] transition-colors hand-drawn-wiggle"
          >
            <X className="w-6 h-6 text-[#ff6b6b]" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 pencil-highlight">类型</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => { setType('income'); setCategoryId(''); }}
                className={`flex-1 py-3 rounded-lg font-bold transition-all ${
                  type === 'income'
                    ? 'bg-gradient-to-br from-[#6bcb77] to-[#5ab062] text-white border-3 border-[#2e7d32] shadow-[3px_3px_0_#2e7d32]'
                    : 'bg-[#f5f5f5] text-gray-600 border-3 border-[#ddd] hover:border-[#6bcb77]'
                }`}
              >
                💰 收入
              </button>
              <button
                type="button"
                onClick={() => { setType('expense'); setCategoryId(''); }}
                className={`flex-1 py-3 rounded-lg font-bold transition-all ${
                  type === 'expense'
                    ? 'bg-gradient-to-br from-[#ff6b6b] to-[#ee5a5a] text-white border-3 border-[#c62828] shadow-[3px_3px_0_#c62828]'
                    : 'bg-[#f5f5f5] text-gray-600 border-3 border-[#ddd] hover:border-[#ff6b6b]'
                }`}
              >
                💸 支出
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 pencil-highlight">金额</label>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full hand-drawn-input text-lg"
              placeholder="请输入金额"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 pencil-highlight">分类</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full hand-drawn-select text-lg"
            >
              <option value="">请选择分类</option>
              {filteredCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  <span style={{ backgroundColor: cat.color, width: '12px', height: '12px', display: 'inline-block', borderRadius: '50%' }} />
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 pencil-highlight">日期</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full hand-drawn-input text-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 pencil-highlight">备注</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full hand-drawn-input text-lg"
              placeholder="添加备注（可选）"
            />
          </div>
          <button
            type="submit"
            className="w-full hand-drawn-btn hand-drawn-btn-primary text-lg py-4"
          >
            {editData ? '💾 保存修改' : '✨ 添加记录'}
          </button>
        </form>
      </div>
    </div>
  );
}
