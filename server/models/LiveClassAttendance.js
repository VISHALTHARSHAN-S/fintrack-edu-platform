import mongoose from 'mongoose';

const liveClassAttendanceSchema = new mongoose.Schema(
  {
    liveClassId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LiveClass',
      required: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    joinedAt: { type: Date, default: null },
    leftAt: { type: Date, default: null },
    durationMinutes: { type: Number, default: 0 },
    attended: { type: Boolean, default: false },
  },
  { timestamps: true }
);

liveClassAttendanceSchema.index({ liveClassId: 1, studentId: 1 }, { unique: true });

export const LiveClassAttendance = mongoose.model('LiveClassAttendance', liveClassAttendanceSchema);
