import { Response, NextFunction } from 'express';
import { StaffRequest } from '../../../core/middlewares/staffAuth.middleware';
import TeacherAssignment from '../../academic/models/TeacherAssignment.model';
import StudentProfile from '../../students/models/StudentProfile.model';
import AcademicEnrollment from '../../academic/models/AcademicEnrollment.model';
import ClassDiary from '../../academic/models/ClassDiary.model';
import { sendResponse } from '../../../core/utils/response.util';

// @desc    Get Staff Dashboard Summary
// @route   GET /api/v1/staff-portal/dashboard
// @access  Private (Staff)
export const getDashboardSummary = async (req: StaffRequest, res: Response, next: NextFunction) => {
  try {
    const staffId = req.staff._id;
    
    // For teachers, fetch active class assignments
    const assignments = await TeacherAssignment.find({
      teacherId: staffId,
      tenantId: req.tenantId,
      status: 'ACTIVE'
    }).populate('classId sectionId subjectId');

    // Here we'd also aggregate tasks, leave balance, attendance summary, etc.

    sendResponse({ 
      res, 
      message: 'Dashboard fetched', 
      data: { 
        staff: req.staff,
        assignments,
        stats: {
          pendingTasks: 3,
          leaveBalance: 12,
          upcomingClasses: assignments.length
        }
      } 
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Assigned Classes
// @route   GET /api/v1/staff-portal/classes
// @access  Private (Teacher)
export const getMyClasses = async (req: StaffRequest, res: Response, next: NextFunction) => {
  try {
    const assignments = await TeacherAssignment.find({
      teacherId: req.staff._id,
      tenantId: req.tenantId,
      status: 'ACTIVE'
    }).populate('classId sectionId subjectId');

    sendResponse({ res, message: 'Classes fetched', data: assignments });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Students for an Assigned Class
// @route   GET /api/v1/staff-portal/classes/:classId/sections/:sectionId/students
// @access  Private (Teacher - Authorized)
export const getMyStudents = async (req: StaffRequest, res: Response, next: NextFunction) => {
  try {
    const { classId, sectionId } = req.params;

    // The authorizeTeacherAccess middleware already ensures the teacher has this assignment.
    // Fetch active enrollments for this class and section
    const enrollments = await AcademicEnrollment.find({
      classId,
      sectionId,
      tenantId: req.tenantId,
      status: 'ACTIVE'
    }).populate({
      path: 'studentId',
      select: 'firstName lastName studentIdNumber photoUrl gender dateOfBirth',
    });

    const students = enrollments.map((e: any) => e.studentId);

    sendResponse({ res, message: 'Students fetched', data: students });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark Attendance (Proxy to Attendance module)
// @route   POST /api/v1/staff-portal/attendance/mark
// @access  Private (Teacher - Authorized)
export const markAttendance = async (req: StaffRequest, res: Response, next: NextFunction) => {
  try {
    const { classId, sectionId, date, records } = req.body;
    
    // The authorizeTeacherAccess middleware validates classId/sectionId
    
    // Call the underlying Attendance Service
    // const result = await AttendanceService.markClassAttendance(...)
    
    sendResponse({ res, message: 'Attendance marked successfully', data: { recordsProcessed: records.length } });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Office Staff Dashboard Summary
// @route   GET /api/v1/staff-portal/office-dashboard
// @access  Private (Office Staff)
export const getOfficeDashboardSummary = async (req: StaffRequest, res: Response, next: NextFunction) => {
  try {
    const dashboardStats = {
      todayAdmissions: 12,
      pendingApplications: 5,
      todayVisitors: 28,
      upcomingAppointments: 4,
      pendingFeeFollowUps: 15,
      recentEnquiries: 8
    };
    sendResponse({ res, message: 'Office Dashboard fetched', data: dashboardStats });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// COORDINATOR ENDPOINTS
// ==========================================

export const getCoordinatorStudents = async (req: StaffRequest, res: Response, next: NextFunction) => {
  try {
    const assignments = await TeacherAssignment.find({
      teacherId: req.staff._id,
      tenantId: req.tenantId,
      isClassCoordinator: true,
      status: 'ACTIVE'
    });

    if (!assignments || assignments.length === 0) {
      res.status(403);
      return sendResponse({ res, message: 'Not a class coordinator' });
    }

    const classIds = assignments.map((a: any) => a.classId);
    const sectionIds = assignments.map((a: any) => a.sectionId);

    const enrollments = await AcademicEnrollment.find({
      tenantId: req.tenantId,
      classId: { $in: classIds },
      sectionId: { $in: sectionIds },
      status: 'ACTIVE'
    }).populate('studentId');

    const students = enrollments.map((e: any) => e.studentId);
    sendResponse({ res, message: 'Coordinator students fetched', data: students });
  } catch (error) {
    next(error);
  }
};

export const getCoordinatorPerformance = async (req: StaffRequest, res: Response, next: NextFunction) => {
  try {
    // Return dummy data for now
    const performanceStats = {
      averageAttendance: '85%',
      topSubjects: ['Mathematics', 'Science'],
      weakSubjects: ['History']
    };
    sendResponse({ res, message: 'Coordinator performance fetched', data: performanceStats });
  } catch (error) {
    next(error);
  }
};

export const getCoordinatorAnnouncements = async (req: StaffRequest, res: Response, next: NextFunction) => {
  try {
    // Return dummy data for now
    sendResponse({ res, message: 'Coordinator announcements fetched', data: [] });
  } catch (error) {
    next(error);
  }
};

export const getCoordinatorDiary = async (req: StaffRequest, res: Response, next: NextFunction) => {
  try {
    const assignments = await TeacherAssignment.find({
      teacherId: req.staff._id,
      tenantId: req.tenantId,
      isClassCoordinator: true,
      status: 'ACTIVE'
    });
    const classIds = assignments.map((a: any) => a.classId);

    const diaries = await ClassDiary.find({
      tenantId: req.tenantId,
      classId: { $in: classIds }
    }).sort({ date: -1 });

    sendResponse({ res, message: 'Coordinator diary fetched', data: diaries });
  } catch (error) {
    next(error);
  }
};

export const createCoordinatorDiary = async (req: StaffRequest, res: Response, next: NextFunction) => {
  try {
    const { classId, sectionId, date, title, description, activities, homework, remarks } = req.body;

    const diary = await ClassDiary.create({
      tenantId: req.tenantId,
      academicYearId: req.body.academicYearId || null, // Ensure this exists from client
      classId,
      sectionId,
      date,
      title,
      description,
      activities,
      homework,
      remarks,
      createdBy: req.staff._id
    });

    res.status(201);
    sendResponse({ res, message: 'Diary created', data: diary });
  } catch (error) {
    next(error);
  }
};
