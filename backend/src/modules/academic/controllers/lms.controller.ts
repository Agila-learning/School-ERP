import { Response, NextFunction } from 'express';
import { TenantRequest } from '../../../core/middlewares/tenant.middleware';
import Assignment from '../models/Assignment.model';
import Submission from '../models/Submission.model';
import { sendResponse } from '../../../core/utils/response.util';

export const getTeacherDashboard = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const teacherId = req.user.employeeId;
    const tenantId = req.tenantId;

    const [totalAssignments, draftAssignments, publishedAssignments] = await Promise.all([
      Assignment.countDocuments({ tenantId, teacherId }),
      Assignment.countDocuments({ tenantId, teacherId, status: 'DRAFT' }),
      Assignment.countDocuments({ tenantId, teacherId, status: 'PUBLISHED' })
    ]);

    // Pending evaluations: Submissions for this teacher's assignments that are NOT evaluated
    // We can do this via an aggregate or just an approximate count
    const assignmentIds = await Assignment.find({ tenantId, teacherId }).distinct('_id');
    const pendingEvaluations = await Submission.countDocuments({
      tenantId,
      assignmentId: { $in: assignmentIds },
      status: { $in: ['SUBMITTED', 'LATE'] }
    });

    sendResponse({ res, data: {
      totalAssignments,
      draftAssignments,
      publishedAssignments,
      pendingEvaluations
    }});
  } catch (error) {
    next(error);
  }
};

export const getStudentDashboard = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const studentId = req.user.studentProfileId;
    const tenantId = req.tenantId;
    
    // In a real app we would filter by the student's class and section
    // Assuming frontend passes these or we look them up
    // Let's just find active assignments for now
    const activeAssignments = await Assignment.find({ tenantId, status: { $in: ['PUBLISHED', 'OPEN'] } }).countDocuments();
    
    const mySubmissions = await Submission.countDocuments({ tenantId, studentId });
    const evaluatedSubmissions = await Submission.countDocuments({ tenantId, studentId, status: 'EVALUATED' });
    const pendingSubmissions = activeAssignments - mySubmissions; // Rough approximation

    sendResponse({ res, data: {
      activeAssignments,
      mySubmissions,
      evaluatedSubmissions,
      pendingSubmissions: Math.max(0, pendingSubmissions)
    }});
  } catch (error) {
    next(error);
  }
};

export const getAdminDashboard = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.tenantId;

    const [totalAssignments, activeAssignments, totalSubmissions, evaluatedSubmissions] = await Promise.all([
      Assignment.countDocuments({ tenantId }),
      Assignment.countDocuments({ tenantId, status: { $in: ['PUBLISHED', 'OPEN'] } }),
      Submission.countDocuments({ tenantId }),
      Submission.countDocuments({ tenantId, status: 'EVALUATED' })
    ]);

    const evaluationRate = totalSubmissions > 0 ? (evaluatedSubmissions / totalSubmissions) * 100 : 0;

    sendResponse({ res, data: {
      totalAssignments,
      activeAssignments,
      totalSubmissions,
      evaluationRate: Math.round(evaluationRate)
    }});
  } catch (error) {
    next(error);
  }
};
