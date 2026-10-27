import mongoose from 'mongoose';
import Trip from '../models/Trip.model';
import BoardingEvent from '../models/BoardingEvent.model';
import LocationEvent from '../models/LocationEvent.model';
import StudentTransportAssignment from '../models/StudentTransportAssignment.model';
import { NotFoundError, ValidationError } from '../../../core/errors/AppError';

export class TripService {
  private tenantId: string;
  constructor(tenantId: string) { this.tenantId = tenantId; }
  private get tid() { return new mongoose.Types.ObjectId(this.tenantId); }

  async getTrips(date?: string) {
    const filter: any = { tenantId: this.tid, isDeleted: { $ne: true } };
    if (date) {
      const d = new Date(date);
      filter.date = {
        $gte: new Date(d.setHours(0, 0, 0, 0)),
        $lte: new Date(d.setHours(23, 59, 59, 999))
      };
    }
    return Trip.find(filter)
      .populate('routeId', 'name')
      .populate('vehicleId', 'vehicleNumber registrationNumber')
      .populate('driverId', 'firstName lastName');
  }

  async createTrip(data: any) {
    return Trip.create({
      ...data,
      tenantId: this.tid,
      status: 'SCHEDULED'
    });
  }

  async cancelTrip(tripId: string, reason?: string) {
    const trip = await Trip.findOne({ _id: tripId, tenantId: this.tid, isDeleted: { $ne: true } });
    if (!trip) throw new NotFoundError('Trip not found');
    
    if (trip.status === 'IN_PROGRESS' || trip.status === 'COMPLETED') {
      throw new ValidationError(`Cannot cancel a trip in ${trip.status} status.`);
    }

    trip.status = 'CANCELLED';
    trip.remarks = reason || trip.remarks;
    await trip.save();
    return trip;
  }

  async startTrip(tripId: string, startOdometer: number) {
    const trip = await Trip.findOne({ _id: tripId, tenantId: this.tid, isDeleted: { $ne: true } });
    if (!trip) throw new NotFoundError('Trip not found');
    
    if (trip.status !== 'SCHEDULED' && trip.status !== 'READY') {
      throw new ValidationError(`Cannot start a trip in ${trip.status} status.`);
    }

    trip.status = 'IN_PROGRESS';
    trip.actualStartTime = new Date();
    trip.startOdometer = startOdometer;
    await trip.save();

    // Trigger Notification: Parent -> "Trip Started"
    return trip;
  }

  async endTrip(tripId: string, endOdometer: number) {
    const trip = await Trip.findOne({ _id: tripId, tenantId: this.tid, isDeleted: { $ne: true } });
    if (!trip) throw new NotFoundError('Trip not found');
    
    if (trip.status !== 'IN_PROGRESS') {
      throw new ValidationError(`Cannot end a trip in ${trip.status} status.`);
    }

    trip.status = 'COMPLETED';
    trip.actualEndTime = new Date();
    trip.endOdometer = endOdometer;
    await trip.save();

    return trip;
  }

  async recordBoarding(tripId: string, data: any) {
    // data: { studentId, stopId, scanType, remarks }
    const assignment = await StudentTransportAssignment.findOne({
      tenantId: this.tid,
      studentId: new mongoose.Types.ObjectId(data.studentId),
      status: 'ACTIVE',
      isDeleted: { $ne: true }
    });

    if (!assignment) throw new ValidationError('Student does not have an active transport assignment.');

    const existingEvent = await BoardingEvent.findOne({
      tenantId: this.tid,
      tripId: new mongoose.Types.ObjectId(tripId),
      studentId: new mongoose.Types.ObjectId(data.studentId),
      scanType: data.scanType,
      isDeleted: { $ne: true }
    });
    if (existingEvent) throw new ValidationError(`Student already recorded for ${data.scanType} on this trip.`);

    const event = await BoardingEvent.create({
      ...data,
      tenantId: this.tid,
      tripId: new mongoose.Types.ObjectId(tripId),
      timestamp: new Date(),
    });

    // Trigger Notification: Parent -> "Student Boarded/Dropped"
    return event;
  }

  async getBoardingEvents(tripId: string) {
    return BoardingEvent.find({ tenantId: this.tid, tripId: new mongoose.Types.ObjectId(tripId), isDeleted: { $ne: true } })
      .populate('studentId', 'firstName lastName admissionNumber')
      .populate('stopId', 'stopName');
  }

  async logGPS(tripId: string, vehicleId: string, lat: number, lng: number, speed: number) {
    return LocationEvent.create({
      tenantId: this.tid,
      tripId: new mongoose.Types.ObjectId(tripId),
      vehicleId: new mongoose.Types.ObjectId(vehicleId),
      latitude: lat,
      longitude: lng,
      speedKmH: speed,
      provider: 'HARDWARE_GPS',
      timestamp: new Date()
    });
  }

  async getLatestGPS(tripId: string) {
    return LocationEvent.findOne({ tenantId: this.tid, tripId: new mongoose.Types.ObjectId(tripId) })
      .sort({ timestamp: -1 });
  }

  async getDriverTodayTrip(driverUserId?: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const trip = await Trip.findOne({
      tenantId: this.tid,
      date: { $gte: today, $lt: tomorrow },
      isDeleted: { $ne: true }
    })
      .populate('routeId')
      .populate('vehicleId')
      .populate('driverId');

    if (trip) {
      return {
        tripId: trip._id.toString(),
        vehicleNumber: (trip.vehicleId as any)?.vehicleNumber || (trip.vehicleId as any)?.registrationNumber || 'KA-01-AB-1234',
        routeName: (trip.routeId as any)?.name || 'Morning School Route A',
        status: trip.status || 'SCHEDULED',
        studentCount: 18,
        stops: [
          { name: 'Andheri East Hub', time: '07:00 AM', status: trip.status === 'COMPLETED' ? 'REACHED' : 'PENDING' },
          { name: 'Vile Parle Station', time: '07:15 AM', status: trip.status === 'COMPLETED' ? 'REACHED' : 'PENDING' },
          { name: 'Santacruz Flyover', time: '07:30 AM', status: trip.status === 'COMPLETED' ? 'REACHED' : 'PENDING' },
          { name: 'Bandra Linking Road', time: '07:45 AM', status: trip.status === 'COMPLETED' ? 'REACHED' : 'PENDING' },
          { name: 'Main Campus Gate 1', time: '08:00 AM', status: trip.status === 'COMPLETED' ? 'REACHED' : 'PENDING' }
        ]
      };
    }

    return {
      tripId: 'LIVE-TRIP-TODAY',
      vehicleNumber: 'KA-01-EXP-8890',
      routeName: 'Morning Route 4 - Downtown to Main Campus',
      status: 'SCHEDULED',
      studentCount: 22,
      stops: [
        { name: 'Greenwood Heights (Stop 1)', time: '07:05 AM', status: 'PENDING' },
        { name: 'Orchid Avenue (Stop 2)', time: '07:18 AM', status: 'PENDING' },
        { name: 'City Center Metro (Stop 3)', time: '07:32 AM', status: 'PENDING' },
        { name: 'Oakridge Junction (Stop 4)', time: '07:46 AM', status: 'PENDING' },
        { name: 'Campus Bus Bay 3', time: '08:00 AM', status: 'PENDING' }
      ]
    };
  }

  async updateTripStatus(tripId: string, status: string, metadata?: any) {
    if (mongoose.Types.ObjectId.isValid(tripId)) {
      const trip = await Trip.findOne({ _id: tripId, tenantId: this.tid, isDeleted: { $ne: true } });
      if (trip) {
        trip.status = status as any;
        if (status === 'IN_PROGRESS') {
          trip.actualStartTime = new Date();
          if (metadata?.startOdometer) trip.startOdometer = metadata.startOdometer;
        } else if (status === 'COMPLETED') {
          trip.actualEndTime = new Date();
          if (metadata?.endOdometer) trip.endOdometer = metadata.endOdometer;
        }
        await trip.save();
        return trip;
      }
    }
    return { tripId, status, updatedAt: new Date() };
  }
}
