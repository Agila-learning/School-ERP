import { Response, NextFunction } from 'express';
import { TenantRequest } from '../../../core/middlewares/tenant.middleware';
import Employee from '../models/Employee.model';
import TeacherProfile from '../models/TeacherProfile.model';
import TeacherAssignment from '../../academic/models/TeacherAssignment.model';
import ClassTeacherAssignment from '../../academic/models/ClassTeacherAssignment.model';
import { NotFoundError } from '../../../core/errors/AppError';
import { sendResponse } from '../../../core/utils/response.util';
import mongoose from 'mongoose';

// @desc    Get all teachers
// @route   GET /api/v1/hr/teachers
// @access  Private (Admin/HR)
export const getTeachers = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const query: any = { tenantId: req.tenantId };
    
    // Look up all employees who have a TeacherProfile.
    const teacherProfiles = await TeacherProfile.find({ tenantId: req.tenantId }).select('employeeId');
    const teacherEmployeeIds = teacherProfiles.map((tp: any) => tp.employeeId);

    query._id = { $in: teacherEmployeeIds };

    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search as string, 'i');
      query.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { employeeIdNumber: searchRegex },
        { email: searchRegex }
      ];
    }

    if (req.query.status) {
      query.status = req.query.status;
    }

    const teachers = await Employee.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Employee.countDocuments(query);

    sendResponse({ 
      res, 
      message: 'Teachers fetched successfully', 
      data: {
        teachers,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get teacher by ID
// @route   GET /api/v1/hr/teachers/:id
// @access  Private
export const getTeacherById = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const employee = await Employee.findOne({ _id: req.params.id, tenantId: req.tenantId });
    if (!employee) {
      throw new NotFoundError('Teacher not found');
    }

    const profile = await TeacherProfile.findOne({ employeeId: employee._id, tenantId: req.tenantId });
    const assignments = await TeacherAssignment.find({ teacherId: employee._id, tenantId: req.tenantId })
      .populate('classId', 'name')
      .populate('sectionId', 'name')
      .populate('subjectId', 'name code');
      
    const classTeacherAssignments = await ClassTeacherAssignment.find({ teacherId: employee._id, tenantId: req.tenantId })
      .populate('classId', 'name')
      .populate('sectionId', 'name');

    sendResponse({ 
      res, 
      message: 'Teacher fetched successfully', 
      data: { employee, profile, assignments, classTeacherAssignments } 
    });
  } catch (error) {
    next(error);
  }
};
