import mongoose from 'mongoose';
import BoardingEvent, { BoardingVerificationMethod } from '../models/BoardingEvent.model';
import Trip from '../models/Trip.model';
import StudentTransportAssignment from '../models/StudentTransportAssignment.model';
import { NotFoundError, ValidationError } from '../../../core/errors/AppError';

export class BoardingService {
  private tenantId: string;

  constructor(tenantId: string) {
    this.tenantId = tenantId;
  }

  private get tid() {
    return new mongoose.Types.ObjectId(this.tenantId);
  }

  /**
   * Mark a student as boarded, dropped off, or absent
   */
  async logBoardingEvent(data: {
    tripId: string;
    studentId: string;
    stopId: string;
    eventType: 'BOARDED' | 'DROPPED_OFF' | 'ABSENT' | 'MISSED_PICKUP' | 'MISSED_DROPOFF';
    recordedByUserId: string;
    verificationMethod: BoardingVerificationMethod;
    latitude?: number;
    longitude?: number;
    authorizedPickupPersonId?: string;
    reason?: string;
  }) {
    const tripObjId = new mongoose.Types.ObjectId(data.tripId);
    const trip = await Trip.findOne({ _id: tripObjId, tenantId: this.tid });
    if (!trip) throw new NotFoundError('Trip not found');

    if (trip.status !== 'IN_PROGRESS') {
      throw new ValidationError('Can only record boarding events for IN_PROGRESS trips');
    }

    // Verify student is actually assigned to this route
    const assignment = await StudentTransportAssignment.findOne({
      tenantId: this.tid,
      studentId: new mongoose.Types.ObjectId(data.studentId),
      routeId: trip.routeId,
      status: 'ACTIVE'
    });

    if (!assignment) {
       throw new ValidationError('Student is not actively assigned to this route');
    }

    // If it's a drop-off, ensure they actually boarded first
    if (data.eventType === 'DROPPED_OFF') {
       const hasBoarded = await BoardingEvent.findOne({
          tenantId: this.tid,
          tripId: tripObjId,
          studentId: assignment.studentId,
          eventType: 'BOARDED'
       });
       if (!hasBoarded) {
          throw new ValidationError('Cannot drop off a student who has not boarded this trip');
       }
    }

    return BoardingEvent.create({
      ...data,
      tenantId: this.tid,
      tripId: tripObjId,
      studentId: assignment.studentId,
      stopId: new mongoose.Types.ObjectId(data.stopId),
      vehicleId: trip.vehicleId,
      recordedByUserId: new mongoose.Types.ObjectId(data.recordedByUserId),
      authorizedPickupPersonId: data.authorizedPickupPersonId ? new mongoose.Types.ObjectId(data.authorizedPickupPersonId) : undefined,
    });
  }

  async getTripEvents(tripId: string) {
    return BoardingEvent.find({
      tenantId: this.tid,
      tripId: new mongoose.Types.ObjectId(tripId),
      isDeleted: { $ne: true }
    }).populate('studentId', 'firstName lastName')
      .populate('stopId', 'name')
      .populate('recordedByUserId', 'firstName lastName')
      .sort({ timestamp: -1 });
  }
}
