import express from 'express';
import { getApplications, updateApplicationStatus } from '../controllers/jobApplicationController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(protect, authorizeRoles('recruiter'));
router.get('/', getApplications);
router.put('/:applicationId/status', updateApplicationStatus);

export default router;