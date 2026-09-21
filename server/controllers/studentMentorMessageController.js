import mongoose from 'mongoose';
import { MentorMessage } from '../models/MentorMessage.js';
import { MentorSession } from '../models/MentorSession.js';
import { User } from '../models/User.js';

const messageLimit = 100;

const relationshipQuery = (studentId, mentorId) => ({
  studentId,
  mentorId,
  status: { $ne: 'Cancelled' },
});

const getRelationship = async (studentId, mentorId) => {
  if (!mongoose.isValidObjectId(mentorId)) return null;
  return MentorSession.findOne(relationshipQuery(studentId, mentorId)).select('mentorId studentId').lean();
};

const mapMessage = (message, studentId) => ({
  id: message.messageId,
  senderId: message.senderId,
  receiverId: message.receiverId,
  text: message.content,
  timestamp: message.timestamp,
  isMine: message.senderId === studentId,
  messageType: message.messageType || 'text',
  attachment: message.attachment,
});

const getConversation = async (studentId, mentorId) => {
  const messages = await MentorMessage.find({
    $or: [
      { senderId: studentId, receiverId: mentorId },
      { senderId: mentorId, receiverId: studentId },
    ],
  }).sort({ timestamp: 1 }).limit(messageLimit).lean();
  const mentor = await User.findOne({ _id: mentorId, role: 'mentor', status: 'active' }).select('name avatar').lean();
  return { mentor, messages: messages.map((message) => mapMessage(message, studentId)) };
};

const getMentorIdsForStudent = async (studentId) => {
  const sessions = await MentorSession.find({ studentId, status: { $ne: 'Cancelled' } }).select('mentorId').lean();
  return [...new Set(sessions.map((session) => session.mentorId.toString()))];
};

export const getStudentMentorConversations = async (req, res) => {
  try {
    const studentId = req.user.id.toString();
    const mentorIds = await getMentorIdsForStudent(studentId);
    const mentors = await User.find({ _id: { $in: mentorIds }, role: 'mentor', status: 'active' }).select('name avatar').lean();
    const mentorById = new Map(mentors.map((mentor) => [mentor._id.toString(), mentor]));
    const summaries = await Promise.all(mentorIds.filter((mentorId) => mentorById.has(mentorId)).map(async (mentorId) => {
      const messages = await MentorMessage.find({
        $or: [{ senderId: studentId, receiverId: mentorId }, { senderId: mentorId, receiverId: studentId }],
      }).sort({ timestamp: -1 }).limit(1).lean();
      const unreadCount = await MentorMessage.countDocuments({ senderId: mentorId, receiverId: studentId, isRead: false });
      const lastMessage = messages[0];
      return {
        mentorId,
        mentorName: mentorById.get(mentorId).name,
        mentorAvatar: mentorById.get(mentorId).avatar || '',
        lastMessage: lastMessage?.content || '',
        lastMessageTime: lastMessage?.timestamp || null,
        unreadCount,
      };
    }));

    return res.json({ success: true, data: summaries.sort((left, right) => new Date(right.lastMessageTime || 0) - new Date(left.lastMessageTime || 0)) });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Unable to load mentor conversations.' });
  }
};

export const getStudentMentorConversation = async (req, res) => {
  try {
    const studentId = req.user.id.toString();
    const relationship = await getRelationship(studentId, req.params.mentorId);
    if (!relationship) return res.status(404).json({ success: false, message: 'Mentor conversation not found.' });

    await MentorMessage.updateMany(
      { senderId: req.params.mentorId, receiverId: studentId, isRead: false },
      { $set: { isRead: true } }
    );
    const conversation = await getConversation(studentId, req.params.mentorId);
    return res.json({ success: true, data: { mentorId: req.params.mentorId, mentor: conversation.mentor, messages: conversation.messages } });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Unable to load mentor conversation.' });
  }
};

export const sendStudentMentorMessage = async (req, res) => {
  try {
    const studentId = req.user.id.toString();
    const { mentorId } = req.body;
    const content = req.body.message;
    if (!content || !content.trim() || content.trim().length > 2000) {
      return res.status(400).json({ success: false, message: 'Message must contain between 1 and 2000 characters.' });
    }
    const relationship = await getRelationship(studentId, mentorId);
    if (!relationship) return res.status(404).json({ success: false, message: 'You are not authorized to message this mentor.' });
    const mentor = await User.findOne({ _id: mentorId, role: 'mentor', status: 'active' }).select('name avatar').lean();
    if (!mentor) return res.status(404).json({ success: false, message: 'Mentor not found.' });

    const message = await MentorMessage.create({
      messageId: `msg_${new mongoose.Types.ObjectId().toString()}`,
      senderId: studentId,
      receiverId: mentorId,
      studentName: req.user.name,
      studentAvatar: req.user.avatar || '',
      content: content.trim(),
      isRead: false,
    });
    return res.status(201).json({ success: true, data: mapMessage(message.toObject(), studentId) });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Unable to send message.' });
  }
};