import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Users,
  Calendar,
  CheckCircle2,
  MessageSquare,
  Plus,
  Video,
  GraduationCap,
  Sparkles,
  UserCheck,
  Clock,
  ChevronRight,
  Sliders,
} from 'lucide-react';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import CardSkeleton from '../../components/common/LoadingSkeleton';
import { fetchMentorDashboard } from '../../services/mentorService';

const MentorDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadDashboard = async () => {
      setIsLoading(true);
      const res = await fetchMentorDashboard();
      if (isMounted) {
        setData(res);
        setIsLoading(false);
      }
    };
    loadDashboard();
    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6 py-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  const { stats, upcomingSessions = [], recentStudents = [] } = data;

  return (
    <div className="space-y-8 pb-12">
      {/* MENTOR WELCOME BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-800 via-brand-600 to-indigo-900 text-white p-6 sm:p-8 shadow-xl shadow-purple-500/10">
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold text-white backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5" /> FinTrack Mentor Console
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {user?.name || 'Dr. Aris Vance'}!
            </h2>
            <p className="text-purple-100 text-sm">
              Empowering the next generation of FinTech leaders.
            </p>
          </div>
          <Button
            variant="secondary"
            size="md"
            icon={Plus}
            onClick={() => navigate('/mentor/sessions/new')}
            className="bg-white text-purple-950 border-white hover:bg-purple-50 shrink-0 font-bold"
          >
            Schedule Mentorship
          </Button>
        </div>
      </div>

      {/* STATISTICS CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Active Students', value: stats.activeStudents || 48, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50', path: '/mentor/students' },
          { label: 'Upcoming Sessions', value: stats.upcomingSessions || 6, icon: Calendar, color: 'text-brand-600', bg: 'bg-brand-50', path: '/mentor/sessions' },
          { label: 'Completed Sessions', value: stats.completedSessions || 124, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', path: '/mentor/sessions' },
          { label: 'Unread Messages', value: stats.unreadMessages || 5, icon: MessageSquare, color: 'text-amber-600', bg: 'bg-amber-50', path: '/mentor/messages' },
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              onClick={() => navigate(item.path)}
              className="bg-white p-5 rounded-2xl border border-slate-100 shadow-card hover:shadow-card-hover transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-slate-500">{item.label}</span>
                <div className={`w-9 h-9 rounded-xl ${item.bg} ${item.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-900">{item.value}</p>
            </div>
          );
        })}
      </div>

      {/* MAIN CONTENT GRID */}
      <div className="grid lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN: UPCOMING SESSIONS & MY STUDENTS OVERVIEW */}
        <div className="lg:col-span-8 space-y-8">
          {/* UPCOMING SESSIONS */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Upcoming Mentoring Sessions</h3>
                <p className="text-xs text-slate-500">Your scheduled 1-on-1 mentorships & code reviews</p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                icon={Plus}
                onClick={() => navigate('/mentor/sessions/new')}
              >
                New Session
              </Button>
            </div>

            <div className="space-y-3">
              {upcomingSessions.slice(0, 3).map((session, i) => (
                <div
                  key={session.sessionId || i}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-150 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-brand-200 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="purple" size="sm">{session.sessionType || '1-on-1 Mentorship'}</Badge>
                      <span className="text-xs font-semibold text-brand-600">
                        {new Date(session.date).toLocaleDateString()} • {session.timeSlot}
                      </span>
                    </div>
                    <h4 className="font-semibold text-slate-900 text-sm">{session.topic}</h4>
                    <p className="text-xs text-slate-500">Student: <strong className="text-slate-700">{session.studentName}</strong></p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => navigate(`/mentor/sessions/${session.sessionId || 'sess_m1'}`)}
                    >
                      Details
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      icon={Video}
                      onClick={() => window.open(session.meetingLink || 'https://meet.fintrack.edu', '_blank')}
                      className="bg-brand-600 hover:bg-brand-500 text-xs"
                    >
                      Join
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* MY STUDENTS OVERVIEW & RECENT ACTIVITY */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">My Students Overview</h3>
                <p className="text-xs text-slate-500">Recent student progress and mentorship milestones</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                iconRight={ChevronRight}
                onClick={() => navigate('/mentor/students')}
                className="text-brand-600"
              >
                View All Roster
              </Button>
            </div>

            <div className="divide-y divide-slate-100">
              {recentStudents.slice(0, 4).map((st) => (
                <div key={st.studentId} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-800 font-bold flex items-center justify-center text-xs shrink-0">
                      {st.name.slice(0, 2)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{st.name}</p>
                      <p className="text-xs text-slate-500">{st.currentStage} • Skill Score {st.skillScore}%</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant={st.mentorshipStatus === 'Active' ? 'emerald' : 'amber'} size="sm">
                      {st.mentorshipStatus}
                    </Badge>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => navigate(`/mentor/students/${st.studentId}`)}
                      className="text-xs"
                    >
                      View Profile
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: QUICK ACTIONS */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              Quick Mentor Actions
            </h3>
            <div className="space-y-2.5">
              <Button
                variant="secondary"
                fullWidth
                className="justify-start text-xs font-semibold py-3 border-slate-200"
                icon={Users}
                onClick={() => navigate('/mentor/students')}
              >
                View My Students
              </Button>
              <Button
                variant="secondary"
                fullWidth
                className="justify-start text-xs font-semibold py-3 border-slate-200"
                icon={Calendar}
                onClick={() => navigate('/mentor/sessions/new')}
              >
                Schedule Mentorship Session
              </Button>
              <Button
                variant="secondary"
                fullWidth
                className="justify-start text-xs font-semibold py-3 border-slate-200"
                icon={UserCheck}
                onClick={() => navigate('/mentor/connect')}
              >
                Manage Connect Requests
              </Button>
              <Button
                variant="secondary"
                fullWidth
                className="justify-start text-xs font-semibold py-3 border-slate-200"
                icon={MessageSquare}
                onClick={() => navigate('/mentor/messages')}
              >
                Open Student Messages
              </Button>
              <Button
                variant="secondary"
                fullWidth
                className="justify-start text-xs font-semibold py-3 border-slate-200"
                icon={Sliders}
                onClick={() => navigate('/mentor/availability')}
              >
                Configure Availability
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentorDashboard;
