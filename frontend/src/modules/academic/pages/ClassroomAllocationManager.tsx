import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Button, Grid,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  CircularProgress, TextField, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { 
  getClassroomAllocations, createClassroomAllocation, updateClassroomAllocation, deleteClassroomAllocation,
  getSections, getAcademicYears
} from '../api/academic.api';

const ClassroomAllocationManager: React.FC = () => {
  const [allocations, setAllocations] = useState<any[]>([]);
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    academicYearId: '',
    roomId: '',
    sectionId: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [aData, yData, sData] = await Promise.all([
        getClassroomAllocations(), getAcademicYears(), getSections()
      ]);
      setAllocations(aData);
      setAcademicYears(yData);
      setSections(sData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpen = (allocation?: any) => {
    if (allocation) {
      setEditingId(allocation.id || allocation._id);
      setFormData({
        academicYearId: allocation.academicYearId?.id || allocation.academicYearId?._id || allocation.academicYearId || '',
        roomId: allocation.roomId?.id || allocation.roomId?._id || allocation.roomId || '',
        sectionId: allocation.sectionId?.id || allocation.sectionId?._id || allocation.sectionId || ''
      });
    } else {
      setEditingId(null);
      setFormData({ academicYearId: '', roomId: '', sectionId: '' });
    }
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editingId) {
        await updateClassroomAllocation(editingId, formData);
      } else {
        await createClassroomAllocation(formData);
      }
      setModalOpen(false);
      fetchData();
    } catch (e) {
      alert('Failed to save classroom allocation');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this allocation?')) return;
    try {
      await deleteClassroomAllocation(id);
      fetchData();
    } catch (e) {
      alert('Failed to delete allocation');
    }
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>;
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>Classroom Allocations</Typography>
        <Button variant="contained" startIcon={<AddIcon />} disableElevation onClick={() => handleOpen()}>
          Allocate Room
        </Button>
      </Box>

      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: 'grey.50' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Academic Year</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Section</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Room</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {allocations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                    <Typography color="text.secondary">No classroom allocations found.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                allocations.map(a => (
                  <TableRow key={a.id || a._id} hover>
                    <TableCell>{a.academicYearId?.name || 'Unknown'}</TableCell>
                    <TableCell><Typography variant="body2" sx={{ fontWeight: 600 }}>{a.sectionId?.name || 'Unknown'}</Typography></TableCell>
                    <TableCell>{a.roomId?.roomNumber || a.roomId?.name || 'Room ID: ' + (a.roomId?.id || a.roomId)}</TableCell>
                    <TableCell align="right">
                      <Button size="small" startIcon={<EditIcon />} onClick={() => handleOpen(a)}>Edit</Button>
                      <Button size="small" color="error" startIcon={<DeleteIcon />} onClick={() => handleDelete(a.id || a._id)}>Delete</Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Edit Allocation' : 'Add Allocation'}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
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
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>Section</Typography>
              <select 
                value={formData.sectionId}
                onChange={e => setFormData({ ...formData, sectionId: e.target.value })}
                style={{ width: '100%', padding: '12px', borderRadius: '4px', border: '1px solid #ccc' }}
              >
                <option value="">Select Section</option>
                {sections.map(s => (
                  <option key={s.id || s._id} value={s.id || s._id}>{s.name} ({s.code})</option>
                ))}
              </select>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>Room ID</Typography>
              <TextField 
                placeholder="Enter Room ID" 
                fullWidth 
                size="small"
                value={formData.roomId}
                onChange={e => setFormData({ ...formData, roomId: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={!formData.academicYearId || !formData.sectionId || !formData.roomId}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ClassroomAllocationManager;
