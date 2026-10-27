import { Request, Response } from 'express';
import TenantSubscription from '../../tenant/models/TenantSubscription.model';
import SaasPayment from '../models/Payment.model';
import SaasInvoice from '../models/Invoice.model';
import Tenant from '../../tenant/models/Tenant.model';
import User from '../../auth/models/User.model';

// @desc    Revenue analytics
// @route   GET /api/v1/super-admin/analytics/revenue
export const getRevenueAnalytics = async (req: Request, res: Response) => {
  try {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();

    // MRR from active subscriptions
    const activeSubs = await TenantSubscription.find({ status: 'ACTIVE' });
    const mrr = activeSubs.reduce((acc: number, sub: any) => {
      if (sub.billingCycle === 'MONTHLY') return acc + sub.finalAmount;
      if (sub.billingCycle === 'YEARLY') return acc + (sub.finalAmount / 12);
      return acc;
    }, 0);
    const arr = mrr * 12;

    // Monthly revenue from paid invoices
    const monthlyInvoices = await SaasInvoice.aggregate([
      { $match: { status: 'PAID', paidAt: { $exists: true } } },
      {
        $group: {
          _id: { year: { $year: '$paidAt' }, month: { $month: '$paidAt' } },
          total: { $sum: '$total' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);

    // Current month revenue
    const currentMonthStart = new Date(currentYear, currentMonth, 1);
    const currentMonthRevenue = await SaasInvoice.aggregate([
      { $match: { status: 'PAID', paidAt: { $gte: currentMonthStart } } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);

    // Plan-wise breakdown
    const planRevenue = await SaasInvoice.aggregate([
      { $match: { status: 'PAID' } },
      { $lookup: { from: 'subscriptionplans', localField: 'planId', foreignField: '_id', as: 'plan' } },
      { $unwind: { path: '$plan', preserveNullAndEmptyArrays: true } },
      { $group: { _id: { planId: '$planId', planName: { $ifNull: ['$plan.name', 'Unknown'] } }, total: { $sum: '$total' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } }
    ]);

    // Payment success rate
    const totalPayments = await SaasPayment.countDocuments();
    const successPayments = await SaasPayment.countDocuments({ status: 'SUCCESS' });
    const failedPayments = await SaasPayment.countDocuments({ status: 'FAILED' });
    const paymentSuccessRate = totalPayments > 0 ? Math.round((successPayments / totalPayments) * 100) : 0;

    // Trial conversion
    const totalTrials = await TenantSubscription.countDocuments({ status: { $in: ['ACTIVE', 'TRIAL', 'EXPIRED', 'CANCELLED'] } });
    const convertedFromTrial = await TenantSubscription.countDocuments({ status: 'ACTIVE' });
    const trialConversionRate = totalTrials > 0 ? Math.round((convertedFromTrial / totalTrials) * 100) : 0;

    // Subscription counts by status
    const subsByStatus = await TenantSubscription.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      data: {
        mrr: Math.round(mrr),
        arr: Math.round(arr),
        currentMonthRevenue: currentMonthRevenue[0]?.total || 0,
        monthlyRevenue: monthlyInvoices.reverse(),
        planRevenue,
        paymentSuccessRate,
        failedPayments,
        trialConversionRate,
        subscriptionsByStatus: subsByStatus,
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to fetch revenue analytics' });
  }
};

// @desc    Usage analytics  
// @route   GET /api/v1/super-admin/analytics/usage
export const getUsageAnalytics = async (req: Request, res: Response) => {
  try {
    const totalUsers = await User.countDocuments({ status: 'ACTIVE' });
    const usersByRole = await User.aggregate([
      { $match: { status: 'ACTIVE' } },
      { $group: { _id: '$role', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const tenantUsage = await Tenant.aggregate([
      { $match: { status: { $in: ['ACTIVE', 'TRIAL'] } } },
      { $project: { name: 1, code: 1, status: 1, storageUsed: 1, storageQuota: 1 } },
      { $sort: { storageUsed: -1 } },
      { $limit: 20 }
    ]);

    res.json({ success: true, data: { totalUsers, usersByRole, tenantUsage } });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to fetch usage analytics' });
  }
};
