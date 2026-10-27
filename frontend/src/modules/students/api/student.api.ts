export interface StudentSummary {
  id: string;
  studentIdNumber: string;
  firstName: string;
  lastName: string;
  gender: string;
  dateOfBirth: string;
  status: string;
  photoUrl?: string;
  currentClass?: string;
  currentSection?: string;
  academicYear?: string;
}

export interface StudentProfileDetail extends StudentSummary {
  middleName?: string;
  bloodGroup?: string;
  nationality: string;
  motherTongue?: string;
  category?: string;
  religion?: string;
  emergencyContacts: {
    name: string;
    relationship: string;
    mobile: string;
    priority: number;
  }[];
  parents: {
    relationship: string;
    firstName: string;
    lastName: string;
    mobile: string;
    email?: string;
    isEmergencyContact: boolean;
  }[];
}

export interface AdmissionApplication {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  nationality: string;
  applyingClassId: string;
  address: {
    current: string;
    permanent?: string;
  };
  parents: {
    relationship: string;
    firstName: string;
    lastName: string;
    mobile: string;
  }[];
  documents: {
    type: string;
    url: string; // Cloudinary URL
  }[];
}

import axiosInstance from '../../../core/api/axios';

// Removed mock mode flag and imports

export const getStudents = async (params?: any): Promise<StudentSummary[]> => {
  const response = await axiosInstance.get('/students/search', { params });
  return response.data.data;
};

export const getStudentProfile = async (id: string): Promise<StudentProfileDetail> => {
  const response = await axiosInstance.get(`/students/${id}`);
  return response.data.data;
};

export const createStudent = async (data: any): Promise<{ success: boolean; data?: any; error?: string }> => {
  try {
    const response = await axiosInstance.post('/students', data);
    return { success: true, data: response.data.data };
  } catch (error: any) {
    console.error('Failed to create student:', error);
    return { success: false, error: error.response?.data?.message || 'Failed to create student' };
  }
};

export const submitAdmissionApplication = async (data: any): Promise<{ success: boolean; applicationId: string; error?: string }> => {
  try {
    const response = await axiosInstance.post('/admission/applications', data);
    return { success: true, applicationId: response.data.data?._id || 'APP-SUCCESS' };
  } catch (error: any) {
    console.error('Admission submission failed:', error);
    return { success: false, applicationId: '', error: error.response?.data?.message || 'Failed to submit admission' };
  }
};

export const updateStudentProfile = async (id: string, data: any): Promise<{ success: boolean; data?: any; error?: string }> => {
  try {
    const response = await axiosInstance.put(`/students/${id}`, data);
    return { success: true, data: response.data.data };
  } catch (error: any) {
    console.error(`Failed to update student profile ${id}:`, error);
    return { success: false, error: error.response?.data?.message || 'Failed to update profile' };
  }
};

export const deactivateStudent = async (id: string): Promise<{ success: boolean; error?: string }> => {
  try {
    await axiosInstance.delete(`/students/${id}`);
    return { success: true };
  } catch (error: any) {
    console.error(`Failed to deactivate student ${id}:`, error);
    return { success: false, error: error.response?.data?.message || 'Failed to deactivate student' };
  }
};

// ─── Student Documents CRUD (Office Staff / Office Admin / School Admin) ───

export const getStudentDocuments = async (params?: any): Promise<any[]> => {
  try {
    const response = await axiosInstance.get('/students/documents/all', { params });
    return response.data.data || [];
  } catch (error) {
    console.error('Failed to fetch student documents:', error);
    return [];
  }
};

export const createStudentDocument = async (data: any): Promise<{ success: boolean; data?: any; error?: string }> => {
  try {
    const response = await axiosInstance.post('/students/documents', data);
    return { success: true, data: response.data.data };
  } catch (error: any) {
    console.error('Failed to create student document:', error);
    return { success: false, error: error.response?.data?.message || 'Failed to create student document' };
  }
};

export const updateStudentDocument = async (docId: string, data: any): Promise<{ success: boolean; data?: any; error?: string }> => {
  try {
    const response = await axiosInstance.put(`/students/documents/${docId}`, data);
    return { success: true, data: response.data.data };
  } catch (error: any) {
    console.error(`Failed to update student document ${docId}:`, error);
    return { success: false, error: error.response?.data?.message || 'Failed to update student document' };
  }
};

export const deleteStudentDocument = async (docId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    await axiosInstance.delete(`/students/documents/${docId}`);
    return { success: true };
  } catch (error: any) {
    console.error(`Failed to delete student document ${docId}:`, error);
    return { success: false, error: error.response?.data?.message || 'Failed to delete student document' };
  }
};

