import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  FileText,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Upload,
  Eye,
  Send,
  BookOpen,
} from 'lucide-react';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Tabs from '../../components/common/Tabs';
import Modal from '../../components/common/Modal';
import CardSkeleton from '../../components/common/LoadingSkeleton';
import EmptyState from '../../components/common/EmptyState';
import { fetchExamsAndAssignments, submitAssignmentApi } from '../../services/academicService';

const ExamsAndAssignmentsPage = () => {
  const location = useLocation();
  const initialTab = location.pathname.includes('assignments') ? 'assignments' : 'exams';

  const [activeTab, setActiveTab] = useState(initialTab);
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Modal states for assignment submission & feedback view
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [submissionText, setSubmissionText] = useState('');
  const [fileName, setFileName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const loadAcademicData = async () => {
      setIsLoading(true);
      const res = await fetchExamsAndAssignments();
      if (isMounted) {
        setData(res);
        setIsLoading(false);
      }
    };
    loadAcademicData();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleOpenSubmit = (asg) => {
    setSelectedAssignment(asg);
    setSubmissionText('');
    setFileName('');
    setShowSubmitModal(true);
  };

  const handleOpenFeedback = (asg) => {
    setSelectedAssignment(asg);
    setShowFeedbackModal(true);
  };

  const handleSubmitAssignmentForm = async (e) => {
    e.preventDefault();
    if (!submissionText.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await submitAssignmentApi(selectedAssignment.assignmentId, {
        content: submissionText,
        attachmentName: fileName || 'fintrack_solution.pdf',
      });

      // Update local assignment state to reflect mock submission
      setData((prev) => ({
        ...prev,
        assignments: prev.assignments.map((a) =>
          a.assignmentId === selectedAssignment.assignmentId
            ? { ...a, submissionStatus: 'Submitted', marks: res.data?.marks || 92, feedback: res.data?.feedback || 'Evaluated successfully' }
            : a
        ),
      }));

      setShowSubmitModal(false);
    } catch (err) {
      console.error('Error submitting assignment:', err);
    } finally {
      setIsSubmitting(false);
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

  const { exams = [], assignments = [] } = data;

  const tabOptions = [
    { id: 'exams', label: `Exams Schedule (${exams.length})` },
    { id: 'assignments', label: `Course Assignments (${assignments.length})` },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-navy-950 via-slate-900 to-indigo-950 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-semibold border border-brand-500/30">
            <FileText className="w-3.5 h-3.5" /> Academic Evaluation Center
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Exams & Course Assignments
          </h1>
          <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
            Manage your academic exam schedules, submit course project deliverables, and track evaluation scores.
          </p>
        </div>
      </div>

      {/* TABS NAVIGATION */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <Tabs tabs={tabOptions} activeTab={activeTab} onChange={setActiveTab} />
      </div>

      {/* EXAMS SCHEDULE TAB */}
      {activeTab === 'exams' && (
        <div className="space-y-4">
          {exams.map((ex) => (
            <div
              key={ex.examId}
              className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant={ex.status === 'Upcoming' ? 'warning' : 'emerald'} size="sm">
                    {ex.status}
                  </Badge>
                  <span className="text-xs font-medium text-slate-500">{ex.course}</span>
                </div>
                <h4 className="font-bold text-slate-900 text-base">{ex.title}</h4>
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-brand-600" /> {new Date(ex.date).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-indigo-600" /> {ex.duration}
                  </span>
                  <span className="font-semibold text-slate-800">Result: {ex.resultStatus}</span>
                </div>
              </div>

              <Button
                variant={ex.status === 'Upcoming' ? 'primary' : 'secondary'}
                size="sm"
                disabled={ex.status !== 'Upcoming'}
              >
                {ex.status === 'Upcoming' ? 'View Schedule' : 'Exam Completed'}
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* ASSIGNMENTS TAB */}
      {activeTab === 'assignments' && (
        <div className="space-y-4">
          {assignments.map((asg) => {
            const isSubmitted = asg.submissionStatus === 'Submitted';

            return (
              <div
                key={asg.assignmentId}
                className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-2 max-w-xl">
                  <div className="flex items-center gap-2">
                    <Badge variant={isSubmitted ? 'emerald' : 'amber'} size="sm">
                      {asg.submissionStatus}
                    </Badge>
                    <span className="text-xs font-medium text-slate-500">{asg.courseOrTopic}</span>
                  </div>

                  <h4 className="font-bold text-slate-900 text-base">{asg.title}</h4>
                  <p className="text-xs text-slate-600 line-clamp-2">{asg.description}</p>

                  <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
                    <span>Due: {new Date(asg.dueDate).toLocaleDateString()}</span>
                    <span>Max Marks: {asg.maxMarks}</span>
                    {asg.marks !== null && (
                      <span className="font-bold text-emerald-600">Grade: {asg.marks}/{asg.maxMarks}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {isSubmitted ? (
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={Eye}
                      onClick={() => handleOpenFeedback(asg)}
                    >
                      View Feedback
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      size="sm"
                      icon={Upload}
                      onClick={() => handleOpenSubmit(asg)}
                    >
                      Submit Assignment
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MOCK ASSIGNMENT SUBMISSION MODAL */}
      <Modal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        title={`Submit: ${selectedAssignment?.title || 'Assignment'}`}
        size="lg"
      >
        <form onSubmit={handleSubmitAssignmentForm} className="space-y-4">
          <div className="p-4 rounded-2xl bg-brand-50 border border-brand-100 space-y-1">
            <h5 className="font-bold text-xs text-brand-900">Instructions:</h5>
            <p className="text-xs text-slate-700">{selectedAssignment?.instructions}</p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700">Submission Content / Payload Text</label>
            <textarea
              rows={5}
              required
              placeholder="Paste your JSON payload, structured code, or executive summary here..."
              value={submissionText}
              onChange={(e) => setSubmissionText(e.target.value)}
              className="w-full p-3 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 font-mono"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700">Attachment File Name (Mock Upload)</label>
            <input
              type="text"
              placeholder="e.g. pacs008_payment_payload.json"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              className="w-full p-2.5 text-xs border border-slate-200 rounded-xl"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="secondary" size="sm" onClick={() => setShowSubmitModal(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              icon={Send}
              isLoading={isSubmitting}
            >
              Submit Assignment
            </Button>
          </div>
        </form>
      </Modal>

      {/* FEEDBACK VIEW MODAL */}
      <Modal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        title="Assignment Evaluation & Feedback"
        size="md"
      >
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-800">Evaluated Score</span>
              <span className="text-lg font-black text-emerald-900">
                {selectedAssignment?.marks || 92} / {selectedAssignment?.maxMarks || 100}
              </span>
            </div>
            <p className="text-xs text-slate-700">
              <span className="font-bold">Feedback: </span>
              {selectedAssignment?.feedback || 'Great submission! Good understanding of parameters.'}
            </p>
          </div>

          <div className="flex justify-end">
            <Button variant="primary" size="sm" onClick={() => setShowFeedbackModal(false)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ExamsAndAssignmentsPage;
