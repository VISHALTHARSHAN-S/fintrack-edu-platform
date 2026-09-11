import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Search,
  Filter,
  MessageSquare,
  Calendar,
  Eye,
  CheckCircle2,
  Award,
  Flame,
  Clock,
  Sparkles,
} from 'lucide-react';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import ProgressBar from '../../components/common/ProgressBar';
import CardSkeleton from '../../components/common/LoadingSkeleton';
import EmptyState from '../../components/common/EmptyState';
import { fetchMentorStudents } from '../../services/mentorService';

const MentorStudentsPage = () => {
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState('All');

  useEffect(() => {
    let isMounted = true;
    const loadStudents = async () => {
      setIsLoading(true);
      const res = await fetchMentorStudents();
      if (isMounted) {
        setStudents(res);
        setIsLoading(false);
      }
    };
    loadStudents();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredStudents = students.filter((st) => {
    const matchesSearch =
      st.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      st.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      st.currentStage.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStage = stageFilter === 'All' || st.currentStage === stageFilter;
    return matchesSearch && matchesStage;
  });

  if (isLoading) {
    return (
      <div className="space-y-6 py-6">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-navy-950 via-slate-900 to-purple-950 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold border border-purple-500/30">
            <Users className="w-3.5 h-3.5" /> Student Management Directory
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            My Mentored Students
          </h1>
          <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
            Monitor course completion progress, skill benchmarks, practice accuracy, and schedule 1-on-1 mentorship sessions.
          </p>
        </div>
      </div>

      {/* FILTERS & SEARCH BAR */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search student by name or stage..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 shrink-0">
            <Filter className="w-3.5 h-3.5" /> Stage:
          </span>
          {['All', 'Quantitative Trading', 'DeFi & Smart Contracts', 'RegTech Compliance', 'FinTech Analytics'].map(
            (st) => (
              <button
                key={st}
                onClick={() => setStageFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  stageFilter === st
                    ? 'bg-purple-700 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st}
              </button>
            )
          )}
        </div>
      </div>

      {/* STUDENT CARDS GRID */}
      {filteredStudents.length === 0 ? (
        <EmptyState title="No Students Found" description="No students matched your search criteria." />
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudents.map((student) => (
            <div
              key={student.studentId}
              className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-card-hover transition-all space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* HEADER INFO */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-brand-600 text-white font-bold text-sm flex items-center justify-center shadow-md">
                      {student.name.slice(0, 2)}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">{student.name}</h3>
                      <p className="text-xs text-slate-500">{student.currentStage}</p>
                    </div>
                  </div>
                  <Badge variant={student.mentorshipStatus === 'Active' ? 'emerald' : 'amber'} size="sm">
                    {student.mentorshipStatus}
                  </Badge>
                </div>

                {/* METRICS */}
                <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
                  <div>
                    <span className="text-[11px] text-slate-400">Skill Score</span>
                    <p className="font-bold text-purple-700 text-sm">{student.skillScore}%</p>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400">Practice Accuracy</span>
                    <p className="font-bold text-emerald-600 text-sm">{student.practiceAccuracy}%</p>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400">Streak</span>
                    <p className="font-bold text-amber-600 text-xs">{student.learningStreak}</p>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400">Last Active</span>
                    <p className="font-semibold text-slate-700 text-[11px]">{student.lastActive}</p>
                  </div>
                </div>

                {/* PROGRESS BAR */}
                <ProgressBar
                  value={student.courseProgress}
                  label="Course Completion"
                  variant="purple"
                  size="xs"
                />
              </div>

              {/* ACTION BUTTONS */}
              <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  fullWidth
                  icon={Eye}
                  onClick={() => navigate(`/mentor/students/${student.studentId}`)}
                >
                  360° Profile
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  icon={MessageSquare}
                  onClick={() => navigate('/mentor/messages')}
                  className="px-3"
                />
                <Button
                  variant="primary"
                  size="sm"
                  icon={Calendar}
                  onClick={() => navigate('/mentor/sessions/new')}
                  className="bg-purple-700 hover:bg-purple-800 px-3"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MentorStudentsPage;
