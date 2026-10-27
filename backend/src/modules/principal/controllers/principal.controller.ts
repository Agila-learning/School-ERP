import { Response, NextFunction } from 'express';
import { TenantRequest } from '../../../core/middlewares/tenant.middleware';
import StudentProfile from '../../students/models/StudentProfile.model';
import Employee from '../../hr/models/Employee.model';
import Class from '../../academic/models/Class.model';
import LeaveRequest from '../../attendance/models/LeaveRequest.model';
import Assignment from '../../academic/models/Assignment.model';
import ExaminationMaster from '../../examination/models/ExaminationMaster.model';
import StudentDailyAttendance from '../../attendance/models/StudentDailyAttendance.model';
import Invoice from '../../finance/models/Invoice.model';
import { sendResponse } from '../../../core/utils/response.util';

// @desc    Get Principal Dashboard KPI Stats
// @route   GET /api/v1/principal/dashboard-stats
// @access  Private (Principal, Admin)
export const getDashboardStats = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.tenantId;

    // Run aggregations concurrently
    const [
      totalStudents,
      totalTeachers,
      totalStaff,
      totalClasses,
      pendingLeaves
    ] = await Promise.all([
      StudentProfile.countDocuments({ tenantId, status: 'ACTIVE' }),
      Employee.countDocuments({ tenantId, department: { $regex: /academic|teaching/i }, status: 'ACTIVE' }),
      Employee.countDocuments({ tenantId, status: 'ACTIVE' }),
      Class.countDocuments({ tenantId, status: 'ACTIVE' }),
      LeaveRequest.countDocuments({ tenantId, status: 'PENDING' })
    ]);

    // Calculate Attendance Rate for today
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const todayAttendanceTotal = await StudentDailyAttendance.countDocuments({
      tenantId,
      date: { $gte: startOfDay, $lte: endOfDay }
    });
    
    const todayAttendancePresent = await StudentDailyAttendance.countDocuments({
      tenantId,
      date: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ['PRESENT', 'LATE'] }
    });

    const attendanceRate = todayAttendanceTotal > 0 ? (todayAttendancePresent / todayAttendanceTotal) * 100 : 0;

    // Calculate Collection Rate
    const invoices = await Invoice.find({ tenantId, status: { $in: ['PAID', 'PARTIAL', 'PENDING'] } });
    let totalExpected = 0;
    let totalCollected = 0;
    invoices.forEach((inv: any) => {
      totalExpected += inv.amount;
      totalCollected += inv.amountPaid;
    });

    const collectionRate = totalExpected > 0 ? (totalCollected / totalExpected) * 100 : 0;

    const dashboardStats = {
      totalStudents,
      totalTeachers,
      totalStaff,
      totalClasses,
      attendanceRate: Math.round(attendanceRate * 10) / 10,
      pendingLeaves,
      upcomingExams: 0,
      collectionRate: Math.round(collectionRate * 10) / 10
    };

    sendResponse({ res, message: 'Principal dashboard stats fetched', data: dashboardStats });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Pending Approvals (Aggregated)
// @route   GET /api/v1/principal/approvals/pending
// @access  Private (Principal, Admin)
export const getPendingApprovals = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.tenantId;

    // Currently we mainly have Leave Approvals. In the future this can aggregate admissions, marks, etc.
    const pendingLeaves = await LeaveRequest.find({ tenantId, status: 'PENDING' })
      .populate('employeeId', 'firstName lastName employeeId')
      .sort({ createdAt: -1 })
      .limit(50); // limit to recent

    // Map to a unified approval object format
    const approvals = pendingLeaves.map((leave: any) => ({
      id: leave._id,
      type: 'LEAVE_REQUEST',
      requestedBy: leave.employeeId,
      requestedDate: leave.createdAt,
      description: `Leave request: ${leave.leaveType} (${new Date(leave.startDate).toLocaleDateString()} - ${new Date(leave.endDate).toLocaleDateString()})`,
      status: leave.status,
      originalRecord: leave
    }));

    sendResponse({ res, message: 'Pending approvals fetched', data: approvals });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Learning Stats for Principal
// @route   GET /api/v1/principal/learning-stats
// @access  Private (Principal, Admin)
export const getLearningStats = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.tenantId;

    const [totalAssignments, activeHomework] = await Promise.all([
      Assignment.countDocuments({ tenantId }),
      Assignment.countDocuments({ tenantId, dueDate: { $gte: new Date() } })
    ]);

    const learningStats = {
      totalAssignments,
      activeHomework,
      syllabusProgress: 65, // Syllabus tracking is complex and typically requires a Syllabus model
    };

    sendResponse({ res, message: 'Learning stats fetched', data: learningStats });
  } catch (error) {
    next(error);
  }
};

// @desc    Handle Approval Action
// @route   PUT /api/v1/principal/approvals/:id/action
// @access  Private (Principal, Admin)
export const handleApprovalAction = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.tenantId;
    const { id } = req.params;
    const { action } = req.body; // 'APPROVED' or 'REJECTED'

    if (!['APPROVED', 'REJECTED'].includes(action)) {
      res.status(400);
      return sendResponse({ res, message: 'Invalid action' });
    }

    const leaveRequest = await LeaveRequest.findOne({ _id: id, tenantId });
    
    if (!leaveRequest) {
      res.status(404);
      return sendResponse({ res, message: 'Leave request not found' });
    }

    leaveRequest.status = action;
    
    // Add to approval history
    leaveRequest.approvalHistory.push({
      action: action,
      byUserId: req.user._id,
      at: new Date(),
      remarks: req.body.remarks || `Action taken from Principal Dashboard`
    });

    await leaveRequest.save();

    sendResponse({ res, message: `Leave request ${action.toLowerCase()} successfully` });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Upcoming Exams
// @route   GET /api/v1/principal/upcoming-exams
// @access  Private (Principal, Admin)
export const getUpcomingExams = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.tenantId;

    const upcomingExams = await ExaminationMaster.find({
      tenantId,
      status: { $in: ['SCHEDULED', 'ONGOING'] },
      startDate: { $gte: new Date() }
    })
    .sort({ startDate: 1 })
    .limit(5);

    sendResponse({ res, message: 'Upcoming exams fetched', data: upcomingExams });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Principal Notifications
// @route   GET /api/v1/principal/notifications
// @access  Private (Principal, Admin)
export const getPrincipalNotifications = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.tenantId;

    const notifications = [];

    // 1. Pending Leave Requests
    const pendingLeavesCount = await LeaveRequest.countDocuments({ tenantId, status: 'PENDING' });
    if (pendingLeavesCount > 0) {
      notifications.push({
        id: 'leaves_' + Date.now(),
        title: 'Pending Approvals',
        message: `You have ${pendingLeavesCount} pending leave requests awaiting approval.`,
        type: 'info',
        date: new Date().toISOString()
      });
    }

    // 2. Upcoming Exams (if any in next 7 days)
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    const upcomingExams = await ExaminationMaster.find({
      tenantId,
      status: 'SCHEDULED',
      startDate: { $gte: new Date(), $lte: nextWeek }
    });

    if (upcomingExams.length > 0) {
      notifications.push({
        id: 'exams_' + Date.now(),
        title: 'Upcoming Examinations',
        message: `There are ${upcomingExams.length} examinations scheduled for the upcoming week.`,
        type: 'event',
        date: new Date().toISOString()
      });
    }

    // 3. System Alert placeholder
    notifications.push({
      id: 'system_' + Date.now(),
      title: 'System Update',
      message: 'All modules are functioning normally.',
      type: 'info',
      date: new Date().toISOString()
    });

    sendResponse({ res, message: 'Notifications fetched', data: notifications });
  } catch (error) {
    next(error);
  }
};
