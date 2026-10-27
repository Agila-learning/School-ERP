import mongoose from 'mongoose';
import Route from '../models/Route.model';
import RouteStop from '../models/RouteStop.model';
import { NotFoundError, ValidationError } from '../../../core/errors/AppError';

export class RouteService {
  private tenantId: string;

  constructor(tenantId: string) {
    this.tenantId = tenantId;
  }

  private get tid() {
    return new mongoose.Types.ObjectId(this.tenantId);
  }

  async getRoutes(branchId: string, academicYearId: string) {
    return Route.find({
      tenantId: this.tid,
      branchId: new mongoose.Types.ObjectId(branchId),
      academicYearId: new mongoose.Types.ObjectId(academicYearId),
      isDeleted: { $ne: true }
    }).populate('defaultVehicleId', 'vehicleNumber registrationNumber')
      .populate('defaultDriverId', 'firstName lastName'); // Assuming Employee has firstName/lastName
  }

  async createRoute(data: any) {
    return Route.create({
      ...data,
      tenantId: this.tid,
    });
  }

  async addStop(routeId: string, data: any) {
    const route = await Route.findOne({ _id: new mongoose.Types.ObjectId(routeId), tenantId: this.tid });
    if (!route) throw new NotFoundError('Route not found');

    // Check for sequence conflict
    const existing = await RouteStop.findOne({
      tenantId: this.tid,
      routeId: route._id,
      sequence: data.sequence,
    });
    if (existing) throw new ValidationError(`A stop with sequence ${data.sequence} already exists for this route`);

    return RouteStop.create({
      ...data,
      tenantId: this.tid,
      routeId: route._id,
    });
  }

  async getRouteStops(routeId: string) {
    return RouteStop.find({
      tenantId: this.tid,
      routeId: new mongoose.Types.ObjectId(routeId),
      isDeleted: { $ne: true }
    }).sort({ sequence: 1 });
  }
}
