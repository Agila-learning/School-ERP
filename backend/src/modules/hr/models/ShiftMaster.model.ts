import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IShiftMaster extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  name: string; // e.g., 'Morning Shift', 'Night Shift'
  code: string;
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  gracePeriodMinutes: number;
  breakDurationMinutes: number;
  overtimeAllowed: boolean;
  overtimeMinimumMinutes?: number;
  workingDays: number[]; // 0=Sun, 1=Mon, etc.
  status: 'ACTIVE' | 'INACTIVE';
}

const ShiftMasterSchema: Schema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  name: { type: String, required: true },
  code: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  gracePeriodMinutes: { type: Number, default: 0 },
  breakDurationMinutes: { type: Number, default: 60 },
  overtimeAllowed: { type: Boolean, default: false },
  overtimeMinimumMinutes: Number,
  workingDays: [{ type: Number, min: 0, max: 6 }],
  status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
}, { timestamps: true });

ShiftMasterSchema.index({ tenantId: 1, code: 1 }, { unique: true });
ShiftMasterSchema.plugin(softDeletePlugin);

export default (mongoose.models['ShiftMaster'] || (mongoose.models['ShiftMaster'] || mongoose.model<IShiftMaster>('ShiftMaster', ShiftMasterSchema)) as any) as any;
