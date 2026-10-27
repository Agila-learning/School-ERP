import { Response, NextFunction } from 'express';
import { TenantRequest } from '../../../core/middlewares/tenant.middleware';
import { AdmissionService } from '../services/admission.service';
import { sendResponse } from '../../../core/utils/response.util';

export const submitApplication = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const service = new AdmissionService(req.tenantId!);
    const app = await service.submitApplication(req.body);
    sendResponse({ res, status: 201, message: 'Application submitted successfully', data: app });
  } catch (error) {
    next(error);
  }
};

export const getApplications = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const service = new AdmissionService(req.tenantId!);
    const skip = parseInt(req.query.skip as string) || 0;
    const limit = parseInt(req.query.limit as string) || 10;
    const result = await service.getApplications(skip, limit, req.query);
    sendResponse({ res, message: 'Applications fetched successfully', data: result.data, meta: { total: result.total, skip, limit } });
  } catch (error) {
    next(error);
  }
};

export const approveApplication = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const service = new AdmissionService(req.tenantId!);
    const { applicationId, assignedSectionId, generatePortalAccess } = req.body;
    const result = await service.approveAdmission(applicationId, assignedSectionId, generatePortalAccess, req.user.id);
    sendResponse({ res, status: 201, message: 'Admission approved and student created successfully', data: result });
  } catch (error) {
    next(error);
  }
};
