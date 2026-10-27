import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Button, IconButton, Dialog, DialogTitle, DialogContent, 
  DialogActions, TextField, Switch, FormControlLabel, CircularProgress, Alert
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import { format } from 'date-fns';
import { getExamTerms, createExamTerm } from '../api/examination.api';
import { useAuth } from '../../auth/hooks/useAuth';

const ExamTermManager: React.FC = () => {
  const { academicYear } = useAuth();
  const [terms, setTerms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<any>({ isActive: true });
  const [error, setError] = useState('');

  const fetchTerms = async () => {
    try {
      const data = await getExamTerms();
      setTerms(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTerms(); }, []);

  const handleSave = async () => {
    try {
      if (!form.name || !form.startDate || !form.endDate) return setError('Missing required fields');
      const payload = { ...form, academicYearId: academicYear?.id || (academicYear as any)?._id };
      await createExamTerm(payload);
      fetchTerms();
      setDialogOpen(false);
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to save');
    }
  };

  const fmt = (d?: string) => d ? format(new Date(d), 'dd MMM yyyy') : '—';

  if (loading) return <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress /></Box>;

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>Exam Terms</Typography>
          <Typography variant="body2" color="text.secondary">Configure academic terms for examinations (e.g., Term 1, Spring Semester)</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setForm({ isActive: true }); setDialogOpen(true); }}>
          Add Term
        </Button>
      </Box>

      <Paper variant="outlined">
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                <TableCell>Term Name</TableCell>
                <TableCell>Start Date</TableCell>
                <TableCell>End Date</TableCell>
                <TableCell>Weightage (%)</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {terms.map(t => (
                <TableRow key={t._id} hover>
                  <TableCell><Typography variant="body2" sx={{ fontWeight: 'bold' }}>{t.name}</Typography></TableCell>
                  <TableCell>{fmt(t.startDate)}</TableCell>
                  <TableCell>{fmt(t.endDate)}</TableCell>
                  <TableCell>{t.weightage || '—'}</TableCell>
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
              {terms.length === 0 && (
                <TableRow><TableCell colSpan={6} align="center" sx={{ py: 3 }}><Typography color="text.secondary">No terms configured</Typography></TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Exam Term</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {error && <Alert severity="error">{error}</Alert>}
            <TextField label="Name (e.g., Term 1)" required fullWidth value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField type="date" label="Start Date" required fullWidth slotProps={{ inputLabel: { shrink: true } }} value={form.startDate || ''} onChange={e => setForm({ ...form, startDate: e.target.value })} />
              <TextField type="date" label="End Date" required fullWidth slotProps={{ inputLabel: { shrink: true } }} value={form.endDate || ''} onChange={e => setForm({ ...form, endDate: e.target.value })} />
            </Box>
            <TextField type="number" label="Weightage % (Optional)" fullWidth value={form.weightage || ''} onChange={e => setForm({ ...form, weightage: Number(e.target.value) })} />
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

export default ExamTermManager;
