import API from './api';
import {
  MOCK_MENTOR_STATS,
  MOCK_MENTOR_STUDENTS,
  MOCK_MENTOR_SESSIONS,
  MOCK_CONNECT_REQUESTS,
  MOCK_MENTOR_PROFILE,
  MOCK_MENTOR_AVAILABILITY,
} from '../data/mockMentorData';

export const fetchMentorDashboard = async () => {
  try {
    const res = await API.get('/mentor/dashboard');
    return res.data.data;
  } catch (error) {
    console.warn('[Mentor API] Using fallback mock dashboard:', error.message);
    return {
      stats: MOCK_MENTOR_STATS,
      upcomingSessions: MOCK_MENTOR_SESSIONS.filter((s) => s.status === 'Upcoming'),
      recentStudents: MOCK_MENTOR_STUDENTS,
    };
  }
};

export const fetchMentorStudents = async () => {
  try {
    const res = await API.get('/mentor/students');
    return res.data.data;
  } catch (error) {
    console.warn('[Mentor API] Using fallback mock student directory');
    return MOCK_MENTOR_STUDENTS;
  }
};

export const fetchStudent360Details = async (studentId) => {
  try {
    const res = await API.get(`/mentor/students/${studentId}`);
    return res.data.data;
  } catch (error) {
    const found = MOCK_MENTOR_STUDENTS.find((s) => s.studentId === studentId);
    return found || MOCK_MENTOR_STUDENTS[0];
  }
};

export const fetchMentorConnectWorkspace = async () => {
  try {
    const res = await API.get('/mentor/connect');
    return res.data.data;
  } catch (error) {
    return {
      pendingRequests: MOCK_CONNECT_REQUESTS.filter((r) => r.status === 'pending'),
      activeMentorships: MOCK_MENTOR_STUDENTS.filter((s) => s.mentorshipStatus === 'Active'),
      recommendedStudents: [
        {
          studentId: 'st_rec_1',
          name: 'Karthik Raja',
          course: 'DeFi Protocols & Smart Contract Auditing',
          skillScore: '89%',
          reason: 'Top 5% performer in Smart Contract Auditing seeking HFT mentor.',
        },
        {
          studentId: 'st_rec_2',
          name: 'Divya Nair',
          course: 'RegTech Compliance & AML',
          skillScore: '85%',
          reason: 'Consistently high assessment scores in ISO 20022 messaging.',
        },
      ],
    };
  }
};

export const updateMentorshipRequestApi = async (requestId, action) => {
  try {
    const res = await API.post(`/mentor/connect/requests/${requestId}`, { action });
    return res.data;
  } catch (error) {
    const reqItem = MOCK_CONNECT_REQUESTS.find((r) => r.requestId === requestId);
    if (reqItem) reqItem.status = action === 'accept' ? 'accepted' : 'declined';
    return { success: true, message: `Request ${action}ed` };
  }
};

export const fetchMentorProfile = async () => {
  try {
    const res = await API.get('/mentor/profile');
    return res.data.data;
  } catch (error) {
    return MOCK_MENTOR_PROFILE;
  }
};

export const updateMentorProfileApi = async (payload) => {
  try {
    const res = await API.put('/mentor/profile', payload);
    return res.data.data;
  } catch (error) {
    Object.assign(MOCK_MENTOR_PROFILE, payload);
    return MOCK_MENTOR_PROFILE;
  }
};

export const fetchMentorAvailability = async () => {
  try {
    const res = await API.get('/mentor/availability');
    return res.data.data;
  } catch (error) {
    return MOCK_MENTOR_AVAILABILITY;
  }
};

export const updateMentorAvailabilityApi = async (payload) => {
  try {
    const res = await API.put('/mentor/availability', payload);
    return res.data.data;
  } catch (error) {
    Object.assign(MOCK_MENTOR_AVAILABILITY, payload);
    return MOCK_MENTOR_AVAILABILITY;
  }
};
