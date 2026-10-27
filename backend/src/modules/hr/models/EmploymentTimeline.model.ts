import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IEmploymentTimeline extends Document, ISoftDeleted {
  id: string;
  tenantId: mongoose.Types.ObjectId;
  employeeId: mongoose.Types.ObjectId;
  eventType: 'ONBOARDING' | 'PROBATION_START' | 'CONFIRMATION' | 'TRANSFER' | 'PROMOTION' | 'RESIGNATION' | 'EXIT' | 'OTHER';
  title: string;
  description?: string;
  eventDate: Date;
  referenceId?: string;
  performedByUserId: mongoose.Types.ObjectId;
}

const EmploymentTimelineSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    employeeId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true, index: true },
    eventType: { 
      type: String, 
      enum: ['ONBOARDING', 'PROBATION_START', 'CONFIRMATION', 'TRANSFER', 'PROMOTION', 'RESIGNATION', 'EXIT', 'OTHER'], 
      required: true 
    },
    title: { type: String, required: true },
    description: String,
    eventDate: { type: Date, default: Date.now },
    referenceId: String,
    performedByUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  {
    timestamps: true,
  }
);

EmploymentTimelineSchema.plugin(softDeletePlugin);

export default (mongoose.models['EmploymentTimeline'] || (mongoose.models['EmploymentTimeline'] || mongoose.model<IEmploymentTimeline>('EmploymentTimeline', EmploymentTimelineSchema)) as any) as any;
