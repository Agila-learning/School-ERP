import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IEducationalTrip extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  eventId: mongoose.Types.ObjectId; // References SchoolEvent
  destination: string;
  transportMode: 'Bus' | 'Train' | 'Flight' | 'Private' | 'Other';
  vehicleId?: mongoose.Types.ObjectId; // References Phase 17 Transport
  pickupPoint: string;
  accommodation?: string;
  mealPlan?: string;
  emergencyContact: string;
  safetyPlan?: string;
  status: 'Planning' | 'Approved' | 'Departed' | 'Arrived' | 'Returned' | 'Cancelled';
}

export interface ITripItinerary extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  tripId: mongoose.Types.ObjectId; // References EducationalTrip
  date: Date;
  time: string;
  location: string;
  activity: string;
  responsibleStaff: mongoose.Types.ObjectId; // User ID
  notes?: string;
  checkpointStatus: 'Pending' | 'Reached' | 'Skipped';
}

const EducationalTripSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  eventId: { type: Schema.Types.ObjectId, ref: 'SchoolEvent', required: true },
  destination: { type: String, required: true },
  transportMode: { type: String, required: true },
  vehicleId: { type: Schema.Types.ObjectId },
  pickupPoint: { type: String, required: true },
  accommodation: String,
  mealPlan: String,
  emergencyContact: { type: String, required: true },
  safetyPlan: String,
  status: { type: String, default: 'Planning' },
}, { timestamps: true });

const TripItinerarySchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  tripId: { type: Schema.Types.ObjectId, ref: 'EducationalTrip', required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  location: { type: String, required: true },
  activity: { type: String, required: true },
  responsibleStaff: { type: Schema.Types.ObjectId, required: true },
  notes: String,
  checkpointStatus: { type: String, default: 'Pending' },
}, { timestamps: true });

[EducationalTripSchema, TripItinerarySchema].forEach(schema => schema.plugin(softDeletePlugin));

export const EducationalTrip = (mongoose.models['EducationalTrip'] || mongoose.model<IEducationalTrip>('EducationalTrip', EducationalTripSchema)) as any;
export const TripItinerary = (mongoose.models['TripItinerary'] || mongoose.model<ITripItinerary>('TripItinerary', TripItinerarySchema)) as any;
