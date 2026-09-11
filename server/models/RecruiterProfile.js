import mongoose from 'mongoose';

const recruiterProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    companyName: {
      type: String,
      default: 'Nexus Financial Solutions',
    },
    industry: {
      type: String,
      default: 'Digital Banking & Payments',
    },
    companySize: {
      type: String,
      default: '500-1000 employees',
    },
    designation: {
      type: String,
      default: 'Talent Acquisition Lead',
    },
    website: {
      type: String,
      default: 'https://nexusfintech.example.com',
    },
    availableCandidatesCount: {
      type: Number,
      default: 340,
    },
    activeJobsCount: {
      type: Number,
      default: 8,
    },
    applicationsCount: {
      type: Number,
      default: 142,
    },
    shortlistedCount: {
      type: Number,
      default: 18,
    },
  },
  { timestamps: true }
);

export const RecruiterProfile = mongoose.model('RecruiterProfile', recruiterProfileSchema);
