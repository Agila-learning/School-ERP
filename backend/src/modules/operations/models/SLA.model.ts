import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface ISLAPolicy extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  module: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent' | 'Critical';
  resolutionTimeHours: number;
  responseTimeHours?: number;
  escalateTo?: mongoose.Types.ObjectId;
}

export interface ISLAEvent extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  entityType: string;
  entityId: mongoose.Types.ObjectId;
  policyId: mongoose.Types.ObjectId;
  deadline: Date;
  status: 'Within SLA' | 'At Risk' | 'Breached' | 'Resolved' | 'Paused';
  escalationTriggered: boolean;
}

const SLAPolicySchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  module: { type: String, required: true },
  priority: { type: String, required: true },
  resolutionTimeHours: { type: Number, required: true },
  responseTimeHours: Number,
  escalateTo: Schema.Types.ObjectId,
}, { timestamps: true });

const SLAEventSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  entityType: { type: String, required: true },
  entityId: { type: Schema.Types.ObjectId, required: true },
  policyId: { type: Schema.Types.ObjectId, ref: 'SLAPolicy', required: true },
  deadline: { type: Date, required: true },
  status: { type: String, default: 'Within SLA' },
  escalationTriggered: { type: Boolean, default: false },
}, { timestamps: true });

SLAEventSchema.index({ tenantId: 1, status: 1, deadline: 1 });

[SLAPolicySchema, SLAEventSchema].forEach(schema => schema.plugin(softDeletePlugin));

export const SLAPolicy = (mongoose.models['SLAPolicy'] || mongoose.model<ISLAPolicy>('SLAPolicy', SLAPolicySchema)) as any;
export const SLAEvent = (mongoose.models['SLAEvent'] || mongoose.model<ISLAEvent>('SLAEvent', SLAEventSchema)) as any;
