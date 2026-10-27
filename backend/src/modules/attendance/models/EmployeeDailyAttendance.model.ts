import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export type EmployeeAttendanceStatus =
  | 'PRESENT'
  | 'ABSENT'
  | 'LATE'
  | 'HALF_DAY'
  | 'ON_LEAVE'
  | 'HOLIDAY'
  | 'WEEK_OFF'
  | 'WORK_FROM_HOME'
  | 'OFFICIAL_DUTY';

/**
 * CALCULATED daily attendance summary.
 * Derived from raw AttendanceEvents.
 * Re-calculated when a regularization is approved.
 */
export interface IEmployeeDailyAttendance extends Document, ISoftDeleted {
  id: string;
  tenantId: mongoose.Types.ObjectId;
  employeeId: mongoose.Types.ObjectId;
  shiftId?: mongoose.Types.ObjectId;
  date: Date;

  checkInTime?: Date;
  checkOutTime?: Date;
  workDurationMinutes?: number;  // Always server-calculated
  isLate: boolean;
  isEarlyExit: boolean;

  status: EmployeeAttendanceStatus;
  leaveRequestId?: mongoose.Types.ObjectId;
  isLocked: boolean;
  lockedAt?: Date;
  remarks?: string;
}

const EmployeeDailyAttendanceSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    employeeId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true, index: true },
    shiftId: { type: Schema.Types.ObjectId, ref: 'Shift' },
    date: { type: Date, required: true },

    checkInTime: Date,
    checkOutTime: Date,
    workDurationMinutes: Number,  // Server calculates — never trusts client
    isLate: { type: Boolean, default: false },
    isEarlyExit: { type: Boolean, default: false },

    status: {
      type: String,
      enum: ['PRESENT', 'ABSENT', 'LATE', 'HALF_DAY', 'ON_LEAVE', 'HOLIDAY', 'WEEK_OFF', 'WORK_FROM_HOME', 'OFFICIAL_DUTY'],
      default: 'ABSENT',
    },
    leaveRequestId: { type: Schema.Types.ObjectId, ref: 'LeaveRequest' },
    isLocked: { type: Boolean, default: false },
    lockedAt: Date,
    remarks: String,
  },
  { timestamps: true }
);

// One summary record per employee per day
EmployeeDailyAttendanceSchema.index({ tenantId: 1, employeeId: 1, date: 1 }, { unique: true });
EmployeeDailyAttendanceSchema.index({ tenantId: 1, date: 1 });
EmployeeDailyAttendanceSchema.plugin(softDeletePlugin);
export default (mongoose.models['EmployeeDailyAttendance'] || (mongoose.models['EmployeeDailyAttendance'] || mongoose.model<IEmployeeDailyAttendance>('EmployeeDailyAttendance', EmployeeDailyAttendanceSchema)) as any) as any;
