import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import Tenant from '../models/Tenant.model';
import User from '../../auth/models/User.model';
import Role from '../../auth/models/Role.model';
import Setting from '../../config/models/Setting.model';
import { generateToken } from '../../auth/services/auth.service';
import { ValidationError, NotFoundError } from '../../../core/errors/AppError';
import { sendResponse } from '../../../core/utils/response.util';
import { logger } from '../../../core/logger/logger';

// @desc    Register a new school / tenant (SaaS Onboarding)
// @route   POST /api/v1/onboarding/register-school
// @access  Public
export const registerSchool = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { 
      schoolName, schoolEmail, schoolPhone, 
      adminFirstName, adminLastName, adminEmail, adminPassword,
      timezone, currency 
    } = req.body;

    // 1. Generate slug/code
    const baseSlug = schoolName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    let slug = baseSlug;
    let count = 1;
    while (await Tenant.findOne({ code: slug })) {
      slug = `${baseSlug}-${count}`;
      count++;
    }

    // 2. Check for existing school email or admin email globally
    const existingSchool = await Tenant.findOne({ adminEmail });
    if (existingSchool) {
      throw new ValidationError('A school with this admin email is already registered.');
    }
    const existingUser = await User.findOne({ email: adminEmail });
    if (existingUser) {
      throw new ValidationError('Admin email is already in use.');
    }

    // 3. Create Verification Token
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // 4. Create Tenant
    const tenant = await Tenant.create({
      name: schoolName,
      code: slug,
      subdomain: slug,
      adminName: `${adminFirstName} ${adminLastName}`,
      adminEmail,
      phone: schoolPhone,
      status: 'pending_verification',
      verificationToken,
      plan: 'basic',
    });

    // 5. Create Initial Role
    const adminRole = await Role.create({
      name: 'School Admin',
      tenantId: tenant._id,
      permissions: ['*'], // Full access for the root school admin
      isSystem: true
    });

    // 6. Create Admin User
    const adminUser = await User.create({
      firstName: adminFirstName,
      lastName: adminLastName,
      email: adminEmail,
      password: adminPassword,
      tenantId: tenant._id,
      roleIds: [adminRole._id],
      accountStatus: 'active'
    });

    // 7. Create Default Settings
    await Setting.create([
      { tenantId: tenant._id, group: 'GENERAL', key: 'TIMEZONE', value: timezone || 'UTC', isSystem: true },
      { tenantId: tenant._id, group: 'FEES', key: 'CURRENCY', value: currency || 'USD', isSystem: true }
    ]);

    // 8. Simulate Email
    logger.info({ 
      tenantId: tenant._id, 
      verificationToken, 
      email: adminEmail 
    }, 'Simulated Verification Email Sent. Use this token to verify the school.');

    sendResponse({
      res,
      status: 201,
      message: 'School registered successfully. Please check your email for the verification link.',
      data: {
        schoolCode: tenant.code,
        adminEmail: adminUser.email
      }
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Verify school email
// @route   POST /api/v1/onboarding/verify-school
// @access  Public
export const verifySchool = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = req.body;
    if (!token) throw new ValidationError('Verification token is required');

    const tenant = await Tenant.findOne({ verificationToken: token });
    if (!tenant) throw new NotFoundError('Invalid or expired verification token');

    if (tenant.status !== 'pending_verification') {
      throw new ValidationError('School is already verified');
    }

    tenant.status = 'active';
    tenant.verificationToken = undefined;
    await tenant.save();

    logger.info({ tenantId: tenant._id }, 'School verified and activated successfully');

    sendResponse({
      res,
      message: 'School verified successfully. You can now login.'
    });
  } catch (error) {
    next(error);
  }
};
