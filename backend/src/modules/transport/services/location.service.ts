import mongoose from 'mongoose';
import LocationEvent from '../models/LocationEvent.model';
import Vehicle from '../models/Vehicle.model';
import Trip from '../models/Trip.model';
import { NotFoundError } from '../../../core/errors/AppError';

export class LocationService {
  private tenantId: string;

  constructor(tenantId: string) {
    this.tenantId = tenantId;
  }

  private get tid() {
    return new mongoose.Types.ObjectId(this.tenantId);
  }

  /**
   * Ingest a GPS ping. This API must be authenticated and secured.
   */
  async ingestLocation(data: {
    vehicleId: string;
    tripId?: string;
    latitude: number;
    longitude: number;
    speedKmH?: number;
    heading?: number;
    accuracyMeters?: number;
    provider: 'HARDWARE_GPS' | 'MOBILE_APP' | 'THIRD_PARTY_API';
    timestamp: string; // ISO String
  }) {
    const vehicleObjId = new mongoose.Types.ObjectId(data.vehicleId);
    
    // Verify vehicle exists
    const vehicle = await Vehicle.findOne({ _id: vehicleObjId, tenantId: this.tid });
    if (!vehicle) throw new NotFoundError('Vehicle not found');

    const eventTime = new Date(data.timestamp);

    // Store the location event
    const location = await LocationEvent.create({
      tenantId: this.tid,
      vehicleId: vehicleObjId,
      tripId: data.tripId ? new mongoose.Types.ObjectId(data.tripId) : undefined,
      latitude: data.latitude,
      longitude: data.longitude,
      speedKmH: data.speedKmH,
      heading: data.heading,
      accuracyMeters: data.accuracyMeters,
      provider: data.provider,
      timestamp: eventTime
    });

    // We do NOT update the vehicle document with the location here.
    // That creates immense index churn. 
    // `LocationEvent` is indexed by timestamp descending, so `latestLocation` queries are fast.

    // If speed is over threshold, trigger alert (mocked here)
    if (data.speedKmH && data.speedKmH > 80) { // Should be a configurable setting
        console.warn(`[SPEED ALERT] Vehicle ${vehicle.registrationNumber} exceeded speed limit: ${data.speedKmH} km/h`);
    }

    return location;
  }

  /**
   * Fetch the latest location for parent tracking view
   */
  async getLatestVehicleLocation(vehicleId: string) {
    return LocationEvent.findOne({
      tenantId: this.tid,
      vehicleId: new mongoose.Types.ObjectId(vehicleId)
    }).sort({ timestamp: -1 }); // Get most recent
  }

  /**
   * Fetch a trip's breadcrumb trail
   */
  async getTripLocationHistory(tripId: string) {
     return LocationEvent.find({
       tenantId: this.tid,
       tripId: new mongoose.Types.ObjectId(tripId)
     }).sort({ timestamp: 1 }); // Chronological order
  }
}
