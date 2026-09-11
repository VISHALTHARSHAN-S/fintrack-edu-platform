import express from 'express';
import {
  getExamsAndAssignments,
  submitAssignment,
} from '../controllers/examAssignmentController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(authorizeRoles('student'));

router.get('/', getExamsAndAssignments);
router.post('/assignments/:assignmentId/submit', submitAssignment);

export default router;
