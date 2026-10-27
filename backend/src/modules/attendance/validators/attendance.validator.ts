import { z } from 'zod';

export const bulkSubmitStudentAttendanceSchema = z.object({
  body: z.object({
    academicYearId: z.string().min(24),
    classId: z.string().min(24),
    sectionId: z.string().min(24),
    date: z.string().datetime(),
    entries: z.array(
      z.object({
        studentId: z.string().min(24),
        status: z.enum(['PRESENT', 'ABSENT', 'LATE', 'HALF_DAY', 'EXCUSED', 'ON_LEAVE', 'HOLIDAY']),
        remarks: z.string().optional(),
      })
    ).min(1),
  }),
});

export const checkInSchema = z.object({
  body: z.object({
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    source: z.enum(['WEB', 'MOBILE', 'MANUAL']).default('WEB'),
    remarks: z.string().optional(),
  }),
});

export const applyLeaveSchema = z.object({
  body: z.object({
    domain: z.enum(['STUDENT', 'EMPLOYEE']).optional().default('EMPLOYEE'),
    leaveTypeId: z.string(),
    startDate: z.string(),
    endDate: z.string(),
    totalDays: z.number().positive().optional(),
    reason: z.string().min(1),
    isHalfDay: z.boolean().optional().default(false),
    halfDayPortion: z.enum(['FIRST_HALF', 'SECOND_HALF']).optional(),
    isHourly: z.boolean().optional().default(false),
    hourlyStartTime: z.string().optional(),
    hourlyEndTime: z.string().optional(),
    studentId: z.string().optional(),
    employeeId: z.string().optional(),
  }),
});

export const correctionRequestSchema = z.object({
  body: z.object({
    domain: z.enum(['STUDENT', 'EMPLOYEE']),
    attendanceDocId: z.string().min(24),
    date: z.string().datetime(),
    previousStatus: z.string().min(1),
    requestedStatus: z.string().min(1),
    reason: z.string().min(10),
    studentId: z.string().optional(),
    employeeId: z.string().optional(),
  }),
});
