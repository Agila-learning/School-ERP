import mongoose, { Document as MongooseDocument, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IDocumentType extends MongooseDocument, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  categoryId: mongoose.Types.ObjectId;
  name: string; // "Birth Certificate", "Offer Letter"
  description?: string;
  isMandatory: boolean;
  hasExpiryDate: boolean;
  maxSizeMB: number;
  allowedFormats: string[]; // ["pdf", "jpg", "png"]
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;
}

const DocumentTypeSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    categoryId: { type: Schema.Types.ObjectId, ref: 'DocumentCategory', required: true, index: true },
    name: { type: String, required: true },
    description: { type: String },
    isMandatory: { type: Boolean, default: false },
    hasExpiryDate: { type: Boolean, default: false },
    maxSizeMB: { type: Number, default: 10 },
    allowedFormats: { type: [String], default: ['pdf', 'jpg', 'jpeg', 'png'] },
    isActive: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  {
    timestamps: true,
  }
);

DocumentTypeSchema.index({ tenantId: 1, categoryId: 1, name: 1 }, { unique: true });
DocumentTypeSchema.plugin(softDeletePlugin);

export default (mongoose.models['DocumentType'] || mongoose.model<IDocumentType>('DocumentType', DocumentTypeSchema)) as any;
