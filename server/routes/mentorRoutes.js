import express from 'express';
import {
  getMentorDashboard,
  getMentorStudents,
  getStudent360Details,
  getMentorConnectWorkspace,
  updateMentorshipRequest,
  getMentorProfile,
  updateMentorProfile,
  getMentorAvailability,
  updateMentorAvailability,
} from '../controllers/mentorController.js';
import {
  getMentorSessions,
  getSessionDetails,
  createSession,
  updateSessionStatus,
} from '../controllers/mentorSessionController.js';
import {
  getConversations,
  getMessageHistory,
  sendMessage,
} from '../controllers/mentorMessageController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// Guard all mentor API routes with student-protected RBAC
router.use(protect);
router.use(authorizeRoles('mentor'));

// Dashboard & Students
router.get('/dashboard', getMentorDashboard);
router.get('/students', getMentorStudents);
router.get('/students/:studentId', getStudent360Details);

// Connect Workspace
router.get('/connect', getMentorConnectWorkspace);
router.post('/connect/requests/:requestId', updateMentorshipRequest);

// Sessions
router.get('/sessions', getMentorSessions);
router.post('/sessions/new', createSession);
router.get('/sessions/:sessionId', getSessionDetails);
router.put('/sessions/:sessionId', updateSessionStatus);

// Messages
router.get('/messages/conversations', getConversations);
router.get('/messages/thread/:studentId', getMessageHistory);
router.post('/messages/send', sendMessage);

// Profile & Availability
router.get('/profile', getMentorProfile);
router.put('/profile', updateMentorProfile);
router.get('/availability', getMentorAvailability);
router.put('/availability', updateMentorAvailability);

export default router;
