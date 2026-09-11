import express from 'express';
import {
  getInterviews,
  getInterviewDetails,
  createInterview,
  updateInterview,
} from '../controllers/recruiterController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(protect, authorizeRoles('recruiter'));
router.get('/', getInterviews);
router.post('/', createInterview);
router.get('/:interviewId', getInterviewDetails);
router.put('/:interviewId', updateInterview);

export default router;