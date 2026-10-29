import express from 'express';
import {
  getStudentSkillDetails,
  getStudentSkillSummary,
} from '../controllers/studentSkillController.js';
import { authorizeRoles, protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect, authorizeRoles('student'));

router.get('/', getStudentSkillSummary);
router.get('/:skillId', getStudentSkillDetails);

export default router;
