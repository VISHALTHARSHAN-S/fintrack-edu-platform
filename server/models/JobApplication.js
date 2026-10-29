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
    resumeUrl: { type: String, default: '' },
    coverMessage: { type: String, default: '' },
    matchedSkills: [{ type: String }],
    missingSkills: [{ type: String }],
    skillMatchPercentage: { type: Number, min: 0, max: 100, default: null },
    assessmentScore: { type: String, default: '' },
    status: {
      type: String,
      enum: ['APPLIED', 'SCREENING', 'SHORTLISTED', 'INTERVIEW', 'SELECTED', 'REJECTED'],
      default: 'APPLIED',
    },
    appliedDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

jobApplicationSchema.index({ jobId: 1, candidateId: 1 }, { unique: true });

export const JobApplication = mongoose.model('JobApplication', jobApplicationSchema);
