import mongoose from 'mongoose';

const mentorshipRequestSchema = new mongoose.Schema(
  {
    requestId: { type: String, required: true, unique: true },
    mentorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    studentName: { type: String, required: true },
    studentCourse: { type: String, default: 'Algorithmic Trading' },
    studentSkillScore: { type: String, default: '88%' },
    requestMessage: { type: String, required: true },
    interests: [{ type: String }],
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined'],
      default: 'pending',
    },
    requestedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const MentorshipRequest = mongoose.model('MentorshipRequest', mentorshipRequestSchema);
