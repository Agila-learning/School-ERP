import { Response, NextFunction } from 'express';
import { TenantRequest } from '../../../core/middlewares/tenant.middleware';
import { HRService } from '../services/hrMaster.service';
import { PayrollService } from '../services/payroll.service';
import { RecruitmentService } from '../services/recruitment.service';
import { OnboardingService } from '../services/onboarding.service';
import { ExitService } from '../services/exit.service';
import { PerformanceService } from '../services/performance.service';
import { sendResponse } from '../../../core/utils/response.util';

export class HRController {
  // Master
  static async getDepartments(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new HRService(req.tenantId!).getDepartments();
      sendResponse({ res, status: 200, message: 'Success', data });
    } catch (e) { next(e); }
  }

  static async createDepartment(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new HRService(req.tenantId!).createDepartment(req.body);
      sendResponse({ res, status: 201, message: 'Department created', data });
    } catch (e) { next(e); }
  }

  static async updateDepartment(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new HRService(req.tenantId!).updateDepartment(req.params.id, req.body);
      sendResponse({ res, status: 200, message: 'Department updated', data });
    } catch (e) { next(e); }
  }

  static async deactivateDepartment(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new HRService(req.tenantId!).deactivateDepartment(req.params.id);
      sendResponse({ res, status: 200, message: 'Department deactivated', data });
    } catch (e) { next(e); }
  }

  static async getDesignations(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const departmentId = req.query.departmentId ? String(req.query.departmentId) : undefined;
      const data = await new HRService(req.tenantId!).getDesignations(departmentId);
      sendResponse({ res, status: 200, message: 'Success', data });
    } catch (e) { next(e); }
  }

  static async createDesignation(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new HRService(req.tenantId!).createDesignation(req.body);
      sendResponse({ res, status: 201, message: 'Designation created', data });
    } catch (e) { next(e); }
  }

  static async updateDesignation(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new HRService(req.tenantId!).updateDesignation(req.params.id, req.body);
      sendResponse({ res, status: 200, message: 'Designation updated', data });
    } catch (e) { next(e); }
  }

  static async deactivateDesignation(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new HRService(req.tenantId!).deactivateDesignation(req.params.id);
      sendResponse({ res, status: 200, message: 'Designation deactivated', data });
    } catch (e) { next(e); }
  }

  static async getEmployees(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const branchId = req.query.branchId ? String(req.query.branchId) : undefined;
      const departmentId = req.query.departmentId ? String(req.query.departmentId) : undefined;
      const data = await new HRService(req.tenantId!).getEmployees(branchId, departmentId);
      sendResponse({ res, status: 200, message: 'Success', data });
    } catch (e) { next(e); }
  }

  static async getEmployeeProfile(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new HRService(req.tenantId!).getEmployeeProfile(req.params.id as string);
      sendResponse({ res, status: 200, message: 'Success', data });
    } catch (e) { next(e); }
  }

  static async getMyProfile(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      let employee: any = null;
      if (req.user?.referenceId) {
        try {
          employee = await new HRService(req.tenantId!).getEmployeeProfile(req.user.referenceId);
        } catch (_) {}
      }

      if (!employee && req.user?._id) {
        const Employee = (await import('../models/Employee.model')).default;
        employee = await Employee.findOne({ tenantId: req.tenantId, userId: req.user._id }).lean()
          || await Employee.findOne({ tenantId: req.tenantId, email: req.user.email }).lean();
      }

      if (!employee && req.user) {
        // Fallback for demo/seeded staff users
        employee = {
          _id: req.user._id,
          id: req.user._id,
          firstName: req.user.firstName || 'Teacher',
          lastName: req.user.lastName || 'Staff',
          email: req.user.email,
          status: 'ACTIVE',
          employmentType: 'Teaching'
        };
      }

      sendResponse({ res, status: 200, message: 'Success', data: employee });
    } catch (e) { next(e); }
  }

  static async getDashboardStats(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new HRService(req.tenantId!).getDashboardStats();
      sendResponse({ res, status: 200, message: 'Success', data });
    } catch (e) { next(e); }
  }

  static async getCandidates(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new RecruitmentService(req.tenantId!).getCandidates(req.query.requisitionId as string);
      sendResponse({ res, status: 200, message: 'Success', data });
    } catch (e) { next(e); }
  }

  static async createCandidate(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new RecruitmentService(req.tenantId!).createCandidate(req.body);
      sendResponse({ res, status: 201, message: 'Candidate Created', data });
    } catch (e) { next(e); }
  }

  static async getCandidateById(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new RecruitmentService(req.tenantId!).getCandidateById(req.params.candidateId);
      sendResponse({ res, status: 200, message: 'Success', data });
    } catch (e) { next(e); }
  }

  static async updateCandidate(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new RecruitmentService(req.tenantId!).updateCandidate(req.params.candidateId, req.body);
      sendResponse({ res, status: 200, message: 'Candidate Updated', data });
    } catch (e) { next(e); }
  }

  static async scheduleInterview(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new RecruitmentService(req.tenantId!).scheduleInterview(req.body);
      sendResponse({ res, status: 201, message: 'Interview Scheduled', data });
    } catch (e) { next(e); }
  }

  static async getInterviews(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new RecruitmentService(req.tenantId!).getInterviews(req.query.candidateId as string);
      sendResponse({ res, status: 200, message: 'Success', data });
    } catch (e) { next(e); }
  }

  static async updateInterviewFeedback(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new RecruitmentService(req.tenantId!).updateInterviewFeedback(req.params.interviewId, req.body);
      sendResponse({ res, status: 200, message: 'Interview Updated', data });
    } catch (e) { next(e); }
  }

  static async generateOffer(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new RecruitmentService(req.tenantId!).generateOffer(String(req.params.candidateId), req.body);
      sendResponse({ res, status: 201, message: 'Offer Generated', data });
    } catch (e) { next(e); }
  }

  // --- Onboarding ---
  static async getOnboardingTasks(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new OnboardingService(req.tenantId!).getTasks(req.query.employeeId as string);
      sendResponse({ res, status: 200, message: 'Success', data });
    } catch (e) { next(e); }
  }

  static async createOnboardingTasks(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new OnboardingService(req.tenantId!).createTasksForEmployee(req.params.employeeId, req.body.tasks);
      sendResponse({ res, status: 201, message: 'Tasks created', data });
    } catch (e) { next(e); }
  }

  static async updateOnboardingTask(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new OnboardingService(req.tenantId!).updateTaskStatus(req.params.taskId, req.body.status, req.body.remarks, req.user?.id);
      sendResponse({ res, status: 200, message: 'Task updated', data });
    } catch (e) { next(e); }
  }

  // --- Exit Management ---
  static async getResignations(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new ExitService(req.tenantId!).getResignations(req.query.employeeId as string);
      sendResponse({ res, status: 200, message: 'Success', data });
    } catch (e) { next(e); }
  }

  static async submitResignation(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new ExitService(req.tenantId!).submitResignation(req.body);
      sendResponse({ res, status: 201, message: 'Resignation submitted', data });
    } catch (e) { next(e); }
  }

  static async updateResignationStatus(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const userId = (req.user as any)?._id || (req.user as any)?.id;
      const data = await new ExitService(req.tenantId!).updateResignationStatus(
        req.params.resignationId, 
        req.body.status, 
        req.body.approvedLastWorkingDate,
        {
          comments: req.body.comments,
          deactivationDate: req.body.deactivationDate,
          userId
        }
      );
      sendResponse({ res, status: 200, message: 'Resignation updated', data });
    } catch (e) { next(e); }
  }

  static async getExitClearances(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new ExitService(req.tenantId!).getExitClearances(req.params.resignationId);
      sendResponse({ res, status: 200, message: 'Success', data });
    } catch (e) { next(e); }
  }

  static async updateExitClearance(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new ExitService(req.tenantId!).updateExitClearance(req.params.clearanceId, req.body, req.user!.id);
      sendResponse({ res, status: 200, message: 'Clearance updated', data });
    } catch (e) { next(e); }
  }

  static async calculateFinalSettlement(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new ExitService(req.tenantId!).calculateFinalSettlement(req.params.resignationId);
      sendResponse({ res, status: 200, message: 'Settlement calculated', data });
    } catch (e) { next(e); }
  }

  static async getFinalSettlement(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new ExitService(req.tenantId!).getFinalSettlement(req.params.resignationId);
      sendResponse({ res, status: 200, message: 'Success', data });
    } catch (e) { next(e); }
  }

  static async approveFinalSettlement(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new ExitService(req.tenantId!).approveFinalSettlement(req.params.settlementId);
      sendResponse({ res, status: 200, message: 'Settlement approved', data });
    } catch (e) { next(e); }
  }

  // --- Leave ---
  // Leave methods moved to attendance module

  // --- Performance ---
  static async getPerformanceReviews(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new PerformanceService(req.tenantId!).getReviews(req.query.employeeId as string);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  }

  static async createPerformanceReview(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new PerformanceService(req.tenantId!).createReview(req.body);
      res.status(201).json({ success: true, data });
    } catch (err) { next(err); }
  }

  static async submitManagerReview(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const data = await new PerformanceService(req.tenantId!).submitManagerReview(
        req.params.reviewId as string, 
        req.body.comments, 
        req.body.rating, 
        req.user!.id as string
      );
      res.json({ success: true, data });
    } catch (err) { next(err); }
  }

  // --- Promotions & Hikes ---
  static async getPromotions(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const EmploymentTimeline = (await import('../models/EmploymentTimeline.model')).default;
      const records = await EmploymentTimeline.find({
        tenantId: req.tenantId,
        eventType: 'PROMOTION'
      })
      .populate({
        path: 'employeeId',
        select: 'firstName lastName employeeIdNumber email mobile currentSalary',
        populate: { path: 'designationId', select: 'title' }
      })
      .sort({ createdAt: -1 });

      const mapped = records.map((r: any) => {
        let details: any = {};
        try { details = JSON.parse(r.description || '{}'); } catch { details = { notes: r.description }; }
        const emp = r.employeeId || {};
        return {
          id: r._id,
          employeeId: emp._id,
          name: `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || 'Staff Member',
          currentRole: details.currentRole || emp.designationId?.title || 'Teacher',
          proposedRole: details.proposedRole || 'Senior Staff',
          currentSalary: details.currentSalary || '₹40,000',
          proposedSalary: details.proposedSalary || '₹55,000',
          performanceScore: details.performanceScore || 9.0,
          status: details.status || 'pending',
          notes: details.notes || '',
          eventDate: r.eventDate
        };
      });

      sendResponse({ res, status: 200, message: 'Promotions retrieved successfully', data: mapped });
    } catch (err) { next(err); }
  }

  static async nominatePromotion(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const EmploymentTimeline = (await import('../models/EmploymentTimeline.model')).default;
      const Employee = (await import('../models/Employee.model')).default;

      let employeeId = req.body.employeeId;
      if (!employeeId) {
        const firstEmp = await Employee.findOne({ tenantId: req.tenantId });
        employeeId = firstEmp?._id;
      }

      const details = {
        proposedRole: req.body.proposedRole || 'Senior Teacher',
        currentRole: req.body.currentRole || 'Junior Teacher',
        proposedSalary: req.body.proposedSalary || '₹50,000',
        currentSalary: req.body.currentSalary || '₹40,000',
        performanceScore: Number(req.body.performanceScore) || 9.0,
        notes: req.body.notes || 'Nominated for excellent performance',
        status: 'pending'
      };

      const timeline = await EmploymentTimeline.create({
        tenantId: req.tenantId,
        employeeId,
        eventType: 'PROMOTION',
        title: `Promotion Nomination: ${details.proposedRole}`,
        description: JSON.stringify(details),
        performedByUserId: req.user!.id,
        eventDate: new Date()
      });

      sendResponse({ res, status: 201, message: 'Promotion nomination created successfully', data: timeline });
    } catch (err) { next(err); }
  }

  static async reviewPromotion(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const EmploymentTimeline = (await import('../models/EmploymentTimeline.model')).default;
      const timeline = await EmploymentTimeline.findOne({ _id: req.params.id, tenantId: req.tenantId });
      if (!timeline) {
        return res.status(404).json({ success: false, message: 'Promotion record not found' });
      }

      let details: any = {};
      try { details = JSON.parse(timeline.description || '{}'); } catch { details = {}; }

      details.status = req.body.status; // 'approved' or 'rejected'
      details.reviewedBy = req.user!.id;
      details.reviewDate = new Date();
      if (req.body.notes) details.reviewNotes = req.body.notes;

      timeline.description = JSON.stringify(details);
      await timeline.save();

      sendResponse({ res, status: 200, message: `Promotion ${req.body.status} successfully`, data: timeline });
    } catch (err) { next(err); }
  }
}
