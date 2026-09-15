import API from './api';

export const getClassWindowState = (liveClass) => {
  const scheduledAt = new Date(liveClass.scheduledAt);
  const durationMs = Number(liveClass.durationMinutes || 60) * 60 * 1000;
  const joinWindowStart = new Date(scheduledAt.getTime() - 10 * 60 * 1000);
  const classEndAt = new Date(scheduledAt.getTime() + durationMs);
  const now = new Date();

  if (liveClass.status === 'cancelled') {
    return { label: 'CANCELLED', status: 'cancelled', joinAllowed: false, isLive: false, isStartingSoon: false, isCompleted: false };
  }

  if (now < joinWindowStart) {
    return { label: 'STARTING SOON', status: 'scheduled', joinAllowed: false, isLive: false, isStartingSoon: true, isCompleted: false };
  }

  if (now >= joinWindowStart && now < scheduledAt) {
    return { label: 'STARTING SOON', status: 'scheduled', joinAllowed: true, isLive: false, isStartingSoon: true, isCompleted: false };
  }

  if (now >= scheduledAt && now <= classEndAt) {
    return { label: 'LIVE NOW', status: 'live', joinAllowed: true, isLive: true, isStartingSoon: false, isCompleted: false };
  }

  return { label: 'COMPLETED', status: 'completed', joinAllowed: false, isLive: false, isStartingSoon: false, isCompleted: true };
};

export const fetchStudentLiveClasses = async () => {
  const res = await API.get('/student/live-classes');
  return res?.data?.data || [];
};

export const fetchLiveClassById = async (classId) => {
  const res = await API.get(`/student/live-classes/${classId}`);
  return res?.data?.data || null;
};

export const joinLiveClass = async (classId) => {
  const res = await API.post(`/student/live-classes/${classId}/join`);
  return res?.data || { success: false, message: 'Unable to join this class right now.' };
};

export const leaveLiveClass = async (classId) => {
  const res = await API.post(`/student/live-classes/${classId}/leave`);
  return res?.data || { success: false, message: 'Unable to leave this class right now.' };
};

export const fetchLiveClassRecording = async (classId) => {
  const res = await API.get(`/student/live-classes/${classId}/recording`);
  return res?.data || { success: false, message: 'Unable to load the recording right now.' };
};
