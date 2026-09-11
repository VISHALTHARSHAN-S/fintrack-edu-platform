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
        return <Info className="w-4 h-4 text-blue-500 shrink-0" />;
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-xs"
        onClick={() => dispatch(closeNotificationPanel())}
      />
      <div className="fixed top-16 right-4 lg:right-8 z-50 w-80 sm:w-96 rounded-2xl bg-white shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-brand-600" />
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
                className="text-xs text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1"
              >
                <CheckCheck className="w-3.5 h-3.5" /> Mark all read
              </button>
            )}
            <button
              onClick={() => dispatch(closeNotificationPanel())}
              className="p-1 rounded-lg text-slate-400 hover:bg-slate-200/60 text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto divide-y divide-slate-100 no-scrollbar">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">No notifications yet</div>
          ) : (
            notifications.map((item) => (
              <div
                key={item.id}
                onClick={() => dispatch(markNotificationAsRead(item.id))}
                className={`p-4 flex gap-3 hover:bg-slate-50 transition-colors cursor-pointer ${
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
                  <span className="w-2 h-2 rounded-full bg-brand-600 mt-1 shrink-0" />
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
