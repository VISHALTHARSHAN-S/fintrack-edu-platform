import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['info', 'success', 'warning', 'error'],
      default: 'info',
    },
    category: {
      type: String,
      enum: ['career', 'assessment', 'certificate', 'course', 'mentor', 'general', 'learningReminder', 'support'],
      default: 'general',
    },
    eventKey: {
      type: String,
      trim: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    link: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

notificationSchema.index(
  { userId: 1, eventKey: 1 },
  { unique: true, partialFilterExpression: { eventKey: { $type: 'string' } } }
);
notificationSchema.index({ userId: 1, createdAt: -1 });

export const Notification = mongoose.model('Notification', notificationSchema);
