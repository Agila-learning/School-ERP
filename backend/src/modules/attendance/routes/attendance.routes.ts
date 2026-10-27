import express from 'express';
import {
  submitStudentDailyAttendance,
  getStudentDailyAttendance,
  getStudentAttendanceSummary,
  getStudentDashboardStats,
  requestStudentCorrection,
  processStudentCorrection,
  employeeCheckIn,
  employeeCheckOut,
  getEmployeeTodayStatus,
  applyLeave,
  processLeave,
  getLeaveBalance,
  getLeaveRequests,
  getMyLeaveRequests,
  getLeaveTypes,
  createLeaveType,
  updateLeaveType,
  deleteLeaveType,
  getStudentAttendanceReport,
  getPolicies,
  createPolicy,
  updatePolicy,
  deletePolicy,
  getLateComers,
  recordLateEntry,
  getPeriodAttendances,
  savePeriodAttendance
} from '../controllers/attendance.controller';
import { protect, requirePermission } from '../../../core/middlewares/auth.middleware';
import { tenantMiddleware } from '../../../core/middlewares/tenant.middleware';
import { validate } from '../../../core/middlewares/validate.middleware';
import * as Validator from '../validators/attendance.validator';

const router = express.Router();
router.use(tenantMiddleware, protect);

// ── Student Attendance ──
router.get('/student/dashboard', getStudentDashboardStats);
router.get('/student/report', getStudentAttendanceReport);
router.post('/student/submit', validate(Validator.bulkSubmitStudentAttendanceSchema), submitStudentDailyAttendance);
router.get('/student/sheet', getStudentDailyAttendance);
router.get('/student/summary', getStudentAttendanceSummary);
router.get('/student/period', getPeriodAttendances);
router.post('/student/period', savePeriodAttendance);
router.post('/student/correct', validate(Validator.correctionRequestSchema), requestStudentCorrection);
router.patch('/student/correct/:id', processStudentCorrection);

// ── Employee Attendance (self-service - uses authenticated user identity) ──
router.post('/employee/checkin', employeeCheckIn);
router.post('/employee/checkout', employeeCheckOut);
router.get('/employee/today', getEmployeeTodayStatus);

// ── Leave ──
router.post('/leave/apply', validate(Validator.applyLeaveSchema), applyLeave);
router.patch('/leave/:id/process', processLeave);
router.get('/leave/requests', getLeaveRequests);
router.get('/leave/my-requests', getMyLeaveRequests);
router.get('/leave/balance/:employeeId', getLeaveBalance);

router.get('/leave/types', getLeaveTypes);
router.post('/leave/types', createLeaveType);
router.put('/leave/types/:id', updateLeaveType);
router.delete('/leave/types/:id', deleteLeaveType);

// ── Policies ──
router.get('/policies', getPolicies);
router.post('/policies', createPolicy);
router.put('/policies/:id', updatePolicy);
router.delete('/policies/:id', deletePolicy);

// ── Late Comers ──
router.get('/late-comers', getLateComers);
router.post('/late-comers', recordLateEntry);
router.post('/late-entry', recordLateEntry);

export default router;
