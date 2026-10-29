import API from './api';

const request = async (promise, fallback) => {
  try {
    const response = await promise;
    return response.data.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || fallback);
  }
};

export const fetchCareerDashboard = () =>
  request(API.get('/student/career/dashboard'), 'Unable to load your career dashboard.');
export const fetchCareerProfile = () =>
  request(API.get('/student/career/profile'), 'Unable to load your career profile.');
export const saveCareerProfile = (payload) =>
  request(API.put('/student/career/profile', payload), 'Unable to save your career profile.');
export const fetchStudentJobs = (params = {}) =>
  request(API.get('/student/career/jobs', { params }), 'Unable to load jobs.');
export const fetchStudentJob = (jobId) =>
  request(API.get(`/student/career/jobs/${encodeURIComponent(jobId)}`), 'Unable to load job details.');
export const applyForStudentJob = (jobId, payload) =>
  request(API.post(`/student/career/jobs/${encodeURIComponent(jobId)}/apply`, payload), 'Unable to submit your application.');
export const fetchStudentApplications = () =>
  request(API.get('/student/career/applications'), 'Unable to load your applications.');
export const fetchStudentInterviews = () =>
  request(API.get('/student/career/interviews'), 'Unable to load your interviews.');
