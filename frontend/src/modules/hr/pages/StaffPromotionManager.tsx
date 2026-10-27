import React, { useState, useEffect } from 'react';
import { 
  TrendingUp as TrendingUpIcon, 
  Search as SearchIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { 
  Box, Dialog, DialogTitle, DialogContent, DialogActions, Button, 
  TextField, FormControl, InputLabel, Select, MenuItem, Alert, CircularProgress 
} from '@mui/material';
import api from '../../../core/api/axios';

interface PromotionRecord {
  id: string;
  employeeId?: string;
  name: string;
  currentRole: string;
  proposedRole: string;
  currentSalary: string;
  proposedSalary: string;
  performanceScore: number;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
}

const StaffPromotionManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [promotions, setPromotions] = useState<PromotionRecord[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  // Nomination Dialog State
  const [nominateOpen, setNominateOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    employeeId: '',
    currentRole: '',
    proposedRole: '',
    currentSalary: '',
    proposedSalary: '',
    performanceScore: 9.0,
    notes: ''
  });

  const fetchPromotions = async () => {
    setLoading(true);
    try {
      const res = await api.get('/hr/promotions');
      const promoData = Array.isArray(res.data?.data) 
        ? res.data.data 
        : Array.isArray(res.data?.data?.data) 
        ? res.data.data.data 
        : [];
      setPromotions(promoData);
    } catch (err: any) {
      console.error(err);
      setAlert({ type: 'error', msg: err.response?.data?.message || 'Failed to fetch promotions' });
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await api.get('/hr/employees');
      const empData = Array.isArray(res.data?.data)
        ? res.data.data
        : Array.isArray(res.data?.data?.data)
        ? res.data.data.data
        : Array.isArray(res.data?.data?.employees)
        ? res.data.data.employees
        : [];
      setEmployees(empData);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPromotions();
    fetchEmployees();
  }, []);

  const handleNominate = async () => {
    if (!form.proposedRole || !form.proposedSalary) {
      setAlert({ type: 'error', msg: 'Proposed Role and Proposed Salary are required' });
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/hr/promotions', form);
      setAlert({ type: 'success', msg: 'Promotion nominated successfully' });
      setNominateOpen(false);
      setForm({
        employeeId: '',
        currentRole: '',
        proposedRole: '',
        currentSalary: '',
        proposedSalary: '',
        performanceScore: 9.0,
        notes: ''
      });
      fetchPromotions();
    } catch (err: any) {
      console.error(err);
      setAlert({ type: 'error', msg: err.response?.data?.message || 'Failed to submit nomination' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleReview = async (id: string, status: 'approved' | 'rejected') => {
    try {
      await api.post(`/hr/promotions/${id}/review`, { status });
      setAlert({ type: 'success', msg: `Promotion ${status} successfully` });
      fetchPromotions();
    } catch (err: any) {
      console.error(err);
      setAlert({ type: 'error', msg: err.response?.data?.message || `Failed to update promotion` });
    }
  };

  const handleEmployeeSelect = (empId: string) => {
    const emp = Array.isArray(employees) ? employees.find(e => e._id === empId) : null;
    if (emp) {
      setForm({
        ...form,
        employeeId: empId,
        currentRole: emp.designationId?.title || emp.designationId?.name || 'Staff Member',
        currentSalary: emp.compensation?.basicSalary ? `₹${emp.compensation.basicSalary}` : '₹40,000'
      });
    } else {
      setForm({ ...form, employeeId: empId });
    }
  };

  const safePromotions = Array.isArray(promotions) ? promotions : [];
  const filteredStaff = safePromotions.filter(s => {
    const matchesTab = s.status === activeTab;
    const matchesSearch = !search || s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.currentRole?.toLowerCase().includes(search.toLowerCase()) ||
      s.proposedRole?.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const pendingCount = safePromotions.filter(s => s.status === 'pending').length;
  const approvedCount = safePromotions.filter(s => s.status === 'approved').length;
  const rejectedCount = safePromotions.filter(s => s.status === 'rejected').length;

  return (
    <div className="p-6 min-h-[calc(100vh-4rem)] flex flex-col bg-gray-50/50">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <TrendingUpIcon className="text-indigo-600" /> Staff Promotions & Hikes
          </h1>
          <p className="text-sm text-gray-500">Manage appraisals, role changes, and salary increments</p>
        </div>
        <button 
          onClick={() => setNominateOpen(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold shadow hover:bg-indigo-700 transition"
        >
          + Nominate for Promotion
        </button>
      </div>

      {alert && (
        <Alert severity={alert.type} onClose={() => setAlert(null)} sx={{ mb: 3 }}>
          {alert.msg}
        </Alert>
      )}

      <div className="flex gap-4 border-b border-gray-200 mb-6">
        <button 
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-3 font-medium text-sm border-b-2 transition ${activeTab === 'pending' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Pending Reviews ({pendingCount})
        </button>
        <button 
          onClick={() => setActiveTab('approved')}
          className={`px-4 py-3 font-medium text-sm border-b-2 transition ${activeTab === 'approved' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Approved & Processed ({approvedCount})
        </button>
        <button 
          onClick={() => setActiveTab('rejected')}
          className={`px-4 py-3 font-medium text-sm border-b-2 transition ${activeTab === 'rejected' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Rejected ({rejectedCount})
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex-1 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search staff..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-4 py-1.5 border border-gray-200 rounded-lg text-sm w-64 bg-white shadow-sm focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-16">
            <CircularProgress />
          </div>
        ) : (
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-500 font-medium sticky top-0 border-b border-gray-200 shadow-sm">
                <tr>
                  <th className="px-6 py-4">Employee</th>
                  <th className="px-6 py-4">Current Role</th>
                  <th className="px-6 py-4">Proposed Role</th>
                  <th className="px-6 py-4">Salary Change</th>
                  <th className="px-6 py-4">Performance Score</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredStaff.map((emp) => (
                  <tr key={emp.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-bold text-gray-900">{emp.name}</td>
                    <td className="px-6 py-4 text-gray-600">{emp.currentRole}</td>
                    <td className="px-6 py-4 font-bold text-indigo-700">{emp.proposedRole}</td>
                    <td className="px-6 py-4">
                      <span className="line-through text-gray-400 text-xs mr-2">{emp.currentSalary}</span>
                      <span className="font-bold text-green-600">{emp.proposedSalary}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full text-xs font-bold">
                        {emp.performanceScore} / 10
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      {emp.status === 'pending' ? (
                        <>
                          <button 
                            onClick={() => handleReview(emp.id, 'approved')}
                            className="p-1.5 bg-green-50 text-green-600 hover:bg-green-100 rounded transition" 
                            title="Approve"
                          >
                            <CheckCircleIcon fontSize="small" />
                          </button>
                          <button 
                            onClick={() => handleReview(emp.id, 'rejected')}
                            className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded transition" 
                            title="Reject"
                          >
                            <CancelIcon fontSize="small" />
                          </button>
                        </>
                      ) : (
                        <span className={`px-2 py-1 rounded text-xs font-semibold uppercase ${emp.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {emp.status}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredStaff.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-gray-400">
                      No promotion records found in {activeTab} status.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Nomination Dialog */}
      <Dialog open={nominateOpen} onClose={() => setNominateOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>+ Nominate Staff for Promotion</DialogTitle>
        <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Select Staff Member *</InputLabel>
            <Select
              label="Select Staff Member *"
              value={form.employeeId}
              onChange={e => handleEmployeeSelect(e.target.value)}
            >
              {Array.isArray(employees) && employees.map(emp => (
                <MenuItem key={emp._id} value={emp._id}>
                  {emp.firstName} {emp.lastName} ({emp.employeeId || 'Staff'})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Current Role"
              value={form.currentRole}
              onChange={e => setForm({ ...form, currentRole: e.target.value })}
              fullWidth
              size="small"
            />
            <TextField
              label="Proposed Role *"
              value={form.proposedRole}
              onChange={e => setForm({ ...form, proposedRole: e.target.value })}
              fullWidth
              size="small"
              required
            />
          </Box>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Current Salary"
              value={form.currentSalary}
              onChange={e => setForm({ ...form, currentSalary: e.target.value })}
              fullWidth
              size="small"
            />
            <TextField
              label="Proposed Salary *"
              value={form.proposedSalary}
              onChange={e => setForm({ ...form, proposedSalary: e.target.value })}
              fullWidth
              size="small"
              required
            />
          </Box>

          <TextField
            label="Performance Appraisal Score (out of 10)"
            type="number"
            value={form.performanceScore}
            onChange={e => setForm({ ...form, performanceScore: Number(e.target.value) })}
            fullWidth
            size="small"
            slotProps={{ htmlInput: { min: 1, max: 10, step: 0.1 } }}
          />

          <TextField
            label="Appraisal & Nomination Notes"
            multiline
            rows={3}
            value={form.notes}
            onChange={e => setForm({ ...form, notes: e.target.value })}
            fullWidth
            size="small"
            placeholder="Key achievements, reasons for increment and elevation..."
          />
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setNominateOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleNominate} disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Nomination'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default StaffPromotionManager;
