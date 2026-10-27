import { Response, NextFunction } from 'express';
import { TenantRequest } from '../../../core/middlewares/tenant.middleware';
import { LessonPlanService } from '../services/lessonPlan.service';
import { sendResponse } from '../../../core/utils/response.util';

export const getLessonPlans = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const service = new LessonPlanService(req.tenantId!);
    // If user is a teacher, restrict to their own plans, unless they are a Principal/Coordinator
    // We assume Principal and Coordinator can view all. The route authorization should handle role checks.
    // For now, we will allow filtering via query params.
    const query = { ...req.query };
    if (req.user.role === 'TEACHER') {
      query.teacherId = req.user.id;
    }
    
    const result = await service.getLessonPlans(query);
    sendResponse({ res, message: 'Lesson Plans fetched successfully', data: result });
  } catch (error) {
    next(error);
  }
};

export const getLessonPlanById = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const service = new LessonPlanService(req.tenantId!);
    const result = await service.getLessonPlanById(req.params.id);
    sendResponse({ res, message: 'Lesson Plan fetched successfully', data: result });
  } catch (error) {
    next(error);
  }
};

export const createLessonPlan = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const service = new LessonPlanService(req.tenantId!);
    const userId = (req.user as any)?._id || (req.user as any)?.id;
    const result = await service.createLessonPlan(req.body, userId);
    sendResponse({ res, status: 201, message: 'Lesson Plan created successfully', data: result });
  } catch (error) {
    next(error);
  }
};

export const updateLessonPlan = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const service = new LessonPlanService(req.tenantId!);
    const result = await service.updateLessonPlan(req.params.id, req.body);
    sendResponse({ res, message: 'Lesson Plan updated successfully', data: result });
  } catch (error) {
    next(error);
  }
};

export const deleteLessonPlan = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const service = new LessonPlanService(req.tenantId!);
    const result = await service.deleteLessonPlan(req.params.id);
    sendResponse({ res, message: 'Lesson Plan deleted successfully', data: result });
  } catch (error) {
    next(error);
  }
};
