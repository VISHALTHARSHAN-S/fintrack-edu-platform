import express from 'express';
import {
  getStudentDashboardData,
  getMentorDashboardData,
} from '../controllers/userController.js';
import { getRecruiterDashboard } from '../controllers/recruiterController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// Role-protected routes with RBAC middleware
router.get('/student/dashboard', protect, authorizeRoles('student'), getStudentDashboardData);
router.get('/mentor/dashboard', protect, authorizeRoles('mentor'), getMentorDashboardData);
router.get('/recruiter/dashboard', protect, authorizeRoles('recruiter'), getRecruiterDashboard);

export default router;
