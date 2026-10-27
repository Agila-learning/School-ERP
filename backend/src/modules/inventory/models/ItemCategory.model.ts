import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IItemCategory extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  parentCategoryId?: mongoose.Types.ObjectId;
}

const ItemCategorySchema: Schema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  name: { type: String, required: true },
  description: String,
  parentCategoryId: { type: Schema.Types.ObjectId, ref: 'ItemCategory' },
}, { timestamps: true });

ItemCategorySchema.plugin(softDeletePlugin);

ItemCategorySchema.index({ tenantId: 1, name: 1 }, { unique: true });

export default (mongoose.models['ItemCategory'] || (mongoose.models['ItemCategory'] || mongoose.model<IItemCategory>('ItemCategory', ItemCategorySchema)) as any) as any;
