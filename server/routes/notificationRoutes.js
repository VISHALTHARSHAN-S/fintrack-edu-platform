import express from 'express';
import {
  getNotificationPreferences,
  getNotifications,
  markAllAsRead,
  markAsRead,
  updateNotificationPreferences,
} from '../controllers/notificationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getNotifications);
router.get('/preferences', protect, getNotificationPreferences);
router.put('/preferences', protect, updateNotificationPreferences);
router.put('/read-all', protect, markAllAsRead);
router.put('/:id/read', protect, markAsRead);

export default router;
