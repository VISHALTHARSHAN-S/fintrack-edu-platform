import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { User } from './models/User.js';
import { Course } from './models/Course.js';
import { LiveClass } from './models/LiveClass.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI ?? 'mongodb://127.0.0.1:27017/fintrack_edu';
const mentorEmail = 'mentor@fintrack.edu';

const courseSlugs = {
  financialMachineLearning: 'financial-machine-learning-risk-modeling',
  algorithmicTrading: 'algorithmic-trading-hft-strategies',
  regTech: 'regtech-compliance-aml-systems',
  paymentsSecurity: 'digital-payments-architecture-upi',
};

const getClassDefinitions = (mentorId, courses) => {
  const now = Date.now();
  const minutes = (value) => value * 60 * 1000;

  return [
    {
      title: 'Financial ML & Risk Modeling',
      description: 'Interactive live session covering financial machine learning concepts, risk modeling and practical industry use cases.',
      mentorId,
      courseId: courses.financialMachineLearning._id,
      scheduledAt: new Date(now + minutes(24 * 60)),
      durationMinutes: 60,
      meetingLink: 'https://meet.google.com/fintrack-finml-risk',
      status: 'scheduled',
      agenda: ['Financial ML problem framing', 'Risk feature engineering', 'Model validation and governance', 'Industry use cases and Q&A'],
      materials: [
        { title: 'Risk Modeling Slides', url: 'https://example.com/fintrack/risk-modeling-slides.pdf', type: 'pdf' },
        { title: 'Model Validation Checklist', url: 'https://example.com/fintrack/model-validation-checklist.pdf', type: 'pdf' },
      ],
    },
    {
      title: 'Live Q&A: Building HFT Bots',
      description: 'Interactive mentor-led Q&A session on high-frequency trading systems and algorithmic strategies.',
      mentorId,
      courseId: courses.algorithmicTrading._id,
      scheduledAt: new Date(now - minutes(20)),
      durationMinutes: 60,
      meetingLink: 'https://meet.google.com/fintrack-hft-live',
      status: 'live',
      agenda: ['HFT system architecture', 'Market data and order books', 'Execution strategy tradeoffs', 'Live student Q&A'],
      materials: [],
    },
    {
      title: 'Regulatory Reporting & API Integration',
      description: 'Live session explaining financial regulatory reporting and API integration.',
      mentorId,
      courseId: courses.regTech._id,
      scheduledAt: new Date(now - minutes(48 * 60)),
      durationMinutes: 60,
      meetingLink: 'https://meet.google.com/fintrack-regulatory-api',
      recordingUrl: 'https://example.com/fintrack/recordings/regulatory-api-integration.mp4',
      status: 'completed',
      agenda: ['Regulatory reporting workflows', 'API integration patterns', 'Validation and audit trails', 'Implementation questions'],
      materials: [
        { title: 'Regulatory Reporting Guide', url: 'https://example.com/fintrack/regulatory-reporting-guide.pdf', type: 'pdf' },
        { title: 'API Integration Notes', url: 'https://example.com/fintrack/api-integration-notes.md', type: 'text' },
      ],
    },
    {
      title: 'Introduction to FinTech Security',
      description: 'Live session covering authentication, secure APIs and common security practices in FinTech applications.',
      mentorId,
      courseId: courses.paymentsSecurity._id,
      scheduledAt: new Date(now + minutes(4 * 24 * 60)),
      durationMinutes: 90,
      meetingLink: 'https://meet.google.com/fintrack-fintech-security',
      status: 'scheduled',
      agenda: ['Authentication and authorization basics', 'Secure API design', 'Payment security practices', 'Threat modeling and Q&A'],
      materials: [
        { title: 'FinTech API Security Checklist', url: 'https://example.com/fintrack/fintech-api-security-checklist.pdf', type: 'pdf' },
        { title: 'Authentication Flow Reference', url: 'https://example.com/fintrack/authentication-flow-reference.md', type: 'text' },
      ],
    },
  ];
};

const seedLiveClasses = async () => {
  try {
    await mongoose.connect(MONGO_URI);

    const mentor = await User.findOne({ email: mentorEmail, role: 'mentor', status: 'active' }).select('_id name email');
    if (!mentor) {
      throw new Error(`Active mentor account not found: ${mentorEmail}`);
    }

    const slugs = Object.values(courseSlugs);
    const courseRecords = await Course.find({ slug: { $in: slugs } }).select('_id title slug');
    const courses = Object.fromEntries(courseRecords.map((course) => [course.slug, course]));
    const missingSlugs = slugs.filter((slug) => !courses[slug]);

    if (missingSlugs.length > 0) {
      throw new Error(`Required existing courses are missing: ${missingSlugs.join(', ')}. Seed valid courses through the existing course seed architecture before running this script.`);
    }

    const definitions = getClassDefinitions(mentor._id, {
      financialMachineLearning: courses[courseSlugs.financialMachineLearning],
      algorithmicTrading: courses[courseSlugs.algorithmicTrading],
      regTech: courses[courseSlugs.regTech],
      paymentsSecurity: courses[courseSlugs.paymentsSecurity],
    });

    const results = [];
    for (const definition of definitions) {
      const liveClass = await LiveClass.findOneAndUpdate(
        { title: definition.title },
        { $set: definition },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );
      results.push(liveClass);
    }

    console.log(`[LiveClass Seed] Upserted ${results.length} records in the LiveClass collection.`);
    results.forEach((liveClass) => console.log(`- ${liveClass.title}: ${liveClass._id}`));
  } catch (error) {
    console.error(`[LiveClass Seed Error] ${error.message}`);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

seedLiveClasses();