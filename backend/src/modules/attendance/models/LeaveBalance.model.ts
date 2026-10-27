import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

/**
 * Running leave balance per employee per leave type per academic year.
 * Updated transactionally when leave is approved or cancelled.
 */
export interface ILeaveBalance extends Document, ISoftDeleted {
  id: string;
  tenantId: mongoose.Types.ObjectId;
  employeeId: mongoose.Types.ObjectId;
  leaveTypeId: mongoose.Types.ObjectId;
  academicYearId: mongoose.Types.ObjectId;

  totalEntitlement: number;
  usedDays: number;
  pendingDays: number;    // Leave applied but not yet approved
  availableDays: number;  // totalEntitlement - usedDays - pendingDays
  carriedForward: number;
}

const LeaveBalanceSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.Mixed, required: true, index: true },
    employeeId: { type: Schema.Types.Mixed, ref: 'Employee', required: true, index: true },
    leaveTypeId: { type: Schema.Types.Mixed, ref: 'LeaveType', required: true },
    academicYearId: { type: Schema.Types.Mixed, ref: 'AcademicYear' },

    totalEntitlement: { type: Number, default: 0 },
    usedDays: { type: Number, default: 0 },
    pendingDays: { type: Number, default: 0 },
    availableDays: { type: Number, default: 0 },
    carriedForward: { type: Number, default: 0 },
  },
  { timestamps: true }
);

LeaveBalanceSchema.index(
  { tenantId: 1, employeeId: 1, leaveTypeId: 1, academicYearId: 1 },
  { unique: true }
);
LeaveBalanceSchema.plugin(softDeletePlugin);
export default (mongoose.models['LeaveBalance'] || (mongoose.models['LeaveBalance'] || mongoose.model<ILeaveBalance>('LeaveBalance', LeaveBalanceSchema)) as any) as any;
