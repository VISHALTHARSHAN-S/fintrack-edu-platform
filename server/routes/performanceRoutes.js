import express from 'express';
import { getStudentPerformance } from '../controllers/performanceController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(authorizeRoles('student'));

router.get('/', getStudentPerformance);

export default router;
