import { Response, NextFunction } from 'express';
import { TenantRequest } from '../../../core/middlewares/tenant.middleware';
import LearningMaterial from '../models/LearningMaterial.model';
import TeacherAssignment from '../models/TeacherAssignment.model';
import { sendResponse } from '../../../core/utils/response.util';
import { ForbiddenError, NotFoundError } from '../../../core/errors/AppError';

export const createLearningMaterial = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const { classId, subjectId } = req.body;

    if (['TEACHER', 'CLASS_TEACHER'].includes(req.user.role)) {
      const isAssigned = await TeacherAssignment.findOne({
        tenantId: req.tenantId,
        teacherId: req.user.employeeId,
        classId,
        subjectId
      });
      
      if (!isAssigned) {
        throw new ForbiddenError('You are not authorized to upload materials for this class/subject.');
      }
    }

    let teacherId = req.body.teacherId || req.user.employeeId;
    if (!teacherId) {
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

    const material = await LearningMaterial.create({
      ...req.body,
      tenantId: req.tenantId,
      url: req.body.url || req.body.fileUrl || '',
      teacherId
    });

    sendResponse({ res, status: 201, message: 'Learning material uploaded successfully', data: material });
  } catch (error) {
    next(error);
  }
};

export const getLearningMaterials = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const { classId, subjectId, chapterId, topicId, status } = req.query;
    
    const query: any = { tenantId: req.tenantId };
    if (classId) query.classId = classId;
    if (subjectId) query.subjectId = subjectId;
    if (chapterId) query.chapterId = chapterId;
    if (topicId) query.topicId = topicId;
    if (status) query.status = status;

    if (req.user.role === 'STUDENT') {
      query.status = 'PUBLISHED';
    }

    const materials = await LearningMaterial.find(query)
      .populate('subjectId', 'name')
      .populate('chapterId', 'name')
      .populate('teacherId', 'firstName lastName')
      .sort({ createdAt: -1 });

    sendResponse({ res, message: 'Learning materials fetched successfully', data: materials });
  } catch (error) {
    next(error);
  }
};

export const deleteLearningMaterial = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const material = await LearningMaterial.findOne({ _id: req.params.id, tenantId: req.tenantId });
    if (!material) throw new NotFoundError('Learning material not found');

    if (['TEACHER', 'CLASS_TEACHER'].includes(req.user.role)) {
      if (material.teacherId.toString() !== req.user.employeeId?.toString()) {
        throw new ForbiddenError('You can only delete your own materials.');
      }
    }

    await (material as any).softDelete();
    
    sendResponse({ res, message: 'Learning material deleted successfully' });
  } catch (error) {
    next(error);
  }
};
