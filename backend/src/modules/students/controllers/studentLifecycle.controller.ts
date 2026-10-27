import { Response, NextFunction } from 'express';
import { TenantRequest } from '../../../core/middlewares/tenant.middleware';
import { StudentLifecycleService } from '../services/studentLifecycle.service';
import { sendResponse } from '../../../core/utils/response.util';

export class StudentLifecycleController {
  static async changeStatus(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { newStatus, reason } = req.body;
      const service = new StudentLifecycleService(req.tenantId!);
      const data = await service.changeStudentStatus(id as string, newStatus, reason, req.user!.id as string);
      sendResponse({ res, status: 200, message: 'Student status updated', data });
    } catch (e) {
      next(e);
    }
  }

  static async transferStudentOut(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const service = new StudentLifecycleService(req.tenantId!);
      const data = await service.transferStudentOut(id as string, req.body, req.user!.id as string);
      sendResponse({ res, status: 200, message: 'Student transferred out', data });
    } catch (e) {
      next(e);
    }
  }

  static async generateTransferCertificate(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { reasonForLeaving, lastClassId } = req.body;
      const service = new StudentLifecycleService(req.tenantId!);
      const data = await service.generateTransferCertificate(id as string, reasonForLeaving, lastClassId, req.user!.id as string);
      sendResponse({ res, status: 201, message: 'Transfer Certificate generated', data });
    } catch (e) {
      next(e);
    }
  }

  static async graduateStudent(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const service = new StudentLifecycleService(req.tenantId!);
      const data = await service.graduateStudent(id as string, req.body, req.user!.id as string);
      sendResponse({ res, status: 200, message: 'Student graduated successfully', data });
    } catch (e) {
      next(e);
    }
  }
}
