import mongoose from 'mongoose';

const jobApplicationSchema = new mongoose.Schema(
  {
    applicationId: { type: String, required: true, unique: true },
    jobId: { type: String, required: true },
    jobTitle: { type: String, required: true },
    company: { type: String, required: true },
    candidateId: { type: String, required: true },
    candidateName: { type: String, required: true },
    candidateEmail: { type: String, required: true },
    resumeUrl: { type: String, default: 'fintrack_verified_resume.pdf' },
    coverMessage: { type: String, default: '' },
    skillMatchPercentage: { type: Number, default: 85 },
    assessmentScore: { type: String, default: '92%' },
    status: {
      type: String,
      enum: ['APPLIED', 'SCREENING', 'SHORTLISTED', 'INTERVIEW', 'SELECTED', 'REJECTED'],
      default: 'APPLIED',
    },
    appliedDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const JobApplication = mongoose.model('JobApplication', jobApplicationSchema);
