import axios from '../../../core/api/axios';

export interface AuditLog {
  _id: string;
  action: string;
  entityType: string;
  entityId: string;
  performedBy: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  changes?: Record<string, any>;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface AuditLogResponse {
  data: AuditLog[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const getAuditLogs = async (params: any = {}): Promise<AuditLogResponse> => {
  const response = await axios.get('/audit-logs', { params });
  return response.data;
};