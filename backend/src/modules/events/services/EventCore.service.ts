import { SchoolEvent, EventVenueBooking } from '../models/SchoolEventCore.model';
import { EventParticipant } from '../models/EventParticipation.model';

export class EventCoreService {
  async createEvent(tenantId: string, data: any) {
    const eventId = `EVT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const event = new SchoolEvent({ ...data, tenantId, eventId });
    return await event.save();
  }

  async getEvents(tenantId: string, filters: any) {
    return await SchoolEvent.find({ tenantId, ...filters });
  }

  async getEventById(tenantId: string, eventId: string) {
    const event = await SchoolEvent.findOne({ _id: eventId, tenantId });
    if (!event) throw new Error('Event not found');
    return event;
  }

  async registerParticipant(tenantId: string, eventId: string, participantData: any) {
    const event = await SchoolEvent.findOne({ _id: eventId, tenantId });
    if (!event) throw new Error('Event not found');
    if (event.status !== 'Registration Open') throw new Error('Registration is not open for this event');

    // Capacity check
    if (event.capacity) {
      const currentCount = await EventParticipant.countDocuments({ tenantId, eventId, registrationStatus: 'Registered' });
      if (currentCount >= event.capacity) {
        participantData.registrationStatus = 'Waitlist';
      }
    }

    const participant = new EventParticipant({
      ...participantData,
      tenantId,
      eventId
    });
    return await participant.save();
  }
}

export const eventCoreService = new EventCoreService();
