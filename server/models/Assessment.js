import mongoose from 'mongoose';

const assessmentSchema = new mongoose.Schema(
  {
    assessmentId: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    topic: { type: String, required: true },
    description: { type: String, required: true },
    instructions: [{ type: String }],
    difficulty: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      default: 'Intermediate',
    },
    durationMinutes: { type: Number, required: true, default: 30 },
    totalQuestions: { type: Number, required: true, default: 10 },
    totalMarks: { type: Number, required: true, default: 100 },
    passingPercentage: { type: Number, required: true, default: 70 },
    topicsCovered: [{ type: String }],
    questionIds: [{ type: String }], // Array of question IDs
  },
  { timestamps: true }
);

export const Assessment = mongoose.model('Assessment', assessmentSchema);
