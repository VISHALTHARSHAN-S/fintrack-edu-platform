import { Notification } from '../models/Notification.js';
import { Settings } from '../models/Settings.js';

const categories = new Set([
  'career',
  'assessment',
  'certificate',
  'course',
  'mentor',
  'general',
  'learningReminder',
  'support',
]);

export const createUserNotification = async ({
  userId,
  eventKey,
  title,
  message,
  category = 'general',
  type = 'info',
  link = '',
}) => {
  if (!userId || !eventKey || !title || !message || !categories.has(category)) {
    throw new Error('A valid notification recipient and event payload are required.');
  }

  const preferences = await Settings.findOne({ userId })
    .select('notificationPreferences')
    .lean();
  if (preferences?.notificationPreferences?.[category] === false) return null;

  try {
    return await Notification.create({
      userId,
      eventKey,
      title,
      message,
      category,
      type,
      link,
    });
  } catch (error) {
    if (error?.code === 11000) return null;
    throw error;
  }
};
