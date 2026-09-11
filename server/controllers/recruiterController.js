import {
  SEEDED_RECRUITER_STATS,
  SEEDED_CANDIDATES,
  SEEDED_JOBS,
  SEEDED_APPLICATIONS,
  SEEDED_INTERVIEWS,
  SEEDED_RECRUITER_PROFILE,
  SEEDED_SKILL_PASSPORT,
  SEEDED_RECRUITER_MESSAGES,
} from '../seed/recruiterSeedData.js';

// Recruiter Dashboard Data
export const getRecruiterDashboard = async (req, res) => {
  try {
    return res.json({
      success: true,
      data: {
        stats: {
          ...SEEDED_RECRUITER_STATS,
          applications: SEEDED_RECRUITER_STATS.totalApplicants,
        },
        recentApplications: SEEDED_APPLICATIONS.slice(0, 5),
        candidatePipeline: {
          applied: 42,
          screening: 28,
          shortlisted: 18,
          interview: 6,
          hired: 12,
        },
        activeJobs: SEEDED_JOBS.filter((j) => j.status === 'ACTIVE').map((job) => ({
          ...job,
          id: job.jobId,
          applicants: job.applicantsCount,
          posted: job.postedAt,
        })),
        upcomingInterviews: SEEDED_INTERVIEWS.filter((i) => i.status === 'SCHEDULED'),
        recommendedCandidates: SEEDED_CANDIDATES.map((candidate) => ({
          ...candidate,
          id: candidate.candidateId,
          role: candidate.preferredRoles?.[0] || candidate.careerObjective,
          skillScore: `${candidate.overallSkillScore}%`,
          match: `${candidate.careerReadinessScore}%`,
        })),
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Candidate Discovery Roster
export const getCandidates = async (req, res) => {
  try {
    return res.json({
      success: true,
      data: SEEDED_CANDIDATES,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Single Candidate 360° Profile Details for Recruiter
export const getCandidateDetails = async (req, res) => {
  try {
    const { candidateId } = req.params;
    const candidate =
      SEEDED_CANDIDATES.find((c) => c.candidateId === candidateId) || SEEDED_CANDIDATES[0];

    return res.json({
      success: true,
      data: {
        ...candidate,
        skillPassport: SEEDED_SKILL_PASSPORT,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Recruiter Profile
export const getRecruiterProfile = async (req, res) => {
  try {
    return res.json({
      success: true,
      data: SEEDED_RECRUITER_PROFILE,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Update Recruiter Profile
export const updateRecruiterProfile = async (req, res) => {
  try {
    const payload = req.body;
    Object.assign(SEEDED_RECRUITER_PROFILE, payload);
    return res.json({
      success: true,
      message: 'Recruiter profile updated successfully!',
      data: SEEDED_RECRUITER_PROFILE,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Interview scheduling and status management
export const getInterviews = async (req, res) => {
  try {
    return res.json({ success: true, data: SEEDED_INTERVIEWS });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getInterviewDetails = async (req, res) => {
  try {
    const interview = SEEDED_INTERVIEWS.find((item) => item.interviewId === req.params.interviewId);
    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview not found' });
    }
    return res.json({ success: true, data: interview });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createInterview = async (req, res) => {
  try {
    const interview = {
      interviewId: `int_${Date.now()}`,
      status: 'SCHEDULED',
      durationMinutes: 45,
      ...req.body,
      date: req.body.date ? new Date(req.body.date) : new Date(),
    };
    SEEDED_INTERVIEWS.unshift(interview);
    return res.status(201).json({ success: true, message: 'Interview scheduled successfully', data: interview });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateInterview = async (req, res) => {
  try {
    const interview = SEEDED_INTERVIEWS.find((item) => item.interviewId === req.params.interviewId);
    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview not found' });
    }
    Object.assign(interview, req.body);
    if (req.body.date) interview.date = new Date(req.body.date);
    return res.json({ success: true, message: 'Interview updated successfully', data: interview });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Recruiter messaging workspace
export const getRecruiterConversations = async (req, res) => {
  try {
    const conversations = SEEDED_RECRUITER_MESSAGES.map(({ messages, ...conversation }) => ({
      ...conversation,
      lastMessage: messages[messages.length - 1]?.text || '',
    }));
    return res.json({ success: true, data: conversations });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getRecruiterMessageHistory = async (req, res) => {
  try {
    const conversation = SEEDED_RECRUITER_MESSAGES.find(
      (item) => item.candidateId === req.params.candidateId
    );
    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }
    conversation.unreadCount = 0;
    return res.json({ success: true, data: conversation });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const sendRecruiterMessage = async (req, res) => {
  try {
    const { candidateId, text } = req.body;
    if (!candidateId || !text) {
      return res.status(400).json({ success: false, message: 'candidateId and text are required' });
    }
    const conversation = SEEDED_RECRUITER_MESSAGES.find((item) => item.candidateId === candidateId);
    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }
    const message = {
      id: `rm_${Date.now()}`,
      senderId: req.user?.id || 'rec_101',
      text,
      timestamp: new Date().toISOString(),
    };
    conversation.messages.push(message);
    conversation.lastMessageTime = 'Just now';
    return res.status(201).json({ success: true, data: message });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
