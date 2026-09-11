import express from 'express';
import {
  getRecruiterConversations,
  getRecruiterMessageHistory,
  sendRecruiterMessage,
} from '../controllers/recruiterController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(protect, authorizeRoles('recruiter'));
router.get('/', getRecruiterConversations);
router.get('/conversations', getRecruiterConversations);
router.get('/thread/:candidateId', getRecruiterMessageHistory);
router.post('/send', sendRecruiterMessage);

export default router;