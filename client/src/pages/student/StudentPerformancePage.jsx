import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3,
  TrendingUp,
  Target,
  Award,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  BookOpen,
  Code2,
  FileCheck,
  ShieldCheck,
} from 'lucide-react';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import ProgressBar from '../../components/common/ProgressBar';
import CardSkeleton from '../../components/common/LoadingSkeleton';
import { fetchStudentPerformance } from '../../services/performanceService';

const StudentPerformancePage = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadPerformance = async () => {
      setIsLoading(true);
      const res = await fetchStudentPerformance();
      if (isMounted) {
        setData(res);
        setIsLoading(false);
      }
    };
    loadPerformance();
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
    overallPerformanceScore,
    practiceAccuracy,
    assessmentScore,
    questionsSolved,
    learningToPracticeConversion,
    weeklyActivity = [],
    topicPerformance = [],
    strengthAreas = [],
    weakAreas = [],
    improvementTrend,
    smartRecommendations = [],
  } = data;

  const maxWeeklySolved = Math.max(...weeklyActivity.map((w) => w.solved), 10);

  return (
    <div className="space-y-8 pb-16">
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-navy-950 via-slate-900 to-indigo-950 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-semibold border border-brand-500/30">
            <BarChart3 className="w-3.5 h-3.5" /> Performance & Weakness Analytics
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Student Performance Ecosystem
          </h1>
          <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
            Gain deep insights into your practice accuracy, assessment milestones, topic proficiencies, and smart ecosystem recommendations.
          </p>
        </div>
      </div>

      {/* METRICS STATS GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Overall Score', value: `${overallPerformanceScore}%`, icon: TrendingUp, color: 'text-brand-600', bg: 'bg-brand-50' },
          { label: 'Practice Accuracy', value: `${practiceAccuracy}%`, icon: Target, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Assessment Score', value: `${assessmentScore}%`, icon: Award, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Questions Solved', value: questionsSolved, icon: Code2, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Learning-to-Practice', value: learningToPracticeConversion, icon: Sparkles, color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-card hover:shadow-card-hover transition-all">
              <div className="flex items-center justify-between mb-2">
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

      {/* SMART IMPROVEMENT RECOMMENDATIONS SECTION */}
      <div className="bg-gradient-to-br from-brand-950 via-slate-900 to-navy-950 text-white p-6 sm:p-8 rounded-3xl shadow-xl space-y-6 border border-brand-800/50">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-800 pb-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30 mb-1">
              <Sparkles className="w-3.5 h-3.5" /> AI Ecosystem Integration
            </div>
            <h3 className="text-lg font-extrabold text-white">Smart Improvement Recommendations</h3>
            <p className="text-xs text-slate-400">Connecting WEAK TOPIC → COURSE → PRACTICE → ASSESSMENT</p>
          </div>
          <Badge variant="brand" size="sm">{improvementTrend}</Badge>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {smartRecommendations.map((rec) => (
            <div
              key={rec.id}
              className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant="danger" size="xs">Weak Topic: {rec.weakTopic}</Badge>
                  <span className="text-[11px] text-amber-300 font-semibold">Priority Action</span>
                </div>
                <h4 className="font-bold text-white text-base leading-snug">{rec.title}</h4>
                <p className="text-xs text-slate-300 leading-relaxed">{rec.description}</p>
              </div>

              {/* CONNECTED ECOSYSTEM FLOW CHAIN */}
              <div className="pt-3 border-t border-white/10 space-y-2 text-[11px] text-slate-300">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-3.5 h-3.5 text-brand-400 shrink-0" />
                  <span>Course: <strong className="text-white">{rec.recommendedCourse}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Code2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Practice: <strong className="text-white">{rec.practiceTopic} Set</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <FileCheck className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span>Assessment: <strong className="text-white">Timed Benchmark Exam</strong></span>
                </div>

                <Button
                  variant="primary"
                  fullWidth
                  size="sm"
                  iconRight={ArrowRight}
                  onClick={() => navigate('/student/practice')}
                  className="mt-3 bg-brand-600 hover:bg-brand-500 text-xs"
                >
                  {rec.actionText}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* TOPIC-WISE PERFORMANCE & STRENGTH/WEAKNESS MATRIX */}
      <div className="grid lg:grid-cols-12 gap-8">
        {/* LEFT: TOPIC PROFICIENCY BREAKDOWN */}
        <div className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Topic Accuracy Breakdown</h3>
              <p className="text-xs text-slate-500">Practice and assessment accuracy across FinTech categories</p>
            </div>
          </div>

          <div className="space-y-4">
            {topicPerformance.map((item, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-900">{item.topic}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">{item.solved} Solved</span>
                    <Badge variant={item.status === 'Strong' ? 'emerald' : item.status === 'Good' ? 'brand' : 'danger'} size="sm">
                      {item.accuracy}% ({item.status})
                    </Badge>
                  </div>
                </div>
                <ProgressBar
                  value={item.accuracy}
                  variant={item.accuracy >= 85 ? 'emerald' : item.accuracy >= 70 ? 'brand' : 'rose'}
                  size="sm"
                />
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: STRENGTH & WEAKNESS MATRIX */}
        <div className="lg:col-span-4 space-y-6">
          {/* STRENGTHS */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Strength Areas
            </h4>
            <div className="space-y-2">
              {strengthAreas.map((str, i) => (
                <div key={i} className="p-3 rounded-xl bg-emerald-50 text-emerald-900 text-xs font-semibold border border-emerald-200">
                  {str}
                </div>
              ))}
            </div>
          </div>

          {/* WEAK AREAS */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600" /> Areas Requiring Attention
            </h4>
            <div className="space-y-2">
              {weakAreas.map((weak, i) => (
                <div key={i} className="p-3 rounded-xl bg-rose-50 text-rose-900 text-xs font-semibold border border-rose-200">
                  {weak}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentPerformancePage;
