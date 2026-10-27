import express from 'express';
import { protect, requirePermission } from '../../../core/middlewares/auth.middleware';
import { tenantMiddleware } from '../../../core/middlewares/tenant.middleware';
import {
  getDashboardSummary,
  getAttendanceSummary,
  getFeeSummary,
  getUpcomingEvents,
  getRecentActivities,
  getActionItems,
} from '../controllers/adminDashboard.controller';

const router = express.Router();

router.use(tenantMiddleware, protect);

router.get('/dashboard/summary', requirePermission('admin.dashboard.view'), getDashboardSummary);
router.get('/dashboard/attendance', requirePermission('admin.dashboard.view'), getAttendanceSummary);
router.get('/dashboard/fees', requirePermission('admin.dashboard.view'), getFeeSummary);
router.get('/dashboard/events', requirePermission('admin.dashboard.view'), getUpcomingEvents);
router.get('/dashboard/activities', requirePermission('admin.dashboard.view'), getRecentActivities);
router.get('/dashboard/action-items', requirePermission('admin.dashboard.view'), getActionItems);

export default router;
