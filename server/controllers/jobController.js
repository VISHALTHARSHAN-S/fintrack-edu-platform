import { SEEDED_JOBS, SEEDED_APPLICATIONS } from '../seed/recruiterSeedData.js';

// Get Jobs List
export const getJobs = async (req, res) => {
  try {
    return res.json({
      success: true,
      data: SEEDED_JOBS,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get Single Job Details
export const getJobDetails = async (req, res) => {
  try {
    const { jobId } = req.params;
    const job = SEEDED_JOBS.find((j) => j.jobId === jobId) || SEEDED_JOBS[0];
    const applicants = SEEDED_APPLICATIONS.filter((a) => a.jobId === jobId || a.jobId === 'job_101');

    return res.json({
      success: true,
      data: {
        ...job,
        applicants,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Create New Job
export const createJob = async (req, res) => {
  try {
    const jobData = req.body;
    const newJob = {
      jobId: `job_${Date.now()}`,
      title: jobData.title || 'FinTech Engineer',
      company: jobData.company || 'Nexus Financial Solutions',
      location: jobData.location || 'Chennai, India',
      workMode: jobData.workMode || 'Hybrid',
      employmentType: jobData.employmentType || 'Full-time',
      experienceLevel: jobData.experienceLevel || '0-2 Years',
      salaryRange: jobData.salaryRange || '₹10,00,000 - ₹15,00,000 P.A.',
      requiredSkills: Array.isArray(jobData.requiredSkills)
        ? jobData.requiredSkills
        : (jobData.requiredSkills || 'Python, FinTech Analytics').split(',').map((s) => s.trim()),
      preferredSkills: Array.isArray(jobData.preferredSkills)
        ? jobData.preferredSkills
        : (jobData.preferredSkills || 'SQL, Git').split(',').map((s) => s.trim()),
      description: jobData.description || 'Job description.',
      responsibilities: jobData.responsibilities || ['Engineering clean code.', 'Collaborating with team.'],
      requirements: jobData.requirements || ['Degree in CS or FinTech.'],
      applicationDeadline: jobData.applicationDeadline || new Date(Date.now() + 86400000 * 30),
      status: jobData.status || 'ACTIVE',
      applicantsCount: 0,
      shortlistedCount: 0,
      interviewCount: 0,
      postedAt: new Date(),
    };

    SEEDED_JOBS.unshift(newJob);

    return res.json({
      success: true,
      message: 'Job posting created successfully!',
      data: newJob,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Update Job Status / Details
export const updateJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const updates = req.body;

    const job = SEEDED_JOBS.find((j) => j.jobId === jobId);
    if (job) {
      Object.assign(job, updates);
    }

    return res.json({
      success: true,
      message: 'Job updated successfully!',
      data: job || { jobId, ...updates },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
