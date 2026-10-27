import axios from '../../../core/api/axios';

export interface Hostel {
  _id: string;
  name: string;
  code: string;
  hostelType: string;
  genderApplicability: string;
  totalCapacity: number;
  status: string;
}

export interface Building {
  _id: string;
  hostelId: string;
  name: string;
  code: string;
  numberOfFloors: number;
  capacity: number;
  status: string;
}

export interface Block {
  _id: string;
  hostelId: string;
  buildingId: string;
  blockName: string;
  capacity: number;
  status: string;
}

export interface Floor {
  _id: string;
  buildingId: string;
  blockId: string;
  floorNumber: number;
  floorName: string;
  capacity: number;
  status: string;
}

export interface Room {
  _id: string;
  hostelId: string;
  buildingId: string;
  blockId: string;
  floorId: string;
  roomNumber: string;
  roomType: string;
  capacity: number;
  currentOccupancy: number;
  genderApplicability: string;
  status: string;
}

export interface Bed {
  _id: string;
  roomId: any;
  bedNumber: string;
  status: string;
}

export interface HostelApplication {
  _id: string;
  studentId: any;
  academicYearId: string;
  preferredHostelId: any;
  status: string;
}

export interface HostelAllocation {
  _id: string;
  studentId: any;
  academicYearId: string;
  hostelId: any;
  roomId: any;
  bedId: any;
  status: string;
}

// Students API helper
export const getStudents = async (): Promise<any[]> => {
  try {
    const res = await axios.get('/students');
    return Array.isArray(res.data?.data)
      ? res.data.data
      : Array.isArray(res.data?.data?.students)
      ? res.data.data.students
      : Array.isArray(res.data?.data?.data)
      ? res.data.data.data
      : [];
  } catch (e) {
    return [];
  }
};

// Hostel APIs
export const getHostels = async (): Promise<Hostel[]> => {
  try {
    const res = await axios.get('/hostel');
    return Array.isArray(res.data?.data)
      ? res.data.data
      : Array.isArray(res.data?.data?.data)
      ? res.data.data.data
      : [];
  } catch (e) {
    return [];
  }
};

export const createHostel = async (data: Partial<Hostel>): Promise<Hostel> => {
  const res = await axios.post('/hostel', data);
  return res.data.data;
};

export const updateHostel = async (id: string, data: Partial<Hostel>): Promise<Hostel> => {
  const res = await axios.put(`/hostel/${id}`, data);
  return res.data.data;
};

export const deleteHostel = async (id: string): Promise<any> => {
  const res = await axios.delete(`/hostel/${id}`);
  return res.data.data;
};

export const getBuildings = async (hostelId?: string): Promise<Building[]> => {
  const res = await axios.get('/hostel/buildings', { params: { hostelId } });
  return res.data.data;
};

export const createBuilding = async (data: Partial<Building>): Promise<Building> => {
  const res = await axios.post('/hostel/buildings', data);
  return res.data.data;
};

export const updateBuilding = async (id: string, data: Partial<Building>): Promise<Building> => {
  const res = await axios.put(`/hostel/buildings/${id}`, data);
  return res.data.data;
};

export const deleteBuilding = async (id: string): Promise<any> => {
  const res = await axios.delete(`/hostel/buildings/${id}`);
  return res.data.data;
};

export const getBlocks = async (buildingId?: string): Promise<Block[]> => {
  const res = await axios.get('/hostel/blocks', { params: { buildingId } });
  return res.data.data;
};

export const createBlock = async (data: Partial<Block>): Promise<Block> => {
  const res = await axios.post('/hostel/blocks', data);
  return res.data.data;
};

export const updateBlock = async (id: string, data: Partial<Block>): Promise<Block> => {
  const res = await axios.put(`/hostel/blocks/${id}`, data);
  return res.data.data;
};

export const deleteBlock = async (id: string): Promise<any> => {
  const res = await axios.delete(`/hostel/blocks/${id}`);
  return res.data.data;
};

export const getFloors = async (blockId?: string): Promise<Floor[]> => {
  const res = await axios.get('/hostel/floors', { params: { blockId } });
  return res.data.data;
};

export const createFloor = async (data: Partial<Floor>): Promise<Floor> => {
  const res = await axios.post('/hostel/floors', data);
  return res.data.data;
};

export const updateFloor = async (id: string, data: Partial<Floor>): Promise<Floor> => {
  const res = await axios.put(`/hostel/floors/${id}`, data);
  return res.data.data;
};

export const deleteFloor = async (id: string): Promise<any> => {
  const res = await axios.delete(`/hostel/floors/${id}`);
  return res.data.data;
};

export const getRooms = async (floorId?: string): Promise<Room[]> => {
  const res = await axios.get('/hostel/rooms', { params: { floorId } });
  return res.data.data;
};

export const createRoom = async (data: Partial<Room>): Promise<Room> => {
  const res = await axios.post('/hostel/rooms', data);
  return res.data.data;
};

export const updateRoom = async (id: string, data: Partial<Room>): Promise<Room> => {
  const res = await axios.put(`/hostel/rooms/${id}`, data);
  return res.data.data;
};

export const deleteRoom = async (id: string): Promise<any> => {
  const res = await axios.delete(`/hostel/rooms/${id}`);
  return res.data.data;
};

export const getBeds = async (roomId?: string): Promise<Bed[]> => {
  const res = await axios.get('/hostel/beds', { params: { roomId } });
  return res.data.data;
};

export const createBed = async (data: Partial<Bed>): Promise<Bed> => {
  const res = await axios.post('/hostel/beds', data);
  return res.data.data;
};

export const updateBed = async (id: string, data: Partial<Bed>): Promise<Bed> => {
  const res = await axios.put(`/hostel/beds/${id}`, data);
  return res.data.data;
};

export const deleteBed = async (id: string): Promise<any> => {
  const res = await axios.delete(`/hostel/beds/${id}`);
  return res.data.data;
};

export const getApplications = async (hostelId?: string): Promise<HostelApplication[]> => {
  const res = await axios.get('/hostel/applications', { params: { hostelId } });
  return res.data.data;
};

export const createApplication = async (data: Partial<HostelApplication>): Promise<HostelApplication> => {
  const res = await axios.post('/hostel/applications', data);
  return res.data.data;
};

export const getAllocations = async (hostelId?: string): Promise<HostelAllocation[]> => {
  const res = await axios.get('/hostel/allocations', { params: { hostelId } });
  return res.data.data;
};

export const allocateBed = async (data: { studentId: string; bedId: string; academicYearId: string }): Promise<HostelAllocation> => {
  const res = await axios.post('/hostel/allocate', data);
  return res.data.data;
};

export const checkInStudent = async (data: { allocationId: string; condition: string; remarks: string }): Promise<any> => {
  const res = await axios.post('/hostel/checkin', data);
  return res.data.data;
};

export const checkOutStudent = async (data: { allocationId: string; roomCondition: string; reason: string }): Promise<any> => {
  const res = await axios.post('/hostel/checkout', data);
  return res.data.data;
};

export const transferRoom = async (data: { transferId: string; targetBedId: string }): Promise<any> => {
  const res = await axios.post('/hostel/transfer', data);
  return res.data.data;
};

// Attendance APIs
export const getAttendance = async (hostelId: string, date: string, rollCallType: string): Promise<any> => {
  const res = await axios.get('/hostel/attendance', { params: { hostelId, date, rollCallType } });
  return res.data.data;
};

export const markAttendance = async (data: any): Promise<any> => {
  const res = await axios.post('/hostel/attendance', data);
  return res.data.data;
};

export const getActiveStudentsForAttendance = async (hostelId: string): Promise<any> => {
  const res = await axios.get('/hostel/attendance/active-students', { params: { hostelId } });
  return res.data.data;
};

// Complaints APIs
export const getComplaints = async (hostelId?: string, status?: string): Promise<any> => {
  const res = await axios.get('/hostel/complaints', { params: { hostelId, status } });
  return res.data.data;
};

export const createComplaint = async (data: any): Promise<any> => {
  const res = await axios.post('/hostel/complaints', data);
  return res.data.data;
};

export const updateComplaintStatus = async (id: string, data: { status: string; notes?: string; assignedToUserId?: string }): Promise<any> => {
  const res = await axios.put(`/hostel/complaints/${id}/status`, data);
  return res.data.data;
};

// Visitors APIs
export const getVisitors = async (hostelId?: string, status?: string): Promise<any> => {
  const res = await axios.get('/hostel/visitors', { params: { hostelId, status } });
  return res.data.data;
};

export const checkInVisitor = async (data: any): Promise<any> => {
  const res = await axios.post('/hostel/visitors/checkin', data);
  return res.data.data;
};

export const checkOutVisitor = async (id: string): Promise<any> => {
  const res = await axios.put(`/hostel/visitors/${id}/checkout`);
  return res.data.data;
};

// Outpass APIs
export const getOutpasses = async (hostelId?: string): Promise<any> => {
  const res = await axios.get('/hostel/outpasses', { params: { hostelId } });
  return res.data.data;
};

export const createOutpass = async (data: any): Promise<any> => {
  const res = await axios.post('/hostel/outpasses', data);
  return res.data.data;
};

export const updateOutpassStatus = async (id: string, status: string): Promise<any> => {
  const res = await axios.put(`/hostel/outpasses/${id}/status`, { status });
  return res.data.data;
};

// Incidents APIs
export const getIncidents = async (hostelId?: string): Promise<any> => {
  const res = await axios.get('/hostel/incidents', { params: { hostelId } });
  return res.data.data;
};

export const createIncident = async (data: any): Promise<any> => {
  const res = await axios.post('/hostel/incidents', data);
  return res.data.data;
};

// Mess APIs
export const getMealPlans = async (hostelId?: string, startDate?: string, endDate?: string): Promise<any> => {
  const res = await axios.get('/hostel/mess/meal-plans', { params: { hostelId, startDate, endDate } });
  return res.data.data;
};

export const createMealPlan = async (data: any): Promise<any> => {
  const res = await axios.post('/hostel/mess/meal-plans', data);
  return res.data.data;
};

export const updateMealPlan = async (id: string, data: any): Promise<any> => {
  const res = await axios.put(`/hostel/mess/meal-plans/${id}`, data);
  return res.data.data;
};

export const deleteMealPlan = async (id: string): Promise<any> => {
  const res = await axios.delete(`/hostel/mess/meal-plans/${id}`);
  return res.data.data;
};

export const getMessFeedback = async (hostelId?: string): Promise<any> => {
  const res = await axios.get('/hostel/mess/feedback', { params: { hostelId } });
  return res.data.data;
};

export const submitMessFeedback = async (data: any): Promise<any> => {
  const res = await axios.post('/hostel/mess/feedback', data);
  return res.data.data;
};

// Dashboard Stats API
export const getHostelDashboardStats = async (): Promise<any> => {
  const res = await axios.get('/hostel/dashboard');
  return res.data.data;
};

