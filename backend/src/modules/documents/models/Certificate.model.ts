import mongoose, { Document as MongooseDocument, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface ICertificate extends MongooseDocument, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  branchId: mongoose.Types.ObjectId;
  academicYearId?: mongoose.Types.ObjectId;
  
  certificateNumber: string;
  verificationCode: string; // Used for QR code
  
  studentId: mongoose.Types.ObjectId;
  documentId: mongoose.Types.ObjectId; // The actual generated PDF Document record
  
  certificateType: string; // 'BONAFIDE', 'TRANSFER', 'CONDUCT'
  
  issueDate: Date;
  issuedBy: mongoose.Types.ObjectId;
  
  status: 'ISSUED' | 'REVOKED';
  revokeReason?: string;
}

const CertificateSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    branchId: { type: Schema.Types.ObjectId, ref: 'Branch', required: true, index: true },
    academicYearId: { type: Schema.Types.ObjectId, ref: 'AcademicYear' },
    
    certificateNumber: { type: String, required: true, unique: true },
    verificationCode: { type: String, required: true, unique: true },
    
    studentId: { type: Schema.Types.ObjectId, ref: 'StudentProfile', required: true, index: true },
    documentId: { type: Schema.Types.ObjectId, ref: 'Document', required: true },
    
    certificateType: { type: String, required: true },
    
    issueDate: { type: Date, required: true, default: Date.now },
    issuedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    
    status: { 
      type: String, 
      enum: ['ISSUED', 'REVOKED'],
      default: 'ISSUED'
    },
    revokeReason: { type: String },
  },
  {
    timestamps: true,
  }
);

CertificateSchema.plugin(softDeletePlugin);

export default (mongoose.models['Certificate'] || mongoose.model<ICertificate>('Certificate', CertificateSchema)) as any;
