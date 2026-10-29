import API from './api';

export const fetchRecruiterApplications = async () => {
  const response = await API.get('/recruiter/applications');
  return response.data.data || [];
};

export const updateRecruiterApplicationStatus = async (applicationId, status) => {
  const response = await API.put(`/recruiter/applications/${encodeURIComponent(applicationId)}/status`, { status });
  return response.data.data;
};

export const fetchRecruiterInterviews = async () => {
  const response = await API.get('/recruiter/interviews');
  return response.data.data || [];
};

export const createRecruiterInterview = async (payload) => {
  const response = await API.post('/recruiter/interviews', payload);
  return response.data.data;
};

export const updateRecruiterInterview = async (interviewId, payload) => {
  const response = await API.put(`/recruiter/interviews/${encodeURIComponent(interviewId)}`, payload);
  return response.data.data;
};
