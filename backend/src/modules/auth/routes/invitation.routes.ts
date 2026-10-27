import express from 'express';
import { InvitationController } from '../controllers/invitation.controller';
import { protect, requirePermission } from '../../../core/middlewares/auth.middleware';
import { tenantMiddleware } from '../../../core/middlewares/tenant.middleware';

const router = express.Router();

router.use(tenantMiddleware, protect);

// RBAC: Only those with users.manage permission can access invitation management
router.get('/', requirePermission('users.manage'), InvitationController.getInvitations);
router.post('/:id/resend', requirePermission('users.manage'), InvitationController.resendInvitation);
router.post('/:id/revoke', requirePermission('users.manage'), InvitationController.revokeInvitation);

export default router;
