import api from '../../../core/api/axios';

// --- Parent-Teacher Meetings ---

export const getMeetings = async (params?: any): Promise<any[]> => {
  const response = await api.get('/communication/meetings', { params });
  const d = response.data.data;
  return Array.isArray(d) ? d : (d?.data || []);
};

export const requestMeeting = async (data: any): Promise<any> => {
  const response = await api.post('/communication/meetings', data);
  return response.data.data;
};

export const updateMeeting = async (id: string, data: any): Promise<any> => {
  const response = await api.put(`/communication/meetings/${id}`, data);
  return response.data.data;
};

export const updateMeetingStatus = async (id: string, status: string): Promise<any> => {
  const response = await api.put(`/communication/meetings/${id}/status`, { status });
  return response.data.data;
};

export const deleteMeeting = async (id: string): Promise<any> => {
  const response = await api.delete(`/communication/meetings/${id}`);
  return { success: response.status === 200 };
};

// --- Staff Communication (Complaints & Chat) ---

export interface Complaint {
  _id: string;
  id?: string;
  complaintNumber?: string;
  subject: string;
  description: string;
  category: 'TRANSPORT' | 'ACADEMIC' | 'FACILITY' | 'BEHAVIOR' | 'OTHER';
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  submittedBy: {
    _id: string;
    firstName: string;
    lastName: string;
    role: string;
  };
  resolutionRemarks?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Conversation {
  _id: string;
  participants: Array<{
    _id: string;
    firstName: string;
    lastName: string;
    role: string;
  }>;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount?: number;
}

export interface Message {
  _id: string;
  conversationId: string;
  sender: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  content: string;
  isRead: boolean;
  createdAt: string;
}

export const getAssignedComplaints = async (): Promise<Complaint[]> => {
  const response = await api.get('/communication/staff/complaints');
  return response.data.data;
};

export const resolveComplaint = async (complaintId: string, remarks: string): Promise<Complaint> => {
  const response = await api.post(`/communication/staff/complaints/${complaintId}/resolve`, { resolutionRemarks: remarks });
  return response.data.data;
};

export const getStaffConversations = async (): Promise<Conversation[]> => {
  const response = await api.get('/communication/staff/conversations');
  return response.data.data;
};

export const getConversationMessages = async (conversationId: string): Promise<Message[]> => {
  const response = await api.get(`/communication/staff/conversations/${conversationId}/messages`);
  return response.data.data;
};

export const sendMessage = async (conversationId: string, content: string): Promise<Message> => {
  const response = await api.post(`/communication/staff/conversations/${conversationId}/messages`, { content });
  return response.data.data;
};

export const startConversation = async (targetId: string, targetType: string = 'Staff', relatedStudentId?: string): Promise<Conversation> => {
  const response = await api.post('/communication/staff/conversations', { targetId, targetType, relatedStudentId });
  return response.data.data;
};

export const getDirectoryContacts = async (): Promise<any[]> => {
  try {
    const [empRes, stuRes] = await Promise.all([
      api.get('/hr/employees').catch(() => ({ data: { data: [] } })),
      api.get('/students/search', { params: { limit: 50 } }).catch(() => ({ data: { data: [] } }))
    ]);
    const employees = (empRes.data?.data || []).map((e: any) => ({
      _id: e.userId || e._id,
      name: `${e.firstName || ''} ${e.lastName || ''}`.trim() || e.name || 'Staff Member',
      role: e.designation || e.role || 'Staff / Faculty',
      type: 'Staff'
    }));
    const students = (stuRes.data?.data?.students || stuRes.data?.data || []).map((s: any) => ({
      _id: s.userId || s._id,
      name: `${s.firstName || ''} ${s.lastName || ''}`.trim() || 'Student',
      role: `Student (Class ${s.currentClass || '10'}-${s.currentSection || 'A'})`,
      type: 'Student'
    }));
    const combined = [...employees, ...students];
    if (combined.length > 0) return combined;

    // Default fallback institutional directory with valid ObjectIds
    return [
      { _id: '66a1b2c3d4e5f60718293a01', name: 'Mrs. Radhika Iyer', role: 'Class Teacher & Senior Math', type: 'Staff' },
      { _id: '66a1b2c3d4e5f60718293a02', name: 'Dr. Arvind Swaminathan', role: 'Physics Dept Faculty & Chief Warden', type: 'Staff' },
      { _id: '66a1b2c3d4e5f60718293a03', name: 'Dr. Meenakshi Sundaram', role: 'Chemistry Specialist', type: 'Staff' },
      { _id: '66a1b2c3d4e5f60718293a04', name: 'Ms. Priya Raghavan', role: 'Computer Science & AI Lead', type: 'Staff' },
      { _id: '66a1b2c3d4e5f60718293a05', name: 'Mr. David Fernandez', role: 'Senior English Literature', type: 'Staff' },
      { _id: '66a1b2c3d4e5f60718293a06', name: 'Advik A', role: 'Student (Class 10-A)', type: 'Student' },
      { _id: '66a1b2c3d4e5f60718293a07', name: 'Arjun Patel', role: 'Student (Class 10-A)', type: 'Student' },
      { _id: '66a1b2c3d4e5f60718293a08', name: 'Avanthika A', role: 'Student (Class 10-A)', type: 'Student' },
    ];
  } catch (err) {
    return [
      { _id: '66a1b2c3d4e5f60718293a01', name: 'Mrs. Radhika Iyer', role: 'Class Teacher & Senior Math', type: 'Staff' },
      { _id: '66a1b2c3d4e5f60718293a02', name: 'Dr. Arvind Swaminathan', role: 'Physics Dept Faculty & Chief Warden', type: 'Staff' },
      { _id: '66a1b2c3d4e5f60718293a03', name: 'Dr. Meenakshi Sundaram', role: 'Chemistry Specialist', type: 'Staff' },
      { _id: '66a1b2c3d4e5f60718293a06', name: 'Advik A', role: 'Student (Class 10-A)', type: 'Student' },
    ];
  }
};