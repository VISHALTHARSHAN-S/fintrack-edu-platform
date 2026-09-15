import express from 'express';
import {
  getStudentLiveClasses,
  getStudentLiveClassDetails,
  joinLiveClass,
  leaveLiveClass,
  getLiveClassRecording,
} from '../controllers/liveClassController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(authorizeRoles('student'));

router.get('/', getStudentLiveClasses);
router.get('/:classId', getStudentLiveClassDetails);
router.post('/:classId/join', joinLiveClass);
router.post('/:classId/leave', leaveLiveClass);
router.get('/:classId/recording', getLiveClassRecording);

export default router;
