import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  Video,
  Plus,
  Eye,
  CheckCircle2,
  XCircle,
  FileText,
  User,
} from 'lucide-react';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Tabs from '../../components/common/Tabs';
import CardSkeleton from '../../components/common/LoadingSkeleton';
import EmptyState from '../../components/common/EmptyState';
import { fetchMentorSessions } from '../../services/mentorSessionService';

const MentorSessionsPage = () => {
  const navigate = useNavigate();

  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');

  useEffect(() => {
    let isMounted = true;
    const loadSessions = async () => {
      setIsLoading(true);
      const res = await fetchMentorSessions();
      if (isMounted) {
        setSessions(res);
        setIsLoading(false);
      }
    };
    loadSessions();
    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6 py-6">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  const upcomingSessions = sessions.filter((s) => s.status === 'Upcoming');
  const completedSessions = sessions.filter((s) => s.status === 'Completed');
  const cancelledSessions = sessions.filter((s) => s.status === 'Cancelled');

  const tabOptions = [
    { id: 'upcoming', label: `Upcoming (${upcomingSessions.length})` },
    { id: 'completed', label: `Completed (${completedSessions.length})` },
    { id: 'cancelled', label: `Cancelled (${cancelledSessions.length})` },
  ];

  const currentList =
    activeTab === 'upcoming'
      ? upcomingSessions
      : activeTab === 'completed'
      ? completedSessions
      : cancelledSessions;

  return (
    <div className="space-y-8 pb-12">
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-navy-950 via-slate-900 to-purple-950 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold border border-purple-500/30">
              <Calendar className="w-3.5 h-3.5" /> Session Management Console
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              1-on-1 Mentoring Sessions
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
              Track live session appointments, launch virtual classrooms, review student notes, and schedule upcoming slots.
            </p>
          </div>

          <Button
            variant="primary"
            size="md"
            icon={Plus}
            onClick={() => navigate('/mentor/sessions/new')}
            className="bg-purple-600 hover:bg-purple-500 text-white font-bold shrink-0 shadow-lg"
          >
            Schedule New Session
          </Button>
        </div>
      </div>

      {/* TABS NAVIGATION */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <Tabs tabs={tabOptions} activeTab={activeTab} onChange={setActiveTab} />
      </div>

      {/* SESSIONS LIST */}
      {currentList.length === 0 ? (
        <EmptyState
          title={`No ${activeTab} sessions`}
          description="Use the button above to schedule a new mentoring session."
        />
      ) : (
        <div className="space-y-4">
          {currentList.map((session) => (
            <div
              key={session.sessionId}
              className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-card-hover transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="space-y-2 max-w-xl">
                <div className="flex items-center gap-2">
                  <Badge variant={session.status === 'Upcoming' ? 'purple' : session.status === 'Completed' ? 'emerald' : 'danger'} size="sm">
                    {session.status}
                  </Badge>
                  <Badge variant="brand" size="sm">{session.sessionType || '1-on-1 Mentorship'}</Badge>
                </div>

                <h3 className="font-bold text-slate-900 text-base">{session.topic}</h3>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
                  <span className="flex items-center gap-1 font-semibold text-slate-800">
                    <User className="w-3.5 h-3.5 text-purple-700" /> Student: {session.studentName}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-brand-600" /> {new Date(session.date).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-indigo-600" /> {session.timeSlot} ({session.durationMinutes} mins)
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="secondary"
                  size="sm"
                  icon={Eye}
                  onClick={() => navigate(`/mentor/sessions/${session.sessionId}`)}
                >
                  View Details
                </Button>

                {session.status === 'Upcoming' && (
                  <Button
                    variant="primary"
                    size="sm"
                    icon={Video}
                    onClick={() => window.open(session.meetingLink || 'https://meet.fintrack.edu', '_blank')}
                    className="bg-purple-700 hover:bg-purple-800 text-white"
                  >
                    Join Class
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MentorSessionsPage;
