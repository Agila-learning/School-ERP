import { Request, Response, NextFunction } from 'express';
import { ComplaintService } from '../services/complaints.service';
import { sendResponse } from '../../../core/utils/response.util';
import { TenantRequest } from '../../../core/middlewares/tenant.middleware';

export class ComplaintController {
  static async createComplaint(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const userId = (req.user as any)?._id || (req.user as any)?.id;
      const data = await new ComplaintService(req.tenantId!).createComplaint(userId.toString(), req.body);
      sendResponse({ res, status: 201, message: 'Complaint raised successfully', data });
    } catch (e) { next(e); }
  }

  static async getComplaints(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      let filter = {};
      const userRoles = (req.user as any)?.roleIds || [];
      const roleNames = userRoles.map((r: any) => (r.name || r).toUpperCase());
      const isAdmin = roleNames.some((r: string) => r.includes('ADMIN') || r.includes('PRINCIPAL') || r === '*');
      const isParentOrStudent = roleNames.some((r: string) => r.includes('PARENT') || r.includes('STUDENT'));
      
      if (!isAdmin && isParentOrStudent) {
        const userId = (req.user as any)?._id || (req.user as any)?.id;
        filter = { userId };
      }
      const data = await new ComplaintService(req.tenantId!).getComplaints(filter);
      sendResponse({ res, message: 'Complaints retrieved successfully', data });
    } catch (e) { next(e); }
  }

  static async getComplaintById(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new ComplaintService(req.tenantId!).getComplaintById(req.params.id);
      sendResponse({ res, message: 'Complaint retrieved successfully', data });
    } catch (e) { next(e); }
  }

  static async updateComplaint(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const { status, resolution, assignedTo } = req.body;
      const data = await new ComplaintService(req.tenantId!).updateComplaintStatus(req.params.id, status, resolution, assignedTo);
      sendResponse({ res, message: 'Complaint updated successfully', data });
    } catch (e) { next(e); }
  }
}
