import { Request, Response } from 'express';
import Tenant from '../../tenant/models/Tenant.model';
import School from '../../organization/models/School.model';
import Branch from '../../organization/models/Branch.model';
import User from '../../auth/models/User.model';
import TenantSubscription from '../../tenant/models/TenantSubscription.model';

// @desc    Get Super Admin SaaS Dashboard Statistics
// @route   GET /api/v1/super-admin/dashboard
// @access  Private (Super Admin Only)
export const getSaasDashboardStats = async (req: Request, res: Response) => {
  try {
    const totalTenants = await Tenant.countDocuments();
    const activeTenants = await Tenant.countDocuments({ status: { $in: ['active', 'ACTIVE', 'TRIAL', 'trial'] } });
    
    const totalSchools = await School.countDocuments();
    const totalBranches = await Branch.countDocuments();
    
    // Total students across the platform
    let totalStudents = await User.countDocuments({ role: 'Student' });
    if (!totalStudents) {
      try {
        const StudentProfile = require('../../students/models/StudentProfile.model').default;
        totalStudents = await StudentProfile.countDocuments();
      } catch (e) {}
    }

    const totalStaff = await User.countDocuments({ role: { $in: ['Teacher', 'Staff', 'Admin'] } });
    
    // Subscription metrics
    const activeSubscriptions = await TenantSubscription.countDocuments({ status: { $in: ['ACTIVE', 'TRIAL'] } });
    
    // MRR (Monthly Recurring Revenue calculation approximation)
    const subscriptions = await TenantSubscription.find({ status: 'ACTIVE' });
    const monthlyRevenue = subscriptions.reduce((acc: number, sub: any) => {
      if (sub.billingCycle === 'MONTHLY') return acc + sub.finalAmount;
      if (sub.billingCycle === 'YEARLY') return acc + (sub.finalAmount / 12);
      return acc; // lifetime ignores MRR for simplicity
    }, 0);

    // Recent signups (Tenants)
    const recentTenants = await Tenant.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name code status createdAt');

    // Recent Subscriptions
    const recentSubscriptions = await TenantSubscription.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('tenantId', 'name')
      .populate('planId', 'name');

    res.status(200).json({
      success: true,
      data: {
        totalTenants,
        activeTenants,
        totalSchools,
        totalBranches,
        totalStudents,
        totalStaff,
        activeSubscriptions,
        monthlyRevenue: Math.round(monthlyRevenue),
        recentTenants,
        recentSubscriptions
      }
    });
  } catch (error) {
    console.error('Super Admin Dashboard Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch SaaS dashboard statistics.',
    });
  }
};
