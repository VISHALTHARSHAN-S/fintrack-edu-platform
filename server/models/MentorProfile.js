import mongoose from 'mongoose';

const mentorProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    designation: {
      type: String,
      default: 'Senior FinTech Architect',
    },
    company: {
      type: String,
      default: 'Apex Quant Technologies',
    },
    expertise: {
      type: String,
      default: 'Quantitative Finance & Blockchain',
    },
    totalStudents: {
      type: Number,
      default: 48,
    },
    upcomingSessionsCount: {
      type: Number,
      default: 6,
    },
    completedSessionsCount: {
      type: Number,
      default: 124,
    },
    unreadMessagesCount: {
      type: Number,
      default: 5,
    },
    rating: {
      type: Number,
      default: 4.9,
    },
  },
  { timestamps: true }
);

export const MentorProfile = mongoose.model('MentorProfile', mentorProfileSchema);
