import { SEEDED_MENTOR_SESSIONS, SEEDED_MENTOR_STUDENTS } from '../seed/mentorSeedData.js';

// Get All Mentoring Sessions
export const getMentorSessions = async (req, res) => {
  try {
    return res.json({
      success: true,
      data: SEEDED_MENTOR_SESSIONS,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get Session Details
export const getSessionDetails = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session =
      SEEDED_MENTOR_SESSIONS.find((s) => s.sessionId === sessionId) || SEEDED_MENTOR_SESSIONS[0];

    const student =
      SEEDED_MENTOR_STUDENTS.find((st) => st.studentId === session.studentId) ||
      SEEDED_MENTOR_STUDENTS[0];

    return res.json({
      success: true,
      data: {
        ...session,
        student,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Create New Session Booking
export const createSession = async (req, res) => {
  try {
    const { studentId, topic, sessionType, date, timeSlot, agenda, notes } = req.body;

    const student = SEEDED_MENTOR_STUDENTS.find((s) => s.studentId === studentId);
    const newSession = {
      sessionId: `sess_${Date.now()}`,
      studentId: studentId || 'st_101',
      studentName: student ? student.name : 'Vishaltharshan S',
      topic: topic || '1-on-1 Mentorship Session',
      sessionType: sessionType || '1-on-1 Mentorship',
      date: date ? new Date(date) : new Date(),
      timeSlot: timeSlot || '10:00 AM - 10:45 AM',
      durationMinutes: 45,
      status: 'Upcoming',
      meetingLink: 'https://meet.fintrack.edu/session-room',
      notes: notes || 'Pre-session preparations noted.',
      agenda: agenda || '1. Discussion\n2. Q&A',
    };

    SEEDED_MENTOR_SESSIONS.unshift(newSession);

    return res.json({
      success: true,
      message: 'Mentoring session booked successfully!',
      data: newSession,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Update Session Status (Reschedule / Cancel)
export const updateSessionStatus = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { status, date, timeSlot, notes } = req.body;

    const session = SEEDED_MENTOR_SESSIONS.find((s) => s.sessionId === sessionId);
    if (session) {
      if (status) session.status = status;
      if (date) session.date = new Date(date);
      if (timeSlot) session.timeSlot = timeSlot;
      if (notes) session.notes = notes;
    }

    return res.json({
      success: true,
      message: `Session updated successfully.`,
      data: session || { sessionId, status },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
