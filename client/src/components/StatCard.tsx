interface StatCardProps {
  title: string;
  value: number;
  type: 'income' | 'expense' | 'balance';
}

export default function StatCard({ title, value, type }: StatCardProps) {
  const styleMap = {
    income: {
      bg: 'bg-gradient-to-br from-[#e8f5e9] to-[#c8e6c9]',
      border: '#6bcb77',
      text: 'text-[#2e7d32]',
      highlight: 'bg-[#6bcb77]',
    },
    expense: {
      bg: 'bg-gradient-to-br from-[#ffebee] to-[#ffcdd2]',
      border: '#ff6b6b',
      text: 'text-[#c62828]',
      highlight: 'bg-[#ff6b6b]',
    },
    balance: {
      bg: 'bg-gradient-to-br from-[#e3f2fd] to-[#bbdefb]',
      border: '#4dabf7',
      text: 'text-[#1565c0]',
      highlight: value >= 0 ? 'bg-[#4dabf7]' : 'bg-[#ff6b6b]',
    },
  };

  const style = styleMap[type];

  const formatValue = (val: number) => {
    return val.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div
      className={`${style.bg} p-6 rounded-xl hand-drawn-card`}
      style={{ borderColor: style.border }}
    >
      <div className="flex items-center gap-2 mb-3">
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: style.highlight }}
        />
        <p className="text-gray-700 font-medium">{title}</p>
      </div>
      <div className="flex items-baseline gap-2">
        <span className={`text-3xl font-bold ${style.text}`}>
          {type === 'expense' ? '-' : ''}{formatValue(value)}
        </span>
        <span className="text-sm text-gray-500">元</span>
      </div>
      <div className="mt-4 h-1 bg-white/50 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{ backgroundColor: style.highlight, width: '70%' }}
        />
      </div>
    </div>
  );
}
