import { BaseRepository } from '../../../core/repositories/base.repository';
import AttendancePolicy, { IAttendancePolicy } from '../models/AttendancePolicy.model';
import Shift, { IShift } from '../models/Shift.model';
import EmployeeShiftAssignment, { IEmployeeShiftAssignment } from '../models/EmployeeShiftAssignment.model';
import LeaveType, { ILeaveType } from '../models/LeaveType.model';
import LeavePolicy, { ILeavePolicy } from '../models/LeavePolicy.model';
import StudentDailyAttendance, { IStudentDailyAttendance } from '../models/StudentDailyAttendance.model';
import StudentPeriodAttendance, { IStudentPeriodAttendance } from '../models/StudentPeriodAttendance.model';
import AttendanceCorrectionRequest, { IAttendanceCorrectionRequest } from '../models/AttendanceCorrectionRequest.model';
import AttendanceEvent, { IAttendanceEvent } from '../models/AttendanceEvent.model';
import EmployeeDailyAttendance, { IEmployeeDailyAttendance } from '../models/EmployeeDailyAttendance.model';
import LeaveRequest, { ILeaveRequest } from '../models/LeaveRequest.model';
import LeaveBalance, { ILeaveBalance } from '../models/LeaveBalance.model';

export class AttendancePolicyRepository extends BaseRepository<IAttendancePolicy> {
  constructor(tenantId: string) { super(AttendancePolicy, tenantId); }
}
export class ShiftRepository extends BaseRepository<IShift> {
  constructor(tenantId: string) { super(Shift, tenantId); }
}
export class EmployeeShiftAssignmentRepository extends BaseRepository<IEmployeeShiftAssignment> {
  constructor(tenantId: string) { super(EmployeeShiftAssignment, tenantId); }
}
export class LeaveTypeRepository extends BaseRepository<ILeaveType> {
  constructor(tenantId: string) { super(LeaveType, tenantId); }
}
export class LeavePolicyRepository extends BaseRepository<ILeavePolicy> {
  constructor(tenantId: string) { super(LeavePolicy, tenantId); }
}
export class StudentDailyAttendanceRepository extends BaseRepository<IStudentDailyAttendance> {
  constructor(tenantId: string) { super(StudentDailyAttendance, tenantId); }
}
export class StudentPeriodAttendanceRepository extends BaseRepository<IStudentPeriodAttendance> {
  constructor(tenantId: string) { super(StudentPeriodAttendance, tenantId); }
}
export class AttendanceCorrectionRepository extends BaseRepository<IAttendanceCorrectionRequest> {
  constructor(tenantId: string) { super(AttendanceCorrectionRequest, tenantId); }
}
export class AttendanceEventRepository extends BaseRepository<IAttendanceEvent> {
  constructor(tenantId: string) { super(AttendanceEvent, tenantId); }
}
export class EmployeeDailyAttendanceRepository extends BaseRepository<IEmployeeDailyAttendance> {
  constructor(tenantId: string) { super(EmployeeDailyAttendance, tenantId); }
}
export class LeaveRequestRepository extends BaseRepository<ILeaveRequest> {
  constructor(tenantId: string) { super(LeaveRequest, tenantId); }
}
export class LeaveBalanceRepository extends BaseRepository<ILeaveBalance> {
  constructor(tenantId: string) { super(LeaveBalance, tenantId); }
}
