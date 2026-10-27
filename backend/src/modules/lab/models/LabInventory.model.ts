import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface ILabInventory extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  branchId: mongoose.Types.ObjectId;
  laboratoryId: mongoose.Types.ObjectId;
  itemCode: string;
  itemName: string;
  category: string; // 'CHEMICALS', 'GLASSWARE', 'CONSUMABLES', etc.
  unit: string;
  quantity: number;
  minimumThreshold: number;
  expiryDate?: Date;
  storageLocation?: string;
  lastRestockedDate?: Date;
  status: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'EXPIRED';
}

const LabInventorySchema: Schema = new Schema({
  tenantId: { type: Schema.Types.Mixed, required: true, index: true },
  branchId: { type: Schema.Types.Mixed },
  laboratoryId: { type: Schema.Types.Mixed, ref: 'Laboratory' },
  laboratoryName: String,
  itemCode: { type: String, required: true },
  itemName: { type: String, required: true },
  category: { type: String, required: true },
  unit: { type: String, required: true },
  quantity: { type: Number, required: true, default: 0 },
  minimumThreshold: { type: Number, required: true, default: 10 },
  expiryDate: Date,
  storageLocation: String,
  lastRestockedDate: Date,
  status: { type: String, enum: ['IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK', 'EXPIRED'], default: 'IN_STOCK' },
}, { timestamps: true });

LabInventorySchema.index({ tenantId: 1, itemCode: 1 });
LabInventorySchema.plugin(softDeletePlugin);
export default (mongoose.models['LabInventory'] || mongoose.model<ILabInventory>('LabInventory', LabInventorySchema)) as any;
