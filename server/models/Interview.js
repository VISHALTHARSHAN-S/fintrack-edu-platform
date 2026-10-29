import mongoose from 'mongoose';

const interviewSchema = new mongoose.Schema(
  {
    interviewId: { type: String, required: true, unique: true },
    jobId: { type: String, required: true },
    applicationId: { type: String, default: '' },
    jobTitle: { type: String, required: true },
    company: { type: String, default: '' },
    candidateId: { type: String, required: true },
    candidateName: { type: String, required: true },
    recruiterId: { type: String, required: true },
    recruiterName: { type: String, default: '' },
    interviewType: {
      type: String,
      enum: ['Technical Screening', 'Coding Assessment Review', 'System Design Round', 'HR Final Round'],
      default: 'Technical Screening',
    },
    date: { type: Date, required: true },
    timeSlot: { type: String, required: true },
    durationMinutes: { type: Number, default: 45 },
    meetingLink: { type: String, default: '' },
    notes: { type: String, default: '' },
    status: {
      type: String,
      enum: ['SCHEDULED', 'COMPLETED', 'CANCELLED'],
      default: 'SCHEDULED',
    },
  },
  { timestamps: true }
);

interviewSchema.index(
  { applicationId: 1, date: 1, timeSlot: 1, recruiterId: 1 },
  { unique: true, partialFilterExpression: { applicationId: { $gt: '' } } }
);

export const Interview = mongoose.model('Interview', interviewSchema);
