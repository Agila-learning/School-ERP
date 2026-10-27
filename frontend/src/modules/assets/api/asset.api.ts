import api from '../../../core/api/axios';

export interface AssetCategory {
  _id: string;
  name: string;
  description?: string;
  isActive: boolean;
}

export interface Asset {
  _id: string;
  assetTag: string;
  itemId?: any;
  categoryId?: AssetCategory;
  serialNumber?: string;
  status: string;
  assignedToEmployeeId?: any;
  assignedToDepartmentId?: any;
}

export const getAssetCategories = async () => (await api.get('/assets/categories')).data.data;
export const createAssetCategory = async (data: any) => (await api.post('/assets/categories', data)).data.data;
export const updateAssetCategory = async (id: string, data: any) => (await api.put(`/assets/categories/${id}`, data)).data.data;
export const deleteAssetCategory = async (id: string) => (await api.delete(`/assets/categories/${id}`)).data.data;

export const getAssets = async () => (await api.get('/assets')).data.data;
export const createAsset = async (data: any) => (await api.post('/assets', data)).data.data;
export const updateAsset = async (id: string, data: any) => (await api.put(`/assets/${id}`, data)).data.data;
export const deleteAsset = async (id: string) => (await api.delete(`/assets/${id}`)).data.data;

export const allocateAsset = async (id: string, data: any) => (await api.post(`/assets/${id}/allocate`, data)).data.data;
export const returnAsset = async (id: string, data: any) => (await api.post(`/assets/${id}/return`, data)).data.data;
export const transferAsset = async (id: string, data: any) => (await api.post(`/assets/${id}/transfer`, data)).data.data;
export const createMaintenance = async (id: string, data: any) => (await api.post(`/assets/${id}/maintenance`, data)).data.data;
export const disposeAsset = async (id: string, data: any) => (await api.post(`/assets/${id}/dispose`, data)).data.data;
