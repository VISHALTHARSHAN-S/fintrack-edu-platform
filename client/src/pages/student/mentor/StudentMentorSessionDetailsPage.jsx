import React, { useEffect, useState } from 'react';
import { ArrowLeft, Calendar, Clock3, MessageSquare, RotateCcw, Video, XCircle } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '../../../components/common/Button';
import Badge from '../../../components/common/Badge';
import CardSkeleton from '../../../components/common/LoadingSkeleton';
import EmptyState from '../../../components/common/EmptyState';
import { getStudentMentorSession } from '../../../services/studentMentorService';

const formatDate = (value) => new Date(`${String(value).slice(0, 10)}T00:00:00`).toLocaleDateString();

const StudentMentorSessionDetailsPage = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    getStudentMentorSession(sessionId)
      .then((data) => { if (isMounted) setSession(data); })
      .catch((requestError) => { if (isMounted) setError(requestError.response?.data?.message || 'Unable to load mentor session.'); })
      .finally(() => { if (isMounted) setIsLoading(false); });
    return () => { isMounted = false; };
  }, [sessionId]);

  if (isLoading) return <div className="max-w-3xl mx-auto space-y-6"><CardSkeleton /><CardSkeleton /></div>;
  if (!session) return <EmptyState title="Mentor session not found" description={error || 'This session is not available to your account.'} actionText="Back to My Sessions" onAction={() => navigate('/student/mentor-sessions')} />;

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <Button variant="ghost" size="sm" icon={ArrowLeft} onClick={() => navigate('/student/mentor-sessions')}>Back to My Sessions</Button>
      <section className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between gap-4"><div><div className="flex items-center gap-2"><Badge variant={session.status === 'Upcoming' ? 'purple' : session.status === 'Completed' ? 'emerald' : 'danger'} size="sm">{session.status}</Badge><Badge variant="brand" size="sm">{session.sessionType}</Badge></div><h1 className="text-2xl font-extrabold text-slate-900 mt-3">{session.topic}</h1><p className="text-sm text-slate-600 mt-1">Mentor: <strong>{session.mentor?.name || 'Mentor'}</strong></p></div>{session.status === 'Upcoming' && session.meetingLink && <Button icon={Video} onClick={() => window.open(session.meetingLink, '_blank', 'noopener,noreferrer')}>Join Meeting</Button>}</div>
        <div className="grid sm:grid-cols-3 gap-3 text-sm"><div className="bg-slate-50 rounded-xl p-3"><Calendar className="w-4 h-4 text-brand-600 mb-2" /><p className="font-semibold">{formatDate(session.date)}</p></div><div className="bg-slate-50 rounded-xl p-3"><Clock3 className="w-4 h-4 text-brand-600 mb-2" /><p className="font-semibold">{session.timeSlot}</p></div><div className="bg-slate-50 rounded-xl p-3"><p className="text-xs text-slate-500 mb-2">Duration</p><p className="font-semibold">{session.durationMinutes} minutes</p></div></div>
        {session.status === 'Upcoming' && !session.meetingLink && <p className="text-sm text-slate-500">Meeting link is not available yet.</p>}
        {session.agenda && <div><h2 className="font-bold text-slate-900">Agenda</h2><p className="text-sm text-slate-600 whitespace-pre-line mt-2">{session.agenda}</p></div>}
        {session.notes && <div><h2 className="font-bold text-slate-900">Notes</h2><p className="text-sm text-slate-600 whitespace-pre-line mt-2">{session.notes}</p></div>}
        {session.status !== 'Cancelled' && <div className="pt-4 border-t border-slate-100 flex flex-wrap gap-2"><Button variant="secondary" icon={MessageSquare} onClick={() => navigate(`/student/mentor-messages/${session.mentorId}`)}>Chat with Mentor</Button>{session.status === 'Upcoming' && <><Button variant="secondary" icon={RotateCcw} onClick={() => navigate(`/student/mentor-sessions?reschedule=${session.sessionId}`)}>Reschedule</Button><Button variant="danger" icon={XCircle} onClick={() => navigate(`/student/mentor-sessions?cancel=${session.sessionId}`)}>Cancel Session</Button></>}</div>}
      </section>
    </div>
  );
};

export default StudentMentorSessionDetailsPage;