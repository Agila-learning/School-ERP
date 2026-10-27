import axiosInstance from '../../../core/api/axios';

// Dashboard Stats
export const getSportsDashboardStats = async () => {
  try {
    const res = await axiosInstance.get('/sports/dashboard-stats');
    return res.data.data;
  } catch (err) {
    console.error('Failed to get sports dashboard stats:', err);
    throw err;
  }
};

// Teams
export const getSportsTeams = async (sportType?: string) => {
  try {
    const res = await axiosInstance.get('/sports/teams', { params: { sportType } });
    return res.data.data || [];
  } catch (err) {
    console.error('Failed to get sports teams:', err);
    return [];
  }
};

export const createSportsTeam = async (data: any) => {
  const res = await axiosInstance.post('/sports/teams', data);
  return res.data.data;
};

export const updateSportsTeam = async (id: string, data: any) => {
  const res = await axiosInstance.patch(`/sports/teams/${id}`, data);
  return res.data.data;
};

export const deleteSportsTeam = async (id: string) => {
  const res = await axiosInstance.delete(`/sports/teams/${id}`);
  return res.data;
};

// Events & Tournaments
export const getSportsEvents = async (sportType?: string) => {
  try {
    const res = await axiosInstance.get('/sports/events', { params: { sportType } });
    return res.data.data || [];
  } catch (err) {
    console.error('Failed to get sports events:', err);
    return [];
  }
};

export const createSportsEvent = async (data: any) => {
  const res = await axiosInstance.post('/sports/events', data);
  return res.data.data;
};

export const updateSportsEvent = async (id: string, data: any) => {
  const res = await axiosInstance.patch(`/sports/events/${id}`, data);
  return res.data.data;
};

export const deleteSportsEvent = async (id: string) => {
  const res = await axiosInstance.delete(`/sports/events/${id}`);
  return res.data;
};

// Equipment
export const getSportsEquipment = async (sportCategory?: string) => {
  try {
    const res = await axiosInstance.get('/sports/equipment', { params: { sportCategory } });
    return res.data.data || [];
  } catch (err) {
    console.error('Failed to get sports equipment:', err);
    return [];
  }
};

export const createSportsEquipment = async (data: any) => {
  const res = await axiosInstance.post('/sports/equipment', data);
  return res.data.data;
};

export const updateSportsEquipment = async (id: string, data: any) => {
  const res = await axiosInstance.patch(`/sports/equipment/${id}`, data);
  return res.data.data;
};

export const deleteSportsEquipment = async (id: string) => {
  const res = await axiosInstance.delete(`/sports/equipment/${id}`);
  return res.data;
};

// Practice Sessions
export const getPracticeSessions = async (sportType?: string) => {
  try {
    const res = await axiosInstance.get('/sports/sessions', { params: { sportType } });
    return res.data.data || [];
  } catch (err) {
    console.error('Failed to get practice sessions:', err);
    return [];
  }
};

export const createPracticeSession = async (data: any) => {
  const res = await axiosInstance.post('/sports/sessions', data);
  return res.data.data;
};

export const updatePracticeSession = async (id: string, data: any) => {
  const res = await axiosInstance.patch(`/sports/sessions/${id}`, data);
  return res.data.data;
};

export const deletePracticeSession = async (id: string) => {
  const res = await axiosInstance.delete(`/sports/sessions/${id}`);
  return res.data;
};
