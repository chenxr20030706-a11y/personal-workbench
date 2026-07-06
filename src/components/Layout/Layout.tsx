import { Outlet, useLocation } from 'react-router-dom';
import SidebarNav from './SidebarNav';
import TopBar from './TopBar';
import MobileNav from './MobileNav';
import { useSettingsStore } from '../../store/useSettingsStore';

export default function Layout() {
  const location = useLocation();
  const { sidebarCollapsed } = useSettingsStore();

  const getPageTitle = () => {
    const titles: Record<string, string> = {
      '/': '首页概览',
      '/research': '科研工作台',
      '/reading': '读书空间',
      '/media': '影音收藏',
      '/career': '求职追踪',
      '/ielts': '雅思学习',
      '/health': '身体管理',
      '/settings': '设置',
    };
    return titles[location.pathname] || '工作台';
  };

  return (
    <div className="min-h-screen">
      <SidebarNav />
      <div
        className={`transition-all duration-300 ease-in-out ${
          sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'
        }`}
      >
        <TopBar title={getPageTitle()} />
        <main className="p-3 sm:p-4 md:p-6 lg:p-8 pb-24 lg:pb-8">
          <div key={location.pathname} className="animate-fade-in-up">
            <Outlet />
          </div>
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
