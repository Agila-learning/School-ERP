import axios from '../../../core/api/axios';

export interface Complaint {
  _id?: string;
  id?: string;
  subject: string;
  description: string;
  category: 'ACADEMIC' | 'INFRASTRUCTURE' | 'TRANSPORT' | 'HOSTEL' | 'OTHER';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  status?: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  assignedTo?: any;
  resolution?: string;
  resolvedAt?: Date;
  userId?: any;
  createdAt?: string;
}

export const getComplaints = async (): Promise<Complaint[]> => {
  const res = await axios.get('/complaints');
  const d = res.data.data;
  return Array.isArray(d) ? d : (d?.data || []);
};

export const createComplaint = async (data: Partial<Complaint>): Promise<Complaint> => {
  const res = await axios.post('/complaints', data);
  return res.data.data;
};

export const updateComplaintStatus = async (id: string, updateData: Partial<Complaint>): Promise<Complaint> => {
  const res = await axios.patch(`/complaints/${id}`, updateData);
  return res.data.data;
};
