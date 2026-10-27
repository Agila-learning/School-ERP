import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Button, Grid,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, CircularProgress, TextField, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { getAcademicEvents, createAcademicEvent, updateAcademicEvent, deleteAcademicEvent, getAcademicYears } from '../api/academic.api';

const AcademicEventManager: React.FC = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'HOLIDAY',
    startDate: '',
    endDate: '',
    academicYearId: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [eData, yData] = await Promise.all([getAcademicEvents(), getAcademicYears()]);
      setEvents(eData);
      setAcademicYears(yData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpen = (event?: any) => {
    if (event) {
      setEditingId(event.id || event._id);
      setFormData({
        title: event.title,
        description: event.description || '',
        type: event.type || 'HOLIDAY',
        startDate: event.startDate ? new Date(event.startDate).toISOString().split('T')[0] : '',
        endDate: event.endDate ? new Date(event.endDate).toISOString().split('T')[0] : '',
        academicYearId: event.academicYearId?.id || event.academicYearId?._id || event.academicYearId || ''
      });
    } else {
      setEditingId(null);
      setFormData({ title: '', description: '', type: 'HOLIDAY', startDate: '', endDate: '', academicYearId: '' });
    }
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editingId) {
        await updateAcademicEvent(editingId, {
          ...formData,
          startDate: new Date(formData.startDate).toISOString(),
          endDate: new Date(formData.endDate).toISOString(),
        });
      } else {
        await createAcademicEvent({
          ...formData,
          startDate: new Date(formData.startDate).toISOString(),
          endDate: new Date(formData.endDate).toISOString(),
        });
      }
      setModalOpen(false);
      fetchData();
    } catch (e) {
      alert('Failed to save event');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    try {
      await deleteAcademicEvent(id);
      fetchData();
    } catch (e) {
      alert('Failed to delete event');
    }
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>;
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>Academic Events & Holidays</Typography>
        <Button variant="contained" startIcon={<AddIcon />} disableElevation onClick={() => handleOpen()}>
          Add Event
        </Button>
      </Box>

      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: 'grey.50' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Title</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Start Date</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>End Date</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {events.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                    <Typography color="text.secondary">No events found.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                events.map(e => (
                  <TableRow key={e.id || e._id} hover>
                    <TableCell><Typography variant="body2" sx={{ fontWeight: 600 }}>{e.title}</Typography></TableCell>
                    <TableCell>
                      <Chip label={e.type} color={e.type === 'EXAM' ? 'warning' : e.type === 'HOLIDAY' ? 'success' : 'default'} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>{new Date(e.startDate).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(e.endDate).toLocaleDateString()}</TableCell>
                    <TableCell align="right">
                      <Button size="small" startIcon={<EditIcon />} onClick={() => handleOpen(e)}>Edit</Button>
                      <Button size="small" color="error" startIcon={<DeleteIcon />} onClick={() => handleDelete(e.id || e._id)}>Delete</Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Edit Event' : 'Add Event'}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 8 }}>
              <TextField 
                label="Event Title" 
                fullWidth 
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>Event Type</Typography>
              <select 
                value={formData.type}
                onChange={e => setFormData({ ...formData, type: e.target.value })}
                style={{ width: '100%', padding: '12px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
              >
                <option value="HOLIDAY">Holiday</option>
                <option value="EXAM">Exam</option>
                <option value="ACTIVITY">Activity</option>
                <option value="OTHER">Other</option>
              </select>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField 
                label="Start Date" 
                type="date"
                fullWidth 
                slotProps={{ inputLabel: { shrink: true } }}
                value={formData.startDate}
                onChange={e => setFormData({ ...formData, startDate: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField 
                label="End Date" 
                type="date"
                fullWidth 
                slotProps={{ inputLabel: { shrink: true } }}
                value={formData.endDate}
                onChange={e => setFormData({ ...formData, endDate: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>Academic Year</Typography>
              <select 
                value={formData.academicYearId}
                onChange={e => setFormData({ ...formData, academicYearId: e.target.value })}
                style={{ width: '100%', padding: '12px', borderRadius: '4px', border: '1px solid #ccc' }}
              >
                <option value="">Select Academic Year</option>
                {academicYears.map(y => (
                  <option key={y.id || y._id} value={y.id || y._id}>{y.name}</option>
                ))}
              </select>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField 
                label="Description" 
                fullWidth 
                multiline
                rows={3}
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={!formData.title || !formData.startDate || !formData.endDate || !formData.academicYearId}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AcademicEventManager;
