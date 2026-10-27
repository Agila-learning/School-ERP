import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface ITransferCertificate extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  tcNumber: string;
  issueDate?: Date;
  reasonForLeaving: string;
  conduct: string;
  lastClassId: mongoose.Types.ObjectId;
  lastAttendanceDate: Date;
  academicInformation: string;
  status: 'REQUESTED' | 'UNDER_REVIEW' | 'APPROVED' | 'GENERATED' | 'ISSUED' | 'CANCELLED';
  requestedByUserId: mongoose.Types.ObjectId;
  approvedByUserId?: mongoose.Types.ObjectId;
  issuedByUserId?: mongoose.Types.ObjectId;
  documentUrl?: string;
}

const TransferCertificateSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    tcNumber: { type: String, required: true, unique: true },
    issueDate: Date,
    reasonForLeaving: { type: String, required: true },
    conduct: { type: String, default: 'Good' },
    lastClassId: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
    lastAttendanceDate: { type: Date, required: true },
    academicInformation: String,
    status: {
      type: String,
      enum: ['REQUESTED', 'UNDER_REVIEW', 'APPROVED', 'GENERATED', 'ISSUED', 'CANCELLED'],
      default: 'REQUESTED'
    },
    requestedByUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    approvedByUserId: { type: Schema.Types.ObjectId, ref: 'User' },
    issuedByUserId: { type: Schema.Types.ObjectId, ref: 'User' },
    documentUrl: String,
  },
  { timestamps: true }
);

TransferCertificateSchema.plugin(softDeletePlugin);

export default (mongoose.models['TransferCertificate'] || (mongoose.models['TransferCertificate'] || mongoose.model<ITransferCertificate>('TransferCertificate', TransferCertificateSchema)) as any) as any;
