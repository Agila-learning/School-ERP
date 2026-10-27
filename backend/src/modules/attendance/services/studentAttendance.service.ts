import mongoose from 'mongoose';
import {
  StudentDailyAttendanceRepository,
  AttendanceCorrectionRepository,
} from '../repositories/attendance.repository';
import { AuditService } from '../../audit/services/audit.service';
import { ValidationError, ForbiddenError } from '../../../core/errors/AppError';
import StudentDailyAttendance from '../models/StudentDailyAttendance.model';
import AcademicEvent from '../../academic/models/AcademicEvent.model';

export class StudentAttendanceService {
  private attendanceRepo: StudentDailyAttendanceRepository;
  private correctionRepo: AttendanceCorrectionRepository;
  private tenantId: string;

  constructor(tenantId: string) {
    this.tenantId = tenantId;
    this.attendanceRepo = new StudentDailyAttendanceRepository(tenantId);
    this.correctionRepo = new AttendanceCorrectionRepository(tenantId);
  }

  /**
   * Check if the given date is a holiday in the academic calendar.
   */
  private async isHoliday(date: Date, academicYearId: string): Promise<boolean> {
    const holiday = await AcademicEvent.findOne({
      tenantId: this.tenantId,
      academicYearId,
      type: 'HOLIDAY',
      startDate: { $lte: date },
      endDate: { $gte: date },
      isDeleted: { $ne: true },
    });
    return !!holiday;
  }

  /**
   * Bulk submit attendance for an entire class/section.
   * One atomic upsert — one DB write for the whole class.
   */
  async submitDailyAttendance(data: {
    academicYearId: string;
    classId: string;
    sectionId: string;
    date: string;
    entries: Array<{ studentId: string; status: string; remarks?: string }>;
    submittedByUserId: string;
  }) {
    const date = new Date(data.date);

    // Reject if holiday
    const holiday = await this.isHoliday(date, data.academicYearId);
    if (holiday) throw new ValidationError('Cannot mark attendance on a holiday.');

    // --- Teacher Isolation Check ---
    // If the user has a TEACHER role (or we can just check if they are not an ADMIN), they must be assigned to this section.
    // For now, we will perform a generic check against ClassTeacherAssignment if the user is a teacher.
    // Since we don't have the user's role explicitly in `data`, we should check `ClassTeacherAssignment` if we want strict isolation.
    // Ideally this is handled by a permission middleware, but we'll enforce it here.
    const ClassTeacherAssignment = mongoose.models['ClassTeacherAssignment'] || mongoose.model('ClassTeacherAssignment');
    const User = mongoose.models['User'] || mongoose.model('User');
    
    const user = await User.findById(data.submittedByUserId);
    if (user && user.roles.includes('TEACHER') && !user.roles.includes('SCHOOL_ADMIN')) {
      // Find the employee mapping for this user
      const Employee = mongoose.models['Employee'] || mongoose.model('Employee');
      const employee = await Employee.findOne({ userId: data.submittedByUserId, tenantId: this.tenantId });
      
      if (employee) {
        const isAssigned = await ClassTeacherAssignment.findOne({
          tenantId: this.tenantId,
          sectionId: new mongoose.Types.ObjectId(data.sectionId),
          teacherId: employee._id,
          status: 'ACTIVE'
        });
        if (!isAssigned) {
          throw new ForbiddenError('You are not authorized to mark attendance for this section.');
        }
      }
    }
    // -------------------------------

    // Check if already locked
    const existing = await this.attendanceRepo.findOne({
      sectionId: new mongoose.Types.ObjectId(data.sectionId),
      date: { $eq: date },
    });
    if (existing?.isLocked) throw new ForbiddenError('Attendance is locked and cannot be edited. Submit a correction request.');

    // Find approved leaves for these students on this date
    const LeaveRequest = mongoose.models['LeaveRequest'] || mongoose.model('LeaveRequest');
    const approvedLeaves = await LeaveRequest.find({
      tenantId: this.tenantId,
      domain: 'STUDENT',
      studentId: { $in: data.entries.map(e => new mongoose.Types.ObjectId(e.studentId)) },
      status: 'APPROVED',
      startDate: { $lte: date },
      endDate: { $gte: date }
    }).lean();

    const studentsOnLeave = new Set(approvedLeaves.map((l: any) => l.studentId.toString()));

    const entries = data.entries.map(e => {
      const isOnLeave = studentsOnLeave.has(e.studentId.toString());
      return {
        studentId: new mongoose.Types.ObjectId(e.studentId),
        status: isOnLeave ? 'ON_LEAVE' : e.status,
        remarks: isOnLeave ? 'Leave Approved' : e.remarks,
      };
    });

    // Upsert the attendance document atomically
    const dateObj = new Date(data.date);
    const startOfDay = new Date(dateObj);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(dateObj);
    endOfDay.setHours(23, 59, 59, 999);

    let academicYearId = data.academicYearId;
    const safeTenantFilter = mongoose.isValidObjectId(this.tenantId)
      ? { $in: [this.tenantId, new mongoose.Types.ObjectId(this.tenantId)] }
      : this.tenantId;

    if (!academicYearId || !mongoose.isValidObjectId(academicYearId)) {
      const AcademicYear = require('../../academic/models/AcademicYear.model').default;
      const activeYear = await AcademicYear.findOne({ 
        tenantId: safeTenantFilter, 
        status: { $in: ['active', 'ACTIVE'] } 
      }) || await AcademicYear.findOne({ tenantId: safeTenantFilter });
      academicYearId = activeYear ? activeYear._id : new mongoose.Types.ObjectId();
    }

    const attendance = await StudentDailyAttendance.findOneAndUpdate(
      {
        tenantId: safeTenantFilter,
        sectionId: mongoose.isValidObjectId(data.sectionId) ? new mongoose.Types.ObjectId(data.sectionId) : data.sectionId,
        date: { $gte: startOfDay, $lte: endOfDay },
      },
      {
        $set: {
          tenantId: this.tenantId,
          academicYearId: mongoose.isValidObjectId(academicYearId) ? new mongoose.Types.ObjectId(academicYearId) : academicYearId,
          classId: mongoose.isValidObjectId(data.classId) ? new mongoose.Types.ObjectId(data.classId) : data.classId,
          sectionId: mongoose.isValidObjectId(data.sectionId) ? new mongoose.Types.ObjectId(data.sectionId) : data.sectionId,
          date: startOfDay,
          entries,
          submittedBy: mongoose.isValidObjectId(data.submittedByUserId) ? new mongoose.Types.ObjectId(data.submittedByUserId) : data.submittedByUserId,
          status: 'SUBMITTED',
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Notify parents of students marked ABSENT
    try {
      const absentStudents = entries.filter((e: any) => e.status === 'ABSENT');
      if (absentStudents.length > 0) {
        const StudentProfile = require('../../students/models/StudentProfile.model').default;
        const Parent = require('../../students/models/Parent.model').default;
        const Notification = require('../../communication/models/Notification.model').default;
        const { sendNotificationToUser } = require('../../../core/services/socket.service');

        for (const absentEntry of absentStudents) {
          const sId = absentEntry.studentId;
          const studentDoc = await StudentProfile.findById(sId).lean();
          const studentName = studentDoc ? `${studentDoc.firstName} ${studentDoc.lastName || ''}`.trim() : 'Your ward';
          const absentRemarks = absentEntry.remarks ? ` Reason/Remarks: "${absentEntry.remarks}".` : ' No formal leave requested.';

          // Find parents linked to this student
          const parents = await Parent.find({
            tenantId: this.tenantId,
            $or: [
              { 'children.studentId': sId },
              { 'children.studentId': sId.toString() }
            ]
          }).lean();

          for (const parent of parents) {
            const notifTitle = `⚠️ Student Absence Alert: ${studentName}`;
            const notifMsg = `Important Notice: ${studentName} was recorded ABSENT for daily school attendance on ${data.date} by the class teacher.${absentRemarks} Please review this in your Parent Dashboard.`;

            if (parent.userId && mongoose.isValidObjectId(parent.userId)) {
              await Notification.create({
                tenantId: mongoose.isValidObjectId(this.tenantId) ? new mongoose.Types.ObjectId(this.tenantId) : new mongoose.Types.ObjectId(),
                recipientId: new mongoose.Types.ObjectId(parent.userId),
                title: notifTitle,
                message: notifMsg,
                type: 'ATTENDANCE',
                link: '/parent-portal/attendance',
                readStatus: false
              }).catch(() => {});

              try {
                sendNotificationToUser(parent.userId.toString(), {
                  title: notifTitle,
                  message: notifMsg,
                  type: 'ATTENDANCE',
                  link: '/parent-portal/attendance',
                  date: data.date
                });
              } catch {}
            }
          }
        }
      }
    } catch (notifErr) {
      console.error('Failed to dispatch parent absence notifications:', notifErr);
    }

    try {
      AuditService.log({
        tenantId: this.tenantId,
        action: 'CREATE',
        entityType: 'StudentDailyAttendance',
        entityId: attendance.id,
        performedBy: data.submittedByUserId,
      });
    } catch {}

    return attendance;
  }

  /**
   * Get today's attendance sheet for a class/section.
   */
  async getDailyAttendance(sectionId: string, dateStr: string, academicYearId?: string) {
    const dateObj = new Date(dateStr);
    const startOfDay = new Date(dateObj);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(dateObj);
    endOfDay.setHours(23, 59, 59, 999);

    const safeTenantFilter = mongoose.isValidObjectId(this.tenantId)
      ? { $in: [this.tenantId, new mongoose.Types.ObjectId(this.tenantId)] }
      : this.tenantId;

    const q: any = {
      tenantId: safeTenantFilter,
      sectionId: mongoose.isValidObjectId(sectionId) ? new mongoose.Types.ObjectId(sectionId) : sectionId,
      date: { $gte: startOfDay, $lte: endOfDay },
      isDeleted: { $ne: true }
    };
    if (academicYearId && mongoose.isValidObjectId(academicYearId)) {
      q.academicYearId = new mongoose.Types.ObjectId(academicYearId);
    }
    return StudentDailyAttendance.findOne(q).populate('entries.studentId', 'firstName lastName studentIdNumber');
  }

  /**
   * Calculate attendance summary for a student over a date range.
   */
  async getStudentSummary(studentId: string, academicYearId: string, startDate: string, endDate: string) {
    const studentObjId = mongoose.isValidObjectId(studentId) ? new mongoose.Types.ObjectId(studentId) : studentId;

    const records = await StudentDailyAttendance.find({
      tenantId: this.tenantId,
      ...(academicYearId && mongoose.isValidObjectId(academicYearId) ? { academicYearId: new mongoose.Types.ObjectId(academicYearId) } : {}),
      date: { $gte: new Date(startDate), $lte: new Date(endDate) },
      'entries.studentId': { $in: [studentObjId, studentId] },
      isDeleted: { $ne: true },
    });

    const summary = { PRESENT: 0, ABSENT: 0, LATE: 0, HALF_DAY: 0, ON_LEAVE: 0, EXCUSED: 0, HOLIDAY: 0, total: 0 };

    for (const record of records) {
      const entry = record.entries.find((e: any) => e.studentId.toString() === studentId);
      if (entry) {
        summary[entry.status as keyof typeof summary] = (summary[entry.status as keyof typeof summary] as number) + 1;
        summary.total++;
      }
    }

    const workingDays = summary.total - summary.HOLIDAY;
    const presentDays = summary.PRESENT + summary.LATE + (summary.HALF_DAY * 0.5);
    const attendancePercent = workingDays > 0 ? Math.round((presentDays / workingDays) * 100 * 10) / 10 : 0;

    return { ...summary, workingDays, attendancePercent };
  }

  async getDashboardStats(academicYearId: string, date: string) {
    const records = await StudentDailyAttendance.find({
      tenantId: this.tenantId,
      ...(academicYearId && mongoose.isValidObjectId(academicYearId) ? { academicYearId: new mongoose.Types.ObjectId(academicYearId) } : {}),
      date: new Date(date),
      isDeleted: { $ne: true },
    }).lean();

    let present = 0;
    let absent = 0;
    let late = 0;
    let excused = 0;
    const submittedClasses = records.length;

    records.forEach((record: any) => {
      record.entries.forEach((e: any) => {
        if (e.status === 'PRESENT') present++;
        else if (e.status === 'ABSENT') absent++;
        else if (e.status === 'LATE') late++;
        else if (e.status === 'EXCUSED') excused++;
      });
    });

    const totalStudents = present + absent + late + excused;
    const overallRate = totalStudents > 0 ? Math.round(((present + late) / totalStudents) * 100 * 10) / 10 : 0;

    return {
      overallRate,
      present,
      absent,
      late,
      excused,
      submittedClasses
    };
  }

  /**
   * Submit a correction request for locked attendance.
   */
  async requestCorrection(data: {
    attendanceDocId: string;
    studentId: string;
    date: string;
    previousStatus: string;
    requestedStatus: string;
    reason: string;
    requestedByUserId: string;
  }) {
    return this.correctionRepo.create({
      domain: 'STUDENT',
      attendanceDocId: new mongoose.Types.ObjectId(data.attendanceDocId),
      studentId: new mongoose.Types.ObjectId(data.studentId),
      date: new Date(data.date),
      previousStatus: data.previousStatus,
      requestedStatus: data.requestedStatus,
      reason: data.reason,
      requestedBy: new mongoose.Types.ObjectId(data.requestedByUserId),
    } as any);
  }

  /**
   * Process a correction request.
   */
  async processCorrection(correctionId: string, action: 'APPROVED' | 'REJECTED', processedByUserId: string, remarks?: string) {
    const correction = await this.correctionRepo.findById(correctionId);
    if (!correction) throw new ValidationError('Correction request not found');
    if (correction.status !== 'PENDING') throw new ValidationError('Correction request is already processed');

    correction.status = action;
    (correction as any).processedBy = new mongoose.Types.ObjectId(processedByUserId);
    if (remarks) (correction as any).remarks = remarks;

    if (action === 'APPROVED') {
      const attendance = await StudentDailyAttendance.findById(correction.attendanceDocId);
      if (attendance) {
        const entry = attendance.entries.find((e: any) => e.studentId.toString() === correction.studentId?.toString());
        if (entry) {
          entry.status = correction.requestedStatus as any;
          await attendance.save();
        }
      }
    }
    await correction.save();
    return correction;
  }

  /**
   * Generate Attendance Report
   */
  async getReport(query: any) {
    const { reportType, academicYearId, classId, sectionId, startDate, endDate, threshold } = query;
    const match: any = { tenantId: this.tenantId, isDeleted: { $ne: true } };
    
    if (academicYearId) match.academicYearId = new mongoose.Types.ObjectId(academicYearId);
    if (classId) match.classId = new mongoose.Types.ObjectId(classId);
    if (sectionId) match.sectionId = new mongoose.Types.ObjectId(sectionId);
    if (startDate && endDate) {
      match.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const records = await StudentDailyAttendance.find(match).lean();

    if (reportType === 'LOW_ATTENDANCE') {
      // Calculate attendance percent per student and filter
      const studentStats: Record<string, any> = {};
      records.forEach((record: any) => {
        record.entries.forEach((e: any) => {
          const sid = e.studentId.toString();
          if (!studentStats[sid]) studentStats[sid] = { PRESENT: 0, ABSENT: 0, LATE: 0, HALF_DAY: 0, total: 0 };
          studentStats[sid][e.status] = (studentStats[sid][e.status] || 0) + 1;
          studentStats[sid].total++;
        });
      });
      
      const targetThreshold = threshold ? Number(threshold) : 75;
      const result = [];
      for (const [sid, stats] of Object.entries(studentStats)) {
        const presentDays = stats.PRESENT + stats.LATE + (stats.HALF_DAY * 0.5);
        const percent = stats.total > 0 ? (presentDays / stats.total) * 100 : 0;
        if (percent < targetThreshold) {
          result.push({ studentId: sid, ...stats, percent });
        }
      }
      return result;
    }

    if (reportType === 'ABSENCE') {
      // Return list of absences
      const absences: any[] = [];
      records.forEach((record: any) => {
        record.entries.forEach((e: any) => {
          if (e.status === 'ABSENT') {
            absences.push({
              studentId: e.studentId,
              date: record.date,
              sectionId: record.sectionId,
              classId: record.classId,
              remarks: e.remarks
            });
          }
        });
      });
      return absences;
    }

    // Default daily/monthly aggregate
    return records;
  }
}
