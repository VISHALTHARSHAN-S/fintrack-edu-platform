import mongoose from 'mongoose';

const verifiedSkillSchema = new mongoose.Schema({
  skill: { type: String, required: true },
  proficiency: { type: Number, required: true }, // e.g. 85%
  verificationSource: { type: String, required: true }, // e.g. "Verified through Assessment"
  level: { type: String, default: 'Advanced' },
});

const skillPassportSchema = new mongoose.Schema(
  {
    studentId: { type: String, required: true, unique: true },
    studentName: { type: String, required: true },
    verifiedBadgeTier: { type: String, default: 'Naan Mudhalvan Gold Verified' },
    overallSkillScore: { type: Number, default: 92 },
    careerReadinessScore: { type: Number, default: 88 },
    verifiedSkills: [verifiedSkillSchema],
    certifications: [
      {
        title: String,
        issuer: String,
        issueDate: String,
        credentialUrl: String,
      },
    ],
    projects: [
      {
        title: String,
        techStack: [String],
        description: String,
        githubUrl: String,
      },
    ],
    badges: [{ type: String }],
  },
  { timestamps: true }
);

export const SkillPassport = mongoose.model('SkillPassport', skillPassportSchema);
