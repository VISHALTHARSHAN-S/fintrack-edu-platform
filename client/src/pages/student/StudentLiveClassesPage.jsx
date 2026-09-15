import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { BookOpen, CalendarDays, Clock3, ExternalLink, Search, Users, Video } from 'lucide-react';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import Tabs from '../../components/common/Tabs';
import Toast from '../../components/common/Toast';
import { fetchStudentLiveClasses, joinLiveClass } from '../../services/liveClassService';

const formatDate = (value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
const formatTime = (value) => new Date(value).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
const formatTimeRange = (value, durationMinutes) => {
  const start = new Date(value);
  const end = new Date(start.getTime() + Number(durationMinutes || 60) * 60 * 1000);
  return `${formatTime(start)} - ${formatTime(end)}`;
};
const getState = (liveClass) => liveClass.currentState || { status: liveClass.status, label: liveClass.status };
const formatCountdown = (value) => {
  const minutes = Math.max(1, Math.round((new Date(value).getTime() - Date.now()) / 60000));
  if (minutes <= 1) return 'Starting soon';
  if (minutes >= 60) return `Starting in ${Math.floor(minutes / 60)}h ${minutes % 60}m`;
  return `Starting in ${minutes}m`;
};

const ClassMeta = ({ liveClass }) => (
  <div className="mt-4 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
    <span className="inline-flex items-center gap-2"><Users className="w-4 h-4 text-slate-400" /> {liveClass.mentor?.name || 'Industry Mentor'}</span>
    <span className="inline-flex items-center gap-2"><BookOpen className="w-4 h-4 text-slate-400" /> {liveClass.course?.title || 'FinTech course'}</span>
    <span className="inline-flex items-center gap-2"><CalendarDays className="w-4 h-4 text-slate-400" /> {formatDate(liveClass.scheduledAt)}</span>
    <span className="inline-flex items-center gap-2"><Clock3 className="w-4 h-4 text-slate-400" /> {formatTimeRange(liveClass.scheduledAt, liveClass.durationMinutes)}</span>
  </div>
);

const StudentLiveClassesPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [classes, setClasses] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(location.state?.toast || null);

  const loadClasses = async () => {
    setIsLoading(true);
    setError('');
    try {
      setClasses(await fetchStudentLiveClasses());
    } catch {
      setError('We could not load your live classes. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadClasses(); }, []);

  const filteredClasses = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return classes.filter((liveClass) => {
      const state = getState(liveClass);
      const matchesTab = activeTab === 'all' || state.status === activeTab;
      const matchesSearch = !term || [liveClass.title, liveClass.mentor?.name, liveClass.course?.title].some((value) => value?.toLowerCase().includes(term));
      return matchesTab && matchesSearch;
    });
  }, [activeTab, classes, searchTerm]);

  const liveClasses = filteredClasses.filter((item) => getState(item).status === 'live');
  const upcomingClasses = filteredClasses.filter((item) => getState(item).status === 'scheduled');
  const completedClasses = filteredClasses.filter((item) => getState(item).status === 'completed');

  const handleJoin = async (classId) => {
    try {
      const result = await joinLiveClass(classId);
      if (!result.success) {
        setToast({ type: 'error', message: 'This class is not available to join right now.' });
        return;
      }
      navigate(`/student/live-classes/${classId}/room`, { state: { meetingLink: result.data?.meetingLink } });
    } catch {
      setToast({ type: 'error', message: 'We could not join this class. Please try again.' });
    }
  };

  const renderEmpty = (title, description) => <EmptyState icon={CalendarDays} title={title} description={description} />;

  if (isLoading) return <div className="space-y-6"><LoadingSkeleton className="h-28" /><LoadingSkeleton className="h-72" /><LoadingSkeleton className="h-56" /></div>;

  return (
    <div className="space-y-8 pb-12">
      {toast && <div className="fixed right-4 top-4 z-50"><Toast {...toast} onClose={() => setToast(null)} /></div>}
      <header className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div><p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-600">Live Mentoring</p><h1 className="mt-2 text-3xl font-extrabold text-slate-900">Live Classes</h1><p className="mt-2 max-w-2xl text-sm text-slate-600">Learn directly from industry mentors through interactive live sessions.</p></div>
          <div className="relative w-full xl:w-80"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search title, mentor, or course" className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-200" /></div>
        </div>
      </header>

      <Tabs tabs={[{ id: 'all', label: 'All', badge: classes.length }, { id: 'live', label: 'Live', badge: classes.filter((item) => getState(item).status === 'live').length }, { id: 'scheduled', label: 'Upcoming', badge: classes.filter((item) => getState(item).status === 'scheduled').length }, { id: 'completed', label: 'Completed', badge: classes.filter((item) => getState(item).status === 'completed').length }]} activeTab={activeTab} onChange={setActiveTab} />

      {error ? <ErrorState description={error} onRetry={loadClasses} /> : filteredClasses.length === 0 ? renderEmpty('No live classes found', 'Try another search or check back when mentors publish a new session.') : (
        <>
          {(activeTab === 'all' || activeTab === 'live') && <section className="space-y-4"><h2 className="text-xl font-bold text-slate-900">Live Now</h2>{liveClasses.length === 0 ? renderEmpty('No classes are live now', 'Your next session will appear here when it opens.') : liveClasses.map((liveClass) => <article key={liveClass._id} className="rounded-3xl border border-rose-200 bg-gradient-to-r from-rose-50 via-white to-brand-50 p-5 shadow-sm sm:p-6"><div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between"><div><Badge variant="error"><span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-red-500" /> LIVE NOW</Badge><h3 className="mt-3 text-2xl font-extrabold text-slate-900">{liveClass.title}</h3><ClassMeta liveClass={liveClass} /><p className="mt-3 text-sm text-slate-500">Up to {liveClass.maxParticipants || 120} participants</p></div><div className="flex flex-col gap-2 sm:flex-row lg:flex-col"><Button variant="primary" icon={Video} onClick={() => handleJoin(liveClass._id)}>Join Live</Button><Button variant="secondary" onClick={() => navigate(`/student/live-classes/${liveClass._id}`)}>View Details</Button></div></div></article>)}</section>}

          {(activeTab === 'all' || activeTab === 'scheduled') && <section className="space-y-4"><h2 className="text-xl font-bold text-slate-900">Upcoming Classes</h2>{upcomingClasses.length === 0 ? renderEmpty('No upcoming classes', 'Check back later for new mentor sessions.') : <div className="grid gap-4 xl:grid-cols-2">{upcomingClasses.map((liveClass) => { const state = getState(liveClass); return <article key={liveClass._id} className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm"><div className="flex items-start justify-between gap-3"><div><Badge variant="brand">{state.label || 'SCHEDULED'}</Badge><h3 className="mt-3 text-lg font-bold text-slate-900">{liveClass.title}</h3></div><Video className="h-5 w-5 text-brand-600" /></div><ClassMeta liveClass={liveClass} /><p className="mt-3 text-sm font-semibold text-brand-600">{state.isStartingSoon ? 'Starting soon' : formatCountdown(liveClass.scheduledAt)}</p><div className="mt-5 flex flex-wrap gap-3"><Button variant="secondary" onClick={() => navigate(`/student/live-classes/${liveClass._id}`)}>View Details</Button><Button variant="primary" isDisabled={!liveClass.joinAllowed} onClick={() => handleJoin(liveClass._id)}>{liveClass.joinAllowed ? 'Join Live' : 'Not Open Yet'}</Button></div></article>; })}</div>}</section>}

          {(activeTab === 'all' || activeTab === 'completed') && <section className="space-y-4"><h2 className="text-xl font-bold text-slate-900">Completed Classes</h2>{completedClasses.length === 0 ? renderEmpty('No completed classes', 'Completed sessions and recordings will appear here.') : completedClasses.map((liveClass) => <article key={liveClass._id} className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between"><div><Badge variant="slate">COMPLETED</Badge><h3 className="mt-2 font-bold text-slate-900">{liveClass.title}</h3><p className="mt-1 text-sm text-slate-600">{liveClass.mentor?.name} · {formatDate(liveClass.scheduledAt)} · {liveClass.durationMinutes} minutes</p><p className="mt-1 text-sm text-slate-500">{liveClass.course?.title}</p></div>{liveClass.recordingUrl ? <Button variant="secondary" icon={ExternalLink} onClick={() => window.open(liveClass.recordingUrl, '_blank', 'noopener,noreferrer')}>Watch Recording</Button> : <span className="text-sm text-slate-500">Recording not available yet</span>}</article>)}</section>}
        </>
      )}
    </div>
  );
};

export default StudentLiveClassesPage;
