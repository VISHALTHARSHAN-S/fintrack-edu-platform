import React, { useEffect, useMemo, useState } from 'react';
import { Calendar, Clock3, Eye, RotateCcw, Star, Video, XCircle } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Button from '../../../components/common/Button';
import Badge from '../../../components/common/Badge';
import Tabs from '../../../components/common/Tabs';
import CardSkeleton from '../../../components/common/LoadingSkeleton';
import EmptyState from '../../../components/common/EmptyState';
import {
  cancelMentorSession,
  getMentorAvailability,
  getStudentMentorSessions,
  rescheduleMentorSession,
} from '../../../services/studentMentorService';

const formatDate = (value) => {
  const dateKey = String(value).slice(0, 10);
  return new Date(`${dateKey}T00:00:00`).toLocaleDateString();
};

const nextDate = (value) => {
  const date = new Date(`${String(value).slice(0, 10)}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().slice(0, 10);
};

const StudentMentorSessionsPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [sessions, setSessions] = useState([]);
  const [activeTab, setActiveTab] = useState('Upcoming');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelTarget, setCancelTarget] = useState(null);
  const [rescheduleTarget, setRescheduleTarget] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleSlot, setRescheduleSlot] = useState('');
  const [rescheduleAvailability, setRescheduleAvailability] = useState(null);
  const [isRescheduleLoading, setIsRescheduleLoading] = useState(false);
  const [isActioning, setIsActioning] = useState(false);
  const [actionError, setActionError] = useState('');

  const loadSessions = async () => {
    setIsLoading(true);
    setError('');
    try {
      setSessions(await getStudentMentorSessions());
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to load your mentoring sessions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    if (sessions.length === 0) return;
    const targetId = searchParams.get('reschedule') || searchParams.get('cancel');
    const target = sessions.find((session) => session.sessionId === targetId && session.status === 'Upcoming');
    if (!target) return;
    if (searchParams.get('reschedule')) openReschedule(target);
    if (searchParams.get('cancel')) setCancelTarget(target);
  }, [sessions, searchParams]);

  useEffect(() => {
    if (!rescheduleTarget || !rescheduleDate) return undefined;
    let isMounted = true;
    setIsRescheduleLoading(true);
    setActionError('');
    setRescheduleAvailability(null);
    setRescheduleSlot('');
    getMentorAvailability(rescheduleTarget.mentorId, rescheduleDate)
      .then((availability) => { if (isMounted) setRescheduleAvailability(availability); })
      .catch((requestError) => { if (isMounted) setActionError(requestError.response?.data?.message || 'Unable to load reschedule slots.'); })
      .finally(() => { if (isMounted) setIsRescheduleLoading(false); });
    return () => { isMounted = false; };
  }, [rescheduleTarget, rescheduleDate]);

  const groupedSessions = useMemo(() => ({
    Upcoming: sessions.filter((session) => session.status === 'Upcoming'),
    Completed: sessions.filter((session) => session.status === 'Completed'),
    Cancelled: sessions.filter((session) => session.status === 'Cancelled'),
  }), [sessions]);
  const currentSessions = groupedSessions[activeTab];

  const openReschedule = (session) => {
    setActionError('');
    setRescheduleTarget(session);
    setRescheduleDate(nextDate(session.date));
  };

  const confirmCancel = async () => {
    setIsActioning(true);
    setActionError('');
    try {
      const response = await cancelMentorSession(cancelTarget.sessionId);
      setSessions((current) => current.map((session) => session.sessionId === response.data.sessionId ? response.data : session));
      setCancelTarget(null);
    } catch (requestError) {
      setActionError(requestError.response?.data?.message || 'Unable to cancel this session.');
    } finally {
      setIsActioning(false);
    }
  };

  const confirmReschedule = async () => {
    if (!rescheduleSlot) return;
    setIsActioning(true);
    setActionError('');
    try {
      const response = await rescheduleMentorSession(rescheduleTarget.sessionId, { date: rescheduleDate, timeSlot: rescheduleSlot });
      setSessions((current) => current.map((session) => session.sessionId === response.data.sessionId ? response.data : session));
      setRescheduleTarget(null);
    } catch (requestError) {
      setActionError(requestError.response?.data?.message || 'Unable to reschedule this session.');
    } finally {
      setIsActioning(false);
    }
  };

  if (isLoading) return <div className="space-y-6"><CardSkeleton /><CardSkeleton /></div>;

  return (
    <div className="space-y-8 pb-12">
      <section className="bg-gradient-to-r from-navy-950 via-slate-900 to-brand-950 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">My Mentor Sessions</h1>
        <p className="text-slate-300 text-sm mt-2">Manage your upcoming guidance sessions and revisit your mentoring history.</p>
      </section>

      {error && <div role="alert" className="rounded-xl bg-red-50 border border-red-100 text-red-700 p-3 text-sm">{error}</div>}
      <Tabs
        tabs={['Upcoming', 'Completed', 'Cancelled'].map((status) => ({ id: status, label: `${status} (${groupedSessions[status].length})` }))}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {currentSessions.length === 0 ? (
        <EmptyState title={`No ${activeTab.toLowerCase()} mentoring sessions.`} description="Your real mentoring sessions will appear here." />
      ) : (
        <div className="space-y-4">
          {currentSessions.map((session) => (
            <article key={session.sessionId} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col lg:flex-row justify-between gap-5">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={session.status === 'Upcoming' ? 'purple' : session.status === 'Completed' ? 'emerald' : 'danger'} size="sm">{session.status}</Badge>
                  <Badge variant="brand" size="sm">{session.sessionType}</Badge>
                </div>
                <h2 className="font-bold text-slate-900 text-lg">{session.topic}</h2>
                <p className="text-sm text-slate-600">Mentor: <strong className="text-slate-800">{session.mentor?.name || 'Mentor'}</strong></p>
                <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                  <span className="inline-flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-brand-600" /> {formatDate(session.date)}</span>
                  <span className="inline-flex items-center gap-1"><Clock3 className="w-3.5 h-3.5 text-brand-600" /> {session.timeSlot}</span>
                  <span>{session.durationMinutes} minutes</span>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 lg:self-center">
                <Button variant="secondary" size="sm" icon={Eye} onClick={() => navigate(`/student/mentor-sessions/${session.sessionId}`)}>View Details</Button>
                {session.status === 'Completed' && <Button variant="primary" size="sm" icon={Star} onClick={() => navigate(`/student/mentor-sessions/${session.sessionId}/feedback`)}>Give Feedback</Button>}
                {session.status === 'Upcoming' && <>
                  {session.meetingLink ? <Button variant="primary" size="sm" icon={Video} onClick={() => window.open(session.meetingLink, '_blank', 'noopener,noreferrer')}>Join Meeting</Button> : <span className="text-xs text-slate-500">Meeting link is not available yet.</span>}
                  <Button variant="secondary" size="sm" icon={RotateCcw} onClick={() => openReschedule(session)}>Reschedule</Button>
                  <Button variant="danger" size="sm" icon={XCircle} onClick={() => { setActionError(''); setCancelTarget(session); }}>Cancel</Button>
                </>}
              </div>
            </article>
          ))}
        </div>
      )}

      {cancelTarget && <div className="fixed inset-0 z-50 bg-slate-950/50 flex items-center justify-center p-4"><div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4"><h2 className="text-lg font-bold text-slate-900">Cancel Session</h2><p className="text-sm text-slate-600">Are you sure you want to cancel this mentoring session?</p>{actionError && <p className="text-sm text-red-600">{actionError}</p>}<div className="flex justify-end gap-2"><Button variant="secondary" onClick={() => setCancelTarget(null)}>Keep Session</Button><Button variant="danger" isLoading={isActioning} onClick={confirmCancel}>Cancel Session</Button></div></div></div>}

      {rescheduleTarget && <div className="fixed inset-0 z-50 bg-slate-950/50 flex items-center justify-center p-4"><div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"><h2 className="text-lg font-bold text-slate-900">Reschedule Session</h2><p className="text-sm text-slate-600">Current: {formatDate(rescheduleTarget.date)}, {rescheduleTarget.timeSlot}</p><label className="space-y-2 block"><span className="text-xs font-bold text-slate-700">New date</span><input type="date" min={nextDate(new Date().toISOString())} value={rescheduleDate} onChange={(event) => setRescheduleDate(event.target.value)} className="w-full p-2.5 text-sm border border-slate-200 rounded-xl" /></label>{isRescheduleLoading ? <p className="text-sm text-slate-500">Loading available slots...</p> : rescheduleAvailability?.slots?.length ? <div className="grid sm:grid-cols-2 gap-2">{rescheduleAvailability.slots.map((slot) => <button type="button" key={slot.slotId} disabled={!slot.isAvailable} onClick={() => setRescheduleSlot(slot.time)} className={`p-2.5 rounded-lg border text-sm text-left ${slot.isAvailable ? rescheduleSlot === slot.time ? 'border-brand-600 bg-brand-50' : 'border-slate-200' : 'bg-slate-50 text-slate-400 cursor-not-allowed'}`}>{slot.time}</button>)}</div> : <p className="text-sm text-slate-500">No available slots for this date.</p>}{actionError && <p className="text-sm text-red-600">{actionError}</p>}<div className="bg-slate-50 rounded-xl p-3 text-sm"><strong>New:</strong> {rescheduleDate ? formatDate(rescheduleDate) : 'Select a date'}, {rescheduleSlot || 'Select a slot'}</div><div className="flex justify-end gap-2"><Button variant="secondary" onClick={() => setRescheduleTarget(null)}>Keep Current Booking</Button><Button variant="primary" isLoading={isActioning} isDisabled={!rescheduleSlot} onClick={confirmReschedule}>Confirm Reschedule</Button></div></div></div>}
    </div>
  );
};

export default StudentMentorSessionsPage;