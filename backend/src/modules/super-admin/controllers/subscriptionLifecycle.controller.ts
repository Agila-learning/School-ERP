import { Request, Response } from 'express';
import TenantSubscription from '../../tenant/models/TenantSubscription.model';
import SubscriptionPlan from '../../tenant/models/SubscriptionPlan.model';
import Tenant from '../../tenant/models/Tenant.model';
import SubscriptionHistory from '../models/SubscriptionHistory.model';
import PlatformAuditLog from '../models/PlatformAuditLog.model';

const createHistory = async (tenantId: string, subscriptionId: string, changeType: string, performedBy: string, reason?: string, prev?: any, next?: any) => {
  try {
    await SubscriptionHistory.create({ tenantId, subscriptionId, changeType, performedBy, reason, effectiveDate: new Date(), previousStatus: prev, newStatus: next });
  } catch (e) {}
};

const auditLog = async (actorId: string, actorEmail: string, action: string, entityId: string, description: string, tenantId?: string) => {
  try {
    await PlatformAuditLog.create({ actor: actorId, actorEmail, action, entityType: 'Subscription', entityId, tenantId, description });
  } catch (e) {}
};

// @desc    Get all subscriptions with filters
// @route   GET /api/v1/super-admin/subscriptions/all
export const getAllSubscriptions = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const query: any = {};
    if (req.query.status) query.status = req.query.status;
    if (req.query.tenantId) query.tenantId = req.query.tenantId;

    const [subscriptions, total] = await Promise.all([
      TenantSubscription.find(query)
        .populate('tenantId', 'name code adminEmail status')
        .populate('planId', 'name code price billingCycle')
        .sort({ createdAt: -1 }).skip(skip).limit(limit),
      TenantSubscription.countDocuments(query)
    ]);

    res.json({ success: true, data: subscriptions, pagination: { total, page, pages: Math.ceil(total / limit) } });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to fetch subscriptions' });
  }
};

// @desc    Get subscriptions expiring soon
// @route   GET /api/v1/super-admin/subscriptions/expiring
export const getExpiringSoon = async (req: Request, res: Response) => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() + days);

    const subscriptions = await TenantSubscription.find({
      status: { $in: ['ACTIVE', 'TRIAL'] },
      endDate: { $lte: cutoff, $gte: new Date() }
    })
      .populate('tenantId', 'name code adminEmail')
      .populate('planId', 'name')
      .sort({ endDate: 1 });

    res.json({ success: true, data: subscriptions });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to fetch' });
  }
};

// @desc    Create subscription for tenant
// @route   POST /api/v1/super-admin/subscriptions
export const createSubscription = async (req: Request, res: Response) => {
  try {
    const { tenantId, planId, billingCycle, startDate, trialDays } = req.body;
    const plan = await SubscriptionPlan.findById(planId);
    if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' });

    const start = startDate ? new Date(startDate) : new Date();
    const end = new Date(start);
    const td = trialDays ?? plan.trialDays;
    if (td > 0) {
      end.setDate(end.getDate() + td);
    } else {
      if (billingCycle === 'MONTHLY') end.setMonth(end.getMonth() + 1);
      else if (billingCycle === 'YEARLY') end.setFullYear(end.getFullYear() + 1);
      else end.setMonth(end.getMonth() + 1);
    }

    const sub = await TenantSubscription.create({
      tenantId, planId,
      startDate: start, endDate: end,
      status: td > 0 ? 'TRIAL' : 'ACTIVE',
      billingCycle: billingCycle || plan.billingCycle,
      price: plan.price, finalAmount: plan.price,
      paymentStatus: plan.price === 0 ? 'PAID' : 'PENDING',
    });

    await Tenant.findByIdAndUpdate(tenantId, { currentSubscriptionId: sub._id, status: td > 0 ? 'TRIAL' : 'ACTIVE' });

    const actor = (req as any).user;
    await createHistory(tenantId, String(sub._id), 'CREATED', actor._id, 'Subscription created');
    await auditLog(actor._id, actor.email, 'SUBSCRIPTION_CREATED', String(sub._id), `Subscription created for tenant`, tenantId);

    res.status(201).json({ success: true, data: sub, message: 'Subscription created.' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to create subscription' });
  }
};

// @desc    Upgrade subscription plan
// @route   POST /api/v1/super-admin/subscriptions/:id/upgrade
export const upgradePlan = async (req: Request, res: Response) => {
  try {
    const { newPlanId, reason } = req.body;
    const sub = await TenantSubscription.findById(req.params.id);
    if (!sub) return res.status(404).json({ success: false, message: 'Subscription not found' });
    const newPlan = await SubscriptionPlan.findById(newPlanId);
    if (!newPlan) return res.status(404).json({ success: false, message: 'New plan not found' });

    const actor = (req as any).user;
    const prevPlanId = sub.planId;

    sub.planId = newPlanId;
    sub.price = newPlan.price;
    sub.finalAmount = newPlan.price;
    await sub.save();

    await createHistory(String(sub.tenantId), String(sub._id), 'UPGRADED', actor._id, reason, prevPlanId, newPlanId);
    await auditLog(actor._id, actor.email, 'SUBSCRIPTION_UPGRADED', String(sub._id), `Plan upgraded to ${newPlan.name}`, String(sub.tenantId));

    res.json({ success: true, data: sub, message: `Plan upgraded to ${newPlan.name}` });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to upgrade' });
  }
};

// @desc    Cancel subscription
// @route   POST /api/v1/super-admin/subscriptions/:id/cancel
export const cancelSubscription = async (req: Request, res: Response) => {
  try {
    const { reason } = req.body;
    const sub = await TenantSubscription.findById(req.params.id);
    if (!sub) return res.status(404).json({ success: false, message: 'Subscription not found' });

    const actor = (req as any).user;
    const prev = sub.status;
    sub.status = 'CANCELLED';
    await sub.save();

    await Tenant.findByIdAndUpdate(sub.tenantId, { status: 'CANCELLED' });
    await createHistory(String(sub.tenantId), String(sub._id), 'CANCELLED', actor._id, reason, prev, 'CANCELLED');
    await auditLog(actor._id, actor.email, 'SUBSCRIPTION_CANCELLED', String(sub._id), `Subscription cancelled. Reason: ${reason}`, String(sub.tenantId));

    res.json({ success: true, message: 'Subscription cancelled.' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to cancel' });
  }
};

// @desc    Freeze / Expire subscription immediately (allows testing of dashboard freezing)
// @route   POST /api/v1/super-admin/subscriptions/:id/freeze
export const freezeSubscription = async (req: Request, res: Response) => {
  try {
    const sub = await TenantSubscription.findById(req.params.id);
    if (!sub) return res.status(404).json({ success: false, message: 'Subscription not found' });

    const actor = (req as any).user;
    const prev = sub.status;
    sub.status = 'EXPIRED';
    sub.endDate = new Date(Date.now() - 1000); // 1 sec in the past
    await sub.save();

    await Tenant.findByIdAndUpdate(sub.tenantId, { status: 'EXPIRED' });
    await createHistory(String(sub.tenantId), String(sub._id), 'EXPIRED', actor?._id, 'Dashboard frozen by admin', prev, 'EXPIRED');
    await auditLog(actor?._id, actor?.email || 'superadmin@system.com', 'SUBSCRIPTION_FROZEN', String(sub._id), 'Dashboard frozen immediately for testing', String(sub.tenantId));

    res.json({ success: true, message: 'Subscription expired and dashboard frozen successfully.', data: sub });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to freeze subscription' });
  }
};

// @desc    Grant 1-day free trial to easily test trial expiration and dashboard freezing
// @route   POST /api/v1/super-admin/subscriptions/:id/trial-1day
export const grantOneDayTrial = async (req: Request, res: Response) => {
  try {
    const sub = await TenantSubscription.findById(req.params.id);
    if (!sub) return res.status(404).json({ success: false, message: 'Subscription not found' });

    const actor = (req as any).user;
    const prev = sub.status;
    const start = new Date();
    const end = new Date(start.getTime() + 24 * 60 * 60 * 1000); // Exactly 1 day

    sub.startDate = start;
    sub.endDate = end;
    sub.status = 'TRIAL';
    await sub.save();

    await Tenant.findByIdAndUpdate(sub.tenantId, { status: 'TRIAL' });
    await createHistory(String(sub.tenantId), String(sub._id), 'TRIAL_EXTENDED', actor?._id, '1-day free trial granted', prev, 'TRIAL');
    await auditLog(actor?._id, actor?.email || 'superadmin@system.com', 'TRIAL_GRANTED_1DAY', String(sub._id), '1-day free trial granted for freezing validation', String(sub.tenantId));

    res.json({ success: true, message: '1-Day Free Trial granted successfully. Valid for 24 hours.', data: sub });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to grant 1-day trial' });
  }
};

// @desc    Reactivate / Unfreeze subscription
// @route   POST /api/v1/super-admin/subscriptions/:id/reactivate
export const reactivateSubscription = async (req: Request, res: Response) => {
  try {
    const sub = await TenantSubscription.findById(req.params.id);
    if (!sub) return res.status(404).json({ success: false, message: 'Subscription not found' });

    const actor = (req as any).user;
    const prev = sub.status;
    sub.status = 'ACTIVE';
    // If expired, extend by 30 days
    if (sub.endDate < new Date()) {
      const newEnd = new Date();
      newEnd.setDate(newEnd.getDate() + 30);
      sub.endDate = newEnd;
    }
    await sub.save();

    await Tenant.findByIdAndUpdate(sub.tenantId, { status: 'active' });
    await createHistory(String(sub.tenantId), String(sub._id), 'REACTIVATED', actor?._id, 'Subscription reactivated and unfreezed', prev, 'ACTIVE');
    await auditLog(actor?._id, actor?.email || 'superadmin@system.com', 'SUBSCRIPTION_REACTIVATED', String(sub._id), 'Subscription unfreezed and active', String(sub.tenantId));

    res.json({ success: true, message: 'Subscription reactivated and dashboard unfreezed successfully.', data: sub });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to reactivate' });
  }
};

// @desc    Get subscription history for a tenant
// @route   GET /api/v1/super-admin/tenants/:tenantId/subscription-history
export const getSubscriptionHistory = async (req: Request, res: Response) => {
  try {
    const history = await SubscriptionHistory.find({ tenantId: req.params.tenantId })
      .populate('previousPlanId newPlanId', 'name code')
      .populate('performedBy', 'firstName lastName email')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: history });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to fetch history' });
  }
};

