import { Response, NextFunction } from 'express';
import { TenantRequest } from './tenant.middleware';
import { UnauthorizedError, ForbiddenError } from '../errors/AppError';
import Employee from '../../modules/hr/models/Employee.model';
import TeacherAssignment from '../../modules/academic/models/TeacherAssignment.model';

export interface StaffRequest extends TenantRequest {
  staff?: any;
}

// Middleware to authenticate staff and attach their Employee record to the request
export const staffAuthMiddleware = async (req: StaffRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return next(new UnauthorizedError('User not authenticated'));
    }

    // Find the Employee record associated with this user
    let staff = await Employee.findOne({ 
      userId: req.user.id || req.user._id, 
      tenantId: req.tenantId 
    });

    if (!staff && req.user.referenceId) {
      staff = await Employee.findById(req.user.referenceId);
    }

    if (!staff && req.user.email) {
      staff = await Employee.findOne({ email: req.user.email, tenantId: req.tenantId });
    }

    if (!staff) {
      const userRoles = [
        req.user.role,
        ...(Array.isArray(req.user.roleIds) ? req.user.roleIds.map((r: any) => typeof r === 'string' ? r : (r?.name || '')) : [])
      ].filter(Boolean).map((r: string) => r.toUpperCase().replace(/\s+/g, '_'));

      if (userRoles.some(r => r.includes('ADMIN') || r.includes('PRINCIPAL') || r.includes('TEACHER') || r.includes('COORDINATOR') || r.includes('STAFF') || r.includes('STUDENT'))) {
        req.staff = {
          _id: req.user._id || req.user.id,
          firstName: req.user.firstName,
          lastName: req.user.lastName,
          email: req.user.email,
          status: 'ACTIVE',
          role: req.user.role || 'STAFF'
        };
        return next();
      }
      return next(new UnauthorizedError('Staff profile not found for this user'));
    }

    if (staff.status && staff.status !== 'ACTIVE' && staff.status !== 'ON_PROBATION' && staff.status !== 'CONFIRMED') {
      return next(new ForbiddenError(`Staff account is currently ${staff.status}`));
    }

    req.staff = staff;
    next();
  } catch (error) {
    next(error);
  }
};

// Object-level authorization guard for teachers accessing class/student data
export const authorizeTeacherAccess = () => {
  return async (req: StaffRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.staff) {
        return next(new UnauthorizedError('Staff context missing'));
      }

      const classId = req.params.classId || req.query.classId || req.body.classId;
      const sectionId = req.params.sectionId || req.query.sectionId || req.body.sectionId;

      if (!classId || !sectionId) {
        // If the route doesn't specify class/section, we can't authorize at object level here.
        // It's up to the controller to fetch ONLY data assigned to the teacher.
        return next();
      }

      // Check if the teacher has an active assignment for this class/section
      const assignment = await TeacherAssignment.findOne({
        teacherId: req.staff._id,
        classId,
        sectionId,
        tenantId: req.tenantId,
        status: 'ACTIVE'
      });

      if (!assignment) {
        return next(new ForbiddenError('You are not authorized to view or manage data for this class/section'));
      }

      // Optional: attach assignment to request
      req.staff.currentAssignment = assignment;

      next();
    } catch (error) {
      next(error);
    }
  };
};
