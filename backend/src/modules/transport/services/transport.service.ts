import mongoose from 'mongoose';
import Vehicle from '../models/Vehicle.model';
import Route from '../models/Route.model';
import RouteStop from '../models/RouteStop.model';
import StudentTransportAssignment from '../models/StudentTransportAssignment.model';
import { FeeService } from '../../finance/services/fee.service';
import { NotFoundError, ValidationError } from '../../../core/errors/AppError';

export class TransportService {
  private tenantId: string;
  constructor(tenantId: string) { this.tenantId = tenantId; }
  private get tid() { return new mongoose.Types.ObjectId(this.tenantId); }

  // --- Dashboard ---
  async getDashboardStats() {
    const totalVehicles = await Vehicle.countDocuments({ tenantId: this.tid, isDeleted: { $ne: true } });
    const activeVehicles = await Vehicle.countDocuments({ tenantId: this.tid, status: 'ACTIVE', isDeleted: { $ne: true } });
    const totalRoutes = await Route.countDocuments({ tenantId: this.tid, isDeleted: { $ne: true } });
    const assignedStudents = await StudentTransportAssignment.countDocuments({ tenantId: this.tid, status: 'ACTIVE', isDeleted: { $ne: true } });

    return { totalVehicles, activeVehicles, totalRoutes, assignedStudents };
  }

  // --- Drivers & Staff ---
  async getStaff(roleType?: 'DRIVER' | 'ATTENDANT') {
    const filter: any = { tenantId: this.tid, isDeleted: { $ne: true } };
    if (roleType) filter.roleType = roleType;
    const TransportStaff = mongoose.models['TransportStaff'] || require('../models/TransportStaff.model').default;
    return TransportStaff.find(filter)
      .populate('employeeId', 'firstName lastName mobile email')
      .populate('assignedVehicleId', 'registrationNumber vehicleNumber make model seatingCapacity')
      .populate('assignedRouteId', 'name code routeNumber')
      .sort({ createdAt: -1 });
  }

  async createStaff(data: any) {
    const TransportStaff = mongoose.models['TransportStaff'] || require('../models/TransportStaff.model').default;
    if (data.employeeId) {
      const existing = await TransportStaff.findOne({ tenantId: this.tid, employeeId: data.employeeId, isDeleted: { $ne: true } });
      if (existing) throw new ValidationError('This employee is already registered as transport staff');
    }
    
    if (data.roleType === 'DRIVER' && !data.licenseNumber) {
      throw new ValidationError('License number is required for Drivers');
    }
    
    return TransportStaff.create({ 
      ...data, 
      dutyStatus: data.dutyStatus || 'AVAILABLE',
      status: data.status || 'ACTIVE',
      tenantId: this.tid 
    });
  }

  async updateStaff(id: string, data: any) {
    const TransportStaff = mongoose.models['TransportStaff'] || require('../models/TransportStaff.model').default;
    const staff = await TransportStaff.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(id), tenantId: this.tid },
      { $set: data },
      { new: true }
    )
      .populate('employeeId', 'firstName lastName mobile email')
      .populate('assignedVehicleId', 'registrationNumber vehicleNumber make model seatingCapacity')
      .populate('assignedRouteId', 'name code routeNumber');
    if (!staff) throw new NotFoundError('Transport staff not found');
    return staff;
  }

  async deleteStaff(id: string) {
    const TransportStaff = mongoose.models['TransportStaff'] || require('../models/TransportStaff.model').default;
    const staff = await TransportStaff.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(id), tenantId: this.tid },
      { $set: { isDeleted: true, status: 'INACTIVE', dutyStatus: 'OFF_DUTY' } },
      { new: true }
    );
    if (!staff) throw new NotFoundError('Transport staff not found');
    return staff;
  }

  // --- Vehicles ---
  async getVehicles(branchId?: string) {
    const filter: any = { tenantId: this.tid, isDeleted: { $ne: true } };
    if (branchId) filter.branchId = new mongoose.Types.ObjectId(branchId);
    return Vehicle.find(filter);
  }

  async createVehicle(data: any) {
    if (!data.branchId) data.branchId = '60d5ec49f1b2c80015f8a001';
    const existing = await Vehicle.findOne({ tenantId: this.tid, registrationNumber: data.registrationNumber });
    if (existing) throw new ValidationError('Vehicle with this registration number already exists');
    return Vehicle.create({ ...data, tenantId: this.tid });
  }

  async updateVehicle(id: string, data: any) {
    if (data.registrationNumber) {
      const existing = await Vehicle.findOne({ tenantId: this.tid, registrationNumber: data.registrationNumber, _id: { $ne: new mongoose.Types.ObjectId(id) } });
      if (existing) throw new ValidationError('Vehicle with this registration number already exists');
    }
    const vehicle = await Vehicle.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(id), tenantId: this.tid },
      { $set: data },
      { new: true }
    );
    if (!vehicle) throw new NotFoundError('Vehicle not found');
    return vehicle;
  }

  async deleteVehicle(id: string) {
    const vehicle = await Vehicle.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(id), tenantId: this.tid },
      { $set: { isDeleted: true, status: 'RETIRED' } },
      { new: true }
    );
    if (!vehicle) throw new NotFoundError('Vehicle not found');
    return vehicle;
  }

  // --- Routes & Stops ---
  async getRoutes(branchId?: string) {
    const filter: any = { tenantId: this.tid, isDeleted: { $ne: true } };
    if (branchId) filter.branchId = new mongoose.Types.ObjectId(branchId);
    return Route.find(filter)
      .populate('defaultVehicleId', 'vehicleNumber registrationNumber seatingCapacity')
      .populate('defaultDriverId', 'firstName lastName mobile');
  }

  async createRoute(data: any) {
    const payload = { ...data, tenantId: this.tid };
    if (!payload.defaultVehicleId) delete payload.defaultVehicleId;
    if (!payload.defaultDriverId) delete payload.defaultDriverId;
    if (!payload.defaultAttendantId) delete payload.defaultAttendantId;
    if (!payload.branchId) delete payload.branchId;
    if (!payload.academicYearId) delete payload.academicYearId;
    return Route.create(payload);
  }

  async updateRoute(id: string, data: any) {
    const route = await Route.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(id), tenantId: this.tid },
      { $set: data },
      { new: true }
    );
    if (!route) throw new NotFoundError('Route not found');
    return route;
  }

  async deleteRoute(id: string) {
    const route = await Route.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(id), tenantId: this.tid },
      { $set: { isDeleted: true } },
      { new: true }
    );
    if (!route) throw new NotFoundError('Route not found');
    return route;
  }

  async getRouteStops(routeId: string) {
    return RouteStop.find({ tenantId: this.tid, routeId: new mongoose.Types.ObjectId(routeId), isDeleted: { $ne: true } })
      .sort({ sequence: 1 });
  }

  async createRouteStop(routeId: string, data: any) {
    return RouteStop.create({ 
      ...data, 
      tenantId: this.tid, 
      routeId: new mongoose.Types.ObjectId(routeId) 
    });
  }

  async updateRouteStop(routeId: string, stopId: string, data: any) {
    const stop = await RouteStop.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(stopId), routeId: new mongoose.Types.ObjectId(routeId), tenantId: this.tid },
      { $set: data },
      { new: true }
    );
    if (!stop) throw new NotFoundError('Route Stop not found');
    return stop;
  }

  async deleteRouteStop(routeId: string, stopId: string) {
    const stop = await RouteStop.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(stopId), routeId: new mongoose.Types.ObjectId(routeId), tenantId: this.tid },
      { $set: { isDeleted: true } },
      { new: true }
    );
    if (!stop) throw new NotFoundError('Route Stop not found');
    return stop;
  }

  // --- Student Transport Assignments ---
  async getAssignments(routeId?: string) {
    const filter: any = { tenantId: this.tid, isDeleted: { $ne: true } };
    if (routeId) filter.routeId = new mongoose.Types.ObjectId(routeId);
    return StudentTransportAssignment.find(filter)
      .populate('studentId', 'firstName lastName admissionNumber')
      .populate('routeId', 'name direction')
      .populate('pickupStopId', 'stopName estimatedTime')
      .populate('dropoffStopId', 'stopName estimatedTime');
  }

  async assignStudentTransport(data: any) {
    try {
      // 1. Verify capacity on the route's vehicle
      const route = await Route.findOne({ _id: data.routeId, tenantId: this.tid }).populate('defaultVehicleId');
      if (!route) throw new NotFoundError('Route not found');

      const vehicle = route.defaultVehicleId as any;
      if (!vehicle) throw new ValidationError('Route has no assigned vehicle');

      const currentAssignments = await StudentTransportAssignment.countDocuments({
        tenantId: this.tid,
        routeId: route._id,
        status: 'ACTIVE',
        isDeleted: { $ne: true }
      });

      if (currentAssignments >= vehicle.seatingCapacity) {
        throw new ValidationError(`Vehicle capacity exceeded. Max capacity is ${vehicle.seatingCapacity}.`);
      }

      // 2. Create Assignment
      const assignment = await StudentTransportAssignment.create({
        ...data,
        tenantId: this.tid,
      });

      // 3. Trigger Finance Invoice creation if fee data is provided
      if (data.feeAmount && data.academicYearId && data.branchId) {
        const feeService = new FeeService(this.tenantId);
        await feeService.generateTransportFeeInvoice(
          data.studentId,
          data.branchId,
          data.academicYearId,
          data.feeAmount,
          data.dueDate || new Date()
        );
      }

      return assignment;
    } catch (err) {
      throw err;
    }
  }

  async updateAssignment(id: string, data: any) {
    const assignment = await StudentTransportAssignment.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(id), tenantId: this.tid },
      { $set: data },
      { new: true }
    );
    if (!assignment) throw new NotFoundError('Assignment not found');
    return assignment;
  }

  async removeAssignment(id: string) {
    const assignment = await StudentTransportAssignment.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(id), tenantId: this.tid },
      { $set: { isDeleted: true, status: 'INACTIVE' } },
      { new: true }
    );
    if (!assignment) throw new NotFoundError('Assignment not found');
    return assignment;
  }

  // --- Maintenance ---
  async getMaintenanceRecords(vehicleId?: string) {
    const filter: any = { tenantId: this.tid, isDeleted: { $ne: true } };
    if (vehicleId) filter.vehicleId = new mongoose.Types.ObjectId(vehicleId);
    const VehicleMaintenance = mongoose.models['VehicleMaintenance'] || require('../models/VehicleMaintenance.model').default;
    return VehicleMaintenance.find(filter).populate('vehicleId', 'vehicleNumber registrationNumber');
  }

  async createMaintenanceRecord(data: any) {
    const VehicleMaintenance = mongoose.models['VehicleMaintenance'] || require('../models/VehicleMaintenance.model').default;
    return VehicleMaintenance.create({ ...data, tenantId: this.tid });
  }

  async updateMaintenanceRecord(id: string, data: any) {
    const VehicleMaintenance = mongoose.models['VehicleMaintenance'] || require('../models/VehicleMaintenance.model').default;
    const record = await VehicleMaintenance.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(id), tenantId: this.tid },
      { $set: data },
      { new: true }
    );
    if (!record) throw new NotFoundError('Maintenance record not found');
    return record;
  }

  async deleteMaintenanceRecord(id: string) {
    const VehicleMaintenance = mongoose.models['VehicleMaintenance'] || require('../models/VehicleMaintenance.model').default;
    const record = await VehicleMaintenance.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(id), tenantId: this.tid },
      { $set: { isDeleted: true } },
      { new: true }
    );
    if (!record) throw new NotFoundError('Maintenance record not found');
    return record;
  }

  // --- Reports ---
  async getTransportReport(type: string, query: any) {
    // For Phase 107, generate aggregations based on report type
    // types: 'VEHICLE', 'ROUTE', 'STUDENT_TRANSPORT', 'MAINTENANCE'
    switch (type) {
      case 'VEHICLE':
        return Vehicle.find({ tenantId: this.tid, isDeleted: { $ne: true } }).lean();
      case 'ROUTE':
        return Route.find({ tenantId: this.tid, isDeleted: { $ne: true } })
          .populate('defaultVehicleId', 'vehicleNumber capacity')
          .populate('defaultDriverId', 'firstName lastName')
          .lean();
      case 'STUDENT_TRANSPORT':
        return StudentTransportAssignment.find({ tenantId: this.tid, isDeleted: { $ne: true } })
          .populate('studentId', 'firstName lastName admissionNumber')
          .populate('routeId', 'name code')
          .populate('pickupStopId', 'stopName')
          .lean();
      case 'MAINTENANCE':
        const VehicleMaintenance = mongoose.models['VehicleMaintenance'] || require('../models/VehicleMaintenance.model').default;
        return VehicleMaintenance.find({ tenantId: this.tid, isDeleted: { $ne: true } })
          .populate('vehicleId', 'vehicleNumber registrationNumber')
          .lean();
      default:
        throw new ValidationError('Invalid report type specified');
    }
  }
}
