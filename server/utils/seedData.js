import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { StudentProfile } from '../models/StudentProfile.js';
import { MentorProfile } from '../models/MentorProfile.js';
import { RecruiterProfile } from '../models/RecruiterProfile.js';

dotenv.config();

const seedUsers = async () => {
  try {
    console.log('[Seed] Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/fintrack_edu');

    await User.deleteMany();
    await StudentProfile.deleteMany();
    await MentorProfile.deleteMany();
    await RecruiterProfile.deleteMany();

    console.log('[Seed] Cleared existing data.');

    // 1. Create Student User
    const studentUser = await User.create({
      name: 'Vishaltharshan S',
      email: 'student@fintrack.edu',
      phone: '+91 9876543210',
      passwordHash: 'Password123!', // Pre-save hook will hash this
      role: 'student',
      isVerified: true,
      status: 'active',
    });

    await StudentProfile.create({
      userId: studentUser._id,
      institution: 'Anna University / Naan Mudhalvan FinTech Academy',
      degree: 'B.Tech Financial Technology & CS',
      yearOfStudy: '4th Year',
      skillScore: 83,
      learningStreak: 15,
      certificatesCount: 6,
      coursesEnrolledCount: 12,
      coursesCompletedCount: 5,
    });

    // 2. Create Mentor User
    const mentorUser = await User.create({
      name: 'Dr. Aris Vance',
      email: 'mentor@fintrack.edu',
      phone: '+91 9876543211',
      passwordHash: 'Password123!',
      role: 'mentor',
      isVerified: true,
      status: 'active',
    });

    await MentorProfile.create({
      userId: mentorUser._id,
      designation: 'Principal Quantitative Architect',
      company: 'Apex Trading Technologies',
      expertise: 'HFT Algorithmic Trading & Risk Analytics',
      totalStudents: 48,
      upcomingSessionsCount: 6,
      completedSessionsCount: 124,
      unreadMessagesCount: 5,
      rating: 4.9,
    });

    // 3. Create Recruiter User
    const recruiterUser = await User.create({
      name: 'Sarah Jenkins',
      email: 'recruiter@fintrack.edu',
      phone: '+91 9876543212',
      passwordHash: 'Password123!',
      role: 'recruiter',
      isVerified: true,
      status: 'active',
    });

    await RecruiterProfile.create({
      userId: recruiterUser._id,
      companyName: 'Nexus Global Capital',
      industry: 'Investment Banking & FinTech Solutions',
      companySize: '500-1000 employees',
      designation: 'Lead FinTech Talent Recruiter',
      website: 'https://nexuscapital.example.com',
      availableCandidatesCount: 340,
      activeJobsCount: 8,
      applicationsCount: 142,
      shortlistedCount: 18,
    });

    console.log('\n==================================================');
    console.log('[Seed Success] Created 3 default test accounts:');
    console.log('1. Student  : student@fintrack.edu   / Password123!');
    console.log('2. Mentor   : mentor@fintrack.edu    / Password123!');
    console.log('3. Recruiter: recruiter@fintrack.edu / Password123!');
    console.log('==================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]', error);
    process.exit(1);
  }
};

seedUsers();
