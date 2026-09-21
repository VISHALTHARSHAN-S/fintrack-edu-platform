import express from 'express';
import {
  getStudentMentorConversation,
  getStudentMentorConversations,
  sendStudentMentorMessage,
} from '../controllers/studentMentorMessageController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';
import { sendStudentMentorFile } from '../controllers/mentorMessageFileController.js';
import { uploadMentorChatFile } from '../middleware/mentorChatUpload.js';

const router = express.Router();

router.use(protect, authorizeRoles('student'));
router.get('/', getStudentMentorConversations);
router.get('/:mentorId', getStudentMentorConversation);
router.post('/', sendStudentMentorMessage);
router.post('/file', uploadMentorChatFile, sendStudentMentorFile);

export default router;