import { Response, NextFunction } from 'express';
import { TenantRequest } from '../../../core/middlewares/tenant.middleware';
import Invitation from '../models/Invitation.model';
import Role from '../models/Role.model';
import { sendResponse } from '../../../core/utils/response.util';
import { NotFoundError, ValidationError } from '../../../core/errors/AppError';
import { logger } from '../../../core/logger/logger';
import crypto from 'crypto';

export class InvitationController {
  // @desc    Get all invitations (with pagination)
  // @route   GET /api/v1/invitations
  // @access  Private (Admin only)
  static async getInvitations(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId!;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      const query: any = { tenantId };
      if (req.query.status) query.status = req.query.status;
      if (req.query.search) {
        query.email = { $regex: req.query.search, $options: 'i' };
      }

      const total = await Invitation.countDocuments(query);
      const invitations = await Invitation.find(query)
        .populate('roleId', 'name')
        .populate('invitedBy', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      sendResponse({
        res,
        data: {
          invitations,
          pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // @desc    Resend an invitation
  // @route   POST /api/v1/invitations/:id/resend
  // @access  Private (Admin only)
  static async resendInvitation(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId!;
      const { id } = req.params;

      const invitation = await Invitation.findOne({ _id: id, tenantId });
      if (!invitation) {
        throw new NotFoundError('Invitation not found');
      }

      if (invitation.status === 'ACCEPTED') {
        throw new ValidationError('Cannot resend an accepted invitation');
      }

      // Generate new token and expiry
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

      invitation.token = token;
      invitation.expiresAt = expiresAt;
      invitation.status = 'PENDING';
      await invitation.save();

      // Ensure Role exists for logging
      const role = await Role.findById(invitation.roleId);

      // Simulate Email
      logger.info({ tenantId, email: invitation.email, role: role?.name, token }, 'Simulated Resend Invitation Email Sent.');

      sendResponse({ res, message: 'Invitation resent successfully.' });
    } catch (error) {
      next(error);
    }
  }

  // @desc    Revoke an invitation
  // @route   POST /api/v1/invitations/:id/revoke
  // @access  Private (Admin only)
  static async revokeInvitation(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId!;
      const { id } = req.params;

      const invitation = await Invitation.findOne({ _id: id, tenantId });
      if (!invitation) {
        throw new NotFoundError('Invitation not found');
      }

      if (invitation.status === 'ACCEPTED') {
        throw new ValidationError('Cannot revoke an already accepted invitation');
      }

      invitation.status = 'REVOKED';
      invitation.token = 'REVOKED_' + Date.now(); // Invalidate token string just in case
      await invitation.save();

      logger.info({ tenantId, email: invitation.email }, 'Invitation revoked by admin');

      sendResponse({ res, message: 'Invitation revoked successfully.' });
    } catch (error) {
      next(error);
    }
  }
}
