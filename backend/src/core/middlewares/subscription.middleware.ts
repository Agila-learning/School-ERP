import { Request, Response, NextFunction } from 'express';
import TenantSubscription from '../../modules/tenant/models/TenantSubscription.model';
import SubscriptionPlan from '../../modules/tenant/models/SubscriptionPlan.model';

export const requireSubscriptionModule = (moduleName: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reqAny = req as any;
      if (!reqAny.tenant) {
        return res.status(401).json({ success: false, message: 'Tenant context required' });
      }

      // Allow if request is coming from Super Admin (who might be bypassing tenant context, 
      // but if reqAny.tenant is set, they are impersonating a tenant. Super admins don't get blocked.)
      if (reqAny.user && reqAny.user.role === 'SUPER_ADMIN') {
        return next();
      }

      // Check current subscription
      const subscriptionId = reqAny.tenant.currentSubscriptionId;
      if (!subscriptionId) {
        return res.status(403).json({
          success: false,
          message: 'No active subscription found for this school.',
        });
      }

      const subscription = await TenantSubscription.findById(subscriptionId).populate('planId');
      
      if (!subscription) {
        return res.status(403).json({
          success: false,
          message: 'Subscription record not found.',
        });
      }

      if (subscription.isExpired || subscription.status !== 'ACTIVE') {
        return res.status(403).json({
          success: false,
          message: 'Your school subscription is inactive or expired. Please renew.',
        });
      }

      // Check module access
      const plan = subscription.planId as any;
      if (!plan || !plan.enabledModules.includes(moduleName)) {
        return res.status(403).json({
          success: false,
          message: `Your current subscription plan does not include the '${moduleName}' module. Please upgrade your plan.`,
        });
      }

      next();
    } catch (error) {
      console.error('Subscription Middleware Error:', error);
      res.status(500).json({ success: false, message: 'Internal server error while verifying subscription' });
    }
  };
};
