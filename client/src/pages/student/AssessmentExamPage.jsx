import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Clock,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Send,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import ProgressBar from '../../components/common/ProgressBar';
import Modal from '../../components/common/Modal';
import CardSkeleton from '../../components/common/LoadingSkeleton';
import { startAssessmentAttemptApi, submitAssessmentAttemptApi } from '../../services/assessmentService';

const AssessmentExamPage = () => {
  const { assessmentId } = useParams();
  const navigate = useNavigate();

  const [examData, setExamData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Answers & palette states
  const [answers, setAnswers] = useState({}); // { [qId]: selectedOptId }
  const [reviewMarked, setReviewMarked] = useState({}); // { [qId]: boolean }
  const [secondsRemaining, setSecondsRemaining] = useState(1800); // 30 mins
  const [showSubmitConfirmModal, setShowSubmitConfirmModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const initExam = async () => {
      setIsLoading(true);
      const res = await startAssessmentAttemptApi(assessmentId);
      if (isMounted) {
        setExamData(res);
        setSecondsRemaining((res.assessment?.durationMinutes || 30) * 60);
        setIsLoading(false);
      }
    };
    initExam();
    return () => {
      isMounted = false;
    };
  }, [assessmentId]);

  // COUNTDOWN TIMER EFFECT
  useEffect(() => {
    if (isLoading || secondsRemaining <= 0) return;
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinalSubmit(); // Auto-submit when time reaches 0
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isLoading, secondsRemaining]);

  const formatTimer = (totalSecs) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSelectOption = (optId) => {
    const qId = examData.questions[currentIndex].questionId;
    setAnswers((prev) => ({
      ...prev,
      [qId]: optId,
    }));
  };

  const toggleMarkForReview = () => {
    const qId = examData.questions[currentIndex].questionId;
    setReviewMarked((prev) => ({
      ...prev,
      [qId]: !prev[qId],
    }));
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    try {
      const answerPayload = examData.questions.map((q) => ({
        questionId: q.questionId,
        selectedOptionId: answers[q.questionId] || null,
        isMarkedForReview: Boolean(reviewMarked[q.questionId]),
      }));

      const totalTimeSpent = (examData.assessment?.durationMinutes || 30) * 60 - secondsRemaining;

      const evalResult = await submitAssessmentAttemptApi(assessmentId, {
        attemptId: examData.attemptId,
        answers: answerPayload,
        timeTakenSeconds: totalTimeSpent,
      });

      navigate(`/student/assessments/${assessmentId}/result`, { state: { result: evalResult } });
    } catch (err) {
      console.error('Failed submitting exam:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6 py-6">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  const { assessment, questions } = examData;
  const currentQ = questions[currentIndex];

  const answeredCount = Object.keys(answers).length;
  const markedCount = Object.values(reviewMarked).filter(Boolean).length;
  const unansweredCount = questions.length - answeredCount;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16 pt-2">
      {/* EXAM HEADER & TIMER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white p-5 rounded-2xl border border-slate-100 shadow-sm gap-4">
        <div>
          <h2 className="font-bold text-slate-900 text-base">{assessment.title}</h2>
          <span className="text-xs text-slate-500">
            Question {currentIndex + 1} of {questions.length} • Max Marks: {assessment.totalMarks}
          </span>
        </div>

        {/* COUNTDOWN TIMER BADGE */}
        <div
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-sm font-bold border ${
            secondsRemaining < 300
              ? 'bg-rose-50 border-rose-300 text-rose-600 animate-pulse'
              : 'bg-slate-900 border-slate-800 text-amber-400'
          }`}
        >
          <Clock className="w-4 h-4 shrink-0" />
          <span>{formatTimer(secondsRemaining)}</span>
        </div>
      </div>

      {/* MAIN EXAM CONTENT GRID */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: QUESTION & OPTIONS */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600">
                Question {currentIndex + 1}
              </span>
              <button
                onClick={toggleMarkForReview}
                className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border transition-colors cursor-pointer ${
                  reviewMarked[currentQ.questionId]
                    ? 'bg-amber-100 border-amber-300 text-amber-800'
                    : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5" />
                {reviewMarked[currentQ.questionId] ? 'Marked for Review' : 'Mark for Review'}
              </button>
            </div>

            <h3 className="text-base sm:text-lg font-semibold text-slate-900 leading-relaxed">
              {currentQ.questionText}
            </h3>

            {/* OPTIONS */}
            <div className="space-y-3">
              {currentQ.options.map((option) => {
                const isSelected = answers[currentQ.questionId] === option.id;
                return (
                  <button
                    key={option.id}
                    onClick={() => handleSelectOption(option.id)}
                    className={`w-full p-4 rounded-2xl border text-left transition-all duration-200 flex items-center justify-between group ${
                      isSelected
                        ? 'border-brand-600 bg-brand-50/70 ring-2 ring-brand-500/20 shadow-xs'
                        : 'border-slate-200 bg-slate-50/40 hover:bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border ${
                          isSelected
                            ? 'bg-brand-600 text-white border-brand-600'
                            : 'border-slate-300 text-slate-500'
                        }`}
                      >
                        {option.id.replace('opt', '').replace('opt_', '')}
                      </div>
                      <span className={`text-xs sm:text-sm font-medium ${isSelected ? 'text-slate-900 font-semibold' : 'text-slate-700'}`}>
                        {option.text}
                      </span>
                    </div>
                    {isSelected && <CheckCircle2 className="w-5 h-5 text-brand-600 shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* NAVIGATION CONTROLS */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <Button
                variant="secondary"
                size="sm"
                icon={ChevronLeft}
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex((i) => i - 1)}
              >
                Previous
              </Button>

              {currentIndex < questions.length - 1 ? (
                <Button
                  variant="primary"
                  size="sm"
                  iconRight={ChevronRight}
                  onClick={() => setCurrentIndex((i) => i + 1)}
                >
                  Next
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="sm"
                  icon={Send}
                  onClick={() => setShowSubmitConfirmModal(true)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  Submit Assessment
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: QUESTION PALETTE & LEGEND */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Question Palette</h4>

            <div className="grid grid-cols-5 gap-2">
              {questions.map((q, idx) => {
                const isAnswered = Boolean(answers[q.questionId]);
                const isMarked = Boolean(reviewMarked[q.questionId]);
                const isCurrent = idx === currentIndex;

                return (
                  <button
                    key={q.questionId}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-10 rounded-xl font-bold text-xs transition-all relative flex items-center justify-center ${
                      isCurrent
                        ? 'ring-2 ring-brand-600 ring-offset-2 bg-brand-600 text-white shadow-xs'
                        : isMarked
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : isAnswered
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            {/* PALETTE LEGEND */}
            <div className="pt-3 border-t border-slate-100 space-y-2 text-[11px] text-slate-600">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-400" /> Answered ({answeredCount})
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-400" /> Marked for Review ({markedCount})
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-slate-300" /> Unanswered ({unansweredCount})
              </div>
            </div>

            <Button
              variant="primary"
              fullWidth
              size="md"
              icon={Send}
              onClick={() => setShowSubmitConfirmModal(true)}
              className="mt-2 bg-brand-600 hover:bg-brand-500"
            >
              Submit Exam Final
            </Button>
          </div>
        </div>
      </div>

      {/* CONFIRMATION SUBMISSION DIALOG MODAL */}
      <Modal
        isOpen={showSubmitConfirmModal}
        onClose={() => setShowSubmitConfirmModal(false)}
        title="Confirm Exam Submission"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            Please review your final submission summary before confirming:
          </p>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
              <span className="text-[10px] uppercase font-bold text-emerald-700">Answered</span>
              <p className="text-xl font-extrabold text-emerald-900">{answeredCount}</p>
            </div>
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
              <span className="text-[10px] uppercase font-bold text-amber-700">Marked</span>
              <p className="text-xl font-extrabold text-amber-900">{markedCount}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-100 border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-700">Unanswered</span>
              <p className="text-xl font-extrabold text-slate-900">{unansweredCount}</p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="secondary" size="sm" onClick={() => setShowSubmitConfirmModal(false)}>
              Back to Exam
            </Button>
            <Button
              variant="primary"
              size="sm"
              isLoading={isSubmitting}
              onClick={handleFinalSubmit}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Confirm & Submit Exam
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AssessmentExamPage;
