import { Response, NextFunction } from 'express';
import { TenantRequest } from '../../../core/middlewares/tenant.middleware';
import { sendResponse } from '../../../core/utils/response.util';
import { LabService } from '../services/lab.service';

export class LabController {
  // --- Dashboard Stats ---
  static async getDashboardStats(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const svc = new LabService(req.tenantId as any);
      const data = await svc.getDashboardStats();
      sendResponse({ res, message: 'Lab dashboard stats fetched successfully', data });
    } catch (err) { next(err); }
  }

  // --- Laboratory ---
  static async getLaboratories(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const svc = new LabService(req.tenantId as any);
      const data = await svc.getLaboratories(req.query.branchId as string);
      sendResponse({ res, message: 'Laboratories fetched successfully', data });
    } catch (err) { next(err); }
  }

  static async createLaboratory(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const svc = new LabService(req.tenantId as any);
      const data = await svc.createLaboratory(req.body);
      sendResponse({ res, status: 201, message: 'Laboratory created successfully', data });
    } catch (err) { next(err); }
  }

  static async updateLaboratory(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const svc = new LabService(req.tenantId as any);
      const data = await svc.updateLaboratory(req.params.id, req.body);
      sendResponse({ res, message: 'Laboratory updated successfully', data });
    } catch (err) { next(err); }
  }

  static async deleteLaboratory(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const svc = new LabService(req.tenantId as any);
      const data = await svc.deleteLaboratory(req.params.id);
      sendResponse({ res, message: 'Laboratory deleted successfully', data });
    } catch (err) { next(err); }
  }

  // --- Equipment ---
  static async getEquipment(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const svc = new LabService(req.tenantId as any);
      const data = await svc.getEquipment(req.query.laboratoryId as string);
      sendResponse({ res, message: 'Equipment fetched successfully', data });
    } catch (err) { next(err); }
  }

  static async createEquipment(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const svc = new LabService(req.tenantId as any);
      const data = await svc.createEquipment(req.body);
      sendResponse({ res, status: 201, message: 'Equipment created successfully', data });
    } catch (err) { next(err); }
  }

  static async updateEquipment(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const svc = new LabService(req.tenantId as any);
      const data = await svc.updateEquipment(req.params.id, req.body);
      sendResponse({ res, message: 'Equipment updated successfully', data });
    } catch (err) { next(err); }
  }

  static async deleteEquipment(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const svc = new LabService(req.tenantId as any);
      const data = await svc.deleteEquipment(req.params.id);
      sendResponse({ res, message: 'Equipment deleted successfully', data });
    } catch (err) { next(err); }
  }

  // --- Inventory ---
  static async getInventory(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const svc = new LabService(req.tenantId as any);
      const data = await svc.getInventory(req.query.laboratoryId as string);
      sendResponse({ res, message: 'Inventory fetched successfully', data });
    } catch (err) { next(err); }
  }

  static async createInventory(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const svc = new LabService(req.tenantId as any);
      const data = await svc.createInventory(req.body);
      sendResponse({ res, status: 201, message: 'Inventory item created successfully', data });
    } catch (err) { next(err); }
  }

  static async updateInventory(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const svc = new LabService(req.tenantId as any);
      const data = await svc.updateInventory(req.params.id, req.body);
      sendResponse({ res, message: 'Inventory item updated successfully', data });
    } catch (err) { next(err); }
  }

  static async deleteInventory(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const svc = new LabService(req.tenantId as any);
      const data = await svc.deleteInventory(req.params.id);
      sendResponse({ res, message: 'Inventory item deleted successfully', data });
    } catch (err) { next(err); }
  }

  // --- Bookings ---
  static async getBookings(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const svc = new LabService(req.tenantId as any);
      const data = await svc.getBookings(req.query.laboratoryId as string);
      sendResponse({ res, message: 'Bookings fetched successfully', data });
    } catch (err) { next(err); }
  }

  static async createBooking(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const svc = new LabService(req.tenantId as any);
      // Auto-assign requester if not in body
      if (!req.body.requestedById) req.body.requestedById = req.user?.id;
      const data = await svc.createBooking(req.body);
      sendResponse({ res, status: 201, message: 'Booking requested successfully', data });
    } catch (err) { next(err); }
  }

  static async updateBooking(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const svc = new LabService(req.tenantId as any);
      const data = await svc.updateBooking(req.params.id, req.body);
      sendResponse({ res, message: 'Booking updated successfully', data });
    } catch (err) { next(err); }
  }

  static async deleteBooking(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const svc = new LabService(req.tenantId as any);
      const data = await svc.deleteBooking(req.params.id);
      sendResponse({ res, message: 'Booking deleted successfully', data });
    } catch (err) { next(err); }
  }

  // --- Sessions ---
  static async getSessions(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const svc = new LabService(req.tenantId as any);
      const data = await svc.getSessions(req.query.laboratoryId as string);
      sendResponse({ res, message: 'Sessions fetched successfully', data });
    } catch (err) { next(err); }
  }

  static async createSession(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const svc = new LabService(req.tenantId as any);
      const data = await svc.createSession(req.body);
      sendResponse({ res, status: 201, message: 'Session created successfully', data });
    } catch (err) { next(err); }
  }

  static async updateSession(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const svc = new LabService(req.tenantId as any);
      const data = await svc.updateSession(req.params.id, req.body);
      sendResponse({ res, message: 'Session updated successfully', data });
    } catch (err) { next(err); }
  }

  static async deleteSession(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const svc = new LabService(req.tenantId as any);
      const data = await svc.deleteSession(req.params.id);
      sendResponse({ res, message: 'Session deleted successfully', data });
    } catch (err) { next(err); }
  }

  // --- Maintenance ---
  static async getMaintenance(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const svc = new LabService(req.tenantId as any);
      const data = await svc.getMaintenanceRecords(req.query.equipmentId as string);
      sendResponse({ res, message: 'Maintenance records fetched successfully', data });
    } catch (err) { next(err); }
  }

  static async createMaintenance(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const svc = new LabService(req.tenantId as any);
      if (!req.body.reportedById) req.body.reportedById = req.user?.id;
      const data = await svc.createMaintenance(req.body);
      sendResponse({ res, status: 201, message: 'Maintenance recorded successfully', data });
    } catch (err) { next(err); }
  }

  static async updateMaintenance(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const svc = new LabService(req.tenantId as any);
      const data = await svc.updateMaintenance(req.params.id, req.body);
      sendResponse({ res, message: 'Maintenance record updated successfully', data });
    } catch (err) { next(err); }
  }

  static async deleteMaintenance(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const svc = new LabService(req.tenantId as any);
      const data = await svc.deleteMaintenance(req.params.id);
      sendResponse({ res, message: 'Maintenance record deleted successfully', data });
    } catch (err) { next(err); }
  }
}
