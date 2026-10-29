import mongoose from 'mongoose';

const candidateProfileSchema = new mongoose.Schema(
  {
    studentId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    education: { type: String, default: '' },
    careerObjective: { type: String, default: '' },
    location: { type: String, default: '' },
    experience: { type: String, default: '' },
    preferredRoles: [{ type: String }],
    preferredIndustries: [{ type: String }],
    preferredLocations: [{ type: String }],
    workModePreference: { type: String, default: 'Hybrid' },
    skills: [{ type: String }],
    portfolioLinks: [{ title: String, url: String }],
    resumeUrl: { type: String, default: '' },
    availability: { type: String, default: '' },
  },
  { timestamps: true }
);

export const CandidateProfile = mongoose.model('CandidateProfile', candidateProfileSchema);
