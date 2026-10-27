import { Response, NextFunction } from 'express';
import { TenantRequest } from '../../../core/middlewares/tenant.middleware';
import { EnrollmentService } from '../services/enrollment.service';
import { sendResponse } from '../../../core/utils/response.util';

export const enrollStudent = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const service = new EnrollmentService(req.tenantId!);
    const enrollment = await service.enrollStudent(req.body, req.user.id);
    sendResponse({ res, status: 201, message: 'Student enrolled successfully', data: enrollment });
  } catch (error) {
    next(error);
  }
};

export const getEnrollments = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const service = new EnrollmentService(req.tenantId!);
    const { academicYearId, sectionId } = req.query;
    if (!academicYearId) {
      return sendResponse({ res, status: 400, message: 'academicYearId is required' });
    }
    const enrollments = await service.getEnrollments(academicYearId as string, sectionId as string);
    sendResponse({ res, status: 200, message: 'Enrollments fetched', data: enrollments });
  } catch (error) {
    next(error);
  }
};

export const bulkPromote = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const service = new EnrollmentService(req.tenantId!);
    const results = await service.bulkPromote(req.body, req.user.id);
    sendResponse({ res, status: 201, message: `Successfully promoted ${results.length} students`, data: results });
  } catch (error) {
    next(error);
  }
};
