import axiosInstance from '../../../core/api/axios';

export const getApplications = async (params: any = {}) => {
  const response = await axiosInstance.get('/admission/applications', { params });
  return response.data;
};

export const approveApplication = async (applicationId: string, assignedSectionId: string, generatePortalAccess: boolean) => {
  const response = await axiosInstance.post('/admission/applications/approve', {
    applicationId,
    assignedSectionId,
    generatePortalAccess
  });
  return response.data;
};

export const submitApplication = async (data: any) => {
  const response = await axiosInstance.post('/admission/applications', data);
  return response.data;
};
