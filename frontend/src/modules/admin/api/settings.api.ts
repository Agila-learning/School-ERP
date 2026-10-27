import api from '../../../core/api/axios';

export interface Setting {
  id?: string;
  key: string;
  group: string;
  value: any;
  description?: string;
  isSystem?: boolean;
}

export const getSettingsByGroup = async (group: string): Promise<Setting[]> => {
  const response = await api.get('/config/settings', { params: { group } });
  const d = response.data.data;
  return Array.isArray(d) ? d : (d?.data || []);
};

export const updateSetting = async (id: string, data: Partial<Setting>): Promise<Setting> => {
  const response = await api.put(`/config/settings/${id}`, data);
  return response.data.data;
};

export const bulkUpdateSettings = async (settings: Partial<Setting>[]): Promise<Setting[]> => {
  const response = await api.post('/config/settings/bulk', { settings });
  return response.data.data;
};
