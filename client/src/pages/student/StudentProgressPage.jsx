import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  BarChart3,
  TrendingUp,
  Flame,
  Clock,
  CheckCircle2,
  BookOpen,
  Award,
  ShieldCheck,
  PlayCircle,
  Sparkles,
  ChevronRight,
  Target,
} from 'lucide-react';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import ProgressBar from '../../components/common/ProgressBar';
import CardSkeleton from '../../components/common/LoadingSkeleton';
import { fetchProgressStats } from '../../services/courseService';

const StudentProgressPage = () => {
  const navigate = useNavigate();
  const { enrolledCourses } = useSelector((state) => state.studentLearning);

  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadStats = async () => {
      setIsLoading(true);
      const data = await fetchProgressStats();
      if (isMounted) {
        setStats(data);
        setIsLoading(false);
      }
    };
    loadStats();
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

  const {
    overallProgress,
    learningStreak,
    hoursLearned,
    coursesCompleted,
    coursesEnrolled,
    weeklyActivity,
    skillDistribution,
  } = stats;

  const maxHours = Math.max(...weeklyActivity.map((w) => w.hours), 6);

  return (
    <div className="space-y-8 pb-12">
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-navy-950 via-slate-900 to-indigo-950 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-semibold border border-brand-500/30">
            <BarChart3 className="w-3.5 h-3.5" /> Analytics & Learning Metrics
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Student Progress Dashboard</h1>
          <p className="text-slate-300 text-sm">
            Track your study hours, course completion milestones, weekly engagement, and skill passport readiness.
          </p>
        </div>
      </div>

      {/* METRICS STATS CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Overall Progress', value: `${overallProgress}%`, icon: TrendingUp, color: 'text-brand-600', bg: 'bg-brand-50' },
          { label: 'Learning Streak', value: learningStreak, icon: Flame, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Hours Learned', value: hoursLearned, icon: Clock, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Completed Courses', value: coursesCompleted, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Courses Enrolled', value: coursesEnrolled, icon: BookOpen, color: 'text-purple-600', bg: 'bg-purple-50' },
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

      {/* MAIN VISUALIZATION GRID */}
      <div className="grid lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN: Weekly Activity & Skill Distribution */}
        <div className="lg:col-span-8 space-y-8">
          {/* WEEKLY ACTIVITY BAR CHART */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Weekly Learning Activity</h3>
                <p className="text-xs text-slate-500">Hours spent studying across the current week</p>
              </div>
              <Badge variant="brand" size="sm">This Week</Badge>
            </div>

            <div className="pt-4 flex items-end justify-between gap-3 h-52 px-4 bg-slate-50/50 rounded-2xl border border-slate-100">
              {weeklyActivity.map((dayItem, idx) => {
                const heightPercent = Math.round((dayItem.hours / maxHours) * 100);
                const isMax = dayItem.hours === Math.max(...weeklyActivity.map((w) => w.hours));

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                    <span className="text-[10px] font-bold text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
                      {dayItem.hours}h
                    </span>
                    <div
                      style={{ height: `${Math.max(15, heightPercent)}%` }}
                      className={`w-full rounded-t-xl transition-all duration-500 ${
                        isMax
                          ? 'bg-gradient-to-t from-brand-700 to-brand-500 shadow-md shadow-brand-500/20'
                          : 'bg-brand-200 group-hover:bg-brand-400'
                      }`}
                    />
                    <span className="text-xs font-semibold text-slate-500 group-hover:text-slate-900">
                      {dayItem.day}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SKILL DISTRIBUTION & SCORE BREAKDOWN */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">FinTech Skill Proficiency</h3>
                <p className="text-xs text-slate-500">Verified skill proficiency based on course module performance</p>
              </div>
              <Badge variant="purple" size="sm">Top 5% Cohort</Badge>
            </div>

            <div className="space-y-4">
              {skillDistribution.map((skillItem, idx) => (
                <div key={idx} className="space-y-2 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-900">{skillItem.skill}</span>
                    <span className="font-bold text-brand-600">{skillItem.score}% Score</span>
                  </div>
                  <ProgressBar
                    value={skillItem.score}
                    variant={skillItem.score >= 90 ? 'emerald' : skillItem.score >= 80 ? 'brand' : 'purple'}
                    size="sm"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Recently Enrolled & Skill Passport */}
        <div className="lg:col-span-4 space-y-8">
          {/* RECENTLY ACCESSED COURSES */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Recent Courses</h3>
              <span
                onClick={() => navigate('/student/my-courses')}
                className="text-xs text-brand-600 font-semibold hover:underline cursor-pointer"
              >
                View All
              </span>
            </div>

            <div className="space-y-3">
              {enrolledCourses.slice(0, 3).map((enr, i) => (
                <div key={i} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="text-[11px] font-semibold text-brand-600">
                      {enr.progressPercentage}% Complete
                    </span>
                    <span className="text-[10px] text-slate-400">{enr.lastAccessedAt || 'Recently'}</span>
                  </div>
                  <ProgressBar value={enr.progressPercentage} variant="brand" size="xs" />
                  <Button
                    variant="secondary"
                    size="sm"
                    fullWidth
                    icon={PlayCircle}
                    onClick={() => {
                      const cid = enr.courseId?._id || enr.courseId || 'c101';
                      navigate(`/student/learn/${cid}/${enr.lastAccessedLessonId || 'l101'}`);
                    }}
                    className="mt-2 text-xs"
                  >
                    Resume Learning
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* NAAN MUDHALVAN PASSPORT CARD */}
          <div className="bg-gradient-to-br from-navy-950 via-slate-900 to-brand-950 text-white p-6 rounded-3xl shadow-xl space-y-4 border border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-lg">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">FinTrack Skill Passport</h4>
                <p className="text-[11px] text-slate-400">Naan Mudhalvan Certified</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Your verified score is synced automatically with recruiter search profiles for FinTech placement opportunities.
            </p>

            <Button variant="primary" fullWidth size="sm" className="bg-brand-600 hover:bg-brand-500">
              View Verified Skill Passport
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProgressPage;
