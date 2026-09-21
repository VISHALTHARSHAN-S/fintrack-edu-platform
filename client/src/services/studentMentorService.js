import API from './api';

export const getMentors = async (params = {}) => {
  const response = await API.get('/student/mentors', { params });
  return response.data;
};

export const getRecommendedMentors = async () => {
  const response = await API.get('/student/mentors/recommended');
  return response.data.data;
};

export const getMentorProfile = async (mentorId) => {
  const response = await API.get(`/student/mentors/${mentorId}`);
  return response.data.data;
};

export const getMentorAvailability = async (mentorId, date) => {
  const response = await API.get(`/student/mentors/${mentorId}/availability`, { params: { date } });
  return response.data.data;
};

export const bookMentorSession = async (mentorId, payload) => {
  const response = await API.post(`/student/mentors/${mentorId}/book`, payload);
  return response.data;
};

export const getStudentMentorSessions = async (status) => {
  const response = await API.get('/student/mentor-sessions', { params: status ? { status } : {} });
  return response.data.data;
};

export const getStudentMentorSession = async (sessionId) => {
  const response = await API.get(`/student/mentor-sessions/${sessionId}`);
  return response.data.data;
};

export const cancelMentorSession = async (sessionId) => {
  const response = await API.put(`/student/mentor-sessions/${sessionId}/cancel`);
  return response.data;
};

export const rescheduleMentorSession = async (sessionId, payload) => {
  const response = await API.put(`/student/mentor-sessions/${sessionId}/reschedule`, payload);
  return response.data;
};

export const getStudentMentorConversations = async () => {
  const response = await API.get('/student/mentor-messages');
  return response.data.data;
};

export const getStudentMentorConversation = async (mentorId) => {
  const response = await API.get(`/student/mentor-messages/${mentorId}`);
  return response.data.data;
};

export const sendStudentMentorMessage = async (mentorId, message) => {
  const response = await API.post('/student/mentor-messages', { mentorId, message });
  return response.data.data;
};

export const getStudentSessionFeedback = async (sessionId) => {
  const response = await API.get(`/student/mentor-sessions/${sessionId}/feedback`);
  return response.data.data;
};

export const submitStudentSessionFeedback = async (sessionId, payload) => {
  const response = await API.post(`/student/mentor-sessions/${sessionId}/feedback`, payload);
  return response.data;
};

export const sendStudentMentorFile = async (mentorId, file) => {
  const formData = new FormData();
  formData.append('mentorId', mentorId);
  formData.append('file', file);
  const response = await API.post('/student/mentor-messages/file', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
  return response.data.data;
};