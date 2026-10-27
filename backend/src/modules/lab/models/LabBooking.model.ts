import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface ILabBooking extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  branchId: mongoose.Types.ObjectId;
  laboratoryId: mongoose.Types.ObjectId;
  requestedById: mongoose.Types.ObjectId; // Ref: Employee (Teacher)
  bookingDate: Date;
  startTime: string;
  endTime: string;
  purpose: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  approvedById?: mongoose.Types.ObjectId; // Ref: Employee (Lab In-Charge)
  rejectionReason?: string;
}

const LabBookingSchema: Schema = new Schema({
  tenantId: { type: Schema.Types.Mixed, required: true, index: true },
  branchId: { type: Schema.Types.Mixed },
  laboratoryId: { type: Schema.Types.Mixed, ref: 'Laboratory' },
  laboratoryName: String,
  requestedById: { type: Schema.Types.Mixed, ref: 'Employee' },
  requestedByName: String,
  bookingDate: { type: Date, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  purpose: { type: String, required: true },
  status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'], default: 'PENDING' },
  approvedById: { type: Schema.Types.Mixed, ref: 'Employee' },
  approvedByName: String,
  rejectionReason: String,
}, { timestamps: true });

LabBookingSchema.index({ tenantId: 1, bookingDate: 1 });
LabBookingSchema.plugin(softDeletePlugin);
export default (mongoose.models['LabBooking'] || mongoose.model<ILabBooking>('LabBooking', LabBookingSchema)) as any;
