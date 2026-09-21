import express from 'express';
import {
  cancelStudentMentorSession,
  getStudentMentorSession,
  getStudentMentorSessions,
  rescheduleStudentMentorSession,
} from '../controllers/studentMentorSessionController.js';
import { getStudentFeedback, submitStudentFeedback } from '../controllers/mentorFeedbackController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect, authorizeRoles('student'));
router.get('/', getStudentMentorSessions);
router.get('/:sessionId', getStudentMentorSession);
router.put('/:sessionId/cancel', cancelStudentMentorSession);
router.put('/:sessionId/reschedule', rescheduleStudentMentorSession);
router.get('/:sessionId/feedback', getStudentFeedback);
router.post('/:sessionId/feedback', submitStudentFeedback);

export default router;