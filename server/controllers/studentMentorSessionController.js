import mongoose from 'mongoose';
import { MentorSession } from '../models/MentorSession.js';
import { getBookingContext, slotsWithinWorkingHours } from './studentMentorController.js';
import { createUserNotification } from '../services/notificationService.js';

const validStatuses = ['Upcoming', 'Completed', 'Cancelled'];

const sessionQuery = (studentId, sessionId) => {
  const query = { studentId };
  if (sessionId) query.sessionId = sessionId;
  return query;
};

const mapSession = (session) => ({
  ...session,
  mentor: session.mentorId && typeof session.mentorId === 'object'
    ? {
        mentorId: session.mentorId._id?.toString(),
        name: session.mentorId.name,
        avatar: session.mentorId.avatar || '',
      }
    : null,
  mentorId: session.mentorId && typeof session.mentorId === 'object'
    ? session.mentorId._id?.toString()
    : session.mentorId?.toString(),
});

export const getStudentMentorSessions = async (req, res) => {
  try {
    const query = sessionQuery(req.user.id);
    if (req.query.status) {
      if (!validStatuses.includes(req.query.status)) {
        return res.status(400).json({ success: false, message: 'Invalid session status.' });
      }
      query.status = req.query.status;
    }

    const sessions = await MentorSession.find(query)
      .populate('mentorId', 'name avatar')
      .sort({ date: 1, createdAt: 1 })
      .lean();
    const sortedSessions = sessions.sort((left, right) => {
      if (left.status === 'Upcoming' && right.status !== 'Upcoming') return -1;
      if (left.status !== 'Upcoming' && right.status === 'Upcoming') return 1;
      return left.status === 'Upcoming'
        ? new Date(left.date) - new Date(right.date)
        : new Date(right.date) - new Date(left.date);
    });

    return res.json({ success: true, data: sortedSessions.map(mapSession) });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Unable to load your mentoring sessions.' });
  }
};

export const getStudentMentorSession = async (req, res) => {
  try {
    const session = await MentorSession.findOne(sessionQuery(req.user.id, req.params.sessionId))
      .populate('mentorId', 'name avatar')
      .lean();
    if (!session) return res.status(404).json({ success: false, message: 'Mentor session not found.' });
    return res.json({ success: true, data: mapSession(session) });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Unable to load mentor session.' });
  }
};

export const cancelStudentMentorSession = async (req, res) => {
  try {
    const session = await MentorSession.findOneAndUpdate(
      { ...sessionQuery(req.user.id, req.params.sessionId), status: 'Upcoming' },
      { $set: { status: 'Cancelled' } },
      { new: true, runValidators: true }
    ).populate('mentorId', 'name avatar').lean();
    if (!session) return res.status(404).json({ success: false, message: 'Only an upcoming session owned by you can be cancelled.' });
    await createUserNotification({
      userId: session.mentorId?._id || session.mentorId,
      eventKey: `mentor-session:${session.sessionId}:cancelled`,
      title: 'Mentor session cancelled',
      message: `${session.studentName} cancelled the session scheduled for ${new Date(session.date).toLocaleDateString()}.`,
      category: 'mentor',
      type: 'warning',
      link: '/mentor/sessions',
    });
    return res.json({ success: true, message: 'Mentor session cancelled successfully.', data: mapSession(session) });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Unable to cancel mentor session.' });
  }
};

export const rescheduleStudentMentorSession = async (req, res) => {
  try {
    const { date, timeSlot } = req.body;
    const session = await MentorSession.findOne({
      ...sessionQuery(req.user.id, req.params.sessionId),
      status: 'Upcoming',
    }).lean();
    if (!session) return res.status(404).json({ success: false, message: 'Only an upcoming session owned by you can be rescheduled.' });

    const context = await getBookingContext(session.mentorId.toString(), date);
    if (context.error) return res.status(context.status).json({ success: false, message: context.error });

    const currentSessionId = session.sessionId;
    const otherSessions = context.sessions.filter((item) => item.sessionId !== currentSessionId);
    const bookedSlots = new Set(otherSessions.map((item) => item.timeSlot));
    const selectedSlot = slotsWithinWorkingHours(context.daySchedule).find((slot) => slot.time === timeSlot?.trim());
    if (!selectedSlot) return res.status(400).json({ success: false, message: 'The selected time slot is invalid.' });
    if (otherSessions.length >= context.availability.maxSessionsPerDay) {
      return res.status(400).json({ success: false, message: 'The mentor has reached the session limit for this date.' });
    }
    if (bookedSlots.has(selectedSlot.time)) {
      return res.status(409).json({ success: false, message: 'This time slot is no longer available.' });
    }

    try {
      const updatedSession = await MentorSession.findOneAndUpdate(
        { ...sessionQuery(req.user.id, req.params.sessionId), status: 'Upcoming' },
        { $set: { date: context.dateRange.start, timeSlot: selectedSlot.time } },
        { new: true, runValidators: true }
      ).populate('mentorId', 'name avatar').lean();
      if (!updatedSession) return res.status(404).json({ success: false, message: 'Mentor session not found.' });
      await createUserNotification({
        userId: updatedSession.mentorId?._id || updatedSession.mentorId,
        eventKey: `mentor-session:${updatedSession.sessionId}:rescheduled:${context.dateRange.start.toISOString()}:${selectedSlot.time}`,
        title: 'Mentor session rescheduled',
        message: `${updatedSession.studentName} rescheduled the session to ${date} at ${selectedSlot.time}.`,
        category: 'mentor',
        link: '/mentor/sessions',
      });
      return res.json({ success: true, message: 'Mentor session rescheduled successfully.', data: mapSession(updatedSession) });
    } catch (error) {
      if (error?.code === 11000) return res.status(409).json({ success: false, message: 'This time slot is no longer available.' });
      throw error;
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Unable to reschedule mentor session.' });
  }
};