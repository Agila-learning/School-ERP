import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IHostelAttendance extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  hostelId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  allocationId: mongoose.Types.ObjectId;
  date: Date;
  rollCallType: 'MORNING' | 'EVENING' | 'NIGHT' | 'CUSTOM';
  status: 'PRESENT' | 'ABSENT' | 'ON_LEAVE' | 'OUTPASS' | 'MEDICAL' | 'EXEMPTED';
  markedByUserId: mongoose.Types.ObjectId;
  markedAt: Date;
  remarks?: string;
  alertSent: boolean;
}

const HostelAttendanceSchema: Schema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  hostelId: { type: Schema.Types.ObjectId, ref: 'Hostel', required: true },
  studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  allocationId: { type: Schema.Types.ObjectId, ref: 'HostelAllocation', required: true },
  date: { type: Date, required: true },
  rollCallType: { type: String, enum: ['MORNING', 'EVENING', 'NIGHT', 'CUSTOM'], required: true },
  status: { type: String, enum: ['PRESENT', 'ABSENT', 'ON_LEAVE', 'OUTPASS', 'MEDICAL', 'EXEMPTED'], required: true },
  markedByUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  markedAt: { type: Date, default: Date.now },
  remarks: String,
  alertSent: { type: Boolean, default: false },
}, { timestamps: true });

// Prevent duplicate attendance for same student/date/rollCall
HostelAttendanceSchema.index(
  { tenantId: 1, studentId: 1, date: 1, rollCallType: 1 },
  { unique: true }
);
HostelAttendanceSchema.plugin(softDeletePlugin);
export default (mongoose.models['HostelAttendance'] || (mongoose.models['HostelAttendance'] || mongoose.model<IHostelAttendance>('HostelAttendance', HostelAttendanceSchema)) as any) as any;
