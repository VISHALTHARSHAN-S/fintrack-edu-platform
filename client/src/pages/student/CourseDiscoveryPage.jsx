import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Search,
  Filter,
  BookOpen,
  Star,
  Clock,
  Heart,
  PlayCircle,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  Layers,
} from 'lucide-react';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import ProgressBar from '../../components/common/ProgressBar';
import SearchBar from '../../components/common/SearchBar';
import Select from '../../components/common/Select';
import EmptyState from '../../components/common/EmptyState';
import CardSkeleton from '../../components/common/LoadingSkeleton';
import { fetchCourses, toggleWishlistApi } from '../../services/courseService';
import { setCourses, toggleWishlist } from '../../features/student/studentLearningSlice';

const CATEGORIES = [
  'All',
  'Quantitative Finance',
  'DeFi & Blockchain',
  'Financial AI & Analytics',
  'RegTech & Compliance',
  'Banking & Neo Banking',
  'Payments Infrastructure',
];

const DIFFICULTY_OPTIONS = [
  { value: 'All', label: 'All Difficulties' },
  { value: 'Beginner', label: 'Beginner' },
  { value: 'Intermediate', label: 'Intermediate' },
  { value: 'Advanced', label: 'Advanced' },
];

const DURATION_OPTIONS = [
  { value: 'All', label: 'All Durations' },
  { value: '< 5 hrs', label: '< 5 Hours' },
  { value: '5-10 hrs', label: '5-10 Hours' },
  { value: '10+ hrs', label: '10+ Hours' },
];

const CourseDiscoveryPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { enrolledCourses, wishlist } = useSelector((state) => state.studentLearning);

  const [courses, setCoursesState] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [selectedDuration, setSelectedDuration] = useState('All');

  useEffect(() => {
    let isMounted = true;
    const loadCourses = async () => {
      setIsLoading(true);
      const data = await fetchCourses({
        search: searchQuery,
        category: selectedCategory,
        difficulty: selectedDifficulty,
        duration: selectedDuration,
      });
      if (isMounted) {
        setCoursesState(data);
        dispatch(setCourses(data));
        setIsLoading(false);
      }
    };

    loadCourses();
    return () => {
      isMounted = false;
    };
  }, [searchQuery, selectedCategory, selectedDifficulty, selectedDuration, dispatch]);

  const handleToggleWishlist = (e, courseId) => {
    e.stopPropagation();
    dispatch(toggleWishlist(courseId));
    toggleWishlistApi(courseId);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedDifficulty('All');
    setSelectedDuration('All');
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (searchQuery) count++;
    if (selectedCategory !== 'All') count++;
    if (selectedDifficulty !== 'All') count++;
    if (selectedDuration !== 'All') count++;
    return count;
  }, [searchQuery, selectedCategory, selectedDifficulty, selectedDuration]);

  return (
    <div className="space-y-8 pb-12">
      {/* PAGE HEADER & HERO BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-navy-950 via-slate-900 to-brand-950 text-white p-6 sm:p-8 border border-slate-800 shadow-xl">
        <div className="relative z-10 space-y-3 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-semibold border border-brand-500/30">
            <Sparkles className="w-3.5 h-3.5" /> Course Catalog & FinTech Modules
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
            Explore FinTech & Quantitative Courses
          </h1>
          <p className="text-slate-300 text-sm leading-relaxed">
            Gain job-ready technical skills in Algorithmic Trading, DeFi Security, Financial Machine Learning, and Payment Infrastructures aligned with top industry benchmarks.
          </p>
        </div>
        <div className="absolute right-[-20px] bottom-[-20px] opacity-10 pointer-events-none hidden md:block">
          <BookOpen className="w-72 h-72 text-brand-400" />
        </div>
      </div>

      {/* SEARCH & FILTERS BAR */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
          {/* SEARCH INPUT */}
          <div className="flex-1">
            <SearchBar
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClear={() => setSearchQuery('')}
              placeholder="Search by course title, topic, skill, or instructor..."
              className="w-full"
            />
          </div>

          {/* DROPDOWN FILTERS */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="w-40">
              <Select
                options={DIFFICULTY_OPTIONS}
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
              />
            </div>

            <div className="w-40">
              <Select
                options={DURATION_OPTIONS}
                value={selectedDuration}
                onChange={(e) => setSelectedDuration(e.target.value)}
              />
            </div>

            {activeFilterCount > 0 && (
              <Button
                variant="ghost"
                size="md"
                onClick={handleResetFilters}
                icon={RotateCcw}
                className="text-slate-500 hover:text-slate-800"
              >
                Clear ({activeFilterCount})
              </Button>
            )}
          </div>
        </div>

        {/* CATEGORY CHIPS */}
        <div className="flex items-center gap-2 overflow-x-auto pt-2 no-scrollbar border-t border-slate-100">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider shrink-0 mr-2">
            Categories:
          </span>
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20 font-semibold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* RESULTS COUNT & HEADING */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Available Courses {courses.length > 0 && <span className="text-slate-400 text-sm font-normal">({courses.length})</span>}
          </h2>
          <p className="text-xs text-slate-500">Interactive curriculum built with hands-on code examples</p>
        </div>
      </div>

      {/* COURSE CARDS GRID */}
      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, idx) => (
            <CardSkeleton key={idx} />
          ))}
        </div>
      ) : courses.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-100 shadow-sm text-center">
          <EmptyState
            title="No courses found"
            description="We couldn't find any courses matching your current search query or filter selection."
            actionText="Clear All Filters"
            onAction={handleResetFilters}
          />
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => {
            const courseId = course._id || course.id;
            const enrollment = enrolledCourses.find((e) => e.courseId === courseId || e.courseId?._id === courseId);
            const isWishlisted = wishlist.includes(courseId);

            let status = 'Not Started';
            let progress = 0;
            if (enrollment) {
              progress = enrollment.progressPercentage || 0;
              status = progress >= 100 ? 'Completed' : 'In Progress';
            }

            return (
              <div
                key={courseId}
                onClick={() => navigate(`/student/courses/${courseId}`)}
                className="group relative bg-white rounded-3xl border border-slate-150/80 hover:border-brand-300 shadow-card hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer"
              >
                {/* THUMBNAIL CONTAINER */}
                <div className="relative h-44 w-full overflow-hidden bg-slate-900">
                  <img
                    src={course.thumbnailUrl}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

                  {/* DIFFICULTY & CATEGORY BADGES */}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
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
                  </div>

                  {/* WISHLIST BUTTON */}
                  <button
                    onClick={(e) => handleToggleWishlist(e, courseId)}
                    className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all ${
                      isWishlisted
                        ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
                        : 'bg-slate-900/60 text-slate-200 hover:bg-slate-900 hover:text-rose-400'
                    }`}
                    title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                  >
                    <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
                  </button>

                  {/* DURATION & RATING OVERLAY */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white">
                    <div className="flex items-center gap-1.5 bg-slate-900/70 px-2.5 py-1 rounded-lg backdrop-blur-xs">
                      <Clock className="w-3.5 h-3.5 text-brand-400" />
                      <span>{course.duration}</span>
                    </div>
                    <div className="flex items-center gap-1 bg-slate-900/70 px-2.5 py-1 rounded-lg backdrop-blur-xs text-amber-400 font-semibold">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span>{course.rating}</span>
                      <span className="text-slate-300 font-normal">({course.reviewsCount})</span>
                    </div>
                  </div>
                </div>

                {/* CONTENT CONTAINER */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-[11px] font-medium text-brand-600">
                      <span>{course.category}</span>
                      {status !== 'Not Started' && (
                        <Badge
                          variant={status === 'Completed' ? 'success' : 'info'}
                          size="sm"
                        >
                          {status}
                        </Badge>
                      )}
                    </div>

                    <h3 className="font-bold text-slate-900 text-base leading-snug group-hover:text-brand-600 transition-colors line-clamp-2">
                      {course.title}
                    </h3>

                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {course.description}
                    </p>
                  </div>

                  {/* INSTRUCTOR FOOTER */}
                  <div className="pt-3 border-t border-slate-100 space-y-3">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={course.instructor.avatar}
                        alt={course.instructor.name}
                        className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200"
                      />
                      <div className="truncate">
                        <p className="text-xs font-semibold text-slate-800 truncate">
                          {course.instructor.name}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate">
                          {course.instructor.title}
                        </p>
                      </div>
                    </div>

                    {/* ENROLLMENT PROGRESS BAR (IF ENROLLED) */}
                    {status !== 'Not Started' ? (
                      <div className="space-y-1">
                        <ProgressBar
                          value={progress}
                          label="Course Progress"
                          variant={status === 'Completed' ? 'emerald' : 'brand'}
                          size="xs"
                        />
                      </div>
                    ) : null}

                    {/* ACTION BUTTON */}
                    <Button
                      variant={status === 'Not Started' ? 'secondary' : 'primary'}
                      size="sm"
                      fullWidth
                      icon={status === 'Not Started' ? PlayCircle : ChevronRight}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (status === 'Not Started') {
                          navigate(`/student/courses/${courseId}`);
                        } else {
                          const firstLesson = course.modules[0]?.lessons[0]?.lessonId || 'l101';
                          const resumeLesson = enrollment?.lastAccessedLessonId || firstLesson;
                          navigate(`/student/learn/${courseId}/${resumeLesson}`);
                        }
                      }}
                      className="mt-1 font-semibold text-xs"
                    >
                      {status === 'Not Started'
                        ? 'Start Course'
                        : status === 'Completed'
                        ? 'Review Course'
                        : 'Continue Learning'}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CourseDiscoveryPage;
