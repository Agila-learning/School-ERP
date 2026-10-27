import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError } from '../errors/AppError';
import Tenant from '../../modules/tenant/models/Tenant.model';

export interface TenantRequest<P = any, ResBody = any, ReqBody = any, ReqQuery = any> extends Request<P, ResBody, ReqBody, ReqQuery> {
  tenantId?: string;
  branchId?: string;
  user?: any;
}

export const tenantMiddleware = async (req: TenantRequest, res: Response, next: NextFunction) => {
  const tenantId = req.headers['x-tenant-id'] as string;
  const branchId = req.headers['x-branch-id'] as string;

  if (branchId) {
    req.branchId = branchId;
  }

  if (!tenantId) {
    return next(new UnauthorizedError('Tenant ID is missing in headers.'));
  }

  let tenant;
  if (tenantId.length === 24 && /^[0-9a-fA-F]{24}$/.test(tenantId)) {
    tenant = await Tenant.findById(tenantId);
  } else {
    tenant = await Tenant.findOne({ code: tenantId });
  }
  if (!tenant) {
    return next(new UnauthorizedError('Invalid Tenant ID.'));
  }

  // Decode authorization token if present to check for SUPER_ADMIN bypass
  let isSuperAdmin = false;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    try {
      const jwt = require('jsonwebtoken');
      const { env } = require('../../config/env');
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, env.jwtSecret) as any;
      if (decoded && (decoded.role === 'SUPER_ADMIN' || decoded.isSuperAdmin)) {
        isSuperAdmin = true;
      }
    } catch (e) {
      // Ignore token verification errors here; auth middleware will handle
    }
  }

  // If not super admin, enforce tenant status and subscription freezing
  if (!isSuperAdmin) {
    const normalizedStatus = (tenant.status || '').toLowerCase();

    if (normalizedStatus === 'pending_verification') {
      return next(new UnauthorizedError('School account is pending verification. Please check the admin email.'));
    }

    if (normalizedStatus === 'suspended') {
      return res.status(403).json({
        success: false,
        code: 'ACCOUNT_FROZEN',
        status: 'SUSPENDED',
        message: 'Your school account has been suspended and frozen. Please contact platform administrator.'
      });
    }

    if (normalizedStatus === 'expired') {
      return res.status(403).json({
        success: false,
        code: 'SUBSCRIPTION_EXPIRED',
        status: 'EXPIRED',
        message: 'Your school subscription / 1-day free trial has expired. The dashboard is frozen.'
      });
    }

    // Check live subscription & free trial expiration
    if (tenant.currentSubscriptionId) {
      try {
        const TenantSubscription = require('../../modules/tenant/models/TenantSubscription.model').default;
        const sub = await TenantSubscription.findById(tenant.currentSubscriptionId);
        if (sub) {
          const isExpired = sub.status === 'EXPIRED' || (sub.endDate && new Date(sub.endDate) < new Date());
          if (isExpired) {
            if (sub.status !== 'EXPIRED') {
              sub.status = 'EXPIRED';
              await sub.save();
            }
            if (tenant.status !== 'EXPIRED') {
              tenant.status = 'EXPIRED';
              await tenant.save();
            }
            return res.status(403).json({
              success: false,
              code: 'SUBSCRIPTION_EXPIRED',
              status: 'EXPIRED',
              message: 'Your school subscription / 1-day free trial has expired. The dashboard is frozen.'
            });
          }
          if (sub.status === 'SUSPENDED') {
            return res.status(403).json({
              success: false,
              code: 'ACCOUNT_FROZEN',
              status: 'SUSPENDED',
              message: 'Your school subscription is suspended and frozen. Please contact platform administrator.'
            });
          }
        }
      } catch (err) {
        // Fallback to tenant status if subscription check fails
      }
    }

    if (normalizedStatus !== 'active' && normalizedStatus !== 'trial') {
      return res.status(403).json({
        success: false,
        code: 'ACCOUNT_FROZEN',
        status: tenant.status,
        message: `School account is ${tenant.status}. The dashboard is frozen.`
      });
    }
  }

  req.tenantId = tenant._id.toString();

  // Handle branchId fallback and sanitization globally
  if (!req.branchId) {
    const Branch = require('../../modules/organization/models/Branch.model').default;
    const defaultBranch = await Branch.findOne({ tenantId: tenant._id });
    if (defaultBranch) {
      req.branchId = defaultBranch._id.toString();
    } else {
      req.branchId = tenant._id.toString(); // Fallback to tenantId if no branch
    }
  }

  // Sanitize req.body.branchId if it's an empty string, or inject it if missing
  if (req.body && typeof req.body === 'object') {
    if (req.body.branchId === '' || !req.body.branchId) {
      req.body.branchId = req.branchId;
    }
  }

  next();
};
