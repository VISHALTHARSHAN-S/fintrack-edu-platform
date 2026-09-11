import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  BookOpen,
  Star,
  Clock,
  CheckCircle2,
  PlayCircle,
  FileText,
  Heart,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  Sparkles,
  Users,
  Award,
  Layers,
  ShieldCheck,
} from 'lucide-react';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import ProgressBar from '../../components/common/ProgressBar';
import CardSkeleton from '../../components/common/LoadingSkeleton';
import { fetchCourseById, enrollInCourse, toggleWishlistApi } from '../../services/courseService';
import { enrollCourse, toggleWishlist } from '../../features/student/studentLearningSlice';

const CourseDetailsPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { enrolledCourses, wishlist } = useSelector((state) => state.studentLearning);

  const [course, setCourse] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedModules, setExpandedModules] = useState({});

  useEffect(() => {
    let isMounted = true;
    const loadCourse = async () => {
      setIsLoading(true);
      const data = await fetchCourseById(courseId);
      if (isMounted) {
        setCourse(data);
        // Expand first module by default
        if (data && data.modules && data.modules.length > 0) {
          setExpandedModules({ [data.modules[0].moduleId]: true });
        }
        setIsLoading(false);
      }
    };

    loadCourse();
    return () => {
      isMounted = false;
    };
  }, [courseId]);

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto py-6">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="bg-white p-12 rounded-3xl text-center space-y-4 border border-slate-100">
        <h2 className="text-xl font-bold text-slate-900">Course Not Found</h2>
        <Button variant="primary" onClick={() => navigate('/student/courses')}>
          Back to Course Discovery
        </Button>
      </div>
    );
  }

  const cid = course._id || course.id;
  const enrollment = enrolledCourses.find((e) => e.courseId === cid || e.courseId?._id === cid);
  const isWishlisted = wishlist.includes(cid);

  const isEnrolled = Boolean(enrollment);
  const progress = enrollment?.progressPercentage || 0;
  const completedLessons = enrollment?.completedLessons || [];

  const totalLessons = course.modules.reduce((acc, m) => acc + m.lessons.length, 0);
  const remainingLessonsCount = Math.max(0, totalLessons - completedLessons.length);

  const toggleModuleAccordion = (modId) => {
    setExpandedModules((prev) => ({
      ...prev,
      [modId]: !prev[modId],
    }));
  };

  const handleEnrollOrContinue = async () => {
    if (!isEnrolled) {
      dispatch(enrollCourse(cid));
      await enrollInCourse(cid);
    }
    const firstLessonId = course.modules[0]?.lessons[0]?.lessonId || 'l101';
    const targetLesson = enrollment?.lastAccessedLessonId || firstLessonId;
    navigate(`/student/learn/${cid}/${targetLesson}`);
  };

  const handleWishlistToggle = (e) => {
    e.stopPropagation();
    dispatch(toggleWishlist(cid));
    toggleWishlistApi(cid);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* BREADCRUMB & BACK BUTTON */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/student/courses')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Courses
        </button>

        <button
          onClick={handleWishlistToggle}
          className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
            isWishlisted
              ? 'bg-rose-50 text-rose-600 border border-rose-200'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current text-rose-500' : ''}`} />
          {isWishlisted ? 'Wishlisted' : 'Add to Wishlist'}
        </button>
      </div>

      {/* HERO BANNER CARD */}
      <div className="bg-navy-950 text-white rounded-3xl p-6 sm:p-10 border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 grid lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="brand" size="sm">
                {course.category}
              </Badge>
              <Badge
                variant={
                  course.difficulty === 'Beginner'
                    ? 'success'
                    : course.difficulty === 'Intermediate'
                    ? 'brand'
                    : 'purple'
                }
                size="sm"
              >
                {course.difficulty}
              </Badge>
              <div className="flex items-center gap-1 text-amber-400 text-xs font-semibold ml-2">
                <Star className="w-4 h-4 fill-current" />
                <span>{course.rating}</span>
                <span className="text-slate-400 font-normal">({course.reviewsCount} reviews)</span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-white leading-tight">
              {course.title}
            </h1>

            <p className="text-slate-300 text-sm leading-relaxed max-w-2xl">
              {course.description}
            </p>

            {/* INSTRUCTOR META */}
            <div className="flex items-center gap-3 pt-2">
              <img
                src={course.instructor.avatar}
                alt={course.instructor.name}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-brand-500/40"
              />
              <div>
                <p className="text-xs font-semibold text-white">{course.instructor.name}</p>
                <p className="text-[11px] text-slate-400">{course.instructor.title}</p>
              </div>
            </div>

            {/* STATS METRICS ROW */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-800 max-w-lg text-xs text-slate-300">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase tracking-wider font-semibold">Duration</span>
                <span className="font-semibold text-white flex items-center gap-1.5 mt-0.5">
                  <Clock className="w-3.5 h-3.5 text-brand-400" /> {course.duration}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase tracking-wider font-semibold">Curriculum</span>
                <span className="font-semibold text-white flex items-center gap-1.5 mt-0.5">
                  <Layers className="w-3.5 h-3.5 text-indigo-400" /> {course.modules.length} Modules ({totalLessons} Lessons)
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase tracking-wider font-semibold">Enrolled</span>
                <span className="font-semibold text-white flex items-center gap-1.5 mt-0.5">
                  <Users className="w-3.5 h-3.5 text-emerald-400" /> {course.enrolledCount}+ Students
                </span>
              </div>
            </div>
          </div>

          {/* ENROLLMENT ACTION CARD */}
          <div className="lg:col-span-4 bg-white text-slate-900 rounded-2xl p-6 shadow-xl border border-slate-100 space-y-5">
            <div className="relative rounded-xl overflow-hidden h-40 bg-slate-900 mb-2">
              <img
                src={course.thumbnailUrl}
                alt={course.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-brand-600/90 text-white flex items-center justify-center shadow-lg cursor-pointer hover:scale-110 transition-transform">
                  <PlayCircle className="w-7 h-7 fill-white/20" />
                </div>
              </div>
            </div>

            {isEnrolled ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <span>Enrolled Course</span>
                    <span className="text-brand-600 font-bold">{progress}% Complete</span>
                  </div>
                  <ProgressBar value={progress} variant={progress >= 100 ? 'emerald' : 'brand'} size="md" />
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs space-y-1.5 text-slate-600">
                  <div className="flex justify-between">
                    <span>Completed Lessons:</span>
                    <span className="font-bold text-slate-900">{completedLessons.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Remaining Lessons:</span>
                    <span className="font-bold text-slate-900">{remainingLessonsCount}</span>
                  </div>
                </div>

                <Button
                  variant="primary"
                  fullWidth
                  size="md"
                  icon={PlayCircle}
                  onClick={handleEnrollOrContinue}
                  className="font-bold py-3 text-sm shadow-md shadow-brand-600/30"
                >
                  {progress >= 100 ? 'Review Course' : 'Continue Learning'}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-center space-y-1">
                  <span className="inline-block px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
                    Free Access with Student Account
                  </span>
                  <p className="text-xs text-slate-500 pt-1">Gain instant lifetime access to all course modules</p>
                </div>

                <Button
                  variant="primary"
                  fullWidth
                  size="md"
                  icon={PlayCircle}
                  onClick={handleEnrollOrContinue}
                  className="font-bold py-3 text-sm shadow-md shadow-brand-600/30"
                >
                  Enroll Now
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MAIN CONTENT GRID */}
      <div className="grid lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN: Overview, Outcomes & Curriculum */}
        <div className="lg:col-span-8 space-y-8">
          {/* LEARNING OUTCOMES */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-5">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-brand-600" /> What You Will Learn
            </h2>

            <div className="grid sm:grid-cols-2 gap-3">
              {course.outcomes.map((outcome, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-xs text-slate-700 font-medium leading-relaxed">{outcome}</span>
                </div>
              ))}
            </div>
          </div>

          {/* COURSE CURRICULUM */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Course Curriculum</h2>
                <p className="text-xs text-slate-500">
                  {course.modules.length} Modules • {totalLessons} Lessons
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {course.modules.map((module) => {
                const isExpanded = Boolean(expandedModules[module.moduleId]);
                const modCompletedLessons = module.lessons.filter((l) => completedLessons.includes(l.lessonId)).length;

                return (
                  <div
                    key={module.moduleId}
                    className="border border-slate-200 rounded-2xl overflow-hidden transition-all bg-white"
                  >
                    {/* MODULE HEADER ACCORDION */}
                    <button
                      onClick={() => toggleModuleAccordion(module.moduleId)}
                      className="w-full flex items-center justify-between p-4 sm:p-5 bg-slate-50/80 hover:bg-slate-100/80 transition-colors text-left"
                    >
                      <div className="space-y-1">
                        <h3 className="font-semibold text-slate-900 text-sm">{module.title}</h3>
                        <p className="text-xs text-slate-500 flex items-center gap-3">
                          <span>{module.lessons.length} Lessons ({module.duration})</span>
                          {isEnrolled && (
                            <span className="text-brand-600 font-medium">
                              {modCompletedLessons}/{module.lessons.length} Completed
                            </span>
                          )}
                        </p>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-slate-400" />
                      )}
                    </button>

                    {/* LESSONS LIST */}
                    {isExpanded && (
                      <div className="divide-y divide-slate-100 bg-white">
                        {module.lessons.map((lesson) => {
                          const isDone = completedLessons.includes(lesson.lessonId);
                          return (
                            <div
                              key={lesson.lessonId}
                              onClick={() => {
                                if (isEnrolled) {
                                  navigate(`/student/learn/${cid}/${lesson.lessonId}`);
                                } else {
                                  handleEnrollOrContinue();
                                }
                              }}
                              className="p-4 flex items-center justify-between hover:bg-brand-50/30 transition-colors cursor-pointer group"
                            >
                              <div className="flex items-center gap-3">
                                {isDone ? (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                ) : lesson.type === 'video' ? (
                                  <PlayCircle className="w-4 h-4 text-slate-400 group-hover:text-brand-600 shrink-0" />
                                ) : (
                                  <FileText className="w-4 h-4 text-slate-400 group-hover:text-brand-600 shrink-0" />
                                )}
                                <div>
                                  <p className={`text-xs font-medium transition-colors ${isDone ? 'text-slate-600 line-through' : 'text-slate-900 group-hover:text-brand-600'}`}>
                                    {lesson.title}
                                  </p>
                                  <span className="text-[10px] text-slate-400 capitalize">
                                    {lesson.type} • {lesson.duration}
                                  </span>
                                </div>
                              </div>

                              <span className="text-xs font-semibold text-brand-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                {isEnrolled ? 'Open' : 'Enroll to View'}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Instructor Info & Certification */}
        <div className="lg:col-span-4 space-y-8">
          {/* INSTRUCTOR CARD */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              About the Instructor
            </h3>

            <div className="flex items-center gap-3">
              <img
                src={course.instructor.avatar}
                alt={course.instructor.name}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-brand-100"
              />
              <div>
                <h4 className="font-bold text-slate-900 text-sm">{course.instructor.name}</h4>
                <p className="text-xs text-slate-500">{course.instructor.title}</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Veteran Quantitative Specialist with over 10 years of experience designing market infrastructure algorithms and automated financial software systems.
            </p>
          </div>

          {/* VERIFIED SKILL BADGE PREVIEW */}
          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200/80 space-y-3">
            <div className="flex items-center gap-2 text-brand-600">
              <ShieldCheck className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider">Naan Mudhalvan Verified</span>
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Industry Aligned Certification</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Completing this course contributes directly to your FinTrack Skill Passport and verified recruiter candidate score.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailsPage;
