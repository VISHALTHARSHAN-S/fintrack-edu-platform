import express from 'express';
import {
  getEnrolledCourses,
  enrollInCourse,
  markLessonComplete,
  getWishlist,
  toggleWishlist,
  getStudentProgressStats,
} from '../controllers/studentLearningController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply student auth guard
router.use(protect);
router.use(authorizeRoles('student'));

router.get('/enrolled', getEnrolledCourses);
router.post('/enroll', enrollInCourse);
router.post('/courses/:courseId/lessons/:lessonId/complete', markLessonComplete);
router.get('/wishlist', getWishlist);
router.post('/wishlist/toggle', toggleWishlist);
router.get('/progress-stats', getStudentProgressStats);

export default router;
