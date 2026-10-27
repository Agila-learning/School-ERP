import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IShift extends Document, ISoftDeleted {
  id: string;
  tenantId: mongoose.Types.ObjectId;
  branchId?: mongoose.Types.ObjectId;
  name: string;
  startTime: string;   // e.g. "09:00"
  endTime: string;     // e.g. "18:00"
  gracePeriodMinutes: number;
  lateThresholdMinutes: number;
  workingHours: number;
  isOvernightShift: boolean;
  breaks: Array<{ name: string; startTime: string; endTime: string }>;
  status: 'ACTIVE' | 'INACTIVE';
}

const ShiftSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    branchId: { type: Schema.Types.ObjectId, ref: 'Branch' },
    name: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    gracePeriodMinutes: { type: Number, default: 10 },
    lateThresholdMinutes: { type: Number, default: 30 },
    workingHours: { type: Number, required: true },
    isOvernightShift: { type: Boolean, default: false },
    breaks: [
      {
        name: String,
        startTime: String,
        endTime: String,
      },
    ],
    status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
  },
  { timestamps: true }
);

ShiftSchema.plugin(softDeletePlugin);
export default (mongoose.models['Shift'] || (mongoose.models['Shift'] || mongoose.model<IShift>('Shift', ShiftSchema)) as any) as any;
