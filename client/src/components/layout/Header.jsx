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
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/95 px-4 py-3.5 transition-colors sm:px-6 lg:px-8">
      {/* LEFT SECTION */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 focus:outline-none"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-slate-900 sm:text-xl">{title}</h1>
          {subtitle && (
            <p className="hidden text-xs font-normal text-slate-600 sm:block">{subtitle}</p>
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
            className="relative cursor-pointer rounded-xl p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-brand-800 focus-visible:outline-none"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-[#C9897F] ring-2 ring-white" />
            )}
          </button>
        </div>

        {/* User Profile Menu */}
        <div className="border-l border-slate-200 pl-2">
          <ProfileMenu />
        </div>
      </div>
    </header>
  );
};

export default Header;
