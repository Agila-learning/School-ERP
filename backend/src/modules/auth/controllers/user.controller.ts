import { Response, NextFunction } from 'express';
import { TenantRequest } from '../../../core/middlewares/tenant.middleware';
import { UserRepository } from '../repositories/user.repository';
import { sendResponse } from '../../../core/utils/response.util';
import { NotFoundError, ValidationError } from '../../../core/errors/AppError';
import { logger } from '../../../core/logger/logger';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

export class UserController {
  // @desc    Get all users (with optional filtering)
  // @route   GET /api/v1/users
  // @access  Private/Admin
  static async getUsers(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId!;
      const userRepo = new UserRepository(tenantId);
      
      const query: any = {};
      if (req.query.roleId) query.roleIds = req.query.roleId;
      if (req.query.status) query.accountStatus = req.query.status;
      if (req.query.search) {
        query.$or = [
          { email: { $regex: req.query.search, $options: 'i' } },
          { firstName: { $regex: req.query.search, $options: 'i' } },
          { lastName: { $regex: req.query.search, $options: 'i' } }
        ];
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      // Import User model directly since we need countDocuments which isn't in generic repo
      const User = mongoose.model('User');
      
      const total = await User.countDocuments({ ...query, tenantId, deletedAt: null });
      
      const users = await userRepo.find(query, {
        populate: [{ path: 'roleIds', select: 'name' }],
        sort: { createdAt: -1 },
        skip,
        limit
      });

      sendResponse({ 
        res, 
        data: {
          users,
          pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
          }
        } 
      });
    } catch (error) {
      next(error);
    }
  }

  // @desc    Create a user (Provision account)
  // @route   POST /api/v1/users
  // @access  Private/Admin
  static async createUser(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId!;
      const userRepo = new UserRepository(tenantId);
      
      const { firstName, lastName, email, roleIds, tempPassword, accountStatus } = req.body;

      const userExists = await userRepo.findByEmail(email);
      if (userExists) {
        throw new ValidationError('User with this email already exists');
      }

      // Check roles
      if (roleIds && roleIds.length > 0) {
        const Role = mongoose.model('Role');
        const roles = await Role.find({ _id: { $in: roleIds }, tenantId });
        
        if (roles.length !== roleIds.length) {
          throw new ValidationError('One or more roles are invalid or do not belong to this tenant');
        }

        // Prevent non-Super Admin from creating Super Admin
        const isSuperAdminCreation = roles.some(r => r.name === 'Super Admin');
        if (isSuperAdminCreation && !req.user?.roles.includes('Super Admin')) {
          throw new ValidationError('Unauthorized to assign Super Admin role');
        }
      }

      // We explicitly hash the temporary password provided by Admin
      let password = undefined;
      if (tempPassword) {
        const salt = await bcrypt.genSalt(10);
        password = await bcrypt.hash(tempPassword, salt);
      }

      const user = await userRepo.create({
        firstName,
        lastName,
        email,
        password,
        roleIds: roleIds || [],
        accountStatus: accountStatus || 'active'
      });

      logger.info({ tenantId, userId: user.id }, 'User created by admin');

      sendResponse({ res, status: 201, message: 'User created successfully', data: user });
    } catch (error) {
      next(error);
    }
  }

  // @desc    Get user by ID
  // @route   GET /api/v1/users/:id
  // @access  Private/Admin
  static async getUserById(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId!;
      const userRepo = new UserRepository(tenantId);
      
      const user = await userRepo.findById(req.params.id as string);
      if (!user) throw new NotFoundError('User not found');

      await user.populate('roleIds');
      sendResponse({ res, data: user });
    } catch (error) {
      next(error);
    }
  }

  // @desc    Update user
  // @route   PUT /api/v1/users/:id
  // @access  Private/Admin
  static async updateUser(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId!;
      const userRepo = new UserRepository(tenantId);
      
      const updateData = { ...req.body };
      
      // If admin resets password
      if (updateData.tempPassword) {
        const salt = await bcrypt.genSalt(10);
        updateData.password = await bcrypt.hash(updateData.tempPassword, salt);
        delete updateData.tempPassword;
      }

      const user = await userRepo.update(req.params.id as string, updateData);
      if (!user) throw new NotFoundError('User not found');

      sendResponse({ res, message: 'User updated successfully', data: user });
    } catch (error) {
      next(error);
    }
  }

  // @desc    Deactivate user
  // @route   DELETE /api/v1/users/:id
  // @access  Private/Admin
  static async deactivateUser(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId!;
      const userRepo = new UserRepository(tenantId);
      
      const user = await userRepo.findById(req.params.id as string);
      if (!user) {
        throw new NotFoundError('User not found');
      }

      await userRepo.update(req.params.id as string, { accountStatus: 'suspended' });
      
      logger.info({ tenantId, userId: user.id }, 'User deactivated by admin');
      sendResponse({ res, message: 'User deactivated successfully' });
    } catch (error) {
      next(error);
    }
  }

  // @desc    Get roles for the tenant
  // @route   GET /api/v1/users/roles
  // @access  Private/Admin
  static async getRoles(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId!;
      const Role = mongoose.model('Role');
      const roles = await Role.find({ tenantId });
      
      sendResponse({ res, data: roles });
    } catch (error) {
      next(error);
    }
  }
  // @desc    Update user status
  // @route   PUT /api/v1/users/:id/status
  // @access  Private/Admin
  static async updateUserStatus(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId!;
      const id = req.params.id as string;
      const { status } = req.body;
      const normalizedStatus = (status || '').toString().toLowerCase().trim();

      const validStatuses = ['invited', 'pending', 'active', 'suspended', 'inactive', 'archived'];
      if (!validStatuses.includes(normalizedStatus)) {
        throw new ValidationError(`Invalid status provided: ${status}. Valid options are ${validStatuses.join(', ')}`);
      }

      const userRepo = new UserRepository(tenantId);
      const user = await userRepo.findById(id);

      if (!user) throw new NotFoundError('User not found');

      // Prevent self-suspension/deactivation if admin
      const currentUserId = req.user?.id || (req.user as any)?._id?.toString();
      if (currentUserId && currentUserId === id && normalizedStatus !== 'active') {
        throw new ValidationError('Cannot deactivate or suspend your own admin account');
      }

      await userRepo.update(id, { accountStatus: normalizedStatus });

      logger.info({ tenantId, userId: id, action: `User status changed to ${normalizedStatus}` });

      sendResponse({ res, message: `User status updated to ${normalizedStatus}` });
    } catch (error) {
      next(error);
    }
  }

  // @desc    Update user roles
  // @route   PUT /api/v1/users/:id/roles
  // @access  Private/Admin
  static async updateUserRoles(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId!;
      const id = req.params.id as string;
      const { roleIds } = req.body;

      const userRepo = new UserRepository(tenantId);
      const user = await userRepo.findById(id);

      if (!user) throw new NotFoundError('User not found');

      // Prevent self-role removal of admin
      if (req.user && req.user.id === id) {
        throw new ValidationError('Cannot modify your own roles');
      }

      const Role = mongoose.model('Role');
      const roles = await Role.find({ _id: { $in: roleIds }, tenantId });
      
      if (roles.length !== roleIds.length) {
        throw new ValidationError('One or more roles are invalid');
      }

      // Check if trying to grant Super Admin
      const hasSuperAdmin = roles.some(r => r.name === 'Super Admin');
      if (hasSuperAdmin && !req.user?.roles.includes('Super Admin')) {
        throw new ValidationError('Unauthorized to assign Super Admin role');
      }

      await userRepo.update(id, { roleIds });

      logger.info({ tenantId, userId: id, action: 'User roles updated' });

      sendResponse({ res, message: 'User roles updated successfully' });
    } catch (error) {
      next(error);
    }
  }
}
