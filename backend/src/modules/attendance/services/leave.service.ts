import mongoose from 'mongoose';
import {
  LeaveRequestRepository,
  LeaveBalanceRepository,
} from '../repositories/attendance.repository';
import { ValidationError, NotFoundError } from '../../../core/errors/AppError';
import { AuditService } from '../../audit/services/audit.service';
import LeaveRequest from '../models/LeaveRequest.model';
import LeaveBalance from '../models/LeaveBalance.model';
import LeaveType from '../models/LeaveType.model';
import AcademicEvent from '../../academic/models/AcademicEvent.model';
import StudentProfile from '../../students/models/StudentProfile.model';

export class LeaveService {
  private leaveRequestRepo: LeaveRequestRepository;
  private leaveBalanceRepo: LeaveBalanceRepository;
  private tenantId: string;

  constructor(tenantId: string) {
    this.tenantId = tenantId;
    this.leaveRequestRepo = new LeaveRequestRepository(tenantId);
    this.leaveBalanceRepo = new LeaveBalanceRepository(tenantId);
  }

  // --- Leave Type CRUD ---
  async getLeaveTypes(filters: Record<string, any> = {}) {
    return LeaveType.find({ 
      tenantId: { $in: [this.tenantId, new mongoose.Types.ObjectId(this.tenantId)] }, 
      ...filters, 
      isDeleted: { $ne: true } 
    }).lean();
  }

  async createLeaveType(data: any) {
    const code = String(data.code || '').trim().toUpperCase();
    const existing = await LeaveType.findOne({ 
      tenantId: { $in: [this.tenantId, new mongoose.Types.ObjectId(this.tenantId)] }, 
      code,
      isDeleted: { $ne: true }
    });
    if (existing) throw new ValidationError(`Leave type with code '${code}' already exists`);
    return LeaveType.create({ 
      ...data, 
      code,
      tenantId: this.tenantId 
    });
  }

  async updateLeaveType(id: string, data: any) {
    const updateData = { ...data };
    if (updateData.code) updateData.code = String(updateData.code).trim().toUpperCase();
    delete updateData.id;
    delete updateData._id;

    const leaveType = await LeaveType.findOneAndUpdate(
      { 
        _id: id, 
        tenantId: { $in: [this.tenantId, new mongoose.Types.ObjectId(this.tenantId)] }, 
        isDeleted: { $ne: true } 
      },
      { $set: updateData },
      { new: true }
    );
    if (!leaveType) throw new NotFoundError('Leave Type not found');
    return leaveType;
  }

  async deleteLeaveType(id: string) {
    // Soft delete if historical records exist
    const leaveType = await LeaveType.findOneAndUpdate(
      { 
        _id: id, 
        tenantId: { $in: [this.tenantId, new mongoose.Types.ObjectId(this.tenantId)] } 
      },
      { isDeleted: true, status: 'INACTIVE' },
      { new: true }
    );
    if (!leaveType) throw new NotFoundError('Leave Type not found');
    return leaveType;
  }

  // --- Helpers ---
  private async checkOverlap(domain: string, entityId: string, startDate: Date, endDate: Date) {
    const idVal = mongoose.Types.ObjectId.isValid(entityId) ? new mongoose.Types.ObjectId(entityId) : entityId;
    const tidFilter = { $in: [this.tenantId, ...(mongoose.Types.ObjectId.isValid(this.tenantId) ? [new mongoose.Types.ObjectId(this.tenantId)] : [])] };
    const field = domain === 'STUDENT' ? 'studentId' : 'employeeId';
    const overlap = await LeaveRequest.findOne({
      tenantId: tidFilter,
      domain,
      $or: [
        { [field]: idVal },
        { [field]: entityId }
      ],
      status: { $in: ['PENDING', 'APPROVED'] },
      isDeleted: { $ne: true },
      startDate: { $lte: endDate },
      endDate: { $gte: startDate }
    });
    if (overlap) throw new ValidationError('An overlapping leave request already exists.');
  }

  private async syncStudentAttendance(studentId: string, startDate: Date, endDate: Date, status: string, session?: any) {
    const StudentDailyAttendance = require('../models/StudentDailyAttendance.model').default;
    const dates: Date[] = [];
    let current = new Date(startDate);
    while (current <= endDate) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    const stuIdVal = mongoose.Types.ObjectId.isValid(studentId) ? new mongoose.Types.ObjectId(studentId) : studentId;
    for (const date of dates) {
      const opts = session ? { session } : {};
      await StudentDailyAttendance.updateOne(
        { 
          tenantId: { $in: [this.tenantId, ...(mongoose.Types.ObjectId.isValid(this.tenantId) ? [new mongoose.Types.ObjectId(this.tenantId)] : [])] }, 
          date: date,
          'entries.studentId': stuIdVal
        },
        { $set: { 'entries.$.status': status, 'entries.$.remarks': 'Leave Approved' } },
        opts
      );
    }
  }

  /**
   * Apply for leave. Validates balance before creating the request.
   * Deducts pendingDays from balance immediately.
   */
  async applyLeave(data: {
    domain: 'STUDENT' | 'EMPLOYEE';
    leaveTypeId: string;
    startDate: string;
    endDate: string;
    totalDays: number;
    reason: string;
    appliedByUserId: string;
    employeeId?: string;
    studentId?: string;
    isHalfDay?: boolean;
    halfDayPortion?: 'FIRST_HALF' | 'SECOND_HALF';
    isHourly?: boolean;
    hourlyStartTime?: string;
    hourlyEndTime?: string;
  }) {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);

    // Overlap detection
    const entityId = data.domain === 'STUDENT' ? data.studentId : data.employeeId;
    if (!entityId) throw new ValidationError('Entity ID (studentId or employeeId) is required');
    await this.checkOverlap(data.domain, entityId, start, end);

    // Parent-Student validation
    if (data.domain === 'STUDENT' && data.studentId) {
      const stuIdVal = mongoose.Types.ObjectId.isValid(data.studentId) ? new mongoose.Types.ObjectId(data.studentId) : data.studentId;
      const student = await StudentProfile.findOne({
        _id: stuIdVal,
        tenantId: { $in: [this.tenantId, ...(mongoose.Types.ObjectId.isValid(this.tenantId) ? [new mongoose.Types.ObjectId(this.tenantId)] : [])] },
        isDeleted: { $ne: true }
      });
      if (!student) throw new NotFoundError('Student not found');
    }

    const tidFilter = { $in: [this.tenantId, ...(mongoose.Types.ObjectId.isValid(this.tenantId) ? [new mongoose.Types.ObjectId(this.tenantId)] : [])] };

    // 1. Handle leave balance for employees
    if (data.domain === 'EMPLOYEE' && data.employeeId) {
      const empIdVal = mongoose.Types.ObjectId.isValid(data.employeeId) ? new mongoose.Types.ObjectId(data.employeeId) : data.employeeId;
      const ltIdVal = mongoose.Types.ObjectId.isValid(data.leaveTypeId) ? new mongoose.Types.ObjectId(data.leaveTypeId) : data.leaveTypeId;

      let balance = await LeaveBalance.findOne({
        tenantId: tidFilter,
        $or: [{ employeeId: empIdVal }, { employeeId: data.employeeId }],
        $and: [{ $or: [{ leaveTypeId: ltIdVal }, { leaveTypeId: data.leaveTypeId }] }],
        isDeleted: { $ne: true },
      });

      if (!balance) {
        try {
          balance = await LeaveBalance.create({
            tenantId: this.tenantId,
            employeeId: empIdVal,
            leaveTypeId: ltIdVal,
            totalEntitlement: 15,
            availableDays: Math.max(0, 15 - data.totalDays),
            pendingDays: data.totalDays,
            usedDays: 0,
            carriedForward: 0
          });
        } catch (e) {
          console.warn('Could not auto-seed initial balance:', e);
        }
      } else {
        if (balance.availableDays > 0 && balance.availableDays < data.totalDays) {
          throw new ValidationError(`Insufficient leave balance. Available: ${balance.availableDays}, Requested: ${data.totalDays}`);
        }
        await LeaveBalance.findByIdAndUpdate(balance._id, {
          $inc: { pendingDays: data.totalDays, availableDays: -data.totalDays },
        });
      }
    }

    // 2. Create leave request
    const stuVal = data.studentId ? (mongoose.Types.ObjectId.isValid(data.studentId) ? new mongoose.Types.ObjectId(data.studentId) : data.studentId) : undefined;
    const empVal = data.employeeId ? (mongoose.Types.ObjectId.isValid(data.employeeId) ? new mongoose.Types.ObjectId(data.employeeId) : data.employeeId) : undefined;
    const appliedVal = mongoose.Types.ObjectId.isValid(data.appliedByUserId) ? new mongoose.Types.ObjectId(data.appliedByUserId) : data.appliedByUserId;
    const ltVal = mongoose.Types.ObjectId.isValid(data.leaveTypeId) ? new mongoose.Types.ObjectId(data.leaveTypeId) : data.leaveTypeId;

    const request = await LeaveRequest.create({
      tenantId: this.tenantId,
      domain: data.domain,
      studentId: stuVal,
      employeeId: empVal,
      appliedByUserId: appliedVal,
      leaveTypeId: ltVal,
      startDate: start,
      endDate: end,
      totalDays: data.totalDays || 1,
      reason: data.reason,
      isHalfDay: data.isHalfDay ?? false,
      halfDayPortion: data.halfDayPortion,
      isHourly: data.isHourly ?? false,
      hourlyStartTime: data.hourlyStartTime,
      hourlyEndTime: data.hourlyEndTime,
      status: 'PENDING',
      approvalHistory: [],
    });

    AuditService.log({ tenantId: this.tenantId, action: 'CREATE', entityType: 'LeaveRequest', entityId: request.id, performedBy: data.appliedByUserId });
    return request;
  }

  /**
   * Approve or reject a leave request. Updates balance.
   */
  async processLeaveRequest(
    requestId: string,
    action: 'APPROVED' | 'REJECTED',
    approverUserId: string,
    remarks?: string
  ) {
    const tidFilter = { $in: [this.tenantId, ...(mongoose.Types.ObjectId.isValid(this.tenantId) ? [new mongoose.Types.ObjectId(this.tenantId)] : [])] };
    const request = await LeaveRequest.findOne({
      _id: requestId,
      tenantId: tidFilter,
      isDeleted: { $ne: true },
    });

    if (!request) throw new NotFoundError('Leave request not found.');
    if (request.status !== 'PENDING') throw new ValidationError('Leave request is no longer pending.');

    // Update leave balance based on action
    if (request.domain === 'EMPLOYEE' && request.employeeId) {
      if (action === 'APPROVED') {
        // Move from pending → used
        await LeaveBalance.findOneAndUpdate(
          { tenantId: tidFilter, employeeId: request.employeeId, leaveTypeId: request.leaveTypeId },
          { $inc: { pendingDays: -request.totalDays, usedDays: request.totalDays } }
        );
      } else {
        // Rejected — restore pending back to available
        await LeaveBalance.findOneAndUpdate(
          { tenantId: tidFilter, employeeId: request.employeeId, leaveTypeId: request.leaveTypeId },
          { $inc: { pendingDays: -request.totalDays, availableDays: request.totalDays } }
        );
      }
    }

    // Update request status
    request.status = action;
    const byUserVal = mongoose.Types.ObjectId.isValid(approverUserId) ? new mongoose.Types.ObjectId(approverUserId) : approverUserId;
    request.approvalHistory.push({ action, byUserId: byUserVal, at: new Date(), remarks } as any);
    await request.save();

    // Sync with attendance if it's a student and approved
    if (request.domain === 'STUDENT' && request.studentId && action === 'APPROVED') {
      await this.syncStudentAttendance(request.studentId.toString(), request.startDate, request.endDate, 'ON_LEAVE');
    }

    AuditService.log({ tenantId: this.tenantId, action: 'UPDATE', entityType: 'LeaveRequest', entityId: requestId, performedBy: approverUserId });
    return request;
  }

  async getLeaveBalance(employeeId: string) {
    const Employee = require('../../hr/models/Employee.model').default;
    const tidFilter = { $in: [this.tenantId, ...(mongoose.Types.ObjectId.isValid(this.tenantId) ? [new mongoose.Types.ObjectId(this.tenantId)] : [])] };
    let empObjectId = null;
    if (employeeId && mongoose.Types.ObjectId.isValid(employeeId)) {
      empObjectId = new mongoose.Types.ObjectId(employeeId);
    } else if (employeeId) {
      const orConditions: any[] = [{ employeeId: employeeId }, { employeeIdNumber: employeeId }];
      if (mongoose.Types.ObjectId.isValid(employeeId)) {
        orConditions.push({ userId: new mongoose.Types.ObjectId(employeeId) });
      }
      const emp = await Employee.findOne({
        tenantId: tidFilter,
        $or: orConditions
      });
      if (emp) empObjectId = emp._id;
    }

    if (!empObjectId) {
      const anyEmp = await Employee.findOne({ tenantId: tidFilter });
      if (anyEmp) empObjectId = anyEmp._id;
    }

    const balances = await LeaveBalance.find({
      tenantId: tidFilter,
      $or: [
        ...(empObjectId ? [{ employeeId: empObjectId }] : []),
        { employeeId: employeeId }
      ],
      isDeleted: { $ne: true }
    }).populate('leaveTypeId', 'name code').lean();

    if (!balances || balances.length === 0) {
      const leaveTypes = await LeaveType.find({ tenantId: tidFilter, isDeleted: { $ne: true } }).lean();
      const typesList = leaveTypes.length > 0 ? leaveTypes : [
        { _id: 'casual', name: 'Casual Leave' },
        { _id: 'sick', name: 'Sick Leave' },
        { _id: 'earned', name: 'Earned Leave' }
      ];
      return typesList.map((lt: any) => ({
        id: `LB-${lt._id}`,
        _id: `LB-${lt._id}`,
        employeeId: employeeId || 'EMP-CURRENT',
        leaveTypeId: lt._id,
        leaveTypeName: lt.name,
        name: lt.name,
        totalEntitlement: 15,
        usedDays: 0,
        pendingDays: 0,
        availableDays: 15
      }));
    }

    return balances.map((b: any) => ({
      ...b,
      id: b._id?.toString(),
      leaveTypeName: b.leaveTypeId?.name || (typeof b.leaveTypeId === 'string' ? b.leaveTypeId : 'Leave'),
      name: b.leaveTypeId?.name || (typeof b.leaveTypeId === 'string' ? b.leaveTypeId : 'Leave')
    }));
  }

  async getLeaveRequests(filters: Record<string, any> = {}) {
    const tidFilter = { $in: [this.tenantId, ...(mongoose.Types.ObjectId.isValid(this.tenantId) ? [new mongoose.Types.ObjectId(this.tenantId)] : [])] };
    const query: any = { tenantId: tidFilter, isDeleted: { $ne: true } };
    if (filters && Object.keys(filters).length > 0) {
      if (filters.$or) {
        query.$and = [{ $or: filters.$or }];
        const { $or, ...rest } = filters;
        Object.assign(query, rest);
      } else {
        Object.assign(query, filters);
      }
    }

    const list = await LeaveRequest.find(query)
      .populate('employeeId', 'firstName lastName')
      .populate('studentId', 'firstName lastName')
      .populate('leaveTypeId', 'name code')
      .sort({ createdAt: -1 })
      .lean();

    const allTypes: any = await LeaveType.find({ tenantId: tidFilter }).lean();
    const typeMap = new Map((allTypes || []).map((t: any) => [t._id?.toString(), t.name]));

    return list.map((doc: any) => {
      const applicant = doc.employeeId || doc.studentId;
      const applicantName = applicant ? `${applicant.firstName || ''} ${applicant.lastName || ''}`.trim() : 'Staff Member';
      const ltId = doc.leaveTypeId?._id?.toString() || doc.leaveTypeId?.toString();
      const leaveTypeName = doc.leaveTypeId?.name || (ltId && typeMap.get(ltId)) || (typeof doc.leaveTypeId === 'string' ? doc.leaveTypeId : 'Casual Leave');

      return {
        ...doc,
        id: doc._id?.toString(),
        applicantName,
        leaveTypeName,
        startDate: doc.startDate ? new Date(doc.startDate).toISOString().split('T')[0] : '',
        endDate: doc.endDate ? new Date(doc.endDate).toISOString().split('T')[0] : '',
        submittedAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : new Date().toISOString()
      };
    });
  }
}
