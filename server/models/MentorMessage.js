import mongoose from 'mongoose';

const mentorMessageSchema = new mongoose.Schema(
  {
    messageId: { type: String, required: true, unique: true },
    senderId: { type: String, required: true },
    receiverId: { type: String, required: true },
    studentName: { type: String, required: true },
    studentAvatar: { type: String, default: '' },
    content: { type: String, required: true },
    messageType: { type: String, enum: ['text', 'file'], default: 'text' },
    attachment: {
      fileName: { type: String, default: '' },
      fileUrl: { type: String, default: '' },
      publicId: { type: String, default: '' },
      mimeType: { type: String, default: '' },
      fileSize: { type: Number, default: 0 },
      resourceType: { type: String, default: '' },
    },
    isRead: { type: Boolean, default: false },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

mentorMessageSchema.index({ senderId: 1, receiverId: 1, timestamp: 1 });
mentorMessageSchema.index({ receiverId: 1, isRead: 1, timestamp: 1 });

export const MentorMessage = mongoose.model('MentorMessage', mentorMessageSchema);
