import mongoose from 'mongoose';

const studentProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    institution: {
      type: String,
      default: '',
    },
    degree: {
      type: String,
      default: '',
    },
    yearOfStudy: {
      type: String,
      default: '',
    },
    fieldOfStudy: {
      type: String,
      default: 'FinTech Engineering',
    },
    skillScore: {
      type: Number,
      default: 83,
    },
    learningStreak: {
      type: Number,
      default: 15,
    },
    certificatesCount: {
      type: Number,
      default: 6,
    },
    coursesEnrolledCount: {
      type: Number,
      default: 12,
    },
    coursesCompletedCount: {
      type: Number,
      default: 5,
    },
    bio: {
      type: String,
      default: 'Aspiring FinTech Professional passionate about Algorithmic Trading and Financial Data Science.',
    },
  },
  { timestamps: true }
);

export const StudentProfile = mongoose.model('StudentProfile', studentProfileSchema);
