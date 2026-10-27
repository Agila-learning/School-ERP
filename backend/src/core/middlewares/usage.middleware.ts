import { Request, Response, NextFunction } from 'express';
import TenantSubscription from '../../modules/tenant/models/TenantSubscription.model';

export type UsageResource = 'students' | 'staff' | 'branches';

export const checkUsageLimit = (resource: UsageResource) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reqAny = req as any;
      if (!reqAny.tenant) {
        return res.status(401).json({ success: false, message: 'Tenant context required' });
      }

      // Bypass limits for Super Admin
      if (reqAny.user && reqAny.user.role === 'SUPER_ADMIN') {
        return next();
      }

      const subscriptionId = reqAny.tenant.currentSubscriptionId;
      if (!subscriptionId) {
        return res.status(403).json({
          success: false,
          message: 'No active subscription found.',
        });
      }

      const subscription = await TenantSubscription.findById(subscriptionId).populate('planId');
      if (!subscription || subscription.status !== 'ACTIVE' || subscription.isExpired) {
        return res.status(403).json({
          success: false,
          message: 'Active subscription required.',
        });
      }

      const plan = subscription.planId as any;
      if (!plan) {
        return res.status(403).json({ success: false, message: 'Subscription plan details missing.' });
      }

      let currentUsage = 0;
      let limit = 0;

      switch (resource) {
        case 'students':
          currentUsage = subscription.studentsUsed;
          limit = plan.maxStudents;
          break;
        case 'staff':
          currentUsage = subscription.staffUsed;
          limit = plan.maxStaff;
          break;
        case 'branches':
          currentUsage = subscription.branchesUsed;
          limit = plan.maxBranches;
          break;
      }

      if (currentUsage >= limit) {
        return res.status(403).json({
          success: false,
          message: `Your subscription limit for ${resource} (${limit}) has been reached. Please upgrade your plan.`,
        });
      }

      // If check passes, we'll increment the usage in the actual controller
      // after successful creation.
      next();
    } catch (error) {
      console.error('Usage Limit Middleware Error:', error);
      res.status(500).json({ success: false, message: 'Internal server error while checking plan limits' });
    }
  };
};
