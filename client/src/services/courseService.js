import API from './api';
import { MOCK_COURSES, MOCK_ENROLLMENTS, MOCK_WISHLIST } from '../data/mockCoursesData';

export const fetchCourses = async (params = {}) => {
  try {
    const res = await API.get('/courses', { params });
    if (res.data && res.data.data && res.data.data.length > 0) {
      return res.data.data;
    }
  } catch (err) {
    console.warn('[fetchCourses API fallback to local mock data]', err.message);
  }

  // Fallback to client mock filtering
  let filtered = [...MOCK_COURSES];

  if (params.search) {
    const s = params.search.toLowerCase();
    filtered = filtered.filter(
      (c) =>
        c.title.toLowerCase().includes(s) ||
        c.description.toLowerCase().includes(s) ||
        c.instructor.name.toLowerCase().includes(s) ||
        c.tags.some((t) => t.toLowerCase().includes(s))
    );
  }

  if (params.category && params.category !== 'All') {
    filtered = filtered.filter((c) => c.category === params.category);
  }

  if (params.difficulty && params.difficulty !== 'All') {
    filtered = filtered.filter((c) => c.difficulty === params.difficulty);
  }

  if (params.duration && params.duration !== 'All') {
    if (params.duration === '< 5 hrs') {
      filtered = filtered.filter((c) => c.durationHours < 5);
    } else if (params.duration === '5-10 hrs') {
      filtered = filtered.filter((c) => c.durationHours >= 5 && c.durationHours <= 10);
    } else if (params.duration === '10+ hrs') {
      filtered = filtered.filter((c) => c.durationHours > 10);
    }
  }

  return filtered;
};

export const fetchCourseById = async (courseId) => {
  try {
    const res = await API.get(`/courses/${courseId}`);
    if (res.data && res.data.data) {
      return res.data.data;
    }
  } catch (err) {
    console.warn('[fetchCourseById API fallback]', err.message);
  }

  return MOCK_COURSES.find((c) => c._id === courseId || c.id === courseId || c.slug === courseId) || MOCK_COURSES[0];
};

export const fetchLearningPath = async () => {
  try {
    const res = await API.get('/courses/learning-path');
    if (res.data && res.data.data) {
      return res.data.data;
    }
  } catch (err) {
    console.warn('[fetchLearningPath API fallback]', err.message);
  }

  return [
    {
      id: 1,
      title: 'FinTech Basics',
      status: 'Completed',
      progress: 100,
      description: 'Fundamentals of financial systems, regulatory compliance, and digital economy.',
      courses: ['RegTech Compliance & Anti-Money Laundering Systems'],
      nextCourseSlug: 'regtech-compliance-aml-systems',
      courseId: 'c104',
    },
    {
      id: 2,
      title: 'Digital Payments',
      status: 'Completed',
      progress: 100,
      description: 'Payment gateways, card switches, UPI 2.0, and ISO 20022 messaging standards.',
      courses: ['Digital Payments Architecture & UPI Infrastructure'],
      nextCourseSlug: 'digital-payments-architecture-upi',
      courseId: 'c105',
    },
    {
      id: 3,
      title: 'Banking & Neo Banking',
      status: 'In Progress',
      progress: 65,
      description: 'Core banking API integration, ledger systems, double-entry accounting, and BaaS.',
      courses: ['Core Banking Systems & Neo Banking API Integration'],
      nextCourseSlug: 'core-banking-systems-neo-banking-api',
      courseId: 'c106',
    },
    {
      id: 4,
      title: 'Blockchain & Crypto',
      status: 'Locked',
      progress: 0,
      description: 'Smart contract security, Solidity auditing, AMMs, and DeFi protocols.',
      courses: ['DeFi Protocols & Smart Contract Auditing'],
      nextCourseSlug: 'defi-protocols-smart-contract-auditing',
      courseId: 'c103',
    },
    {
      id: 5,
      title: 'Cybersecurity',
      status: 'Locked',
      progress: 0,
      description: 'FinTech data protection, zero-trust architecture, PCI-DSS, and API security.',
      courses: ['FinTech Zero-Trust Cybersecurity'],
      nextCourseSlug: '',
      courseId: '',
    },
    {
      id: 6,
      title: 'FinTech Analytics',
      status: 'Locked',
      progress: 0,
      description: 'Algorithmic trading, machine learning risk models, and high-frequency strategies.',
      courses: ['Algorithmic Trading & High-Frequency Strategies', 'Financial Machine Learning & Risk Modeling'],
      nextCourseSlug: 'algorithmic-trading-hft-strategies',
      courseId: 'c101',
    },
    {
      id: 7,
      title: 'Career Readiness',
      status: 'Locked',
      progress: 0,
      description: 'Industry mentorship, quantitative interview preparation, and placement.',
      courses: ['Quantitative Engineering Interview Prep'],
      nextCourseSlug: '',
      courseId: '',
    },
  ];
};

export const fetchEnrolledCourses = async () => {
  try {
    const res = await API.get('/student/learning/enrolled');
    if (res.data && res.data.data) {
      return res.data.data;
    }
  } catch (err) {
    console.warn('[fetchEnrolledCourses API fallback]', err.message);
  }

  return MOCK_ENROLLMENTS;
};

export const enrollInCourse = async (courseId) => {
  try {
    const res = await API.post('/student/learning/enroll', { courseId });
    if (res.data) return res.data;
  } catch (err) {
    console.warn('[enrollInCourse API fallback]', err.message);
  }
  return { success: true, courseId };
};

export const markLessonComplete = async (courseId, lessonId) => {
  try {
    const res = await API.post(`/student/learning/courses/${courseId}/lessons/${lessonId}/complete`);
    if (res.data) return res.data;
  } catch (err) {
    console.warn('[markLessonComplete API fallback]', err.message);
  }
  return { success: true, courseId, lessonId };
};

export const fetchWishlist = async () => {
  try {
    const res = await API.get('/student/learning/wishlist');
    if (res.data && res.data.data) {
      return res.data.data;
    }
  } catch (err) {
    console.warn('[fetchWishlist API fallback]', err.message);
  }
  return MOCK_WISHLIST;
};

export const toggleWishlistApi = async (courseId) => {
  try {
    const res = await API.post('/student/learning/wishlist/toggle', { courseId });
    if (res.data) return res.data;
  } catch (err) {
    console.warn('[toggleWishlistApi fallback]', err.message);
  }
  return { success: true, courseId };
};

export const fetchProgressStats = async () => {
  try {
    const res = await API.get('/student/learning/progress-stats');
    if (res.data && res.data.data) {
      return res.data.data;
    }
  } catch (err) {
    console.warn('[fetchProgressStats API fallback]', err.message);
  }

  return {
    overallProgress: 72,
    learningStreak: '15 days',
    hoursLearned: '34.5 hrs',
    coursesCompleted: 5,
    coursesEnrolled: 12,
    weeklyActivity: [
      { day: 'Mon', hours: 2.5 },
      { day: 'Tue', hours: 4.0 },
      { day: 'Wed', hours: 1.5 },
      { day: 'Thu', hours: 3.5 },
      { day: 'Fri', hours: 5.0 },
      { day: 'Sat', hours: 2.0 },
      { day: 'Sun', hours: 3.0 },
    ],
    skillDistribution: [
      { skill: 'Quantitative Trading', score: 85 },
      { skill: 'DeFi & Smart Contracts', score: 92 },
      { skill: 'Financial Machine Learning', score: 78 },
      { skill: 'RegTech & Compliance', score: 88 },
      { skill: 'Digital Payments', score: 90 },
    ],
  };
};
