import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

// --- WAITLIST ---
export interface IHostelWaitlist extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  academicYearId: mongoose.Types.ObjectId;
  applicationId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  hostelId: mongoose.Types.ObjectId;
  position: number;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'WAITING' | 'OFFERED' | 'EXPIRED' | 'ALLOCATED';
}

const WaitlistSchema: Schema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  academicYearId: { type: Schema.Types.ObjectId, required: true },
  applicationId: { type: Schema.Types.ObjectId, ref: 'HostelApplication', required: true },
  studentId: { type: Schema.Types.ObjectId, ref: 'StudentProfile', required: true },
  hostelId: { type: Schema.Types.ObjectId, ref: 'Hostel', required: true },
  position: { type: Number, required: true },
  priority: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], default: 'MEDIUM' },
  status: { type: String, enum: ['WAITING', 'OFFERED', 'EXPIRED', 'ALLOCATED'], default: 'WAITING' }
}, { timestamps: true });
WaitlistSchema.plugin(softDeletePlugin);

// --- TRANSFER ---
export interface IHostelTransfer extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  currentAllocationId: mongoose.Types.ObjectId;
  targetHostelId?: mongoose.Types.ObjectId;
  targetRoomId?: mongoose.Types.ObjectId;
  targetBedId?: mongoose.Types.ObjectId;
  reason: string;
  status: 'REQUESTED' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
}

const TransferSchema: Schema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  studentId: { type: Schema.Types.ObjectId, ref: 'StudentProfile', required: true },
  currentAllocationId: { type: Schema.Types.ObjectId, ref: 'HostelAllocation', required: true },
  targetHostelId: { type: Schema.Types.ObjectId, ref: 'Hostel' },
  targetRoomId: { type: Schema.Types.ObjectId, ref: 'HostelRoom' },
  targetBedId: { type: Schema.Types.ObjectId, ref: 'HostelBed' },
  reason: { type: String, required: true },
  status: { type: String, enum: ['REQUESTED', 'APPROVED', 'REJECTED', 'COMPLETED'], default: 'REQUESTED' }
}, { timestamps: true });
TransferSchema.plugin(softDeletePlugin);

// --- CHECKOUT ---
export interface IHostelCheckOut extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  allocationId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  checkOutDate: Date;
  reason: string;
  roomCondition: 'GOOD' | 'FAIR' | 'POOR' | 'DAMAGED';
  damageDetails?: string;
  clearanceStatus: 'PENDING' | 'CLEARED' | 'FEES_DUE' | 'DAMAGES_BILLED';
  processedBy: mongoose.Types.ObjectId;
}

const CheckOutSchema: Schema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  allocationId: { type: Schema.Types.ObjectId, ref: 'HostelAllocation', required: true },
  studentId: { type: Schema.Types.ObjectId, ref: 'StudentProfile', required: true },
  checkOutDate: { type: Date, required: true },
  reason: { type: String, required: true },
  roomCondition: { type: String, enum: ['GOOD', 'FAIR', 'POOR', 'DAMAGED'], required: true },
  damageDetails: String,
  clearanceStatus: { type: String, enum: ['PENDING', 'CLEARED', 'FEES_DUE', 'DAMAGES_BILLED'], default: 'PENDING' },
  processedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });
CheckOutSchema.plugin(softDeletePlugin);

// --- LEAVE REQUEST ---
export interface IHostelLeaveRequest extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  startDate: Date;
  endDate: Date;
  reason: string;
  destination: string;
  contactNumber: string;
  status: 'REQUESTED' | 'APPROVED' | 'REJECTED' | 'ON_LEAVE' | 'RETURNED';
  approvedBy?: mongoose.Types.ObjectId;
}

const LeaveRequestSchema: Schema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  studentId: { type: Schema.Types.ObjectId, ref: 'StudentProfile', required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  reason: { type: String, required: true },
  destination: { type: String, required: true },
  contactNumber: { type: String, required: true },
  status: { type: String, enum: ['REQUESTED', 'APPROVED', 'REJECTED', 'ON_LEAVE', 'RETURNED'], default: 'REQUESTED' },
  approvedBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });
LeaveRequestSchema.plugin(softDeletePlugin);

export const HostelWaitlist = (mongoose.models['HostelWaitlist'] || mongoose.model<IHostelWaitlist>('HostelWaitlist', WaitlistSchema)) as any;
export const HostelTransfer = (mongoose.models['HostelTransfer'] || mongoose.model<IHostelTransfer>('HostelTransfer', TransferSchema)) as any;
export const HostelCheckOut = (mongoose.models['HostelCheckOut'] || mongoose.model<IHostelCheckOut>('HostelCheckOut', CheckOutSchema)) as any;
export const HostelLeaveRequest = (mongoose.models['HostelLeaveRequest'] || mongoose.model<IHostelLeaveRequest>('HostelLeaveRequest', LeaveRequestSchema)) as any;
