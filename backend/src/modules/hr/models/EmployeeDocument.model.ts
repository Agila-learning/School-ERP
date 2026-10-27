import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IEmployeeDocument extends Document, ISoftDeleted {
  id: string;
  tenantId: mongoose.Types.ObjectId;
  employeeId: mongoose.Types.ObjectId;
  documentType: string; // e.g. Resume, ID Proof
  fileUrl: string;
  uploadDate: Date;
  uploadedBy: mongoose.Types.ObjectId;
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
  verifiedBy?: mongoose.Types.ObjectId;
  expiryDate?: Date;
  version: number;
  remarks?: string;
}

const EmployeeDocumentSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    employeeId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true, index: true },
    documentType: { type: String, required: true },
    fileUrl: { type: String, required: true },
    uploadDate: { type: Date, default: Date.now },
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    verificationStatus: { type: String, enum: ['PENDING', 'VERIFIED', 'REJECTED'], default: 'PENDING' },
    verifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    expiryDate: Date,
    version: { type: Number, default: 1 },
    remarks: String,
  },
  {
    timestamps: true,
  }
);

EmployeeDocumentSchema.plugin(softDeletePlugin);

export default (mongoose.models['EmployeeDocument'] || (mongoose.models['EmployeeDocument'] || mongoose.model<IEmployeeDocument>('EmployeeDocument', EmployeeDocumentSchema)) as any) as any;
