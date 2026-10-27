import mongoose, { Document, Schema } from 'mongoose';

export interface ICommunicationDelivery extends Document {
  tenantId: mongoose.Types.ObjectId;
  communicationId: mongoose.Types.ObjectId;
  recipientId: mongoose.Types.ObjectId;
  channel: 'IN_APP' | 'PUSH' | 'EMAIL' | 'SMS' | 'WHATSAPP';
  
  status: 'QUEUED' | 'PROCESSING' | 'SENT' | 'DELIVERED' | 'READ' | 'FAILED' | 'CANCELLED' | 'EXPIRED';
  
  providerMessageId?: string;
  failureReason?: string;
  retryCount: number;
  
  sentAt?: Date;
  deliveredAt?: Date;
  readAt?: Date;
  failedAt?: Date;
  
  // Optional flag for idempotency
  idempotencyKey?: string;
  
  isArchived: boolean;
}

const CommunicationDeliverySchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  communicationId: { type: Schema.Types.ObjectId, ref: 'Communication', required: true, index: true },
  recipientId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  channel: {
    type: String,
    enum: ['IN_APP', 'PUSH', 'EMAIL', 'SMS', 'WHATSAPP'],
    required: true
  },
  status: {
    type: String,
    enum: ['QUEUED', 'PROCESSING', 'SENT', 'DELIVERED', 'READ', 'FAILED', 'CANCELLED', 'EXPIRED'],
    default: 'QUEUED',
    index: true
  },
  providerMessageId: String,
  failureReason: String,
  retryCount: { type: Number, default: 0 },
  
  sentAt: Date,
  deliveredAt: Date,
  readAt: Date,
  failedAt: Date,
  
  idempotencyKey: { type: String, sparse: true },
  
  isArchived: { type: Boolean, default: false }
}, { timestamps: true });

// Compound index for idempotency
CommunicationDeliverySchema.index({ tenantId: 1, communicationId: 1, recipientId: 1, channel: 1 }, { unique: true });

export default (mongoose.models['CommunicationDelivery'] || mongoose.model<ICommunicationDelivery>('CommunicationDelivery', CommunicationDeliverySchema)) as any;
