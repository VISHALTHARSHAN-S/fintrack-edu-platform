import mongoose from 'mongoose';

const candidateProfileSchema = new mongoose.Schema(
  {
    studentId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    education: { type: String, default: 'B.Tech Financial Technology & CS' },
    careerObjective: { type: String, default: 'Aspiring Quant Engineer aiming to build high-frequency trading engines and scalable payment rails.' },
    location: { type: String, default: 'Chennai, India' },
    experience: { type: String, default: 'FinTech Project Intern (6 mos)' },
    preferredRoles: [{ type: String }],
    preferredIndustries: [{ type: String }],
    preferredLocations: [{ type: String }],
    workModePreference: { type: String, default: 'Hybrid' },
    skills: [{ type: String }],
    portfolioLinks: [{ title: String, url: String }],
    availability: { type: String, default: 'Immediate (0-15 days)' },
    careerReadinessScore: { type: Number, default: 88 },
  },
  { timestamps: true }
);

export const CandidateProfile = mongoose.model('CandidateProfile', candidateProfileSchema);
