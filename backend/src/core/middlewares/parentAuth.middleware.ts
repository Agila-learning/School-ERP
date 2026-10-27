import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { TenantRequest } from './tenant.middleware';
import { UnauthorizedError } from '../errors/AppError';
import Parent from '../../modules/students/models/Parent.model';
import GuardianRelationship from '../../modules/students/models/GuardianRelationship.model';
import StudentProfile from '../../modules/students/models/StudentProfile.model';

export interface ParentRequest extends TenantRequest {
  parent?: any;
}

export const parentAuthMiddleware = async (req: ParentRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return next(new UnauthorizedError('User not authenticated'));
    }

    let parent: any = null;

    // 1. Direct query param or header override (useful for admins or parent switching)
    const targetParentId = (req.query.parentId as string) || (req.headers['x-parent-id'] as string);
    if (targetParentId && mongoose.Types.ObjectId.isValid(targetParentId)) {
      parent = await Parent.findOne({ 
        _id: targetParentId, 
        tenantId: req.tenantId 
      });
    }

    // 2. Find by userId
    if (!parent) {
      parent = await Parent.findOne({ 
        userId: req.user.id, 
        tenantId: req.tenantId 
      });
    }

    // 3. Find by matching email or phone
    if (!parent && req.user.email) {
      parent = await Parent.findOne({
        email: req.user.email,
        tenantId: req.tenantId
      });
    }

    // 4. Fallback for administrative roles (Admin, Super Admin, Principal, etc.)
    // If user is staff/admin or previewing, pick the first parent that has linked children in GuardianRelationship
    if (!parent) {
      const activeRel = await GuardianRelationship.findOne({
        tenantId: req.tenantId,
        status: 'ACTIVE'
      }).populate('parentId');

      if (activeRel && activeRel.parentId) {
        parent = activeRel.parentId;
      } else {
        // Any parent in tenant
        parent = await Parent.findOne({ tenantId: req.tenantId });
      }
    }

    if (!parent) {
      return next(new UnauthorizedError('No parent profile found for this school. Please register a parent first in Parent Management.'));
    }

    req.parent = parent;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware factory to check if the parent has access to a specific student 
 * and optionally check for specific permissions.
 */
export const authorizeChildAccess = (requiredAccessFlags: string[] = []) => {
  return async (req: ParentRequest, res: Response, next: NextFunction) => {
    try {
      const studentId = req.params.studentId || req.body.studentId;
      if (!studentId) {
        return next(new UnauthorizedError('studentId is required for this route'));
      }

      if (!req.parent) {
        return next(new UnauthorizedError('Parent context missing'));
      }

      // Check relationship with parent
      let relationship = await GuardianRelationship.findOne({
        parentId: req.parent._id,
        ...(mongoose.Types.ObjectId.isValid(studentId) ? { studentId: studentId } : {}),
        tenantId: req.tenantId,
        status: 'ACTIVE'
      });

      // If not found by direct studentId, resolve student by studentIdNumber
      if (!relationship) {
        const student = await StudentProfile.findOne({
          tenantId: req.tenantId,
          $or: [
            ...(mongoose.Types.ObjectId.isValid(studentId) ? [{ _id: studentId }] : []),
            { studentIdNumber: studentId }
          ]
        });
        if (student) {
          relationship = await GuardianRelationship.findOne({
            parentId: req.parent._id,
            studentId: student._id,
            tenantId: req.tenantId,
            status: 'ACTIVE'
          });
        }
      }

      // If user is Admin/SuperAdmin/Staff, bypass strict parent check if no direct relationship
      const userRole = (req.user?.role || '').toUpperCase();
      const roles = (req.user?.roles || []).map((r: any) => (typeof r === 'string' ? r : r.name || '').toUpperCase());
      const isAdminOrStaff = userRole.includes('ADMIN') || roles.some((r: string) => r.includes('ADMIN') || r.includes('STAFF'));

      if (!relationship && !isAdminOrStaff) {
        return next(new UnauthorizedError('You are not authorized to view this student\'s information'));
      }

      // Check specific access flags if provided and relationship exists
      if (relationship) {
        for (const flag of requiredAccessFlags) {
          if (!relationship[flag] && !isAdminOrStaff) {
            return next(new UnauthorizedError(`You do not have ${flag} permission for this student`));
          }
        }
      }

      // Attach relationship to request for downstream use
      req.parent.currentRelationship = relationship;

      next();
    } catch (error) {
      next(error);
    }
  };
};

