import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IDocumentCategory extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  name: string; // STUDENT, EMPLOYEE, HR, ACADEMIC, ADMISSION, etc.
  description?: string;
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;
}

const DocumentCategorySchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    name: { type: String, required: true, uppercase: true },
    description: { type: String },
    isActive: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  {
    timestamps: true,
  }
);

DocumentCategorySchema.index({ tenantId: 1, name: 1 }, { unique: true });
DocumentCategorySchema.plugin(softDeletePlugin);

export default (mongoose.models['DocumentCategory'] || mongoose.model<IDocumentCategory>('DocumentCategory', DocumentCategorySchema)) as any;
