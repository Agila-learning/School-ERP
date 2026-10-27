import { Request, Response } from 'express';
import TenantSubscription from '../../tenant/models/TenantSubscription.model';
import Tenant from '../../tenant/models/Tenant.model';
import SubscriptionPlan from '../../tenant/models/SubscriptionPlan.model';

// @desc    Get all subscriptions
// @route   GET /api/v1/super-admin/subscriptions
// @access  Private (Super Admin Only)
export const getSubscriptions = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const subscriptions = await TenantSubscription.find()
      .populate('tenantId', 'name code status')
      .populate('planId', 'name code')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await TenantSubscription.countDocuments();

    res.status(200).json({
      success: true,
      data: subscriptions,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch subscriptions.' });
  }
};

// @desc    Upgrade / Renew Subscription
// @route   POST /api/v1/super-admin/subscriptions/:tenantId/renew
// @access  Private (Super Admin Only)
export const renewSubscription = async (req: Request, res: Response) => {
  try {
    const { planId, billingCycle, price, discount, paymentStatus } = req.body;
    const tenantId = req.params.tenantId;

    const tenant = await Tenant.findById(tenantId);
    if (!tenant) return res.status(404).json({ success: false, message: 'Tenant not found.' });

    const plan = await SubscriptionPlan.findById(planId);
    if (!plan) return res.status(404).json({ success: false, message: 'Plan not found.' });

    const startDate = new Date();
    const endDate = new Date();
    if (billingCycle === 'MONTHLY') endDate.setMonth(endDate.getMonth() + 1);
    else if (billingCycle === 'YEARLY') endDate.setFullYear(endDate.getFullYear() + 1);
    else endDate.setFullYear(endDate.getFullYear() + 99); // LIFETIME

    const finalAmount = price - (discount || 0);

    const subscription = await TenantSubscription.create({
      tenantId,
      planId,
      startDate,
      endDate,
      status: 'ACTIVE',
      billingCycle,
      price,
      discount,
      finalAmount,
      paymentStatus: paymentStatus || 'PAID',
    });

    tenant.currentSubscriptionId = subscription._id as any;
    await tenant.save();

    res.status(201).json({ success: true, message: 'Subscription renewed successfully.', data: subscription });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to renew subscription.' });
  }
};
