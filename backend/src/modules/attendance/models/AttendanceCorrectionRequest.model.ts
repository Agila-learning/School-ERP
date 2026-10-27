import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

/**
 * Immutable correction request workflow.
 * Direct database edits on locked attendance are NOT permitted.
 * A correction request must go through this approval flow.
 */
export interface IAttendanceCorrectionRequest extends Document, ISoftDeleted {
  id: string;
  tenantId: mongoose.Types.ObjectId;
  domain: 'STUDENT' | 'EMPLOYEE';
  attendanceDocId: mongoose.Types.ObjectId;  // Reference to the attendance doc
  studentId?: mongoose.Types.ObjectId;
  employeeId?: mongoose.Types.ObjectId;
  date: Date;

  previousStatus: string;
  requestedStatus: string;
  reason: string;

  requestedBy: mongoose.Types.ObjectId;
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
  reviewerRemarks?: string;

  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

const AttendanceCorrectionRequestSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    domain: { type: String, enum: ['STUDENT', 'EMPLOYEE'], required: true },
    attendanceDocId: { type: Schema.Types.ObjectId, required: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'StudentProfile' },
    employeeId: { type: Schema.Types.ObjectId, ref: 'Employee' },
    date: { type: Date, required: true },

    previousStatus: { type: String, required: true },
    requestedStatus: { type: String, required: true },
    reason: { type: String, required: true },

    requestedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: Date,
    reviewerRemarks: String,

    status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' },
  },
  { timestamps: true }
);

AttendanceCorrectionRequestSchema.index({ tenantId: 1, status: 1 });
AttendanceCorrectionRequestSchema.plugin(softDeletePlugin);
export default (mongoose.models['AttendanceCorrectionRequest'] || (mongoose.models['AttendanceCorrectionRequest'] || mongoose.model<IAttendanceCorrectionRequest>('AttendanceCorrectionRequest', AttendanceCorrectionRequestSchema)) as any) as any;
