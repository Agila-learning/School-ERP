import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Button, IconButton, Dialog, DialogTitle, DialogContent, 
  DialogActions, TextField, Switch, FormControlLabel, CircularProgress, Alert
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import { getExamTypes, createExamType } from '../api/examination.api';

const ExamTypeManager: React.FC = () => {
  const [types, setTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<any>({ isActive: true });
  const [error, setError] = useState('');

  const fetchTypes = async () => {
    try {
      const data = await getExamTypes();
      setTypes(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTypes(); }, []);

  const handleSave = async () => {
    try {
      if (!form.name || !form.code) return setError('Name and code are required');
      await createExamType(form);
      fetchTypes();
      setDialogOpen(false);
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to save');
    }
  };

  if (loading) return <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress /></Box>;

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>Exam Types</Typography>
          <Typography variant="body2" color="text.secondary">Configure reusable examination types (e.g., Unit Test, Mid-Term)</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setForm({ isActive: true }); setDialogOpen(true); }}>
          Add Exam Type
        </Button>
      </Box>

      <Paper variant="outlined">
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                <TableCell>Code</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {types.map(t => (
                <TableRow key={t._id} hover>
                  <TableCell><Typography variant="body2" sx={{ fontWeight: 'bold' }}>{t.code}</Typography></TableCell>
                  <TableCell>{t.name}</TableCell>
                  <TableCell>{t.description || '—'}</TableCell>
                  <TableCell>
                    <Typography variant="body2" color={t.isActive ? 'success.main' : 'error.main'}>
                      {t.isActive ? 'Active' : 'Inactive'}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small"><EditIcon fontSize="small" /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {types.length === 0 && (
                <TableRow><TableCell colSpan={5} align="center" sx={{ py: 3 }}><Typography color="text.secondary">No exam types configured</Typography></TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Exam Type</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {error && <Alert severity="error">{error}</Alert>}
            <TextField label="Name (e.g., Mid-Term)" required fullWidth value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} />
            <TextField label="Code (e.g., MID)" required fullWidth value={form.code || ''} onChange={e => setForm({ ...form, code: e.target.value })} />
            <TextField label="Description" multiline rows={2} fullWidth value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} />
            <FormControlLabel control={<Switch checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} />} label="Active" />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ExamTypeManager;
