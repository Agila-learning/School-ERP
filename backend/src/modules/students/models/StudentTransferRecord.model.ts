import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IStudentTransferRecord extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  transferType: 'IN' | 'OUT';
  previousSchool?: string;
  previousBoard?: string;
  previousClass?: string;
  reason: string;
  transferDate: Date;
  transferCertificateNumber?: string;
  transferCertificateUrl?: string;
  status: 'PENDING' | 'APPROVED' | 'COMPLETED' | 'CANCELLED';
  approvedByUserId?: mongoose.Types.ObjectId;
  clearanceChecklist: {
    department: 'FINANCE' | 'LIBRARY' | 'HOSTEL' | 'TRANSPORT' | 'INVENTORY' | 'ACADEMIC';
    cleared: boolean;
    clearedAt?: Date;
    clearedByUserId?: mongoose.Types.ObjectId;
    remarks?: string;
  }[];
}

const StudentTransferRecordSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    transferType: { type: String, enum: ['IN', 'OUT'], required: true },
    previousSchool: String,
    previousBoard: String,
    previousClass: String,
    reason: { type: String, required: true },
    transferDate: { type: Date, required: true },
    transferCertificateNumber: String,
    transferCertificateUrl: String,
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'COMPLETED', 'CANCELLED'],
      default: 'PENDING'
    },
    approvedByUserId: { type: Schema.Types.ObjectId, ref: 'User' },
    clearanceChecklist: [{
      department: {
        type: String,
        enum: ['FINANCE', 'LIBRARY', 'HOSTEL', 'TRANSPORT', 'INVENTORY', 'ACADEMIC'],
        required: true
      },
      cleared: { type: Boolean, default: false },
      clearedAt: Date,
      clearedByUserId: { type: Schema.Types.ObjectId, ref: 'User' },
      remarks: String
    }],
  },
  { timestamps: true }
);

StudentTransferRecordSchema.plugin(softDeletePlugin);

export default (mongoose.models['StudentTransferRecord'] || (mongoose.models['StudentTransferRecord'] || mongoose.model<IStudentTransferRecord>('StudentTransferRecord', StudentTransferRecordSchema)) as any) as any;
