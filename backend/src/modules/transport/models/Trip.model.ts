import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export type TripType = 'MORNING_PICKUP' | 'AFTERNOON_DROPOFF' | 'SPECIAL_TRIP' | 'FIELD_TRIP' | 'EMERGENCY_TRIP' | 'REPLACEMENT_TRIP';

export interface ITrip extends Document, ISoftDeleted {
  id: string;
  tenantId: mongoose.Types.ObjectId;
  routeId: mongoose.Types.ObjectId;
  vehicleId: mongoose.Types.ObjectId;
  driverId: mongoose.Types.ObjectId;
  attendantIds: mongoose.Types.ObjectId[];
  date: Date;
  tripType: TripType;
  scheduledStartTime: Date;
  actualStartTime?: Date;
  actualEndTime?: Date;
  startOdometer?: number;
  endOdometer?: number;
  originalVehicleId?: mongoose.Types.ObjectId; // If vehicle was replaced
  originalDriverId?: mongoose.Types.ObjectId;  // If driver was replaced
  status: 'SCHEDULED' | 'READY' | 'STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'DELAYED' | 'EMERGENCY';
}

const TripSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    routeId: { type: Schema.Types.ObjectId, ref: 'Route', required: true, index: true },
    vehicleId: { type: Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    driverId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
    attendantIds: [{ type: Schema.Types.ObjectId, ref: 'Employee' }],
    date: { type: Date, required: true },
    tripType: {
      type: String,
      enum: ['MORNING_PICKUP', 'AFTERNOON_DROPOFF', 'SPECIAL_TRIP', 'FIELD_TRIP', 'EMERGENCY_TRIP', 'REPLACEMENT_TRIP'],
      required: true,
    },
    scheduledStartTime: { type: Date, required: true },
    actualStartTime: Date,
    actualEndTime: Date,
    startOdometer: Number,
    endOdometer: Number,
    originalVehicleId: { type: Schema.Types.ObjectId, ref: 'Vehicle' },
    originalDriverId: { type: Schema.Types.ObjectId, ref: 'Employee' },
    status: {
      type: String,
      enum: ['SCHEDULED', 'READY', 'STARTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'DELAYED', 'EMERGENCY'],
      default: 'SCHEDULED',
    },
  },
  { timestamps: true }
);

// Prevent generating the same trip twice
TripSchema.index({ tenantId: 1, routeId: 1, date: 1, tripType: 1 }, { unique: true });
TripSchema.plugin(softDeletePlugin);

export default (mongoose.models['Trip'] || (mongoose.models['Trip'] || mongoose.model<ITrip>('Trip', TripSchema)) as any) as any;
