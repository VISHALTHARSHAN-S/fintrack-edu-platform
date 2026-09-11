import mongoose from 'mongoose';

const responseSchema = new mongoose.Schema({
  questionId: { type: String, required: true },
  selectedOptionId: { type: String, default: null },
  isCorrect: { type: Boolean, default: false },
  timeSpentSeconds: { type: Number, default: 0 },
});

const practiceSessionSchema = new mongoose.Schema(
  {
    sessionId: { type: String, required: true, unique: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    topic: { type: String, required: true },
    difficulty: { type: String, required: true },
    totalQuestions: { type: Number, required: true },
    correctAnswersCount: { type: Number, default: 0 },
    incorrectAnswersCount: { type: Number, default: 0 },
    skippedCount: { type: Number, default: 0 },
    accuracyPercentage: { type: Number, default: 0 },
    score: { type: Number, default: 0 },
    timeTakenSeconds: { type: Number, default: 0 },
    responses: [responseSchema],
    performanceLevel: {
      type: String,
      enum: ['Excellent', 'Good', 'Needs Improvement'],
      default: 'Good',
    },
    status: {
      type: String,
      enum: ['in-progress', 'completed'],
      default: 'in-progress',
    },
  },
  { timestamps: true }
);

export const PracticeSession = mongoose.model('PracticeSession', practiceSessionSchema);
