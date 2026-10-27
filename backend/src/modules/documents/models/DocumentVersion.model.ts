import mongoose, { Document as MongooseDocument, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IDocumentVersion extends MongooseDocument, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  documentId: mongoose.Types.ObjectId;
  
  versionNumber: number;
  
  fileName: string;
  originalFileName: string;
  mimeType: string;
  fileSize: number;
  fileUrl: string;
  
  changeReason?: string;
  uploadedBy: mongoose.Types.ObjectId;
}

const DocumentVersionSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    documentId: { type: Schema.Types.ObjectId, ref: 'Document', required: true, index: true },
    
    versionNumber: { type: Number, required: true },
    
    fileName: { type: String, required: true },
    originalFileName: { type: String, required: true },
    mimeType: { type: String, required: true },
    fileSize: { type: Number, required: true },
    fileUrl: { type: String, required: true },
    
    changeReason: { type: String },
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  {
    timestamps: true,
  }
);

DocumentVersionSchema.plugin(softDeletePlugin);

export default (mongoose.models['DocumentVersion'] || mongoose.model<IDocumentVersion>('DocumentVersion', DocumentVersionSchema)) as any;
