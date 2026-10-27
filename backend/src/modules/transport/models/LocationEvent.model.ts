import mongoose, { Document, Schema } from 'mongoose';

export interface ILocationEvent extends Document {
  id: string;
  tenantId: mongoose.Types.ObjectId;
  vehicleId: mongoose.Types.ObjectId;
  tripId?: mongoose.Types.ObjectId;
  latitude: number;
  longitude: number;
  timestamp: Date;
  speedKmH?: number;
  heading?: number;
  accuracyMeters?: number;
  provider: 'HARDWARE_GPS' | 'MOBILE_APP' | 'THIRD_PARTY_API';
}

const LocationEventSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    vehicleId: { type: Schema.Types.ObjectId, ref: 'Vehicle', required: true, index: true },
    tripId: { type: Schema.Types.ObjectId, ref: 'Trip', index: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    timestamp: { type: Date, required: true, index: true },
    speedKmH: Number,
    heading: Number,
    accuracyMeters: Number,
    provider: {
      type: String,
      enum: ['HARDWARE_GPS', 'MOBILE_APP', 'THIRD_PARTY_API'],
      required: true,
    },
  },
  { timestamps: true }
);

// Optimize time-series querying
LocationEventSchema.index({ tenantId: 1, vehicleId: 1, timestamp: -1 });

export default (mongoose.models['LocationEvent'] || (mongoose.models['LocationEvent'] || mongoose.model<ILocationEvent>('LocationEvent', LocationEventSchema)) as any) as any;
