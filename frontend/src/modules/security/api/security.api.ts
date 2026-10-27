import axiosInstance from '../../../core/api/axios';

export interface SecurityDashboardStats {
  todayEntries: number;
  visitorsInside: number;
  pendingPickups: number;
  activeIncidents: number;
  activeAlerts: number;
  activeLockdowns: number;
  deliveriesToday: number;
  vehiclesInside: number;
  lostFoundUnclaimed: number;
}

export interface Gate {
  _id: string;
  name: string;
  location: string;
  operatingHoursStart: string;
  operatingHoursEnd: string;
  allowedAccessTypes: string[];
  emergencyStatus: string;
  isActive: boolean;
}

export interface GateEntry {
  _id: string;
  entryNumber: string;
  personName: string;
  personType: string;
  gateId: any;
  entryTime: string;
  status: 'ENTERED' | 'DENIED' | 'EXITED';
  vehicleNumber?: string;
  notes?: string;
}

export interface LostFoundItem {
  _id: string;
  itemNumber: string;
  title: string;
  description: string;
  category: 'BAG' | 'BOTTLE' | 'ELECTRONICS' | 'CLOTHING' | 'BOOKS_STATIONERY' | 'ID_CARD' | 'OTHER';
  dateFound: string;
  locationFound: string;
  storageLocation: string;
  status: 'FOUND' | 'CLAIMED' | 'DISPOSED';
  foundBy?: string;
  claimedBy?: string;
  claimantContact?: string;
  claimedDate?: string;
  remarks?: string;
}

export const getSecurityDashboardStats = async (): Promise<SecurityDashboardStats> => {
  const res = await axiosInstance.get('/security/dashboard');
  return res.data.data;
};

export const getGates = async (): Promise<Gate[]> => {
  const res = await axiosInstance.get('/security/gates');
  return res.data.data;
};

export const createGate = async (data: Partial<Gate>): Promise<Gate> => {
  const res = await axiosInstance.post('/security/gates', data);
  return res.data.data;
};

export const getGateEntries = async (params?: any): Promise<GateEntry[]> => {
  const res = await axiosInstance.get('/security/gate-entries', { params });
  return res.data.data;
};

export const recordGateEntry = async (data: any): Promise<GateEntry> => {
  const res = await axiosInstance.post('/security/gate-entries', data);
  return res.data.data;
};

export const recordGateExit = async (entryId: string, data: any = {}): Promise<any> => {
  const res = await axiosInstance.post(`/security/gate-exits/${entryId}`, data);
  return res.data.data;
};

export const getSecurityIncidents = async (): Promise<any[]> => {
  const res = await axiosInstance.get('/security/incidents');
  return res.data.data;
};

export const reportSecurityIncident = async (data: any): Promise<any> => {
  const res = await axiosInstance.post('/security/incidents', data);
  return res.data.data;
};

export const getLostFoundItems = async (params?: any): Promise<LostFoundItem[]> => {
  const res = await axiosInstance.get('/security/lost-found', { params });
  return res.data.data;
};

export const createLostFoundItem = async (data: Partial<LostFoundItem>): Promise<LostFoundItem> => {
  const res = await axiosInstance.post('/security/lost-found', data);
  return res.data.data;
};

export const claimLostFoundItem = async (
  id: string,
  data: { claimedBy: string; claimantContact?: string; remarks?: string }
): Promise<LostFoundItem> => {
  const res = await axiosInstance.put(`/security/lost-found/${id}/claim`, data);
  return res.data.data;
};

export const deleteLostFoundItem = async (id: string): Promise<any> => {
  const res = await axiosInstance.delete(`/security/lost-found/${id}`);
  return res.data;
};

// ─── ADVANCED VISITOR MANAGEMENT (VMS) ───────────────────────

export interface VisitorKPIStats {
  totalToday: number;
  currentlyInside: number;
  checkedOutToday: number;
  expectedVisitors: number;
  pendingApprovals: number;
  overdueVisitors: number;
  rejectedVisits: number;
  averageDurationMinutes: number;
}

export interface VisitorRecord {
  id: string;
  _id?: string;
  visitorId: string;
  visitorName: string;
  phone: string;
  email?: string;
  organization?: string;
  visitorCategory: 'GUEST' | 'CUSTOMER' | 'VENDOR' | 'CONTRACTOR' | 'INTERVIEW' | 'PARENT' | 'DELIVERY' | 'GOVERNMENT' | 'OTHER';
  hostEmployeeId?: any;
  hostName: string;
  hostDepartment: string;
  purpose: string;
  expectedArrival: string;
  expectedDeparture: string;
  actualCheckIn?: string;
  actualCheckOut?: string;
  durationMinutes?: number;
  accompanyingCount?: number;
  vehicleNumber?: string;
  idDocumentType?: string;
  idDocumentReference?: string;
  photoUrl?: string;
  notes?: string;
  approvalStatus: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  rejectionReason?: string;
  visitStatus: 'EXPECTED' | 'INSIDE' | 'CHECKED_OUT' | 'OVERDUE' | 'CANCELLED';
  passId?: string;
  passExpiry?: string;
  qrToken?: string;
  registrationSource: 'WALK_IN' | 'PRE_REGISTERED' | 'APPOINTMENT';
  isOverdue?: boolean;
  overdueMinutes?: number;
  createdAt?: string;
}

export interface VMSHost {
  id: string;
  name: string;
  department: string;
  email?: string;
  phone?: string;
}

export const getVisitorKPIStats = async (): Promise<VisitorKPIStats> => {
  const res = await axiosInstance.get('/security/visitors/stats');
  return res.data.data;
};

export const getAdvancedVisitors = async (params?: any): Promise<{ records: VisitorRecord[]; total: number; page: number; limit: number; totalPages: number }> => {
  const res = await axiosInstance.get('/security/visitors', { params: { ...params, vms: 'advanced' } });
  return res.data.data;
};

export const smartRegisterVisitor = async (data: any): Promise<VisitorRecord> => {
  const res = await axiosInstance.post('/security/visitors/smart-register', data);
  return res.data.data;
};

export const checkInVisitor = async (identifier: string): Promise<VisitorRecord> => {
  const res = await axiosInstance.post('/security/visitors/check-in', { identifier });
  return res.data.data;
};

export const checkOutVisitor = async (id: string, notes?: string): Promise<VisitorRecord> => {
  const res = await axiosInstance.post(`/security/visitors/${id}/check-out`, { notes });
  return res.data.data;
};

export const approveVisit = async (id: string, action: 'APPROVE' | 'REJECT', reason?: string): Promise<VisitorRecord> => {
  const res = await axiosInstance.put(`/security/visitors/${id}/approve`, { action, reason });
  return res.data.data;
};

export const extendVisit = async (id: string, newDeparture: string, reason: string): Promise<VisitorRecord> => {
  const res = await axiosInstance.put(`/security/visitors/${id}/extend`, { newDeparture, reason });
  return res.data.data;
};

export const getVMSHosts = async (): Promise<VMSHost[]> => {
  const res = await axiosInstance.get('/security/visitors/hosts');
  return res.data.data;
};

