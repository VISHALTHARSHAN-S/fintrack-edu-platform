import mongoose from 'mongoose';

const interviewSchema = new mongoose.Schema(
  {
    interviewId: { type: String, required: true, unique: true },
    jobId: { type: String, required: true },
    jobTitle: { type: String, required: true },
    candidateId: { type: String, required: true },
    candidateName: { type: String, required: true },
    recruiterId: { type: String, required: true },
    recruiterName: { type: String, default: 'Sarah Jenkins' },
    interviewType: {
      type: String,
      enum: ['Technical Screening', 'Coding Assessment Review', 'System Design Round', 'HR Final Round'],
      default: 'Technical Screening',
    },
    date: { type: Date, required: true },
    timeSlot: { type: String, required: true },
    durationMinutes: { type: Number, default: 45 },
    meetingLink: { type: String, default: 'https://meet.fintrack.edu/interview-room' },
    notes: { type: String, default: '' },
    status: {
      type: String,
      enum: ['SCHEDULED', 'COMPLETED', 'CANCELLED'],
      default: 'SCHEDULED',
    },
  },
  { timestamps: true }
);

export const Interview = mongoose.model('Interview', interviewSchema);
