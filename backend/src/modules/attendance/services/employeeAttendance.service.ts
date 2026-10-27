import mongoose from 'mongoose';
import {
  AttendanceEventRepository,
  EmployeeDailyAttendanceRepository,
  EmployeeShiftAssignmentRepository,
} from '../repositories/attendance.repository';
import { AuditService } from '../../audit/services/audit.service';
import { ValidationError } from '../../../core/errors/AppError';
import AttendanceEvent from '../models/AttendanceEvent.model';
import EmployeeDailyAttendance from '../models/EmployeeDailyAttendance.model';

export class EmployeeAttendanceService {
  private eventRepo: AttendanceEventRepository;
  private dailyRepo: EmployeeDailyAttendanceRepository;
  private shiftAssignRepo: EmployeeShiftAssignmentRepository;
  private tenantId: string;

  constructor(tenantId: string) {
    this.tenantId = tenantId;
    this.eventRepo = new AttendanceEventRepository(tenantId);
    this.dailyRepo = new EmployeeDailyAttendanceRepository(tenantId);
    this.shiftAssignRepo = new EmployeeShiftAssignmentRepository(tenantId);
  }

  /**
   * Record a check-in event and update the daily summary.
   */
  async checkIn(employeeId: string, data: { source?: string; latitude?: number; longitude?: number; remarks?: string }) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Prevent double check-in on same day
    const existingEvent = await AttendanceEvent.findOne({
      tenantId: this.tenantId,
      employeeId: new mongoose.Types.ObjectId(employeeId),
      eventType: 'CHECK_IN',
      timestamp: { $gte: today },
      isDeleted: { $ne: true },
    });
    if (existingEvent) throw new ValidationError('Employee has already checked in today.');

    // Reject if Employee is on Leave
    const LeaveRequest = mongoose.models['LeaveRequest'] || mongoose.model('LeaveRequest');
    const onLeave = await LeaveRequest.findOne({
      tenantId: this.tenantId,
      domain: 'EMPLOYEE',
      employeeId: new mongoose.Types.ObjectId(employeeId),
      status: 'APPROVED',
      startDate: { $lte: today },
      endDate: { $gte: today }
    });
    if (onLeave) throw new ValidationError('Cannot check-in while on approved leave.');

    // Reject if Holiday
    const HolidayCalendar = mongoose.models['HolidayCalendar'] || mongoose.model('HolidayCalendar');
    const isHoliday = await HolidayCalendar.findOne({
      tenantId: this.tenantId,
      date: today,
      isDeleted: { $ne: true }
    });
    if (isHoliday) throw new ValidationError(`Cannot check-in on a holiday: ${isHoliday.name}`);

    // 1. Record raw event (immutable)
    const event = await this.eventRepo.create({
      employeeId: new mongoose.Types.ObjectId(employeeId),
      eventType: 'CHECK_IN',
      timestamp: now,
      source: (data.source || 'WEB') as any,
      latitude: data.latitude,
      longitude: data.longitude,
      remarks: data.remarks,
    } as any);

    // 2. Get active shift assignment to determine late status
    const shiftAssignment = await this.shiftAssignRepo.findOne({
      employeeId: new mongoose.Types.ObjectId(employeeId),
      effectiveFrom: { $lte: today },
      $or: [{ effectiveTo: null }, { effectiveTo: { $gte: today } }],
    });

    let isLate = false;
    if (shiftAssignment) {
      // Compare check-in time against shift start + grace
      const [shiftHour, shiftMin] = (shiftAssignment as any).shiftId?.startTime?.split(':').map(Number) ?? [9, 0];
      const shiftStart = new Date(today);
      shiftStart.setHours(shiftHour, shiftMin, 0, 0);
      const gracePeriodMs = ((shiftAssignment as any).shiftId?.gracePeriodMinutes ?? 10) * 60 * 1000;
      isLate = now.getTime() > (shiftStart.getTime() + gracePeriodMs);
    }

    // 3. Upsert daily summary
    await EmployeeDailyAttendance.findOneAndUpdate(
      { tenantId: this.tenantId, employeeId: new mongoose.Types.ObjectId(employeeId), date: today },
      {
        $set: {
          checkInTime: now,
          status: isLate ? 'LATE' : 'PRESENT',
          isLate,
          shiftId: (shiftAssignment as any)?.shiftId,
        },
      },
      { upsert: true, new: true }
    );

    AuditService.log({ tenantId: this.tenantId, action: 'CREATE', entityType: 'AttendanceEvent', entityId: event.id, performedBy: employeeId });
    return { event, isLate };
  }

  /**
   * Record a check-out event and compute work duration server-side.
   */
  async checkOut(employeeId: string, data: { source?: string; latitude?: number; longitude?: number; remarks?: string }) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Verify check-in exists today
    const checkInEvent = await AttendanceEvent.findOne({
      tenantId: this.tenantId,
      employeeId: new mongoose.Types.ObjectId(employeeId),
      eventType: 'CHECK_IN',
      timestamp: { $gte: today },
      isDeleted: { $ne: true },
    });
    if (!checkInEvent) throw new ValidationError('No check-in found for today. Cannot check out.');

    // 1. Record raw event
    const event = await this.eventRepo.create({
      employeeId: new mongoose.Types.ObjectId(employeeId),
      eventType: 'CHECK_OUT',
      timestamp: now,
      source: (data.source || 'WEB') as any,
      latitude: data.latitude,
      longitude: data.longitude,
      remarks: data.remarks,
    } as any);

    // 2. Server-side work duration calculation — never trust client
    const workDurationMinutes = Math.floor((now.getTime() - checkInEvent.timestamp.getTime()) / 60000);

    // 3. Update daily summary with checkout and calculated duration
    await EmployeeDailyAttendance.findOneAndUpdate(
      { tenantId: this.tenantId, employeeId: new mongoose.Types.ObjectId(employeeId), date: today },
      {
        $set: {
          checkOutTime: now,
          workDurationMinutes,  // Server-calculated
        },
      },
      { new: true }
    );

    AuditService.log({ tenantId: this.tenantId, action: 'UPDATE', entityType: 'AttendanceEvent', entityId: event.id, performedBy: employeeId });
    return { event, workDurationMinutes };
  }

  /**
   * Get an employee's daily attendance status.
   */
  async getTodayStatus(employeeId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return this.dailyRepo.findOne({
      employeeId: new mongoose.Types.ObjectId(employeeId),
      date: today,
    });
  }
}
