import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  GraduationCap,
  Award,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  MessageSquare,
  BookOpen,
  Sparkles,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import ProgressBar from '../../components/common/ProgressBar';
import CardSkeleton from '../../components/common/LoadingSkeleton';
import { fetchStudent360Details } from '../../services/mentorService';

const StudentDetailPage = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();

  const [student, setStudent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadDetails = async () => {
      setIsLoading(true);
      const res = await fetchStudent360Details(studentId);
      if (isMounted) {
        setStudent(res);
        setIsLoading(false);
      }
    };
    loadDetails();
    return () => {
      isMounted = false;
    };
  }, [studentId]);

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6 py-6">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16 pt-2">
      {/* BACK BUTTON */}
      <button
        onClick={() => navigate('/mentor/students')}
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-purple-700 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" /> Back to My Students
      </button>

      {/* STUDENT PROFILE HERO BANNER */}
      <div className="bg-gradient-to-r from-navy-950 via-slate-900 to-purple-950 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-500 to-brand-500 text-white font-bold text-xl flex items-center justify-center shadow-lg">
              {student.name.slice(0, 2)}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold text-white">{student.name}</h1>
                <Badge variant={student.mentorshipStatus === 'Active' ? 'emerald' : 'amber'} size="sm">
                  {student.mentorshipStatus}
                </Badge>
              </div>
              <p className="text-slate-300 text-xs">{student.email} • {student.currentStage}</p>
              <div className="flex items-center gap-3 text-xs text-purple-300 pt-1">
                <span>Streak: <strong>{student.learningStreak}</strong></span>
                <span>•</span>
                <span>Last Active: <strong>{student.lastActive}</strong></span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button
              variant="secondary"
              size="md"
              icon={MessageSquare}
              onClick={() => navigate('/mentor/messages')}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20"
            >
              Message
            </Button>
            <Button
              variant="primary"
              size="md"
              icon={Calendar}
              onClick={() => navigate('/mentor/sessions/new')}
              className="bg-purple-600 hover:bg-purple-500 text-white"
            >
              Schedule Session
            </Button>
          </div>
        </div>
      </div>

      {/* PERFORMANCE METRICS GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-card">
          <span className="text-xs font-medium text-slate-500">Course Progress</span>
          <p className="text-2xl font-bold text-slate-900 mt-1">{student.courseProgress}%</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-card">
          <span className="text-xs font-medium text-slate-500">Skill Score</span>
          <p className="text-2xl font-bold text-purple-700 mt-1">{student.skillScore}%</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-card">
          <span className="text-xs font-medium text-slate-500">Practice Accuracy</span>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{student.practiceAccuracy}%</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-card">
          <span className="text-xs font-medium text-slate-500">Assessment Average</span>
          <p className="text-2xl font-bold text-indigo-600 mt-1">{student.assessmentScore}</p>
        </div>
      </div>

      {/* MAIN DETAILS GRID */}
      <div className="grid lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN: ENROLLED COURSES & MENTORING HISTORY */}
        <div className="lg:col-span-8 space-y-8">
          {/* ENROLLED COURSES */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-purple-700" /> Enrolled Courses & Progress
            </h3>
            <div className="space-y-3">
              {student.enrolledCourses?.map((courseName, i) => (
                <div key={i} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-900">
                    <span>{courseName}</span>
                    <span className="text-purple-700">{student.courseProgress}%</span>
                  </div>
                  <ProgressBar value={student.courseProgress} variant="purple" size="xs" />
                </div>
              ))}
            </div>
          </div>

          {/* MENTORING HISTORY & NOTES */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-brand-600" /> Mentoring History & Session Notes
            </h3>

            {student.mentoringHistory?.length === 0 ? (
              <p className="text-xs text-slate-500">No prior mentoring sessions recorded.</p>
            ) : (
              <div className="space-y-3">
                {student.mentoringHistory.map((hist, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-purple-50/40 border border-purple-100 space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-purple-900">{hist.topic}</span>
                      <span className="text-slate-500 font-semibold">{hist.date}</span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">{hist.notes}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: STRENGTHS, WEAK AREAS & RECOMMENDED ACTIONS */}
        <div className="lg:col-span-4 space-y-6">
          {/* STRENGTHS */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-3">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Demonstrated Strengths
            </h4>
            <div className="space-y-2">
              {student.strengths?.map((str, i) => (
                <div key={i} className="p-2.5 rounded-xl bg-emerald-50 text-emerald-900 text-xs font-semibold border border-emerald-200">
                  {str}
                </div>
              ))}
            </div>
          </div>

          {/* WEAK AREAS */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-3">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600" /> Target Improvement Areas
            </h4>
            <div className="space-y-2">
              {student.weakAreas?.map((weak, i) => (
                <div key={i} className="p-2.5 rounded-xl bg-rose-50 text-rose-900 text-xs font-semibold border border-rose-200">
                  {weak}
                </div>
              ))}
            </div>
          </div>

          {/* RECOMMENDED ACTION */}
          <div className="bg-gradient-to-br from-purple-900 to-indigo-950 text-white p-6 rounded-3xl shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
              <Sparkles className="w-4 h-4" /> Recommended Mentor Action
            </div>
            <p className="text-xs text-slate-200 leading-relaxed">
              Schedule a 1-on-1 code review focusing on <strong className="text-white">{student.weakAreas?.[0] || 'Security Auditing'}</strong> to boost student performance before next cohort assessment.
            </p>
            <Button
              variant="primary"
              fullWidth
              size="sm"
              icon={Calendar}
              onClick={() => navigate('/mentor/sessions/new')}
              className="bg-white text-purple-950 font-bold hover:bg-purple-50"
            >
              Schedule Recommended Session
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDetailPage;
