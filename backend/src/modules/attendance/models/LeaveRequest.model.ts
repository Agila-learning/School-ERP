import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface ILeaveRequest extends Document, ISoftDeleted {
  id: string;
  tenantId: mongoose.Types.ObjectId;
  domain: 'STUDENT' | 'EMPLOYEE';

  // Applicant (one of these will be set based on domain)
  studentId?: mongoose.Types.ObjectId;
  employeeId?: mongoose.Types.ObjectId;
  appliedByUserId: mongoose.Types.ObjectId; // Parent/Employee who applied

  leaveTypeId: mongoose.Types.ObjectId;
  startDate: Date;
  endDate: Date;
  isHalfDay: boolean;
  halfDayPortion?: 'FIRST_HALF' | 'SECOND_HALF';
  isHourly: boolean;
  hourlyStartTime?: string;
  hourlyEndTime?: string;
  totalDays: number;
  reason: string;
  attachmentUrl?: string;
  rejectionReason?: string;

  // Approval chain
  currentApproverUserId?: mongoose.Types.ObjectId;
  approvalHistory: Array<{
    action: 'APPROVED' | 'REJECTED' | 'FORWARDED' | 'CANCELLED';
    byUserId: mongoose.Types.ObjectId;
    at: Date;
    remarks?: string;
  }>;

  status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'WITHDRAWN' | 'EXPIRED';
}

const LeaveRequestSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.Mixed, required: true, index: true },
    domain: { type: String, enum: ['STUDENT', 'EMPLOYEE'], required: true },

    studentId: { type: Schema.Types.Mixed, ref: 'StudentProfile' },
    employeeId: { type: Schema.Types.Mixed, ref: 'Employee' },
    appliedByUserId: { type: Schema.Types.Mixed, required: true },

    leaveTypeId: { type: Schema.Types.Mixed, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isHalfDay: { type: Boolean, default: false },
    halfDayPortion: { type: String, enum: ['FIRST_HALF', 'SECOND_HALF'] },
    isHourly: { type: Boolean, default: false },
    hourlyStartTime: String,
    hourlyEndTime: String,
    totalDays: { type: Number, required: true },
    reason: { type: String, required: true },
    attachmentUrl: String,
    rejectionReason: String,

    currentApproverUserId: { type: Schema.Types.Mixed, ref: 'User' },
    approvalHistory: [
      {
        action: { type: String, enum: ['APPROVED', 'REJECTED', 'FORWARDED', 'CANCELLED', 'WITHDRAWN'], required: true },
        byUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        at: { type: Date, default: Date.now },
        remarks: String,
        _id: false,
      },
    ],

    status: { type: String, enum: ['DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'WITHDRAWN', 'EXPIRED'], default: 'PENDING' },
  },
  { timestamps: true }
);

LeaveRequestSchema.index({ tenantId: 1, employeeId: 1, status: 1 });
LeaveRequestSchema.index({ tenantId: 1, studentId: 1, status: 1 });
LeaveRequestSchema.index({ tenantId: 1, startDate: 1, endDate: 1 });
LeaveRequestSchema.plugin(softDeletePlugin);
export default (mongoose.models['LeaveRequest'] || (mongoose.models['LeaveRequest'] || mongoose.model<ILeaveRequest>('LeaveRequest', LeaveRequestSchema)) as any) as any;
