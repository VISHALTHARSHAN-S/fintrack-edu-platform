import API from './api';

export const fetchRecruiterJobs = async () => {
  const response = await API.get('/recruiter/jobs');
  return { jobs: response.data.data || [], usingFallback: false };
};

export const fetchRecruiterJob = async (jobId) => {
  const response = await API.get(`/recruiter/jobs/${jobId}`);
  return response.data.data;
};

export const createRecruiterJob = async (payload) => {
  const response = await API.post('/recruiter/jobs', payload);
  return response.data.data;
};

export const updateRecruiterJob = async (jobId, payload) => {
  const response = await API.put(`/recruiter/jobs/${jobId}`, payload);
  return response.data.data;
};
