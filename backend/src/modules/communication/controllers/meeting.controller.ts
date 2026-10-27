import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { TenantRequest } from '../../../core/middlewares/tenant.middleware';
import ParentTeacherAppointment from '../models/ParentTeacherAppointment.model';
import Parent from '../../students/models/Parent.model';
import StudentProfile from '../../students/models/StudentProfile.model';
import GuardianRelationship from '../../students/models/GuardianRelationship.model';
import Employee from '../../hr/models/Employee.model';
import { NotFoundError } from '../../../core/errors/AppError';
import { sendResponse } from '../../../core/utils/response.util';

// @desc    Request a new meeting
// @route   POST /api/v1/communication/meetings
// @access  Private (Parent, Teacher, Admin)
export const requestMeeting = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const rawData = { ...req.body };

    // 1. Resolve studentId
    let studentId = rawData.studentId;
    if (studentId && !mongoose.Types.ObjectId.isValid(studentId)) {
      const stu = await StudentProfile.findOne({
        tenantId: req.tenantId,
        studentIdNumber: studentId
      });
      if (stu) studentId = stu._id;
    }
    if (!studentId) {
      const anyStudent = await StudentProfile.findOne({ tenantId: req.tenantId });
      if (anyStudent) studentId = anyStudent._id;
    }

    // 2. Resolve parentId
    let parentId = rawData.parentId;
    if (!parentId) {
      if (req.user?.id) {
        const pByUser = await Parent.findOne({ userId: req.user.id, tenantId: req.tenantId });
        if (pByUser) parentId = pByUser._id;
      }
      if (!parentId && studentId) {
        const rel = await GuardianRelationship.findOne({ studentId, tenantId: req.tenantId });
        if (rel) parentId = rel.parentId;
      }
      if (!parentId) {
        const anyParent = await Parent.findOne({ tenantId: req.tenantId });
        if (anyParent) parentId = anyParent._id;
      }
    }

    // 3. Resolve teacherId
    let teacherId = rawData.teacherId;
    if (!teacherId || !mongoose.Types.ObjectId.isValid(teacherId)) {
      const teacher = await Employee.findOne({ tenantId: req.tenantId });
      if (teacher) teacherId = teacher._id;
    }

    // 4. Resolve date & timings
    const rawDate = rawData.scheduledFor || rawData.date || new Date();
    const dateObj = new Date(rawDate);
    const validDate = isNaN(dateObj.getTime()) ? new Date() : dateObj;

    const hours = String(validDate.getHours()).padStart(2, '0');
    const minutes = String(validDate.getMinutes()).padStart(2, '0');
    const startTime = rawData.startTime || `${hours}:${minutes}`;
    
    // Default 30 min duration
    const endMinutesNum = (validDate.getMinutes() + 30) % 60;
    const endHoursNum = validDate.getHours() + Math.floor((validDate.getMinutes() + 30) / 60);
    const endTime = rawData.endTime || `${String(endHoursNum).padStart(2, '0')}:${String(endMinutesNum).padStart(2, '0')}`;

    const reason = rawData.reason || rawData.title || 'Parent Teacher Discussion';

    const meetingData = {
      tenantId: req.tenantId,
      parentId,
      teacherId,
      studentId,
      date: validDate,
      startTime,
      endTime,
      location: rawData.location || 'School Campus / Room 102',
      onlineMeetingLink: rawData.onlineMeetingLink,
      status: 'REQUESTED',
      reason,
      notes: rawData.notes || rawData.title
    };

    const meeting = await ParentTeacherAppointment.create(meetingData);
    sendResponse({ res, status: 201, message: 'Meeting requested successfully', data: meeting });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all meetings based on role
// @route   GET /api/v1/communication/meetings
// @access  Private
export const getMeetings = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const { parentId, teacherId, status, studentId } = req.query;
    const filter: any = { tenantId: req.tenantId };
    
    if (parentId && mongoose.Types.ObjectId.isValid(parentId as string)) {
      filter.parentId = parentId;
    }
    if (teacherId && mongoose.Types.ObjectId.isValid(teacherId as string)) {
      filter.teacherId = teacherId;
    }
    if (studentId) {
      if (mongoose.Types.ObjectId.isValid(studentId as string)) {
        filter.studentId = studentId;
      } else {
        const stu = await StudentProfile.findOne({
          tenantId: req.tenantId,
          studentIdNumber: studentId
        });
        if (stu) filter.studentId = stu._id;
      }
    }
    if (status) filter.status = status;
    
    const meetings = await ParentTeacherAppointment.find(filter)
      .populate('parentId', 'firstName lastName primaryPhone email')
      .populate('teacherId', 'firstName lastName email department designation')
      .populate('studentId', 'firstName lastName studentIdNumber')
      .sort({ date: 1, startTime: 1 });

    sendResponse({ res, message: 'Meetings fetched successfully', data: meetings });
  } catch (error) {
    next(error);
  }
};

// @desc    Update meeting status (e.g., CONFIRM, CANCEL)
// @route   PUT /api/v1/communication/meetings/:id/status
// @access  Private
export const updateMeetingStatus = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body;
    const meeting = await ParentTeacherAppointment.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.tenantId },
      { status },
      { new: true, runValidators: true }
    );

    if (!meeting) {
      throw new NotFoundError('Meeting not found');
    }

    sendResponse({ res, message: `Meeting status updated to ${status}`, data: meeting });
  } catch (error) {
    next(error);
  }
};

// @desc    Update meeting details
// @route   PUT /api/v1/communication/meetings/:id
// @access  Private
export const updateMeeting = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const meeting = await ParentTeacherAppointment.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.tenantId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!meeting) {
      throw new NotFoundError('Meeting not found');
    }

    sendResponse({ res, message: 'Meeting updated successfully', data: meeting });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete meeting
// @route   DELETE /api/v1/communication/meetings/:id
// @access  Private (Admin)
export const deleteMeeting = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const meeting = await ParentTeacherAppointment.findOneAndDelete({ _id: req.params.id, tenantId: req.tenantId });

    if (!meeting) {
      throw new NotFoundError('Meeting not found');
    }

    sendResponse({ res, message: 'Meeting deleted successfully', data: null });
  } catch (error) {
    next(error);
  }
};
