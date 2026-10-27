import axiosInstance from '../../../core/api/axios';

// Dashboard Stats
export const getLabDashboardStats = async () => {
  try {
    const res = await axiosInstance.get('/lab/dashboard-stats');
    return res.data.data;
  } catch (err) {
    console.error('Failed to get lab dashboard stats:', err);
    throw err;
  }
};

// Laboratories
export const getLaboratories = async (branchId?: string) => {
  try {
    const res = await axiosInstance.get('/lab/laboratories', { params: { branchId } });
    return res.data.data || [];
  } catch (err) {
    console.error('Failed to get laboratories:', err);
    return [];
  }
};

export const createLaboratory = async (data: any) => {
  const res = await axiosInstance.post('/lab/laboratories', data);
  return res.data.data;
};

export const updateLaboratory = async (id: string, data: any) => {
  const res = await axiosInstance.patch(`/lab/laboratories/${id}`, data);
  return res.data.data;
};

export const deleteLaboratory = async (id: string) => {
  const res = await axiosInstance.delete(`/lab/laboratories/${id}`);
  return res.data;
};

// Equipment
export const getEquipment = async (laboratoryId?: string) => {
  try {
    const res = await axiosInstance.get('/lab/equipment', { params: { laboratoryId } });
    return res.data.data || [];
  } catch (err) {
    console.error('Failed to get equipment:', err);
    return [];
  }
};

export const createEquipment = async (data: any) => {
  const res = await axiosInstance.post('/lab/equipment', data);
  return res.data.data;
};

export const updateEquipment = async (id: string, data: any) => {
  const res = await axiosInstance.patch(`/lab/equipment/${id}`, data);
  return res.data.data;
};

export const deleteEquipment = async (id: string) => {
  const res = await axiosInstance.delete(`/lab/equipment/${id}`);
  return res.data;
};

// Inventory
export const getInventory = async (laboratoryId?: string) => {
  try {
    const res = await axiosInstance.get('/lab/inventory', { params: { laboratoryId } });
    return res.data.data || [];
  } catch (err) {
    console.error('Failed to get inventory:', err);
    return [];
  }
};

export const createInventory = async (data: any) => {
  const res = await axiosInstance.post('/lab/inventory', data);
  return res.data.data;
};

export const updateInventory = async (id: string, data: any) => {
  const res = await axiosInstance.patch(`/lab/inventory/${id}`, data);
  return res.data.data;
};

export const deleteInventory = async (id: string) => {
  const res = await axiosInstance.delete(`/lab/inventory/${id}`);
  return res.data;
};

// Bookings
export const getBookings = async (laboratoryId?: string) => {
  try {
    const res = await axiosInstance.get('/lab/bookings', { params: { laboratoryId } });
    return res.data.data || [];
  } catch (err) {
    console.error('Failed to get bookings:', err);
    return [];
  }
};

export const createBooking = async (data: any) => {
  const res = await axiosInstance.post('/lab/bookings', data);
  return res.data.data;
};

export const updateBooking = async (id: string, data: any) => {
  const res = await axiosInstance.patch(`/lab/bookings/${id}`, data);
  return res.data.data;
};

export const deleteBooking = async (id: string) => {
  const res = await axiosInstance.delete(`/lab/bookings/${id}`);
  return res.data;
};

// Sessions
export const getSessions = async (laboratoryId?: string) => {
  try {
    const res = await axiosInstance.get('/lab/sessions', { params: { laboratoryId } });
    return res.data.data || [];
  } catch (err) {
    console.error('Failed to get sessions:', err);
    return [];
  }
};

export const createSession = async (data: any) => {
  const res = await axiosInstance.post('/lab/sessions', data);
  return res.data.data;
};

export const updateSession = async (id: string, data: any) => {
  const res = await axiosInstance.patch(`/lab/sessions/${id}`, data);
  return res.data.data;
};

export const deleteSession = async (id: string) => {
  const res = await axiosInstance.delete(`/lab/sessions/${id}`);
  return res.data;
};
