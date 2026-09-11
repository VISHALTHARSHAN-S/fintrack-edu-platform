import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Code2,
  Target,
  Flame,
  CheckCircle2,
  Award,
  Play,
  RotateCcw,
  Sparkles,
  Zap,
  CreditCard,
  QrCode,
  Building,
  Shield,
  Lock,
  TrendingUp,
  BarChart,
  FileText,
  ChevronRight,
  Filter,
} from 'lucide-react';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import ProgressBar from '../../components/common/ProgressBar';
import CardSkeleton from '../../components/common/LoadingSkeleton';
import { fetchPracticeOverview, startPracticeSessionApi } from '../../services/practiceService';

const CATEGORY_ICONS = {
  'Digital Payments': CreditCard,
  UPI: QrCode,
  'Banking & Neo Banking': Building,
  'Blockchain & Crypto': Shield,
  Cybersecurity: Lock,
  'Financial Markets': TrendingUp,
  'FinTech Analytics': BarChart,
  InsurTech: FileText,
};

const PracticeZonePage = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Practice selection state
  const [selectedTopic, setSelectedTopic] = useState('Digital Payments');
  const [selectedDifficulty, setSelectedDifficulty] = useState('Intermediate');
  const [questionCount, setQuestionCount] = useState(5);
  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const loadOverview = async () => {
      setIsLoading(true);
      const res = await fetchPracticeOverview();
      if (isMounted) {
        setData(res);
        setIsLoading(false);
      }
    };
    loadOverview();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleStartPractice = async () => {
    setIsStarting(true);
    try {
      const session = await startPracticeSessionApi({
        topic: selectedTopic,
        difficulty: selectedDifficulty,
        questionCount,
      });
      // Navigate to practice solver screen with session state
      navigate(`/student/practice/${session.sessionId}`, { state: { session } });
    } catch (err) {
      console.error('Failed to start practice:', err);
    } finally {
      setIsStarting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 py-6">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  const { stats, categories, recommendedPractice, recentActivity } = data;

  return (
    <div className="space-y-8 pb-12">
      {/* HEADER BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-navy-950 via-slate-900 to-indigo-950 text-white p-6 sm:p-8 border border-slate-800 shadow-xl">
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-semibold border border-brand-500/30">
            <Zap className="w-3.5 h-3.5" /> FinTrack Practice Zone
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Interactive FinTech Practice Arena
          </h1>
          <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
            Test your knowledge across core domain modules, solve real-world FinTech scenario questions, and raise your accuracy streak.
          </p>
        </div>
      </div>

      {/* OVERVIEW STATS CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Attempted', value: stats.totalAttempted, icon: Target, color: 'text-brand-600', bg: 'bg-brand-50' },
          { label: 'Accuracy Rate', value: `${stats.overallAccuracy}%`, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Practice Streak', value: stats.practiceStreak, icon: Flame, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Questions Solved', value: stats.questionsSolved, icon: Award, color: 'text-purple-600', bg: 'bg-purple-50' },
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

      {/* MAIN GRID: PRACTICE SETUP & RECOMMENDED */}
      <div className="grid lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN: SETUP PRACTICE SESSION & CATEGORIES */}
        <div className="lg:col-span-8 space-y-8">
          {/* PRACTICE CONFIGURATION CARD */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Filter className="w-5 h-5 text-brand-600" /> Custom Practice Setup
                </h3>
                <p className="text-xs text-slate-500">Configure your topic, difficulty level, and set size</p>
              </div>
              <Badge variant="brand" size="sm">Adaptive Set</Badge>
            </div>

            {/* TOPIC SELECTOR */}
            <div className="space-y-3">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Select Topic</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {categories.map((cat) => {
                  const Icon = CATEGORY_ICONS[cat.name] || Code2;
                  const isSelected = selectedTopic === cat.name;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedTopic(cat.name)}
                      className={`p-3 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between ${
                        isSelected
                          ? 'border-brand-600 bg-brand-50/60 ring-2 ring-brand-500/20 text-brand-900 shadow-sm'
                          : 'border-slate-150 bg-white hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className={`p-2 rounded-xl ${isSelected ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        {cat.recommended && <Sparkles className="w-3.5 h-3.5 text-amber-500" />}
                      </div>
                      <span className="text-xs font-bold leading-snug">{cat.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* DIFFICULTY & QUESTION COUNT */}
            <div className="grid sm:grid-cols-2 gap-6 pt-2">
              {/* DIFFICULTY */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Difficulty Level</label>
                <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200">
                  {['Beginner', 'Intermediate', 'Advanced'].map((diff) => (
                    <button
                      key={diff}
                      onClick={() => setSelectedDifficulty(diff)}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                        selectedDifficulty === diff
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
              </div>

              {/* NUMBER OF QUESTIONS */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Number of Questions</label>
                <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200">
                  {[5, 10, 15].map((cnt) => (
                    <button
                      key={cnt}
                      onClick={() => setQuestionCount(cnt)}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                        questionCount === cnt
                          ? 'bg-brand-600 text-white shadow-xs'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {cnt} Questions
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* START PRACTICE CTA BUTTON */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-xs text-slate-500">
                Selected: <span className="font-semibold text-slate-900">{selectedTopic}</span> ({selectedDifficulty}, {questionCount} Qs)
              </div>
              <Button
                variant="primary"
                size="lg"
                icon={Play}
                isLoading={isStarting}
                onClick={handleStartPractice}
                className="w-full sm:w-auto px-8"
              >
                Start Practice Now
              </Button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: RECOMMENDED & RECENT ACTIVITY */}
        <div className="lg:col-span-4 space-y-8">
          {/* RECOMMENDED PRACTICE CARD */}
          <div className="bg-gradient-to-br from-brand-900 via-indigo-950 to-navy-950 text-white p-6 rounded-3xl shadow-xl space-y-4 border border-brand-800/40">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
                <Sparkles className="w-4 h-4" />
              </span>
              <h4 className="font-bold text-white text-sm">Recommended Practice</h4>
            </div>

            <div className="space-y-2">
              <h5 className="font-bold text-base text-brand-200">{recommendedPractice.topic} Booster</h5>
              <p className="text-xs text-slate-300 leading-relaxed">{recommendedPractice.reason}</p>
            </div>

            <Button
              variant="secondary"
              fullWidth
              size="sm"
              icon={Play}
              onClick={() => {
                setSelectedTopic(recommendedPractice.topic);
                setSelectedDifficulty('Intermediate');
                setQuestionCount(5);
                handleStartPractice();
              }}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20"
            >
              Start Recommended Set
            </Button>
          </div>

          {/* RECENT PRACTICE ACTIVITY */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Recent Activity</h3>
              <span className="text-xs text-slate-400">Last 7 Days</span>
            </div>

            <div className="space-y-3">
              {recentActivity.map((act, i) => (
                <div key={i} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div>
                    <h5 className="font-semibold text-slate-900 text-xs">{act.topic}</h5>
                    <p className="text-[11px] text-slate-400 mt-0.5">{act.totalQuestions} Questions • {act.timeAgo || 'Recently'}</p>
                  </div>
                  <Badge variant={act.accuracyPercentage >= 80 ? 'emerald' : 'brand'} size="sm">
                    {act.accuracyPercentage}%
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PracticeZonePage;
