import mongoose from 'mongoose';
import { Course } from '../models/Course.js';
import { SEEDED_COURSES } from '../seed/coursesSeedData.js';

export const getCourses = async (req, res) => {
  try {
    const { search, category, difficulty, duration } = req.query;

    let coursesList = [];

    if (req.isDbConnected) {
      let query = {};

      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { 'instructor.name': { $regex: search, $options: 'i' } },
          { tags: { $regex: search, $options: 'i' } },
        ];
      }

      if (category && category !== 'All') {
        query.category = category;
      }

      if (difficulty && difficulty !== 'All') {
        query.difficulty = difficulty;
      }

      coursesList = await Course.find(query);
      if (coursesList.length === 0 && !search && (!category || category === 'All') && (!difficulty || difficulty === 'All')) {
        await Course.bulkWrite(
          SEEDED_COURSES.map((course) => ({
            updateOne: {
              filter: { slug: course.slug },
              update: { $set: course },
              upsert: true,
            },
          }))
        );
        coursesList = await Course.find(query);
      }
    } else {
      // In-memory filter fallback
      coursesList = [...SEEDED_COURSES];

      if (search) {
        const s = search.toLowerCase();
        coursesList = coursesList.filter(
          (c) =>
            c.title.toLowerCase().includes(s) ||
            c.description.toLowerCase().includes(s) ||
            c.instructor.name.toLowerCase().includes(s) ||
            c.tags.some((t) => t.toLowerCase().includes(s))
        );
      }

      if (category && category !== 'All') {
        coursesList = coursesList.filter((c) => c.category === category);
      }

      if (difficulty && difficulty !== 'All') {
        coursesList = coursesList.filter((c) => c.difficulty === difficulty);
      }

      if (duration && duration !== 'All') {
        if (duration === '< 5 hrs') {
          coursesList = coursesList.filter((c) => c.durationHours < 5);
        } else if (duration === '5-10 hrs') {
          coursesList = coursesList.filter((c) => c.durationHours >= 5 && c.durationHours <= 10);
        } else if (duration === '10+ hrs') {
          coursesList = coursesList.filter((c) => c.durationHours > 10);
        }
      }
    }

    return res.json({
      success: true,
      count: coursesList.length,
      data: coursesList,
    });
  } catch (error) {
    console.error('[getCourses error]', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getCourseById = async (req, res) => {
  try {
    const { courseId } = req.params;

    let course = null;

    if (req.isDbConnected) {
      if (mongoose.isValidObjectId(courseId)) {
        course = await Course.findById(courseId);
      }
      if (!course) {
        course = await Course.findOne({ slug: courseId });
      }
    }

    if (!course) {
      course = SEEDED_COURSES.find((c) => c._id === courseId || c.slug === courseId);
    }

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    return res.json({ success: true, data: course });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getLearningPath = async (req, res) => {
  try {
    const stages = [
      {
        id: 1,
        title: 'FinTech Basics',
        status: 'Completed',
        progress: 100,
        description: 'Fundamentals of financial systems, regulatory compliance, and digital economy.',
        courses: ['RegTech Compliance & Anti-Money Laundering Systems'],
        nextCourseSlug: 'regtech-compliance-aml-systems',
      },
      {
        id: 2,
        title: 'Digital Payments',
        status: 'Completed',
        progress: 100,
        description: 'Payment gateways, card switches, UPI 2.0, and ISO 20022 messaging standards.',
        courses: ['Digital Payments Architecture & UPI Infrastructure'],
        nextCourseSlug: 'digital-payments-architecture-upi',
      },
      {
        id: 3,
        title: 'Banking & Neo Banking',
        status: 'In Progress',
        progress: 65,
        description: 'Core banking API integration, ledger systems, double-entry accounting, and BaaS.',
        courses: ['Core Banking Systems & Neo Banking API Integration'],
        nextCourseSlug: 'core-banking-systems-neo-banking-api',
      },
      {
        id: 4,
        title: 'Blockchain & Crypto',
        status: 'Locked',
        progress: 0,
        description: 'Smart contract security, Solidity auditing, AMMs, and DeFi protocols.',
        courses: ['DeFi Protocols & Smart Contract Auditing'],
        nextCourseSlug: 'defi-protocols-smart-contract-auditing',
      },
      {
        id: 5,
        title: 'Cybersecurity',
        status: 'Locked',
        progress: 0,
        description: 'FinTech data protection, zero-trust architecture, PCI-DSS, and API security.',
        courses: ['FinTech Zero-Trust Cybersecurity'],
        nextCourseSlug: '',
      },
      {
        id: 6,
        title: 'FinTech Analytics',
        status: 'Locked',
        progress: 0,
        description: 'Algorithmic trading, machine learning risk models, and high-frequency strategies.',
        courses: ['Algorithmic Trading & High-Frequency Strategies', 'Financial Machine Learning & Risk Modeling'],
        nextCourseSlug: 'algorithmic-trading-hft-strategies',
      },
      {
        id: 7,
        title: 'Career Readiness',
        status: 'Locked',
        progress: 0,
        description: 'Industry mentorship, quantitative interview preparation, and placement.',
        courses: ['Quantitative Engineering Interview Prep'],
        nextCourseSlug: '',
      },
    ];

    return res.json({ success: true, data: stages });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
