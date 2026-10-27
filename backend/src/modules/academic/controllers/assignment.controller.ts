import { Response, NextFunction } from 'express';
import { TenantRequest } from '../../../core/middlewares/tenant.middleware';
import Assignment from '../models/Assignment.model';
import TeacherAssignment from '../models/TeacherAssignment.model';
import { sendResponse } from '../../../core/utils/response.util';
import { ForbiddenError, NotFoundError, ValidationError } from '../../../core/errors/AppError';

export const createAssignment = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const { classId, sectionId, subjectId } = req.body;
    
    // Authorization Check: If role is TEACHER, verify they are assigned to this subject + class
    if (['TEACHER', 'CLASS_TEACHER'].includes(req.user.role)) {
      const isAssigned = await TeacherAssignment.findOne({
        tenantId: req.tenantId,
        teacherId: req.user.employeeId,
        classId,
        subjectId,
        ...(sectionId ? { sectionId } : {})
      });
      
      if (!isAssigned) {
        throw new ForbiddenError('You are not authorized to create assignments for this class/subject.');
      }
    }

    let teacherId = req.body.teacherId || req.user.employeeId;
    if (!teacherId) {
      // Find assigned teacher if available
      const assigned = await TeacherAssignment.findOne({
        tenantId: req.tenantId,
        classId,
        subjectId
      });
      if (assigned && assigned.teacherId) {
        teacherId = assigned.teacherId;
      }
    }
    if (!teacherId) {
      const Employee = require('../../hr/models/Employee.model').default;
      const anyEmp = await Employee.findOne({ tenantId: req.tenantId });
      if (anyEmp) {
        teacherId = anyEmp._id;
      }
    }

    const assignment = await Assignment.create({
      ...req.body,
      tenantId: req.tenantId,
      teacherId,
      dueDate: req.body.dueDate ? new Date(req.body.dueDate) : new Date(Date.now() + 7 * 86400000)
    });

    sendResponse({ res, status: 201, message: 'Assignment created successfully', data: assignment });
  } catch (error) {
    next(error);
  }
};

export const getAssignments = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const { classId, sectionId, subjectId, status } = req.query;
    
    const query: any = { tenantId: req.tenantId };
    
    if (classId) query.classId = classId;
    if (sectionId) query.sectionId = sectionId;
    if (subjectId) query.subjectId = subjectId;
    if (status) query.status = status;

    // Role-based filtering
    if (['TEACHER', 'CLASS_TEACHER'].includes(req.user.role)) {
      query.teacherId = req.user.employeeId;
    } else if (req.user.role === 'STUDENT') {
      // Student can only see published or closed assignments
      query.status = { $in: ['PUBLISHED', 'OPEN', 'CLOSED'] };
      // To properly filter for student, frontend should pass the student's classId and sectionId
    }

    const assignments = await Assignment.find(query)
      .populate('subjectId', 'name code')
      .populate('classId', 'name')
      .populate('sectionId', 'name')
      .populate('teacherId', 'firstName lastName')
      .sort({ dueDate: 1 });

    sendResponse({ res, message: 'Assignments fetched successfully', data: assignments });
  } catch (error) {
    next(error);
  }
};

export const getAssignmentById = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const assignment = await Assignment.findOne({ _id: req.params.id, tenantId: req.tenantId })
      .populate('subjectId', 'name code')
      .populate('classId', 'name')
      .populate('sectionId', 'name')
      .populate('teacherId', 'firstName lastName');

    if (!assignment) throw new NotFoundError('Assignment not found');

    sendResponse({ res, message: 'Assignment fetched successfully', data: assignment });
  } catch (error) {
    next(error);
  }
};

export const updateAssignment = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const assignment = await Assignment.findOne({ _id: req.params.id, tenantId: req.tenantId });
    if (!assignment) throw new NotFoundError('Assignment not found');

    // Auth check
    if (['TEACHER', 'CLASS_TEACHER'].includes(req.user.role)) {
      if (assignment.teacherId.toString() !== req.user.employeeId?.toString()) {
        throw new ForbiddenError('You can only update your own assignments.');
      }
    }

    // Prevent major updates if not DRAFT (unless it's just a status change like publishing)
    if (assignment.status !== 'DRAFT' && req.body.status === assignment.status) {
      // Allowed modifications post-publish could be restricted here
    }

    Object.assign(assignment, req.body);
    await assignment.save();

    sendResponse({ res, message: 'Assignment updated successfully', data: assignment });
  } catch (error) {
    next(error);
  }
};

export const deleteAssignment = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const assignment = await Assignment.findOne({ _id: req.params.id, tenantId: req.tenantId });
    if (!assignment) throw new NotFoundError('Assignment not found');

    if (['TEACHER', 'CLASS_TEACHER'].includes(req.user.role)) {
      if (assignment.teacherId.toString() !== req.user.employeeId?.toString()) {
        throw new ForbiddenError('You can only delete your own assignments.');
      }
    }

    await (assignment as any).softDelete();
    
    sendResponse({ res, message: 'Assignment deleted successfully' });
  } catch (error) {
    next(error);
  }
};

