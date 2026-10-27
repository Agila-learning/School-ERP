import { Response, NextFunction } from 'express';
import { TenantRequest } from '../../../core/middlewares/tenant.middleware';
import Homework from '../models/Homework.model';
import HomeworkSubmission from '../models/HomeworkSubmission.model';
import { NotFoundError } from '../../../core/errors/AppError';
import { sendResponse } from '../../../core/utils/response.util';

// @desc    Create a homework assignment
// @route   POST /api/v1/academic/homework
// @access  Private (Teacher, Admin)
export const createHomework = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const homeworkData = { ...req.body, tenantId: req.tenantId };
    
    // Default to the requesting user's ID as the teacher if they are a teacher
    if (!homeworkData.teacherId) {
       homeworkData.teacherId = req.user.employeeId; // Assuming employeeId is present for teachers
    }

    const homework = await Homework.create(homeworkData);
    sendResponse({ res, status: 201, message: 'Homework created successfully', data: homework });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all homework assignments for a specific class/section
// @route   GET /api/v1/academic/homework
// @access  Private
export const getHomeworks = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const { classId, sectionId, subjectId, teacherId } = req.query;
    const filter: any = { tenantId: req.tenantId };
    
    if (classId) filter.classId = classId;
    if (sectionId) filter.sectionId = sectionId;
    if (subjectId) filter.subjectId = subjectId;
    if (teacherId) filter.teacherId = teacherId;
    
    const homeworks = await Homework.find(filter)
      .populate('classId', 'name')
      .populate('sectionId', 'name')
      .populate('subjectId', 'name')
      .populate('teacherId', 'firstName lastName')
      .sort({ dueDate: 1 });

    sendResponse({ res, message: 'Homework assignments fetched successfully', data: homeworks });
  } catch (error) {
    next(error);
  }
};

// @desc    Get homework assignment by ID
// @route   GET /api/v1/academic/homework/:id
// @access  Private
export const getHomeworkById = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const homework = await Homework.findOne({ _id: req.params.id, tenantId: req.tenantId })
      .populate('classId', 'name')
      .populate('sectionId', 'name')
      .populate('subjectId', 'name')
      .populate('teacherId', 'firstName lastName');

    if (!homework) {
      throw new NotFoundError('Homework not found');
    }

    sendResponse({ res, message: 'Homework assignment fetched successfully', data: homework });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a homework assignment
// @route   PUT /api/v1/academic/homework/:id
// @access  Private (Teacher, Admin)
export const updateHomework = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const homework = await Homework.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.tenantId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!homework) {
      throw new NotFoundError('Homework not found');
    }

    sendResponse({ res, message: 'Homework updated successfully', data: homework });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete/Deactivate a homework assignment
// @route   DELETE /api/v1/academic/homework/:id
// @access  Private (Teacher, Admin)
export const deleteHomework = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const homework = await Homework.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.tenantId },
      { status: 'INACTIVE' },
      { new: true }
    );

    if (!homework) {
      throw new NotFoundError('Homework not found');
    }

    sendResponse({ res, message: 'Homework deactivated successfully', data: homework });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit homework
// @route   POST /api/v1/academic/homework/:id/submit
// @access  Private (Student)
export const submitHomework = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const homework = await Homework.findOne({ _id: req.params.id, tenantId: req.tenantId });
    if (!homework) throw new NotFoundError('Homework not found');

    const submissionData = {
      tenantId: req.tenantId,
      homeworkId: req.params.id,
      studentId: req.user.studentId, // Assuming studentId is attached to req.user for students
      content: req.body.content,
      attachments: req.body.attachments,
      status: 'SUBMITTED',
      submittedAt: new Date()
    };

    const submission = await HomeworkSubmission.findOneAndUpdate(
      { tenantId: req.tenantId, homeworkId: req.params.id, studentId: submissionData.studentId },
      submissionData,
      { new: true, upsert: true, runValidators: true }
    );

    sendResponse({ res, status: 201, message: 'Homework submitted successfully', data: submission });
  } catch (error) {
    next(error);
  }
};

// @desc    Grade homework submission
// @route   PUT /api/v1/academic/homework/submissions/:submissionId/grade
// @access  Private (Teacher, Admin)
export const gradeHomework = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const { grade, remarks } = req.body;
    
    const submission = await HomeworkSubmission.findOneAndUpdate(
      { _id: req.params.submissionId, tenantId: req.tenantId },
      { 
        status: 'GRADED', 
        grade, 
        remarks,
        gradedBy: req.user.employeeId,
        gradedAt: new Date()
      },
      { new: true, runValidators: true }
    );

    if (!submission) throw new NotFoundError('Homework submission not found');

    sendResponse({ res, message: 'Homework graded successfully', data: submission });
  } catch (error) {
    next(error);
  }
};

// @desc    Get homework submissions
// @route   GET /api/v1/academic/homework/:id/submissions
// @access  Private (Teacher, Admin)
export const getHomeworkSubmissions = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const submissions = await HomeworkSubmission.find({ homeworkId: req.params.id, tenantId: req.tenantId })
      .populate('studentId', 'firstName lastName admissionNumber')
      .sort({ submittedAt: -1 });

    sendResponse({ res, message: 'Homework submissions fetched successfully', data: submissions });
  } catch (error) {
    next(error);
  }
};

// @desc    Get my submissions
// @route   GET /api/v1/academic/homework/my-submissions
// @access  Private (Student)
export const getMySubmissions = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const submissions = await HomeworkSubmission.find({ 
      tenantId: req.tenantId,
      studentId: req.user.studentId
    });
    sendResponse({ res, message: 'My submissions fetched', data: submissions });
  } catch (error) {
    next(error);
  }
};
