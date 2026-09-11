import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Menu, Bell, MessageSquare, Search } from 'lucide-react';
import SearchBar from '../common/SearchBar';
import ProfileMenu from './ProfileMenu';
import { toggleNotificationPanel } from '../../features/notifications/notificationSlice';

const Header = ({ title = 'Dashboard', subtitle = 'Welcome to FinTrack Edu Platform', onToggleSidebar }) => {
  const dispatch = useDispatch();
  const { notifications } = useSelector((state) => state.notifications);
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between transition-all">
      {/* LEFT SECTION */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 focus:outline-none"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">{title}</h1>
          {subtitle && (
            <p className="text-xs text-slate-500 hidden sm:block font-normal">{subtitle}</p>
          )}
        </div>
      </div>

      {/* RIGHT SECTION */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Global Search Bar */}
        <div className="hidden md:block">
          <SearchBar placeholder="Search platform resources..." />
        </div>

        {/* Notifications Icon */}
        <div className="relative">
          <button
            onClick={() => dispatch(toggleNotificationPanel())}
            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-brand-600 transition-colors relative cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-brand-600 ring-2 ring-white" />
            )}
          </button>
        </div>

        {/* User Profile Menu */}
        <div className="pl-2 border-l border-slate-200">
          <ProfileMenu />
        </div>
      </div>
    </header>
  );
};

export default Header;
