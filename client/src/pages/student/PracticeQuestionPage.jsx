import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw,
  LogOut,
  Sparkles,
  Send,
  AlertCircle,
  BookOpen,
} from 'lucide-react';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import ProgressBar from '../../components/common/ProgressBar';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Modal from '../../components/common/Modal';
import { MOCK_PRACTICE_QUESTIONS } from '../../data/mockPracticeData';
import { submitPracticeSessionApi } from '../../services/practiceService';

const PracticeQuestionPage = () => {
  const { practiceId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Retrieve session passed from PracticeZonePage or fallback to default
  const sessionData = location.state?.session || {
    sessionId: practiceId,
    topic: 'Digital Payments',
    difficulty: 'Intermediate',
    totalQuestions: MOCK_PRACTICE_QUESTIONS.length,
    questions: MOCK_PRACTICE_QUESTIONS,
  };

  const [questions] = useState(sessionData.questions || MOCK_PRACTICE_QUESTIONS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { [questionId]: selectedOptionId }
  const [showExitModal, setShowExitModal] = useState(false);
  const [showExplanationModal, setShowExplanationModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [startTime] = useState(Date.now());

  const currentQ = questions[currentIndex];
  const progressPercent = Math.round(((currentIndex + 1) / questions.length) * 100);

  const handleSelectOption = (optId) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQ.questionId]: optId,
    }));
  };

  const handleClearAnswer = () => {
    setAnswers((prev) => {
      const copy = { ...prev };
      delete copy[currentQ.questionId];
      return copy;
    });
  };

  const handleSubmitPractice = async () => {
    setIsSubmitting(true);
    try {
      const timeTaken = Math.round((Date.now() - startTime) / 1000);
      const answerPayload = questions.map((q) => ({
        questionId: q.questionId,
        selectedOptionId: answers[q.questionId] || null,
      }));

      const result = await submitPracticeSessionApi(practiceId, {
        topic: sessionData.topic,
        difficulty: sessionData.difficulty,
        answers: answerPayload,
        timeTakenSeconds: timeTaken,
      });

      // Navigate to results screen with detailed evaluated data
      navigate(`/student/practice/${practiceId}/result`, { state: { result } });
    } catch (err) {
      console.error('Error submitting practice:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const answeredCount = Object.keys(answers).length;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16 pt-2">
      {/* TOP BAR: NAVIGATION & EXIT */}
      <div className="flex items-center justify-between bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowExitModal(true)}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </button>
          <div>
            <h2 className="font-bold text-slate-900 text-sm sm:text-base">{sessionData.topic} Practice</h2>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Badge variant="brand" size="xs">{sessionData.difficulty}</Badge>
              <span>•</span>
              <span>Question {currentIndex + 1} of {questions.length}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-right">
            <span className="text-xs font-semibold text-slate-700">Answered {answeredCount}/{questions.length}</span>
          </div>
          <Button variant="danger" size="sm" onClick={() => setShowExitModal(true)}>
            Exit Practice
          </Button>
        </div>
      </div>

      {/* PROGRESS BAR */}
      <div className="px-1">
        <ProgressBar value={progressPercent} label="Practice Progress" variant="brand" size="xs" />
      </div>

      {/* QUESTION CARD */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
        {/* QUESTION TEXT HEADER */}
        <div className="space-y-3 border-b border-slate-100 pb-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600">
              Question #{currentIndex + 1}
            </span>
            {answers[currentQ.questionId] && (
              <Badge variant="emerald" size="sm">Option Selected</Badge>
            )}
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-slate-900 leading-relaxed">
            {currentQ.questionText}
          </h3>
        </div>

        {/* MULTIPLE CHOICE OPTIONS */}
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
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border transition-colors ${
                      isSelected
                        ? 'bg-brand-600 text-white border-brand-600'
                        : 'border-slate-300 text-slate-500 group-hover:border-brand-400'
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

        {/* BOTTOM ACTION BUTTONS */}
        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {answers[currentQ.questionId] && (
              <button
                onClick={handleClearAnswer}
                className="text-xs font-semibold text-slate-500 hover:text-rose-600 underline cursor-pointer"
              >
                Clear selection
              </button>
            )}
            <button
              onClick={() => setShowExplanationModal(true)}
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1.5 ml-2 cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5" /> View Explanation Hint
            </button>
          </div>

          <div className="flex items-center gap-3">
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
                Next Question
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                icon={Send}
                isLoading={isSubmitting}
                onClick={handleSubmitPractice}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Submit Practice
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* QUESTION NAV PALETTE */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Question Palette</h4>
        <div className="flex flex-wrap gap-2">
          {questions.map((q, idx) => {
            const isAnswered = Boolean(answers[q.questionId]);
            const isCurrent = idx === currentIndex;

            return (
              <button
                key={q.questionId}
                onClick={() => setCurrentIndex(idx)}
                className={`w-9 h-9 rounded-xl font-bold text-xs transition-all ${
                  isCurrent
                    ? 'ring-2 ring-brand-600 ring-offset-2 bg-brand-600 text-white shadow-xs'
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
      </div>

      {/* EXIT CONFIRMATION MODAL */}
      <ConfirmDialog
        isOpen={showExitModal}
        onClose={() => setShowExitModal(false)}
        onConfirm={() => navigate('/student/practice')}
        title="Exit Practice Session?"
        message="Are you sure you want to exit? Your current practice progress will not be saved."
        confirmText="Exit Session"
        cancelText="Cancel & Resume"
        type="danger"
      />

      {/* EXPLANATION HINT MODAL */}
      <Modal
        isOpen={showExplanationModal}
        onClose={() => setShowExplanationModal(false)}
        title="Educational Explanation Hint"
        size="md"
      >
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-brand-50 border border-brand-100 space-y-2">
            <div className="flex items-center gap-2 text-brand-700 font-bold text-xs">
              <BookOpen className="w-4 h-4" /> Core Concept Note
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              {currentQ.explanation}
            </p>
          </div>
          <div className="flex justify-end">
            <Button variant="primary" size="sm" onClick={() => setShowExplanationModal(false)}>
              Got it, continue
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PracticeQuestionPage;
