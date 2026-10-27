import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableHead, TableRow, TableCell, TableBody,
  Chip, Button, CircularProgress, Alert, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, MenuItem, IconButton, Tooltip
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import EventIcon from '@mui/icons-material/Event';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import api from '../../../core/api/axios';

const statusChip: Record<string, 'info' | 'success' | 'error' | 'default'> = {
  REQUESTED: 'info',
  CONFIRMED: 'success',
  CANCELLED: 'error',
  COMPLETED: 'default',
};

const TeacherMeetingDashboard: React.FC = () => {
  const [meetings, setMeetings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: '', date: '', startTime: '', endTime: '', reason: '', meetingType: 'STAFF' });
  const [saving, setSaving] = useState(false);

  const fetchMeetings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/communication/meetings');
      const d = res.data?.data;
      setMeetings(Array.isArray(d) ? d : (d?.data || []));
    } catch (e) {
      setError('Failed to load meetings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMeetings(); }, []);

  const updateStatus = async (id: string, status: string) => {
    try {
      await api.put(`/communication/meetings/${id}/status`, { status });
      fetchMeetings();
    } catch {
      setError('Failed to update meeting status');
    }
  };

  const deleteMeeting = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this meeting?")) return;
    try {
      await api.delete(`/communication/meetings/${id}`);
      fetchMeetings();
    } catch {
      setError('Failed to delete meeting');
    }
  };

  const handleOpenModal = (meeting?: any) => {
    if (meeting) {
      setEditingId(meeting._id);
      setForm({
        title: meeting.title || '',
        date: meeting.date ? meeting.date.split('T')[0] : '',
        startTime: meeting.startTime || '',
        endTime: meeting.endTime || '',
        reason: meeting.reason || '',
        meetingType: meeting.meetingType || 'STAFF'
      });
    } else {
      setEditingId(null);
      setForm({ title: '', date: '', startTime: '', endTime: '', reason: '', meetingType: 'STAFF' });
    }
    setScheduleOpen(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.date || !form.startTime) { setError('Fill all required fields'); return; }
    setSaving(true);
    try {
      if (editingId) {
        await api.put(`/communication/meetings/${editingId}`, form);
      } else {
        await api.post('/communication/meetings', form);
      }
      setScheduleOpen(false);
      fetchMeetings();
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to save meeting');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }} color="#1e293b">Meetings & Appointments</Typography>
          <Typography variant="body2" color="text.secondary">Parent-teacher meetings, staff meetings & more</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenModal()} sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}>
          Schedule Meeting
        </Button>
      </Box>

      {error && <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>{error}</Alert>}

      <Paper elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}><CircularProgress /></Box>
        ) : (
          <Table>
            <TableHead sx={{ bgcolor: '#f8fafc' }}>
              <TableRow>
                {['Title / Type', 'Parent / Student', 'Date & Time', 'Reason', 'Status', 'Actions', 'Manage'].map(h => (
                  <TableCell key={h} sx={{ fontWeight: 700, color: '#64748b' }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {meetings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4, color: '#94a3b8' }}>
                    <EventIcon sx={{ fontSize: 40, mb: 1, display: 'block', mx: 'auto', opacity: 0.4 }} />
                    No meetings scheduled.
                  </TableCell>
                </TableRow>
              ) : meetings.map((m: any) => (
                <TableRow key={m._id} hover>
                  <TableCell>
                    <Typography sx={{ fontWeight: 700 }}>{m.title || 'Meeting'}</Typography>
                    <Chip label={m.meetingType || 'PTM'} size="small" variant="outlined" sx={{ mt: 0.5 }} />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{m.parentId?.firstName} {m.parentId?.lastName}</Typography>
                    <Typography variant="caption" color="text.secondary">{m.studentId?.firstName} {m.studentId?.lastName}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{m.date ? new Date(m.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'TBD'}</Typography>
                    <Typography variant="caption" color="text.secondary">{m.startTime} {m.endTime ? `- ${m.endTime}` : ''}</Typography>
                  </TableCell>
                  <TableCell sx={{ maxWidth: 180 }}>
                    <Typography variant="body2" noWrap>{m.reason || '-'}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={m.status} size="small" color={statusChip[m.status] || 'default'} />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {m.status === 'REQUESTED' && (
                        <>
                          <Button size="small" variant="contained" color="success" onClick={() => updateStatus(m._id, 'CONFIRMED')} sx={{ minWidth: 0, p: '4px 8px' }}><CheckCircleIcon fontSize="small" /></Button>
                          <Button size="small" variant="outlined" color="error" onClick={() => updateStatus(m._id, 'CANCELLED')} sx={{ minWidth: 0, p: '4px 8px' }}><CancelIcon fontSize="small" /></Button>
                        </>
                      )}
                      {m.status === 'CONFIRMED' && (
                        <Button size="small" variant="outlined" onClick={() => updateStatus(m._id, 'COMPLETED')} sx={{ minWidth: 0, p: '4px 8px' }}><DoneAllIcon fontSize="small" /></Button>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                     <Box sx={{ display: 'flex' }}>
                       <Tooltip title="Edit">
                         <IconButton size="small" onClick={() => handleOpenModal(m)}><EditIcon fontSize="small" /></IconButton>
                       </Tooltip>
                       <Tooltip title="Delete">
                         <IconButton size="small" color="error" onClick={() => deleteMeeting(m._id)}><DeleteIcon fontSize="small" /></IconButton>
                       </Tooltip>
                     </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>

      <Dialog open={scheduleOpen} onClose={() => setScheduleOpen(false)} maxWidth="sm" fullWidth >
        <DialogTitle sx={{ fontWeight: 700 }}>{editingId ? 'Edit Meeting' : 'Schedule a Meeting'}</DialogTitle>
        <DialogContent sx={{ pt: '16px !important', display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <TextField label="Title *" fullWidth size="small" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
          <TextField select label="Meeting Type" fullWidth size="small" value={form.meetingType} onChange={e => setForm({ ...form, meetingType: e.target.value })}>
            {['STAFF', 'PARENT_TEACHER', 'STUDENT', 'OTHER'].map(t => <MenuItem key={t} value={t}>{t.replace('_', '-')}</MenuItem>)}
          </TextField>
          <TextField label="Date *" type="date" fullWidth size="small" slotProps={{ inputLabel: { shrink: true } }} value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField label="Start Time *" type="time" fullWidth size="small" slotProps={{ inputLabel: { shrink: true } }} value={form.startTime} onChange={e => setForm({ ...form, startTime: e.target.value })} />
            <TextField label="End Time" type="time" fullWidth size="small" slotProps={{ inputLabel: { shrink: true } }} value={form.endTime} onChange={e => setForm({ ...form, endTime: e.target.value })} />
          </Box>
          <TextField label="Reason / Agenda" multiline rows={3} fullWidth size="small" value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} />
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button onClick={() => setScheduleOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving} sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TeacherMeetingDashboard;
