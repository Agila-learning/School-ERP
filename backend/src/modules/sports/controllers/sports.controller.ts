import { Response, NextFunction } from 'express';
import { TenantRequest } from '../../../core/middlewares/tenant.middleware';
import { sendResponse } from '../../../core/utils/response.util';
import { SportsService } from '../services/sports.service';

export class SportsController {
  // --- Dashboard Stats ---
  static async getDashboardStats(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const svc = new SportsService(req.tenantId as any);
      const data = await svc.getDashboardStats();
      sendResponse({ res, message: 'Sports dashboard statistics fetched successfully', data });
    } catch (err) { next(err); }
  }

  // --- Teams ---
  static async getTeams(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const svc = new SportsService(req.tenantId as any);
      const data = await svc.getTeams(req.query.sportType as string);
      sendResponse({ res, message: 'Sports teams fetched successfully', data });
    } catch (err) { next(err); }
  }

  static async createTeam(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const svc = new SportsService(req.tenantId as any);
      const data = await svc.createTeam(req.body);
      sendResponse({ res, status: 201, message: 'Sports team created successfully', data });
    } catch (err) { next(err); }
  }

  static async updateTeam(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const svc = new SportsService(req.tenantId as any);
      const data = await svc.updateTeam(req.params.id, req.body);
      sendResponse({ res, message: 'Sports team updated successfully', data });
    } catch (err) { next(err); }
  }

  static async deleteTeam(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const svc = new SportsService(req.tenantId as any);
      const data = await svc.deleteTeam(req.params.id);
      sendResponse({ res, message: 'Sports team deleted successfully', data });
    } catch (err) { next(err); }
  }

  // --- Events ---
  static async getEvents(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const svc = new SportsService(req.tenantId as any);
      const data = await svc.getEvents(req.query.sportType as string);
      sendResponse({ res, message: 'Sports events fetched successfully', data });
    } catch (err) { next(err); }
  }

  static async createEvent(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const svc = new SportsService(req.tenantId as any);
      const data = await svc.createEvent(req.body);
      sendResponse({ res, status: 201, message: 'Sports event created successfully', data });
    } catch (err) { next(err); }
  }

  static async updateEvent(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const svc = new SportsService(req.tenantId as any);
      const data = await svc.updateEvent(req.params.id, req.body);
      sendResponse({ res, message: 'Sports event updated successfully', data });
    } catch (err) { next(err); }
  }

  static async deleteEvent(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const svc = new SportsService(req.tenantId as any);
      const data = await svc.deleteEvent(req.params.id);
      sendResponse({ res, message: 'Sports event deleted successfully', data });
    } catch (err) { next(err); }
  }

  // --- Equipment ---
  static async getEquipment(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const svc = new SportsService(req.tenantId as any);
      const data = await svc.getEquipment(req.query.sportCategory as string);
      sendResponse({ res, message: 'Sports equipment fetched successfully', data });
    } catch (err) { next(err); }
  }

  static async createEquipment(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const svc = new SportsService(req.tenantId as any);
      const data = await svc.createEquipment(req.body);
      sendResponse({ res, status: 201, message: 'Sports equipment added successfully', data });
    } catch (err) { next(err); }
  }

  static async updateEquipment(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const svc = new SportsService(req.tenantId as any);
      const data = await svc.updateEquipment(req.params.id, req.body);
      sendResponse({ res, message: 'Sports equipment updated successfully', data });
    } catch (err) { next(err); }
  }

  static async deleteEquipment(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const svc = new SportsService(req.tenantId as any);
      const data = await svc.deleteEquipment(req.params.id);
      sendResponse({ res, message: 'Sports equipment deleted successfully', data });
    } catch (err) { next(err); }
  }

  // --- Practice Sessions ---
  static async getSessions(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const svc = new SportsService(req.tenantId as any);
      const data = await svc.getSessions(req.query.sportType as string);
      sendResponse({ res, message: 'Practice sessions fetched successfully', data });
    } catch (err) { next(err); }
  }

  static async createSession(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const svc = new SportsService(req.tenantId as any);
      const data = await svc.createSession(req.body);
      sendResponse({ res, status: 201, message: 'Practice session scheduled successfully', data });
    } catch (err) { next(err); }
  }

  static async updateSession(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const svc = new SportsService(req.tenantId as any);
      const data = await svc.updateSession(req.params.id, req.body);
      sendResponse({ res, message: 'Practice session updated successfully', data });
    } catch (err) { next(err); }
  }

  static async deleteSession(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const svc = new SportsService(req.tenantId as any);
      const data = await svc.deleteSession(req.params.id);
      sendResponse({ res, message: 'Practice session deleted successfully', data });
    } catch (err) { next(err); }
  }
}
