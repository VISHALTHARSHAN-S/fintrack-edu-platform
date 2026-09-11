import mongoose from 'mongoose';

const optionSchema = new mongoose.Schema({
  id: { type: String, required: true },
  text: { type: String, required: true },
  isCorrect: { type: Boolean, required: true, default: false },
});

const questionSchema = new mongoose.Schema(
  {
    questionId: { type: String, required: true, unique: true },
    topic: {
      type: String,
      required: true,
      enum: [
        'Digital Payments',
        'UPI',
        'Banking & Neo Banking',
        'Blockchain & Crypto',
        'Cybersecurity',
        'Financial Markets',
        'FinTech Analytics',
        'InsurTech',
      ],
    },
    difficulty: {
      type: String,
      required: true,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      default: 'Intermediate',
    },
    questionText: { type: String, required: true },
    options: [optionSchema],
    explanation: { type: String, required: true },
    marks: { type: Number, default: 1 },
  },
  { timestamps: true }
);

export const Question = mongoose.model('Question', questionSchema);
