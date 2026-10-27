import { SchoolEvent, EventVenueBooking } from '../models/SchoolEventCore.model';

export class EventWorkflowService {
  async approveEvent(tenantId: string, eventId: string, approverId: string) {
    const event = await SchoolEvent.findOne({ _id: eventId, tenantId });
    if (!event) throw new Error('Event not found');

    // Venue conflict check
    if (event.venueType === 'Internal') {
      const conflict = await EventVenueBooking.findOne({
        tenantId,
        venueId: event.venueName, // Assuming venueName holds the ID for internal venues in this simplified logic
        bookingStart: { $lt: event.endDate },
        bookingEnd: { $gt: event.startDate },
        status: 'Confirmed'
      });

      if (conflict) {
        throw new Error('Venue conflict detected. Cannot approve event.');
      }
      
      const booking = new EventVenueBooking({
        tenantId,
        eventId: event._id,
        venueId: event.venueName,
        bookingStart: event.startDate,
        bookingEnd: event.endDate,
        status: 'Confirmed'
      });
      await booking.save();
    }

    event.status = 'Approved';
    return await event.save();
  }

  async publishEvent(tenantId: string, eventId: string) {
    const event = await SchoolEvent.findOneAndUpdate(
      { _id: eventId, tenantId, status: 'Approved' },
      { $set: { status: 'Registration Open' } },
      { new: true }
    );
    if (!event) throw new Error('Event must be approved before publishing');
    return event;
  }
}

export const eventWorkflowService = new EventWorkflowService();
