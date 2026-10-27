import { FacilityBooking } from '../models/FacilityBooking.model';

export class FacilitiesService {
  async createBooking(tenantId: string, userId: string, data: any) {
    // Basic collision detection
    const existing = await FacilityBooking.findOne({
      tenantId,
      roomId: data.roomId,
      status: { $in: ['PENDING', 'APPROVED'] },
      bookingDate: data.bookingDate,
      $or: [
        { startTime: { $lte: data.endTime }, endTime: { $gte: data.startTime } }
      ]
    });

    if (existing) {
      throw new Error('Room is already booked for this time slot');
    }

    const booking = new FacilityBooking({
      ...data,
      tenantId,
      requestedBy: userId,
    });
    
    return await booking.save();
  }
}

export const facilitiesService = new FacilitiesService();
