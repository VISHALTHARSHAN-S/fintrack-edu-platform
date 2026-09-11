import mongoose from 'mongoose';

const lessonSchema = new mongoose.Schema({
  lessonId: { type: String, required: true },
  title: { type: String, required: true },
  duration: { type: String, required: true },
  type: { type: String, enum: ['video', 'reading', 'interactive'], default: 'video' },
  videoUrl: { type: String, default: '' },
  content: { type: String, default: '' },
  resources: [
    {
      title: String,
      url: String,
      type: String,
    },
  ],
});

const moduleSchema = new mongoose.Schema({
  moduleId: { type: String, required: true },
  title: { type: String, required: true },
  duration: { type: String, required: true },
  lessons: [lessonSchema],
});

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    category: {
      type: String,
      required: true,
      enum: [
        'Quantitative Finance',
        'DeFi & Blockchain',
        'Financial AI & Analytics',
        'RegTech & Compliance',
        'Banking & Neo Banking',
        'Payments Infrastructure',
      ],
    },
    difficulty: { type: String, required: true, enum: ['Beginner', 'Intermediate', 'Advanced'] },
    duration: { type: String, required: true },
    durationHours: { type: Number, required: true, default: 5 },
    rating: { type: Number, default: 4.8 },
    reviewsCount: { type: Number, default: 120 },
    enrolledCount: { type: Number, default: 450 },
    instructor: {
      name: { type: String, required: true },
      title: { type: String, required: true },
      avatar: { type: String, default: '' },
    },
    description: { type: String, required: true },
    outcomes: [{ type: String }],
    modules: [moduleSchema],
    thumbnailUrl: { type: String, default: '' },
    tags: [{ type: String }],
    isFeatured: { type: Boolean, default: false },
    stage: { type: String, default: '' }, // Connects to Learning Path stage
  },
  { timestamps: true }
);

export const Course = mongoose.model('Course', courseSchema);
