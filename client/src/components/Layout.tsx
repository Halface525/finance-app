import { LayoutDashboard, Receipt, Tag, BarChart3, Menu, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const menuItems = [
  { id: 'dashboard', label: '仪表盘', icon: LayoutDashboard },
  { id: 'transactions', label: '收支记录', icon: Receipt },
  { id: 'categories', label: '分类管理', icon: Tag },
  { id: 'reports', label: '统计报表', icon: BarChart3 },
];

export default function Layout({ children, activeTab, onTabChange }: LayoutProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex h-screen">
      {/* === 大屏侧边栏 (PC端) === */}
      <aside className="hidden lg:flex w-64 bg-white border-r-3 border-[#4a3728] flex-col sidebar-container">
        {/* Logo区域 */}
        <div className="p-6 border-b-3 border-[#4a3728]">
          <h1 className="text-2xl font-bold flex items-center gap-3" style={{ color: '#4a3728' }}>
            <Menu className="w-8 h-8" style={{ color: '#ff6b6b' }} />
            半面记账
          </h1>
          <p className="text-sm text-gray-600 mt-2">我的小账本</p>
        </div>
        
        {/* 导航菜单 */}
        <nav className="flex-1 px-4 py-4">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const colors = ['#ff6b6b', '#ffd93d', '#6bcb77', '#4dabf7'];
            const bgColors = ['bg-[#ffe5e5]', 'bg-[#fff9e6]', 'bg-[#e8f5e9]', 'bg-[#e3f2fd]'];
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-3 transition-all ${
                  isActive
                    ? `${bgColors[index]} font-bold`
                    : 'text-gray-600 hover:bg-[#f5f5dc]'
                }`}
                style={{
                  color: isActive ? colors[index] : undefined,
                  border: isActive ? `3px solid ${colors[index]}` : 'none',
                  boxShadow: isActive ? `2px 2px 0 ${colors[index]}` : 'none',
                }}
              >
                <Icon className="w-6 h-6" style={{ color: isActive ? colors[index] : undefined }} />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>
        
        {/* 底部区域 */}
        <div className="p-4 border-t-3 border-[#4a3728] mt-auto">
          <button
            onClick={toggleTheme}
            className="w-full p-3 rounded-lg mb-3"
            style={{
              background: theme === 'dark' ? '#e94560' : '#ffd93d',
              color: theme === 'dark' ? 'white' : '#4a3728',
              border: '3px solid #4a3728',
              boxShadow: '3px 3px 0 #4a3728',
            }}
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 inline mr-2" /> : <Moon className="w-5 h-5 inline mr-2" />}
            {theme === 'dark' ? '亮色模式' : '暗色模式'}
          </button>
          <div className="p-3 bg-[#fff3e0] rounded-lg border-2 border-[#4a3728]">
            <p className="text-xs text-gray-600">✨ 记录美好生活</p>
          </div>
        </div>
      </aside>

      {/* === 移动端顶部栏 === */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 bg-white border-b-3 border-[#4a3728] mobile-topbar">
        <h1 className="text-xl font-bold" style={{ color: '#4a3728' }}>半面记账</h1>
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg border-2 border-[#4a3728]"
          style={{ backgroundColor: theme === 'dark' ? '#e94560' : '#ffd93d' }}
        >
          {theme === 'dark' ? <Sun className="w-5 h-5 text-white" /> : <Moon className="w-5 h-5" style={{ color: '#4a3728' }} />}
        </button>
      </div>

      {/* === 主内容区 === */}
      <main className="flex-1 overflow-auto lg:p-6 p-4 pt-20 lg:pt-6">
        {children}
      </main>

      {/* === 移动端底部导航栏 === */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t-3 border-[#4a3728] px-2 py-2 mobile-bottom-nav">
        <div className="flex justify-around items-center">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const colors = ['#ff6b6b', '#ffd93d', '#6bcb77', '#4dabf7'];
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all ${
                  isActive ? 'scale-105' : ''
                }`}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{
                    backgroundColor: isActive ? colors[index] : '#f5f5dc',
                    boxShadow: isActive ? `2px 2px 0 ${colors[index]}` : 'none',
                  }}
                >
                  <Icon className="w-6 h-6" style={{ color: isActive ? 'white' : '#4a3728' }} />
                </div>
                <span className="text-xs font-medium" style={{ color: isActive ? colors[index] : '#666' }}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
