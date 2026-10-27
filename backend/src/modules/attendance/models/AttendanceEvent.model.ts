import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

/**
 * RAW attendance event — immutable record of every punch.
 * Never modified after creation. Used to re-calculate daily summary.
 */
export interface IAttendanceEvent extends Document, ISoftDeleted {
  id: string;
  tenantId: mongoose.Types.ObjectId;
  employeeId: mongoose.Types.ObjectId;
  eventType: 'CHECK_IN' | 'CHECK_OUT' | 'BREAK_OUT' | 'BREAK_IN';
  timestamp: Date;
  source: 'WEB' | 'MOBILE' | 'BIOMETRIC' | 'RFID' | 'MANUAL';
  latitude?: number;
  longitude?: number;
  locationAccuracy?: number;
  deviceId?: string;
  remarks?: string;
}

const AttendanceEventSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    employeeId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true, index: true },
    eventType: { type: String, enum: ['CHECK_IN', 'CHECK_OUT', 'BREAK_OUT', 'BREAK_IN'], required: true },
    timestamp: { type: Date, required: true },
    source: { type: String, enum: ['WEB', 'MOBILE', 'BIOMETRIC', 'RFID', 'MANUAL'], default: 'WEB' },
    latitude: Number,
    longitude: Number,
    locationAccuracy: Number,
    deviceId: String,
    remarks: String,
  },
  { timestamps: true }
);

AttendanceEventSchema.index({ tenantId: 1, employeeId: 1, timestamp: 1 });
AttendanceEventSchema.plugin(softDeletePlugin);
export default (mongoose.models['AttendanceEvent'] || (mongoose.models['AttendanceEvent'] || mongoose.model<IAttendanceEvent>('AttendanceEvent', AttendanceEventSchema)) as any) as any;
