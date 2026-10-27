import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export type BoardingVerificationMethod = 'MANUAL' | 'QR' | 'RFID' | 'NFC' | 'GEOFENCE' | 'PARENT_CONFIRMATION';

export interface IBoardingEvent extends Document, ISoftDeleted {
  id: string;
  tenantId: mongoose.Types.ObjectId;
  tripId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  stopId: mongoose.Types.ObjectId;
  eventType: 'BOARDED' | 'NOT_BOARDED' | 'DROPPED_OFF' | 'ABSENT' | 'NOT_APPLICABLE' | 'MISSED_PICKUP' | 'MISSED_DROPOFF';
  timestamp: Date;
  vehicleId: mongoose.Types.ObjectId;
  recordedByUserId: mongoose.Types.ObjectId; // Usually driver or attendant
  verificationMethod: BoardingVerificationMethod;
  latitude?: number;
  longitude?: number;
  authorizedPickupPersonId?: mongoose.Types.ObjectId; // If handed off to someone specific
  reason?: string; // e.g., For MISSED_PICKUP
  actionTaken?: string; // e.g., For MISSED_DROPOFF
}

const BoardingEventSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    tripId: { type: Schema.Types.ObjectId, ref: 'Trip', required: true, index: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    stopId: { type: Schema.Types.ObjectId, ref: 'RouteStop', required: true },
    eventType: {
      type: String,
      enum: ['BOARDED', 'NOT_BOARDED', 'DROPPED_OFF', 'ABSENT', 'NOT_APPLICABLE', 'MISSED_PICKUP', 'MISSED_DROPOFF'],
      required: true,
    },
    timestamp: { type: Date, required: true, default: Date.now },
    vehicleId: { type: Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    recordedByUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    verificationMethod: {
      type: String,
      enum: ['MANUAL', 'QR', 'RFID', 'NFC', 'GEOFENCE', 'PARENT_CONFIRMATION'],
      default: 'MANUAL',
    },
    latitude: Number,
    longitude: Number,
    authorizedPickupPersonId: { type: Schema.Types.ObjectId, ref: 'AuthorizedPickupPerson' },
    reason: String,
    actionTaken: String,
  },
  { timestamps: true }
);

BoardingEventSchema.plugin(softDeletePlugin);

export default (mongoose.models['BoardingEvent'] || (mongoose.models['BoardingEvent'] || mongoose.model<IBoardingEvent>('BoardingEvent', BoardingEventSchema)) as any) as any;
