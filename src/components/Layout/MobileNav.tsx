import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  FlaskConical,
  BookOpen,
  Film,
  HeartPulse,
} from 'lucide-react';

const navItems = [
  { path: '/', icon: Home, label: '首页' },
  { path: '/research', icon: FlaskConical, label: '科研' },
  { path: '/reading', icon: BookOpen, label: '读书' },
  { path: '/media', icon: Film, label: '影音' },
  { path: '/health', icon: HeartPulse, label: '健康' },
];

export default function MobileNav() {
  const location = useLocation();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 glass-card border-t border-dream-blue-100/50 z-50 safe-area-bottom">
      <div className="flex justify-around items-center py-2 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-300 min-w-[60px] ${
                isActive
                  ? 'text-dream-blue-600'
                  : 'text-dream-blue-400'
              }`}
            >
              <div className={`p-2 rounded-xl transition-all duration-300 ${
                isActive ? 'gradient-bg shadow-soft' : ''
              }`}>
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : ''}`} />
              </div>
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
