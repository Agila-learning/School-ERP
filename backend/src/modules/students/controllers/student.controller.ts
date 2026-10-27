import { Response, NextFunction } from 'express';
import { TenantRequest } from '../../../core/middlewares/tenant.middleware';
import { StudentService } from '../services/student.service';
import { sendResponse } from '../../../core/utils/response.util';
import Parent from '../models/Parent.model';
import { ForbiddenError } from '../../../core/errors/AppError';

export const getStudentProfile = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const service = new StudentService(req.tenantId!);
    const profile = await service.getStudentProfile(req.params.id as string);
    
    // Parent security check
    if (req.user?.roles?.includes('Parent')) {
      const parentRecord = await Parent.findOne({ userId: req.user.id, tenantId: req.tenantId });
      if (!parentRecord || parentRecord.familyId.toString() !== profile.familyId.toString()) {
        throw new ForbiddenError('You are not authorized to view this student profile.');
      }
    }

    sendResponse({ res, status: 200, message: 'Profile fetched', data: profile });
  } catch (error) {
    next(error);
  }
};

export const createStudent = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const service = new StudentService(req.tenantId!);
    const student = await service.createStudent(req.body, req.user.id);
    sendResponse({ res, status: 201, message: 'Student created successfully', data: student });
  } catch (error) {
    next(error);
  }
};

export const getDashboardStats = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const service = new StudentService(req.tenantId!);
    const stats = await service.getDashboardStats();
    sendResponse({ res, status: 200, message: 'Dashboard stats fetched', data: stats });
  } catch (error) {
    next(error);
  }
};

export const searchStudents = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const service = new StudentService(req.tenantId!);
    const students = await service.searchStudents(req.query);
    sendResponse({ res, status: 200, message: 'Students fetched', data: students });
  } catch (error) {
    next(error);
  }
};

export const getMedicalProfile = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const service = new StudentService(req.tenantId!);
    // RBAC middleware handles authorization, so we don't need a hardcoded role check
    const profile = await service.getMedicalProfile(req.params.id as string);
    sendResponse({ res, status: 200, message: 'Medical Profile fetched', data: profile });
  } catch (error) {
    next(error);
  }
};

export const updateMedicalProfile = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const service = new StudentService(req.tenantId!);
    const profile = await service.updateMedicalProfile(req.params.id as string, req.body, req.user.id);
    sendResponse({ res, status: 200, message: 'Medical Profile updated', data: profile });
  } catch (error) {
    next(error);
  }
};

export const updateStudentProfile = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const service = new StudentService(req.tenantId!);
    const profile = await service.updateStudentProfile(req.params.id as string, req.body, req.user.id);
    sendResponse({ res, status: 200, message: 'Student Profile updated', data: profile });
  } catch (error) {
    next(error);
  }
};

export const deactivateStudent = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const service = new StudentService(req.tenantId!);
    const profile = await service.deactivateStudent(req.params.id as string, req.user.id);
    sendResponse({ res, status: 200, message: 'Student deactivated successfully', data: profile });
  } catch (error) {
    next(error);
  }
};
