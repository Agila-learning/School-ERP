import axios from '../../../core/api/axios';

// Interfaces
export interface DashboardStats {
  todaysCollection: number;
  totalOutstanding: number;
  onlineCollectionsMTD: number;
}

export interface FeeHead {
  _id?: string;
  name: string;
  code: string;
  description?: string;
  category: 'ACADEMIC' | 'TRANSPORT' | 'HOSTEL' | 'MISCELLANEOUS';
  isTaxable: boolean;
  isRefundable: boolean;
  isActive?: boolean;
}

export interface FeeStructure {
  _id?: string;
  academicYearId: string;
  branchId: string;
  classId?: string;
  feeHeadId: any; // Can be string or populated object
  totalAmount: number;
  frequency: 'ONE_TIME' | 'MONTHLY' | 'QUARTERLY' | 'HALF_YEARLY' | 'ANNUAL' | 'CUSTOM';
  effectiveDate: string;
  isActive?: boolean;
}

export interface Invoice {
  _id: string;
  invoiceNumber: string;
  studentId: any;
  dueDate: string;
  status: string;
  items?: any[];
  subTotal?: number;
  totalDiscount?: number;
  totalLateFee?: number;
  grandTotal: number;
  amountPaid: number;
  balanceDue: number;
}

export interface ScholarshipDiscount {
  _id?: string;
  academicYearId?: string;
  studentId?: string;
  feeHeadId?: string;
  name: string;
  type: 'PERCENTAGE' | 'FIXED_AMOUNT';
  value: number;
  reason?: string;
  isActive?: boolean;
}

// API Calls
export const getFinanceDashboardStats = async (): Promise<DashboardStats> => {
  const res = await axios.get('/finance/dashboard');
  return res.data.data;
};

export const getFeeHeads = async (): Promise<FeeHead[]> => {
  const res = await axios.get('/finance/setup/heads');
  const d = res.data.data;
  const arr = Array.isArray(d) ? d : (d?.data || []);
  return arr.map((item: any) => ({ ...item, id: item.id || item._id }));
};

export const createFeeHead = async (data: Partial<FeeHead>): Promise<FeeHead> => {
  const res = await axios.post('/finance/setup/heads', data);
  return res.data.data;
};

export const updateFeeHead = async (id: string, data: Partial<FeeHead>): Promise<FeeHead> => {
  const res = await axios.put(`/finance/setup/heads/${id}`, data);
  return res.data.data;
};

export const deactivateFeeHead = async (id: string): Promise<void> => {
  await axios.delete(`/finance/setup/heads/${id}`);
};

export const getFeeStructures = async (params: any = {}): Promise<FeeStructure[]> => {
  const res = await axios.get('/finance/setup/structures', { params });
  const d = res.data.data;
  const arr = Array.isArray(d) ? d : (d?.data || []);
  return arr.map((item: any) => ({ ...item, id: item.id || item._id }));
};

export const createFeeStructure = async (data: Partial<FeeStructure>): Promise<FeeStructure> => {
  const res = await axios.post('/finance/setup/structures', data);
  return res.data.data;
};

export const updateFeeStructure = async (id: string, data: Partial<FeeStructure>): Promise<FeeStructure> => {
  const res = await axios.put(`/finance/setup/structures/${id}`, data);
  return res.data.data;
};

export const deactivateFeeStructure = async (id: string): Promise<void> => {
  await axios.delete(`/finance/setup/structures/${id}`);
};

export const getStudentInvoices = async (studentId: string): Promise<Invoice[]> => {
  const res = await axios.get(`/finance/invoices/${studentId}`);
  return res.data.data.invoices || [];
};

export const getStudentLedger = async (studentId: string): Promise<any[]> => {
  const res = await axios.get(`/finance/ledger/${studentId}`);
  const d = res.data.data;
  const arr = Array.isArray(d) ? d : (d?.data || []);
  return arr.map((item: any) => ({ ...item, id: item.id || item._id }));
};

export const initiateOfflinePayment = async (invoiceId: string, amount: number, method: string, referenceNumber?: string) => {
  const res = await axios.post('/finance/payments/offline', { invoiceId, amount, method, referenceNumber });
  return res.data.data;
};

export const generateInvoices = async (academicYearId: string, branchId: string, classId: string, dueDate: string) => {
  const res = await axios.post('/finance/setup/generate-invoices', { academicYearId, branchId, classId, dueDate });
  return res.data.data;
};

// Discounts API
export const getDiscounts = async (): Promise<ScholarshipDiscount[]> => {
  const res = await axios.get('/finance/setup/discounts');
  const d = res.data.data;
  const arr = Array.isArray(d) ? d : (d?.data || []);
  return arr.map((item: any) => ({ ...item, id: item.id || item._id }));
};

export const createDiscount = async (data: Partial<ScholarshipDiscount>): Promise<ScholarshipDiscount> => {
  const res = await axios.post('/finance/setup/discounts', data);
  return res.data.data;
};

export const updateDiscount = async (id: string, data: Partial<ScholarshipDiscount>): Promise<ScholarshipDiscount> => {
  const res = await axios.put(`/finance/setup/discounts/${id}`, data);
  return res.data.data;
};

export const deactivateDiscount = async (id: string): Promise<void> => {
  await axios.delete(`/finance/setup/discounts/${id}`);
};

// Ad-Hoc Invoices & Adjustments
export const assignFee = async (studentId: string, feeHeadId: string, amount: number, dueDate: string, academicYearId: string) => {
  const res = await axios.post('/finance/invoices/assign', { studentId, feeHeadId, amount, dueDate, academicYearId });
  return res.data.data;
};

export const adjustInvoice = async (invoiceId: string, discountAmount: number, reason: string) => {
  const res = await axios.put(`/finance/invoices/${invoiceId}/adjust`, { discountAmount, reason });
  return res.data.data;
};

export const addFine = async (invoiceId: string, fineAmount: number, reason: string) => {
  const res = await axios.post(`/finance/invoices/${invoiceId}/fines`, { fineAmount, reason });
  return res.data.data;
};
