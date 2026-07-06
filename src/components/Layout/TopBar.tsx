import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDate } from '../../utils/date';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useAuthStore } from '../../store/useAuthStore';
import { LogOut, User as UserIcon, Settings as SettingsIcon, ChevronDown } from 'lucide-react';

interface TopBarProps {
  title: string;
}

export default function TopBar({ title }: TopBarProps) {
  const today = new Date();
  const navigate = useNavigate();
  const { avatar, avatarImage } = useSettingsStore();
  const { currentUser, logout } = useAuthStore();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    if (confirm('确定要退出登录吗？')) {
      logout();
      navigate('/login');
    }
  };

  const displayName = currentUser?.nickname || '用户';
  const displayAvatar = currentUser?.avatar || avatar;
  const hasAvatarImage = !!avatarImage;

  return (
    <header className="sticky top-0 z-40 glass-card border-b border-dream-blue-100/60 animate-fade-in-down">
      <div className="px-4 md:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-display font-bold gradient-text">
            {title}
          </h1>
          <p className="text-sm text-dream-blue-400 mt-1 hidden sm:block">
            {formatDate(today)} · 欢迎回来，{displayName} ✨
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-dream-blue-50/80">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse-soft" />
            <span className="text-sm text-dream-blue-600">在线</span>
          </div>
          
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 p-1 pr-3 rounded-full hover:bg-dream-blue-50 transition-colors"
            >
              {hasAvatarImage ? (
                <div className="w-10 h-10 rounded-full overflow-hidden shadow-dream hover:shadow-soft-lg transition-all duration-300 hover:scale-105 ring-2 ring-dream-blue-200">
                  <img
                    src={avatarImage}
                    alt="头像"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full gradient-bg flex items-center justify-center text-white font-medium shadow-dream hover:shadow-soft-lg transition-all duration-300 hover:scale-105">
                  {displayAvatar}
                </div>
              )}
              <ChevronDown className={`w-4 h-4 text-dream-slate-500 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
            </button>

            {showDropdown && (
              <div className="absolute right-0 top-full mt-2 w-48 glass-card rounded-xl shadow-soft-lg overflow-hidden animate-scale-in origin-top-right">
                <div className="p-3 border-b border-dream-blue-100/60">
                  <p className="font-medium text-dream-slate-800 text-sm">{displayName}</p>
                  {currentUser?.email && (
                    <p className="text-xs text-dream-blue-400 mt-0.5 truncate">
                      {currentUser.email}
                    </p>
                  )}
                </div>
                <div className="p-1">
                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      navigate('/settings');
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-dream-slate-700 hover:bg-dream-blue-50 transition-colors"
                  >
                    <SettingsIcon className="w-4 h-4" />
                    设置
                  </button>
                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      navigate('/settings');
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-dream-slate-700 hover:bg-dream-blue-50 transition-colors"
                  >
                    <UserIcon className="w-4 h-4" />
                    个人资料
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    退出登录
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
