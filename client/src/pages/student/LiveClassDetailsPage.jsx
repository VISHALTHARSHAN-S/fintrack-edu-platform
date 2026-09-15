import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, BookOpen, CalendarDays, Clock3, ExternalLink, FileText, PlayCircle, Users, Video } from 'lucide-react';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import ErrorState from '../../components/common/ErrorState';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import Toast from '../../components/common/Toast';
import { fetchLiveClassById, fetchLiveClassRecording, joinLiveClass } from '../../services/liveClassService';

const formatDate = (value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
const formatTimeRange = (value, durationMinutes) => {
  const start = new Date(value);
  const end = new Date(start.getTime() + Number(durationMinutes || 60) * 60 * 1000);
  return `${start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} - ${end.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
};

const LiveClassDetailsPage = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [liveClass, setLiveClass] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [joining, setJoining] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError('');
    fetchLiveClassById(classId)
      .then((data) => { if (isMounted) setLiveClass(data); })
      .catch(() => { if (isMounted) setError('We could not load this live class. Please try again.'); })
      .finally(() => { if (isMounted) setLoading(false); });
    return () => { isMounted = false; };
  }, [classId]);

  const handleJoin = async () => {
    setJoining(true);
    try {
      const result = await joinLiveClass(classId);
      if (!result.success) {
        setToast({ type: 'error', message: 'This class is not available to join right now.' });
        return;
      }
      navigate(`/student/live-classes/${classId}/room`, { state: { meetingLink: result.data?.meetingLink } });
    } catch {
      setToast({ type: 'error', message: 'We could not join this class. Please try again.' });
    } finally {
      setJoining(false);
    }
  };

  const handleRecording = async () => {
    try {
      const result = await fetchLiveClassRecording(classId);
      if (result.data?.recordingUrl) {
        window.open(result.data.recordingUrl, '_blank', 'noopener,noreferrer');
      } else {
        setToast({ type: 'info', message: 'Recording is not available yet.' });
      }
    } catch {
      setToast({ type: 'error', message: 'We could not load the recording right now.' });
    }
  };

  if (loading) return <LoadingSkeleton className="h-96" />;
  if (error) return <ErrorState description={error} onRetry={() => window.location.reload()} />;
  if (!liveClass) return <ErrorState title="Class not found" description="This live class may no longer be available." onRetry={() => navigate('/student/live-classes')} />;

  const state = liveClass.currentState || { label: liveClass.status, joinAllowed: liveClass.joinAllowed };
  const isCompleted = state.status === 'completed';
  const isLive = state.status === 'live';

  return (
    <div className="space-y-8 pb-12">
      {toast && <div className="fixed right-4 top-4 z-50"><Toast {...toast} onClose={() => setToast(null)} /></div>}
      <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
        <button onClick={() => navigate('/student/live-classes')} className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"><ArrowLeft className="h-4 w-4" /> Back to Live Classes</button>
        <div className="mt-6 flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
          <div><Badge variant={isLive ? 'error' : isCompleted ? 'slate' : 'brand'}>{state.label || liveClass.status}</Badge><h1 className="mt-3 text-3xl font-extrabold text-slate-900">{liveClass.title}</h1><p className="mt-2 max-w-3xl text-slate-600">{liveClass.description}</p></div>
          <div className="flex flex-wrap gap-3"><Button variant="secondary" icon={Video} onClick={() => navigate(`/student/live-classes/${classId}/room`)}>Room Preview</Button><Button variant="primary" icon={Video} isDisabled={!liveClass.joinAllowed || joining} isLoading={joining} onClick={handleJoin}>{isCompleted ? 'Session Closed' : isLive ? 'Join Live Class' : 'Join Class'}</Button></div>
        </div>
      </section>

      <div className="grid gap-8 xl:grid-cols-12">
        <main className="space-y-6 xl:col-span-8">
          <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm"><h2 className="text-lg font-bold text-slate-900">Class Overview</h2><div className="mt-5 grid gap-4 text-sm text-slate-600 sm:grid-cols-2 lg:grid-cols-4"><div className="rounded-2xl bg-slate-50 p-4"><BookOpen className="h-4 w-4 text-brand-600" /><p className="mt-2 font-semibold text-slate-900">{liveClass.course?.title}</p><p className="mt-1 text-xs text-slate-500">Course</p></div><div className="rounded-2xl bg-slate-50 p-4"><Users className="h-4 w-4 text-brand-600" /><p className="mt-2 font-semibold text-slate-900">{liveClass.mentor?.name}</p><p className="mt-1 text-xs text-slate-500">Mentor</p></div><div className="rounded-2xl bg-slate-50 p-4"><CalendarDays className="h-4 w-4 text-brand-600" /><p className="mt-2 font-semibold text-slate-900">{formatDate(liveClass.scheduledAt)}</p><p className="mt-1 text-xs text-slate-500">Date</p></div><div className="rounded-2xl bg-slate-50 p-4"><Clock3 className="h-4 w-4 text-brand-600" /><p className="mt-2 font-semibold text-slate-900">{liveClass.durationMinutes} minutes</p><p className="mt-1 text-xs text-slate-500">Duration</p></div></div></section>

          <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm"><div className="flex items-center justify-between gap-3"><h2 className="text-lg font-bold text-slate-900">Agenda</h2><span className="text-sm text-slate-500">{formatTimeRange(liveClass.scheduledAt, liveClass.durationMinutes)}</span></div>{liveClass.agenda?.length ? <ol className="mt-5 space-y-3">{liveClass.agenda.map((item, index) => <li key={`${item}-${index}`} className="flex gap-3 text-sm text-slate-600"><span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-semibold text-brand-600">{index + 1}</span><span>{item}</span></li>)}</ol> : <p className="mt-5 text-sm text-slate-500">Agenda will be shared by the mentor.</p>}</section>

          <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm"><h2 className="text-lg font-bold text-slate-900">Materials</h2>{liveClass.materials?.length ? <div className="mt-5 space-y-3">{liveClass.materials.map((material, index) => <a key={`${material.title}-${index}`} href={material.url} target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-3 text-sm text-slate-700 hover:border-brand-200 hover:bg-brand-50"><span className="inline-flex items-center gap-3"><FileText className="h-4 w-4 text-brand-600" />{material.title}</span><span className="text-[10px] uppercase tracking-[0.12em] text-slate-500">{material.type}</span></a>)}</div> : <p className="mt-5 text-sm text-slate-500">No materials available yet.</p>}</section>
        </main>

        <aside className="space-y-6 xl:col-span-4"><section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm"><h2 className="text-lg font-bold text-slate-900">Session Details</h2><div className="mt-4 space-y-4 text-sm text-slate-600"><div className="flex justify-between border-b border-slate-100 pb-3"><span>Status</span><strong className="text-slate-900">{state.label || liveClass.status}</strong></div><div className="flex justify-between border-b border-slate-100 pb-3"><span>Participants</span><strong className="text-slate-900">{liveClass.maxParticipants || 120}</strong></div><div className="flex justify-between"><span>Meeting</span><a href={liveClass.meetingLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-semibold text-brand-600">Open <ExternalLink className="h-3.5 w-3.5" /></a></div></div></section>{liveClass.recordingUrl ? <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm"><h2 className="text-lg font-bold text-slate-900">Recording</h2><p className="mt-2 text-sm text-slate-500">Available after the session.</p><Button variant="secondary" icon={PlayCircle} className="mt-4" onClick={handleRecording}>Watch Recording</Button></section> : <section className="rounded-3xl border border-slate-100 bg-slate-50 p-6"><h2 className="text-lg font-bold text-slate-900">Recording</h2><p className="mt-2 text-sm text-slate-500">Recording not available yet.</p></section>}</aside>
      </div>
    </div>
  );
};

export default LiveClassDetailsPage;
