import api from '../../../core/api/axios';

export interface DashboardSummary {
  totalStudents: number;
  totalTeachers: number;
  totalStaff: number;
  activeVehicles: number;
}

export interface AttendanceSummary {
  present: number;
  absent: number;
  late: number;
  notMarked: number;
  trend: { date: string; present: number; absent: number; late: number }[];
}

export interface FeeSummary {
  collected: number;
  pending: number;
  overdue: number;
  trend: { month: string; amount: number }[];
}

export interface UpcomingEvent {
  id: string;
  title: string;
  date: string;
  type: 'exam' | 'meeting' | 'holiday' | 'event';
}

export interface RecentActivity {
  id: string;
  action: string;
  user: string;
  time: string;
  status: 'success' | 'warning' | 'error' | 'info';
}

export interface ActionItem {
  id: string;
  title: string;
  count: number;
  type: 'fee' | 'attendance' | 'leave' | 'document' | 'transport';
}


export const getDashboardSummary = async (academicYearId?: string): Promise<DashboardSummary> => {
  const headers = academicYearId ? { 'x-academic-year-id': academicYearId } : {};
  const response = await api.get('/admin/dashboard/summary', { headers });
  return response.data.data;
};

export const getAttendanceSummary = async (academicYearId?: string): Promise<AttendanceSummary> => {
  const headers = academicYearId ? { 'x-academic-year-id': academicYearId } : {};
  const response = await api.get('/admin/dashboard/attendance', { headers });
  return response.data.data;
};

export const getFeeSummary = async (academicYearId?: string): Promise<FeeSummary> => {
  const headers = academicYearId ? { 'x-academic-year-id': academicYearId } : {};
  const response = await api.get('/admin/dashboard/fees', { headers });
  return response.data.data;
};

export const getUpcomingEvents = async (academicYearId?: string): Promise<UpcomingEvent[]> => {
  const headers = academicYearId ? { 'x-academic-year-id': academicYearId } : {};
  const response = await api.get('/admin/dashboard/events', { headers });
  return response.data.data;
};

export const getRecentActivities = async (academicYearId?: string): Promise<RecentActivity[]> => {
  const headers = academicYearId ? { 'x-academic-year-id': academicYearId } : {};
  const response = await api.get('/admin/dashboard/activities', { headers });
  return response.data.data;
};

export const getActionItems = async (): Promise<ActionItem[]> => {
  const response = await api.get('/admin/dashboard/action-items');
  return response.data.data;
};
