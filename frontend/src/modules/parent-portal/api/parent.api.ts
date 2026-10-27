import api from '../../../core/api/axios';

export const getParentDashboard = async () => {
  const response = await api.get('/parent-portal/dashboard');
  return response.data.data;
};

export const getChildAcademicInfo = async (studentId: string) => {
  const response = await api.get(`/parent-portal/children/${studentId}/academic`);
  return response.data.data;
};

export const getChildAttendanceInfo = async (studentId: string) => {
  const response = await api.get(`/parent-portal/children/${studentId}/attendance`);
  return response.data.data;
};

export const getChildFeesInfo = async (studentId: string) => {
  const response = await api.get(`/parent-portal/children/${studentId}/fees`);
  return response.data.data;
};