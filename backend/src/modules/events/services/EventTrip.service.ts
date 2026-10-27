import { EducationalTrip, TripItinerary } from '../models/EventTrip.model';

export class EventTripService {
  async createTrip(tenantId: string, eventId: string, tripData: any) {
    const trip = new EducationalTrip({ ...tripData, tenantId, eventId });
    return await trip.save();
  }

  async addItineraryDay(tenantId: string, tripId: string, itineraryData: any) {
    const itinerary = new TripItinerary({ ...itineraryData, tenantId, tripId });
    return await itinerary.save();
  }

  async updateCheckpoint(tenantId: string, itineraryId: string, status: string) {
    return await TripItinerary.findOneAndUpdate(
      { _id: itineraryId, tenantId },
      { $set: { checkpointStatus: status } },
      { new: true }
    );
  }
}

export const eventTripService = new EventTripService();
