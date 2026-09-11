import express from 'express';
import { getRecruiterDashboard } from '../controllers/recruiterController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(protect, authorizeRoles('recruiter'));
router.get('/dashboard', getRecruiterDashboard);

export default router;