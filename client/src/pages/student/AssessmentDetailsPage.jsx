import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FileCheck,
  Clock,
  Award,
  CheckCircle2,
  AlertTriangle,
  Play,
  ArrowLeft,
  BookOpen,
  Sparkles,
} from 'lucide-react';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import CardSkeleton from '../../components/common/LoadingSkeleton';
import { fetchAssessmentDetails } from '../../services/assessmentService';

const AssessmentDetailsPage = () => {
  const { assessmentId } = useParams();
  const navigate = useNavigate();

  const [assessment, setAssessment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showStartModal, setShowStartModal] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const loadDetails = async () => {
      setIsLoading(true);
      const data = await fetchAssessmentDetails(assessmentId);
      if (isMounted) {
        setAssessment(data);
        setIsLoading(false);
      }
    };
    loadDetails();
    return () => {
      isMounted = false;
    };
  }, [assessmentId]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 py-6">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16 pt-2">
      {/* BACK BUTTON */}
      <button
        onClick={() => navigate('/student/assessments')}
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-brand-600 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Assessment Center
      </button>

      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-navy-950 via-slate-900 to-indigo-950 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Badge variant="brand" size="sm">AVAILABLE</Badge>
          <Badge variant="purple" size="sm">{assessment.difficulty || 'Intermediate'}</Badge>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{assessment.title}</h1>
        <p className="text-slate-300 text-sm leading-relaxed">{assessment.description}</p>
      </div>

      {/* KEY METRICS SPECIFICATIONS GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-card">
          <div className="flex items-center gap-2 text-brand-600 mb-1">
            <Clock className="w-4 h-4" /> <span className="text-xs font-semibold text-slate-500">Duration</span>
          </div>
          <p className="text-xl font-bold text-slate-900">{assessment.durationMinutes} Minutes</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-card">
          <div className="flex items-center gap-2 text-indigo-600 mb-1">
            <BookOpen className="w-4 h-4" /> <span className="text-xs font-semibold text-slate-500">Questions</span>
          </div>
          <p className="text-xl font-bold text-slate-900">{assessment.totalQuestions} Questions</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-card">
          <div className="flex items-center gap-2 text-emerald-600 mb-1">
            <Award className="w-4 h-4" /> <span className="text-xs font-semibold text-slate-500">Passing Score</span>
          </div>
          <p className="text-xl font-bold text-slate-900">{assessment.passingPercentage}% Minimum</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-card">
          <div className="flex items-center gap-2 text-amber-500 mb-1">
            <Sparkles className="w-4 h-4" /> <span className="text-xs font-semibold text-slate-500">Total Marks</span>
          </div>
          <p className="text-xl font-bold text-slate-900">{assessment.totalMarks} Marks</p>
        </div>
      </div>

      {/* INSTRUCTIONS & SYLLABUS CARD */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
        <div className="space-y-4">
          <h3 className="font-bold text-slate-900 text-base border-b border-slate-100 pb-3">
            Exam Instructions & Guidelines
          </h3>
          <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700">
            {assessment.instructions?.map((inst, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                <span>{inst}</span>
              </li>
            )) || (
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                <span>Answer all questions within the allocated time. Submit when finished.</span>
              </li>
            )}
          </ul>
        </div>

        {/* TOPICS COVERED */}
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <h4 className="font-semibold text-slate-900 text-xs uppercase tracking-wider text-slate-500">
            Topics Covered in Exam
          </h4>
          <div className="flex flex-wrap gap-2">
            {assessment.topicsCovered?.map((topic, i) => (
              <Badge key={i} variant="brand" size="md">
                {topic}
              </Badge>
            ))}
          </div>
        </div>

        {/* PROMINENT START ASSESSMENT CTA */}
        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-xs text-slate-500">
            Ensure you have a stable network connection before starting.
          </div>
          <Button
            variant="primary"
            size="lg"
            icon={Play}
            onClick={() => setShowStartModal(true)}
            className="w-full sm:w-auto px-8 bg-brand-600 hover:bg-brand-500 shadow-lg shadow-brand-500/20"
          >
            Start Assessment Exam
          </Button>
        </div>
      </div>

      {/* CONFIRMATION DIALOG MODAL */}
      <ConfirmDialog
        isOpen={showStartModal}
        onClose={() => setShowStartModal(false)}
        onConfirm={() => navigate(`/student/assessments/${assessmentId}/start`)}
        title="Begin Timed Assessment Exam?"
        message={`You are about to start "${assessment.title}". The ${assessment.durationMinutes}-minute countdown timer will begin immediately upon confirmation.`}
        confirmText="Confirm & Start Exam"
        cancelText="Review Instructions"
        type="info"
      />
    </div>
  );
};

export default AssessmentDetailsPage;
