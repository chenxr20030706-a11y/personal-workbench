import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  FlaskConical,
  BookOpen,
  Film,
  Briefcase,
  Languages,
  HeartPulse,
  Settings,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
} from 'lucide-react';
import { useSettingsStore } from '../../store/useSettingsStore';

const navItems = [
  { path: '/', icon: Home, label: '首页' },
  { path: '/research', icon: FlaskConical, label: '科研' },
  { path: '/reading', icon: BookOpen, label: '读书' },
  { path: '/media', icon: Film, label: '影音' },
  { path: '/career', icon: Briefcase, label: '求职' },
  { path: '/ielts', icon: Languages, label: '雅思' },
  { path: '/health', icon: HeartPulse, label: '身体管理' },
];

export default function SidebarNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { workspaceName, sidebarCollapsed, toggleSidebar } = useSettingsStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNavClick = (path: string) => {
    setIsMobileMenuOpen(false);
    navigate(path);
  };

  return (
    <>
      <button
        onClick={() => setIsMobileMenuOpen(true)}
        className="fixed top-4 left-4 z-50 lg:hidden w-10 h-10 rounded-xl glass-card flex items-center justify-center text-dream-blue-500 shadow-soft"
      >
        <Menu className="w-5 h-5" />
      </button>

      <aside
        className={`fixed left-0 top-0 h-screen glass-card border-r border-dream-blue-100/60 z-50 transition-all duration-300 ease-in-out ${
          sidebarCollapsed ? 'w-20' : 'w-64'
        } ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <button
          onClick={() => setIsMobileMenuOpen(false)}
          className="absolute top-4 right-4 lg:hidden p-2 rounded-lg hover:bg-dream-blue-100 text-dream-blue-500 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className={`p-6 ${sidebarCollapsed ? 'px-3' : ''}`}>
          <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className={`flex items-center gap-3 mb-8 ${sidebarCollapsed ? 'justify-center' : ''}`}>
            <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center shadow-glow-soft flex-shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            {!sidebarCollapsed && (
              <div className="overflow-hidden">
                <h1 className="font-display text-xl font-bold gradient-text whitespace-nowrap">{workspaceName}</h1>
                <p className="text-xs text-dream-blue-400 whitespace-nowrap">Personal Dashboard</p>
              </div>
            )}
          </Link>

          <nav className="space-y-1">
            {navItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => handleNavClick(item.path)}
                  title={sidebarCollapsed ? item.label : undefined}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 animate-fade-in-up stagger-${index + 1} ${
                    sidebarCollapsed ? 'justify-center px-2' : ''
                  } ${
                    isActive
                      ? 'gradient-bg text-white shadow-soft-lg'
                      : 'text-dream-slate-600 hover:bg-dream-blue-50/80 hover:text-dream-blue-600'
                  } w-full`}
                >
                  <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'icon-glow' : ''}`} />
                  {!sidebarCollapsed && (
                    <span className="font-medium text-sm whitespace-nowrap">{item.label}</span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className={`absolute bottom-0 left-0 right-0 p-4 border-t border-dream-blue-100/60 ${sidebarCollapsed ? 'px-2' : ''}`}>
          <button
            onClick={() => handleNavClick('/settings')}
            title={sidebarCollapsed ? '设置' : undefined}
            className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all duration-300 ${
              sidebarCollapsed ? 'justify-center px-2' : ''
            } ${
              location.pathname === '/settings'
                ? 'gradient-bg text-white shadow-soft-lg'
                : 'text-dream-slate-500 hover:bg-dream-blue-50/80 hover:text-dream-blue-600'
            }`}
          >
            <Settings className="w-5 h-5 flex-shrink-0" />
            {!sidebarCollapsed && (
              <span className="font-medium text-sm whitespace-nowrap">设置</span>
            )}
          </button>
        </div>

        <button
          onClick={toggleSidebar}
          className="hidden lg:block absolute -right-3 top-20 w-6 h-6 rounded-full bg-white shadow-dream flex items-center justify-center text-dream-blue-500 hover:text-dream-blue-600 hover:scale-110 transition-all duration-300 z-50"
        >
          {sidebarCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </aside>

      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
}
