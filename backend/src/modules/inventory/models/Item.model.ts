import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IItem extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  sku: string; // E.g., STAT-PEN-0001
  itemName: string;
  description?: string;
  categoryId: mongoose.Types.ObjectId;
  itemType: 'CONSUMABLE' | 'NON_CONSUMABLE' | 'ASSET' | 'SERVICE' | 'SPARE_PART' | 'DIGITAL' | 'OTHER';
  unit: string; // e.g. Piece, Box, Kg
  brand?: string;
  itemModel?: string;
  barcode?: string;
  
  // Tracking config
  trackStock: boolean;
  trackBatch: boolean;
  trackSerialNumber: boolean;
  trackExpiry: boolean;
  
  // Thresholds
  reorderLevel?: number;
  minimumStock?: number;
  maximumStock?: number;
  
  isActive: boolean;
}

const ItemSchema: Schema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  sku: { type: String, required: true },
  itemName: { type: String, required: true },
  description: String,
  categoryId: { type: Schema.Types.ObjectId, ref: 'ItemCategory', required: true },
  itemType: {
    type: String,
    enum: ['CONSUMABLE', 'NON_CONSUMABLE', 'ASSET', 'SERVICE', 'SPARE_PART', 'DIGITAL', 'OTHER'],
    required: true,
  },
  unit: { type: String, required: true },
  brand: String,
  itemModel: String,
  barcode: String,
  
  trackStock: { type: Boolean, default: true },
  trackBatch: { type: Boolean, default: false },
  trackSerialNumber: { type: Boolean, default: false },
  trackExpiry: { type: Boolean, default: false },
  
  reorderLevel: Number,
  minimumStock: Number,
  maximumStock: Number,
  
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

ItemSchema.plugin(softDeletePlugin);

// Unique SKU per tenant
ItemSchema.index({ tenantId: 1, sku: 1 }, { unique: true });

export default (mongoose.models['Item'] || (mongoose.models['Item'] || mongoose.model<IItem>('Item', ItemSchema)) as any) as any;
