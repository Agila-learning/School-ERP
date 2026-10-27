import mongoose, { Document, Schema } from 'mongoose';

export interface ISupportTicket extends Document {
  ticketNumber: string;
  tenantId: mongoose.Types.ObjectId;
  raisedBy?: mongoose.Types.ObjectId;
  category: 'TECHNICAL' | 'BILLING' | 'SUBSCRIPTION' | 'FEATURE_REQUEST' | 'ACCOUNT' | 'OTHER';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  subject: string;
  description: string;
  attachments?: string[];
  status: 'OPEN' | 'IN_PROGRESS' | 'WAITING_FOR_CUSTOMER' | 'RESOLVED' | 'CLOSED';
  assignedTo?: mongoose.Types.ObjectId;
  resolvedAt?: Date;
  closedAt?: Date;
  resolution?: string;
  tags?: string[];
}

const SupportTicketSchema: Schema = new Schema(
  {
    ticketNumber: { type: String, required: true, unique: true, index: true },
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: false, index: true },
    raisedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    category: {
      type: String,
      enum: ['TECHNICAL', 'BILLING', 'SUBSCRIPTION', 'FEATURE_REQUEST', 'ACCOUNT', 'OTHER'],
      required: true,
    },
    priority: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], default: 'MEDIUM' },
    subject: { type: String, required: true },
    description: { type: String, required: true },
    attachments: [String],
    status: {
      type: String,
      enum: ['OPEN', 'IN_PROGRESS', 'WAITING_FOR_CUSTOMER', 'RESOLVED', 'CLOSED'],
      default: 'OPEN',
    },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
    resolvedAt: Date,
    closedAt: Date,
    resolution: String,
    tags: [String],
  },
  { timestamps: true }
);

SupportTicketSchema.index({ status: 1 });
SupportTicketSchema.index({ priority: 1 });

export default (mongoose.models['SupportTicket'] || mongoose.model<ISupportTicket>('SupportTicket', SupportTicketSchema)) as any;
