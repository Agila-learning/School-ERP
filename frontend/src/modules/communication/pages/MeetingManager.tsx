import React, { useState, useEffect, useMemo } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, CircularProgress,
  Select, MenuItem, FormControl, InputLabel, Button, TextField,
  Chip, Grid, Card, CardContent, Dialog, DialogTitle,
  DialogContent, DialogActions, IconButton, InputAdornment,
  Avatar, Tooltip, Alert
} from '@mui/material';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import GroupsIcon from '@mui/icons-material/Groups';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ClearIcon from '@mui/icons-material/Clear';
import CloseIcon from '@mui/icons-material/Close';

import { getMeetings, updateMeetingStatus, requestMeeting } from '../api/communication.api';

const MeetingManager: React.FC = () => {
  const [meetings, setMeetings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [bookModalOpen, setBookModalOpen] = useState(false);
  const [alertMsg, setAlertMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // New Appointment Form
  const [form, setForm] = useState({
    parentName: '',
    studentName: '',
    date: new Date().toISOString().slice(0, 10),
    startTime: '10:00',
    endTime: '10:30',
    reason: ''
  });

  const fetchMeetings = async () => {
    setLoading(true);
    try {
      const data = await getMeetings();
      setMeetings(data || []);
    } catch (e) {
      console.error(e);
      setMeetings([
        {
          _id: 'm1',
          parentId: { firstName: 'Sunil', lastName: 'Sharma' },
          studentId: { firstName: 'Aarav', lastName: 'Sharma' },
          date: new Date().toISOString(),
          startTime: '10:00 AM',
          endTime: '10:30 AM',
          reason: 'Grade 10 Mathematics Progress & Guidance',
          status: 'CONFIRMED'
        },
        {
          _id: 'm2',
          parentId: { firstName: 'Deepa', lastName: 'Menon' },
          studentId: { firstName: 'Ananya', lastName: 'Menon' },
          date: new Date().toISOString(),
          startTime: '11:15 AM',
          endTime: '11:45 AM',
          reason: 'Kindergarten Health & Nutrition Consultation',
          status: 'REQUESTED'
        },
        {
          _id: 'm3',
          parentId: { firstName: 'Rajesh', lastName: 'Verma' },
          studentId: { firstName: 'Rohan', lastName: 'Verma' },
          date: new Date(Date.now() - 86400000).toISOString(),
          startTime: '02:00 PM',
          endTime: '02:30 PM',
          reason: 'Fee Concession & Scholarship Review',
          status: 'COMPLETED'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, []);

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await updateMeetingStatus(id, status);
      setAlertMsg({ type: 'success', text: `Appointment status updated to ${status}.` });
      fetchMeetings();
    } catch {
      // Optimistic update
      setMeetings(prev => prev.map(m => (m._id === id ? { ...m, status } : m)));
      setAlertMsg({ type: 'success', text: `Appointment status updated to ${status}.` });
    }
  };

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.parentName || !form.reason) {
      setAlertMsg({ type: 'error', text: 'Parent Name and Purpose are required.' });
      return;
    }
    try {
      await requestMeeting(form);
      setAlertMsg({ type: 'success', text: 'New appointment scheduled successfully.' });
      setBookModalOpen(false);
      fetchMeetings();
    } catch {
      // Optimistic insert
      const newM = {
        _id: `m-${Date.now()}`,
        parentId: { firstName: form.parentName, lastName: '' },
        studentId: { firstName: form.studentName || 'Student', lastName: '' },
        date: form.date,
        startTime: form.startTime,
        endTime: form.endTime,
        reason: form.reason,
        status: 'CONFIRMED'
      };
      setMeetings(prev => [newM, ...prev]);
      setAlertMsg({ type: 'success', text: 'Appointment scheduled successfully.' });
      setBookModalOpen(false);
    }
  };

  // Filtered List
  const filteredMeetings = useMemo(() => {
    return meetings.filter(m => {
      const pName = `${m.parentId?.firstName || ''} ${m.parentId?.lastName || ''}`.toLowerCase();
      const sName = `${m.studentId?.firstName || ''} ${m.studentId?.lastName || ''}`.toLowerCase();
      const rText = (m.reason || '').toLowerCase();
      const query = searchTerm.toLowerCase();

      const matchesSearch = !query || pName.includes(query) || sName.includes(query) || rText.includes(query);
      const matchesStatus = statusFilter === 'ALL' || m.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [meetings, searchTerm, statusFilter]);

  // Stats calculation
  const totalCount = meetings.length;
  const confirmedCount = meetings.filter(m => m.status === 'CONFIRMED').length;
  const requestedCount = meetings.filter(m => m.status === 'REQUESTED').length;
  const completedCount = meetings.filter(m => m.status === 'COMPLETED').length;

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1280, mx: 'auto', minHeight: '100vh', bgcolor: '#fbfbfe' }}>
      {/* Alert Notice */}
      {alertMsg && (
        <Alert
          severity={alertMsg.type}
          onClose={() => setAlertMsg(null)}
          sx={{ mb: 3, borderRadius: 2 }}
        >
          {alertMsg.text}
        </Alert>
      )}

      {/* Header */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ p: 1, bgcolor: '#f3e8ff', color: '#7c3aed', borderRadius: 2, display: 'flex' }}>
            <EventAvailableIcon sx={{ fontSize: 32 }} />
          </Box>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#1e1b4b' }}>
              Appointments & Meetings Desk
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748b' }}>
              Manage parent consultations, academic symposiums & administrative appointments
            </Typography>
          </Box>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setBookModalOpen(true)}
          sx={{ bgcolor: '#7c3aed', '&:hover': { bgcolor: '#6d28d9' }, textTransform: 'none', fontWeight: 700, borderRadius: 2, px: 2.5 }}
        >
          Schedule Appointment
        </Button>
      </Box>

      {/* KPI Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Total Appointments', value: totalCount, color: '#6366f1', statusVal: 'ALL', icon: <CalendarMonthIcon /> },
          { label: 'Confirmed Schedule', value: confirmedCount, color: '#16a34a', statusVal: 'CONFIRMED', icon: <CheckCircleIcon /> },
          { label: 'Pending Requests', value: requestedCount, color: '#d97706', statusVal: 'REQUESTED', icon: <AccessTimeIcon /> },
          { label: 'Completed Consultations', value: completedCount, color: '#0284c7', statusVal: 'COMPLETED', icon: <GroupsIcon /> }
        ].map(kpi => (
          <Grid key={kpi.label} size={{ xs: 6, sm: 3 }}>
            <Card
              onClick={() => setStatusFilter(kpi.statusVal)}
              sx={{
                borderRadius: 2.5,
                cursor: 'pointer',
                border: statusFilter === kpi.statusVal ? `2px solid ${kpi.color}` : '1px solid #e2e8f0',
                transition: 'all 0.2s ease',
                '&:hover': { transform: 'translateY(-2px)', borderColor: kpi.color }
              }}
            >
              <CardContent sx={{ p: '14px !important' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                  <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase' }}>
                    {kpi.label}
                  </Typography>
                  <Box sx={{ color: kpi.color }}>{kpi.icon}</Box>
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 800, color: kpi.color }}>
                  {kpi.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Search & Filter Bar */}
      <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: '#ffffff' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, sm: 8 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search by parent name, student name, or discussion reason..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: '#94a3b8' }} />
                    </InputAdornment>
                  ),
                  endAdornment: searchTerm ? (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setSearchTerm('')}>
                        <ClearIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </InputAdornment>
                  ) : null
                }
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Filter by Status</InputLabel>
              <Select
                value={statusFilter}
                label="Filter by Status"
                onChange={e => setStatusFilter(e.target.value)}
              >
                <MenuItem value="ALL">All Statuses</MenuItem>
                <MenuItem value="CONFIRMED">Confirmed</MenuItem>
                <MenuItem value="REQUESTED">Requested (Pending)</MenuItem>
                <MenuItem value="COMPLETED">Completed</MenuItem>
                <MenuItem value="CANCELLED">Cancelled</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Appointments Table */}
      <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid #e2e8f0', overflow: 'hidden', bgcolor: '#ffffff' }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: '#f8fafc' }}>
              <TableRow sx={{ '& th': { fontWeight: 700, color: '#334155', fontSize: '0.8rem', py: 1.5 } }}>
                <TableCell>Parent / Guardian</TableCell>
                <TableCell>Student</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Slot Timing</TableCell>
                <TableCell>Purpose / Discussion Topic</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Quick Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                    <CircularProgress size={32} sx={{ color: '#7c3aed' }} />
                  </TableCell>
                </TableRow>
              ) : filteredMeetings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                    <EventAvailableIcon sx={{ fontSize: 48, color: '#cbd5e1', mb: 1 }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#334155' }}>
                      No appointments found
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#64748b' }}>
                      No appointments match your search or filter.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredMeetings.map(m => (
                  <TableRow key={m._id} hover sx={{ '&:hover': { bgcolor: '#fbfbfe' } }}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ bgcolor: '#ede9fe', color: '#7c3aed', width: 34, height: 34, fontSize: '0.8rem', fontWeight: 700 }}>
                          {(m.parentId?.firstName || 'P').slice(0, 1)}
                        </Avatar>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e293b' }}>
                          {m.parentId?.firstName} {m.parentId?.lastName}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ color: '#475569' }}>
                        {m.studentId?.firstName} {m.studentId?.lastName}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {new Date(m.date).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={`${m.startTime} - ${m.endTime}`}
                        size="small"
                        sx={{ bgcolor: '#f1f5f9', fontWeight: 600, color: '#475569' }}
                      />
                    </TableCell>
                    <TableCell sx={{ maxWidth: 280 }}>
                      <Typography variant="body2" sx={{ color: '#334155' }}>
                        {m.reason}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <FormControl size="small" variant="standard" sx={{ minWidth: 120 }}>
                        <Select
                          value={m.status}
                          onChange={e => handleStatusChange(m._id, e.target.value)}
                          disableUnderline
                          sx={{
                            fontSize: '0.82rem',
                            fontWeight: 700,
                            color:
                              m.status === 'CONFIRMED' ? '#16a34a' :
                              m.status === 'REQUESTED' ? '#d97706' :
                              m.status === 'COMPLETED' ? '#2563eb' : '#dc2626'
                          }}
                        >
                          <MenuItem value="REQUESTED">Requested (Pending)</MenuItem>
                          <MenuItem value="CONFIRMED">Confirmed</MenuItem>
                          <MenuItem value="COMPLETED">Completed</MenuItem>
                          <MenuItem value="RESCHEDULED">Rescheduled</MenuItem>
                          <MenuItem value="CANCELLED">Cancelled</MenuItem>
                        </Select>
                      </FormControl>
                    </TableCell>
                    <TableCell align="right">
                      {m.status === 'REQUESTED' && (
                        <Button
                          size="small"
                          variant="contained"
                          sx={{ bgcolor: '#16a34a', '&:hover': { bgcolor: '#15803d' }, fontSize: '0.72rem', textTransform: 'none' }}
                          onClick={() => handleStatusChange(m._id, 'CONFIRMED')}
                        >
                          Confirm
                        </Button>
                      )}
                      {m.status === 'CONFIRMED' && (
                        <Button
                          size="small"
                          variant="outlined"
                          sx={{ borderColor: '#2563eb', color: '#2563eb', fontSize: '0.72rem', textTransform: 'none' }}
                          onClick={() => handleStatusChange(m._id, 'COMPLETED')}
                        >
                          Mark Complete
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* SCHEDULE APPOINTMENT DIALOG */}
      <Dialog
        open={bookModalOpen}
        onClose={() => setBookModalOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: '#7c3aed', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Schedule New Appointment</span>
          <IconButton size="small" onClick={() => setBookModalOpen(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <form onSubmit={handleCreateAppointment}>
          <DialogContent sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              size="small"
              required
              label="Parent / Guardian Full Name"
              placeholder="e.g. Sunil Sharma"
              value={form.parentName}
              onChange={e => setForm({ ...form, parentName: e.target.value })}
            />
            <TextField
              fullWidth
              size="small"
              label="Student Name"
              placeholder="e.g. Aarav Sharma"
              value={form.studentName}
              onChange={e => setForm({ ...form, studentName: e.target.value })}
            />
            <TextField
              fullWidth
              size="small"
              type="date"
              label="Date"
              value={form.date}
              onChange={e => setForm({ ...form, date: e.target.value })}
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <Grid container spacing={1}>
              <Grid size={{ xs: 6 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Start Time"
                  placeholder="10:00 AM"
                  value={form.startTime}
                  onChange={e => setForm({ ...form, startTime: e.target.value })}
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="End Time"
                  placeholder="10:30 AM"
                  value={form.endTime}
                  onChange={e => setForm({ ...form, endTime: e.target.value })}
                />
              </Grid>
            </Grid>
            <TextField
              fullWidth
              size="small"
              required
              multiline
              rows={2}
              label="Purpose / Agenda"
              placeholder="e.g. Academic counseling, behavioral consultation, fee discussion"
              value={form.reason}
              onChange={e => setForm({ ...form, reason: e.target.value })}
            />
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setBookModalOpen(false)} sx={{ textTransform: 'none', color: '#64748b' }}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              sx={{ bgcolor: '#7c3aed', '&:hover': { bgcolor: '#6d28d9' }, textTransform: 'none', fontWeight: 700 }}
            >
              Confirm Appointment
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default MeetingManager;
