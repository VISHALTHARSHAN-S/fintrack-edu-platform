import mongoose from 'mongoose';

const mentorFeedbackSchema = new mongoose.Schema(
  {
    sessionId: { type: String, required: true, unique: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    mentorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: '', maxlength: 2000 },
  },
  { timestamps: true }
);

mentorFeedbackSchema.index({ mentorId: 1, createdAt: -1 });

export const MentorFeedback = mongoose.model('MentorFeedback', mentorFeedbackSchema);