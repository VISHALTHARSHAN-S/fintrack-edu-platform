import { StudentProfile } from '../models/StudentProfile.js';
import { MentorProfile } from '../models/MentorProfile.js';
import { RecruiterProfile } from '../models/RecruiterProfile.js';

export const getStudentDashboardData = async (req, res) => {
  try {
    const data = {
      stats: {
        coursesEnrolled: 12,
        coursesCompleted: 5,
        certificatesEarned: 6,
        skillScore: '83%',
        learningStreak: '15 days',
      },
      learningProgress: [
        { id: 1, title: 'Algorithmic Trading & High-Frequency Strategies', progress: 78, category: 'Quant', lastAccessed: '2 hours ago' },
        { id: 2, title: 'Financial Machine Learning & Risk Modeling', progress: 45, category: 'AI & Finance', lastAccessed: 'Yesterday' },
        { id: 3, title: 'DeFi Protocols & Smart Contract Auditing', progress: 92, category: 'Blockchain', lastAccessed: '3 days ago' },
      ],
      recommendedCourses: [
        { id: 4, title: 'RegTech Compliance & Anti-Money Laundering Systems', level: 'Intermediate', duration: '6 hours' },
        { id: 5, title: 'Quantitative Portfolio Optimization with Python', level: 'Advanced', duration: '10 hours' },
      ],
      upcomingLiveClasses: [
        { id: 101, title: 'Live Q&A: Building HFT Bots in C++', mentor: 'Dr. Aris Vance', time: 'Today at 6:00 PM', status: 'Upcoming' },
        { id: 102, title: 'Regulatory Reporting & API Integration', mentor: 'Elena Rostova', time: 'Tomorrow at 4:00 PM', status: 'Scheduled' },
      ],
    };

    return res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMentorDashboardData = async (req, res) => {
  try {
    const data = {
      stats: {
        activeStudents: 48,
        upcomingSessions: 6,
        completedSessions: 124,
        unreadMessages: 5,
      },
      upcomingSessions: [
        { id: 201, studentName: 'Vishaltharshan S', topic: 'HFT Strategy Review & Backtesting', time: 'Today, 6:00 PM', type: '1-on-1 Mentorship' },
        { id: 202, studentName: 'Priya Sharma', topic: 'Quant Portfolio Risk Assessment', time: 'Tomorrow, 2:30 PM', type: 'Code Review' },
      ],
      recentStudents: [
        { id: 301, name: 'Vishaltharshan S', course: 'Algorithmic Trading', score: '94%', activity: 'Submitted Backtest Script' },
        { id: 302, name: 'Karthik Raja', course: 'DeFi Protocols', score: '88%', activity: 'Completed Smart Contract Audit' },
      ],
    };

    return res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getRecruiterDashboardData = async (req, res) => {
  try {
    const data = {
      stats: {
        availableCandidates: 340,
        activeJobs: 8,
        applications: 142,
        shortlistedCandidates: 18,
      },
      recommendedCandidates: [
        { id: 401, name: 'Vishaltharshan S', role: 'Quant Engineer', skillScore: '94%', verifiedBadge: 'Naan Mudhalvan Gold', match: '98%' },
        { id: 402, name: 'Ananya Roy', role: 'FinTech Full Stack Developer', skillScore: '91%', verifiedBadge: 'Naan Mudhalvan Platinum', match: '95%' },
        { id: 403, name: 'Rahul Mehta', role: 'Blockchain Security Analyst', skillScore: '89%', verifiedBadge: 'Naan Mudhalvan Gold', match: '92%' },
      ],
      activeJobs: [
        { id: 501, title: 'Junior Quantitative Developer', applicants: 42, status: 'Active', posted: '3 days ago' },
        { id: 502, title: 'FinTech Compliance Specialist', applicants: 28, status: 'Active', posted: '1 week ago' },
      ],
    };

    return res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
