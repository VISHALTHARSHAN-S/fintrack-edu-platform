import mongoose from 'mongoose';
import { Notification } from '../models/Notification.js';
import { Settings } from '../models/Settings.js';

const preferenceCategories = [
  'career',
  'assessment',
  'certificate',
  'course',
  'mentor',
  'general',
  'learningReminder',
  'support',
];

const requireDatabase = (req, res) => {
  if (!req.isDbConnected) {
    res.status(503).json({ success: false, message: 'Notifications require a connected database.' });
    return false;
  }
  return true;
};

const mapNotification = (notification) => ({
  id: String(notification._id),
  title: notification.title,
  message: notification.message,
  type: notification.type,
  category: notification.category,
  link: notification.link,
  isRead: notification.isRead,
  createdAt: notification.createdAt,
});

export const getNotifications = async (req, res) => {
  try {
    if (!requireDatabase(req, res)) return;
    const filter = { userId: req.user.id };
    if (req.query.unread === 'true') filter.isRead = false;
    const notifications = await Notification.find(filter).sort({ createdAt: -1 }).lean();

    return res.json({ success: true, data: notifications.map(mapNotification) });
  } catch (error) {
    console.error('[Notification List Error]', error);
    return res.status(500).json({ success: false, message: 'Unable to load notifications.' });
  }
};

export const markAsRead = async (req, res) => {
  try {
    if (!requireDatabase(req, res)) return;
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'A valid notification ID is required.' });
    }
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { $set: { isRead: true } },
      { new: true }
    ).lean();
    if (!notification) return res.status(404).json({ success: false, message: 'Notification not found.' });
    return res.json({ success: true, data: mapNotification(notification) });
  } catch (error) {
    console.error('[Notification Read Error]', error);
    return res.status(500).json({ success: false, message: 'Unable to update notification.' });
  }
};

export const markAllAsRead = async (req, res) => {
  try {
    if (!requireDatabase(req, res)) return;
    const result = await Notification.updateMany(
      { userId: req.user.id, isRead: false },
      { $set: { isRead: true } }
    );
    return res.json({ success: true, data: { updatedCount: result.modifiedCount } });
  } catch (error) {
    console.error('[Mark All Notifications Read Error]', error);
    return res.status(500).json({ success: false, message: 'Unable to mark notifications as read.' });
  }
};

const getSettings = async (userId) => {
  const settings = await Settings.findOne({ userId }).select('notificationPreferences').lean();
  return Object.fromEntries(
    preferenceCategories.map((category) => [
      category,
      settings?.notificationPreferences?.[category] !== false,
    ])
  );
};

export const getNotificationPreferences = async (req, res) => {
  try {
    if (!requireDatabase(req, res)) return;
    return res.json({ success: true, data: await getSettings(req.user.id) });
  } catch (error) {
    console.error('[Notification Preferences Error]', error);
    return res.status(500).json({ success: false, message: 'Unable to load notification preferences.' });
  }
};

export const updateNotificationPreferences = async (req, res) => {
  try {
    if (!requireDatabase(req, res)) return;
    const entries = Object.entries(req.body || {});
    if (
      entries.length === 0 ||
      entries.some(([key, value]) => !preferenceCategories.includes(key) || typeof value !== 'boolean')
    ) {
      return res.status(400).json({
        success: false,
        message: 'Provide one or more valid boolean notification preferences.',
      });
    }

    const update = Object.fromEntries(
      entries.map(([key, value]) => [`notificationPreferences.${key}`, value])
    );
    await Settings.findOneAndUpdate(
      { userId: req.user.id },
      { $set: update, $setOnInsert: { userId: req.user.id } },
      { upsert: true, new: true, runValidators: true }
    );
    return res.json({ success: true, data: await getSettings(req.user.id) });
  } catch (error) {
    console.error('[Notification Preferences Update Error]', error);
    return res.status(500).json({ success: false, message: 'Unable to update notification preferences.' });
  }
};
