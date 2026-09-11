import {
  SEEDED_MENTOR_STATS,
  SEEDED_MENTOR_STUDENTS,
  SEEDED_MENTOR_SESSIONS,
  SEEDED_CONNECT_REQUESTS,
  SEEDED_MENTOR_PROFILE,
  SEEDED_MENTOR_AVAILABILITY,
} from '../seed/mentorSeedData.js';

// Get Mentor Dashboard Data
export const getMentorDashboard = async (req, res) => {
  try {
    return res.json({
      success: true,
      data: {
        stats: SEEDED_MENTOR_STATS,
        upcomingSessions: SEEDED_MENTOR_SESSIONS.filter((s) => s.status === 'Upcoming'),
        recentStudents: SEEDED_MENTOR_STUDENTS,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get Mentor Students List
export const getMentorStudents = async (req, res) => {
  try {
    return res.json({
      success: true,
      data: SEEDED_MENTOR_STUDENTS,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get Single Student 360 Performance Details
export const getStudent360Details = async (req, res) => {
  try {
    const { studentId } = req.params;
    const student =
      SEEDED_MENTOR_STUDENTS.find((s) => s.studentId === studentId) || SEEDED_MENTOR_STUDENTS[0];

    return res.json({
      success: true,
      data: student,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get Mentor Connect Workspace Data
export const getMentorConnectWorkspace = async (req, res) => {
  try {
    const pendingRequests = SEEDED_CONNECT_REQUESTS.filter((r) => r.status === 'pending');
    const activeMentorships = SEEDED_MENTOR_STUDENTS.filter((s) => s.mentorshipStatus === 'Active');
    const recommendedStudents = [
      {
        studentId: 'st_rec_1',
        name: 'Karthik Raja',
        course: 'DeFi Protocols & Smart Contract Auditing',
        skillScore: '89%',
        reason: 'Top 5% performer in Smart Contract Auditing seeking HFT mentor.',
      },
      {
        studentId: 'st_rec_2',
        name: 'Divya Nair',
        course: 'RegTech Compliance & AML',
        skillScore: '85%',
        reason: 'Consistently high assessment scores in ISO 20022 messaging.',
      },
    ];

    return res.json({
      success: true,
      data: {
        pendingRequests,
        activeMentorships,
        recommendedStudents,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Update Mentorship Request (Accept/Decline)
export const updateMentorshipRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { action } = req.body; // 'accept' or 'decline'

    const reqItem = SEEDED_CONNECT_REQUESTS.find((r) => r.requestId === requestId);
    if (reqItem) {
      reqItem.status = action === 'accept' ? 'accepted' : 'declined';
    }

    return res.json({
      success: true,
      message: `Mentorship request ${action === 'accept' ? 'accepted' : 'declined'} successfully.`,
      data: reqItem || { requestId, status: action === 'accept' ? 'accepted' : 'declined' },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get Mentor Profile
export const getMentorProfile = async (req, res) => {
  try {
    return res.json({
      success: true,
      data: SEEDED_MENTOR_PROFILE,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Update Mentor Profile
export const updateMentorProfile = async (req, res) => {
  try {
    const profileData = req.body;
    Object.assign(SEEDED_MENTOR_PROFILE, profileData);

    return res.json({
      success: true,
      message: 'Mentor profile updated successfully!',
      data: SEEDED_MENTOR_PROFILE,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get Mentor Availability
export const getMentorAvailability = async (req, res) => {
  try {
    return res.json({
      success: true,
      data: SEEDED_MENTOR_AVAILABILITY,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Update Mentor Availability
export const updateMentorAvailability = async (req, res) => {
  try {
    const availabilityData = req.body;
    Object.assign(SEEDED_MENTOR_AVAILABILITY, availabilityData);

    return res.json({
      success: true,
      message: 'Availability schedule updated successfully!',
      data: SEEDED_MENTOR_AVAILABILITY,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
