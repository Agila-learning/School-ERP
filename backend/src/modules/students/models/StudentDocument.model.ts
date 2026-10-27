import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IStudentDocument extends Document, ISoftDeleted {
  id: string;
  tenantId: mongoose.Types.ObjectId;
  studentId?: mongoose.Types.ObjectId;
  studentName?: string;
  admissionNo?: string;
  className?: string;
  documentType: string;
  title?: string;
  fileName?: string;
  fileSize?: string;
  fileUrl: string;
  isVerified: boolean;
  verificationStatus: 'VERIFIED' | 'PENDING' | 'REJECTED';
  verifiedBy?: mongoose.Types.ObjectId;
  remarks?: string;
  expiryDate?: Date;
}

const StudentDocumentSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'StudentProfile', required: false, index: true },
    studentName: { type: String },
    admissionNo: { type: String },
    className: { type: String },
    documentType: { type: String, required: true },
    title: { type: String },
    fileName: { type: String },
    fileSize: { type: String },
    fileUrl: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    verificationStatus: { type: String, enum: ['VERIFIED', 'PENDING', 'REJECTED'], default: 'PENDING' },
    verifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    remarks: { type: String },
    expiryDate: Date,
  },
  {
    timestamps: true,
  }
);

StudentDocumentSchema.plugin(softDeletePlugin);

export default (mongoose.models['StudentDocument'] || (mongoose.models['StudentDocument'] || mongoose.model<IStudentDocument>('StudentDocument', StudentDocumentSchema)) as any) as any;
