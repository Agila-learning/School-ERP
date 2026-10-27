import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface ILeaveType extends Document, ISoftDeleted {
  id: string;
  tenantId: mongoose.Types.ObjectId;
  name: string;              // e.g. "Casual Leave"
  code: string;              // e.g. "CL"
  domain: 'STUDENT' | 'EMPLOYEE' | 'BOTH';
  isPaid: boolean;
  allowHalfDay: boolean;
  allowHourly: boolean;
  requiresApproval: boolean;
  requiresDocument: boolean;
  maxDays?: number;
  color?: string;            // UI hint
  status: 'ACTIVE' | 'INACTIVE';
}

const LeaveTypeSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    name: { type: String, required: true },
    code: { type: String, required: true },
    domain: { type: String, enum: ['STUDENT', 'EMPLOYEE', 'BOTH'], default: 'EMPLOYEE' },
    isPaid: { type: Boolean, default: true },
    allowHalfDay: { type: Boolean, default: true },
    allowHourly: { type: Boolean, default: false },
    requiresApproval: { type: Boolean, default: true },
    requiresDocument: { type: Boolean, default: false },
    maxDays: { type: Number },
    color: String,
    status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
  },
  { timestamps: true }
);

LeaveTypeSchema.index({ tenantId: 1, code: 1 }, { unique: true });
LeaveTypeSchema.plugin(softDeletePlugin);
export default (mongoose.models['LeaveType'] || (mongoose.models['LeaveType'] || mongoose.model<ILeaveType>('LeaveType', LeaveTypeSchema)) as any) as any;
