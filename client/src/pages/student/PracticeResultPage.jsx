import React, { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  Trophy,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  ArrowRight,
  Sparkles,
  BookOpen,
  Eye,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import ProgressBar from '../../components/common/ProgressBar';
import Modal from '../../components/common/Modal';

const PracticeResultPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { practiceId } = useParams();

  // Evaluated result passed from submit response
  const result = location.state?.result || {
    sessionId: practiceId,
    topic: 'Digital Payments',
    difficulty: 'Intermediate',
    totalQuestions: 5,
    score: 4,
    accuracyPercentage: 80,
    correctAnswersCount: 4,
    incorrectAnswersCount: 1,
    skippedCount: 0,
    timeTakenSeconds: 120,
    performanceLevel: 'Excellent',
    responses: [],
    suggestions: 'Great performance! You demonstrate strong mastery of digital payments architecture.',
  };

  const [expandedIndex, setExpandedIndex] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}m ${s}s`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16 pt-2">
      {/* HEADER BANNER WITH PERFORMANCE LEVEL */}
      <div className="bg-gradient-to-r from-navy-950 via-slate-900 to-indigo-950 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-semibold border border-brand-500/30">
              <Trophy className="w-3.5 h-3.5" /> Practice Evaluation Complete
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              {result.topic} Practice Results
            </h1>
            <p className="text-slate-300 text-sm">
              Difficulty: <span className="font-semibold text-white">{result.difficulty}</span>
            </p>
          </div>

          <div className="flex flex-col items-center p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 min-w-[140px]">
            <span className="text-xs text-slate-300 uppercase tracking-wider">Performance</span>
            <span
              className={`text-xl font-black mt-1 ${
                result.performanceLevel === 'Excellent'
                  ? 'text-emerald-400'
                  : result.performanceLevel === 'Good'
                  ? 'text-brand-400'
                  : 'text-amber-400'
              }`}
            >
              {result.performanceLevel}
            </span>
            <span className="text-[11px] text-slate-400 mt-0.5">{result.accuracyPercentage}% Accuracy</span>
          </div>
        </div>
      </div>

      {/* METRICS CARDS GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-card">
          <span className="text-xs font-medium text-slate-500">Score</span>
          <p className="text-2xl font-bold text-slate-900 mt-1">{result.score} / {result.totalQuestions}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-card">
          <span className="text-xs font-medium text-slate-500">Correct Answers</span>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{result.correctAnswersCount}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-card">
          <span className="text-xs font-medium text-slate-500">Incorrect / Skipped</span>
          <p className="text-2xl font-bold text-rose-600 mt-1">{result.incorrectAnswersCount + result.skippedCount}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-card">
          <span className="text-xs font-medium text-slate-500">Time Taken</span>
          <p className="text-2xl font-bold text-indigo-600 mt-1">{formatTime(result.timeTakenSeconds)}</p>
        </div>
      </div>

      {/* SUGGESTIONS & IMPROVEMENT TIP CARD */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Sparkles className="w-5 h-5 text-amber-500" />
          <h3 className="font-bold text-slate-900 text-base">Improvement Suggestions</h3>
        </div>
        <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
          {result.suggestions}
        </p>
      </div>

      {/* DETAILED QUESTION RESPONSE BREAKDOWN */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Question Review</h3>
            <p className="text-xs text-slate-500">Analyze correct and incorrect answer explanations</p>
          </div>
          <Button variant="secondary" size="sm" icon={Eye} onClick={() => setShowReviewModal(true)}>
            Full Modal View
          </Button>
        </div>

        <div className="space-y-4">
          {result.responses.map((resp, idx) => {
            const isExpanded = expandedIndex === idx;
            return (
              <div
                key={idx}
                className={`p-5 rounded-2xl border transition-all ${
                  resp.isCorrect
                    ? 'bg-emerald-50/40 border-emerald-200'
                    : 'bg-rose-50/40 border-rose-200'
                }`}
              >
                <div
                  className="flex items-start justify-between gap-3 cursor-pointer"
                  onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                >
                  <div className="flex items-start gap-3">
                    {resp.isCorrect ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <span className="text-xs font-bold text-slate-500">Q{idx + 1}.</span>
                      <h4 className="font-semibold text-slate-900 text-sm">{resp.questionText}</h4>
                    </div>
                  </div>
                  <button className="text-slate-400 hover:text-slate-600 p-1">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>

                {/* EXPANDED DETAILS */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-slate-200/60 space-y-3">
                    <div className="space-y-2">
                      {resp.options?.map((opt) => {
                        const isUserChoice = opt.id === resp.selectedOptionId;
                        const isCorrectOpt = opt.id === resp.correctOptionId || opt.isCorrect;

                        return (
                          <div
                            key={opt.id}
                            className={`p-3 rounded-xl text-xs font-medium border flex items-center justify-between ${
                              isCorrectOpt
                                ? 'bg-emerald-100 border-emerald-300 text-emerald-900 font-bold'
                                : isUserChoice
                                ? 'bg-rose-100 border-rose-300 text-rose-900 font-bold'
                                : 'bg-white border-slate-200 text-slate-600'
                            }`}
                          >
                            <span>{opt.text}</span>
                            {isCorrectOpt && <span className="text-[10px] uppercase font-black text-emerald-700">Correct Answer</span>}
                            {isUserChoice && !isCorrectOpt && <span className="text-[10px] uppercase font-black text-rose-700">Your Answer</span>}
                          </div>
                        );
                      })}
                    </div>

                    <div className="p-3 rounded-xl bg-slate-100 text-xs text-slate-700 space-y-1">
                      <span className="font-bold text-slate-900 flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5 text-brand-600" /> Educational Explanation:
                      </span>
                      <p>{resp.explanation}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* BOTTOM ACTIONS */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Button variant="secondary" size="md" onClick={() => navigate('/student/practice')}>
          Back to Practice Zone
        </Button>
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="md"
            icon={RotateCcw}
            onClick={() => navigate('/student/practice')}
          >
            Retry Practice
          </Button>
          <Button
            variant="primary"
            size="md"
            iconRight={ArrowRight}
            onClick={() => navigate('/student/assessments')}
          >
            Take Assessment
          </Button>
        </div>
      </div>

      {/* FULL MODAL REVIEW */}
      <Modal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        title="Full Practice Question Review"
        size="lg"
      >
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          {result.responses.map((resp, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 font-bold text-xs">
                {resp.isCorrect ? (
                  <Badge variant="emerald" size="sm">Correct</Badge>
                ) : (
                  <Badge variant="danger" size="sm">Incorrect</Badge>
                )}
                <span>Q{idx + 1}: {resp.questionText}</span>
              </div>
              <p className="text-xs text-slate-600 bg-white p-3 rounded-xl border border-slate-200">
                <span className="font-bold">Explanation: </span>{resp.explanation}
              </p>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
};

export default PracticeResultPage;
