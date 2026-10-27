import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Button, TextField, Chip, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Dialog, DialogTitle,
  DialogContent, DialogActions, MenuItem, Select, FormControl, InputLabel,
  IconButton, Card, CardContent, Grid, Alert, Rating
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import api from '../../../core/api/axios';
import { format } from 'date-fns';

interface ReadingLogEntry {
  _id: string;
  bookTitle: string;
  authorName?: string;
  startDate: string;
  completionDate?: string;
  pagesRead?: number;
  isCompleted: boolean;
  rating?: number;
  review?: string;
  isPublic: boolean;
}

const ReadingLog: React.FC = () => {
  const [logs, setLogs] = useState<ReadingLogEntry[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [createDialog, setCreateDialog] = useState(false);
  const [editDialog, setEditDialog] = useState<{ open: boolean; entry: ReadingLogEntry | null }>({ open: false, entry: null });
  const [form, setForm] = useState<any>({ isCompleted: false, isPublic: false });
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const fetchLogs = async () => {
    try {
      const [l, p] = await Promise.all([
        api.get('/library/reading-log'),
        api.get('/library/reading-programs?status=ACTIVE'),
      ]);
      setLogs(l.data.data || []);
      setPrograms(p.data.data || []);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchLogs(); }, []);

  const handleCreate = async () => {
    setLoading(true);
    try {
      await api.post('/library/reading-log', { ...form, startDate: form.startDate || new Date() });
      setAlert({ type: 'success', msg: 'Reading log entry added' });
      fetchLogs();
      setCreateDialog(false);
    } catch (e: any) {
      setAlert({ type: 'error', msg: e.response?.data?.message || 'Failed to add entry' });
    } finally { setLoading(false); }
  };

  const handleUpdate = async () => {
    if (!editDialog.entry) return;
    setLoading(true);
    try {
      await api.patch(`/library/reading-log/${editDialog.entry._id}`, form);
      setAlert({ type: 'success', msg: 'Reading log updated' });
      fetchLogs();
      setEditDialog({ open: false, entry: null });
    } catch (e: any) {
      setAlert({ type: 'error', msg: e.response?.data?.message || 'Failed to update' });
    } finally { setLoading(false); }
  };

  const fmt = (d?: string) => { if (!d) return '—'; try { return format(new Date(d), 'dd MMM yyyy'); } catch { return d; } };
  const totalBooks = logs.length;
  const completedBooks = logs.filter(l => l.isCompleted).length;
  const totalPages = logs.reduce((a, l) => a + (l.pagesRead || 0), 0);

  const LogFormFields = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
      <TextField label="Book Title" value={form.bookTitle || ''} onChange={e => setForm({ ...form, bookTitle: e.target.value })} required fullWidth />
      <TextField label="Author" value={form.authorName || ''} onChange={e => setForm({ ...form, authorName: e.target.value })} fullWidth />
      <FormControl fullWidth>
        <InputLabel>Reading Program (optional)</InputLabel>
        <Select label="Reading Program (optional)" value={form.programId || ''} onChange={e => setForm({ ...form, programId: e.target.value || undefined })}>
          <MenuItem value="">None</MenuItem>
          {programs.map(p => <MenuItem key={p._id} value={p._id}>{p.name}</MenuItem>)}
        </Select>
      </FormControl>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField type="date" label="Start Date" value={form.startDate?.slice(0, 10) || ''} onChange={e => setForm({ ...form, startDate: e.target.value })} fullWidth required slotProps={{ inputLabel: { shrink: true } }} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField type="date" label="Completion Date" value={form.completionDate?.slice(0, 10) || ''} onChange={e => setForm({ ...form, completionDate: e.target.value || undefined })} fullWidth slotProps={{ inputLabel: { shrink: true } }} />
        </Grid>
      </Grid>
      <TextField type="number" label="Pages Read" value={form.pagesRead || ''} onChange={e => setForm({ ...form, pagesRead: Number(e.target.value) || undefined })} fullWidth />
      {form.isCompleted && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Rating</Typography>
          <Rating value={form.rating || 0} onChange={(_, v) => setForm({ ...form, rating: v })} />
        </Box>
      )}
      <TextField label="Review / Notes (private)" value={form.review || ''} onChange={e => setForm({ ...form, review: e.target.value })} multiline rows={2} fullWidth helperText="Your review is private by default" />
    </Box>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>My Reading Log</Typography>
          <Typography variant="body2" color="text.secondary">Track your personal reading journey</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setForm({ isCompleted: false, isPublic: false }); setCreateDialog(true); }}>
          Add Entry
        </Button>
      </Box>

      {alert && <Alert severity={alert.type} onClose={() => setAlert(null)} sx={{ mb: 2 }}>{alert.msg}</Alert>}

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card variant="outlined"><CardContent>
            <Typography variant="body2" color="text.secondary">Books Logged</Typography>
            <Typography variant="h3" color="primary" sx={{ fontWeight: 'bold' }}>{totalBooks}</Typography>
          </CardContent></Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card variant="outlined"><CardContent>
            <Typography variant="body2" color="text.secondary">Completed</Typography>
            <Typography variant="h3" color="success.main" sx={{ fontWeight: 'bold' }}>{completedBooks}</Typography>
          </CardContent></Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card variant="outlined"><CardContent>
            <Typography variant="body2" color="text.secondary">Total Pages Read</Typography>
            <Typography variant="h3" color="warning.main" sx={{ fontWeight: 'bold' }}>{totalPages.toLocaleString()}</Typography>
          </CardContent></Card>
        </Grid>
      </Grid>

      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'grey.50' }}>
              <TableCell>Book</TableCell><TableCell>Author</TableCell><TableCell>Started</TableCell>
              <TableCell>Completed</TableCell><TableCell>Pages</TableCell><TableCell>Rating</TableCell>
              <TableCell>Status</TableCell><TableCell align="right">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {logs.map(l => (
              <TableRow key={l._id} hover>
                <TableCell><Typography variant="body2" sx={{ fontWeight: 'medium' }}>{l.bookTitle}</Typography></TableCell>
                <TableCell><Typography variant="body2" color="text.secondary">{l.authorName || '—'}</Typography></TableCell>
                <TableCell><Typography variant="body2">{fmt(l.startDate)}</Typography></TableCell>
                <TableCell><Typography variant="body2" color={l.isCompleted ? 'success.main' : 'text.secondary'}>{l.completionDate ? fmt(l.completionDate) : '—'}</Typography></TableCell>
                <TableCell><Typography variant="body2">{l.pagesRead || '—'}</Typography></TableCell>
                <TableCell><Rating value={l.rating || 0} readOnly size="small" /></TableCell>
                <TableCell>
                  {l.isCompleted
                    ? <Chip icon={<CheckCircleIcon />} label="Completed" size="small" color="success" />
                    : <Chip label="Reading" size="small" color="primary" variant="outlined" />}
                </TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={() => { setForm({ ...l }); setEditDialog({ open: true, entry: l }); }}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {logs.length === 0 && (
              <TableRow><TableCell colSpan={8}>
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <MenuBookIcon sx={{ fontSize: 48, color: 'text.disabled' }} />
                  <Typography color="text.secondary" sx={{ mt: 2 }}>No reading entries yet. Start tracking your reading!</Typography>
                </Box>
              </TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={createDialog} onClose={() => setCreateDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Reading Log Entry</DialogTitle>
        <DialogContent><LogFormFields /></DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate} disabled={loading}>Add Entry</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={editDialog.open} onClose={() => setEditDialog({ open: false, entry: null })} maxWidth="sm" fullWidth>
        <DialogTitle>Update Reading Entry</DialogTitle>
        <DialogContent><LogFormFields /></DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog({ open: false, entry: null })}>Cancel</Button>
          <Button variant="contained" onClick={handleUpdate} disabled={loading}>Update</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ReadingLog;
