import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Video,
  User,
  FileText,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Sparkles,
  MessageSquare,
} from 'lucide-react';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import CardSkeleton from '../../components/common/LoadingSkeleton';
import { fetchSessionDetails, updateSessionStatusApi } from '../../services/mentorSessionService';

const SessionDetailPage = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const loadSession = async () => {
      setIsLoading(true);
      const res = await fetchSessionDetails(sessionId);
      if (isMounted) {
        setSession(res);
        setIsLoading(false);
      }
    };
    loadSession();
    return () => {
      isMounted = false;
    };
  }, [sessionId]);

  const handleCancelSession = async () => {
    setIsUpdating(true);
    try {
      await updateSessionStatusApi(sessionId, { status: 'Cancelled' });
      setSession((prev) => ({ ...prev, status: 'Cancelled' }));
      setShowCancelModal(false);
    } catch (err) {
      console.error('Error cancelling session:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCompleteSession = async () => {
    setIsUpdating(true);
    try {
      await updateSessionStatusApi(sessionId, { status: 'Completed' });
      setSession((prev) => ({ ...prev, status: 'Completed' }));
    } catch (err) {
      console.error('Error completing session:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 py-6">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  const { student } = session;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16 pt-2">
      {/* BACK BUTTON */}
      <button
        onClick={() => navigate('/mentor/sessions')}
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-purple-700 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Mentoring Sessions
      </button>

      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-navy-950 via-slate-900 to-purple-950 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Badge variant={session.status === 'Upcoming' ? 'purple' : session.status === 'Completed' ? 'emerald' : 'danger'} size="sm">
            {session.status}
          </Badge>
          <Badge variant="brand" size="sm">{session.sessionType || '1-on-1 Mentorship'}</Badge>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{session.topic}</h1>
        <p className="text-slate-300 text-sm">
          Scheduled for <span className="font-bold text-white">{new Date(session.date).toLocaleDateString()}</span> at <span className="font-bold text-white">{session.timeSlot}</span>
        </p>
      </div>

      {/* STUDENT & MEETING INFO CARDS */}
      <div className="grid sm:grid-cols-2 gap-6">
        {/* STUDENT INFO CARD */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-3 flex items-center gap-2">
            <User className="w-4 h-4 text-purple-700" /> Student Profile
          </h3>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-900 font-bold text-base flex items-center justify-center">
              {session.studentName.slice(0, 2)}
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">{session.studentName}</h4>
              <p className="text-xs text-slate-500">{student?.currentStage || 'Quantitative Trading'}</p>
              <p className="text-[11px] text-purple-700 font-semibold mt-0.5">Skill Score: {student?.skillScore || 94}%</p>
            </div>
          </div>
          <div className="pt-2 flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              fullWidth
              icon={User}
              onClick={() => navigate(`/mentor/students/${session.studentId}`)}
            >
              View 360 Profile
            </Button>
            <Button
              variant="secondary"
              size="sm"
              icon={MessageSquare}
              onClick={() => navigate('/mentor/messages')}
              className="px-3"
            />
          </div>
        </div>

        {/* MEETING LINK CARD */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-3 flex items-center gap-2">
              <Video className="w-4 h-4 text-brand-600" /> Virtual Classroom Room
            </h3>
            <p className="text-xs text-slate-500">
              Encrypted video link active 15 minutes before session time.
            </p>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-700 truncate">
              {session.meetingLink}
            </div>
          </div>

          {session.status === 'Upcoming' && (
            <Button
              variant="primary"
              fullWidth
              size="md"
              icon={Video}
              onClick={() => window.open(session.meetingLink, '_blank')}
              className="bg-purple-700 hover:bg-purple-800 text-white"
            >
              Launch Live Video Room
            </Button>
          )}
        </div>
      </div>

      {/* AGENDA & NOTES */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
        <div className="space-y-3">
          <h3 className="font-bold text-slate-900 text-base border-b border-slate-100 pb-3">
            Session Agenda
          </h3>
          <p className="text-xs sm:text-sm text-slate-700 whitespace-pre-line leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
            {session.agenda || '1. Discussion\n2. Q&A'}
          </p>
        </div>

        <div className="space-y-3 pt-4 border-t border-slate-100">
          <h3 className="font-bold text-slate-900 text-base">
            Mentor Notes & Action Items
          </h3>
          <p className="text-xs text-slate-600 bg-purple-50/50 p-4 rounded-2xl border border-purple-100">
            {session.notes || 'No pre-session notes recorded.'}
          </p>
        </div>

        {/* BOTTOM ACTIONS */}
        {session.status === 'Upcoming' && (
          <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <Button
              variant="danger"
              size="sm"
              onClick={() => setShowCancelModal(true)}
            >
              Cancel Session
            </Button>

            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                size="sm"
                icon={RotateCcw}
                onClick={() => navigate('/mentor/sessions/new')}
              >
                Reschedule Slot
              </Button>
              <Button
                variant="primary"
                size="sm"
                icon={CheckCircle2}
                isLoading={isUpdating}
                onClick={handleCompleteSession}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Mark as Completed
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* CANCEL CONFIRM DIALOG */}
      <ConfirmDialog
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancelSession}
        title="Cancel Mentoring Session?"
        message="Are you sure you want to cancel this scheduled session? The student will be notified."
        confirmText="Confirm Cancellation"
        cancelText="Keep Session"
        type="danger"
      />
    </div>
  );
};

export default SessionDetailPage;
