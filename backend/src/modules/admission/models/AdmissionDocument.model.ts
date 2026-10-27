import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IAdmissionDocument extends Document, ISoftDeleted {
  id: string;
  tenantId: mongoose.Types.ObjectId;
  applicationId: mongoose.Types.ObjectId;
  documentType: string; // e.g. 'Birth Certificate', 'Previous TC'
  fileUrl: string;
  uploadedBy: mongoose.Types.ObjectId;
  uploadDate: Date;
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED' | 'RESUBMISSION_REQUIRED';
  verifiedBy?: mongoose.Types.ObjectId;
  verificationDate?: Date;
  remarks?: string;
}

const AdmissionDocumentSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    applicationId: { type: Schema.Types.ObjectId, ref: 'AdmissionApplication', required: true, index: true },
    documentType: { type: String, required: true },
    fileUrl: { type: String, required: true }, // URL/Path to secure object storage
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    uploadDate: { type: Date, default: Date.now },
    verificationStatus: { 
      type: String, 
      enum: ['PENDING', 'VERIFIED', 'REJECTED', 'RESUBMISSION_REQUIRED'], 
      default: 'PENDING' 
    },
    verifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    verificationDate: Date,
    remarks: String,
  },
  {
    timestamps: true,
  }
);

AdmissionDocumentSchema.plugin(softDeletePlugin);

export default (mongoose.models['AdmissionDocument'] || (mongoose.models['AdmissionDocument'] || mongoose.model<IAdmissionDocument>('AdmissionDocument', AdmissionDocumentSchema)) as any) as any;
