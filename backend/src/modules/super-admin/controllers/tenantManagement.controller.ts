import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Tenant from '../../tenant/models/Tenant.model';
import School from '../../organization/models/School.model';
import User from '../../auth/models/User.model';
import TenantSubscription from '../../tenant/models/TenantSubscription.model';
import SubscriptionPlan from '../../tenant/models/SubscriptionPlan.model';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

// @desc    Get all tenants (Schools / Organizations)
// @route   GET /api/v1/super-admin/tenants
// @access  Private (Super Admin Only)
export const getTenants = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const query: any = {};
    if (req.query.search) {
      query.name = { $regex: req.query.search as string, $options: 'i' };
    }
    if (req.query.status) {
      query.status = req.query.status;
    }

    const tenants = await Tenant.find(query)
      .populate('currentSubscriptionId')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Tenant.countDocuments(query);

    res.status(200).json({
      success: true,
      data: tenants,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get Tenants Error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch tenants.' });
  }
};

// @desc    Create new tenant, school, admin, and subscription (TRANSACTIONAL)
// @route   POST /api/v1/super-admin/tenants
// @access  Private (Super Admin Only)
export const createTenantSchool = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { 
      organizationName, schoolName, email, phone, address, 
      planId, adminName, password 
    } = req.body;

    // 1. Generate unique tenant code
    const tenantCode = 'ORG' + crypto.randomBytes(4).toString('hex').toUpperCase();

    // 2. Create Tenant
    const tenant = await Tenant.create([{
      name: organizationName,
      code: tenantCode,
      adminName,
      adminEmail: email,
      phone,
      address,
      status: 'active'
    }], { session });

    const tenantId = tenant[0]._id;

    // 3. Create Default School for Tenant
    const schoolCode = 'SCH' + crypto.randomBytes(3).toString('hex').toUpperCase();
    await School.create([{
      tenantId,
      legalName: schoolName,
      displayName: schoolName,
      code: schoolCode,
      email,
      phone,
      address,
      status: 'ACTIVE'
    }], { session });

    // 4. Create School Admin User
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password || 'Admin@123', salt);

    await User.create([{
      tenantId,
      firstName: adminName.split(' ')[0],
      lastName: adminName.split(' ').slice(1).join(' ') || '',
      email,
      password: hashedPassword,
      role: 'Admin',
      status: 'ACTIVE'
    }], { session });

    // 5. Assign Subscription
    if (planId) {
      const plan = await SubscriptionPlan.findById(planId);
      if (!plan) throw new Error('Subscription plan not found');

      const startDate = new Date();
      const endDate = new Date();
      const trialDays = plan.trialDays ?? 1;
      endDate.setDate(endDate.getDate() + (trialDays > 0 ? trialDays : 1));

      const subscription = await TenantSubscription.create([{
        tenantId,
        planId,
        startDate,
        endDate,
        status: trialDays > 0 ? 'TRIAL' : 'ACTIVE',
        billingCycle: plan.billingCycle,
        price: plan.price,
        finalAmount: plan.price,
        paymentStatus: plan.price === 0 ? 'PAID' : 'PENDING',
      }], { session });

      tenant[0].currentSubscriptionId = subscription[0]._id;
      tenant[0].status = trialDays > 0 ? 'TRIAL' : 'ACTIVE';
      await tenant[0].save({ session });
    }

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      success: true,
      message: 'Tenant and School created successfully.',
      data: tenant[0]
    });
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();
    console.error('Create Tenant Error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to create tenant.' });
  }
};

// @desc    Update tenant status
// @route   PATCH /api/v1/super-admin/tenants/:id/status
// @access  Private (Super Admin Only)
export const updateTenantStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    
    if (!['active', 'suspended', 'inactive'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const tenant = await Tenant.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!tenant) {
      return res.status(404).json({ success: false, message: 'Tenant not found' });
    }

    // Cascade status to Schools
    await School.updateMany(
      { tenantId: tenant._id },
      { status: status === 'active' ? 'ACTIVE' : 'SUSPENDED' }
    );

    res.status(200).json({
      success: true,
      message: `Tenant status updated to ${status}.`,
      data: tenant
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update tenant status.' });
  }
};
