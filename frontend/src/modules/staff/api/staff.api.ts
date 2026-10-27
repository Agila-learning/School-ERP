export interface DepartmentSummary {
  id: string;
  name: string;
  code: string;
  headOfDepartment?: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface DesignationSummary {
  id: string;
  name: string;
  code: string;
  departmentId?: string;
  level?: number;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface StaffSummary {
  id: string;
  employeeIdNumber: string;
  firstName: string;
  lastName: string;
  photoUrl?: string;
  departmentName: string;
  designationName: string;
  employmentType: string;
  branchName: string;
  status: 'ACTIVE' | 'ON_LEAVE' | 'TERMINATED' | 'RESIGNED' | 'SUSPENDED';
}

export interface StaffProfileDetail extends StaffSummary {
  email: string;
  mobile: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  address: {
    current: string;
    permanent?: string;
  };
  joiningDate: string;
  qualifications: {
    degree: string;
    institution: string;
    year: string;
  }[];
  experience: {
    organization: string;
    role: string;
    duration: string;
  }[];
  isTeacher: boolean;
}

import api from '../../../core/api/axios';



export const getStaffList = async (): Promise<StaffSummary[]> => {
  const res = await api.get('/hr/employees');
  const staffArray = Array.isArray(res.data.data) ? res.data.data : (res.data.data?.data || []);
  return staffArray.map((emp: any) => ({
    id: emp._id,
    employeeIdNumber: emp.employeeIdNumber,
    firstName: emp.firstName,
    lastName: emp.lastName,
    photoUrl: emp.photoUrl,
    departmentName: emp.departmentId || 'N/A', // Mapped from ID if populated
    designationName: emp.designationId || 'N/A',
    employmentType: emp.employmentType,
    branchName: emp.branchId || 'N/A',
    status: emp.status,
  }));
};

export const getStaffById = async (id: string): Promise<StaffProfileDetail | null> => {
  const res = await api.get(`/hr/employees/${id}`);
  const emp = res.data.data;
  return {
    id: emp._id,
    employeeIdNumber: emp.employeeIdNumber,
    firstName: emp.firstName,
    lastName: emp.lastName,
    photoUrl: emp.photoUrl,
    departmentName: emp.departmentId || 'N/A',
    designationName: emp.designationId || 'N/A',
    employmentType: emp.employmentType,
    branchName: emp.branchId || 'N/A',
    status: emp.status,
    email: emp.email,
    mobile: emp.mobile,
    emergencyContact: emp.emergencyContact || { name: 'N/A', relationship: 'N/A', phone: 'N/A' },
    address: emp.address || { current: 'N/A' },
    joiningDate: emp.joiningDate,
    qualifications: emp.qualifications || [],
    experience: emp.experience || [],
    isTeacher: emp.isTeacher || false,
  };
};

export const createStaff = async (data: any): Promise<any> => {
  const res = await api.post('/hr/employees', data);
  return res.data;
};

export const getDepartments = async (): Promise<DepartmentSummary[]> => {
  const res = await api.get('/hr/departments');
  const d = res.data.data;
  return Array.isArray(d) ? d : (d?.data || []);
};

export const getDesignations = async (): Promise<DesignationSummary[]> => {
  const res = await api.get('/hr/designations'); 
  const d = res.data.data;
  return Array.isArray(d) ? d : (d?.data || []);
};

