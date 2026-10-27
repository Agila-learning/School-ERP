import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IUtilityMeter extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  buildingId: mongoose.Types.ObjectId;
  roomId?: mongoose.Types.ObjectId;
  
  meterType: 'ELECTRICITY' | 'WATER' | 'GAS' | 'INTERNET' | 'FUEL' | 'OTHER';
  meterNumber: string;
  description?: string;
  
  unitOfMeasurement: string;
  isActive: boolean;
}

const UtilityMeterSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  buildingId: { type: Schema.Types.ObjectId, ref: 'Building', required: true },
  roomId: { type: Schema.Types.ObjectId, ref: 'Room' },
  
  meterType: { type: String, required: true },
  meterNumber: { type: String, required: true },
  description: String,
  
  unitOfMeasurement: { type: String, required: true },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

UtilityMeterSchema.plugin(softDeletePlugin);

export const UtilityMeter = (mongoose.models['UtilityMeter'] || mongoose.model<IUtilityMeter>('UtilityMeter', UtilityMeterSchema)) as any;
