import mongoose from 'mongoose';

const attemptResponseSchema = new mongoose.Schema({
  questionId: { type: String, required: true },
  selectedOptionId: { type: String, default: null },
  isMarkedForReview: { type: Boolean, default: false },
  isCorrect: { type: Boolean, default: false },
  pointsEarned: { type: Number, default: 0 },
});

const assessmentAttemptSchema = new mongoose.Schema(
  {
    attemptId: { type: String, required: true, unique: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    assessmentId: { type: String, required: true },
    score: { type: Number, default: 0 },
    maxMarks: { type: Number, required: true },
    percentage: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['in-progress', 'completed'],
      default: 'in-progress',
    },
    passStatus: {
      type: String,
      enum: ['PASSED', 'FAILED', 'PENDING'],
      default: 'PENDING',
    },
    correctAnswersCount: { type: Number, default: 0 },
    incorrectAnswersCount: { type: Number, default: 0 },
    skippedCount: { type: Number, default: 0 },
    timeTakenSeconds: { type: Number, default: 0 },
    responses: [attemptResponseSchema],
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

export const AssessmentAttempt = mongoose.model('AssessmentAttempt', assessmentAttemptSchema);
