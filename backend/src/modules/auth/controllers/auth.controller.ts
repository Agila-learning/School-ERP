import { Request, Response, NextFunction } from 'express';
import { TenantRequest } from '../../../core/middlewares/tenant.middleware';
import { UserRepository } from '../repositories/user.repository';
import Session from '../models/Session.model';
import Role from '../models/Role.model';
import { generateToken, generateRefreshToken } from '../services/auth.service';
import Invitation from '../models/Invitation.model';
import crypto from 'crypto';
import { UnauthorizedError, ValidationError, NotFoundError } from '../../../core/errors/AppError';
import { sendResponse } from '../../../core/utils/response.util';
import { logger } from '../../../core/logger/logger';
import jwt from 'jsonwebtoken';
import { env } from '../../../config/env';
import { AuditService } from '../../audit/services/audit.service';

// @desc    Auth user & get token
// @route   POST /api/v1/auth/login
// @access  Public
export const login = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    const tenantId = req.tenantId!;

    const userRepo = new UserRepository(tenantId);
    const user = await userRepo.findByEmail(email);

    if (user && (await user.matchPassword(password))) {
      if (user.accountStatus !== 'active') {
        throw new UnauthorizedError(`User account is ${user.accountStatus}`);
      }

      await userRepo.update(user.id, { lastLogin: new Date(), failedLoginAttempts: 0 });

      logger.info({ tenantId, userId: user.id }, 'User logged in successfully');
      AuditService.log({ tenantId: tenantId.toString(), action: 'LOGIN', entityType: 'User', entityId: user.id, performedBy: user.id });

      const token = generateToken(user.id, tenantId);
      const refreshToken = generateRefreshToken(user.id, tenantId);

      // Save Session
      await Session.create({
        userId: user.id,
        tenantId,
        refreshToken,
        device: req.headers['user-agent'],
        ip: req.ip,
        status: 'active',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      });

      // Populate roles for response
      await user.populate('roleIds');

      // ─── Role-based Dashboard Resolver ───
      // Maps normalized role names to dashboard paths.
      // Priority order matters — check higher-level roles first.
      const ROLE_DASHBOARD_MAP: Record<string, string> = {
        'SUPER_ADMIN':       '/super-admin/dashboard',
        'SUPER ADMIN':       '/super-admin/dashboard',
        'SCHOOL_ADMIN':      '/admin/dashboard',
        'SCHOOL ADMIN':      '/admin/dashboard',
        'ADMIN':             '/admin/dashboard',
        'PRINCIPAL':         '/principal/dashboard',
        'VICE_PRINCIPAL':    '/principal/dashboard',
        'VICE PRINCIPAL':    '/principal/dashboard',
        'TEACHER':           '/teacher/dashboard',
        'CLASS_TEACHER':     '/teacher/dashboard',
        'CLASS TEACHER':     '/teacher/dashboard',
        'CLASS_COORDINATOR': '/teacher/dashboard',
        'CLASS COORDINATOR': '/teacher/dashboard',
        'STUDENT':           '/student-portal/dashboard',
        'PARENT':            '/parent-portal',
        'DRIVER':            '/driver/dashboard',
        'TRANSPORT_MANAGER': '/transport/dashboard',
        'TRANSPORT MANAGER': '/transport/dashboard',
        'LIBRARIAN':         '/library/dashboard',
        'LIBRARY ASSISTANT': '/library/dashboard',
        'LAB_TECHNICIAN':    '/lab/dashboard',
        'LAB TECHNICIAN':    '/lab/dashboard',
        'SPORTS_COACH':      '/sports/dashboard',
        'SPORTS COACH':      '/sports/dashboard',
        'FINANCE_ADMIN':     '/finance/dashboard',
        'FINANCE ADMIN':     '/finance/dashboard',
        'ACCOUNTANT':        '/finance/dashboard',
        'HR_ADMIN':          '/hr/dashboard',
        'HR ADMIN':          '/hr/dashboard',
        'HR':                '/hr/dashboard',
        'HOSTEL_WARDEN':     '/hostel/dashboard',
        'HOSTEL WARDEN':     '/hostel/dashboard',
        'OFFICE_ADMIN':      '/office/dashboard',
        'OFFICE ADMIN':      '/office/dashboard',
        'ADMISSION_STAFF':   '/office/dashboard',
        'ADMISSION STAFF':   '/office/dashboard',
        'RECEPTIONIST':      '/office/dashboard',
        'NURSE':             '/health/dashboard',
        'MEDICAL_STAFF':     '/health/dashboard',
        'MEDICAL STAFF':     '/health/dashboard',
        'KINDERGARTEN_TEACHER': '/kindergarten/dashboard',
        'KINDERGARTEN TEACHER': '/kindergarten/dashboard',
        'KINDERGARTEN_STAFF':   '/kindergarten/dashboard',
        'KINDERGARTEN STAFF':   '/kindergarten/dashboard',
      };

      // Priority list — check roles in order (highest first)
      const PRIORITY_ROLES = [
        'SUPER_ADMIN', 'SUPER ADMIN',
        'SCHOOL_ADMIN', 'SCHOOL ADMIN', 'ADMIN',
        'PRINCIPAL', 'VICE_PRINCIPAL', 'VICE PRINCIPAL',
        'KINDERGARTEN_TEACHER', 'KINDERGARTEN TEACHER', 'KINDERGARTEN_STAFF', 'KINDERGARTEN STAFF',
        'TEACHER', 'CLASS_TEACHER', 'CLASS TEACHER', 'CLASS_COORDINATOR', 'CLASS COORDINATOR',
        'PARENT', 'STUDENT',
        'DRIVER', 'TRANSPORT_MANAGER', 'TRANSPORT MANAGER',
        'LIBRARIAN', 'LIBRARY ASSISTANT',
        'LAB_TECHNICIAN', 'LAB TECHNICIAN',
        'SPORTS_COACH', 'SPORTS COACH',
        'FINANCE_ADMIN', 'FINANCE ADMIN', 'ACCOUNTANT',
        'HR_ADMIN', 'HR ADMIN', 'HR',
        'HOSTEL_WARDEN', 'HOSTEL WARDEN',
        'OFFICE_ADMIN', 'OFFICE ADMIN', 'ADMISSION_STAFF', 'ADMISSION STAFF', 'RECEPTIONIST',
        'NURSE', 'MEDICAL_STAFF', 'MEDICAL STAFF',
      ];

      // Filter out null entries — happens if a roleId references a deleted role document
      const populatedRoles = (user.roleIds as any[]).filter((r: any) => r != null);
      const roleNames = populatedRoles.map((r: any) => (r.name ?? '').toUpperCase().trim());
      
      let dashboardRoute = '/dashboard';
      for (const priorityRole of PRIORITY_ROLES) {
        if (roleNames.includes(priorityRole)) {
          dashboardRoute = ROLE_DASHBOARD_MAP[priorityRole] || '/dashboard';
          break;
        }
      }

      sendResponse({
        res,
        message: 'Login successful',
        data: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          // Always send as 'roles' for frontend consistency
          roles: populatedRoles,
          dashboardRoute,
          token,
          refreshToken,
        },
      });
    } else {
      if (user) {
        await userRepo.update(user.id, { failedLoginAttempts: (user.failedLoginAttempts || 0) + 1 });
        AuditService.log({ tenantId: tenantId.toString(), action: 'FAILED_LOGIN', entityType: 'User', entityId: user.id, performedBy: user.id, metadata: { ip: req.ip } });
      }
      throw new UnauthorizedError('Invalid email or password');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Invite a new user to the tenant
// @route   POST /api/v1/auth/invite
// @access  Private (Admin only)
export const inviteUser = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const { email, roleId } = req.body;
    const tenantId = req.tenantId!;
    const inviterId = req.user.id;

    // 1. Verify user doesn't already exist
    const userRepo = new UserRepository(tenantId);
    const existingUser = await userRepo.findByEmail(email);
    if (existingUser) {
      throw new ValidationError('User with this email already exists in the system.');
    }

    // 2. Validate Role
    const role = await Role.findOne({ _id: roleId, tenantId });
    if (!role) {
      throw new NotFoundError('Invalid Role ID provided.');
    }

    // 3. Create or Update Invitation
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await Invitation.findOneAndUpdate(
      { email, tenantId },
      {
        roleId,
        invitedBy: inviterId,
        token,
        expiresAt,
        status: 'PENDING'
      },
      { upsert: true, new: true }
    );

    // 4. Simulate Email
    logger.info({ tenantId, email, role: role.name, token }, 'Simulated Invitation Email Sent.');

    sendResponse({
      res,
      status: 201,
      message: 'Invitation sent successfully.'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Accept Invitation and Set Password
// @route   POST /api/v1/auth/accept-invitation
// @access  Public
export const acceptInvitation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token, firstName, lastName, password } = req.body;

    // 1. Find Invitation
    const invitation = await Invitation.findOne({ token, status: 'PENDING' });
    if (!invitation) {
      throw new NotFoundError('Invalid or expired invitation token');
    }

    if (new Date() > invitation.expiresAt) {
      invitation.status = 'EXPIRED';
      await invitation.save();
      throw new ValidationError('Invitation token has expired');
    }

    // 2. Create User
    const userRepo = new UserRepository(invitation.tenantId.toString());
    const existingUser = await userRepo.findByEmail(invitation.email);
    if (existingUser) {
      throw new ValidationError('User already exists');
    }

    const user = await userRepo.create({
      firstName,
      lastName,
      email: invitation.email,
      password,
      roleIds: [invitation.roleId],
      accountStatus: 'active'
    });

    // 3. Update Invitation
    invitation.status = 'ACCEPTED';
    invitation.acceptedAt = new Date();
    await invitation.save();

    logger.info({ tenantId: invitation.tenantId, userId: user.id }, 'User accepted invitation successfully');

    sendResponse({
      res,
      status: 201,
      message: 'Account created successfully. You can now login.'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Refresh Token
// @route   POST /api/v1/auth/refresh
// @access  Public
export const refresh = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) throw new UnauthorizedError('Refresh token required');

    const decoded = jwt.verify(refreshToken, env.jwtRefreshSecret) as any;
    
    // Check session DB
    const session = await Session.findOne({ refreshToken, status: 'active' });
    if (!session || session.expiresAt < new Date()) {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    const tenantId = req.tenantId!;
    const userRepo = new UserRepository(tenantId);
    const user = await userRepo.findById(decoded.id);

    if (!user || user.accountStatus !== 'active') {
      throw new UnauthorizedError('User account is invalid or locked');
    }

    // Generate new tokens
    const newToken = generateToken(user.id, tenantId);
    const newRefreshToken = generateRefreshToken(user.id, tenantId);

    // Rotate session
    session.status = 'revoked';
    await session.save();

    await Session.create({
      userId: user.id,
      tenantId,
      refreshToken: newRefreshToken,
      device: req.headers['user-agent'],
      ip: req.ip,
      status: 'active',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    sendResponse({
      res,
      message: 'Token refreshed successfully',
      data: {
        token: newToken,
        refreshToken: newRefreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout User
// @route   POST /api/v1/auth/logout
// @access  Private
export const logout = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;
    
    if (refreshToken) {
      await Session.findOneAndUpdate(
        { refreshToken, userId: req.user.id },
        { status: 'revoked' }
      );
    }

    logger.info({ tenantId: req.tenantId, userId: req.user.id }, 'User logged out');
    
    sendResponse({
      res,
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
};
