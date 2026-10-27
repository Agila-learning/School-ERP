import axios from '../../../core/api/axios';

export interface TransportDashboardStats {
  totalVehicles: number;
  activeVehicles: number;
  totalRoutes: number;
  assignedStudents: number;
}

export interface Vehicle {
  _id: string;
  vehicleNumber: string;
  registrationNumber: string;
  vehicleType?: string;
  manufacturer?: string;
  modelName?: string;
  manufacturingYear?: number;
  seatingCapacity: number;
  totalCapacity?: number;
  fuelType?: string;
  insuranceExpiry?: string;
  fitnessExpiry?: string;
  permitExpiry?: string;
  status: 'AVAILABLE' | 'ASSIGNED' | 'ON_TRIP' | 'UNDER_MAINTENANCE' | 'OUT_OF_SERVICE' | 'RETIRED';
}

export interface Route {
  _id: string;
  name: string;
  direction: 'PICKUP' | 'DROP' | 'BOTH';
  defaultVehicleId?: any;
  defaultDriverId?: any;
  status: string;
}

export interface RouteStop {
  _id: string;
  name: string;
  sequence: number;
  pickupTime: string;
  dropoffTime: string;
}

export interface TransportAssignment {
  _id: string;
  studentId: any;
  routeId: any;
  pickupStopId: any;
  dropoffStopId: any;
  status: string;
}

export interface Trip {
  _id: string;
  routeId: any;
  vehicleId: any;
  driverId: any;
  status: string;
  date: string;
  actualStartTime?: string;
  actualEndTime?: string;
}

export const getTransportDashboardStats = async (): Promise<TransportDashboardStats> => {
  const res = await axios.get('/transport/dashboard');
  return res.data.data;
};

export const getVehicles = async (): Promise<Vehicle[]> => {
  const res = await axios.get('/transport/vehicles');
  return res.data.data;
};

export const createVehicle = async (data: Partial<Vehicle>): Promise<Vehicle> => {
  const res = await axios.post('/transport/vehicles', data);
  return res.data.data;
};

export const getRoutes = async (): Promise<Route[]> => {
  const res = await axios.get('/transport/routes');
  return res.data.data;
};

export const createRoute = async (data: Partial<Route>): Promise<Route> => {
  const res = await axios.post('/transport/routes', data);
  return res.data.data;
};

export const getRouteStops = async (routeId: string): Promise<RouteStop[]> => {
  const res = await axios.get(`/transport/routes/${routeId}/stops`);
  return res.data.data;
};

export const createRouteStop = async (routeId: string, data: Partial<RouteStop>): Promise<RouteStop> => {
  const res = await axios.post(`/transport/routes/${routeId}/stops`, data);
  return res.data.data;
};

export const getAssignments = async (routeId?: string): Promise<TransportAssignment[]> => {
  const res = await axios.get('/transport/assignments', { params: { routeId } });
  return res.data.data;
};

export const assignStudentTransport = async (data: any): Promise<TransportAssignment> => {
  const res = await axios.post('/transport/assignments', data);
  return res.data.data;
};

export const getTransportStaff = async (roleType?: string): Promise<any[]> => {
  const res = await axios.get('/transport/staff', { params: { roleType } });
  return res.data.data;
};

export const getTrips = async (date?: string): Promise<Trip[]> => {
  const res = await axios.get('/transport/trips', { params: { date } });
  return res.data.data;
};

export const startTrip = async (tripId: string, startOdometer: number): Promise<Trip> => {
  const res = await axios.post(`/transport/trips/${tripId}/start`, { startOdometer });
  return res.data.data;
};

export const endTrip = async (tripId: string, endOdometer: number): Promise<Trip> => {
  const res = await axios.post(`/transport/trips/${tripId}/end`, { endOdometer });
  return res.data.data;
};

export const recordBoarding = async (tripId: string, data: any): Promise<any> => {
  const res = await axios.post(`/transport/trips/${tripId}/boarding`, data);
  return res.data.data;
};

export const getLatestGPS = async (tripId: string): Promise<any> => {
  const res = await axios.get(`/transport/trips/${tripId}/gps`);
  return res.data.data;
};

export const deleteVehicle = async (id: string): Promise<any> => {
  const res = await axios.delete(`/transport/vehicles/${id}`);
  return res.data.data;
};

export const deleteRoute = async (id: string): Promise<any> => {
  const res = await axios.delete(`/transport/routes/${id}`);
  return res.data.data;
};

export const deleteRouteStop = async (routeId: string, stopId: string): Promise<any> => {
  const res = await axios.delete(`/transport/routes/${routeId}/stops/${stopId}`);
  return res.data.data;
};

export const removeAssignment = async (id: string): Promise<any> => {
  const res = await axios.delete(`/transport/assignments/${id}`);
  return res.data.data;
};

export const createTrip = async (data: Partial<Trip>): Promise<Trip> => {
  const res = await axios.post('/transport/trips', data);
  return res.data.data;
};

export const cancelTrip = async (tripId: string, reason?: string): Promise<Trip> => {
  const res = await axios.patch(`/transport/trips/${tripId}/cancel`, { reason });
  return res.data.data;
};

// --- Missing Update Endpoints ---
export const updateVehicle = async (id: string, data: Partial<Vehicle>): Promise<Vehicle> => {
  const res = await axios.patch(`/transport/vehicles/${id}`, data);
  return res.data.data;
};

export const updateRoute = async (id: string, data: Partial<Route>): Promise<Route> => {
  const res = await axios.patch(`/transport/routes/${id}`, data);
  return res.data.data;
};

export const updateRouteStop = async (routeId: string, stopId: string, data: Partial<RouteStop>): Promise<RouteStop> => {
  const res = await axios.patch(`/transport/routes/${routeId}/stops/${stopId}`, data);
  return res.data.data;
};

export const updateAssignment = async (id: string, data: Partial<TransportAssignment>): Promise<TransportAssignment> => {
  const res = await axios.patch(`/transport/assignments/${id}`, data);
  return res.data.data;
};

// --- Staff Endpoints ---
export const createStaff = async (data: any): Promise<any> => {
  const res = await axios.post('/transport/staff', data);
  return res.data.data;
};

export const updateStaff = async (id: string, data: any): Promise<any> => {
  const res = await axios.patch(`/transport/staff/${id}`, data);
  return res.data.data;
};

export const deleteStaff = async (id: string): Promise<any> => {
  const res = await axios.delete(`/transport/staff/${id}`);
  return res.data.data;
};

// --- Maintenance Endpoints ---
export const getMaintenanceRecords = async (vehicleId?: string): Promise<any[]> => {
  const res = await axios.get('/transport/maintenance', { params: { vehicleId } });
  return res.data.data;
};

export const createMaintenanceRecord = async (data: any): Promise<any> => {
  const res = await axios.post('/transport/maintenance', data);
  return res.data.data;
};

export const updateMaintenanceRecord = async (id: string, data: any): Promise<any> => {
  const res = await axios.patch(`/transport/maintenance/${id}`, data);
  return res.data.data;
};

export const deleteMaintenanceRecord = async (id: string): Promise<any> => {
  const res = await axios.delete(`/transport/maintenance/${id}`);
  return res.data.data;
};

// --- Reports Endpoints ---
export const getTransportReport = async (type: string, query?: any): Promise<any> => {
  const res = await axios.get('/transport/reports', { params: { type, ...query } });
  return res.data.data;
};

