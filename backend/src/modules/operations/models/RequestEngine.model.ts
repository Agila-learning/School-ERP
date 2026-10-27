import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IServiceRequest extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  requesterId: mongoose.Types.ObjectId;
  category: 'IT' | 'Facility' | 'HR' | 'Academic' | 'Transport' | 'Other';
  title: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  status: 'Submitted' | 'Assigned' | 'In Progress' | 'Waiting' | 'Resolved' | 'Closed';
  assignedTo?: mongoose.Types.ObjectId;
  resolutionNotes?: string;
  resolvedAt?: Date;
}

const ServiceRequestSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  requesterId: { type: Schema.Types.ObjectId, required: true },
  category: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  priority: { type: String, default: 'Medium' },
  status: { type: String, default: 'Submitted' },
  assignedTo: Schema.Types.ObjectId,
  resolutionNotes: String,
  resolvedAt: Date,
}, { timestamps: true });

ServiceRequestSchema.index({ tenantId: 1, status: 1 });
ServiceRequestSchema.index({ tenantId: 1, requesterId: 1 });

ServiceRequestSchema.plugin(softDeletePlugin);

export const ServiceRequest = (mongoose.models['ServiceRequest'] || mongoose.model<IServiceRequest>('ServiceRequest', ServiceRequestSchema)) as any;
