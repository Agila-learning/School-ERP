import { Request, Response, NextFunction } from 'express';
import Tenant from '../models/Tenant.model';
import Role from '../../auth/models/Role.model';
import User from '../../auth/models/User.model';
import { sendResponse } from '../../../core/utils/response.util';
import { ValidationError, NotFoundError } from '../../../core/errors/AppError';
import { logger } from '../../../core/logger/logger';
import mongoose from 'mongoose';

export const onboardTenant = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { schoolName, schoolCode, address, adminName, adminEmail, adminPassword } = req.body;

    if (!schoolName || !schoolCode || !adminName || !adminEmail || !adminPassword) {
      throw new ValidationError('Missing required fields for onboarding');
    }

    // Check if tenant already exists
    const existingTenant = await Tenant.findOne({ code: schoolCode.toUpperCase() });
    if (existingTenant) {
      throw new ValidationError('School code already exists');
    }

    // 1. Create Tenant
    const tenant = new Tenant({
      name: schoolName,
      code: schoolCode.toUpperCase(),
      subdomain: schoolCode.toLowerCase(),
      adminName,
      adminEmail,
      address,
      status: 'active',
      plan: 'premium',
    });
    
    await tenant.save();
    const tenantId = tenant._id;

    // 2. Create Default Roles for this Tenant
    const defaultRoles = [
      { name: 'Super Admin', permissions: ['*'], isSystem: true },
      { name: 'School Admin', permissions: ['*'], isSystem: true },
      { name: 'Teacher', permissions: ['academic.view', 'attendance.manage', 'students.view'], isSystem: true },
      { name: 'Student', permissions: ['academic.view', 'attendance.view'], isSystem: true },
      { name: 'Parent', permissions: ['academic.view', 'attendance.view'], isSystem: true },
      { name: 'Staff', permissions: ['staff.view'], isSystem: true },
    ];

    const createdRoles = await Role.insertMany(
      defaultRoles.map(role => ({ ...role, tenantId }))
    );

    const schoolAdminRole = createdRoles.find((r: any) => r.name === 'School Admin');
    if (!schoolAdminRole) {
      throw new Error('Failed to create School Admin role');
    }

    // 3. Create initial School Admin User
    const [firstName, ...lastNameParts] = adminName.split(' ');
    const lastName = lastNameParts.join(' ') || 'Admin';

    const user = new User({
      tenantId,
      firstName,
      lastName,
      email: adminEmail,
      password: adminPassword,
      roleIds: [schoolAdminRole._id],
      accountStatus: 'active',
    });

    await user.save();

    logger.info({ tenantId: tenant.id }, 'New school successfully onboarded');

    sendResponse({
      res,
      status: 201,
      message: 'School successfully onboarded',
      data: {
        tenantId: tenant._id,
        schoolCode: tenant.code,
        schoolName: tenant.name,
      }
    });

  } catch (error) {
    next(error);
  }
};

export const getTenants = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { search, status } = req.query;
    
    const query: any = {};
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { adminEmail: { $regex: search, $options: 'i' } }
      ];
    }

    const tenants = await Tenant.find(query).sort({ createdAt: -1 });
    
    sendResponse({ res, data: tenants });
  } catch (error) {
    next(error);
  }
};

export const getTenantById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenant = await Tenant.findById(req.params.id);
    if (!tenant) throw new NotFoundError('School/Tenant not found');
    
    sendResponse({ res, data: tenant });
  } catch (error) {
    next(error);
  }
};

export const updateTenant = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const updateData = { ...req.body };
    delete updateData.code; // Prevent code modification
    
    const tenant = await Tenant.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
    if (!tenant) throw new NotFoundError('School/Tenant not found');

    logger.info({ tenantId: tenant.id }, 'School updated');
    sendResponse({ res, message: 'School updated successfully', data: tenant });
  } catch (error) {
    next(error);
  }
};

export const updateTenantStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body;
    if (!['active', 'suspended', 'inactive'].includes(status)) {
      throw new ValidationError('Invalid status');
    }

    const tenant = await Tenant.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!tenant) throw new NotFoundError('School/Tenant not found');

    logger.info({ tenantId: tenant.id, status }, 'School status updated');
    sendResponse({ res, message: `School status changed to ${status}`, data: tenant });
  } catch (error) {
    next(error);
  }
};
