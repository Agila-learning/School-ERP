import { Response, NextFunction } from 'express';
import { TenantRequest } from '../../../core/middlewares/tenant.middleware';
import { TransportService } from '../services/transport.service';
import { TripService } from '../services/trip.service';
import { sendResponse } from '../../../core/utils/response.util';

export class TransportController {
  // Dashboard
  static async getDashboardStats(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new TransportService(req.tenantId!).getDashboardStats();
      sendResponse({ res, status: 200, message: 'Success', data });
    } catch (e) { next(e); }
  }

  // --- Drivers & Staff ---
  static async getStaff(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new TransportService(req.tenantId!).getStaff(req.query.roleType as any);
      sendResponse({ res, status: 200, message: 'Success', data });
    } catch (e) { next(e); }
  }

  static async createStaff(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new TransportService(req.tenantId!).createStaff(req.body);
      sendResponse({ res, status: 201, message: 'Staff Created', data });
    } catch (e) { next(e); }
  }

  static async updateStaff(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new TransportService(req.tenantId!).updateStaff(req.params.id, req.body);
      sendResponse({ res, status: 200, message: 'Staff Updated', data });
    } catch (e) { next(e); }
  }

  static async deleteStaff(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new TransportService(req.tenantId!).deleteStaff(req.params.id);
      sendResponse({ res, status: 200, message: 'Staff Deleted', data });
    } catch (e) { next(e); }
  }

  // Vehicles
  static async getVehicles(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new TransportService(req.tenantId!).getVehicles(req.query.branchId ? String(req.query.branchId) : undefined);
      sendResponse({ res, status: 200, message: 'Success', data });
    } catch (e) { next(e); }
  }

  static async createVehicle(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new TransportService(req.tenantId!).createVehicle(req.body);
      sendResponse({ res, status: 201, message: 'Vehicle created', data });
    } catch (e) { next(e); }
  }

  static async updateVehicle(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new TransportService(req.tenantId!).updateVehicle(req.params.id, req.body);
      sendResponse({ res, status: 200, message: 'Vehicle updated', data });
    } catch (e) { next(e); }
  }

  static async deleteVehicle(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new TransportService(req.tenantId!).deleteVehicle(req.params.id);
      sendResponse({ res, status: 200, message: 'Vehicle deleted', data });
    } catch (e) { next(e); }
  }

  // Routes
  static async getRoutes(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new TransportService(req.tenantId!).getRoutes(req.query.branchId ? String(req.query.branchId) : undefined);
      sendResponse({ res, status: 200, message: 'Success', data });
    } catch (e) { next(e); }
  }

  static async createRoute(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new TransportService(req.tenantId!).createRoute(req.body);
      sendResponse({ res, status: 201, message: 'Route created', data });
    } catch (e) { next(e); }
  }

  static async updateRoute(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new TransportService(req.tenantId!).updateRoute(req.params.id, req.body);
      sendResponse({ res, status: 200, message: 'Route updated', data });
    } catch (e) { next(e); }
  }

  static async deleteRoute(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new TransportService(req.tenantId!).deleteRoute(req.params.id);
      sendResponse({ res, status: 200, message: 'Route deleted', data });
    } catch (e) { next(e); }
  }

  static async getRouteStops(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new TransportService(req.tenantId!).getRouteStops(req.params.routeId);
      sendResponse({ res, status: 200, message: 'Success', data });
    } catch (e) { next(e); }
  }

  static async createRouteStop(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new TransportService(req.tenantId!).createRouteStop(req.params.routeId, req.body);
      sendResponse({ res, status: 201, message: 'Route Stop created', data });
    } catch (e) { next(e); }
  }

  static async updateRouteStop(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new TransportService(req.tenantId!).updateRouteStop(req.params.routeId, req.params.stopId, req.body);
      sendResponse({ res, status: 200, message: 'Route Stop updated', data });
    } catch (e) { next(e); }
  }

  static async deleteRouteStop(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new TransportService(req.tenantId!).deleteRouteStop(req.params.routeId, req.params.stopId);
      sendResponse({ res, status: 200, message: 'Route Stop deleted', data });
    } catch (e) { next(e); }
  }

  // Assignments
  static async getAssignments(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new TransportService(req.tenantId!).getAssignments(req.query.routeId ? String(req.query.routeId) : undefined);
      sendResponse({ res, status: 200, message: 'Success', data });
    } catch (e) { next(e); }
  }

  static async assignStudent(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new TransportService(req.tenantId!).assignStudentTransport(req.body);
      sendResponse({ res, status: 201, message: 'Transport Assignment Successful', data });
    } catch (e) { next(e); }
  }

  static async updateAssignment(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new TransportService(req.tenantId!).updateAssignment(req.params.id, req.body);
      sendResponse({ res, status: 200, message: 'Assignment updated', data });
    } catch (e) { next(e); }
  }

  static async removeAssignment(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new TransportService(req.tenantId!).removeAssignment(req.params.id);
      sendResponse({ res, status: 200, message: 'Assignment removed', data });
    } catch (e) { next(e); }
  }

  // Maintenance
  static async getMaintenanceRecords(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new TransportService(req.tenantId!).getMaintenanceRecords(req.query.vehicleId ? String(req.query.vehicleId) : undefined);
      sendResponse({ res, status: 200, message: 'Success', data });
    } catch (e) { next(e); }
  }

  static async createMaintenanceRecord(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new TransportService(req.tenantId!).createMaintenanceRecord(req.body);
      sendResponse({ res, status: 201, message: 'Maintenance record created', data });
    } catch (e) { next(e); }
  }

  static async updateMaintenanceRecord(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new TransportService(req.tenantId!).updateMaintenanceRecord(req.params.id, req.body);
      sendResponse({ res, status: 200, message: 'Maintenance record updated', data });
    } catch (e) { next(e); }
  }

  static async deleteMaintenanceRecord(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new TransportService(req.tenantId!).deleteMaintenanceRecord(req.params.id);
      sendResponse({ res, status: 200, message: 'Maintenance record deleted', data });
    } catch (e) { next(e); }
  }

  // Reports
  static async getTransportReport(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new TransportService(req.tenantId!).getTransportReport(req.query.type as string, req.query);
      sendResponse({ res, status: 200, message: 'Success', data });
    } catch (e) { next(e); }
  }
}

export class TripController {
  static async getTrips(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new TripService(req.tenantId!).getTrips(req.query.date ? String(req.query.date) : undefined);
      sendResponse({ res, status: 200, message: 'Success', data });
    } catch (e) { next(e); }
  }

  static async createTrip(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new TripService(req.tenantId!).createTrip(req.body);
      sendResponse({ res, status: 201, message: 'Trip Created', data });
    } catch (e) { next(e); }
  }

  static async cancelTrip(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new TripService(req.tenantId!).cancelTrip(String(req.params.tripId), req.body.reason);
      sendResponse({ res, status: 200, message: 'Trip Cancelled', data });
    } catch (e) { next(e); }
  }

  static async startTrip(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new TripService(req.tenantId!).startTrip(String(req.params.tripId), req.body.startOdometer);
      sendResponse({ res, status: 200, message: 'Trip Started', data });
    } catch (e) { next(e); }
  }

  static async endTrip(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new TripService(req.tenantId!).endTrip(String(req.params.tripId), req.body.endOdometer);
      sendResponse({ res, status: 200, message: 'Trip Completed', data });
    } catch (e) { next(e); }
  }

  static async recordBoarding(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new TripService(req.tenantId!).recordBoarding(String(req.params.tripId), req.body);
      sendResponse({ res, status: 201, message: 'Boarding Recorded', data });
    } catch (e) { next(e); }
  }

  static async getLatestGPS(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new TripService(req.tenantId!).getLatestGPS(String(req.params.tripId));
      sendResponse({ res, status: 200, message: 'Success', data });
    } catch (e) { next(e); }
  }

  static async getDriverTodayTrip(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const userId = (req.user as any)?._id || (req.user as any)?.id;
      const data = await new TripService(req.tenantId!).getDriverTodayTrip(userId);
      sendResponse({ res, status: 200, message: 'Driver today trip fetched', data });
    } catch (e) { next(e); }
  }

  static async updateTripStatus(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new TripService(req.tenantId!).updateTripStatus(req.params.tripId, req.body.status, req.body);
      sendResponse({ res, status: 200, message: 'Trip status updated', data });
    } catch (e) { next(e); }
  }
}
