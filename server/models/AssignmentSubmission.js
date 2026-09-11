import mongoose from 'mongoose';

const assignmentSubmissionSchema = new mongoose.Schema(
  {
    submissionId: { type: String, required: true, unique: true },
    assignmentId: { type: String, required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    attachmentName: { type: String, default: '' },
    submittedAt: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ['submitted', 'evaluated'],
      default: 'submitted',
    },
    marksObtained: { type: Number, default: null },
    feedback: { type: String, default: '' },
  },
  { timestamps: true }
);

export const AssignmentSubmission = mongoose.model(
  'AssignmentSubmission',
  assignmentSubmissionSchema
);
