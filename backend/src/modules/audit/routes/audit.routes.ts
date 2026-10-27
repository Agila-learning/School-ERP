import express from 'express';
import { getAuditLogs } from '../controllers/audit.controller';
import { protect, requirePermission } from '../../../core/middlewares/auth.middleware';
import { tenantMiddleware } from '../../../core/middlewares/tenant.middleware';

const router = express.Router();

router.use(tenantMiddleware, protect);

// Requires system.audit permission
router.get('/', requirePermission('system.audit'), getAuditLogs);

export default router;
