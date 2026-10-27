import api from '../../../core/api/axios';

export interface School {
  _id: string;
  name: string;
  code: string;
  status: string;
}

export interface Branch {
  _id: string;
  name: string;
  code: string;
  schoolId?: any;
  phone?: string;
  email?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };
  workingHours?: {
    start?: string;
    end?: string;
  };
  status: 'ACTIVE' | 'INACTIVE';
  createdAt?: string;
}

export const fetchSchools = async (page = 1, limit = 10) => {
  const { data } = await api.get(`/organization/schools?skip=${(page - 1) * limit}&limit=${limit}`);
  return data;
};

export const createSchool = async (schoolData: Partial<School>) => {
  const { data } = await api.post('/organization/schools', schoolData);
  return data;
};

export const fetchBranches = async () => {
  const { data } = await api.get('/organization/branches');
  return data;
};

export const createBranch = async (branchData: Partial<Branch>) => {
  const { data } = await api.post('/organization/branches', branchData);
  return data;
};

export const updateBranch = async (id: string, branchData: Partial<Branch>) => {
  const { data } = await api.put(`/organization/branches/${id}`, branchData);
  return data;
};

export const createCampus = async (campusData: any) => {
  const { data } = await api.post('/organization/campuses', campusData);
  return data;
};

