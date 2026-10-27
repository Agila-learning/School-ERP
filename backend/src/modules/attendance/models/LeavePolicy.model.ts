import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface ILeavePolicy extends Document, ISoftDeleted {
  id: string;
  tenantId: mongoose.Types.ObjectId;
  leaveTypeId: mongoose.Types.ObjectId;
  employmentType?: string;   // e.g. "Permanent" — if null, applies to all
  academicYearId?: mongoose.Types.ObjectId;

  annualEntitlement: number;
  monthlyAccrual: number;
  carryForwardAllowed: boolean;
  maxCarryForward: number;
  encashmentAllowed: boolean;
  minDaysPerRequest: number;
  maxConsecutiveDays: number;
  advanceNoticeDays: number;
  allowNegativeBalance: boolean;

  status: 'ACTIVE' | 'INACTIVE';
}

const LeavePolicySchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    leaveTypeId: { type: Schema.Types.ObjectId, ref: 'LeaveType', required: true },
    employmentType: String,
    academicYearId: { type: Schema.Types.ObjectId, ref: 'AcademicYear' },

    annualEntitlement: { type: Number, default: 12 },
    monthlyAccrual: { type: Number, default: 1 },
    carryForwardAllowed: { type: Boolean, default: false },
    maxCarryForward: { type: Number, default: 0 },
    encashmentAllowed: { type: Boolean, default: false },
    minDaysPerRequest: { type: Number, default: 0.5 },
    maxConsecutiveDays: { type: Number, default: 15 },
    advanceNoticeDays: { type: Number, default: 1 },
    allowNegativeBalance: { type: Boolean, default: false },

    status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
  },
  { timestamps: true }
);

LeavePolicySchema.plugin(softDeletePlugin);
export default (mongoose.models['LeavePolicy'] || (mongoose.models['LeavePolicy'] || mongoose.model<ILeavePolicy>('LeavePolicy', LeavePolicySchema)) as any) as any;
