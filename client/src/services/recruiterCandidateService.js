import API from './api';

const MOCK_CANDIDATES = [
  {
    candidateId: 'mock_cand_201',
    studentId: 'mock_student_201',
    name: 'Demo Candidate',
    email: 'candidate@example.com',
    avatar: '',
    education: 'B.Tech Financial Technology',
    location: 'Chennai, India',
    experience: 'FinTech Project Intern',
    skills: ['Python', 'SQL', 'Financial Markets'],
    overallSkillScore: 86,
    practiceAccuracy: 84,
    assessmentScore: '85%',
    careerReadinessScore: 82,
    verifiedBadge: 'FinTrack Verified',
    availability: 'Immediate',
    careerObjective: 'FinTech engineer focused on quantitative analytics.',
    strengths: ['Python for Finance', 'Risk Analytics'],
    weakAreas: ['System Design'],
    applicationHistory: [],
    skillPassport: { verifiedSkills: [], certifications: [], projects: [], badges: [] },
  },
];

const normalizeSkill = (skill) => skill.toLowerCase().replace(/[^a-z0-9]/g, '');

const calculateMatch = (candidate, jobs) => {
  const activeJobs = (jobs || []).filter((job) => job.status === 'ACTIVE');
  const candidateSkills = (candidate.skills || []).map(normalizeSkill);
  const matches = activeJobs.map((job) => {
    const requiredSkills = job.requiredSkills || [];
    const matchedSkills = requiredSkills.filter((skill) => candidateSkills.includes(normalizeSkill(skill)));
    const missingSkills = requiredSkills.filter((skill) => !candidateSkills.includes(normalizeSkill(skill)));
    const skillRatio = requiredSkills.length ? (matchedSkills.length / requiredSkills.length) * 100 : 0;
    const assessmentScore = Number.parseInt(candidate.assessmentScore, 10) || 0;
    const matchPercentage = Math.round((skillRatio * 0.6) + (assessmentScore * 0.2) + (candidate.careerReadinessScore * 0.2));
    return { jobTitle: job.title, matchPercentage, matchedSkills, missingSkills };
  });
  return matches.sort((left, right) => right.matchPercentage - left.matchPercentage)[0] || {
    jobTitle: 'Active FinTech roles',
    matchPercentage: candidate.careerReadinessScore || candidate.overallSkillScore || 0,
    matchedSkills: candidate.skills || [],
    missingSkills: [],
  };
};

const enrichCandidates = (candidates, jobs) => candidates.map((candidate) => ({
  ...candidate,
  match: calculateMatch(candidate, jobs),
}));

export const fetchRecruiterCandidates = async () => {
  try {
    const [candidateResponse, jobsResponse] = await Promise.all([
      API.get('/recruiter/candidates'),
      API.get('/recruiter/jobs'),
    ]);
    return {
      candidates: enrichCandidates(candidateResponse.data.data || [], jobsResponse.data.data || []),
      usingFallback: false,
    };
  } catch (error) {
    console.warn('[Recruiter Candidates API] Using fallback candidates:', error.message);
    return { candidates: enrichCandidates(MOCK_CANDIDATES, []), usingFallback: true, error };
  }
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
