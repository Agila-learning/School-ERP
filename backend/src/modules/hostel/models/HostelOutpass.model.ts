import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IHostelOutpass extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  hostelId: mongoose.Types.ObjectId;
  allocationId: mongoose.Types.ObjectId;
  requestDate: Date;
  leavingDateTime: Date;
  expectedReturnDateTime: Date;
  actualReturnDateTime?: Date;
  destination: string;
  reason: string;
  contactPerson?: string;
  contactNumber?: string;
  parentApprovedAt?: Date;
  parentApprovedByUserId?: mongoose.Types.ObjectId;
  wardenApprovedAt?: Date;
  wardenApprovedByUserId?: mongoose.Types.ObjectId;
  returnVerifiedByUserId?: mongoose.Types.ObjectId;
  isLate?: boolean;
  curfewViolation?: boolean;
  overdueAlertSent: boolean;
  status: 'DRAFT' | 'REQUESTED' | 'PARENT_APPROVED' | 'WARDEN_APPROVED' | 'REJECTED' | 'ACTIVE' | 'RETURNED' | 'OVERDUE' | 'CANCELLED';
  remarks?: string;
  qrCodeDataUri?: string;
}

const HostelOutpassSchema: Schema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  hostelId: { type: Schema.Types.ObjectId, ref: 'Hostel' },
  allocationId: { type: Schema.Types.ObjectId, ref: 'HostelAllocation' },
  requestDate: { type: Date, default: Date.now },
  leavingDateTime: { type: Date, default: Date.now },
  expectedReturnDateTime: { type: Date, default: () => new Date(Date.now() + 6 * 3600 * 1000) },
  actualReturnDateTime: Date,
  destination: { type: String, required: true, default: 'City' },
  reason: { type: String, default: 'General Outpass' },
  contactPerson: String,
  contactNumber: String,
  parentApprovedAt: Date,
  parentApprovedByUserId: { type: Schema.Types.ObjectId, ref: 'User' },
  wardenApprovedAt: Date,
  wardenApprovedByUserId: { type: Schema.Types.ObjectId, ref: 'User' },
  returnVerifiedByUserId: { type: Schema.Types.ObjectId, ref: 'User' },
  isLate: Boolean,
  curfewViolation: Boolean,
  overdueAlertSent: { type: Boolean, default: false },
  status: {
    type: String,
    enum: ['DRAFT', 'REQUESTED', 'PARENT_APPROVED', 'WARDEN_APPROVED', 'REJECTED', 'ACTIVE', 'RETURNED', 'OVERDUE', 'CANCELLED'],
    default: 'DRAFT',
  },
  remarks: String,
  qrCodeDataUri: String,
}, { timestamps: true });

HostelOutpassSchema.plugin(softDeletePlugin);
export default (mongoose.models['HostelOutpass'] || (mongoose.models['HostelOutpass'] || mongoose.model<IHostelOutpass>('HostelOutpass', HostelOutpassSchema)) as any) as any;
