import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env';
import { TenantRequest } from './tenant.middleware';
import { UnauthorizedError, ForbiddenError } from '../errors/AppError';
import { UserRepository } from '../../modules/auth/repositories/user.repository';

import User from '../../modules/auth/models/User.model';

export const protect = async (req: TenantRequest, res: Response, next: NextFunction) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, env.jwtSecret) as any;
      
      const tenantId = req.tenantId || decoded.tenantId;
      if (tenantId && !req.tenantId) {
        req.tenantId = tenantId;
      }

      let user = null;
      if (tenantId) {
        const userRepo = new UserRepository(tenantId);
        user = await userRepo.findById(decoded.id);
      }
      if (!user) {
        user = await User.findById(decoded.id);
      }

      if (!user) {
        return next(new UnauthorizedError('Not authorized, user not found'));
      }
      
      req.user = user;
      await req.user.populate('roleIds');

      // Enforce strict multi-tenant school confidentiality:
      // School students, teachers, and staff can never access data belonging to another school
      const isSuper = (user.roleIds && user.roleIds.some((r: any) => r.name === 'Super Admin' || r.name === 'SUPER_ADMIN')) || (user as any).role === 'SUPER_ADMIN';
      if (!isSuper && user.tenantId) {
        req.tenantId = user.tenantId.toString();
      }

      next();
    } catch (error) {
      next(new UnauthorizedError('Not authorized, token failed'));
    }
  }

  if (!token) {
    next(new UnauthorizedError('Not authorized, no token'));
  }
};

export const requirePermission = (permission: string) => {
  return (req: TenantRequest, res: Response, next: NextFunction) => {
    const userRoleStr = (req.user as any)?.role || '';
    const roles: any[] = Array.isArray(req.user.roleIds) ? [...req.user.roleIds] : [];
    if (userRoleStr) {
      roles.push({ name: userRoleStr, permissions: [] });
    }

    if (roles.length === 0) {
      return next(new ForbiddenError('User has no roles assigned'));
    }

    let hasPermission = false;

    // Define permission equivalence aliases
    const aliases: Record<string, string[]> = {
      'academic.homework.view': ['assignment.view', 'child.assignments.view', 'academic.view'],
      'academic.homework.manage': ['assignment.create', 'assignment.update', 'assignment.manage', 'academic.manage'],
      'academic.class.view': ['students.view', 'students.view.assigned', 'students.view.class', 'academic.view', 'timetable.view'],
      'academic.section.view': ['students.view', 'students.view.assigned', 'students.view.class', 'academic.view', 'timetable.view'],
      'academic.subject.view': ['academic.view', 'timetable.view'],
      'academic.teacher.view': ['staff.view', 'timetable.view', 'academic.view'],
      'academic.enrollment.view': ['students.view', 'students.view.assigned', 'students.view.class', 'attendance.mark', 'academic.view'],
      'academic.enrollment.create': ['students.manage', 'admission.manage', 'academic.manage'],
      'students.manage': ['students.create', 'admission.manage', 'students.view.assigned', 'students.view.class'],
      'staff.view': ['timetable.view', 'hr.view'],
    };

    const targetPermissions = [permission, ...(aliases[permission] || [])];

    for (const role of roles) {
      if (!role) continue;
      const roleName = typeof role === 'string' ? role : (role.name || '');
      const normalizedDbRole = roleName.toUpperCase().replace(/\s+/g, '_') || '';
      if (
        normalizedDbRole === 'SUPER_ADMIN' || 
        normalizedDbRole === 'SCHOOL_ADMIN' || 
        normalizedDbRole === 'ADMIN' || 
        normalizedDbRole === 'PRINCIPAL' ||
        normalizedDbRole.includes('ADMIN') ||
        normalizedDbRole.includes('DIRECTOR')
      ) {
        hasPermission = true;
        break;
      }

      // Teacher / Coordinator / Staff contextual access
      if (normalizedDbRole.includes('TEACHER') || normalizedDbRole.includes('COORDINATOR') || normalizedDbRole.includes('STAFF')) {
        if (
          permission.startsWith('academic.') ||
          permission.startsWith('students.') ||
          permission.startsWith('attendance.') ||
          permission.startsWith('marks.') ||
          permission.startsWith('timetable.') ||
          permission.startsWith('staff.') ||
          permission.startsWith('admission.') ||
          permission.startsWith('library.') ||
          permission.startsWith('communication.') ||
          permission.startsWith('leave.') ||
          permission.startsWith('exam.') ||
          permission.startsWith('profile.') ||
          permission.startsWith('security.visitor.') ||
          permission === 'security.view'
        ) {
          hasPermission = true;
          break;
        }
      }

      // Watchman / Security Guard contextual access - Full security authority
      if (
        normalizedDbRole.includes('WATCHMAN') ||
        normalizedDbRole.includes('SECURITY') ||
        normalizedDbRole.includes('GUARD')
      ) {
        if (permission.startsWith('security.') || permission.startsWith('profile.') || permission === 'security.view') {
          hasPermission = true;
          break;
        }
      }

      // Student contextual access
      if (normalizedDbRole.includes('STUDENT')) {
        if (
          permission.startsWith('academic.homework.') ||
          permission.startsWith('academic.class.') ||
          permission.startsWith('academic.section.') ||
          permission.startsWith('academic.subject.') ||
          permission.startsWith('academic.enrollment.') ||
          permission === 'academic.view' ||
          permission.startsWith('timetable.') ||
          permission.startsWith('attendance.') ||
          permission.startsWith('marks.') ||
          permission.startsWith('library.') ||
          permission.startsWith('communication.') ||
          permission.startsWith('student.') ||
          permission.startsWith('profile.')
        ) {
          hasPermission = true;
          break;
        }
      }

      // Parent contextual access
      if (normalizedDbRole.includes('PARENT')) {
        if (
          permission.startsWith('academic.homework.') ||
          permission.startsWith('academic.class.') ||
          permission.startsWith('academic.section.') ||
          permission.startsWith('academic.subject.') ||
          permission === 'academic.view' ||
          permission.startsWith('timetable.') ||
          permission.startsWith('attendance.') ||
          permission.startsWith('marks.') ||
          permission.startsWith('library.') ||
          permission.startsWith('communication.') ||
          permission.startsWith('child.') ||
          permission.startsWith('profile.')
        ) {
          hasPermission = true;
          break;
        }
      }
      
      if (role.permissions && Array.isArray(role.permissions)) {
        if (targetPermissions.some(p => role.permissions.includes(p)) || role.permissions.includes('*')) {
          hasPermission = true;
          break;
        }

        // Hierarchical module check (e.g., transport.manage grants transport.vehicle.view)
        const parts = permission.split('.');
        const modulePrefix = parts[0];
        const isViewPermission = permission.endsWith('.view') || parts.includes('view');

        if (
          role.permissions.includes(`${modulePrefix}.manage`) ||
          role.permissions.includes(`${modulePrefix}.*`) ||
          (isViewPermission && role.permissions.includes(`${modulePrefix}.view`))
        ) {
          hasPermission = true;
          break;
        }
      }
    }

    if (!hasPermission) {
      return next(new ForbiddenError(`Missing required permission: ${permission}`));
    }

    next();
  };
};

export const restrictTo = (...roles: string[]) => {
  return (req: TenantRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new ForbiddenError('User not authenticated'));
    }

    const rawRoles: any[] = [];
    if (req.user.roleIds && Array.isArray(req.user.roleIds)) {
      rawRoles.push(...req.user.roleIds);
    }
    if ((req.user as any).role) {
      rawRoles.push((req.user as any).role);
    }
    if ((req.user as any).roles && Array.isArray((req.user as any).roles)) {
      rawRoles.push(...(req.user as any).roles);
    }

    if (rawRoles.length === 0) {
      return next(new ForbiddenError('User has no roles assigned'));
    }

    let hasRole = false;

    for (const rItem of rawRoles) {
      const roleStr = typeof rItem === 'string' ? rItem : (rItem?.name || rItem?.code || '');
      if (!roleStr) continue;

      const normalizedDbRole = roleStr.toUpperCase().replace(/\s+/g, '_');
      
      // Global platform SUPER_ADMIN bypasses general school role checks
      if (normalizedDbRole === 'SUPER_ADMIN') {
        hasRole = true;
        break;
      }

      // If the route strictly requires SUPER_ADMIN, non-super-admins cannot pass
      const requiresSuperAdmin = roles.some(r => r.toUpperCase().replace(/\s+/g, '_') === 'SUPER_ADMIN');
      if (requiresSuperAdmin) {
        continue;
      }
      
      if (roles.some(r => {
        const reqRole = r.toUpperCase().replace(/\s+/g, '_');
        if (reqRole === 'ADMIN' && (normalizedDbRole === 'SCHOOL_ADMIN' || normalizedDbRole.includes('ADMIN') || normalizedDbRole === 'PRINCIPAL')) return true;
        return reqRole === normalizedDbRole || normalizedDbRole.includes(reqRole);
      })) {
        hasRole = true;
        break;
      }
    }

    if (!hasRole) {
      return next(new ForbiddenError(`Missing required role: ${roles.join(', ')}`));
    }

    next();
  };
};
