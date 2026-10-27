import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Table, TableHead, TableRow, TableCell, 
  TableBody, Chip, CircularProgress, Button, Dialog, DialogTitle, 
  DialogContent, DialogActions, TextField, MenuItem, Avatar, Alert
} from '@mui/material';
import BackButton from '../../../shared/components/BackButton';
import { getMeetings, requestMeeting } from '../../communication/api/communication.api';
import { useParentContext } from '../context/ParentContext';

const ParentMeetings: React.FC = () => {
  const { selectedChild, isLoading: isContextLoading } = useParentContext();
  const [meetings, setMeetings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [openModal, setOpenModal] = useState(false);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [newMeeting, setNewMeeting] = useState({ 
    title: '', 
    teacherId: '', 
    scheduledFor: '', 
    type: 'PARENT_TEACHER', 
    reason: '' 
  });
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchMeetings = () => {
    if (!selectedChild) return;
    setLoading(true);
    getMeetings({ studentId: selectedChild.studentId || selectedChild._id })
      .then(res => setMeetings(Array.isArray(res) ? res : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const fetchTeachers = async () => {
    try {
      const res = await api.get('/hr/employees');
      const list = res.data?.data?.employees || res.data?.data || [];
      setTeachers(list);
      if (list.length > 0 && !newMeeting.teacherId) {
        setNewMeeting(prev => ({ ...prev, teacherId: list[0]._id }));
      }
    } catch (err) {
      console.error('Failed to load teachers for meetings', err);
    }
  };

  useEffect(() => {
    fetchMeetings();
    fetchTeachers();
  }, [selectedChild]);

  const handleSubmit = async () => {
    if (!selectedChild) return;
    setSubmitting(true);
    setErrorMessage(null);
    try {
      const dateVal = newMeeting.scheduledFor ? new Date(newMeeting.scheduledFor) : new Date();
      await requestMeeting({
        title: newMeeting.title,
        reason: newMeeting.reason || newMeeting.title,
        type: newMeeting.type,
        teacherId: newMeeting.teacherId || (teachers[0]?._id),
        studentId: selectedChild.studentId || selectedChild._id,
        scheduledFor: dateVal.toISOString(),
        date: dateVal,
        startTime: `${String(dateVal.getHours()).padStart(2, '0')}:${String(dateVal.getMinutes()).padStart(2, '0')}`
      });
      setOpenModal(false);
      setNewMeeting({ title: '', teacherId: teachers[0]?._id || '', scheduledFor: '', type: 'PARENT_TEACHER', reason: '' });
      setSuccessMessage('Meeting requested successfully! The teacher and administration have been notified.');
      fetchMeetings();
    } catch (e: any) {
      console.error(e);
      setErrorMessage(e.response?.data?.message || 'Failed to request meeting. Please check required fields.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'REQUESTED': return 'warning';
      case 'CONFIRMED': return 'primary';
      case 'COMPLETED': return 'success';
      case 'CANCELLED': return 'error';
      default: return 'default';
    }
  };

  if (isContextLoading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}><CircularProgress /></Box>;
  }

  if (!selectedChild) {
    return (
      <Box sx={{ p: { xs: 2, md: 4 }, backgroundColor: '#f8fafc', minHeight: '100vh' }}>
        <BackButton to="/parent-portal" />
        <Paper elevation={0} sx={{ p: 6, textAlign: 'center', borderRadius: 3, border: '1px solid #e2e8f0', color: 'text.secondary' }}>
          No student selected or linked to your profile.
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <BackButton to="/parent-portal" />
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>Meetings & Appointments</Typography>
          <Typography variant="body2" color="text.secondary">Track your scheduled meetings or request a new one regarding {selectedChild.firstName}.</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Chip 
            avatar={<Avatar>{selectedChild.firstName?.charAt(0)}</Avatar>} 
            label={`${selectedChild.firstName} ${selectedChild.lastName}`} 
            sx={{ fontWeight: 600, bgcolor: 'white', border: '1px solid #e2e8f0' }} 
          />
          <Button variant="contained" onClick={() => setOpenModal(true)} sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}>
            Request Meeting
          </Button>
        </Box>
      </Box>

      {successMessage && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setSuccessMessage(null)}>
          {successMessage}
        </Alert>
      )}

      {errorMessage && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setErrorMessage(null)}>
          {errorMessage}
        </Alert>
      )}

      <Paper elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 3, overflowX: 'auto' }}>
        <Table>
          <TableHead sx={{ bgcolor: '#f1f5f9' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Title & Subject</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Teacher / Staff</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Date & Time</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} align="center" sx={{ py: 4 }}><CircularProgress /></TableCell></TableRow>
            ) : meetings.length === 0 ? (
              <TableRow><TableCell colSpan={5} align="center" sx={{ py: 4, color: 'text.secondary' }}>No meetings found.</TableCell></TableRow>
            ) : meetings.map((m) => {
              const dateVal = m.date || m.scheduledFor;
              return (
                <TableRow key={m.id || m._id} hover>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{m.title || m.reason}</Typography>
                    <Typography variant="caption" color="text.secondary">{m.notes || m.reason}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {m.teacherId ? `${m.teacherId.firstName || ''} ${m.teacherId.lastName || ''}` : 'Class Teacher'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">{m.location || 'Campus / Room 102'}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{dateVal ? new Date(dateVal).toLocaleDateString() : 'N/A'}</Typography>
                    <Typography variant="caption" color="text.secondary">{m.startTime || (dateVal ? new Date(dateVal).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '')}</Typography>
                  </TableCell>
                  <TableCell><Chip size="small" label={(m.type || 'PARENT_TEACHER').replace('_', ' ')} variant="outlined" /></TableCell>
                  <TableCell><Chip size="small" label={m.status || 'REQUESTED'} color={getStatusColor(m.status)} sx={{ fontWeight: 600 }} /></TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Paper>

      {/* Request Meeting Modal */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Request a Meeting</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
          <TextField 
            label="Subject / Title *" 
            fullWidth size="small" sx={{ mt: 1 }}
            value={newMeeting.title} 
            placeholder="e.g. Discuss Q2 Academic Performance"
            onChange={(e) => setNewMeeting({...newMeeting, title: e.target.value})} 
          />

          <TextField 
            select label="Select Teacher / Staff Member" 
            fullWidth size="small"
            value={newMeeting.teacherId} 
            onChange={(e) => setNewMeeting({...newMeeting, teacherId: e.target.value})}
          >
            {teachers.map(t => (
              <MenuItem key={t._id} value={t._id}>
                {t.firstName} {t.lastName} ({t.designationId?.title || t.departmentId?.name || 'Faculty'})
              </MenuItem>
            ))}
            {teachers.length === 0 && (
              <MenuItem value="">Class Teacher (Assigned automatically)</MenuItem>
            )}
          </TextField>

          <TextField 
            select label="Meeting Type" 
            fullWidth size="small"
            value={newMeeting.type} 
            onChange={(e) => setNewMeeting({...newMeeting, type: e.target.value})}
          >
            <MenuItem value="PARENT_TEACHER">Parent Teacher Consultation</MenuItem>
            <MenuItem value="DISCIPLINARY">Disciplinary & Conduct</MenuItem>
            <MenuItem value="OTHER">General Guidance & Academic Discussion</MenuItem>
          </TextField>

          <TextField 
            type="datetime-local" label="Requested Date & Time *" 
            fullWidth size="small" slotProps={{ inputLabel: { shrink: true } }}
            value={newMeeting.scheduledFor} 
            onChange={(e) => setNewMeeting({...newMeeting, scheduledFor: e.target.value})} 
          />

          <TextField 
            label="Discussion Points / Reason" fullWidth size="small" multiline rows={3}
            value={newMeeting.reason} 
            placeholder="Please specify topics to discuss during the appointment..."
            onChange={(e) => setNewMeeting({...newMeeting, reason: e.target.value})} 
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={() => setOpenModal(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleSubmit} 
            disabled={submitting || !newMeeting.title || !newMeeting.scheduledFor}
            sx={{ borderRadius: 2, px: 3 }}
          >
            {submitting ? 'Submitting...' : 'Submit Request'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ParentMeetings;