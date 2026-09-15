import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Camera, ExternalLink, FileText, LogOut, MessageSquareText, Mic, ScreenShare, Settings, Users, Video } from 'lucide-react';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import Tabs from '../../components/common/Tabs';
import Toast from '../../components/common/Toast';
import Avatar from '../../components/common/Avatar';
import { fetchLiveClassById, leaveLiveClass } from '../../services/liveClassService';

const LiveClassRoomPage = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [liveClass, setLiveClass] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('chat');
  const [leaving, setLeaving] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    let isMounted = true;
    fetchLiveClassById(classId)
      .then((data) => { if (isMounted) setLiveClass(data); })
      .catch(() => { if (isMounted) setError('We could not load the classroom. Please try again.'); })
      .finally(() => { if (isMounted) setLoading(false); });
    return () => { isMounted = false; };
  }, [classId]);

  const handleLeave = async () => {
    setLeaving(true);
    try {
      const result = await leaveLiveClass(classId);
      if (!result.success) {
        setToast({ type: 'error', message: 'We could not record your departure. Please try again.' });
        return;
      }
      navigate('/student/live-classes', { state: { toast: { type: 'success', message: 'Class attendance recorded successfully.' } } });
    } catch {
      setToast({ type: 'error', message: 'We could not record your departure. Please try again.' });
    } finally {
      setLeaving(false);
    }
  };

  const roomTabs = useMemo(() => [
    { id: 'chat', label: 'Chat', icon: MessageSquareText },
    { id: 'participants', label: 'Participants', icon: Users },
    { id: 'materials', label: 'Materials', icon: FileText },
  ], []);

  if (loading) return <LoadingSkeleton className="h-[620px]" />;
  if (error) return <ErrorState description={error} onRetry={() => window.location.reload()} />;
  if (!liveClass) return <ErrorState title="Room unavailable" description="This live class could not be found." onRetry={() => navigate('/student/live-classes')} />;

  const meetingLink = location.state?.meetingLink || liveClass.meetingLink;
  const materials = liveClass.materials || [];

  return (
    <div className="space-y-6 pb-8">
      {toast && <div className="fixed right-4 top-4 z-50"><Toast {...toast} onClose={() => setToast(null)} /></div>}
      <header className="flex flex-col gap-3 rounded-3xl border border-slate-100 bg-white p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3"><button onClick={() => navigate('/student/live-classes')} className="rounded-xl p-2 text-slate-600 hover:bg-slate-100"><ArrowLeft className="h-4 w-4" /></button><Badge variant="error"><span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-red-500" /> LIVE</Badge><div><h1 className="text-xl font-extrabold text-slate-900">{liveClass.title}</h1><p className="text-sm text-slate-500">Mentor: {liveClass.mentor?.name} · {liveClass.maxParticipants || 120} participant capacity</p></div></div>
        <Button variant="danger" size="sm" icon={LogOut} isLoading={leaving} onClick={handleLeave}>Leave Class</Button>
      </header>

      <div className="grid gap-6 xl:grid-cols-[220px_minmax(0,1fr)_320px]">
        <aside className="hidden min-h-[560px] rounded-3xl bg-navy-950 p-4 text-slate-300 xl:flex xl:flex-col xl:justify-between"><div><div className="mb-6 flex items-center gap-3 rounded-2xl bg-white/5 p-2"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 font-bold text-white">F</div><div><div className="font-bold text-white">FinTrack</div><div className="text-[10px] uppercase tracking-[0.18em] text-slate-400">Edu</div></div></div><nav className="space-y-2 text-sm">{['Overview', 'Schedule', 'Materials', 'Attendance'].map((item) => <div key={item} className="rounded-xl px-3 py-2 text-slate-300 hover:bg-white/5">{item}</div>)}</nav></div><div className="rounded-2xl bg-white/5 p-3 text-xs text-slate-300">Meeting hosted externally</div></aside>

        <main className="space-y-5"><section className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 shadow-2xl"><div className="relative flex aspect-video items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-brand-950"><div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(99,102,241,0.25),_transparent_60%)]" /><div className="relative z-10 max-w-xl px-6 text-center"><div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full border border-brand-400/40 bg-brand-500/20"><Video className="h-8 w-8 text-white" /></div><Badge variant="error"><span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-red-500" /> LIVE SESSION</Badge><h2 className="mt-4 text-2xl font-extrabold text-white">{liveClass.title}</h2><p className="mt-2 text-sm text-slate-300">Hosted externally by {liveClass.mentor?.name}</p><a href={meetingLink} target="_blank" rel="noreferrer" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-500"><ExternalLink className="h-4 w-4" /> Join External Meeting</a><p className="mt-3 text-xs text-slate-400">The meeting opens in a new browser tab.</p></div></div><div className="flex flex-wrap items-center justify-center gap-2 border-t border-slate-800 bg-slate-900 px-4 py-3">{[[Mic, 'Mute'], [Camera, 'Camera'], [ScreenShare, 'Share Screen'], [Users, 'Participants'], [MessageSquareText, 'Chat'], [Settings, 'Settings']].map(([Icon, label]) => <button key={label} type="button" title={`${label} is managed by the external meeting`} className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-700"><Icon className="h-4 w-4" />{label}</button>)}</div></section><section className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm"><div className="flex items-center justify-between gap-3"><div><h2 className="text-lg font-bold text-slate-900">Session Info</h2><p className="text-sm text-slate-500">{liveClass.course?.title}</p></div><Badge variant="brand">Attendance tracked</Badge></div><div className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-3"><span className="block text-xs uppercase tracking-[0.14em] text-slate-400">Agenda</span><span className="mt-2 block font-semibold text-slate-900">{liveClass.agenda?.length || 0} items</span></div><div className="rounded-2xl bg-slate-50 p-3"><span className="block text-xs uppercase tracking-[0.14em] text-slate-400">Materials</span><span className="mt-2 block font-semibold text-slate-900">{materials.length} resources</span></div><div className="rounded-2xl bg-slate-50 p-3"><span className="block text-xs uppercase tracking-[0.14em] text-slate-400">Meeting</span><span className="mt-2 block font-semibold text-slate-900">External room</span></div></div></section></main>

        <aside className="flex min-h-[560px] flex-col rounded-3xl border border-slate-100 bg-white p-4 shadow-sm"><Tabs tabs={roomTabs} activeTab={tab} onChange={setTab} className="mb-4" />{tab === 'chat' && <div className="flex flex-1 flex-col justify-between"><EmptyState icon={MessageSquareText} title="Chat is external" description="Open the meeting to use its live chat and reactions." className="p-5 shadow-none" /><a href={meetingLink} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white">Open Meeting Chat <ExternalLink className="h-4 w-4" /></a></div>}{tab === 'participants' && <div className="space-y-4"><div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3"><Avatar name={liveClass.mentor?.name || 'Mentor'} size="sm" /><div><p className="text-sm font-semibold text-slate-900">{liveClass.mentor?.name || 'Mentor'}</p><p className="text-xs text-slate-500">Mentor</p></div></div><p className="text-sm text-slate-500">Participant presence is managed by the external meeting.</p></div>}{tab === 'materials' && (materials.length ? <div className="space-y-3">{materials.map((item, index) => <a key={`${item.title}-${index}`} href={item.url} target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-3 text-sm text-slate-700 hover:border-brand-200 hover:bg-brand-50"><span className="inline-flex items-center gap-3"><FileText className="h-4 w-4 text-brand-600" />{item.title}</span><span className="text-[10px] uppercase tracking-[0.12em] text-slate-500">{item.type}</span></a>)}</div> : <EmptyState icon={FileText} title="No materials available yet" description="Your mentor has not shared materials for this session." className="p-5 shadow-none" />)}</aside>
      </div>
    </div>
  );
};

export default LiveClassRoomPage;
