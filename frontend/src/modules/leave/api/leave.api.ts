export interface LeaveType {
  id: string;
  name: string;
  code: string;
  domain: 'STUDENT' | 'EMPLOYEE' | 'BOTH';
  isPaid: boolean;
  allowHalfDay: boolean;
  requiresDocument: boolean;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface LeaveBalance {
  id: string;
  employeeId: string;
  leaveTypeId: string;
  academicYearId: string;
  totalEntitlement: number;
  usedDays: number;
  pendingDays: number;
  availableDays: number;
}

export interface LeaveRequest {
  id: string;
  domain: 'STUDENT' | 'EMPLOYEE';
  studentId?: string;
  employeeId?: string;
  appliedByUserId: string;
  applicantName?: string; // UI hydrated
  leaveTypeId: string;
  leaveTypeName?: string; // UI hydrated
  startDate: string;
  endDate: string;
  isHalfDay: boolean;
  totalDays: number;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  submittedAt: string;
}

import api from '../../../core/api/axios';

// --- API Calls ---

export const getLeaveTypes = async (filters?: any): Promise<LeaveType[]> => {
  const response = await api.get('/attendance/leave/types', { params: filters });
  return response.data.data;
};

export const getLeaveBalances = async (employeeId: string): Promise<LeaveBalance[]> => {
  const response = await api.get(`/attendance/leave/balance/${employeeId}`);
  return response.data.data;
};

export const getLeaveRequests = async (filters: any): Promise<LeaveRequest[]> => {
  const response = await api.get('/attendance/leave/requests', { params: filters });
  return response.data.data;
};

export const getMyLeaveRequests = async (filters?: any): Promise<LeaveRequest[]> => {
  const response = await api.get('/attendance/leave/my-requests', { params: filters });
  return response.data.data;
};

export const saveLeaveRequest = async (data: Partial<LeaveRequest>): Promise<LeaveRequest> => {
  const response = await api.post('/attendance/leave/apply', data);
  return response.data.data;
};

export const processLeaveRequest = async (id: string, action: 'APPROVED' | 'REJECTED' | 'CANCELLED', remarks?: string): Promise<LeaveRequest> => {
  const response = await api.patch(`/attendance/leave/${id}/process`, { action, remarks });
  return response.data.data;
};

// Leave Type management
export const saveLeaveType = async (data: Partial<LeaveType>): Promise<LeaveType> => {
  if (data.id || (data as any)._id) {
    const response = await api.put(`/attendance/leave/types/${data.id || (data as any)._id}`, data);
    return response.data.data;
  }
  const response = await api.post('/attendance/leave/types', data);
  return response.data.data;
};

export const deleteLeaveType = async (id: string): Promise<void> => {
  await api.delete(`/attendance/leave/types/${id}`);
};
