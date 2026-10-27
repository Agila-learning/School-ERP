import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IInventoryUnit extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  name: string; // e.g., 'Piece', 'Kilogram'
  abbreviation: string; // e.g., 'pcs', 'kg'
  status: 'ACTIVE' | 'INACTIVE';
}

const InventoryUnitSchema: Schema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  name: { type: String, required: true },
  abbreviation: { type: String, required: true },
  status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
}, { timestamps: true });

InventoryUnitSchema.plugin(softDeletePlugin);
InventoryUnitSchema.index({ tenantId: 1, name: 1 }, { unique: true });

export default (mongoose.models['InventoryUnit'] || mongoose.model<IInventoryUnit>('InventoryUnit', InventoryUnitSchema)) as any;
