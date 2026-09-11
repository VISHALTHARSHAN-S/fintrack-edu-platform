import mongoose from 'mongoose';

const mentorMessageSchema = new mongoose.Schema(
  {
    messageId: { type: String, required: true, unique: true },
    senderId: { type: String, required: true },
    receiverId: { type: String, required: true },
    studentName: { type: String, required: true },
    studentAvatar: { type: String, default: '' },
    content: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const MentorMessage = mongoose.model('MentorMessage', mentorMessageSchema);
