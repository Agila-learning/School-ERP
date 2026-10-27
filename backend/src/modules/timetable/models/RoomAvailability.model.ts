import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IRoomAvailability extends Document, ISoftDeleted {
  id: string;
  tenantId: mongoose.Types.ObjectId;
  roomId: mongoose.Types.ObjectId;
  academicYearId?: mongoose.Types.ObjectId;
  day: 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN';
  periodDefinitionId: mongoose.Types.ObjectId;
  reason?: string;
  blockedFor?: string; // e.g. "Annual Function"
  effectiveFrom?: Date;
  effectiveTo?: Date;
}

const RoomAvailabilitySchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    roomId: { type: Schema.Types.ObjectId, ref: 'Room', required: true, index: true },
    academicYearId: { type: Schema.Types.ObjectId, ref: 'AcademicYear' },
    day: { type: String, enum: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'], required: true },
    periodDefinitionId: { type: Schema.Types.ObjectId, ref: 'PeriodDefinition', required: true },
    reason: String,
    blockedFor: String,
    effectiveFrom: Date,
    effectiveTo: Date,
  },
  { timestamps: true }
);

RoomAvailabilitySchema.index({ tenantId: 1, roomId: 1, day: 1 });
RoomAvailabilitySchema.plugin(softDeletePlugin);
export default (mongoose.models['RoomAvailability'] || (mongoose.models['RoomAvailability'] || mongoose.model<IRoomAvailability>('RoomAvailability', RoomAvailabilitySchema)) as any) as any;
