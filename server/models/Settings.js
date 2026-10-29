import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    emailNotifications: {
      type: Boolean,
      default: true,
    },
    notificationPreferences: {
      career: { type: Boolean, default: true },
      assessment: { type: Boolean, default: true },
      certificate: { type: Boolean, default: true },
      course: { type: Boolean, default: true },
      mentor: { type: Boolean, default: true },
      general: { type: Boolean, default: true },
      learningReminder: { type: Boolean, default: true },
      support: { type: Boolean, default: true },
    },
    securityAlerts: {
      type: Boolean,
      default: true,
    },
    theme: {
      type: String,
      enum: ['light', 'dark'],
      default: 'light',
    },
    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const Settings = mongoose.model('Settings', settingsSchema);
