import api from '../../../core/api/axios';

export interface Category {
  _id: string;
  name: string;
  code: string;
  description?: string;
  isActive: boolean;
}

export interface Item {
  _id: string;
  sku: string;
  itemName: string;
  categoryId: Category;
  itemType: string;
  unit: string;
  brand?: string;
  description?: string;
  trackStock: boolean;
  isActive: boolean;
}

export interface Warehouse {
  _id: string;
  name: string;
  code: string;
  location?: string;
  isActive: boolean;
}

export const getCategories = async () => (await api.get('/inventory/categories')).data.data;
export const createCategory = async (data: any) => (await api.post('/inventory/categories', data)).data.data;
export const updateCategory = async (id: string, data: any) => (await api.put(`/inventory/categories/${id}`, data)).data.data;
export const deleteCategory = async (id: string) => (await api.delete(`/inventory/categories/${id}`)).data.data;

export const getItems = async () => (await api.get('/inventory/items')).data.data;
export const createItem = async (data: any) => (await api.post('/inventory/items', data)).data.data;
export const updateItem = async (id: string, data: any) => (await api.put(`/inventory/items/${id}`, data)).data.data;
export const deleteItem = async (id: string) => (await api.delete(`/inventory/items/${id}`)).data.data;

export const getWarehouses = async () => (await api.get('/inventory/warehouses')).data.data;
export const createWarehouse = async (data: any) => (await api.post('/inventory/warehouses', data)).data.data;
export const updateWarehouse = async (id: string, data: any) => (await api.put(`/inventory/warehouses/${id}`, data)).data.data;
export const deleteWarehouse = async (id: string) => (await api.delete(`/inventory/warehouses/${id}`)).data.data;

export const getStockBalances = async () => (await api.get('/inventory/stock-balances')).data.data;
export const getStockMovements = async () => (await api.get('/inventory/stock-movements')).data.data;

export const issueStock = async (data: any) => (await api.post('/inventory/issue', data)).data.data;
export const returnStock = async (data: any) => (await api.post('/inventory/return', data)).data.data;
export const transferStock = async (data: any) => (await api.post('/inventory/transfer', data)).data.data;
export const adjustStock = async (data: any) => (await api.post('/inventory/adjust', data)).data.data;
