import express from 'express';
import {
  getPracticeOverview,
  startPracticeSession,
  submitPracticeSession,
} from '../controllers/practiceController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(authorizeRoles('student'));

router.get('/overview', getPracticeOverview);
router.post('/start', startPracticeSession);
router.post('/:practiceId/submit', submitPracticeSession);

export default router;
