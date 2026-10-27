import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IComplaint extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId; // Who raised it
  subject: string;
  description: string;
  category: 'ACADEMIC' | 'INFRASTRUCTURE' | 'TRANSPORT' | 'HOSTEL' | 'OTHER';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  assignedTo?: mongoose.Types.ObjectId;
  resolution?: string;
  resolvedAt?: Date;
}

const ComplaintSchema = new Schema({
  tenantId: { type: Schema.Types.Mixed, required: true, index: true },
  userId: { type: Schema.Types.Mixed, ref: 'User', required: true },
  subject: { type: String, required: true },
  description: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['ACADEMIC', 'INFRASTRUCTURE', 'TRANSPORT', 'HOSTEL', 'OTHER'],
    default: 'OTHER'
  },
  priority: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH'],
    default: 'MEDIUM'
  },
  status: {
    type: String,
    enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'],
    default: 'OPEN'
  },
  assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
  resolution: { type: String },
  resolvedAt: { type: Date }
}, { timestamps: true });

ComplaintSchema.plugin(softDeletePlugin);

export default (mongoose.models['Complaint'] || mongoose.model<IComplaint>('Complaint', ComplaintSchema)) as any;
