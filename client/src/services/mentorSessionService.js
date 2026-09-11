import API from './api';
import { MOCK_MENTOR_SESSIONS, MOCK_MENTOR_STUDENTS } from '../data/mockMentorData';

export const fetchMentorSessions = async () => {
  try {
    const res = await API.get('/mentor/sessions');
    return res.data.data;
  } catch (error) {
    console.warn('[Mentor Sessions API] Using fallback mock sessions');
    return MOCK_MENTOR_SESSIONS;
  }
};

export const fetchSessionDetails = async (sessionId) => {
  try {
    const res = await API.get(`/mentor/sessions/${sessionId}`);
    return res.data.data;
  } catch (error) {
    const session = MOCK_MENTOR_SESSIONS.find((s) => s.sessionId === sessionId) || MOCK_MENTOR_SESSIONS[0];
    const student = MOCK_MENTOR_STUDENTS.find((st) => st.studentId === session.studentId) || MOCK_MENTOR_STUDENTS[0];
    return { ...session, student };
  }
};

export const createSessionApi = async (payload) => {
  try {
    const res = await API.post('/mentor/sessions/new', payload);
    return res.data;
  } catch (error) {
    const student = MOCK_MENTOR_STUDENTS.find((s) => s.studentId === payload.studentId);
    const newSession = {
      sessionId: `sess_${Date.now()}`,
      studentId: payload.studentId,
      studentName: student ? student.name : 'Vishaltharshan S',
      topic: payload.topic || '1-on-1 Mentorship',
      sessionType: payload.sessionType || '1-on-1 Mentorship',
      date: payload.date || new Date().toISOString(),
      timeSlot: payload.timeSlot || '10:00 AM - 10:45 AM',
      durationMinutes: 45,
      status: 'Upcoming',
      meetingLink: 'https://meet.fintrack.edu/session-room',
      notes: payload.notes || '',
      agenda: payload.agenda || '',
    };
    MOCK_MENTOR_SESSIONS.unshift(newSession);
    return { success: true, message: 'Session booked successfully!', data: newSession };
  }
};

export const updateSessionStatusApi = async (sessionId, payload) => {
  try {
    const res = await API.put(`/mentor/sessions/${sessionId}`, payload);
    return res.data;
  } catch (error) {
    const session = MOCK_MENTOR_SESSIONS.find((s) => s.sessionId === sessionId);
    if (session) {
      if (payload.status) session.status = payload.status;
      if (payload.notes) session.notes = payload.notes;
    }
    return { success: true, message: 'Session status updated' };
  }
};
