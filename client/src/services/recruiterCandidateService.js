import API from './api';

const normalizeSkill = (skill) => String(skill || '').toLowerCase().replace(/[^a-z0-9]/g, '');

const calculateMatch = (candidate, jobs) => {
  const activeJobs = (jobs || []).filter((job) => job.status === 'ACTIVE');
  const candidateSkills = (candidate.skills || []).map(normalizeSkill);
  const matches = activeJobs.map((job) => {
    const requiredSkills = job.requiredSkills || [];
    const matchedSkills = requiredSkills.filter((skill) => candidateSkills.includes(normalizeSkill(skill)));
    const missingSkills = requiredSkills.filter((skill) => !candidateSkills.includes(normalizeSkill(skill)));
    const skillRatio = requiredSkills.length ? (matchedSkills.length / requiredSkills.length) * 100 : 0;
    return {
      jobTitle: job.title,
      matchPercentage: requiredSkills.length ? Math.round(skillRatio) : null,
      matchedSkills,
      missingSkills,
    };
  });
  return matches.sort((left, right) => (right.matchPercentage ?? -1) - (left.matchPercentage ?? -1))[0] || {
    jobTitle: null,
    matchPercentage: null,
    matchedSkills: [],
    missingSkills: [],
  };
};

const enrichCandidates = (candidates, jobs) => candidates.map((candidate) => ({
  ...candidate,
  match: calculateMatch(candidate, jobs),
}));

export const fetchRecruiterCandidates = async () => {
  const [candidateResponse, jobsResponse] = await Promise.all([
    API.get('/recruiter/candidates'),
    API.get('/recruiter/jobs'),
  ]);
  return {
    candidates: enrichCandidates(candidateResponse.data.data || [], jobsResponse.data.data || []),
    usingFallback: false,
  };
};

export const fetchRecruiterCandidate = async (candidateId) => {
  const response = await API.get(`/recruiter/candidates/${candidateId}`);
  const candidate = response.data.data;
  if (!candidate || candidate.candidateId !== candidateId) {
    const notFoundError = new Error('Candidate not found');
    notFoundError.code = 'CANDIDATE_NOT_FOUND';
    throw notFoundError;
  }
  return candidate;
};

export { calculateMatch };
