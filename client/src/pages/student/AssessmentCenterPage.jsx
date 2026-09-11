import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileCheck,
  Clock,
  Award,
  CheckCircle2,
  AlertCircle,
  PlayCircle,
  Eye,
  Sparkles,
  Calendar,
  Layers,
} from 'lucide-react';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Tabs from '../../components/common/Tabs';
import CardSkeleton from '../../components/common/LoadingSkeleton';
import EmptyState from '../../components/common/EmptyState';
import { fetchAssessmentCenter } from '../../services/assessmentService';

const AssessmentCenterPage = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('available');

  useEffect(() => {
    let isMounted = true;
    const loadAssessments = async () => {
      setIsLoading(true);
      const res = await fetchAssessmentCenter();
      if (isMounted) {
        setData(res);
        setIsLoading(false);
      }
    };
    loadAssessments();
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

  const { available = [], upcoming = [], completed = [] } = data;

  const tabOptions = [
    { id: 'available', label: `Available (${available.length})` },
    { id: 'upcoming', label: `Upcoming (${upcoming.length})` },
    { id: 'completed', label: `Completed (${completed.length})` },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-navy-950 via-slate-900 to-brand-950 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-semibold border border-brand-500/30">
            <FileCheck className="w-3.5 h-3.5" /> FinTrack Assessment Center
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Formal FinTech Certification Exams
          </h1>
          <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
            Validate your mastery with timed assessments, earn verified skill ratings, and track your cohort percentile rankings.
          </p>
        </div>
      </div>

      {/* TABS NAVIGATION */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <Tabs tabs={tabOptions} activeTab={activeTab} onChange={setActiveTab} />
      </div>

      {/* TAB CONTENT: AVAILABLE ASSESSMENTS */}
      {activeTab === 'available' && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {available.map((asm) => (
            <div
              key={asm.assessmentId}
              className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-card-hover transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="brand" size="sm">{asm.status}</Badge>
                  <Badge variant="purple" size="sm">{asm.difficulty}</Badge>
                </div>

                <h3 className="font-bold text-slate-900 text-base leading-snug">{asm.title}</h3>
                <p className="text-xs text-slate-500 line-clamp-2">{asm.description}</p>

                <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-brand-600" /> {asm.durationMinutes} mins
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-indigo-600" /> {asm.totalQuestions} Questions
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-emerald-600" /> Pass: {asm.passingPercentage}%
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Max: {asm.totalMarks} Marks
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <Button
                  variant="secondary"
                  size="sm"
                  fullWidth
                  onClick={() => navigate(`/student/assessments/${asm.assessmentId}`)}
                >
                  View Details
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  fullWidth
                  icon={PlayCircle}
                  onClick={() => navigate(`/student/assessments/${asm.assessmentId}`)}
                >
                  Start Exam
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB CONTENT: UPCOMING ASSESSMENTS */}
      {activeTab === 'upcoming' && (
        <div className="space-y-4">
          {upcoming.length === 0 ? (
            <EmptyState title="No Upcoming Assessments" description="Check back later for scheduled cohort assessments." />
          ) : (
            upcoming.map((up) => (
              <div
                key={up.assessmentId}
                className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="warning" size="sm">UPCOMING</Badge>
                    <span className="text-xs font-semibold text-slate-500">{up.startDate}</span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-base">{up.title}</h4>
                  <p className="text-xs text-slate-500">
                    Duration: {up.durationMinutes} mins • Total Marks: {up.totalMarks} • Passing: {up.passingPercentage}%
                  </p>
                </div>
                <Button variant="secondary" size="sm" disabled>
                  Scheduled Soon
                </Button>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB CONTENT: COMPLETED ASSESSMENTS */}
      {activeTab === 'completed' && (
        <div className="space-y-4">
          {completed.length === 0 ? (
            <EmptyState title="No Completed Assessments" description="Complete an assessment from the Available tab to view your certifications." />
          ) : (
            completed.map((comp, i) => (
              <div
                key={i}
                className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant={comp.passStatus === 'PASSED' ? 'emerald' : 'danger'} size="sm">
                      {comp.passStatus}
                    </Badge>
                    <Badge variant="brand" size="sm">COMPLETED</Badge>
                  </div>
                  <h4 className="font-bold text-slate-900 text-base">{comp.title || 'FinTech Core Certification Exam'}</h4>
                  <p className="text-xs text-slate-500">
                    Score: {comp.score} / {comp.maxMarks || 100} ({comp.percentage}%)
                  </p>
                </div>

                <Button
                  variant="secondary"
                  size="sm"
                  icon={Eye}
                  onClick={() => navigate(`/student/assessments/${comp.assessmentId || 'asm_101'}/result`)}
                >
                  View Result Summary
                </Button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default AssessmentCenterPage;
