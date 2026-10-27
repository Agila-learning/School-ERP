import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IInventoryBrand extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  website?: string;
  status: 'ACTIVE' | 'INACTIVE';
}

const InventoryBrandSchema: Schema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  name: { type: String, required: true },
  description: String,
  website: String,
  status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
}, { timestamps: true });

InventoryBrandSchema.plugin(softDeletePlugin);
InventoryBrandSchema.index({ tenantId: 1, name: 1 }, { unique: true });

export default (mongoose.models['InventoryBrand'] || mongoose.model<IInventoryBrand>('InventoryBrand', InventoryBrandSchema)) as any;
