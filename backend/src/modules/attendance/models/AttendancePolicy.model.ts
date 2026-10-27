import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IAttendancePolicy extends Document, ISoftDeleted {
  id: string;
  tenantId: mongoose.Types.ObjectId;
  branchId?: mongoose.Types.ObjectId;
  academicYearId?: mongoose.Types.ObjectId;
  classId?: mongoose.Types.ObjectId;
  name: string;
  domain: 'STUDENT' | 'EMPLOYEE';

  // Timing rules
  gracePeriodMinutes: number;
  lateThresholdMinutes: number;
  halfDayThresholdHours: number;

  // Attendance rules
  minAttendancePercent: number;
  countApprovedLeaveInPercent: boolean;

  // Marking rules
  attendanceMode: 'DAILY' | 'PERIOD_WISE';
  lockAfterHours: number;           // auto-lock X hours after day end
  allowBackdatedDays: number;       // how many days back can attendance be marked
  requireApprovalForCorrection: boolean;

  isDefault: boolean;
  status: 'ACTIVE' | 'INACTIVE';
}

const AttendancePolicySchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    branchId: { type: Schema.Types.ObjectId, ref: 'Branch' },
    academicYearId: { type: Schema.Types.ObjectId, ref: 'AcademicYear' },
    classId: { type: Schema.Types.ObjectId, ref: 'Class' },
    name: { type: String, required: true },
    domain: { type: String, enum: ['STUDENT', 'EMPLOYEE'], required: true },

    gracePeriodMinutes: { type: Number, default: 10 },
    lateThresholdMinutes: { type: Number, default: 30 },
    halfDayThresholdHours: { type: Number, default: 4 },

    minAttendancePercent: { type: Number, default: 75 },
    countApprovedLeaveInPercent: { type: Boolean, default: true },

    attendanceMode: { type: String, enum: ['DAILY', 'PERIOD_WISE'], default: 'DAILY' },
    lockAfterHours: { type: Number, default: 24 },
    allowBackdatedDays: { type: Number, default: 3 },
    requireApprovalForCorrection: { type: Boolean, default: true },

    isDefault: { type: Boolean, default: false },
    status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
  },
  { timestamps: true }
);

AttendancePolicySchema.plugin(softDeletePlugin);
export default (mongoose.models['AttendancePolicy'] || (mongoose.models['AttendancePolicy'] || mongoose.model<IAttendancePolicy>('AttendancePolicy', AttendancePolicySchema)) as any) as any;
