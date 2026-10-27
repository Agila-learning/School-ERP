export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED' | 'HALF_DAY' | 'ON_LEAVE' | 'HOLIDAY';

export interface AttendancePolicy {
  id: string;
  name: string;
  domain: 'STUDENT' | 'EMPLOYEE';
  attendanceMode: 'DAILY' | 'PERIOD_WISE';
  gracePeriodMinutes: number;
  lateThresholdMinutes: number;
  minAttendancePercent: number;
  lockAfterHours: number;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface StudentAttendanceEntry {
  studentId: string;
  studentName?: string; // UI hydrated
  rollNumber?: string;  // UI hydrated
  status: AttendanceStatus;
  remarks?: string;
}

export interface StudentPeriodAttendance {
  id: string;
  classId: string;
  sectionId: string;
  subjectId: string;
  periodDefinitionId: string;
  teacherId: string;
  date: string;
  entries: StudentAttendanceEntry[];
  isLocked: boolean;
  status: 'DRAFT' | 'SUBMITTED' | 'LOCKED';
}

export interface AttendanceCorrectionRequest {
  id: string;
  attendanceDocId: string;
  studentId?: string;
  studentName?: string; // UI hydrated
  date: string;
  previousStatus: string;
  requestedStatus: string;
  reason: string;
  requestedBy: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

import axios from '../../../core/api/axios';

export const getAttendancePolicies = async (): Promise<AttendancePolicy[]> => {
  const response = await axios.get('/attendance/policies');
  return response.data?.data || [];
};

export const createAttendancePolicy = async (payload: Partial<AttendancePolicy>): Promise<AttendancePolicy> => {
  const response = await axios.post('/attendance/policies', payload);
  return response.data?.data;
};

export const updateAttendancePolicy = async (id: string, payload: Partial<AttendancePolicy>): Promise<AttendancePolicy> => {
  const response = await axios.put(`/attendance/policies/${id}`, payload);
  return response.data?.data;
};

export const deleteAttendancePolicy = async (id: string): Promise<void> => {
  await axios.delete(`/attendance/policies/${id}`);
};

export const getLateComers = async (date?: string): Promise<any[]> => {
  const params = date ? { date } : {};
  const response = await axios.get('/attendance/late-comers', { params });
  return response.data?.data || [];
};

export const recordLateEntry = async (payload: {
  studentId: string;
  arrivalTime?: string;
  delayMinutes?: number;
  reason?: string;
  notifyParent?: boolean;
}): Promise<any> => {
  const response = await axios.post('/attendance/late-comers', payload);
  return response.data?.data;
};

export const getDailyAttendanceSheet = async (sectionId: string, date: string, academicYearId: string) => {
  const response = await axios.get('/attendance/student/sheet', { params: { sectionId, date, academicYearId } });
  return response.data?.data;
};

export const submitDailyAttendance = async (payload: {
  academicYearId: string;
  classId: string;
  sectionId: string;
  date: string;
  entries: { studentId: string; status: AttendanceStatus; remarks?: string }[];
}) => {
  const response = await axios.post('/attendance/student/submit', payload);
  return response.data?.data;
};

export const getStudentSummary = async (studentId: string, academicYearId: string, startDate: string, endDate: string) => {
  const response = await axios.get('/attendance/student/summary', { params: { studentId, academicYearId, startDate, endDate } });
  return response.data?.data;
};

export const getStudentDashboardStats = async (academicYearId: string, date: string) => {
  const response = await axios.get('/attendance/student/dashboard', { params: { academicYearId, date } });
  return response.data?.data;
};

export const getCorrectionRequests = async (): Promise<AttendanceCorrectionRequest[]> => {
  const response = await axios.get('/attendance/correction-requests');
  return response.data?.data || [];
};

export const requestCorrection = async (payload: {
  attendanceDocId: string;
  studentId: string;
  date: string;
  previousStatus: string;
  requestedStatus: string;
  reason: string;
}) => {
  const response = await axios.post('/attendance/student/correct', payload);
  return response.data?.data;
};

export const processCorrection = async (id: string, payload: { action: 'APPROVED' | 'REJECTED'; remarks?: string }) => {
  const response = await axios.patch(`/attendance/student/correct/${id}`, payload);
  return response.data?.data;
};

export const getLeaveRequests = async () => {
  const response = await axios.get('/attendance/leave/requests');
  return response.data?.data || [];
};

export const processLeaveRequest = async (id: string, payload: { action: 'APPROVED' | 'REJECTED'; remarks?: string }) => {
  const response = await axios.patch(`/attendance/leave/${id}/process`, payload);
  return response.data?.data;
};

// Employee Attendance
export const employeeCheckIn = async (payload: { latitude?: number; longitude?: number; remarks?: string }) => {
  const response = await axios.post('/attendance/employee/checkin', payload);
  return response.data?.data;
};

export const employeeCheckOut = async (payload: { latitude?: number; longitude?: number; remarks?: string }) => {
  const response = await axios.post('/attendance/employee/checkout', payload);
  return response.data?.data;
};

export const getEmployeeTodayStatus = async () => {
  const response = await axios.get('/attendance/employee/today');
  return response.data?.data;
};

// Period-wise API Stubs to fix TypeScript build errors
export const getPeriodAttendances = async (params?: any): Promise<StudentPeriodAttendance[]> => {
  const response = await axios.get('/attendance/student/period', { params });
  return response.data?.data || [];
};

export const savePeriodAttendance = async (payload: any): Promise<StudentPeriodAttendance> => {
  const response = await axios.post('/attendance/student/period', payload);
  return response.data?.data;
};
