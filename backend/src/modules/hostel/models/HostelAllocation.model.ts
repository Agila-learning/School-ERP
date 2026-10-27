import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IHostelAllocation extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  academicYearId: mongoose.Types.ObjectId;
  applicationId?: mongoose.Types.ObjectId;
  hostelId: mongoose.Types.ObjectId;
  buildingId: mongoose.Types.ObjectId;
  floorId: mongoose.Types.ObjectId;
  roomId: mongoose.Types.ObjectId;
  bedId: mongoose.Types.ObjectId;
  startDate: Date;
  expectedEndDate?: Date;
  actualEndDate?: Date;
  allocationType: 'STANDARD' | 'TEMPORARY' | 'EMERGENCY';
  allocatedByUserId: mongoose.Types.ObjectId;
  status: 'RESERVED' | 'ACTIVE' | 'TRANSFERRED' | 'COMPLETED' | 'CANCELLED';
  feeDemandId?: mongoose.Types.ObjectId;
  checkInId?: mongoose.Types.ObjectId;
}

const HostelAllocationSchema: Schema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  academicYearId: { type: Schema.Types.ObjectId, ref: 'AcademicYear', default: () => new mongoose.Types.ObjectId() },
  applicationId: { type: Schema.Types.ObjectId, ref: 'HostelApplication' },
  hostelId: { type: Schema.Types.ObjectId, ref: 'Hostel' },
  buildingId: { type: Schema.Types.ObjectId, ref: 'HostelBuilding' },
  floorId: { type: Schema.Types.ObjectId, ref: 'HostelFloor' },
  roomId: { type: Schema.Types.ObjectId, ref: 'HostelRoom', required: true },
  bedId: { type: Schema.Types.ObjectId, ref: 'HostelBed', required: true },
  startDate: { type: Date, default: Date.now },
  expectedEndDate: Date,
  actualEndDate: Date,
  allocationType: { type: String, enum: ['STANDARD', 'TEMPORARY', 'EMERGENCY'], default: 'STANDARD' },
  allocatedByUserId: { type: Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['RESERVED', 'ACTIVE', 'ALLOCATED', 'CHECKED_IN', 'CHECKED_OUT', 'TRANSFERRED', 'COMPLETED', 'CANCELLED'], default: 'ALLOCATED' },
  feeDemandId: { type: Schema.Types.ObjectId, ref: 'FeeDemand' },
  checkInId: { type: Schema.Types.ObjectId, ref: 'HostelCheckIn' },
}, { timestamps: true });

// Only ONE ACTIVE allocation per bed at a time — the core concurrency safeguard
HostelAllocationSchema.index(
  { tenantId: 1, bedId: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: { $in: ['RESERVED', 'ACTIVE', 'ALLOCATED', 'CHECKED_IN'] } } }
);
HostelAllocationSchema.index({ tenantId: 1, studentId: 1, status: 1 });
HostelAllocationSchema.plugin(softDeletePlugin);
export default (mongoose.models['HostelAllocation'] || (mongoose.models['HostelAllocation'] || mongoose.model<IHostelAllocation>('HostelAllocation', HostelAllocationSchema)) as any) as any;
