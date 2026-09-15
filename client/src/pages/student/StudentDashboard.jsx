import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  CheckCircle2,
  Award,
  TrendingUp,
  Flame,
  PlayCircle,
  Video,
  ChevronRight,
  ShieldCheck,
  Trophy,
  Briefcase,
  Sparkles,
} from 'lucide-react';
import ProgressBar from '../../components/common/ProgressBar';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import API from '../../services/api';
import CardSkeleton from '../../components/common/LoadingSkeleton';
import { fetchStudentLiveClasses } from '../../services/liveClassService';

const StudentDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await API.get('/users/student/dashboard');
        setData({ ...res.data.data, upcomingLiveClasses: [] });
      } catch (err) {
        console.warn('Using default demo data');
        setData({
          stats: {
            coursesEnrolled: 12,
            coursesCompleted: 5,
            certificatesEarned: 6,
            skillScore: '83%',
            learningStreak: '15 days',
          },
          learningProgress: [
            { id: 1, title: 'Algorithmic Trading & High-Frequency Strategies', progress: 78, category: 'Quant', lastAccessed: '2 hours ago' },
            { id: 2, title: 'Financial Machine Learning & Risk Modeling', progress: 45, category: 'AI & Finance', lastAccessed: 'Yesterday' },
            { id: 3, title: 'DeFi Protocols & Smart Contract Auditing', progress: 92, category: 'Blockchain', lastAccessed: '3 days ago' },
          ],
            recommendedCourses: [
            { id: 4, title: 'RegTech Compliance & Anti-Money Laundering Systems', level: 'Intermediate', duration: '6 hours' },
            { id: 5, title: 'Quantitative Portfolio Optimization with Python', level: 'Advanced', duration: '10 hours' },
          ],
            upcomingLiveClasses: [],
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  useEffect(() => {
    const loadLiveClasses = async () => {
      try {
        const liveClasses = await fetchStudentLiveClasses();
        const upcoming = (liveClasses || [])
          .filter((item) => ['live', 'scheduled'].includes(item.currentState?.status || item.status))
          .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt))
          .slice(0, 3)
          .map((item) => ({
            id: item._id,
            title: item.title,
            mentor: item.mentor?.name || 'Industry Mentor',
            course: item.course?.title || 'FinTech session',
            time: new Date(item.scheduledAt).toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
            }),
            status: (item.currentState?.status || item.status) === 'live' ? 'Live' : 'Upcoming',
          }));

        setData((prev) => ({
          ...(prev || {}),
          upcomingLiveClasses: upcoming,
        }));
      } catch (error) {
        console.warn('Failed to load live classes for dashboard', error.message);
        setData((prev) => ({ ...(prev || {}), upcomingLiveClasses: [] }));
      }
    };

    loadLiveClasses();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  const { stats, learningProgress, recommendedCourses, upcomingLiveClasses = [] } = data || {};

  return (
    <div className="space-y-8 pb-12">
      {/* WELCOME BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-600 via-indigo-600 to-accent-purple text-white p-6 sm:p-8 shadow-xl shadow-brand-500/10">
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold text-white backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5" /> Naan Mudhalvan Student Portal
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {user?.name || 'Student'}!
            </h2>
            <p className="text-brand-100 text-sm">Keep learning, keep growing. Your skill score is top 5% in your cohort.</p>
          </div>
          <Button variant="secondary" size="md" className="bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-md shrink-0">
            View Skill Passport
          </Button>
        </div>
      </div>

      {/* STATISTICS CARDS GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Courses Enrolled', value: stats.coursesEnrolled, icon: BookOpen, color: 'text-brand-600', bg: 'bg-brand-50' },
          { label: 'Courses Completed', value: stats.coursesCompleted, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Certificates Earned', value: stats.certificatesEarned, icon: Award, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Skill Score', value: stats.skillScore, icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Learning Streak', value: stats.learningStreak, icon: Flame, color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-card hover:shadow-card-hover transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-slate-500">{item.label}</span>
                <div className={`w-9 h-9 rounded-xl ${item.bg} ${item.color} flex items-center justify-center`}>
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
        {/* LEFT COLUMN: Learning Progress & Recommendations */}
        <div className="lg:col-span-8 space-y-8">
          {/* MY LEARNING PROGRESS */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">My Learning Progress</h3>
                <p className="text-xs text-slate-500">Pick up right where you left off</p>
              </div>
              <span className="text-xs text-brand-600 font-semibold hover:underline cursor-pointer">View All</span>
            </div>

            <div className="space-y-4">
              {learningProgress.map((course) => (
                <div key={course.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-150/60 hover:border-brand-200 transition-colors space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Badge variant="brand" size="sm" className="mb-1">{course.category}</Badge>
                      <h4 className="font-semibold text-slate-900 text-sm">{course.title}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">Last accessed {course.lastAccessed}</p>
                    </div>
                    <Button variant="primary" size="sm" icon={PlayCircle}>
                      Continue
                    </Button>
                  </div>
                  <ProgressBar value={course.progress} label="Course Progress" variant="brand" size="sm" />
                </div>
              ))}
            </div>
          </div>

          {/* RECOMMENDED FOR YOU */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Recommended for You</h3>
                <p className="text-xs text-slate-500">Curated based on your FinTech skill score gap</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {recommendedCourses.map((rc) => (
                <div key={rc.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="purple" size="sm">{rc.level}</Badge>
                      <span className="text-[11px] text-slate-400">{rc.duration}</span>
                    </div>
                    <h4 className="font-semibold text-slate-900 text-sm leading-snug">{rc.title}</h4>
                  </div>
                  <Button variant="secondary" size="sm" fullWidth className="mt-2">
                    Start Module
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Live Classes, Skill Passport & Leaderboard */}
        <div className="lg:col-span-4 space-y-8">
          {/* UPCOMING LIVE CLASSES */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Video className="w-4 h-4 text-brand-600" /> Upcoming Live Classes
              </h3>
            </div>

            <div className="space-y-3">
              {upcomingLiveClasses.map((session) => (
                <div key={session.id} className="p-4 rounded-2xl bg-brand-50/40 border border-brand-100 space-y-2">
                  <div className="flex justify-between items-start">
                    <Badge variant={session.status === 'Live' ? 'error' : 'info'} size="sm">{session.status}</Badge>
                    <span className="text-[11px] font-medium text-slate-500">{session.time}</span>
                  </div>
                  <h5 className="font-semibold text-slate-900 text-xs leading-snug">{session.title}</h5>
                  <p className="text-[11px] text-slate-500">Mentor: {session.mentor}</p>
                  <p className="text-[11px] text-slate-500">Course: {session.course}</p>
                  <Button
                    variant="primary"
                    size="sm"
                    fullWidth
                    className="mt-2 text-xs"
                    onClick={() => navigate(`/student/live-classes/${session.id}`)}
                  >
                    Join Session
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* SKILL PASSPORT PREVIEW */}
          <div className="bg-gradient-to-br from-navy-950 to-slate-900 text-white p-6 rounded-3xl shadow-xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">FinTrack Skill Passport</h4>
                <p className="text-[11px] text-slate-400">Naan Mudhalvan Verified</p>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-300 pt-2 border-t border-slate-800">
              <div className="flex justify-between py-1">
                <span>Quant Trading</span>
                <span className="font-bold text-emerald-400">Level 4</span>
              </div>
              <div className="flex justify-between py-1">
                <span>DeFi Security</span>
                <span className="font-bold text-brand-400">Level 3</span>
              </div>
              <div className="flex justify-between py-1">
                <span>RegTech Compliance</span>
                <span className="font-bold text-purple-400">Level 5</span>
              </div>
            </div>

            <Button variant="primary" fullWidth size="sm" className="bg-brand-600 hover:bg-brand-500">
              Share Skill Passport
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
