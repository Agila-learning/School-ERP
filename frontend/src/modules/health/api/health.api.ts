import api from '../../../core/api/axios';

export interface MedicalEmergency {
  _id: string;
  emergencyNumber: string;
  studentId?: string;
  personName?: string;
  personType?: 'STUDENT' | 'STAFF' | 'VISITOR' | 'OTHER';
  date: string;
  time: string;
  location: string;
  symptomsObserved: string;
  immediateAction?: string;
  parentContacted: boolean;
  notes?: string;
  outcome?: string;
  status: 'REPORTED' | 'UNDER_RESPONSE' | 'PARENT_CONTACTED' | 'TRANSFERRED' | 'HOSPITALIZED' | 'RESOLVED' | 'FOLLOW_UP_REQUIRED' | 'CLOSED';
  createdAt?: string;
}

export interface MedicalVisit {
  _id: string;
  visitNumber: string;
  studentId?: string;
  studentName?: string;
  date: string;
  time: string;
  reason: string;
  visitType: 'ROUTINE' | 'FIRST_AID' | 'ILLNESS' | 'INJURY' | 'EMERGENCY' | 'FOLLOW_UP' | 'HEALTH_SCREENING' | 'MEDICATION' | 'OTHER';
  symptoms?: string[];
  observedCondition?: string;
  assessment?: string;
  firstAidGiven?: string;
  instructions?: string;
  disposition: string;
  providerId?: any;
  providerName?: string;
  status: 'REGISTERED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  createdAt?: string;
}

export interface HealthIncident {
  _id: string;
  studentId?: any;
  employeeId?: any;
  personName?: string;
  type: string;
  description: string;
  location: string;
  date: string;
  time: string;
  immediateAction?: string;
  firstAidGiven: boolean;
  referredToHospital: boolean;
  parentNotified: boolean;
  status: 'REPORTED' | 'UNDER_INVESTIGATION' | 'RESOLVED' | 'CLOSED';
}

export const healthApi = {
  // Emergencies
  getEmergencies: async (studentId?: string) => {
    const res = await api.get('/health/emergencies', { params: { studentId } });
    return res.data?.data || [];
  },
  reportEmergency: async (data: Partial<MedicalEmergency>) => {
    const res = await api.post('/health/emergencies', data);
    return res.data?.data;
  },
  updateEmergencyStatus: async (id: string, status: string, notes?: string) => {
    const res = await api.patch(`/health/emergencies/${id}/status`, { status, notes });
    return res.data?.data;
  },
  deleteEmergency: async (id: string) => {
    const res = await api.delete(`/health/emergencies/${id}`);
    return res.data;
  },

  // Visits & First Aid
  getVisits: async (params?: { visitType?: string; status?: string; studentId?: string }) => {
    const res = await api.get('/health/visits', { params });
    return res.data?.data || [];
  },
  createVisit: async (data: Partial<MedicalVisit>) => {
    const res = await api.post('/health/visits', data);
    return res.data?.data;
  },
  updateVisit: async (id: string, data: Partial<MedicalVisit>) => {
    const res = await api.patch(`/health/visits/${id}`, data);
    return res.data?.data;
  },
  deleteVisit: async (id: string) => {
    const res = await api.delete(`/health/visits/${id}`);
    return res.data;
  },

  // Incidents
  getIncidents: async () => {
    const res = await api.get('/health/incidents');
    return res.data?.data || [];
  },
  reportIncident: async (data: any) => {
    const res = await api.post('/health/incidents', data);
    return res.data?.data;
  },

  // Wellness
  getWellnessPrograms: async () => {
    const res = await api.get('/health/wellness/programs');
    return res.data?.data || [];
  },
  createWellnessProgram: async (data: any) => {
    const res = await api.post('/health/wellness/programs', data);
    return res.data?.data;
  },

  // Medication
  getMedications: async () => {
    const res = await api.get('/health/medications');
    return res.data?.data || [];
  },
  administerMedication: async (data: any) => {
    const res = await api.post('/health/medications/administer', data);
    return res.data?.data;
  },

  // Screening
  getScreenings: async () => {
    const res = await api.get('/health/screenings');
    return res.data?.data || [];
  },

  // Student Health Profiles
  getHealthProfile: async (studentId: string) => {
    const res = await api.get(`/health/students/${studentId}/profile`);
    return res.data?.data;
  },
  updateHealthProfile: async (studentId: string, data: any) => {
    const res = await api.put(`/health/students/${studentId}/profile`, data);
    return res.data?.data;
  },
  getStudentsList: async (search?: string) => {
    const res = await api.get('/students/search', { params: { search, limit: 50 } });
    return res.data?.data?.students || res.data?.data || [];
  }
};
