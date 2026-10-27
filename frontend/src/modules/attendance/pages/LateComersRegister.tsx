import React from 'react';
import {
  WatchLater as LateIcon,
  Search as SearchIcon,
  Add as AddIcon,
  NotificationsActive as AlertIcon,
  Print as PrintIcon,
  CheckCircle as OkIcon,
} from '@mui/icons-material';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Autocomplete, FormControlLabel, Switch, Box
} from '@mui/material';

import { getLateComers, recordLateEntry } from '../api/attendance.api';
import api from '../../../core/api/axios';

const LateComersRegister: React.FC = () => {
  const [lateComers, setLateComers] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [students, setStudents] = React.useState<any[]>([]);
  const [openModal, setOpenModal] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  const [form, setForm] = React.useState({
    selectedStudent: null as any,
    studentInput: '',
    arrivalTime: new Date().toTimeString().substring(0, 5),
    delayMinutes: 15,
    reason: 'Traffic congestion',
    notifyParent: true,
  });

  const fetchLateComers = async () => {
    try {
      const data = await getLateComers();
      setLateComers(data);
    } catch (err) {
      console.error('Failed to load late comers', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await api.get('/students/search?limit=100');
      const list = res.data.data?.data || res.data.data || [];
      setStudents(list);
    } catch (err) {
      console.error('Failed to load students', err);
    }
  };

  React.useEffect(() => {
    fetchLateComers();
    fetchStudents();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleOpenModal = () => {
    setForm({
      selectedStudent: null,
      studentInput: '',
      arrivalTime: new Date().toTimeString().substring(0, 5),
      delayMinutes: 15,
      reason: 'Traffic congestion',
      notifyParent: true,
    });
    setOpenModal(true);
  };

  const handleSaveLateEntry = async () => {
    const studentId = form.selectedStudent?._id || form.selectedStudent?.id || form.studentInput.trim();
    if (!studentId) {
      alert('Please select or enter a student');
      return;
    }
    try {
      setSaving(true);
      await recordLateEntry({
        studentId,
        arrivalTime: form.arrivalTime,
        delayMinutes: Number(form.delayMinutes || 15),
        reason: form.reason,
        notifyParent: form.notifyParent,
      });
      setOpenModal(false);
      fetchLateComers();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to record late entry');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-orange-500 to-red-600 p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full translate-x-20 -translate-y-20 blur-2xl" />
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
            <LateIcon style={{ fontSize: 28 }} />
          </div>
          <div>
            <h1 className="text-3xl font-bold leading-tight">Latecomers Register</h1>
            <p className="text-orange-100 text-sm mt-1">Log tardy students, issue entry slips, and trigger parent SMS alerts.</p>
          </div>
        </div>
        <div className="relative z-10 flex gap-3 print:hidden">
          <button onClick={handlePrint} className="flex items-center gap-2 bg-white/20 text-white border border-white/30 px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-white/30 transition-colors backdrop-blur-md">
            <PrintIcon style={{ fontSize: 18 }} /> Print Log
          </button>
          <button onClick={handleOpenModal} className="flex items-center gap-2 bg-white text-orange-600 px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg hover:bg-orange-50 transition-colors">
            <AddIcon style={{ fontSize: 18 }} /> Log Late Entry
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50/50">
          <h2 className="font-bold text-gray-800 text-lg">Today's Log ({lateComers.length})</h2>
          <div className="relative w-full sm:w-64 print:hidden">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" style={{ fontSize: 18 }} />
            <input type="text" placeholder="Search student name..." className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white">
                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">Student Info</th>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 text-center">Entry Time</th>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">Reason</th>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 text-center">Parent Alert</th>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">Loading late comers...</td>
                </tr>
              ) : lateComers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">No late comers logged today.</td>
                </tr>
              ) : (
                lateComers.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-4">
                    <p className="font-bold text-gray-900">{student.name}</p>
                    <p className="text-xs text-gray-500 font-mono mt-0.5">Class: {student.class}</p>
                  </td>
                  <td className="p-4 text-center">
                    <p className="font-bold text-red-600">{student.time}</p>
                    <p className="text-[10px] font-bold text-red-400 uppercase mt-0.5">+{student.delay}</p>
                  </td>
                  <td className="p-4">
                    <p className="text-sm font-semibold text-gray-700">{student.reason}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{student.action}</p>
                  </td>
                  <td className="p-4 text-center">
                    {student.notified ? (
                      <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 px-2 py-1 rounded-md text-[10px] font-bold">
                        <OkIcon style={{ fontSize: 12 }} /> SMS Sent
                      </span>
                    ) : (
                      <button className="inline-flex items-center gap-1 bg-orange-100 text-orange-700 hover:bg-orange-200 px-2 py-1 rounded-md text-[10px] font-bold transition-colors">
                        <AlertIcon style={{ fontSize: 12 }} /> Send SMS
                      </button>
                    )}
                  </td>
                  <td className="p-4 text-right print:hidden">
                    <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium text-xs rounded-lg transition-colors">
                      Edit
                    </button>
                  </td>
                </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Late Entry Modal */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>⏰ Log Student Late Entry</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
            <Autocomplete
              options={students}
              getOptionLabel={(option) => `${option.firstName || ''} ${option.lastName || ''} (${option.studentIdNumber || 'ID: ' + option._id?.substring(0, 6)})`}
              value={form.selectedStudent}
              onChange={(_, newValue) => setForm({ ...form, selectedStudent: newValue })}
              onInputChange={(_, newInputValue) => setForm({ ...form, studentInput: newInputValue })}
              renderInput={(params) => (
                <TextField 
                  {...params} 
                  label="Search & Select Student" 
                  placeholder="Type student name or ID..."
                  required
                />
              )}
            />

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextField 
                label="Arrival Time" 
                type="time" 
                fullWidth 
                required
                slotProps={{ inputLabel: { shrink: true } }}
                value={form.arrivalTime}
                onChange={e => setForm({ ...form, arrivalTime: e.target.value })}
              />
              <TextField 
                label="Delay (Minutes)" 
                type="number" 
                fullWidth 
                value={form.delayMinutes}
                onChange={e => setForm({ ...form, delayMinutes: Number(e.target.value) })}
              />
            </Box>

            <TextField 
              label="Reason for Delay" 
              fullWidth 
              value={form.reason}
              onChange={e => setForm({ ...form, reason: e.target.value })}
              placeholder="e.g. Bus breakdown, Traffic, Health issue"
            />

            <FormControlLabel
              control={
                <Switch 
                  checked={form.notifyParent} 
                  onChange={e => setForm({ ...form, notifyParent: e.target.checked })} 
                  color="warning"
                />
              }
              label="Trigger Parent SMS & App Notification"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenModal(false)}>Cancel</Button>
          <Button variant="contained" color="warning" onClick={handleSaveLateEntry} disabled={saving}>
            {saving ? 'Recording...' : 'Record Late Entry'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default LateComersRegister;
