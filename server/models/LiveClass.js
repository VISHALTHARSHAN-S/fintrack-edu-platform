import mongoose from 'mongoose';

const materialSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    url: { type: String, required: true },
    type: { type: String, required: true },
  },
  { _id: false }
);

const liveClassSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: '' },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    mentorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    scheduledAt: { type: Date, required: true },
    durationMinutes: { type: Number, default: 60, min: 15 },
    meetingLink: { type: String, default: 'https://meet.google.com/fintrack-live' },
    recordingUrl: { type: String, default: '' },
    agenda: [{ type: String }],
    status: {
      type: String,
      enum: ['scheduled', 'live', 'completed', 'cancelled'],
      default: 'scheduled',
    },
    maxParticipants: { type: Number, default: 120 },
    materials: [materialSchema],
  },
  { timestamps: true }
);

export const LiveClass = mongoose.model('LiveClass', liveClassSchema);
