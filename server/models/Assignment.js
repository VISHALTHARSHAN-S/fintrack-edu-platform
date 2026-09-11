import mongoose from 'mongoose';

const assignmentSchema = new mongoose.Schema(
  {
    assignmentId: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    courseOrTopic: { type: String, required: true },
    description: { type: String, required: true },
    instructions: { type: String, default: '' },
    dueDate: { type: Date, required: true },
    maxMarks: { type: Number, default: 100 },
  },
  { timestamps: true }
);

export const Assignment = mongoose.model('Assignment', assignmentSchema);
