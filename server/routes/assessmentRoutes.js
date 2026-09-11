import express from 'express';
import {
  getAssessmentCenter,
  getAssessmentDetails,
  startAssessmentAttempt,
  submitAssessmentAttempt,
} from '../controllers/assessmentController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(authorizeRoles('student'));

router.get('/', getAssessmentCenter);
router.get('/:assessmentId', getAssessmentDetails);
router.post('/:assessmentId/start', startAssessmentAttempt);
router.post('/:assessmentId/submit', submitAssessmentAttempt);

export default router;
