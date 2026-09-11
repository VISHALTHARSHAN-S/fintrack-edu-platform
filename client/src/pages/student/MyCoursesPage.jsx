import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  BookOpen,
  Clock,
  PlayCircle,
  CheckCircle2,
  Heart,
  ChevronRight,
  Sparkles,
  Layers,
  Star,
} from 'lucide-react';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import ProgressBar from '../../components/common/ProgressBar';
import Tabs from '../../components/common/Tabs';
import EmptyState from '../../components/common/EmptyState';
import { fetchCourses, toggleWishlistApi } from '../../services/courseService';
import { toggleWishlist } from '../../features/student/studentLearningSlice';

const MyCoursesPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { enrolledCourses, wishlist, courses } = useSelector((state) => state.studentLearning);
  const [activeTab, setActiveTab] = useState('all');

  const handleToggleWishlist = (e, courseId) => {
    e.stopPropagation();
    dispatch(toggleWishlist(courseId));
    toggleWishlistApi(courseId);
  };

  // Build array of course cards based on activeTab
  const allCourseList = courses && courses.length > 0 ? courses : [];

  let displayedCourses = [];

  if (activeTab === 'all') {
    displayedCourses = enrolledCourses.map((enr) => {
      const c = allCourseList.find((item) => (item._id || item.id) === (enr.courseId?._id || enr.courseId)) || enr.courseId;
      return { ...c, enrollment: enr };
    });
  } else if (activeTab === 'in-progress') {
    displayedCourses = enrolledCourses
      .filter((enr) => (enr.progressPercentage || 0) < 100)
      .map((enr) => {
        const c = allCourseList.find((item) => (item._id || item.id) === (enr.courseId?._id || enr.courseId)) || enr.courseId;
        return { ...c, enrollment: enr };
      });
  } else if (activeTab === 'completed') {
    displayedCourses = enrolledCourses
      .filter((enr) => (enr.progressPercentage || 0) >= 100)
      .map((enr) => {
        const c = allCourseList.find((item) => (item._id || item.id) === (enr.courseId?._id || enr.courseId)) || enr.courseId;
        return { ...c, enrollment: enr };
      });
  } else if (activeTab === 'wishlist') {
    displayedCourses = wishlist.map((id) => {
      const c = allCourseList.find((item) => (item._id || item.id) === id);
      const enr = enrolledCourses.find((e) => (e.courseId?._id || e.courseId) === id);
      return { ...c, enrollment: enr };
    }).filter(Boolean);
  }

  return (
    <div className="space-y-8 pb-12">
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 text-brand-600 text-xs font-semibold mb-2">
            <BookOpen className="w-3.5 h-3.5" /> My Learning Dashboard
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">My Courses</h1>
          <p className="text-xs text-slate-500">Track your enrolled courses, active progress, and saved wishlist</p>
        </div>

        <Button variant="primary" size="md" icon={Sparkles} onClick={() => navigate('/student/courses')}>
          Explore More Courses
        </Button>
      </div>

      {/* FILTER TABS */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
        <Tabs
          tabs={[
            { id: 'all', label: `All Enrolled (${enrolledCourses.length})` },
            { id: 'in-progress', label: `In Progress (${enrolledCourses.filter((e) => e.progressPercentage < 100).length})` },
            { id: 'completed', label: `Completed (${enrolledCourses.filter((e) => e.progressPercentage >= 100).length})` },
            { id: 'wishlist', label: `Wishlist (${wishlist.length})` },
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
        />

        {/* COURSES LIST GRID */}
        {displayedCourses.length === 0 ? (
          <div className="py-8">
            <EmptyState
              title={
                activeTab === 'wishlist'
                  ? 'Your wishlist is empty'
                  : activeTab === 'completed'
                  ? 'No completed courses yet'
                  : 'No active courses in this view'
              }
              description={
                activeTab === 'wishlist'
                  ? 'Browse the course discovery catalog to add courses to your wishlist.'
                  : 'Start learning today to build your FinTech credentials.'
              }
              actionText="Browse Courses"
              onAction={() => navigate('/student/courses')}
            />
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedCourses.map((item) => {
              if (!item) return null;
              const courseId = item._id || item.id || item.slug;
              const enrollment = item.enrollment;
              const progress = enrollment?.progressPercentage || 0;
              const isWishlisted = wishlist.includes(courseId);
              const isDone = progress >= 100;

              return (
                <div
                  key={courseId}
                  onClick={() => navigate(`/student/courses/${courseId}`)}
                  className="group bg-white rounded-3xl border border-slate-150/80 hover:border-brand-300 shadow-card hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer"
                >
                  <div className="relative h-40 w-full overflow-hidden bg-slate-900">
                    <img
                      src={item.thumbnailUrl || 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80'}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

                    <div className="absolute top-3 left-3">
                      <Badge variant={isDone ? 'success' : enrollment ? 'info' : 'brand'} size="sm">
                        {isDone ? 'Completed' : enrollment ? 'In Progress' : item.category || 'FinTech'}
                      </Badge>
                    </div>

                    <button
                      onClick={(e) => handleToggleWishlist(e, courseId)}
                      className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all ${
                        isWishlisted
                          ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
                          : 'bg-slate-900/60 text-slate-200 hover:bg-slate-900 hover:text-rose-400'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
                    </button>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <h3 className="font-bold text-slate-900 text-base leading-snug group-hover:text-brand-600 transition-colors line-clamp-2">
                        {item.title}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 space-y-3">
                      {enrollment && (
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-[11px] font-semibold text-slate-600">
                            <span>Last accessed {enrollment.lastAccessedAt || 'recently'}</span>
                            <span className="text-brand-600 font-bold">{progress}%</span>
                          </div>
                          <ProgressBar value={progress} variant={isDone ? 'emerald' : 'brand'} size="xs" />
                        </div>
                      )}

                      <Button
                        variant={isDone ? 'secondary' : 'primary'}
                        size="sm"
                        fullWidth
                        icon={PlayCircle}
                        onClick={(e) => {
                          e.stopPropagation();
                          const firstLesson = item.modules?.[0]?.lessons?.[0]?.lessonId || 'l101';
                          const targetLesson = enrollment?.lastAccessedLessonId || firstLesson;
                          navigate(`/student/learn/${courseId}/${targetLesson}`);
                        }}
                      >
                        {isDone ? 'Review Course' : enrollment ? 'Continue Learning' : 'Start Course'}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyCoursesPage;
