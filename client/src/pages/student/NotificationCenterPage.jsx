import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Bell, CheckCheck, Info, ShieldCheck, SlidersHorizontal } from 'lucide-react';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import {
  loadNotifications,
  markNotificationsRead,
  markOneNotificationRead,
} from '../../features/notifications/notificationSlice';
import {
  fetchNotificationPreferences,
  updateNotificationPreferences,
} from '../../services/notificationService';

const categories = [
  ['career', 'Career and job updates'],
  ['assessment', 'Assessment results'],
  ['certificate', 'Certificates'],
  ['course', 'Course progress'],
  ['mentor', 'Mentor updates'],
  ['general', 'General updates'],
];

const NotificationCenterPage = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const notificationCenterPath = location.pathname.startsWith('/mentor')
    ? '/mentor/notifications'
    : location.pathname.startsWith('/recruiter')
      ? '/recruiter/notifications'
      : '/student/notifications';
  const { notifications, isLoading, error } = useSelector((state) => state.notifications);
  const [filter, setFilter] = useState('all');
  const [preferences, setPreferences] = useState(null);
  const [preferencesError, setPreferencesError] = useState('');
  const [preferencesLoading, setPreferencesLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preferenceMessage, setPreferenceMessage] = useState('');
  const [actionError, setActionError] = useState('');
  const visible = useMemo(
    () => filter === 'unread' ? notifications.filter((item) => !item.isRead) : notifications,
    [filter, notifications]
  );
  const unreadCount = notifications.filter((item) => !item.isRead).length;

  useEffect(() => {
    dispatch(loadNotifications());
    let active = true;
    fetchNotificationPreferences()
      .then((result) => { if (active) setPreferences(result); })
      .catch((err) => { if (active) setPreferencesError(err.message); })
      .finally(() => { if (active) setPreferencesLoading(false); });
    return () => { active = false; };
  }, [dispatch]);

  const markAllRead = async () => {
    setActionError('');
    const result = await dispatch(markNotificationsRead());
    if (markNotificationsRead.rejected.match(result)) setActionError(result.payload || 'Unable to mark notifications as read.');
  };
  const savePreferences = async () => {
    setSaving(true); setPreferencesError(''); setPreferenceMessage('');
    try {
      setPreferences(await updateNotificationPreferences(preferences));
      setPreferenceMessage('Notification preferences saved.');
    } catch (err) {
      setPreferencesError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-10">
      <section className="rounded-3xl bg-gradient-to-br from-navy-950 via-slate-900 to-indigo-950 p-6 text-white shadow-xl sm:p-8">
        <div className="flex items-start gap-4">
          <div className="rounded-2xl bg-brand-500/15 p-3 text-brand-300"><Bell className="h-6 w-6" /></div>
          <div><h2 className="text-2xl font-extrabold">Notification center</h2><p className="mt-1 text-sm text-slate-300">Updates generated from your FinTrack Edu activity.</p><p className="mt-3 text-xs text-slate-300">{unreadCount} unread notification{unreadCount === 1 ? '' : 's'}</p></div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm sm:p-7">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div><h3 className="font-bold text-slate-900">Your notifications</h3><p className="mt-1 text-sm text-slate-500">Read status is saved to your account.</p></div>
          {unreadCount > 0 && <Button variant="secondary" size="sm" icon={CheckCheck} onClick={markAllRead}>Mark all as read</Button>}
        </div>
        <div className="mt-4 flex gap-2 border-b border-slate-100">
          {['all', 'unread'].map((value) => (
            <button key={value} type="button" onClick={() => setFilter(value)} className={`border-b-2 px-3 py-2 text-sm font-semibold capitalize ${filter === value ? 'border-brand-600 text-brand-800' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
              {value}{value === 'unread' ? ` (${unreadCount})` : ''}
            </button>
          ))}
        </div>
        {actionError && <p role="alert" className="mt-3 text-sm text-red-700">{actionError}</p>}
        {isLoading ? (
          <p className="py-10 text-center text-sm text-slate-500">Loading notifications...</p>
        ) : error ? (
          <div className="py-10 text-center"><p role="alert" className="text-sm text-red-700">{error}</p><Button variant="secondary" size="sm" className="mt-3" onClick={() => dispatch(loadNotifications())}>Try again</Button></div>
        ) : visible.length === 0 ? (
          <div className="py-12 text-center"><Info className="mx-auto h-8 w-8 text-slate-300" /><p className="mt-3 text-sm font-semibold text-slate-700">{filter === 'unread' ? 'You are all caught up' : 'No notifications yet'}</p><p className="mt-1 text-xs text-slate-500">New account activity will appear here.</p></div>
        ) : (
          <div className="divide-y divide-slate-100">
            {visible.map((item) => (
              <Link
                key={item.id}
                to={item.link || notificationCenterPath}
                onClick={() => {
                  if (!item.isRead) dispatch(markOneNotificationRead(item.id));
                }}
                className={`flex gap-3 py-4 transition-colors hover:bg-slate-50 ${!item.isRead ? 'bg-brand-50/30' : ''}`}
              >
                <div className={`mt-0.5 rounded-xl p-2 ${item.type === 'success' ? 'bg-emerald-50 text-emerald-700' : item.type === 'warning' ? 'bg-amber-50 text-amber-700' : 'bg-brand-50 text-brand-700'}`}><Info className="h-4 w-4" /></div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2"><p className="text-sm font-bold text-slate-900">{item.title}</p>{!item.isRead && <Badge variant="brand">New</Badge>}</div>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{item.message}</p>
                  <p className="mt-1 text-xs text-slate-400">{new Date(item.createdAt).toLocaleString()}</p>
                </div>
                <span className="sr-only">{item.category}</span>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm sm:p-7">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-slate-100 p-2 text-slate-600"><SlidersHorizontal className="h-5 w-5" /></div>
          <div><h3 className="font-bold text-slate-900">Notification preferences</h3><p className="mt-1 text-sm text-slate-500">Choose which event categories can create in-app notifications.</p></div>
        </div>
        {preferencesLoading ? <p className="mt-4 text-sm text-slate-500">Loading preferences...</p> : preferencesError && !preferences ? (
          <p role="alert" className="mt-4 text-sm text-red-700">{preferencesError}</p>
        ) : preferences && (
          <>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map(([key, label]) => (
                <label key={key} className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 p-3 text-sm text-slate-700">
                  {label}
                  <input type="checkbox" checked={Boolean(preferences[key])} onChange={(event) => {
                    setPreferences((current) => ({ ...current, [key]: event.target.checked }));
                    setPreferenceMessage('');
                  }} className="h-4 w-4 rounded border-slate-300 text-brand-700 focus:ring-brand-500" />
                </label>
              ))}
            </div>
            {preferencesError && <p role="alert" className="mt-3 text-sm text-red-700">{preferencesError}</p>}
            {preferenceMessage && <p role="status" className="mt-3 text-sm text-emerald-700">{preferenceMessage}</p>}
            <Button className="mt-4" icon={ShieldCheck} isLoading={saving} onClick={savePreferences}>Save preferences</Button>
          </>
        )}
      </section>
    </div>
  );
};

export default NotificationCenterPage;
