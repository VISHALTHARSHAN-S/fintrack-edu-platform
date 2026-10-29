import mongoose from 'mongoose';

const supportTicketMessageSchema = new mongoose.Schema(
  {
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    senderRole: { type: String, enum: ['student', 'support'], required: true },
    senderName: { type: String, required: true, trim: true, maxlength: 80 },
    body: { type: String, required: true, trim: true, maxlength: 2000 },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const supportTicketStatusEventSchema = new mongoose.Schema(
  {
    fromStatus: {
      type: String,
      enum: ['Open', 'In Progress', 'Resolved', 'Closed', null],
      default: null,
    },
    toStatus: {
      type: String,
      enum: ['Open', 'In Progress', 'Resolved', 'Closed'],
      required: true,
    },
    actorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    actorRole: { type: String, enum: ['student', 'support', 'system'], required: true },
    actorName: { type: String, required: true, trim: true, maxlength: 80 },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const supportTicketSchema = new mongoose.Schema(
  {
    ticketId: { type: String, required: true, unique: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    studentName: { type: String, required: true, trim: true, maxlength: 80 },
    category: {
      type: String,
      enum: [
        'Account & Settings',
        'Courses & Learning',
        'Assessments',
        'Certificates',
        'Skill Tracker',
        'Career & Jobs',
        'Applications',
        'Notifications',
      ],
      required: true,
    },
    subject: { type: String, required: true, trim: true, minlength: 5, maxlength: 120 },
    description: { type: String, required: true, trim: true, minlength: 20, maxlength: 5000 },
    priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium', required: true },
    attachment: {
      fileName: { type: String, trim: true, maxlength: 255 },
      fileUrl: { type: String, trim: true, maxlength: 2048 },
      publicId: { type: String, trim: true, maxlength: 255 },
      mimeType: { type: String, trim: true, maxlength: 100 },
      fileSize: { type: Number, min: 0 },
      resourceType: { type: String, trim: true, maxlength: 20 },
    },
    status: {
      type: String,
      enum: ['Open', 'In Progress', 'Resolved', 'Closed'],
      default: 'Open',
      required: true,
    },
    messages: { type: [supportTicketMessageSchema], default: [] },
    statusHistory: { type: [supportTicketStatusEventSchema], default: [] },
  },
  { timestamps: true }
);

supportTicketSchema.index({ studentId: 1, updatedAt: -1 });
supportTicketSchema.index({ studentId: 1, status: 1, updatedAt: -1 });

export const SupportTicket = mongoose.model('SupportTicket', supportTicketSchema);
