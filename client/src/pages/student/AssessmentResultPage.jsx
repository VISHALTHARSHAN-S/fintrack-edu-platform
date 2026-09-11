import React, { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  Trophy,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Eye,
  BookOpen,
  RotateCcw,
} from 'lucide-react';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import ProgressBar from '../../components/common/ProgressBar';
import Modal from '../../components/common/Modal';

const AssessmentResultPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { assessmentId } = useParams();

  const result = location.state?.result || {
    attemptId: 'att_demo_1',
    assessmentId,
    title: 'FinTech Core Certification Exam 2026',
    score: 80,
    maxMarks: 100,
    percentage: 80,
    passingPercentage: 70,
    passStatus: 'PASSED',
    correctAnswersCount: 8,
    incorrectAnswersCount: 2,
    skippedCount: 0,
    timeTakenSeconds: 450,
    responses: [],
    strengths: ['Digital Payments Core Architecture', 'UPI Mandate Mechanisms'],
    weaknesses: ['Cybersecurity & Network Encryption'],
    recommendedTopics: ['Cybersecurity', 'Financial Markets'],
  };

  const [showReviewAnswersModal, setShowReviewAnswersModal] = useState(false);

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}m ${s}s`;
  };

  const isPassed = result.passStatus === 'PASSED';

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16 pt-2">
      {/* RESULT HERO BANNER */}
      <div
        className={`p-6 sm:p-8 rounded-3xl border shadow-xl relative overflow-hidden text-white ${
          isPassed
            ? 'bg-gradient-to-r from-emerald-950 via-slate-900 to-navy-950 border-emerald-800/60'
            : 'bg-gradient-to-r from-rose-950 via-slate-900 to-navy-950 border-rose-800/60'
        }`}
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold backdrop-blur-md">
              <Trophy className="w-3.5 h-3.5" /> Assessment Evaluation
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{result.title}</h1>
            <p className="text-slate-300 text-sm">
              Passing criteria: <span className="font-semibold text-white">{result.passingPercentage}%</span>
            </p>
          </div>

          <div className="flex flex-col items-center p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 min-w-[150px]">
            <span className="text-xs text-slate-300 uppercase tracking-wider">Status</span>
            <span className={`text-2xl font-black mt-1 ${isPassed ? 'text-emerald-400' : 'text-rose-400'}`}>
              {result.passStatus}
            </span>
            <span className="text-xs text-slate-300 mt-1 font-bold">{result.percentage}% Marks</span>
          </div>
        </div>
      </div>

      {/* METRICS CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-card">
          <span className="text-xs font-medium text-slate-500">Score Obtained</span>
          <p className="text-2xl font-bold text-slate-900 mt-1">{result.score} / {result.maxMarks}</p>
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
          <span className="text-xs font-medium text-slate-500">Time Spent</span>
          <p className="text-2xl font-bold text-indigo-600 mt-1">{formatTime(result.timeTakenSeconds)}</p>
        </div>
      </div>

      {/* STRENGTHS & WEAKNESSES GRID */}
      <div className="grid sm:grid-cols-2 gap-6">
        {/* STRENGTHS */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-slate-900 text-base">Key Strengths</h3>
          </div>
          <ul className="space-y-2 text-xs text-slate-700">
            {result.strengths?.map((str, i) => (
              <li key={i} className="p-3 rounded-xl bg-emerald-50 text-emerald-900 font-semibold border border-emerald-200">
                {str}
              </li>
            )) || <li className="text-slate-500">Good baseline knowledge across topics.</li>}
          </ul>
        </div>

        {/* WEAKNESSES & RECOMMENDED REVISION */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-slate-900 text-base">Recommended Topics to Revise</h3>
          </div>
          <div className="space-y-2">
            {result.recommendedTopics?.map((top, i) => (
              <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 flex items-center justify-between">
                <span>{top}</span>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate('/student/practice')}
                  className="text-[11px]"
                >
                  Practice Topic
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* BOTTOM ACTIONS */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Button variant="secondary" size="md" onClick={() => navigate('/student/assessments')}>
          Back to Assessments
        </Button>
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="md"
            icon={Eye}
            onClick={() => setShowReviewAnswersModal(true)}
          >
            Review Answers
          </Button>
          <Button
            variant="primary"
            size="md"
            iconRight={ArrowRight}
            onClick={() => navigate('/student/performance')}
          >
            View Performance Dashboard
          </Button>
        </div>
      </div>

      {/* FULL ANSWERS REVIEW MODAL */}
      <Modal
        isOpen={showReviewAnswersModal}
        onClose={() => setShowReviewAnswersModal(false)}
        title="Assessment Answers & Feedback Review"
        size="lg"
      >
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          {result.responses?.length > 0 ? (
            result.responses.map((resp, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 font-bold text-xs">
                  <Badge variant={resp.isCorrect ? 'emerald' : 'danger'} size="sm">
                    {resp.isCorrect ? 'Correct' : 'Incorrect'}
                  </Badge>
                  <span>Q{idx + 1}. {resp.questionText}</span>
                </div>
                <p className="text-xs text-slate-700 bg-white p-3 rounded-xl border border-slate-200">
                  <span className="font-bold text-slate-900">Explanation: </span>{resp.explanation}
                </p>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-500">Evaluated responses recorded. Perfect performance!</p>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default AssessmentResultPage;
