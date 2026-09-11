import API from './api';

const MOCK_JOBS = [
  {
    jobId: 'mock_job_101',
    title: 'Junior Quantitative Developer',
    company: 'Nexus Financial Solutions',
    location: 'Chennai, India',
    workMode: 'Hybrid',
    employmentType: 'Full-time',
    experienceLevel: '0-2 Years',
    salaryRange: 'INR 12,00,000 - INR 18,00,000 P.A.',
    requiredSkills: ['Python', 'C++', 'Financial Markets'],
    preferredSkills: ['SQL', 'Git'],
    description: 'Build low-latency trading algorithms and risk analytics dashboards.',
    responsibilities: ['Implement market data pipelines', 'Optimize backtesting simulations'],
    requirements: ['Strong data structures and algorithms knowledge'],
    applicationDeadline: '2026-10-15T23:59:59.000Z',
    status: 'ACTIVE',
    applicantsCount: 42,
    postedAt: '2026-09-08T10:00:00.000Z',
  },
];

export const fetchRecruiterJobs = async () => {
  try {
    const response = await API.get('/recruiter/jobs');
    return { jobs: response.data.data || [], usingFallback: false };
  } catch (error) {
    console.warn('[Recruiter Jobs API] Using fallback jobs:', error.message);
    return { jobs: MOCK_JOBS, usingFallback: true, error };
  }
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
