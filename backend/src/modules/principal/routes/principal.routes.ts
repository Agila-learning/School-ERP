import express from 'express';
import { protect, restrictTo } from '../../../core/middlewares/auth.middleware';
import { tenantMiddleware } from '../../../core/middlewares/tenant.middleware';
import { 
  getDashboardStats, 
  getPendingApprovals, 
  getLearningStats,
  handleApprovalAction,
  getUpcomingExams,
  getPrincipalNotifications
} from '../controllers/principal.controller';

const router = express.Router();

// Apply tenant context and authentication
router.use(tenantMiddleware);
router.use(protect);

// Only allow Principal, School Admin, Super Admin, Tenant Admin
router.use(restrictTo('PRINCIPAL', 'SCHOOL_ADMIN', 'SUPER_ADMIN', 'TENANT_ADMIN', 'SuperAdmin', 'SchoolAdmin', 'Principal'));

router.get('/dashboard-stats', getDashboardStats as any);
router.get('/approvals/pending', getPendingApprovals as any);
router.put('/approvals/:id/action', handleApprovalAction as any);
router.get('/learning-stats', getLearningStats as any);
router.get('/upcoming-exams', getUpcomingExams as any);
router.get('/notifications', getPrincipalNotifications as any);

export default router;
