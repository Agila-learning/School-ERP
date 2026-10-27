import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IRouteStop extends Document, ISoftDeleted {
  id: string;
  tenantId: mongoose.Types.ObjectId;
  routeId: mongoose.Types.ObjectId;
  name: string;
  address?: string;
  sequence: number;
  latitude?: number;
  longitude?: number;
  pickupTime: string; // HH:mm
  dropoffTime: string; // HH:mm
  landmark?: string;
  maxCapacity?: number;
  status: 'ACTIVE' | 'INACTIVE';
}

const RouteStopSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    routeId: { type: Schema.Types.ObjectId, ref: 'Route', required: true, index: true },
    name: { type: String, required: true },
    address: String,
    sequence: { type: Number, required: true },
    latitude: Number,
    longitude: Number,
    pickupTime: { type: String, required: true },
    dropoffTime: { type: String, required: true },
    landmark: String,
    maxCapacity: Number,
    status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
  },
  { timestamps: true }
);

// Sequence must be unique per route
RouteStopSchema.index({ tenantId: 1, routeId: 1, sequence: 1 }, { unique: true });
RouteStopSchema.plugin(softDeletePlugin);

export default (mongoose.models['RouteStop'] || (mongoose.models['RouteStop'] || mongoose.model<IRouteStop>('RouteStop', RouteStopSchema)) as any) as any;
