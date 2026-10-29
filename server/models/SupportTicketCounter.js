import mongoose from 'mongoose';

const supportTicketCounterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  sequence: { type: Number, default: 0 },
});

export const SupportTicketCounter = mongoose.model(
  'SupportTicketCounter',
  supportTicketCounterSchema
);
