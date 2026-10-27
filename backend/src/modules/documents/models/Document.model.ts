import mongoose, { Document as MongooseDocument, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IDocument extends MongooseDocument, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  branchId: mongoose.Types.ObjectId;
  academicYearId?: mongoose.Types.ObjectId;
  
  categoryId: mongoose.Types.ObjectId;
  documentTypeId: mongoose.Types.ObjectId;
  
  title: string;
  description?: string;
  
  // Storage Info
  fileName: string;
  originalFileName: string;
  mimeType: string;
  fileSize: number;
  fileUrl: string; // Or storageKey
  
  // Polymorphic Owner (Student, Employee, etc.)
  ownerType: 'STUDENT' | 'EMPLOYEE' | 'PARENT' | 'SCHOOL' | 'OTHER';
  ownerId: mongoose.Types.ObjectId;
  
  uploadedBy: mongoose.Types.ObjectId;
  
  status: 'UPLOADED' | 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED' | 'EXPIRED' | 'ARCHIVED';
  verificationStatus: 'NOT_REQUIRED' | 'PENDING' | 'VERIFIED' | 'REJECTED';
  
  issueDate?: Date;
  expiryDate?: Date;
  
  version: number;
  isConfidential: boolean;
  isArchived: boolean;
}

const DocumentSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    branchId: { type: Schema.Types.ObjectId, ref: 'Branch', required: true, index: true },
    academicYearId: { type: Schema.Types.ObjectId, ref: 'AcademicYear' },
    
    categoryId: { type: Schema.Types.ObjectId, ref: 'DocumentCategory', required: true, index: true },
    documentTypeId: { type: Schema.Types.ObjectId, ref: 'DocumentType', required: true, index: true },
    
    title: { type: String, required: true },
    description: { type: String },
    
    fileName: { type: String, required: true },
    originalFileName: { type: String, required: true },
    mimeType: { type: String, required: true },
    fileSize: { type: Number, required: true },
    fileUrl: { type: String, required: true },
    
    ownerType: { 
      type: String, 
      enum: ['STUDENT', 'EMPLOYEE', 'PARENT', 'SCHOOL', 'OTHER'], 
      required: true,
      index: true
    },
    ownerId: { type: Schema.Types.ObjectId, required: true, index: true },
    
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    
    status: { 
      type: String, 
      enum: ['UPLOADED', 'PENDING_REVIEW', 'APPROVED', 'REJECTED', 'EXPIRED', 'ARCHIVED'],
      default: 'UPLOADED',
      index: true
    },
    verificationStatus: { 
      type: String, 
      enum: ['NOT_REQUIRED', 'PENDING', 'VERIFIED', 'REJECTED'],
      default: 'NOT_REQUIRED'
    },
    
    issueDate: { type: Date },
    expiryDate: { type: Date, index: true },
    
    version: { type: Number, default: 1 },
    isConfidential: { type: Boolean, default: false },
    isArchived: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

DocumentSchema.plugin(softDeletePlugin);

export default (mongoose.models['Document'] || mongoose.model<IDocument>('Document', DocumentSchema)) as any;
