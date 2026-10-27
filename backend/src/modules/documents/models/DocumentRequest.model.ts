import mongoose, { Document as MongooseDocument, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IDocumentRequest extends MongooseDocument, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  branchId: mongoose.Types.ObjectId;
  
  requestedBy: mongoose.Types.ObjectId; // User who requested (e.g. Admin)
  requestedForType: 'STUDENT' | 'EMPLOYEE' | 'PARENT';
  requestedForId: mongoose.Types.ObjectId;
  
  documentTypeId: mongoose.Types.ObjectId;
  
  dueDate?: Date;
  reason?: string;
  
  status: 'REQUESTED' | 'UPLOADED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'EXPIRED';
  
  fulfilledByDocumentId?: mongoose.Types.ObjectId;
}

const DocumentRequestSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    branchId: { type: Schema.Types.ObjectId, ref: 'Branch', required: true, index: true },
    
    requestedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    requestedForType: { type: String, enum: ['STUDENT', 'EMPLOYEE', 'PARENT'], required: true },
    requestedForId: { type: Schema.Types.ObjectId, required: true, index: true },
    
    documentTypeId: { type: Schema.Types.ObjectId, ref: 'DocumentType', required: true },
    
    dueDate: { type: Date },
    reason: { type: String },
    
    status: { 
      type: String, 
      enum: ['REQUESTED', 'UPLOADED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'CANCELLED', 'EXPIRED'],
      default: 'REQUESTED'
    },
    
    fulfilledByDocumentId: { type: Schema.Types.ObjectId, ref: 'Document' },
  },
  {
    timestamps: true,
  }
);

DocumentRequestSchema.plugin(softDeletePlugin);

export default (mongoose.models['DocumentRequest'] || mongoose.model<IDocumentRequest>('DocumentRequest', DocumentRequestSchema)) as any;
