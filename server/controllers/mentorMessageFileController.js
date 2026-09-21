import mongoose from 'mongoose';
import { cloudinary } from '../config/cloudinary.js';
import { MentorMessage } from '../models/MentorMessage.js';
import { MentorSession } from '../models/MentorSession.js';
import { User } from '../models/User.js';

const relationshipExists = (studentId, mentorId) => MentorSession.exists({
  studentId,
  mentorId,
  status: { $ne: 'Cancelled' },
});

const messageData = (message, viewerId) => ({
  id: message.messageId,
  senderId: message.senderId,
  receiverId: message.receiverId,
  text: message.content,
  timestamp: message.timestamp,
  isMine: message.senderId === viewerId,
  messageType: message.messageType,
  attachment: message.attachment,
});

const uploadDetails = (file) => ({
  fileName: file.originalname,
  fileUrl: file.path,
  publicId: file.filename || file.public_id,
  mimeType: file.mimetype,
  fileSize: file.size || file.bytes || 0,
  resourceType: file.resource_type || 'raw',
});

const cleanupCloudinaryFile = async (file) => {
  if (!file?.filename && !file?.public_id) return;
  try {
    await cloudinary.uploader.destroy(file.filename || file.public_id, {
      resource_type: file.resource_type || 'raw',
    });
  } catch (cleanupError) {
    console.error('[Mentor File Cleanup Error]', cleanupError.message);
  }
};

export const sendStudentMentorFile = async (req, res) => {
  const studentId = req.user.id.toString();
  const { mentorId } = req.body;
  if (!req.file) return res.status(400).json({ success: false, message: 'A file is required.' });
  if (!mongoose.isValidObjectId(mentorId) || !(await relationshipExists(studentId, mentorId))) {
    await cleanupCloudinaryFile(req.file);
    return res.status(404).json({ success: false, message: 'Mentor conversation not found.' });
  }

  try {
    const mentor = await User.findOne({ _id: mentorId, role: 'mentor', status: 'active' }).select('_id').lean();
    if (!mentor) {
      await cleanupCloudinaryFile(req.file);
      return res.status(404).json({ success: false, message: 'Mentor not found.' });
    }
    const message = await MentorMessage.create({
      messageId: `msg_${new mongoose.Types.ObjectId().toString()}`,
      senderId: studentId,
      receiverId: mentorId,
      studentName: req.user.name,
      studentAvatar: req.user.avatar || '',
      content: req.file.originalname,
      messageType: 'file',
      attachment: uploadDetails(req.file),
    });
    return res.status(201).json({ success: true, data: messageData(message.toObject(), studentId) });
  } catch (error) {
    await cleanupCloudinaryFile(req.file);
    return res.status(500).json({ success: false, message: 'Unable to save the uploaded file message.' });
  }
};

export const sendMentorStudentFile = async (req, res) => {
  const mentorId = req.user.id.toString();
  const { studentId } = req.body;
  if (!req.file) return res.status(400).json({ success: false, message: 'A file is required.' });
  if (!mongoose.isValidObjectId(studentId) || !(await relationshipExists(studentId, mentorId))) {
    await cleanupCloudinaryFile(req.file);
    return res.status(404).json({ success: false, message: 'Student conversation not found.' });
  }

  try {
    const student = await User.findOne({ _id: studentId, role: 'student', status: 'active' }).select('name avatar').lean();
    if (!student) {
      await cleanupCloudinaryFile(req.file);
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }
    const message = await MentorMessage.create({
      messageId: `msg_${new mongoose.Types.ObjectId().toString()}`,
      senderId: mentorId,
      receiverId: studentId,
      studentName: student.name,
      studentAvatar: student.avatar || '',
      content: req.file.originalname,
      messageType: 'file',
      attachment: uploadDetails(req.file),
    });
    return res.status(201).json({ success: true, data: messageData(message.toObject(), mentorId) });
  } catch (error) {
    await cleanupCloudinaryFile(req.file);
    return res.status(500).json({ success: false, message: 'Unable to save the uploaded file message.' });
  }
};