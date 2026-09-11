import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Compass,
  CheckCircle2,
  Lock,
  PlayCircle,
  ChevronDown,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Award,
} from 'lucide-react';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import ProgressBar from '../../components/common/ProgressBar';
import CardSkeleton from '../../components/common/LoadingSkeleton';
import { fetchLearningPath } from '../../services/courseService';

const LearningPathPage = () => {
  const navigate = useNavigate();
  const [stages, setStages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadPath = async () => {
      setIsLoading(true);
      const data = await fetchLearningPath();
      if (isMounted) {
        setStages(data);
        setIsLoading(false);
      }
    };
    loadPath();
    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6 py-6 max-w-4xl mx-auto">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16 max-w-5xl mx-auto">
      {/* HEADER HERO */}
      <div className="bg-gradient-to-r from-navy-950 via-slate-900 to-brand-950 text-white p-6 sm:p-10 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-semibold border border-brand-500/30">
            <Compass className="w-3.5 h-3.5" /> Naan Mudhalvan Structured Curriculum
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white">FinTech Career Learning Journey</h1>
          <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
            Follow a structured roadmap from fundamental financial systems to quantitative analytics and career placement readiness.
          </p>
        </div>
      </div>

      {/* ROADMAP STAGES VERTICAL TIMELINE */}
      <div className="relative space-y-6 before:absolute before:inset-0 before:left-8 sm:before:left-12 before:w-1 before:bg-slate-200">
        {stages.map((stage, index) => {
          const isCompleted = stage.status === 'Completed';
          const isInProgress = stage.status === 'In Progress';
          const isLocked = stage.status === 'Locked';

          return (
            <div key={stage.id} className="relative flex items-start gap-6 sm:gap-8 group">
              {/* TIMELINE ICON NODE */}
              <div
                className={`relative z-10 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center font-bold text-lg transition-transform duration-300 shrink-0 shadow-lg ${
                  isCompleted
                    ? 'bg-emerald-500 text-white shadow-emerald-500/20 ring-4 ring-emerald-100'
                    : isInProgress
                    ? 'bg-brand-600 text-white shadow-brand-600/30 ring-4 ring-brand-100 animate-pulse'
                    : 'bg-slate-200 text-slate-500 ring-4 ring-slate-100'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-8 h-8" />
                ) : isLocked ? (
                  <Lock className="w-7 h-7 text-slate-400" />
                ) : (
                  <Sparkles className="w-7 h-7" />
                )}
              </div>

              {/* STAGE CONTENT CARD */}
              <div
                className={`flex-1 p-6 sm:p-8 rounded-3xl border transition-all duration-300 ${
                  isInProgress
                    ? 'bg-white border-brand-400 shadow-xl ring-1 ring-brand-200'
                    : isCompleted
                    ? 'bg-white border-slate-200 shadow-sm hover:shadow-md'
                    : 'bg-slate-50/70 border-slate-200 opacity-80'
                }`}
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                      Stage 0{stage.id}
                    </span>
                    <Badge
                      variant={isCompleted ? 'success' : isInProgress ? 'brand' : 'default'}
                      size="sm"
                    >
                      {stage.status}
                    </Badge>
                  </div>
                  {isInProgress && (
                    <span className="text-xs font-bold text-brand-600">Current Active Stage</span>
                  )}
                </div>

                <h3 className="text-xl font-extrabold text-slate-900 mb-2">{stage.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">{stage.description}</p>

                {/* PROGRESS BAR */}
                <div className="space-y-1.5 mb-5">
                  <div className="flex justify-between text-xs font-semibold text-slate-600">
                    <span>Stage Completion</span>
                    <span className={isCompleted ? 'text-emerald-600' : 'text-brand-600'}>
                      {stage.progress}%
                    </span>
                  </div>
                  <ProgressBar
                    value={stage.progress}
                    variant={isCompleted ? 'emerald' : 'brand'}
                    size="sm"
                  />
                </div>

                {/* ASSOCIATED COURSES & CTA */}
                <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase">
                      Curriculum Courses:
                    </span>
                    <ul className="text-xs font-semibold text-slate-800 space-y-1">
                      {stage.courses.map((cName, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                          {cName}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {!isLocked && (
                    <Button
                      variant={isCompleted ? 'secondary' : 'primary'}
                      size="sm"
                      icon={PlayCircle}
                      onClick={() => {
                        if (stage.courseId) {
                          navigate(`/student/courses/${stage.courseId}`);
                        } else {
                          navigate('/student/courses');
                        }
                      }}
                      className="shrink-0"
                    >
                      {isCompleted ? 'Review Stage' : 'Launch Next Course'}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LearningPathPage;
