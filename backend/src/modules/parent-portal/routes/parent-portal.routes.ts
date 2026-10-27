import express from 'express';
import { 
  getDashboardSummary, 
  getChildAcademicInfo,
  getChildAttendance,
  getChildFees,
  getChildLibrary,
  payChildFee
} from '../controllers/parent-portal.controller';
import { protect, restrictTo } from '../../../core/middlewares/auth.middleware';
import { tenantMiddleware } from '../../../core/middlewares/tenant.middleware';
import { parentAuthMiddleware, authorizeChildAccess } from '../../../core/middlewares/parentAuth.middleware';

const router = express.Router();

router.use(tenantMiddleware);
router.use(protect);
router.use(restrictTo('PARENT', 'Admin', 'admin', 'Super Admin', 'SUPER_ADMIN', 'Principal', 'Teacher', 'Staff'));
router.use(parentAuthMiddleware as any); // Type cast due to express type definitions with custom Request

router.get('/dashboard', getDashboardSummary as any);

// Routes scoped to a specific child require relationship authorization
router.get('/children/:studentId/academic', authorizeChildAccess(['academicAccess']) as any, getChildAcademicInfo as any);
router.get('/children/:studentId/attendance', authorizeChildAccess(['attendanceAccess']) as any, getChildAttendance as any);
router.get('/children/:studentId/fees', authorizeChildAccess(['feeAccess']) as any, getChildFees as any);
router.post('/children/:studentId/pay', authorizeChildAccess(['feeAccess']) as any, payChildFee as any);
router.get('/children/:studentId/library', authorizeChildAccess(['academicAccess']) as any, getChildLibrary as any);

export default router;
