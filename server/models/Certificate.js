import mongoose from 'mongoose';

const certificateSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    certificateNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    verificationId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    issueDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['valid', 'revoked'],
      default: 'valid',
      required: true,
    },
    metadata: {
      studentName: { type: String, required: true, trim: true },
      courseTitle: { type: String, required: true, trim: true },
      issuingOrganization: { type: String, required: true, trim: true },
      requiredAssessmentIds: [{ type: String }],
    },
  },
  { timestamps: true }
);

certificateSchema.index({ studentId: 1, courseId: 1 }, { unique: true });

export const Certificate = mongoose.model('Certificate', certificateSchema);
