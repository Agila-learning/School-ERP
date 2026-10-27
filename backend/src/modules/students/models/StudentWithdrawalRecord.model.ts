import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IStudentWithdrawalRecord extends Document, ISoftDeleted {
  id: string;
  tenantId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  requestDate: Date;
  reason: string;
  feeClearanceStatus: 'PENDING' | 'CLEARED';
  libraryClearanceStatus: 'PENDING' | 'CLEARED';
  hostelClearanceStatus?: 'PENDING' | 'CLEARED';
  transportClearanceStatus?: 'PENDING' | 'CLEARED';
  overallStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  approvedByUserId?: mongoose.Types.ObjectId;
  approvalDate?: Date;
  transferCertificateUrl?: string;
}

const StudentWithdrawalRecordSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'StudentProfile', required: true, index: true },
    requestDate: { type: Date, default: Date.now },
    reason: { type: String, required: true },
    feeClearanceStatus: { type: String, enum: ['PENDING', 'CLEARED'], default: 'PENDING' },
    libraryClearanceStatus: { type: String, enum: ['PENDING', 'CLEARED'], default: 'PENDING' },
    hostelClearanceStatus: { type: String, enum: ['PENDING', 'CLEARED'] },
    transportClearanceStatus: { type: String, enum: ['PENDING', 'CLEARED'] },
    overallStatus: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' },
    approvedByUserId: { type: Schema.Types.ObjectId, ref: 'User' },
    approvalDate: Date,
    transferCertificateUrl: String,
  },
  {
    timestamps: true,
  }
);

StudentWithdrawalRecordSchema.plugin(softDeletePlugin);

export default (mongoose.models['StudentWithdrawalRecord'] || (mongoose.models['StudentWithdrawalRecord'] || mongoose.model<IStudentWithdrawalRecord>('StudentWithdrawalRecord', StudentWithdrawalRecordSchema)) as any) as any;
