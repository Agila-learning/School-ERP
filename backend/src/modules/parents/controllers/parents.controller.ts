import { Response, NextFunction } from 'express';
import { TenantRequest } from '../../../core/middlewares/tenant.middleware';
import Parent from '../../students/models/Parent.model';
import GuardianRelationship from '../../students/models/GuardianRelationship.model';
import StudentProfile from '../../students/models/StudentProfile.model';
import { NotFoundError, ValidationError } from '../../../core/errors/AppError';
import { sendResponse } from '../../../core/utils/response.util';
import mongoose from 'mongoose';
import User from '../../auth/models/User.model';
import Role from '../../auth/models/Role.model';
import bcrypt from 'bcryptjs';

// @desc    Get all parents
// @route   GET /api/v1/parents
// @access  Private (Admin)
export const getParents = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const query: any = { tenantId: req.tenantId };
    
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search as string, 'i');
      query.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { mobile: searchRegex },
        { email: searchRegex }
      ];
    }

    if (req.query.status) {
      query.accountStatus = req.query.status;
    }

    const parents = await Parent.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const parentIds = parents.map((p: any) => p._id);
    const relationships = await GuardianRelationship.find({
      parentId: { $in: parentIds },
      tenantId: req.tenantId
    }).populate('studentId', 'firstName lastName studentIdNumber photoUrl');

    const parentsWithChildren = parents.map((p: any) => {
      const rels = relationships.filter((r: any) => r.parentId?.toString() === p._id?.toString());
      return {
        ...p,
        children: rels.map((r: any) => r.studentId).filter(Boolean)
      };
    });

    const total = await Parent.countDocuments(query);

    sendResponse({ 
      res, 
      message: 'Parents fetched successfully', 
      data: {
        parents: parentsWithChildren,
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

// @desc    Get parent by ID
// @route   GET /api/v1/parents/:id
// @access  Private (Admin)
export const getParentById = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const parent = await Parent.findOne({ _id: req.params.id, tenantId: req.tenantId });
    if (!parent) {
      throw new NotFoundError('Parent not found');
    }

    // Fetch related students
    const relationships = await GuardianRelationship.find({ 
      parentId: parent._id, 
      tenantId: req.tenantId 
    }).populate('studentId', 'firstName lastName studentIdNumber currentEnrollmentId photoUrl');

    sendResponse({ 
      res, 
      message: 'Parent fetched successfully', 
      data: { parent, relationships } 
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a parent
// @route   POST /api/v1/parents
// @access  Private (Admin)
export const createParent = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const parentData = { ...req.body, tenantId: req.tenantId };
    
    // Auto-generate familyId if not provided (this is simplified, ideally we link to an existing family)
    if (!parentData.familyId) {
      parentData.familyId = new mongoose.Types.ObjectId();
    }

    // Portal Account Creation
    if (req.body.createPortalAccount && req.body.email && req.body.password) {
      const parentRole = await Role.findOne({ name: 'Parent', tenantId: req.tenantId });
      if (parentRole) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);
        
        const user = await User.create({
          tenantId: req.tenantId,
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          email: req.body.email,
          password: hashedPassword,
          roleIds: [parentRole._id],
          accountStatus: 'active'
        });
        
        parentData.userId = user._id;
        parentData.accountStatus = 'ACTIVE';
      }
    }

    const parent = await Parent.create(parentData);
    sendResponse({ res, status: 201, message: 'Parent created successfully', data: parent });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a parent
// @route   PUT /api/v1/parents/:id
// @access  Private (Admin)
export const updateParent = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const parent = await Parent.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.tenantId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!parent) {
      throw new NotFoundError('Parent not found');
    }

    sendResponse({ res, message: 'Parent updated successfully', data: parent });
  } catch (error) {
    next(error);
  }
};

// @desc    Create Guardian Relationship (Link student)
// @route   POST /api/v1/parents/:id/relationships
// @access  Private (Admin)
export const createRelationship = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    let { studentId, relationshipType, ...permissions } = req.body;
    
    if (!studentId) {
      throw new ValidationError('Student ID is required');
    }

    // Resolve studentId: check if valid ObjectId or search by studentIdNumber
    let student = null;
    if (mongoose.Types.ObjectId.isValid(studentId)) {
      student = await StudentProfile.findOne({ _id: studentId, tenantId: req.tenantId });
    }
    if (!student) {
      student = await StudentProfile.findOne({
        tenantId: req.tenantId,
        $or: [
          { studentIdNumber: studentId },
          { studentIdNumber: new RegExp(`^${studentId.trim()}$`, 'i') }
        ]
      });
    }

    if (!student) {
      throw new NotFoundError(`Student not found with ID or Student Number '${studentId}'`);
    }

    const parent = await Parent.findOne({ _id: req.params.id, tenantId: req.tenantId });
    if (!parent) {
      throw new NotFoundError('Parent not found');
    }

    // Normalise relationshipType
    const validEnums = ['Father', 'Mother', 'Guardian', 'Grandparent', 'Parent', 'Other'];
    if (!relationshipType || !validEnums.includes(relationshipType)) {
      relationshipType = validEnums.includes(parent.relationship) ? parent.relationship : 'Parent';
    }

    // Check if duplicate relationship already exists
    const existing = await GuardianRelationship.findOne({
      tenantId: req.tenantId,
      parentId: parent._id,
      studentId: student._id
    });

    if (existing) {
      return sendResponse({ res, status: 200, message: 'Student is already linked to this parent', data: existing });
    }

    const relationship = await GuardianRelationship.create({
      tenantId: req.tenantId,
      parentId: parent._id,
      studentId: student._id,
      relationshipType,
      academicAccess: true,
      attendanceAccess: true,
      feeAccess: true,
      medicalAccess: true,
      documentAccess: true,
      communicationAccess: true,
      status: 'ACTIVE',
      ...permissions
    });

    sendResponse({ res, status: 201, message: 'Student linked successfully', data: relationship });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove Guardian Relationship (Unlink student)
// @route   DELETE /api/v1/parents/:id/relationships/:studentId
// @access  Private (Admin)
export const removeRelationship = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const relationship = await GuardianRelationship.findOneAndDelete({
      tenantId: req.tenantId,
      parentId: req.params.id,
      studentId: req.params.studentId
    });

    if (!relationship) {
      throw new NotFoundError('Relationship not found');
    }

    sendResponse({ res, message: 'Relationship removed successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Deactivate a parent
// @route   DELETE /api/v1/parents/:id
// @access  Private (Admin)
export const deactivateParent = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const parent = await Parent.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.tenantId },
      { status: 'INACTIVE', isActive: false },
      { new: true }
    );

    if (!parent) {
      throw new NotFoundError('Parent not found');
    }

    sendResponse({ res, message: 'Parent deactivated successfully', data: parent });
  } catch (error) {
    next(error);
  }
};
