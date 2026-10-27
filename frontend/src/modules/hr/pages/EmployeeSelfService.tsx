import React, { useEffect, useState } from 'react';
import { getMyProfile, getMyPayslips } from '../api/hr.api';
import { getLeaveBalances, getMyLeaveRequests, getLeaveTypes, saveLeaveRequest, type LeaveRequest, type LeaveBalance, type LeaveType } from '../../leave/api/leave.api';
import { useNavigate } from 'react-router-dom';
import { Box, Modal, Typography, TextField, MenuItem, Button } from '@mui/material';

const EmployeeSelfService: React.FC = () => {
  const [profile, setProfile] = useState<any>(null);
  const [payslips, setPayslips] = useState<any[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);
  const [newLeave, setNewLeave] = useState({ leaveTypeId: '', startDate: '', endDate: '', reason: '' });

  const navigate = useNavigate();

  const fetchData = async () => {
    setLoading(true);
    try {
      const prof = await getMyProfile();
      setProfile(prof);
      
      const [slips, reqs, types] = await Promise.all([
        getMyPayslips(),
        getMyLeaveRequests(),
        getLeaveTypes()
      ]);
      setPayslips(slips);
      setLeaveRequests(reqs);
      setLeaveTypes(types.filter(t => t.domain === 'EMPLOYEE' || t.domain === 'BOTH'));
      
      if (prof?._id) {
        const bals = await getLeaveBalances(prof._id);
        setLeaveBalances(bals);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApplyLeave = async () => {
    if (!newLeave.leaveTypeId || !newLeave.startDate || !newLeave.endDate || !newLeave.reason) {
      alert("Please fill all required fields");
      return;
    }
    
    const start = new Date(newLeave.startDate);
    const end = new Date(newLeave.endDate);
    if (end < start) {
      alert("End date cannot be before start date");
      return;
    }
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end days

    try {
      await saveLeaveRequest({
        domain: 'EMPLOYEE',
        leaveTypeId: newLeave.leaveTypeId,
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        totalDays: totalDays,
        reason: newLeave.reason,
        isHalfDay: false
      });
      setLeaveModalOpen(false);
      setNewLeave({ leaveTypeId: '', startDate: '', endDate: '', reason: '' });
      fetchData();
    } catch (e: any) {
      console.error(e);
      alert(e.response?.data?.message || "Failed to apply leave");
    }
  };

  if (loading) return <div className="p-10 flex justify-center">Loading...</div>;
  if (!profile) return <div className="p-10 flex justify-center">No employee profile found for this user.</div>;

  const initials = (profile.firstName?.[0] || '') + (profile.lastName?.[0] || '');
  const totalAvailableLeave = leaveBalances.reduce((acc, curr) => acc + curr.availableDays, 0);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="bg-indigo-600 text-white rounded-2xl p-8 shadow-lg flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-xl font-bold">{initials.toUpperCase()}</div>
          <div>
            <h1 className="text-3xl font-bold mb-1">{profile.firstName} {profile.lastName}</h1>
            <p className="text-indigo-100">{profile.designationId?.name || profile.designation} | {profile.employeeIdNumber}</p>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm min-w-[120px] text-center">
            <p className="text-xs text-indigo-100 uppercase font-bold tracking-wider mb-1">Leave Bal.</p>
            <p className="text-2xl font-bold">{totalAvailableLeave} Days</p>
          </div>
          <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm min-w-[120px] text-center">
            <p className="text-xs text-indigo-100 uppercase font-bold tracking-wider mb-1">Status</p>
            <p className="text-xl font-bold">{profile.status}</p>
          </div>
          <div className="flex flex-col justify-center gap-2">
            <button onClick={() => navigate('/hr/offboarding')} className="text-xs font-bold text-red-500 bg-white/90 hover:bg-white px-3 py-1.5 rounded-lg transition-colors">
              Initiate Resignation
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payslips Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-bold text-gray-900">Recent Payslips</h2>
            <button className="text-sm font-medium text-indigo-600 hover:underline">View All</button>
          </div>
          <div className="space-y-4">
            {payslips.length === 0 ? <p className="text-gray-500 py-4 text-center">No payslips available.</p> : payslips.map(ps => (
              <div key={ps._id} className="flex justify-between items-center p-4 border border-gray-100 rounded-lg bg-gray-50 hover:bg-white hover:border-indigo-200 transition-colors cursor-pointer">
                <div>
                  <p className="font-bold text-gray-900">{ps.payrollPeriodId?.month}/{ps.payrollPeriodId?.year}</p>
                  <p className="text-xs text-gray-500">Status: {ps.status}</p>
                </div>
                <div className="flex items-center gap-4">
                  <p className="font-bold text-indigo-600">₹ {ps.netSalary.toLocaleString()}</p>
                  <span className="text-gray-400">→</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Leave Requests Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-bold text-gray-900">My Leave Requests</h2>
            <button onClick={() => setLeaveModalOpen(true)} className="text-sm font-medium bg-indigo-50 text-indigo-700 px-3 py-1 rounded-md hover:bg-indigo-100">+ New Request</button>
          </div>
          <div className="space-y-4 max-h-80 overflow-y-auto">
            {leaveRequests.length === 0 ? <p className="text-gray-500 py-4 text-center">No leave requests found.</p> : leaveRequests.map(lr => (
              <div key={lr.id} className="flex justify-between items-center p-4 border border-gray-100 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold">✈️</div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{lr.leaveTypeName || 'Leave'}</p>
                    <p className="text-xs text-gray-500">{new Date(lr.startDate).toLocaleDateString()} - {new Date(lr.endDate).toLocaleDateString()} ({lr.totalDays} Days)</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${lr.status === 'APPROVED' ? 'text-emerald-700 bg-emerald-50' : lr.status === 'REJECTED' ? 'text-red-700 bg-red-50' : lr.status === 'CANCELLED' ? 'text-gray-600 bg-gray-100' : 'text-amber-700 bg-amber-50'}`}>
                    {lr.status}
                  </span>
                  {lr.status === 'PENDING' && (
                    <button 
                      onClick={async () => {
                        if(window.confirm('Withdraw this leave request?')) {
                          try {
                            const { processLeaveRequest } = await import('../../leave/api/leave.api');
                            await processLeaveRequest(lr.id, 'CANCELLED');
                            fetchData();
                          } catch(e) {
                            alert('Failed to withdraw leave');
                          }
                        }
                      }}
                      className="text-[10px] font-bold text-red-500 hover:underline"
                    >
                      Withdraw
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Modal open={leaveModalOpen} onClose={() => setLeaveModalOpen(false)}>
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, bgcolor: 'background.paper', borderRadius: 2, p: 4, outline: 'none', boxShadow: 24 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }} mb={3}>Apply for Leave</Typography>
          <div className="space-y-4">
            <TextField 
              select label="Leave Type" fullWidth size="small"
              value={newLeave.leaveTypeId} onChange={e => setNewLeave({...newLeave, leaveTypeId: e.target.value})}
            >
              {leaveTypes.map(t => <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>)}
            </TextField>
            <div className="flex gap-4">
              <TextField 
                label="Start Date" type="date" fullWidth size="small" slotProps={{ inputLabel: { shrink: true } }}
                value={newLeave.startDate} onChange={e => setNewLeave({...newLeave, startDate: e.target.value})}
              />
              <TextField 
                label="End Date" type="date" fullWidth size="small" slotProps={{ inputLabel: { shrink: true } }}
                value={newLeave.endDate} onChange={e => setNewLeave({...newLeave, endDate: e.target.value})}
              />
            </div>
            <TextField 
              label="Reason" multiline rows={3} fullWidth size="small"
              value={newLeave.reason} onChange={e => setNewLeave({...newLeave, reason: e.target.value})}
            />
            <div className="flex justify-end gap-2 mt-4">
              <Button onClick={() => setLeaveModalOpen(false)}>Cancel</Button>
              <Button variant="contained" onClick={handleApplyLeave}>Submit Request</Button>
            </div>
          </div>
        </Box>
      </Modal>
    </div>
  );
};

export default EmployeeSelfService;