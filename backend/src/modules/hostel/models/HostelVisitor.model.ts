import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IHostelVisitor extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  hostelId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  visitorName: string;
  relationship: string;
  contactNumber: string;
  idProofType?: string;
  idProofNumber?: string;
  purpose: string;
  checkInDateTime: Date;
  checkOutDateTime?: Date;
  approvedByUserId?: mongoose.Types.ObjectId;
  status: 'PENDING' | 'APPROVED' | 'CHECKED_IN' | 'CHECKED_OUT' | 'REJECTED';
  remarks?: string;
}

const HostelVisitorSchema: Schema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  hostelId: { type: Schema.Types.ObjectId, ref: 'Hostel', required: true },
  studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  visitorName: { type: String, required: true },
  relationship: { type: String, required: true },
  contactNumber: { type: String, required: true },
  idProofType: String,
  idProofNumber: String,
  purpose: { type: String, required: true },
  checkInDateTime: { type: Date, required: true },
  checkOutDateTime: Date,
  approvedByUserId: { type: Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['PENDING', 'APPROVED', 'CHECKED_IN', 'CHECKED_OUT', 'REJECTED'], default: 'PENDING' },
  remarks: String,
}, { timestamps: true });

HostelVisitorSchema.plugin(softDeletePlugin);
export default (mongoose.models['HostelVisitor'] || (mongoose.models['HostelVisitor'] || mongoose.model<IHostelVisitor>('HostelVisitor', HostelVisitorSchema)) as any) as any;
