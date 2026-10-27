import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Button, Grid,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, CircularProgress, TextField, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { getSyllabuses, createSyllabus, updateSyllabus, deleteSyllabus, getCurriculums } from '../api/academic.api';

const SyllabusManager: React.FC = () => {
  const [syllabuses, setSyllabuses] = useState<any[]>([]);
  const [curriculums, setCurriculums] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    sequence: 1,
    estimatedTeachingHours: 0,
    curriculumId: '',
    status: 'ACTIVE'
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sData, cData] = await Promise.all([getSyllabuses(), getCurriculums()]);
      setSyllabuses(sData);
      setCurriculums(cData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpen = (syllabus?: any) => {
    if (syllabus) {
      setEditingId(syllabus.id || syllabus._id);
      setFormData({
        title: syllabus.title,
        description: syllabus.description || '',
        sequence: syllabus.sequence,
        estimatedTeachingHours: syllabus.estimatedTeachingHours || 0,
        curriculumId: syllabus.curriculumId,
        status: syllabus.status || 'ACTIVE'
      });
    } else {
      setEditingId(null);
      setFormData({ title: '', description: '', sequence: 1, estimatedTeachingHours: 0, curriculumId: '', status: 'ACTIVE' });
    }
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editingId) {
        await updateSyllabus(editingId, formData);
      } else {
        await createSyllabus(formData);
      }
      setModalOpen(false);
      fetchData();
    } catch (e) {
      alert('Failed to save syllabus');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this syllabus?')) return;
    try {
      await deleteSyllabus(id);
      fetchData();
    } catch (e) {
      alert('Failed to delete syllabus');
    }
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>;
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>Syllabus Manager</Typography>
        <Button variant="contained" startIcon={<AddIcon />} disableElevation onClick={() => handleOpen()}>
          Add Syllabus
        </Button>
      </Box>

      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: 'grey.50' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Title</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Sequence</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Est. Hours</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {syllabuses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                    <Typography color="text.secondary">No syllabuses found.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                syllabuses.map(s => (
                  <TableRow key={s.id || s._id} hover>
                    <TableCell><Typography variant="body2" sx={{ fontWeight: 600 }}>{s.title}</Typography></TableCell>
                    <TableCell>Unit {s.sequence}</TableCell>
                    <TableCell>{s.estimatedTeachingHours}</TableCell>
                    <TableCell>
                      <Chip label={s.status} color={s.status === 'ACTIVE' ? 'success' : 'default'} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell align="right">
                      <Button size="small" startIcon={<EditIcon />} onClick={() => handleOpen(s)}>Edit</Button>
                      <Button size="small" color="error" startIcon={<DeleteIcon />} onClick={() => handleDelete(s.id || s._id)}>Delete</Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Edit Syllabus' : 'Add Syllabus'}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <TextField 
                label="Title" 
                fullWidth 
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField 
                label="Sequence (e.g. 1 for Unit 1)" 
                type="number"
                fullWidth 
                value={formData.sequence}
                onChange={e => setFormData({ ...formData, sequence: parseInt(e.target.value) || 1 })}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField 
                label="Estimated Teaching Hours" 
                type="number"
                fullWidth 
                value={formData.estimatedTeachingHours}
                onChange={e => setFormData({ ...formData, estimatedTeachingHours: parseInt(e.target.value) || 0 })}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>Curriculum</Typography>
              <select 
                value={formData.curriculumId}
                onChange={e => setFormData({ ...formData, curriculumId: e.target.value })}
                style={{ width: '100%', padding: '12px', borderRadius: '4px', border: '1px solid #ccc' }}
              >
                <option value="">Select Curriculum Map</option>
                {curriculums.map(c => (
                  <option key={c.id || c._id} value={c.id || c._id}>{c.name}</option>
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
          <Button variant="contained" onClick={handleSave} disabled={!formData.title || !formData.curriculumId}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SyllabusManager;
