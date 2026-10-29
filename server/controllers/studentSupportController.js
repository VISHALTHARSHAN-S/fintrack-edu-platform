import mongoose from 'mongoose';
import { cloudinary } from '../config/cloudinary.js';
import { SupportTicket } from '../models/SupportTicket.js';
import { SupportTicketCounter } from '../models/SupportTicketCounter.js';
import { createUserNotification } from '../services/notificationService.js';

const categories = [
  'Account & Settings',
  'Courses & Learning',
  'Assessments',
  'Certificates',
  'Skill Tracker',
  'Career & Jobs',
  'Applications',
  'Notifications',
];
const priorities = ['Low', 'Medium', 'High'];
const statuses = ['Open', 'In Progress', 'Resolved', 'Closed'];
const ticketIdPattern = /^FT-\d{4}-\d{6,}$/;

const requireDatabase = (req, res) => {
  if (!req.isDbConnected) {
    res.status(503).json({
      success: false,
      message: 'Help & Support requires a connected database. Please try again later.',
    });
    return false;
  }
  return true;
};

const isValidStudentId = (req, res) => {
  if (!mongoose.isValidObjectId(req.user?.id)) {
    res.status(401).json({ success: false, message: 'The authenticated student account is invalid.' });
    return false;
  }
  return true;
};

const cleanText = (value) =>
  value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim();
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const serializeTicket = (ticket) => ({
  id: String(ticket._id),
  ticketId: ticket.ticketId,
  category: ticket.category,
  subject: ticket.subject,
  description: ticket.description,
  priority: ticket.priority,
  attachment: ticket.attachment?.fileUrl
    ? {
        fileName: ticket.attachment.fileName,
        fileUrl: ticket.attachment.fileUrl,
        mimeType: ticket.attachment.mimeType,
        fileSize: ticket.attachment.fileSize,
      }
    : null,
  status: ticket.status,
  createdAt: ticket.createdAt,
  updatedAt: ticket.updatedAt,
  messages: (ticket.messages || []).map((message) => ({
    id: String(message._id),
    senderRole: message.senderRole,
    senderName: message.senderName,
    body: message.body,
    createdAt: message.createdAt,
  })),
  statusHistory: (ticket.statusHistory || []).map((event) => ({
    id: String(event._id),
    fromStatus: event.fromStatus,
    toStatus: event.toStatus,
    actorRole: event.actorRole,
    actorName: event.actorName,
    createdAt: event.createdAt,
  })),
});

const serializeTicketSummary = (ticket) => ({
  id: String(ticket._id),
  ticketId: ticket.ticketId,
  category: ticket.category,
  subject: ticket.subject,
  priority: ticket.priority,
  status: ticket.status,
  createdAt: ticket.createdAt,
  updatedAt: ticket.updatedAt,
});

const generateTicketId = async () => {
  const year = String(new Date().getFullYear());
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const counter = await SupportTicketCounter.findOneAndUpdate(
        { _id: year },
        { $inc: { sequence: 1 } },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );
      return `FT-${year}-${String(counter.sequence).padStart(6, '0')}`;
    } catch (error) {
      if (error?.code !== 11000 || attempt === 2) throw error;
    }
  }
  throw new Error('Unable to allocate a support ticket ID.');
};

const isAllowedKeys = (body, allowedKeys) =>
  body && typeof body === 'object' && !Array.isArray(body) &&
  Object.keys(body).every((key) => allowedKeys.includes(key));

const cleanupUploadedFile = async (file) => {
  if (!file?.filename && !file?.public_id) return;
  try {
    await cloudinary.uploader.destroy(file.filename || file.public_id, {
      resource_type: file.resource_type || 'raw',
    });
  } catch (error) {
    console.error('[Support Ticket Attachment Cleanup Error]', error);
  }
};

const rejectRequest = async (res, file, status, message) => {
  await cleanupUploadedFile(file);
  return res.status(status).json({ success: false, message });
};

export const createStudentSupportTicket = async (req, res) => {
  try {
    if (!req.isDbConnected) {
      return rejectRequest(res, req.file, 503, 'Help & Support requires a connected database. Please try again later.');
    }
    if (!mongoose.isValidObjectId(req.user?.id)) {
      return rejectRequest(res, req.file, 401, 'The authenticated student account is invalid.');
    }
    const body = req.body;
    if (!isAllowedKeys(body, ['category', 'subject', 'description', 'priority'])) {
      return rejectRequest(res, req.file, 400, 'Provide only a category, subject, description, and priority.');
    }

    const { category, priority, subject, description } = body;
    if (!categories.includes(category)) {
      return rejectRequest(res, req.file, 400, 'Select a valid issue category.');
    }
    if (priority !== undefined && !priorities.includes(priority)) {
      return rejectRequest(res, req.file, 400, 'Select a valid ticket priority.');
    }
    const normalizedSubject = typeof subject === 'string'
      ? cleanText(subject).replace(/[\r\n\t]+/g, ' ')
      : '';
    const normalizedDescription = typeof description === 'string' ? cleanText(description) : '';
    if (normalizedSubject.length < 5 || normalizedSubject.length > 120) {
      return rejectRequest(res, req.file, 400, 'Subject must be between 5 and 120 characters.');
    }
    if (normalizedDescription.length < 20 || normalizedDescription.length > 5000) {
      return rejectRequest(res, req.file, 400, 'Description must be between 20 and 5,000 characters.');
    }

    const ticketId = await generateTicketId();
    const studentName = cleanText(String(req.user.name || 'Student')).slice(0, 80);
    const ticket = await SupportTicket.create({
      ticketId,
      studentId: req.user.id,
      studentName,
      category,
      subject: normalizedSubject,
      description: normalizedDescription,
      priority: priority || 'Medium',
      attachment: req.file ? {
        fileName: req.file.originalname.replace(/[\u0000-\u001F\u007F]/g, '').slice(0, 255),
        fileUrl: req.file.path,
        publicId: req.file.filename || req.file.public_id,
        mimeType: req.file.mimetype,
        fileSize: req.file.size || req.file.bytes || 0,
        resourceType: req.file.resource_type || 'raw',
      } : undefined,
      status: 'Open',
      statusHistory: [{
        fromStatus: null,
        toStatus: 'Open',
        actorId: req.user.id,
        actorRole: 'student',
        actorName: studentName,
      }],
    });

    try {
      await createUserNotification({
        userId: req.user.id,
        eventKey: `support-ticket:${ticket.ticketId}:created`,
        title: 'Support request received',
        message: `Your support request ${ticket.ticketId} has been received.`,
        category: 'support',
        type: 'success',
        link: `/student/support?ticket=${encodeURIComponent(ticket.ticketId)}`,
      });
    } catch (error) {
      console.error('[Support Ticket Notification Error]', error);
    }

    return res.status(201).json({
      success: true,
      message: 'Your support request has been submitted.',
      data: serializeTicket(ticket),
    });
  } catch (error) {
    await cleanupUploadedFile(req.file);
    console.error('[Support Ticket Create Error]', error);
    return res.status(500).json({ success: false, message: 'Unable to submit your support request.' });
  }
};

export const getStudentSupportTickets = async (req, res) => {
  try {
    if (!requireDatabase(req, res) || !isValidStudentId(req, res)) return;
    const page = Number.parseInt(req.query.page, 10) || 1;
    const limit = Number.parseInt(req.query.limit, 10) || 20;
    if (page < 1 || limit < 1 || limit > 50) {
      return res.status(400).json({ success: false, message: 'Page or page size is invalid.' });
    }

    const filter = { studentId: req.user.id };
    if (req.query.status && req.query.status !== 'all') {
      if (!statuses.includes(req.query.status)) {
        return res.status(400).json({ success: false, message: 'Select a valid ticket status.' });
      }
      filter.status = req.query.status;
    }
    if (req.query.search !== undefined) {
      if (typeof req.query.search !== 'string' || req.query.search.length > 100) {
        return res.status(400).json({ success: false, message: 'Search must be 100 characters or fewer.' });
      }
      const search = req.query.search.trim();
      if (search) {
        const expression = new RegExp(escapeRegex(search), 'i');
        filter.$or = [
          { ticketId: expression },
          { subject: expression },
          { category: expression },
        ];
      }
    }

    const [tickets, total] = await Promise.all([
      SupportTicket.find(filter)
        .sort({ updatedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .select('ticketId category subject priority status createdAt updatedAt')
        .lean(),
      SupportTicket.countDocuments(filter),
    ]);
    return res.json({
      success: true,
      data: {
        tickets: tickets.map(serializeTicketSummary),
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      },
    });
  } catch (error) {
    console.error('[Support Ticket List Error]', error);
    return res.status(500).json({ success: false, message: 'Unable to load your support requests.' });
  }
};

export const getStudentSupportTicket = async (req, res) => {
  try {
    if (!requireDatabase(req, res) || !isValidStudentId(req, res)) return;
    if (!ticketIdPattern.test(req.params.ticketId)) {
      return res.status(400).json({ success: false, message: 'A valid ticket ID is required.' });
    }
    const ticket = await SupportTicket.findOne({
      ticketId: req.params.ticketId,
      studentId: req.user.id,
    });
    if (!ticket) return res.status(404).json({ success: false, message: 'Support request not found.' });
    return res.json({ success: true, data: serializeTicket(ticket) });
  } catch (error) {
    console.error('[Support Ticket Detail Error]', error);
    return res.status(500).json({ success: false, message: 'Unable to load this support request.' });
  }
};

export const replyToStudentSupportTicket = async (req, res) => {
  try {
    if (!requireDatabase(req, res) || !isValidStudentId(req, res)) return;
    if (!ticketIdPattern.test(req.params.ticketId)) {
      return res.status(400).json({ success: false, message: 'A valid ticket ID is required.' });
    }
    if (!isAllowedKeys(req.body, ['message'])) {
      return res.status(400).json({ success: false, message: 'Provide only a reply message.' });
    }
    const { message } = req.body;
    if (typeof message !== 'string' || cleanText(message).length < 1 || cleanText(message).length > 2000) {
      return res.status(400).json({ success: false, message: 'Reply must be between 1 and 2,000 characters.' });
    }

    const ticket = await SupportTicket.findOne({
      ticketId: req.params.ticketId,
      studentId: req.user.id,
    });
    if (!ticket) return res.status(404).json({ success: false, message: 'Support request not found.' });
    if (!['Open', 'In Progress'].includes(ticket.status)) {
      return res.status(409).json({
        success: false,
        message: 'This request is not accepting replies. Reopen it before sending a reply.',
      });
    }

    ticket.messages.push({
      senderId: req.user.id,
      senderRole: 'student',
      senderName: cleanText(String(req.user.name || 'Student')).slice(0, 80),
      body: cleanText(message),
    });
    await ticket.save();
    return res.json({ success: true, data: serializeTicket(ticket) });
  } catch (error) {
    console.error('[Support Ticket Reply Error]', error);
    return res.status(500).json({ success: false, message: 'Unable to send your reply.' });
  }
};

export const reopenStudentSupportTicket = async (req, res) => {
  try {
    if (!requireDatabase(req, res) || !isValidStudentId(req, res)) return;
    if (!ticketIdPattern.test(req.params.ticketId)) {
      return res.status(400).json({ success: false, message: 'A valid ticket ID is required.' });
    }
    if (!isAllowedKeys(req.body || {}, [])) {
      return res.status(400).json({ success: false, message: 'Reopening a request does not accept additional fields.' });
    }

    const ticket = await SupportTicket.findOne({
      ticketId: req.params.ticketId,
      studentId: req.user.id,
    });
    if (!ticket) return res.status(404).json({ success: false, message: 'Support request not found.' });
    if (!['Resolved', 'Closed'].includes(ticket.status)) {
      return res.status(409).json({ success: false, message: 'Only resolved or closed requests can be reopened.' });
    }

    const previousStatus = ticket.status;
    ticket.status = 'Open';
    ticket.statusHistory.push({
      fromStatus: previousStatus,
      toStatus: 'Open',
      actorId: req.user.id,
      actorRole: 'student',
      actorName: cleanText(String(req.user.name || 'Student')).slice(0, 80),
    });
    await ticket.save();
    return res.json({ success: true, data: serializeTicket(ticket) });
  } catch (error) {
    console.error('[Support Ticket Reopen Error]', error);
    return res.status(500).json({ success: false, message: 'Unable to reopen your support request.' });
  }
};
