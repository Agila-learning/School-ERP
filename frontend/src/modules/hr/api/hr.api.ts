import axiosInstance from '../../../core/api/axios';

export const getEmployees = async (params?: any) => {
  try {
    const response = await axiosInstance.get('/hr/employees', { params });
    const d = response.data.data;
    return Array.isArray(d) ? d : (d?.data || []);
  } catch (error) {
    console.error('Failed to fetch employees:', error);
    return [];
  }
};

export const onboardEmployee = async (data: any) => {
  try {
    const response = await axiosInstance.post('/hr/employees', data);
    return { success: true, data: response.data.data };
  } catch (error: any) {
    console.error('Employee onboarding failed:', error);
    return { success: false, error: error.response?.data?.message || 'Failed to onboard employee' };
  }
};

export const updateEmployee = async (id: string, data: any) => {
  try {
    const response = await axiosInstance.put(`/hr/employees/${id}`, data);
    return { success: true, data: response.data.data };
  } catch (error: any) {
    console.error(`Failed to update employee ${id}:`, error);
    return { success: false, error: error.response?.data?.message || 'Failed to update employee' };
  }
};

export const deactivateEmployee = async (id: string) => {
  try {
    await axiosInstance.delete(`/hr/employees/${id}`);
    return { success: true };
  } catch (error: any) {
    console.error(`Failed to deactivate employee ${id}:`, error);
    return { success: false, error: error.response?.data?.message || 'Failed to deactivate employee' };
  }
};

// --- SELF SERVICE ---
export const getMyProfile = async () => {
  const res = await axiosInstance.get('/hr/my-profile');
  return res.data?.data || null;
};
export const getMyPayslips = async () => {
  const res = await axiosInstance.get('/hr/my-payslips');
  return res.data?.data || [];
};

// --- DASHBOARD STATS ---
export const getDashboardStats = async () => {
  const res = await axiosInstance.get('/hr/dashboard-stats');
  return res.data?.data || null;
};

// --- DEPARTMENT ---
export const getDepartments = async () => {
  const res = await axiosInstance.get('/hr/departments');
  return res.data?.data || [];
};
export const createDepartment = async (data: any) => {
  const res = await axiosInstance.post('/hr/departments', data);
  return res.data?.data;
};
export const updateDepartment = async (id: string, data: any) => {
  const res = await axiosInstance.put(`/hr/departments/${id}`, data);
  return res.data?.data;
};
export const deactivateDepartment = async (id: string) => {
  const res = await axiosInstance.delete(`/hr/departments/${id}`);
  return res.data?.data;
};

// --- DESIGNATION ---
export const getDesignations = async (departmentId?: string) => {
  const params = departmentId ? { departmentId } : {};
  const res = await axiosInstance.get('/hr/designations', { params });
  return res.data?.data || [];
};
export const createDesignation = async (data: any) => {
  const res = await axiosInstance.post('/hr/designations', data);
  return res.data?.data;
};
export const updateDesignation = async (id: string, data: any) => {
  const res = await axiosInstance.put(`/hr/designations/${id}`, data);
  return res.data?.data;
};
export const deactivateDesignation = async (id: string) => {
  const res = await axiosInstance.delete(`/hr/designations/${id}`);
  return res.data?.data;
};

// --- SALARY COMPONENTS ---
export const getSalaryComponents = async () => {
  const res = await axiosInstance.get('/hr/salary-components');
  return res.data?.data || [];
};
export const createSalaryComponent = async (data: any) => {
  const res = await axiosInstance.post('/hr/salary-components', data);
  return res.data?.data;
};
export const updateSalaryComponent = async (id: string, data: any) => {
  const res = await axiosInstance.put(`/hr/salary-components/${id}`, data);
  return res.data?.data;
};
export const deactivateSalaryComponent = async (id: string) => {
  const res = await axiosInstance.delete(`/hr/salary-components/${id}`);
  return res.data?.data;
};

// --- SALARY STRUCTURES ---
export const getSalaryStructures = async (employeeId?: string) => {
  const params = employeeId ? { employeeId } : {};
  const res = await axiosInstance.get('/hr/salary-structures', { params });
  return res.data?.data || [];
};
export const createSalaryStructure = async (data: any) => {
  const res = await axiosInstance.post('/hr/salary-structures', data);
  return res.data?.data;
};
export const deactivateSalaryStructure = async (id: string) => {
  const res = await axiosInstance.delete(`/hr/salary-structures/${id}`);
  return res.data?.data;
};

// --- RECRUITMENT ---
export const getCandidates = async (requisitionId?: string) => {
  const params = requisitionId ? { requisitionId } : {};
  const res = await axiosInstance.get('/hr/candidates', { params });
  const d = res.data?.data;
  return Array.isArray(d) ? d : (d?.data || []);
};
export const createCandidate = async (data: any) => {
  const res = await axiosInstance.post('/hr/candidates', data);
  return res.data?.data;
};
export const updateCandidate = async (id: string, data: any) => {
  const res = await axiosInstance.put(`/hr/candidates/${id}`, data);
  return res.data?.data;
};
export const getInterviews = async (candidateId?: string) => {
  const params = candidateId ? { candidateId } : {};
  const res = await axiosInstance.get('/hr/interviews', { params });
  const d = res.data?.data;
  return Array.isArray(d) ? d : (d?.data || []);
};
export const scheduleInterview = async (data: any) => {
  const res = await axiosInstance.post('/hr/interviews', data);
  return res.data?.data;
};
export const updateInterviewFeedback = async (id: string, data: any) => {
  const res = await axiosInstance.put(`/hr/interviews/${id}`, data);
  return res.data?.data;
};
export const generateOffer = async (candidateId: string, data: any) => {
  const res = await axiosInstance.post(`/hr/candidates/${candidateId}/offer`, data);
  return res.data?.data;
};

// --- ONBOARDING ---
export const getOnboardingTasks = async (employeeId?: string) => {
  const params = employeeId ? { employeeId } : {};
  const res = await axiosInstance.get('/hr/onboarding-tasks', { params });
  return res.data?.data || [];
};
export const createOnboardingTasks = async (employeeId: string, tasks: any[]) => {
  const res = await axiosInstance.post(`/hr/onboarding-tasks/${employeeId}`, { tasks });
  return res.data?.data;
};
export const updateOnboardingTask = async (taskId: string, status: string, remarks?: string) => {
  const res = await axiosInstance.put(`/hr/onboarding-tasks/${taskId}`, { status, remarks });
  return res.data?.data;
};

// --- EXIT MANAGEMENT ---
export const getResignations = async (employeeId?: string) => {
  const params = employeeId ? { employeeId } : {};
  const res = await axiosInstance.get('/hr/resignations', { params });
  return res.data?.data || [];
};
export const submitResignation = async (data: any) => {
  const res = await axiosInstance.post('/hr/resignations', data);
  return res.data?.data;
};
export const updateResignationStatus = async (
  resignationId: string, 
  status: string, 
  approvedLastWorkingDate?: string,
  comments?: string,
  deactivationDate?: string
) => {
  const res = await axiosInstance.put(`/hr/resignations/${resignationId}/status`, { 
    status, 
    approvedLastWorkingDate,
    comments,
    deactivationDate
  });
  return res.data?.data;
};
export const getExitClearances = async (resignationId: string) => {
  const res = await axiosInstance.get(`/hr/resignations/${resignationId}/clearances`);
  return res.data?.data || [];
};
export const updateExitClearance = async (clearanceId: string, data: any) => {
  const res = await axiosInstance.put(`/hr/clearances/${clearanceId}`, data);
  return res.data?.data;
};
export const getFinalSettlement = async (resignationId: string) => {
  const res = await axiosInstance.get(`/hr/resignations/${resignationId}/settlement`);
  return res.data?.data;
};
export const calculateFinalSettlement = async (resignationId: string) => {
  const res = await axiosInstance.post(`/hr/resignations/${resignationId}/settlement`);
  return res.data?.data;
};
export const approveFinalSettlement = async (settlementId: string) => {
  const res = await axiosInstance.put(`/hr/settlements/${settlementId}/approve`);
  return res.data?.data;
};

// --- PAYROLL PROCESSING ---
export const getPayrollPeriods = async () => {
  const res = await axiosInstance.get('/hr/payroll/periods');
  return res.data?.data || [];
};
export const createPayrollPeriod = async (data: any) => {
  const res = await axiosInstance.post('/hr/payroll/periods', data);
  return res.data?.data;
};
export const calculatePayrollRun = async (periodId: string) => {
  const res = await axiosInstance.post(`/hr/payroll/periods/${periodId}/calculate`);
  return res.data?.data;
};
export const approvePayroll = async (periodId: string) => {
  const res = await axiosInstance.post(`/hr/payroll/periods/${periodId}/approve`);
  return res.data?.data;
};
export const getPayslips = async (periodId?: string) => {
  const params = periodId ? { payrollPeriodId: periodId } : {};
  const res = await axiosInstance.get('/hr/payroll/payslips', { params });
  return res.data?.data || [];
};
