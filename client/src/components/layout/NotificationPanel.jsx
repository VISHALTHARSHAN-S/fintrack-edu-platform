import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { closeNotificationPanel, markAllAsRead, markNotificationAsRead } from '../../features/notifications/notificationSlice';
import { Bell, X, CheckCheck, Info, CheckCircle2, AlertTriangle } from 'lucide-react';

const NotificationPanel = () => {
  const dispatch = useDispatch();
  const { notifications, isOpen } = useSelector((state) => state.notifications);

  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />;
      default:
        return <Info className="w-4 h-4 text-brand-800 shrink-0" />;
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-xs"
        onClick={() => dispatch(closeNotificationPanel())}
      />
      <div className="fixed right-4 top-16 z-50 w-80 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl animate-in fade-in slide-in-from-top-2 duration-150 sm:w-96 lg:right-8">
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-4">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-brand-800" />
            <h3 className="font-semibold text-slate-900 text-sm">Notifications</h3>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-brand-100 text-brand-700">
                {unreadCount} new
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={() => dispatch(markAllAsRead())}
                className="flex items-center gap-1 text-xs font-medium text-brand-800 hover:text-brand-950"
              >
                <CheckCheck className="w-3.5 h-3.5" /> Mark all read
              </button>
            )}
            <button
              onClick={() => dispatch(closeNotificationPanel())}
              className="rounded-lg p-1 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="max-h-96 divide-y divide-slate-100 overflow-y-auto no-scrollbar">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">No notifications yet</div>
          ) : (
            notifications.map((item) => (
              <div
                key={item.id}
                onClick={() => dispatch(markNotificationAsRead(item.id))}
                className={`flex cursor-pointer gap-3 p-4 transition-colors hover:bg-slate-50 ${
                  !item.isRead ? 'bg-brand-50/30' : ''
                }`}
              >
                <div className="mt-0.5">{getIcon(item.type)}</div>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-slate-900 leading-snug">{item.title}</p>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{item.message}</p>
                  <span className="text-[10px] text-slate-400 mt-2 block">{item.time}</span>
                </div>
                {!item.isRead && (
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#C9897F]" />
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default NotificationPanel;
