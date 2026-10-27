import mongoose, { Document, Schema } from 'mongoose';

export interface IScheduledCommunication extends Document {
  tenantId: mongoose.Types.ObjectId;
  communicationId: mongoose.Types.ObjectId;
  
  scheduledFor: Date;
  timezone: string;
  
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  
  executedAt?: Date;
  createdBy: mongoose.Types.ObjectId;
}

const ScheduledCommunicationSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  communicationId: { type: Schema.Types.ObjectId, ref: 'Communication', required: true },
  
  scheduledFor: { type: Date, required: true, index: true },
  timezone: { type: String, required: true, default: 'UTC' },
  
  status: {
    type: String,
    enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED'],
    default: 'PENDING',
    index: true
  },
  
  executedAt: Date,
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

export default (mongoose.models['ScheduledCommunication'] || mongoose.model<IScheduledCommunication>('ScheduledCommunication', ScheduledCommunicationSchema)) as any;
