import { SEEDED_MESSAGES } from '../seed/mentorSeedData.js';
import mongoose from 'mongoose';
import { MentorMessage } from '../models/MentorMessage.js';
import { MentorSession } from '../models/MentorSession.js';
import { User } from '../models/User.js';

const getMentorRelationship = (mentorId, studentId) =>
  MentorSession.findOne({ mentorId, studentId, status: { $ne: 'Cancelled' } }).lean();

const mapMentorMessage = (message) => ({
  id: message.messageId,
  senderId: message.senderId,
  text: message.content,
  timestamp: message.timestamp,
  messageType: message.messageType || 'text',
  attachment: message.attachment,
});

const getMongoConversations = async (mentorId) => {
  const sessions = await MentorSession.find({ mentorId, status: { $ne: 'Cancelled' } })
    .select('studentId')
    .lean();
  const studentIds = [...new Set(sessions.map((session) => session.studentId.toString()))];
  const students = await User.find({ _id: { $in: studentIds }, role: 'student' }).select('name avatar').lean();
  const studentById = new Map(students.map((student) => [student._id.toString(), student]));
  return Promise.all(studentIds.filter((studentId) => studentById.has(studentId)).map(async (studentId) => {
    const latest = await MentorMessage.findOne({
      senderId: { $in: [mentorId, studentId] },
      receiverId: { $in: [mentorId, studentId] },
    }).sort({ timestamp: -1 }).lean();
    const unreadCount = await MentorMessage.countDocuments({ senderId: studentId, receiverId: mentorId, isRead: false });
    const student = studentById.get(studentId);
    return {
      conversationId: `${mentorId}_${studentId}`,
      studentId,
      studentName: student.name,
      studentAvatar: student.avatar || '',
      onlineStatus: 'offline',
      unreadCount,
      lastMessageTime: latest?.timestamp || null,
      lastMessage: latest?.content || '',
    };
  }));
};

// Get Conversations List
export const getConversations = async (req, res) => {
  try {
    if (req.isDbConnected) {
      return res.json({ success: true, data: await getMongoConversations(req.user.id.toString()) });
    }
    const list = SEEDED_MESSAGES.map((conv) => ({
      conversationId: conv.conversationId,
      studentId: conv.studentId,
      studentName: conv.studentName,
      studentAvatar: conv.studentAvatar,
      onlineStatus: conv.onlineStatus,
      unreadCount: conv.unreadCount,
      lastMessageTime: conv.lastMessageTime,
      lastMessage: conv.messages[conv.messages.length - 1]?.text || '',
    }));

    return res.json({
      success: true,
      data: list,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get Message History for a conversation
export const getMessageHistory = async (req, res) => {
  try {
    const { studentId } = req.params;
    if (req.isDbConnected) {
      const mentorId = req.user.id.toString();
      const relationship = await getMentorRelationship(mentorId, studentId);
      if (!relationship) return res.status(404).json({ success: false, message: 'Student conversation not found.' });
      await MentorMessage.updateMany(
        { senderId: studentId, receiverId: mentorId, isRead: false },
        { $set: { isRead: true } }
      );
      const messages = await MentorMessage.find({
        senderId: { $in: [mentorId, studentId] },
        receiverId: { $in: [mentorId, studentId] },
      }).sort({ timestamp: 1 }).lean();
      const student = await User.findById(studentId).select('name avatar').lean();
      return res.json({
        success: true,
        data: {
          studentId,
          studentName: student?.name || 'Student',
          studentAvatar: student?.avatar || '',
          messages: messages.map(mapMentorMessage),
        },
      });
    }
    const conv =
      SEEDED_MESSAGES.find((c) => c.studentId === studentId) || SEEDED_MESSAGES[0];

    // Mark as read
    conv.unreadCount = 0;

    return res.json({
      success: true,
      data: conv,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Send Message
export const sendMessage = async (req, res) => {
  try {
    const { studentId, text } = req.body;
    if (!text?.trim() || text.trim().length > 2000) {
      return res.status(400).json({ success: false, message: 'Message must contain between 1 and 2000 characters.' });
    }
    if (req.isDbConnected) {
      const mentorId = req.user.id.toString();
      const relationship = await getMentorRelationship(mentorId, studentId);
      if (!relationship) return res.status(404).json({ success: false, message: 'Student conversation not found.' });
      const student = await User.findById(studentId).select('name avatar').lean();
      const message = await MentorMessage.create({
        messageId: `msg_${new mongoose.Types.ObjectId().toString()}`,
        senderId: mentorId,
        receiverId: studentId,
        studentName: student?.name || 'Student',
        studentAvatar: student?.avatar || '',
        content: text.trim(),
        isRead: false,
      });
      return res.json({ success: true, data: mapMentorMessage(message.toObject()) });
    }

    const conv = SEEDED_MESSAGES.find((c) => c.studentId === studentId) || SEEDED_MESSAGES[0];
    const newMsg = {
      id: `m_${Date.now()}`,
      senderId: 'mentor_1',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    conv.messages.push(newMsg);
    conv.lastMessageTime = 'Just now';

    return res.json({
      success: true,
      data: newMsg,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
