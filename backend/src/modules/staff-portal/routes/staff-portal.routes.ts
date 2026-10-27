import express from 'express';
import { 
  getDashboardSummary,
  getMyClasses,
  getMyStudents,
  markAttendance,
  getOfficeDashboardSummary,
  getCoordinatorStudents,
  getCoordinatorPerformance,
  getCoordinatorAnnouncements,
  getCoordinatorDiary,
  createCoordinatorDiary
} from '../controllers/staff-portal.controller';
import {
  getMyPayslips,
  submitReimbursement,
  getMyReimbursements,
  requestAdvance,
  getMyAdvances
} from '../controllers/staff-finance.controller';
import { protect, restrictTo } from '../../../core/middlewares/auth.middleware';
import { tenantMiddleware } from '../../../core/middlewares/tenant.middleware';
import { staffAuthMiddleware, authorizeTeacherAccess } from '../../../core/middlewares/staffAuth.middleware';

const router = express.Router();

router.use(tenantMiddleware);
router.use(protect);
// Assuming 'TEACHER' and 'STAFF' are roles in the system. 
// A teacher is a type of staff, so we can allow both or check specific roles per route.
router.use(restrictTo('TEACHER', 'STAFF', 'ADMIN', 'SCHOOL_ADMIN', 'SUPER_ADMIN', 'PRINCIPAL', 'HR_ADMIN', 'OFFICE_ADMIN', 'RECEPTIONIST')); 
router.use(staffAuthMiddleware as any);

router.get('/dashboard', getDashboardSummary as any);
router.get('/office-dashboard', getOfficeDashboardSummary as any);
router.get('/classes', getMyClasses as any);

// Routes requiring object-level teacher authorization
router.get(
  '/classes/:classId/sections/:sectionId/students', 
  authorizeTeacherAccess() as any, 
  getMyStudents as any
);

router.post(
  '/attendance/mark',
  authorizeTeacherAccess() as any,
  markAttendance as any
);

// Coordinator Routes
router.get('/coordinator/students', getCoordinatorStudents as any);
router.get('/coordinator/performance', getCoordinatorPerformance as any);
router.get('/coordinator/announcements', getCoordinatorAnnouncements as any);
router.get('/coordinator/diary', getCoordinatorDiary as any);
router.post('/coordinator/diary', createCoordinatorDiary as any);

// Employee Finance / Payroll Portal Routes
router.get('/finance/payslips', getMyPayslips as any);
router.post('/finance/reimbursements', submitReimbursement as any);
router.get('/finance/reimbursements', getMyReimbursements as any);
router.post('/finance/advances', requestAdvance as any);
router.get('/finance/advances', getMyAdvances as any);

export default router;
