import mongoose from 'mongoose';
import { MentorFeedback } from '../models/MentorFeedback.js';
import { MentorProfile } from '../models/MentorProfile.js';
import { MentorSession } from '../models/MentorSession.js';
import { User } from '../models/User.js';

const ratingSummary = async (mentorId) => {
  const [summary] = await MentorFeedback.aggregate([
    { $match: { mentorId: new mongoose.Types.ObjectId(mentorId) } },
    { $group: { _id: '$mentorId', averageRating: { $avg: '$rating' }, reviewsCount: { $sum: 1 } } },
  ]);
  return {
    averageRating: summary ? Number(summary.averageRating.toFixed(2)) : 0,
    reviewsCount: summary?.reviewsCount || 0,
  };
};

export const syncMentorRating = async (mentorId) => {
  const summary = await ratingSummary(mentorId);
  await MentorProfile.findOneAndUpdate(
    { userId: mentorId },
    { $set: { rating: summary.averageRating, reviewsCount: summary.reviewsCount } }
  );
  return summary;
};

export const submitStudentFeedback = async (req, res) => {
  try {
    const { rating, comment = '' } = req.body;
    const numericRating = Number(rating);
    if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be an integer from 1 to 5.' });
    }
    if (typeof comment !== 'string' || comment.length > 2000) {
      return res.status(400).json({ success: false, message: 'Feedback must be 2000 characters or fewer.' });
    }

    const session = await MentorSession.findOne({ sessionId: req.params.sessionId }).lean();
    if (!session || session.studentId.toString() !== req.user.id.toString()) {
      return res.status(404).json({ success: false, message: 'Mentor session not found.' });
    }
    if (session.status !== 'Completed') {
      return res.status(400).json({ success: false, message: 'Feedback can only be submitted for completed sessions.' });
    }
    const existing = await MentorFeedback.findOne({ sessionId: session.sessionId }).lean();
    if (existing) return res.status(409).json({ success: false, message: 'Feedback has already been submitted for this session.' });

    const feedback = await MentorFeedback.create({
      sessionId: session.sessionId,
      studentId: req.user.id,
      mentorId: session.mentorId,
      rating: numericRating,
      comment: comment.trim(),
    });
    const summary = await syncMentorRating(session.mentorId);
    return res.status(201).json({ success: true, message: 'Feedback submitted successfully.', data: { feedback, summary } });
  } catch (error) {
    if (error?.code === 11000) return res.status(409).json({ success: false, message: 'Feedback has already been submitted for this session.' });
    return res.status(500).json({ success: false, message: 'Unable to submit feedback.' });
  }
};

export const getStudentFeedback = async (req, res) => {
  try {
    const session = await MentorSession.findOne({ sessionId: req.params.sessionId, studentId: req.user.id }).select('sessionId').lean();
    if (!session) return res.status(404).json({ success: false, message: 'Mentor session not found.' });
    const feedback = await MentorFeedback.findOne({ sessionId: session.sessionId }).lean();
    return res.json({ success: true, data: feedback || null });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Unable to load feedback.' });
  }
};

export const getMentorFeedback = async (req, res) => {
  try {
    const mentorId = req.user.id;
    const summary = await syncMentorRating(mentorId);
    const feedback = await MentorFeedback.find({ mentorId })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate('studentId', 'name')
      .lean();
    return res.json({
      success: true,
      data: {
        summary,
        feedback: feedback.map((item) => ({
          feedbackId: item._id,
          sessionId: item.sessionId,
          rating: item.rating,
          comment: item.comment,
          createdAt: item.createdAt,
          studentName: item.studentId?.name || 'Student',
        })),
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Unable to load mentor feedback.' });
  }
};