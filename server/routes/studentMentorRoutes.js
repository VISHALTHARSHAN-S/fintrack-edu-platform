import express from 'express';
import {
  getRecommendedStudentMentors,
  getStudentMentorProfile,
  getStudentMentors,
  getStudentMentorAvailability,
  bookStudentMentorSession,
} from '../controllers/studentMentorController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect, authorizeRoles('student'));
router.get('/recommended', getRecommendedStudentMentors);
router.get('/:mentorId/availability', getStudentMentorAvailability);
router.post('/:mentorId/book', bookStudentMentorSession);
router.get('/:mentorId', getStudentMentorProfile);
router.get('/', getStudentMentors);

export default router;