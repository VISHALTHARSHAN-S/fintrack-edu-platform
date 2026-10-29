import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Bell,
  Check,
  LogOut,
  Moon,
  Shield,
  Sun,
  UserRound,
} from 'lucide-react';
import Avatar from '../../components/common/Avatar';
import Button from '../../components/common/Button';
import { logout, updateUserProfile } from '../../features/auth/authSlice';
import {
  fetchNotificationPreferences,
  updateNotificationPreferences,
} from '../../services/notificationService';
import {
  fetchStudentSettingsProfile,
  fetchStudentTheme,
  saveStudentSettingsProfile,
  saveStudentTheme,
  updateStudentPassword,
} from '../../services/studentSettingsService';

const sections = [
  { id: 'profile', label: 'Profile', icon: UserRound },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'appearance', label: 'Appearance', icon: Sun },
  { id: 'account', label: 'Account', icon: LogOut },
];

const preferenceOptions = [
  { key: 'career', label: 'Job alerts', description: 'Updates about applications and career opportunities.' },
  { key: 'learningReminder', label: 'Learning reminders', description: 'Optional reminders to continue your learning.' },
  { key: 'support', label: 'Support updates', description: 'Confirmation and important updates about your support requests.' },
  { key: 'course', label: 'Course updates', description: 'Updates about your enrolled courses and learning content.' },
  { key: 'assessment', label: 'Assessment updates', description: 'Assessment availability and submission updates.' },
  { key: 'certificate', label: 'Certificate updates', description: 'Updates when certificates are earned or verified.' },
  { key: 'mentor', label: 'Mentor updates', description: 'Messages and updates about your mentor sessions.' },
  { key: 'general', label: 'Platform updates', description: 'Other non-essential FinTrack Edu announcements.' },
];

const getEditableProfile = (data) => ({
  name: data.user.name || '',
  phone: data.user.phone || '',
  avatar: data.user.avatar || '',
  bio: data.studentProfile.bio || '',
});

const applyTheme = (theme) => {
  document.documentElement.dataset.theme = theme;
};

const SettingsCard = ({ children, className = '' }) => (
  <section className={`rounded-3xl border border-slate-100 bg-white p-5 shadow-sm sm:p-7 ${className}`}>
    {children}
  </section>
);

const Field = ({ label, helper, ...props }) => (
  <label className="block">
    <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>
    <input
      {...props}
      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500"
    />
    {helper && <span className="mt-1 block text-xs text-slate-500">{helper}</span>}
  </label>
);

const Feedback = ({ message, type = 'success' }) => {
  if (!message) return null;
  return (
    <p
      className={`rounded-xl px-3.5 py-2.5 text-sm ${
        type === 'error' ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'
      }`}
      role={type === 'error' ? 'alert' : 'status'}
    >
      {message}
    </p>
  );
};

const StudentSettingsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const authUser = useSelector((state) => state.auth.user);
  const storageKey = `fintrack_theme_${authUser?.id || 'student'}`;
  const [activeSection, setActiveSection] = useState('profile');
  const [account, setAccount] = useState(null);
  const [profileDraft, setProfileDraft] = useState(null);
  const [savedProfile, setSavedProfile] = useState(null);
  const [preferences, setPreferences] = useState(null);
  const [savedPreferences, setSavedPreferences] = useState(null);
  const [theme, setTheme] = useState('light');
  const [savedTheme, setSavedTheme] = useState('light');
  const [password, setPassword] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState({ section: '', message: '', type: 'success' });

  const profileDirty = useMemo(
    () => Boolean(profileDraft && savedProfile && JSON.stringify(profileDraft) !== JSON.stringify(savedProfile)),
    [profileDraft, savedProfile]
  );
  const preferencesDirty = useMemo(
    () => Boolean(preferences && savedPreferences && JSON.stringify(preferences) !== JSON.stringify(savedPreferences)),
    [preferences, savedPreferences]
  );
  const passwordDirty = Object.values(password).some(Boolean);
  const themeDirty = theme !== savedTheme;
  const hasUnsavedChanges = profileDirty || preferencesDirty || passwordDirty || themeDirty;

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const [profileData, notificationData, themeData] = await Promise.all([
          fetchStudentSettingsProfile(),
          fetchNotificationPreferences(),
          fetchStudentTheme(),
        ]);
        if (!active) return;
        const editableProfile = getEditableProfile(profileData);
        setAccount({ ...profileData.user, ...profileData.studentProfile });
        setProfileDraft(editableProfile);
        setSavedProfile(editableProfile);
        setPreferences(notificationData);
        setSavedPreferences(notificationData);
        setTheme(themeData.theme);
        setSavedTheme(themeData.theme);
        localStorage.setItem(storageKey, themeData.theme);
        applyTheme(themeData.theme);
      } catch (loadError) {
        if (active) setError(loadError.message);
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [storageKey]);

  useEffect(() => {
    if (!hasUnsavedChanges) return undefined;
    const preventAccidentalExit = (event) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', preventAccidentalExit);
    return () => window.removeEventListener('beforeunload', preventAccidentalExit);
  }, [hasUnsavedChanges]);

  useEffect(() => {
    if (!hasUnsavedChanges) return undefined;
    const confirmInternalNavigation = (event) => {
      const anchor = event.target instanceof Element ? event.target.closest('a[href]') : null;
      if (!anchor || anchor.target === '_blank' || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const destination = new URL(anchor.href, window.location.href);
      if (
        destination.origin !== window.location.origin ||
        (destination.pathname === location.pathname &&
          destination.search === location.search &&
          destination.hash === location.hash)
      ) {
        return;
      }

      if (!window.confirm('You have unsaved changes. Leave this page and discard them?')) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    };
    document.addEventListener('click', confirmInternalNavigation, true);
    return () => document.removeEventListener('click', confirmInternalNavigation, true);
  }, [hasUnsavedChanges, location.hash, location.pathname, location.search]);

  useEffect(() => {
    if (themeDirty) applyTheme(theme);
  }, [theme, themeDirty]);

  const showFeedback = (section, message, type = 'success') => {
    setFeedback({ section, message, type });
  };

  const switchSection = (section) => {
    if (hasUnsavedChanges && !window.confirm('You have unsaved changes. Discard them and continue?')) return;
    if (hasUnsavedChanges) {
      setProfileDraft(savedProfile);
      setPreferences(savedPreferences);
      setPassword({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTheme(savedTheme);
    }
    setFeedback({ section: '', message: '', type: 'success' });
    setActiveSection(section);
  };

  const handleProfileChange = (event) => {
    const { name, value } = event.target;
    setProfileDraft((current) => ({ ...current, [name]: value }));
  };

  const saveProfile = async (event) => {
    event.preventDefault();
    setSaving(true);
    setFeedback({ section: '', message: '', type: 'success' });
    try {
      const result = await saveStudentSettingsProfile(profileDraft);
      const editableProfile = getEditableProfile(result);
      setAccount({ ...result.user, ...result.studentProfile });
      setProfileDraft(editableProfile);
      setSavedProfile(editableProfile);
      dispatch(updateUserProfile({
        name: result.user.name,
        phone: result.user.phone,
        avatar: result.user.avatar,
      }));
      showFeedback('profile', 'Your profile has been updated.');
    } catch (saveError) {
      showFeedback('profile', saveError.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const cancelProfile = () => {
    setProfileDraft(savedProfile);
    showFeedback('profile', '');
  };

  const savePassword = async (event) => {
    event.preventDefault();
    if (password.newPassword.length < 8) {
      showFeedback('security', 'New password must be at least 8 characters.', 'error');
      return;
    }
    if (password.newPassword !== password.confirmPassword) {
      showFeedback('security', 'New password and confirmation do not match.', 'error');
      return;
    }

    setSaving(true);
    setFeedback({ section: '', message: '', type: 'success' });
    try {
      await updateStudentPassword({
        ...(account.requiresCurrentPassword ? { currentPassword: password.currentPassword } : {}),
        newPassword: password.newPassword,
      });
      setPassword({ currentPassword: '', newPassword: '', confirmPassword: '' });
      showFeedback('security', 'Your password has been updated.');
    } catch (saveError) {
      showFeedback('security', saveError.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const savePreferences = async () => {
    setSaving(true);
    setFeedback({ section: '', message: '', type: 'success' });
    try {
      const result = await updateNotificationPreferences(preferences);
      setPreferences(result);
      setSavedPreferences(result);
      showFeedback('notifications', 'Notification preferences saved.');
    } catch (saveError) {
      showFeedback('notifications', saveError.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const saveAppearance = async () => {
    setSaving(true);
    setFeedback({ section: '', message: '', type: 'success' });
    try {
      const result = await saveStudentTheme(theme);
      setTheme(result.theme);
      setSavedTheme(result.theme);
      localStorage.setItem(storageKey, result.theme);
      applyTheme(result.theme);
      showFeedback('appearance', 'Appearance preference saved.');
    } catch (saveError) {
      setTheme(savedTheme);
      applyTheme(savedTheme);
      showFeedback('appearance', saveError.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const logoutStudent = () => {
    if (hasUnsavedChanges && !window.confirm('You have unsaved changes. Sign out without saving?')) return;
    dispatch(logout());
    navigate('/login', { replace: true });
  };

  if (loading) {
    return (
      <div className="space-y-4" aria-label="Loading settings">
        <div className="h-28 animate-pulse rounded-3xl bg-white" />
        <div className="h-96 animate-pulse rounded-3xl bg-white" />
      </div>
    );
  }

  if (error || !account || !profileDraft || !preferences) {
    return (
      <div className="rounded-3xl border border-red-100 bg-white p-6">
        <p className="text-sm text-red-700" role="alert">{error || 'Unable to load your settings.'}</p>
        <Button className="mt-4" onClick={() => window.location.reload()}>Reload settings</Button>
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-10">
      <section className="flex flex-col gap-4 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-7">
        <div className="flex items-center gap-4">
          <Avatar name={profileDraft.name} src={profileDraft.avatar} size="xl" />
          <div>
            <p className="text-sm font-medium text-slate-500">Student account</p>
            <h2 className="mt-0.5 text-xl font-bold text-slate-900">{profileDraft.name}</h2>
            <p className="text-sm text-slate-600">{account.email}</p>
          </div>
        </div>
        <span className="w-fit rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold capitalize text-brand-800">
          {account.role}
        </span>
      </section>

      <div className="grid gap-5 lg:grid-cols-[13rem_minmax(0,1fr)]">
        <nav className="flex gap-2 overflow-x-auto rounded-2xl border border-slate-100 bg-white p-2 lg:block lg:space-y-1 lg:overflow-visible lg:self-start" aria-label="Settings sections">
          {sections.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => switchSection(id)}
              aria-current={activeSection === id ? 'page' : undefined}
              className={`flex shrink-0 items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors lg:w-full ${
                activeSection === id
                  ? 'bg-brand-100 text-brand-950'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </nav>

        <div className="min-w-0">
          {activeSection === 'profile' && (
            <SettingsCard>
              <div className="mb-6">
                <h3 className="text-lg font-bold text-slate-900">Profile settings</h3>
                <p className="mt-1 text-sm text-slate-500">Manage the personal details shown on your account.</p>
              </div>
              <form onSubmit={saveProfile} className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Full name" name="name" value={profileDraft.name} onChange={handleProfileChange} minLength={2} maxLength={80} required autoComplete="name" />
                  <Field label="Email address" value={account.email} disabled readOnly helper="Email changes are managed through account verification." />
                  <Field label="Phone number" name="phone" type="tel" value={profileDraft.phone} onChange={handleProfileChange} maxLength={32} autoComplete="tel" placeholder="Add a phone number" />
                  <Field label="Profile photo URL" name="avatar" type="url" value={profileDraft.avatar} onChange={handleProfileChange} maxLength={2048} placeholder="https://…" helper="Use a secure HTTPS image URL. Leave empty to use your initials." />
                </div>
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-slate-700">Bio</span>
                  <textarea
                    name="bio"
                    rows={4}
                    maxLength={500}
                    value={profileDraft.bio}
                    onChange={handleProfileChange}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-100"
                    placeholder="Tell us a little about yourself."
                  />
                  <span className="mt-1 block text-right text-xs text-slate-500">{profileDraft.bio.length}/500</span>
                </label>
                <div className="grid gap-3 rounded-2xl bg-slate-50 p-4 text-sm sm:grid-cols-3">
                  <p><span className="block text-xs text-slate-500">Institution</span><span className="font-medium text-slate-800">{account.institution || 'Not added'}</span></p>
                  <p><span className="block text-xs text-slate-500">Degree</span><span className="font-medium text-slate-800">{account.degree || 'Not added'}</span></p>
                  <p><span className="block text-xs text-slate-500">Year of study</span><span className="font-medium text-slate-800">{account.yearOfStudy || 'Not added'}</span></p>
                </div>
                {feedback.section === 'profile' && <Feedback message={feedback.message} type={feedback.type} />}
                <div className="flex flex-wrap gap-3">
                  <Button type="submit" isLoading={saving} isDisabled={!profileDirty}>Save profile</Button>
                  <Button type="button" variant="secondary" onClick={cancelProfile} isDisabled={!profileDirty || saving}>Cancel</Button>
                </div>
              </form>
            </SettingsCard>
          )}

          {activeSection === 'security' && (
            <SettingsCard>
              <div className="mb-6">
                <h3 className="text-lg font-bold text-slate-900">Account security</h3>
                <p className="mt-1 text-sm text-slate-500">Choose a strong password that you do not use elsewhere.</p>
              </div>
              <form onSubmit={savePassword} className="max-w-xl space-y-4">
                {account.requiresCurrentPassword && (
                  <Field label="Current password" name="currentPassword" type="password" autoComplete="current-password" value={password.currentPassword} onChange={(event) => setPassword((current) => ({ ...current, currentPassword: event.target.value }))} required />
                )}
                <Field label="New password" name="newPassword" type="password" autoComplete="new-password" value={password.newPassword} onChange={(event) => setPassword((current) => ({ ...current, newPassword: event.target.value }))} minLength={8} maxLength={128} required helper="Use between 8 and 128 characters." />
                <Field label="Confirm new password" name="confirmPassword" type="password" autoComplete="new-password" value={password.confirmPassword} onChange={(event) => setPassword((current) => ({ ...current, confirmPassword: event.target.value }))} minLength={8} maxLength={128} required />
                {feedback.section === 'security' && <Feedback message={feedback.message} type={feedback.type} />}
                <Button type="submit" isLoading={saving} isDisabled={!password.newPassword || !password.confirmPassword}>Update password</Button>
              </form>
            </SettingsCard>
          )}

          {activeSection === 'notifications' && (
            <SettingsCard>
              <div className="mb-6">
                <h3 className="text-lg font-bold text-slate-900">Notification preferences</h3>
                <p className="mt-1 text-sm text-slate-500">Choose which optional updates appear in your notifications.</p>
              </div>
              <div className="divide-y divide-slate-100">
                {preferenceOptions.map((option) => (
                  <label key={option.key} className="flex cursor-pointer items-start justify-between gap-4 py-4 first:pt-0 last:pb-0">
                    <span>
                      <span className="block text-sm font-semibold text-slate-800">{option.label}</span>
                      <span className="mt-1 block text-xs leading-5 text-slate-500">{option.description}</span>
                    </span>
                    <input
                      type="checkbox"
                      checked={preferences[option.key] !== false}
                      onChange={(event) => setPreferences((current) => ({ ...current, [option.key]: event.target.checked }))}
                      className="mt-1 h-4 w-4 shrink-0 rounded border-slate-300 text-brand-700 focus:ring-brand-600"
                    />
                  </label>
                ))}
              </div>
              <p className="mt-5 rounded-xl bg-slate-50 px-3.5 py-3 text-xs leading-5 text-slate-600">
                Essential security and account notices are always delivered and cannot be disabled here.
              </p>
              {feedback.section === 'notifications' && <div className="mt-4"><Feedback message={feedback.message} type={feedback.type} /></div>}
              <div className="mt-5 flex flex-wrap gap-3">
                <Button onClick={savePreferences} isLoading={saving} isDisabled={!preferencesDirty}>Save preferences</Button>
                <Button variant="secondary" onClick={() => setPreferences(savedPreferences)} isDisabled={!preferencesDirty || saving}>Cancel</Button>
              </div>
            </SettingsCard>
          )}

          {activeSection === 'appearance' && (
            <SettingsCard>
              <div className="mb-6">
                <h3 className="text-lg font-bold text-slate-900">Appearance</h3>
                <p className="mt-1 text-sm text-slate-500">Choose a dashboard theme. Your preference is saved to your account.</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  { value: 'light', label: 'Light', description: 'A bright, neutral workspace.', icon: Sun },
                  { value: 'dark', label: 'Dark', description: 'A darker workspace for low-light use.', icon: Moon },
                ].map(({ value, label, description, icon: Icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setTheme(value)}
                    aria-pressed={theme === value}
                    className={`rounded-2xl border p-4 text-left transition-colors ${
                      theme === value ? 'border-brand-700 bg-brand-50 ring-2 ring-brand-100' : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <span className="flex items-center justify-between">
                      <Icon className="h-5 w-5 text-brand-800" />
                      {theme === value && <Check className="h-4 w-4 text-brand-800" />}
                    </span>
                    <span className="mt-4 block text-sm font-semibold text-slate-900">{label}</span>
                    <span className="mt-1 block text-xs text-slate-500">{description}</span>
                  </button>
                ))}
              </div>
              {feedback.section === 'appearance' && <div className="mt-4"><Feedback message={feedback.message} type={feedback.type} /></div>}
              <div className="mt-5 flex flex-wrap gap-3">
                <Button onClick={saveAppearance} isLoading={saving} isDisabled={!themeDirty}>Save appearance</Button>
                <Button variant="secondary" onClick={() => setTheme(savedTheme)} isDisabled={!themeDirty || saving}>Cancel</Button>
              </div>
            </SettingsCard>
          )}

          {activeSection === 'account' && (
            <SettingsCard>
              <div className="mb-6">
                <h3 className="text-lg font-bold text-slate-900">Account management</h3>
                <p className="mt-1 text-sm text-slate-500">Review your account details and sign out securely.</p>
              </div>
              <dl className="divide-y divide-slate-100 rounded-2xl border border-slate-100 px-4">
                <div className="flex flex-col gap-1 py-3 sm:flex-row sm:justify-between">
                  <dt className="text-sm text-slate-500">Account ID</dt><dd className="break-all font-mono text-xs text-slate-700">{account.id}</dd>
                </div>
                <div className="flex justify-between gap-4 py-3"><dt className="text-sm text-slate-500">Email</dt><dd className="break-all text-right text-sm font-medium text-slate-800">{account.email}</dd></div>
                <div className="flex justify-between gap-4 py-3"><dt className="text-sm text-slate-500">Role</dt><dd className="text-sm font-medium capitalize text-slate-800">{account.role}</dd></div>
                <div className="flex justify-between gap-4 py-3"><dt className="text-sm text-slate-500">Account status</dt><dd className="text-sm font-medium capitalize text-slate-800">{account.status}</dd></div>
                <div className="flex justify-between gap-4 py-3"><dt className="text-sm text-slate-500">Member since</dt><dd className="text-sm font-medium text-slate-800">{account.createdAt ? new Date(account.createdAt).toLocaleDateString() : '—'}</dd></div>
              </dl>
              <div className="mt-6 rounded-2xl border border-red-100 bg-red-50/60 p-4">
                <h4 className="text-sm font-semibold text-slate-900">Sign out</h4>
                <p className="mt-1 mb-4 text-xs leading-5 text-slate-600">This removes your saved sign-in session from this browser.</p>
                <Button variant="danger" icon={LogOut} onClick={logoutStudent}>Sign out</Button>
              </div>
              <p className="mt-4 text-xs leading-5 text-slate-500">Account deletion is not available here. Your learning records are not removed from this page.</p>
            </SettingsCard>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentSettingsPage;
