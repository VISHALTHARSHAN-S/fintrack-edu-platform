import mongoose from 'mongoose';

const timeSlotSchema = new mongoose.Schema({
  slotId: { type: String, required: true },
  time: { type: String, required: true },
  isBooked: { type: Boolean, default: false },
});

const dayAvailabilitySchema = new mongoose.Schema({
  day: { type: String, required: true }, // e.g. Monday
  isEnabled: { type: Boolean, default: true },
  startTime: { type: String, default: '09:00 AM' },
  endTime: { type: String, default: '05:00 PM' },
  slots: [timeSlotSchema],
});

const mentorAvailabilitySchema = new mongoose.Schema(
  {
    mentorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    sessionDurationMinutes: { type: Number, default: 45 },
    maxSessionsPerDay: { type: Number, default: 4 },
    weeklySchedule: [dayAvailabilitySchema],
  },
  { timestamps: true }
);

export const MentorAvailability = mongoose.model('MentorAvailability', mentorAvailabilitySchema);
