import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Button, TextField, Chip, Dialog, DialogTitle,
  DialogContent, DialogActions, MenuItem, Select, FormControl, InputLabel,
  Card, CardContent, Grid, Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import api from '../../../core/api/axios';
import { format } from 'date-fns';

interface ReadingProgram {
  _id: string;
  name: string;
  description?: string;
  programType: string;
  targetAudience: string[];
  startDate: string;
  endDate: string;
  goalBooksCount?: number;
  goalPagesCount?: number;
  status: string;
}

const typeLabels: any = {
  'MONTHLY_CHALLENGE': 'Monthly Challenge',
  'SUMMER_READING': 'Summer Reading',
  'BOOK_CLUB': 'Book Club',
  'GENRE_BINGO': 'Genre Bingo'
};

const ReadingPrograms: React.FC = () => {
  const [programs, setPrograms] = useState<ReadingProgram[]>([]);
  const [statusFilter, setStatusFilter] = useState('ACTIVE');
  const [createDialog, setCreateDialog] = useState(false);
  const [form, setForm] = useState<any>({ status: 'DRAFT', targetAudience: [] });
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [enrollDialog, setEnrollDialog] = useState<{ open: boolean; program: ReadingProgram | null }>({ open: false, program: null });

  const fetchPrograms = async () => {
    try {
      const params: any = {};
      if (statusFilter) params.status = statusFilter;
      const res = await api.get('/library/reading-programs', { params });
      setPrograms(res.data.data || []);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchPrograms(); }, [statusFilter]);

  const handleCreate = async () => {
    setLoading(true);
    try {
      await api.post('/library/reading-programs', { ...form, targetAudience: form.targetAudience || [] });
      setAlert({ type: 'success', msg: 'Reading program created' });
      fetchPrograms();
      setCreateDialog(false);
    } catch (e: any) {
      setAlert({ type: 'error', msg: e.response?.data?.message || 'Failed to create program' });
    } finally { setLoading(false); }
  };

  const handleEnroll = async () => {
    if (!enrollDialog.program) return;
    setLoading(true);
    try {
      await api.post(`/library/reading-programs/${enrollDialog.program._id}/enroll`);
      setAlert({ type: 'success', msg: `Enrolled in ${enrollDialog.program.name}` });
      setEnrollDialog({ open: false, program: null });
    } catch (e: any) {
      setAlert({ type: 'error', msg: e.response?.data?.message || 'Failed to enroll' });
    } finally { setLoading(false); }
  };

  const handleStatusChange = async (programId: string, status: string) => {
    try {
      await api.patch(`/library/reading-programs/${programId}`, { status });
      fetchPrograms();
    } catch (e) { console.error(e); }
  };

  const fmt = (d: string) => { try { return format(new Date(d), 'dd MMM yyyy'); } catch { return d; } };

  const isActive = (p: ReadingProgram) => {
    const now = new Date();
    return new Date(p.startDate) <= now && new Date(p.endDate) >= now;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>Reading Programs</Typography>
          <Typography variant="body2" color="text.secondary">Create and manage reading challenges and events</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setForm({ status: 'DRAFT', programType: 'MONTHLY_CHALLENGE', goalBooksCount: 5 }); setCreateDialog(true); }}>
          Create Program
        </Button>
      </Box>

      {alert && <Alert severity={alert.type} onClose={() => setAlert(null)} sx={{ mb: 2 }}>{alert.msg}</Alert>}

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Status</InputLabel>
          <Select label="Status" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <MenuItem value="">All</MenuItem>
            {['DRAFT', 'ACTIVE', 'COMPLETED', 'CANCELLED'].map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
          </Select>
        </FormControl>
      </Box>

      <Grid container spacing={2}>
        {programs.map(p => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={p._id}>
            <Card variant="outlined" sx={{ height: '100%', border: isActive(p) ? '2px solid' : '1px solid', borderColor: isActive(p) ? 'success.main' : 'divider' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
                  <Chip label={p.status} size="small" color={p.status === 'ACTIVE' ? 'success' : 'default'} />
                  {isActive(p) && <Chip icon={<EmojiEventsIcon sx={{ fontSize: 16 }} />} label="Running" size="small" color="primary" variant="outlined" />}
                </Box>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>{p.name}</Typography>
                {p.description && <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{p.description}</Typography>}
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
                  {(p.targetAudience || []).map((a: string) => <Chip key={a} label={a} size="small" />)}
                </Box>
                <Divider sx={{ my: 1 }} />
                <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                  📅 {fmt(p.startDate)} → {fmt(p.endDate)}
                </Typography>
                {p.goalBooksCount !== undefined && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                    <MenuBookIcon sx={{ fontSize: 16, mr: 0.5 }} /> Goal: {p.goalBooksCount} books
                  </Typography>
                )}
                {p.goalPagesCount !== undefined && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                    <MenuBookIcon sx={{ fontSize: 16, mr: 0.5 }} /> Goal: {p.goalPagesCount} pages
                  </Typography>
                )}
                <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                  {p.status === 'ACTIVE' && (
                    <Button size="small" variant="contained" startIcon={<PersonAddIcon />}
                      onClick={() => setEnrollDialog({ open: true, program: p })}>
                      Enroll
                    </Button>
                  )}
                  {p.status === 'DRAFT' && (
                    <Button size="small" variant="outlined" color="success"
                      onClick={() => handleStatusChange(p._id, 'ACTIVE')}>
                      Activate
                    </Button>
                  )}
                  {p.status === 'ACTIVE' && (
                    <Button size="small" variant="outlined" color="info"
                      onClick={() => handleStatusChange(p._id, 'COMPLETED')}>
                      Complete
                    </Button>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
        {programs.length === 0 && (
          <Grid size={{ xs: 12 }}>
            <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
              <MenuBookIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
              <Typography color="text.secondary">No reading programs found</Typography>
            </Paper>
          </Grid>
        )}
      </Grid>

      {/* Create Dialog */}
      <Dialog open={createDialog} onClose={() => setCreateDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create Reading Program</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField label="Program Name" value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} required fullWidth />
            <TextField label="Description" value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} multiline rows={2} fullWidth />
            <FormControl fullWidth required>
              <InputLabel>Program Type</InputLabel>
              <Select label="Program Type" value={form.programType || 'MONTHLY_CHALLENGE'} onChange={e => setForm({ ...form, programType: e.target.value })}>
                {Object.entries(typeLabels).map(([k, v]) => <MenuItem key={k} value={k}>{v as string}</MenuItem>)}
              </Select>
            </FormControl>
            <TextField label="Target Audience (comma-separated)" value={(form.targetAudience || []).join(', ')}
              onChange={e => setForm({ ...form, targetAudience: e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean) })} fullWidth
              helperText="e.g. Grade 5, Grade 6, ALL" />
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField fullWidth label="Start Date" type="date" value={form.startDate?.slice(0, 10) || ''} onChange={e => setForm({...form, startDate: e.target.value})} slotProps={{ inputLabel: { shrink: true } }} required />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField fullWidth label="End Date" type="date" value={form.endDate?.slice(0, 10) || ''} onChange={e => setForm({ ...form, endDate: e.target.value })} slotProps={{ inputLabel: { shrink: true } }} required />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField type="number" label="Goal: Books Count" value={form.goalBooksCount || ''} onChange={e => setForm({ ...form, goalBooksCount: Number(e.target.value) || undefined })} fullWidth />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField type="number" label="Goal: Pages Count" value={form.goalPagesCount || ''} onChange={e => setForm({ ...form, goalPagesCount: Number(e.target.value) || undefined })} fullWidth />
              </Grid>
            </Grid>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select label="Status" value={form.status || 'DRAFT'} onChange={e => setForm({ ...form, status: e.target.value })}>
                <MenuItem value="DRAFT">Draft</MenuItem>
                <MenuItem value="ACTIVE">Active</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate} disabled={loading}>Create</Button>
        </DialogActions>
      </Dialog>

      {/* Enroll Dialog */}
      <Dialog open={enrollDialog.open} onClose={() => setEnrollDialog({ open: false, program: null })}>
        <DialogTitle>Enroll in Program</DialogTitle>
        <DialogContent>
          <Typography>Enroll yourself in "<strong>{enrollDialog.program?.name}</strong>"?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEnrollDialog({ open: false, program: null })}>Cancel</Button>
          <Button variant="contained" onClick={handleEnroll} disabled={loading}>Enroll</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// Inline import for Divider
const Divider = ({ sx }: any) => <Box sx={{ borderTop: '1px solid', borderColor: 'divider', ...sx }} />;

export default ReadingPrograms;
