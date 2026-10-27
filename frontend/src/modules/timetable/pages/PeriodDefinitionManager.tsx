import React, { useEffect, useState } from 'react';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Chip, Button, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, FormControlLabel, Switch
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { getPeriods, createPeriod } from '../api/timetable.api';
import type { PeriodDefinition } from '../api/timetable.api';

const PeriodDefinitionManager: React.FC = () => {
  const [periods, setPeriods] = useState<PeriodDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<PeriodDefinition>>({
    name: '', number: 1, startTime: '09:00', endTime: '09:45', durationMinutes: 45, isBreak: false, status: 'ACTIVE'
  });
  const [saving, setSaving] = useState(false);

  const fetchPeriods = () => {
    setLoading(true);
    getPeriods().then(data => {
      const sorted = [...data].sort((a, b) => a.number - b.number);
      setPeriods(sorted);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchPeriods();
  }, []);

  const handleCreate = async () => {
    try {
      setSaving(true);
      await createPeriod(formData);
      setOpen(false);
      setFormData({ name: '', number: (periods.length || 0) + 1, startTime: '', endTime: '', durationMinutes: 45, isBreak: false, status: 'ACTIVE' });
      fetchPeriods();
    } catch (e) {
      console.error(e);
      alert('Failed to create period');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress /></Box>;

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>Period Definitions</Typography>
          <Typography variant="body1" color="text.secondary">Configure the daily bell schedule, teaching periods, and breaks.</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} disableElevation onClick={() => {
          setFormData({ ...formData, number: periods.length + 1 });
          setOpen(true);
        }}>
          Add Period
        </Button>
      </Box>

      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: 'grey.50' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, width: 80 }}>Order</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Timing</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Duration</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {periods.map(period => (
                <TableRow key={period.id} hover sx={{ bgcolor: period.isBreak ? 'grey.50' : 'inherit' }}>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{period.number}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: period.isBreak ? 500 : 600, color: period.isBreak ? 'text.secondary' : 'text.primary' }}>
                      {period.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                      {period.startTime} - {period.endTime}
                    </Typography>
                  </TableCell>
                  <TableCell>{period.durationMinutes} mins</TableCell>
                  <TableCell>
                    {period.isBreak ? (
                      <Chip label="Break" size="small" color="warning" variant="outlined" />
                    ) : (
                      <Chip label="Teaching" size="small" color="info" variant="outlined" />
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip label={period.status} size="small" color={period.status === 'ACTIVE' ? 'success' : 'default'} />
                  </TableCell>
                  <TableCell align="right">
                    <Button size="small">Edit</Button>
                  </TableCell>
                </TableRow>
              ))}
              {periods.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 3 }}>No periods configured.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Add Period Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Period</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField label="Period Name (e.g., Period 1, Lunch Break)" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} fullWidth required />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField label="Order Number" type="number" value={formData.number} onChange={e => setFormData({...formData, number: Number(e.target.value)})} fullWidth required />
              <TextField label="Duration (minutes)" type="number" value={formData.durationMinutes} onChange={e => setFormData({...formData, durationMinutes: Number(e.target.value)})} fullWidth required />
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField label="Start Time (HH:MM)" type="time" value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} fullWidth required InputLabelProps={{ shrink: true }} />
              <TextField label="End Time (HH:MM)" type="time" value={formData.endTime} onChange={e => setFormData({...formData, endTime: e.target.value})} fullWidth required InputLabelProps={{ shrink: true }} />
            </Box>
            <FormControlLabel control={<Switch checked={formData.isBreak} onChange={e => setFormData({...formData, isBreak: e.target.checked})} />} label="Is this a Break/Recess?" />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate} disabled={saving || !formData.name || !formData.startTime || !formData.endTime}>Create Period</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PeriodDefinitionManager;
