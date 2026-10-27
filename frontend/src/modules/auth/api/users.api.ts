import api from '../../../core/api/axios';

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  roleIds: any[];
  accountStatus: string;
  createdAt: string;
}

export interface Invitation {
  _id: string;
  email: string;
  roleId: any;
  status: string;
  invitedBy: any;
  expiresAt: string;
  createdAt: string;
}

export const getUsers = async (params?: any): Promise<{ users: User[], pagination: any }> => {
  const response = await api.get('/api/users', { params });
  return response.data.data;
};

export const getRoles = async (): Promise<any[]> => {
  const response = await api.get('/api/users/roles');
  return response.data.data;
};

export const createUser = async (userData: any): Promise<User> => {
  const response = await api.post('/api/users', userData);
  return response.data.data;
};

export const getUserById = async (id: string): Promise<User> => {
  const response = await api.get(`/api/users/${id}`);
  return response.data.data;
};

export const updateUser = async (id: string, userData: any): Promise<User> => {
  const response = await api.put(`/api/users/${id}`, userData);
  return response.data.data;
};

export const updateUserStatus = async (id: string, status: string): Promise<void> => {
  await api.put(`/api/users/${id}/status`, { status });
};

export const updateUserRoles = async (id: string, roleIds: string[]): Promise<void> => {
  await api.put(`/api/users/${id}/roles`, { roleIds });
};

export const deactivateUser = async (id: string): Promise<void> => {
  await api.delete(`/api/users/${id}`);
};

export const getInvitations = async (params?: any): Promise<{ invitations: Invitation[], pagination: any }> => {
  const response = await api.get('/api/invitations', { params });
  return response.data.data;
};

export const inviteUser = async (email: string, roleId: string): Promise<void> => {
  await api.post('/api/auth/invite', { email, roleId });
};

export const resendInvitation = async (id: string): Promise<void> => {
  await api.post(`/api/invitations/${id}/resend`);
};

export const revokeInvitation = async (id: string): Promise<void> => {
  await api.post(`/api/invitations/${id}/revoke`);
};
