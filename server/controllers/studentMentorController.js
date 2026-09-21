import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { MentorProfile } from '../models/MentorProfile.js';
import { MentorAvailability } from '../models/MentorAvailability.js';
import { MentorSession } from '../models/MentorSession.js';

const publicUserFields = 'name avatar';
const sessionTypes = ['1-on-1 Mentorship', 'Code Review', 'Career Guidance', 'Project Consultation'];
const weekdayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const dateKeyPattern = /^\d{4}-\d{2}-\d{2}$/;

const getDateRange = (dateValue) => {
  if (typeof dateValue !== 'string' || !dateKeyPattern.test(dateValue)) return null;
  const start = new Date(`${dateValue}T00:00:00.000Z`);
  if (Number.isNaN(start.getTime()) || start.toISOString().slice(0, 10) !== dateValue) return null;
  return { start, end: new Date(start.getTime() + 24 * 60 * 60 * 1000) };
};

const isFutureDate = (dateRange) => {
  const today = new Date();
  const todayKey = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
  return dateRange.start > todayKey;
};

const timeToMinutes = (value) => {
  const match = value?.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return null;
  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours < 1 || hours > 12 || minutes > 59) return null;
  if (match[3].toUpperCase() === 'PM' && hours !== 12) hours += 12;
  if (match[3].toUpperCase() === 'AM' && hours === 12) hours = 0;
  return hours * 60 + minutes;
};

const getSlotBounds = (slotTime) => {
  const parts = slotTime?.split(' - ');
  if (!parts || parts.length !== 2) return null;
  const start = timeToMinutes(parts[0]);
  const end = timeToMinutes(parts[1]);
  return start === null || end === null || end <= start ? null : { start, end };
};

export const getBookingContext = async (mentorId, dateValue) => {
  if (!mongoose.isValidObjectId(mentorId)) return { error: 'Mentor not found.', status: 404 };
  const dateRange = getDateRange(dateValue);
  if (!dateRange) return { error: 'Please provide a valid date in YYYY-MM-DD format.', status: 400 };
  if (!isFutureDate(dateRange)) return { error: 'Sessions must be booked for a future date.', status: 400 };

  const user = await User.findOne({ _id: mentorId, role: 'mentor', status: 'active' }).select(publicUserFields).lean();
  const profile = user ? await MentorProfile.findOne({ userId: user._id }).lean() : null;
  const availability = user ? await MentorAvailability.findOne({ mentorId: user._id }).lean() : null;
  if (!user || !profile || !availability) return { error: 'Mentor is not available for booking.', status: 404 };

  const weekday = weekdayNames[dateRange.start.getUTCDay()];
  const daySchedule = availability.weeklySchedule?.find((day) => day.day === weekday);
  if (!daySchedule?.isEnabled) return { error: 'The mentor is unavailable on this date.', status: 400 };

  const sessions = await MentorSession.find({
    mentorId: user._id,
    date: { $gte: dateRange.start, $lt: dateRange.end },
    status: 'Upcoming',
  }).select('sessionId timeSlot studentId').lean();
  const bookedSlots = new Set(sessions.map((session) => session.timeSlot));

  return { user, profile, availability, daySchedule, dateRange, sessions, bookedSlots };
};

export const slotsWithinWorkingHours = (daySchedule) => {
  const workingStart = timeToMinutes(daySchedule.startTime);
  const workingEnd = timeToMinutes(daySchedule.endTime);
  return (daySchedule.slots || []).filter((slot) => {
    const bounds = getSlotBounds(slot.time);
    return bounds && workingStart !== null && workingEnd !== null && bounds.start >= workingStart && bounds.end <= workingEnd;
  });
};

const mapMentor = (user, profile, availability) => ({
  mentorId: user._id.toString(),
  name: user.name,
  avatar: user.avatar || '',
  designation: profile.designation || '',
  company: profile.company || '',
  expertise: profile.expertise || '',
  rating: profile.rating,
  availability: availability
    ? {
        available: availability.weeklySchedule?.some((day) => day.isEnabled),
        availableDays: (availability.weeklySchedule || [])
          .filter((day) => day.isEnabled)
          .map((day) => day.day),
      }
    : null,
});

const getActiveMentorUsers = async () =>
  User.find({ role: 'mentor', status: 'active' }).select(publicUserFields).lean();

const getMentorProfiles = async (users, query = {}) => {
  const userIds = users.map((user) => user._id);
  const profiles = await MentorProfile.find({ userId: { $in: userIds }, ...query })
    .sort({ rating: -1, completedSessionsCount: -1, createdAt: 1 })
    .lean();
  const profileByUserId = new Map(profiles.map((profile) => [profile.userId.toString(), profile]));
  const eligibleUsers = users.filter((user) => profileByUserId.has(user._id.toString()));
  const availabilities = await MentorAvailability.find({
    mentorId: { $in: eligibleUsers.map((user) => user._id) },
  }).lean();
  const availabilityByMentorId = new Map(
    availabilities.map((availability) => [availability.mentorId.toString(), availability])
  );

  return eligibleUsers.map((user) =>
    mapMentor(
      user,
      profileByUserId.get(user._id.toString()),
      availabilityByMentorId.get(user._id.toString())
    )
  );
};

export const getStudentMentors = async (req, res) => {
  try {
    if (!req.isDbConnected) {
      return res.json({ success: true, data: [], pagination: { page: 1, limit: 12, total: 0, pages: 0 } });
    }

    const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 12, 1), 50);
    const { search, expertise, rating } = req.query;
    const users = await getActiveMentorUsers();
    const userIds = users.map((user) => user._id);
    const profileQuery = { userId: { $in: userIds } };

    if (search?.trim()) {
      const searchRegex = new RegExp(search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      const matchingUsers = users.filter((user) => searchRegex.test(user.name));
      const matchingProfiles = await MentorProfile.find({
        userId: { $in: userIds },
        $or: [{ designation: searchRegex }, { company: searchRegex }, { expertise: searchRegex }],
      }).select('userId').lean();
      profileQuery.userId = {
        $in: [...new Set([...matchingUsers.map((user) => user._id.toString()), ...matchingProfiles.map((profile) => profile.userId.toString())])],
      };
    }

    if (expertise?.trim()) {
      profileQuery.expertise = new RegExp(expertise.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    }

    if (rating !== undefined && rating !== '') {
      const minimumRating = Number(rating);
      if (Number.isFinite(minimumRating)) profileQuery.rating = { $gte: minimumRating };
    }

    const profiles = await MentorProfile.find(profileQuery)
      .sort({ rating: -1, completedSessionsCount: -1, createdAt: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();
    const total = await MentorProfile.countDocuments(profileQuery);
    const profileUserIds = new Set(profiles.map((profile) => profile.userId.toString()));
    const selectedUsers = users.filter((user) => profileUserIds.has(user._id.toString()));
    const mapped = await getMentorProfiles(selectedUsers, { _id: { $in: profiles.map((profile) => profile._id) } });

    return res.json({
      success: true,
      data: mapped,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Unable to load mentors.' });
  }
};

export const getRecommendedStudentMentors = async (req, res) => {
  try {
    if (!req.isDbConnected) return res.json({ success: true, data: [] });
    const mentors = await getMentorProfiles(await getActiveMentorUsers());
    return res.json({ success: true, data: mentors });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Unable to load recommended mentors.' });
  }
};

export const getStudentMentorProfile = async (req, res) => {
  try {
    const { mentorId } = req.params;
    if (!mongoose.isValidObjectId(mentorId)) {
      return res.status(404).json({ success: false, message: 'Mentor not found.' });
    }

    const user = await User.findOne({ _id: mentorId, role: 'mentor', status: 'active' })
      .select(publicUserFields)
      .lean();
    const profile = user ? await MentorProfile.findOne({ userId: user._id }).lean() : null;
    if (!user || !profile) return res.status(404).json({ success: false, message: 'Mentor not found.' });

    const availability = await MentorAvailability.findOne({ mentorId: user._id }).lean();
    return res.json({ success: true, data: mapMentor(user, profile, availability) });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Unable to load mentor profile.' });
  }
};

export const getStudentMentorAvailability = async (req, res) => {
  try {
    if (!req.isDbConnected) return res.status(503).json({ success: false, message: 'Mentor availability is unavailable.' });
    const context = await getBookingContext(req.params.mentorId, req.query.date);
    if (context.error) return res.status(context.status).json({ success: false, message: context.error });

    const dailyLimitReached = context.sessions.length >= context.availability.maxSessionsPerDay;
    const slots = slotsWithinWorkingHours(context.daySchedule).map((slot) => ({
      slotId: slot.slotId,
      time: slot.time,
      isAvailable: !dailyLimitReached && !context.bookedSlots.has(slot.time),
    }));

    return res.json({
      success: true,
      data: {
        mentorId: context.user._id.toString(),
        date: req.query.date,
        day: context.daySchedule.day,
        durationMinutes: context.availability.sessionDurationMinutes,
        maxSessionsPerDay: context.availability.maxSessionsPerDay,
        slots,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Unable to load mentor availability.' });
  }
};

export const bookStudentMentorSession = async (req, res) => {
  try {
    if (!req.isDbConnected) return res.status(503).json({ success: false, message: 'Mentor booking is unavailable.' });
    const { date, timeSlot, sessionType = '1-on-1 Mentorship', topic, studentMessage = '' } = req.body;
    if (!topic?.trim() || !timeSlot?.trim()) {
      return res.status(400).json({ success: false, message: 'Topic and time slot are required.' });
    }
    if (!sessionTypes.includes(sessionType)) {
      return res.status(400).json({ success: false, message: 'Unsupported session type.' });
    }

    const context = await getBookingContext(req.params.mentorId, date);
    if (context.error) return res.status(context.status).json({ success: false, message: context.error });
    const validSlots = slotsWithinWorkingHours(context.daySchedule);
    const selectedSlot = validSlots.find((slot) => slot.time === timeSlot.trim());
    if (!selectedSlot) return res.status(400).json({ success: false, message: 'The selected time slot is invalid.' });
    if (context.sessions.length >= context.availability.maxSessionsPerDay) {
      return res.status(400).json({ success: false, message: 'The mentor has reached the session limit for this date.' });
    }
    if (context.bookedSlots.has(selectedSlot.time)) {
      return res.status(409).json({ success: false, message: 'This time slot is no longer available.' });
    }

    try {
      const session = await MentorSession.create({
        sessionId: `sess_${new mongoose.Types.ObjectId().toString()}`,
        mentorId: context.user._id,
        studentId: req.user.id,
        studentName: req.user.name,
        topic: topic.trim(),
        sessionType,
        date: context.dateRange.start,
        timeSlot: selectedSlot.time,
        durationMinutes: context.availability.sessionDurationMinutes,
        status: 'Upcoming',
        notes: studentMessage.trim(),
        agenda: '',
      });

      return res.status(201).json({
        success: true,
        message: 'Mentor session booked successfully',
        data: { session },
      });
    } catch (error) {
      if (error?.code === 11000) {
        return res.status(409).json({ success: false, message: 'This time slot is no longer available.' });
      }
      throw error;
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Unable to book mentor session.' });
  }
};