import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IMeterReading extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  meterId: mongoose.Types.ObjectId;
  
  readingDate: Date;
  recordedBy: mongoose.Types.ObjectId;
  
  previousReading: number;
  currentReading: number;
  consumption: number;
  
  estimatedCost?: number;
  notes?: string;
  isAbnormal: boolean;
}

const MeterReadingSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  meterId: { type: Schema.Types.ObjectId, ref: 'UtilityMeter', required: true },
  
  readingDate: { type: Date, required: true, default: Date.now },
  recordedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  
  previousReading: { type: Number, required: true },
  currentReading: { type: Number, required: true },
  consumption: { type: Number, required: true },
  
  estimatedCost: Number,
  notes: String,
  isAbnormal: { type: Boolean, default: false },
}, { timestamps: true });

MeterReadingSchema.plugin(softDeletePlugin);

export const MeterReading = (mongoose.models['MeterReading'] || mongoose.model<IMeterReading>('MeterReading', MeterReadingSchema)) as any;
