import mongoose from 'mongoose';

const recruiterMessageSchema = new mongoose.Schema(
  {
    messageId: { type: String, required: true, unique: true },
    senderId: { type: String, required: true },
    receiverId: { type: String, required: true },
    candidateName: { type: String, required: true },
    content: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const RecruiterMessage = mongoose.model('RecruiterMessage', recruiterMessageSchema);
