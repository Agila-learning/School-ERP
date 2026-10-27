import { Response, NextFunction } from 'express';
import { TenantRequest } from '../../../core/middlewares/tenant.middleware';
import { AuditService } from '../services/audit.service';
import { sendResponse } from '../../../core/utils/response.util';

export const getAuditLogs = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const service = new AuditService();
    const result = await service.getLogs(req.tenantId!, req.query);
    sendResponse({ res, message: 'Audit logs fetched successfully', data: result.data, meta: result.meta });
  } catch (error) {
    next(error);
  }
};
