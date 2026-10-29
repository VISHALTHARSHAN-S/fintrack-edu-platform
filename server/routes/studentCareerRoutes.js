import express from 'express';
import {
  applyToJob,
  getCareerDashboard,
  getCareerProfile,
  getStudentApplications,
  getStudentInterviews,
  getStudentJobDetails,
  getStudentJobs,
  updateCareerProfile,
} from '../controllers/studentCareerController.js';
import { authorizeRoles, protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect, authorizeRoles('student'));
router.get('/dashboard', getCareerDashboard);
router.get('/profile', getCareerProfile);
router.put('/profile', updateCareerProfile);
router.get('/jobs', getStudentJobs);
router.get('/jobs/:jobId', getStudentJobDetails);
router.post('/jobs/:jobId/apply', applyToJob);
router.get('/applications', getStudentApplications);
router.get('/interviews', getStudentInterviews);

export default router;
