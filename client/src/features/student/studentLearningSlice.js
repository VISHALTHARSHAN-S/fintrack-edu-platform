import { createSlice } from '@reduxjs/toolkit';
import { MOCK_WISHLIST } from '../../data/mockCoursesData';

const initialState = {
  courses: [],
  enrolledCourses: [
    {
      courseId: 'c101',
      progressPercentage: 78,
      completedLessons: ['l101', 'l102'],
      lastAccessedLessonId: 'l103',
      status: 'in-progress',
      lastAccessedAt: '2 hours ago',
    },
    {
      courseId: 'c102',
      progressPercentage: 45,
      completedLessons: ['l401'],
      lastAccessedLessonId: 'l402',
      status: 'in-progress',
      lastAccessedAt: 'Yesterday',
    },
    {
      courseId: 'c103',
      progressPercentage: 100,
      completedLessons: ['l501', 'l502'],
      lastAccessedLessonId: 'l502',
      status: 'completed',
      lastAccessedAt: '3 days ago',
    },
  ],
  wishlist: MOCK_WISHLIST,
  lessonNotes: {}, // { [lessonId]: 'text' }
  isLoading: false,
  error: null,
};

export const studentLearningSlice = createSlice({
  name: 'studentLearning',
  initialState,
  reducers: {
    setCourses: (state, action) => {
      state.courses = action.payload;
    },
    setEnrolledCourses: (state, action) => {
      state.enrolledCourses = action.payload;
    },
    enrollCourse: (state, action) => {
      const courseId = action.payload;
      const existing = state.enrolledCourses.find((e) => e.courseId === courseId || e.courseId?._id === courseId);
      if (!existing) {
        state.enrolledCourses.push({
          courseId,
          progressPercentage: 0,
          completedLessons: [],
          lastAccessedLessonId: '',
          status: 'in-progress',
          lastAccessedAt: 'Just now',
        });
      }
    },
    toggleWishlist: (state, action) => {
      const courseId = action.payload;
      const index = state.wishlist.indexOf(courseId);
      if (index > -1) {
        state.wishlist.splice(index, 1);
      } else {
        state.wishlist.push(courseId);
      }
    },
    completeLesson: (state, action) => {
      const { courseId, lessonId, totalLessons } = action.payload;
      let enrollment = state.enrolledCourses.find((e) => e.courseId === courseId || e.courseId?._id === courseId);
      if (!enrollment) {
        enrollment = {
          courseId,
          progressPercentage: 0,
          completedLessons: [lessonId],
          lastAccessedLessonId: lessonId,
          status: 'in-progress',
          lastAccessedAt: 'Just now',
        };
        state.enrolledCourses.push(enrollment);
      } else {
        if (!enrollment.completedLessons.includes(lessonId)) {
          enrollment.completedLessons.push(lessonId);
        }
        enrollment.lastAccessedLessonId = lessonId;
        enrollment.lastAccessedAt = 'Just now';
      }

      const total = totalLessons || 4;
      enrollment.progressPercentage = Math.min(100, Math.round((enrollment.completedLessons.length / total) * 100));
      if (enrollment.progressPercentage >= 100) {
        enrollment.status = 'completed';
      }
    },
    saveLessonNote: (state, action) => {
      const { lessonId, text } = action.payload;
      state.lessonNotes[lessonId] = text;
    },
  },
});

export const {
  setCourses,
  setEnrolledCourses,
  enrollCourse,
  toggleWishlist,
  completeLesson,
  saveLessonNote,
} = studentLearningSlice.actions;

export default studentLearningSlice.reducer;
