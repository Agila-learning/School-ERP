import { Response, NextFunction } from 'express';
import { LearningService } from '../services/learning.service';
import { sendResponse } from '../../../core/utils/response.util';
import { TenantRequest } from '../../../core/middlewares/tenant.middleware';

export class LearningController {
  // Online Classes
  static async createOnlineClass(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new LearningService(req.tenantId!).createOnlineClass(req.user!.id, req.body);
      sendResponse({ res, status: 201, message: 'Online Class scheduled successfully', data });
    } catch (e) { next(e); }
  }

  static async getOnlineClasses(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new LearningService(req.tenantId!).getOnlineClasses(req.query);
      sendResponse({ res, message: 'Online Classes retrieved successfully', data });
    } catch (e) { next(e); }
  }

  static async updateOnlineClass(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new LearningService(req.tenantId!).updateOnlineClass(req.params.id, req.body);
      sendResponse({ res, message: 'Online Class updated successfully', data });
    } catch (e) { next(e); }
  }

  static async deleteOnlineClass(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      await new LearningService(req.tenantId!).deleteOnlineClass(req.params.id);
      sendResponse({ res, message: 'Online Class deleted successfully' });
    } catch (e) { next(e); }
  }

  // Projects
  static async createProject(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new LearningService(req.tenantId!).createProject(req.user!.id, req.body);
      sendResponse({ res, status: 201, message: 'Project created successfully', data });
    } catch (e) { next(e); }
  }

  static async getProjects(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new LearningService(req.tenantId!).getProjects(req.query);
      sendResponse({ res, message: 'Projects retrieved successfully', data });
    } catch (e) { next(e); }
  }

  static async updateProject(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new LearningService(req.tenantId!).updateProject(req.params.id, req.body);
      sendResponse({ res, message: 'Project updated successfully', data });
    } catch (e) { next(e); }
  }

  static async deleteProject(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      await new LearningService(req.tenantId!).deleteProject(req.params.id);
      sendResponse({ res, message: 'Project deleted successfully' });
    } catch (e) { next(e); }
  }

  // Special Classes
  static async createSpecialClass(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new LearningService(req.tenantId!).createSpecialClass(req.body);
      sendResponse({ res, status: 201, message: 'Special Class created successfully', data });
    } catch (e) { next(e); }
  }

  static async getSpecialClasses(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new LearningService(req.tenantId!).getSpecialClasses(req.query);
      sendResponse({ res, message: 'Special Classes retrieved successfully', data });
    } catch (e) { next(e); }
  }

  static async updateSpecialClass(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new LearningService(req.tenantId!).updateSpecialClass(req.params.id, req.body);
      sendResponse({ res, message: 'Special Class updated successfully', data });
    } catch (e) { next(e); }
  }

  static async deleteSpecialClass(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      await new LearningService(req.tenantId!).deleteSpecialClass(req.params.id);
      sendResponse({ res, message: 'Special Class deleted successfully' });
    } catch (e) { next(e); }
  }

  // Assessments
  static async createAssessment(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new LearningService(req.tenantId!).createAssessment(req.body);
      sendResponse({ res, status: 201, message: 'Assessment created successfully', data });
    } catch (e) { next(e); }
  }

  static async getAssessments(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new LearningService(req.tenantId!).getAssessments(req.query);
      sendResponse({ res, message: 'Assessments retrieved successfully', data });
    } catch (e) { next(e); }
  }

  static async updateAssessment(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new LearningService(req.tenantId!).updateAssessment(req.params.id, req.body);
      sendResponse({ res, message: 'Assessment updated successfully', data });
    } catch (e) { next(e); }
  }

  static async deleteAssessment(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      await new LearningService(req.tenantId!).deleteAssessment(req.params.id);
      sendResponse({ res, message: 'Assessment deleted successfully' });
    } catch (e) { next(e); }
  }

  // Lab Experiments
  static async createLabExperiment(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new LearningService(req.tenantId!).createLabExperiment(req.body);
      sendResponse({ res, status: 201, message: 'Lab Experiment created successfully', data });
    } catch (e) { next(e); }
  }

  static async getLabExperiments(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new LearningService(req.tenantId!).getLabExperiments(req.query);
      sendResponse({ res, message: 'Lab Experiments retrieved successfully', data });
    } catch (e) { next(e); }
  }

  static async updateLabExperiment(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new LearningService(req.tenantId!).updateLabExperiment(req.params.id, req.body);
      sendResponse({ res, message: 'Lab Experiment updated successfully', data });
    } catch (e) { next(e); }
  }

  static async deleteLabExperiment(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      await new LearningService(req.tenantId!).deleteLabExperiment(req.params.id);
      sendResponse({ res, message: 'Lab Experiment deleted successfully' });
    } catch (e) { next(e); }
  }
}
