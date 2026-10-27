import { Response, NextFunction } from 'express';
import { TenantRequest } from '../../../core/middlewares/tenant.middleware';
import Submission from '../models/Submission.model';
import Assignment from '../models/Assignment.model';
import { sendResponse } from '../../../core/utils/response.util';
import { ForbiddenError, NotFoundError, ValidationError } from '../../../core/errors/AppError';
import mongoose from 'mongoose';

export const submitAssignment = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const { assignmentId } = req.params;
    const { content, attachments } = req.body;
    
    // Auth check: must be a student
    if (req.user.role !== 'STUDENT') {
      throw new ForbiddenError('Only students can submit assignments.');
    }
    
    const studentProfile = await require('../../students/models/StudentProfile.model').default.findOne({ userId: req.user._id, tenantId: req.tenantId, status: 'ACTIVE' });
      const studentId = studentProfile ? studentProfile._id : null; // Assumes studentId is attached to user
    
    const assignment = await Assignment.findOne({ _id: assignmentId, tenantId: req.tenantId });
    if (!assignment) throw new NotFoundError('Assignment not found');
    
    if (['DRAFT', 'CLOSED', 'ARCHIVED'].includes(assignment.status)) {
      throw new ValidationError(`Cannot submit to an assignment that is ${assignment.status}`);
    }

    // Check deadlines
    const now = new Date();
    let isLate = false;
    
    if (now > assignment.dueDate) {
      if (!assignment.allowLateSubmission) {
        throw new ValidationError('Late submissions are not allowed for this assignment.');
      }
      if (assignment.lateSubmissionDeadline && now > assignment.lateSubmissionDeadline) {
        throw new ValidationError('Late submission deadline has passed.');
      }
      isLate = true;
    }

    // Check existing submissions & attempts
    const existingSubmission = await Submission.findOne({
      tenantId: req.tenantId,
      assignmentId,
      studentId
    }).sort({ attemptNumber: -1 });

    let attemptNumber = 1;
    
    if (existingSubmission) {
      if (!assignment.allowResubmission) {
        throw new ValidationError('Resubmission is not allowed for this assignment.');
      }
      if (existingSubmission.attemptNumber >= assignment.maxAttempts) {
        throw new ValidationError(`Maximum attempts (${assignment.maxAttempts}) reached.`);
      }
      attemptNumber = existingSubmission.attemptNumber + 1;
    }

    const submission = await Submission.create({
      tenantId: req.tenantId,
      assignmentId,
      studentId,
      attemptNumber,
      content,
      attachments,
      status: isLate ? 'LATE' : 'SUBMITTED',
      submittedAt: now,
      isLate
    });

    sendResponse({ res, status: 201, message: 'Assignment submitted successfully', data: submission });
  } catch (error) {
    next(error);
  }
};

export const getSubmissionsByAssignment = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const { assignmentId } = req.params;
    
    const assignment = await Assignment.findOne({ _id: assignmentId, tenantId: req.tenantId });
    if (!assignment) throw new NotFoundError('Assignment not found');
    
    // Teacher auth check
    if (['TEACHER', 'CLASS_TEACHER'].includes(req.user.role)) {
      if (assignment.teacherId.toString() !== req.user.employeeId?.toString()) {
        throw new ForbiddenError('You can only view submissions for your own assignments.');
      }
    }

    const submissions = await Submission.find({ tenantId: req.tenantId, assignmentId })
      .populate('studentId', 'firstName lastName admissionNumber profilePicture')
      .sort({ submittedAt: -1 });

    sendResponse({ res, message: 'Submissions fetched successfully', data: submissions });
  } catch (error) {
    next(error);
  }
};

export const evaluateSubmission = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const { submissionId } = req.params;
    const { marks, grade, generalFeedback, privateFeedback, rubricScores, status } = req.body;

    const submission = await Submission.findOne({ _id: submissionId, tenantId: req.tenantId })
      .populate('assignmentId');
      
    if (!submission) throw new NotFoundError('Submission not found');
    
    const assignment = submission.assignmentId as any;

    // Teacher auth check
    if (['TEACHER', 'CLASS_TEACHER'].includes(req.user.role)) {
      if (assignment.teacherId.toString() !== req.user.employeeId?.toString()) {
        throw new ForbiddenError('You can only evaluate submissions for your own assignments.');
      }
    }

    // Validate marks
    if (marks !== undefined && marks > assignment.maxMarks) {
      throw new ValidationError(`Marks cannot exceed the maximum marks (${assignment.maxMarks})`);
    }

    submission.evaluation = {
      marks,
      grade,
      generalFeedback,
      privateFeedback,
      rubricScores
    };
    
    submission.status = status || 'EVALUATED';
    submission.evaluatedBy = req.user.employeeId;
    submission.evaluatedAt = new Date();
    
    await submission.save();

    sendResponse({ res, message: 'Submission evaluated successfully', data: submission });
  } catch (error) {
    next(error);
  }
};

export const getMySubmissions = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const studentProfile = await require('../../students/models/StudentProfile.model').default.findOne({ userId: req.user._id, tenantId: req.tenantId, status: 'ACTIVE' });
      const studentId = studentProfile ? studentProfile._id : null;
    if (!studentId) {
      throw new ForbiddenError('Only students can view their submissions.');
    }
    const submissions = await Submission.find({ tenantId: req.tenantId, studentId });
    sendResponse({ res, message: 'My submissions fetched', data: submissions });
  } catch (error) {
    next(error);
  }
};

