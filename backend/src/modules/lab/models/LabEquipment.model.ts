import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface ILabEquipment extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  branchId: mongoose.Types.ObjectId;
  laboratoryId: mongoose.Types.ObjectId;
  code: string;
  name: string;
  category: string;
  manufacturer?: string;
  modelNumber?: string;
  serialNumber?: string;
  purchaseDate?: Date;
  warrantyExpiry?: Date;
  quantity: number;
  condition: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' | 'DAMAGED';
  status: 'AVAILABLE' | 'IN_USE' | 'UNDER_MAINTENANCE' | 'RETIRED';
}

const LabEquipmentSchema: Schema = new Schema({
  tenantId: { type: Schema.Types.Mixed, required: true, index: true },
  branchId: { type: Schema.Types.Mixed },
  laboratoryId: { type: Schema.Types.Mixed, ref: 'Laboratory' },
  laboratoryName: String,
  code: { type: String, required: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  manufacturer: String,
  modelNumber: String,
  serialNumber: String,
  purchaseDate: Date,
  warrantyExpiry: Date,
  quantity: { type: Number, default: 1 },
  condition: { type: String, enum: ['EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'DAMAGED'], default: 'GOOD' },
  status: { type: String, enum: ['AVAILABLE', 'IN_USE', 'UNDER_MAINTENANCE', 'RETIRED'], default: 'AVAILABLE' },
}, { timestamps: true });

LabEquipmentSchema.index({ tenantId: 1, code: 1 });
LabEquipmentSchema.plugin(softDeletePlugin);
export default (mongoose.models['LabEquipment'] || mongoose.model<ILabEquipment>('LabEquipment', LabEquipmentSchema)) as any;
