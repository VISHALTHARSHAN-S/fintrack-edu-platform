import express from 'express';
import { getCourses, getCourseById, getLearningPath } from '../controllers/courseController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public / Authenticated discovery routes
router.get('/', getCourses);
router.get('/learning-path', getLearningPath);
router.get('/:courseId', getCourseById);

export default router;
