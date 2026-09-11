import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema(
  {
    jobId: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    company: { type: String, required: true },
    companyLogo: { type: String, default: '' },
    location: { type: String, required: true },
    workMode: {
      type: String,
      enum: ['On-site', 'Hybrid', 'Remote'],
      default: 'Hybrid',
    },
    employmentType: {
      type: String,
      enum: ['Full-time', 'Part-time', 'Internship'],
      default: 'Full-time',
    },
    experienceLevel: { type: String, default: 'Entry Level (0-2 yrs)' },
    salaryRange: { type: String, required: true },
    requiredSkills: [{ type: String }],
    preferredSkills: [{ type: String }],
    description: { type: String, required: true },
    responsibilities: [{ type: String }],
    requirements: [{ type: String }],
    applicationDeadline: { type: Date, required: true },
    status: {
      type: String,
      enum: ['DRAFT', 'ACTIVE', 'CLOSED'],
      default: 'ACTIVE',
    },
    applicantsCount: { type: Number, default: 0 },
    shortlistedCount: { type: Number, default: 0 },
    interviewCount: { type: Number, default: 0 },
    postedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const Job = mongoose.model('Job', jobSchema);
