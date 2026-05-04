import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Wallet, ShoppingCart } from 'lucide-react';
import type { Category } from '../types';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../api/categories';

const COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6',
  '#3b82f6', '#8b5cf6', '#ec4899', '#6b7280', '#0ea5e9'
];

interface CategoryFormProps {
  onClose: () => void;
  onSubmit: () => void;
  editData?: Category | null;
}

function CategoryForm({ onClose, onSubmit, editData }: CategoryFormProps) {
  const [type, setType] = useState<'income' | 'expense'>(editData?.type || 'expense');
  const [name, setName] = useState(editData?.name || '');
  const [color, setColor] = useState(editData?.color || COLORS[0]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    const data = { name, type, color };

    if (editData) {
      await updateCategory(editData.id, data);
    } else {
      await createCategory(data);
    }
    onSubmit();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white hand-drawn-card w-full max-w-md">
        <div className="flex justify-between items-center p-6 border-b-3 border-[#4a3728]">
          <h2 className="text-xl font-bold" style={{ color: '#4a3728' }}>{editData ? '编辑分类' : '添加分类'}</h2>
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
                onClick={() => setType('income')}
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
                onClick={() => setType('expense')}
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
            <label className="block text-sm font-bold text-gray-700 mb-2 pencil-highlight">名称</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full hand-drawn-input text-lg"
              placeholder="请输入分类名称"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 pencil-highlight">颜色</label>
            <div className="flex gap-3 flex-wrap">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-10 h-10 rounded-full transition-all ${
                    color === c ? 'scale-130 ring-4 ring-offset-2 ring-gray-400 shadow-[3px_3px_0_#4a3728]' : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          <button
            type="submit"
            className="w-full hand-drawn-btn hand-drawn-btn-primary text-lg py-4"
          >
            {editData ? '💾 保存修改' : '✨ 添加分类'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState<Category | null>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    const data = await getCategories();
    setCategories(data);
  };

  const handleEdit = (category: Category) => {
    setEditData(category);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('确定删除这个分类吗？')) {
      await deleteCategory(id);
      loadCategories();
    }
  };

  const incomeCategories = categories.filter((cat) => cat.type === 'income');
  const expenseCategories = categories.filter((cat) => cat.type === 'expense');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold" style={{ color: '#4a3728' }}>分类管理</h2>
          <p className="text-gray-600 mt-1">🏷️ 管理你的收支分类</p>
        </div>
        <button
          onClick={() => { setEditData(null); setShowForm(true); }}
          className="hand-drawn-btn hand-drawn-btn-primary flex items-center gap-2 text-lg"
        >
          <Plus className="w-6 h-6" />
          添加分类
        </button>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="hand-drawn-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-[#e8f5e9] flex items-center justify-center">
              <Wallet className="w-6 h-6 text-[#6bcb77]" />
            </div>
            <h3 className="font-bold text-lg text-[#2e7d32]">收入分类</h3>
          </div>
          <div className="space-y-3">
            {incomeCategories.map((category) => (
              <div key={category.id} className="flex items-center justify-between py-3 border-b-2 border-dashed border-[#ddd] hover:bg-[#fafafa] px-3 rounded-lg transition-all">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full shadow-[2px_2px_0_#4a3728]"
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="font-bold text-gray-700">{category.name}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(category)}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-[#e3f2fd] hover:bg-[#bbdefb] transition-colors hand-drawn-wiggle"
                    title="编辑"
                  >
                    <Edit2 className="w-4 h-4 text-[#4dabf7]" />
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-[#ffebee] hover:bg-[#ffcdd2] transition-colors hand-drawn-wiggle"
                    title="删除"
                  >
                    <Trash2 className="w-4 h-4 text-[#ff6b6b]" />
                  </button>
                </div>
              </div>
            ))}
            {incomeCategories.length === 0 && (
              <div className="text-center py-8">
                <p className="text-4xl mb-2">📭</p>
                <p className="text-gray-400">暂无收入分类</p>
              </div>
            )}
          </div>
        </div>

        <div className="hand-drawn-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-[#ffebee] flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-[#ff6b6b]" />
            </div>
            <h3 className="font-bold text-lg text-[#c62828]">支出分类</h3>
          </div>
          <div className="space-y-3">
            {expenseCategories.map((category) => (
              <div key={category.id} className="flex items-center justify-between py-3 border-b-2 border-dashed border-[#ddd] hover:bg-[#fafafa] px-3 rounded-lg transition-all">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full shadow-[2px_2px_0_#4a3728]"
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="font-bold text-gray-700">{category.name}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(category)}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-[#e3f2fd] hover:bg-[#bbdefb] transition-colors hand-drawn-wiggle"
                    title="编辑"
                  >
                    <Edit2 className="w-4 h-4 text-[#4dabf7]" />
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-[#ffebee] hover:bg-[#ffcdd2] transition-colors hand-drawn-wiggle"
                    title="删除"
                  >
                    <Trash2 className="w-4 h-4 text-[#ff6b6b]" />
                  </button>
                </div>
              </div>
            ))}
            {expenseCategories.length === 0 && (
              <div className="text-center py-8">
                <p className="text-4xl mb-2">📭</p>
                <p className="text-gray-400">暂无支出分类</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showForm && (
        <CategoryForm
          onClose={() => { setShowForm(false); setEditData(null); }}
          onSubmit={loadCategories}
          editData={editData}
        />
      )}
    </div>
  );
}
