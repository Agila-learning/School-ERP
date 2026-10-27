import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Button, Grid,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress, TextField, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { getTerms, createTerm, updateTerm, deleteTerm, getAcademicYears } from '../api/academic.api';

const TermManager: React.FC = () => {
  const [terms, setTerms] = useState<any[]>([]);
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    startDate: '',
    endDate: '',
    academicYearId: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [tData, yData] = await Promise.all([getTerms(), getAcademicYears()]);
      setTerms(tData);
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

  const handleOpen = (term?: any) => {
    if (term) {
      setEditingId(term.id || term._id);
      setFormData({
        name: term.name,
        startDate: term.startDate ? new Date(term.startDate).toISOString().split('T')[0] : '',
        endDate: term.endDate ? new Date(term.endDate).toISOString().split('T')[0] : '',
        academicYearId: term.academicYearId
      });
    } else {
      setEditingId(null);
      setFormData({ name: '', startDate: '', endDate: '', academicYearId: '' });
    }
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editingId) {
        await updateTerm(editingId, {
          ...formData,
          startDate: new Date(formData.startDate).toISOString(),
          endDate: new Date(formData.endDate).toISOString(),
        });
      } else {
        await createTerm({
          ...formData,
          startDate: new Date(formData.startDate).toISOString(),
          endDate: new Date(formData.endDate).toISOString(),
        });
      }
      setModalOpen(false);
      fetchData(); // Real-time update via refetch
    } catch (e) {
      alert('Failed to save term');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this term?')) return;
    try {
      await deleteTerm(id);
      fetchData(); // Real-time update via refetch
    } catch (e) {
      alert('Failed to delete term');
    }
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>;
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>Terms Management</Typography>
        <Button variant="contained" startIcon={<AddIcon />} disableElevation onClick={() => handleOpen()}>
          Add Term
        </Button>
      </Box>

      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: 'grey.50' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Start Date</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>End Date</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {terms.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                    <Typography color="text.secondary">No terms found.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                terms.map(t => (
                  <TableRow key={t.id || t._id} hover>
                    <TableCell><Typography variant="body2" sx={{ fontWeight: 600 }}>{t.name}</Typography></TableCell>
                    <TableCell>{new Date(t.startDate).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(t.endDate).toLocaleDateString()}</TableCell>
                    <TableCell align="right">
                      <Button size="small" startIcon={<EditIcon />} onClick={() => handleOpen(t)}>Edit</Button>
                      <Button size="small" color="error" startIcon={<DeleteIcon />} onClick={() => handleDelete(t.id || t._id)}>Delete</Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Edit Term' : 'Add Term'}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <TextField 
                label="Term Name" 
                fullWidth 
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
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
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={!formData.name || !formData.startDate || !formData.endDate || !formData.academicYearId}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TermManager;
