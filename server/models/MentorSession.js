import mongoose from 'mongoose';

const mentorSessionSchema = new mongoose.Schema(
  {
    sessionId: { type: String, required: true, unique: true },
    mentorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    studentName: { type: String, required: true },
    topic: { type: String, required: true },
    sessionType: {
      type: String,
      enum: ['1-on-1 Mentorship', 'Code Review', 'Career Guidance', 'Project Consultation'],
      default: '1-on-1 Mentorship',
    },
    date: { type: Date, required: true },
    timeSlot: { type: String, required: true },
    durationMinutes: { type: Number, default: 45 },
    status: {
      type: String,
      enum: ['Upcoming', 'Completed', 'Cancelled'],
      default: 'Upcoming',
    },
    meetingLink: { type: String, default: 'https://meet.fintrack.edu/session-room' },
    notes: { type: String, default: '' },
    agenda: { type: String, default: '' },
  },
  { timestamps: true }
);

export const MentorSession = mongoose.model('MentorSession', mentorSessionSchema);
