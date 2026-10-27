import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Button, TextField, Chip, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Dialog, DialogTitle,
  DialogContent, DialogActions, MenuItem, Select, FormControl, InputLabel,
  Card, CardContent, Grid, Alert
} from '@mui/material';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import api from '../../../core/api/axios';
import { format } from 'date-fns';

interface LibraryVisit {
  _id: string;
  userId: any;
  memberType: string;
  purpose: string;
  entryTime: string;
  exitTime?: string;
  durationMinutes?: number;
  entryMethod: string;
}

const purposeLabels: any = {
  READING: 'Reading', BOOK_SEARCH: 'Book Search', ISSUE_RETURN: 'Issue/Return',
  STUDY: 'Study', RESEARCH: 'Research', CLASS_ACTIVITY: 'Class Activity',
  DIGITAL_RESOURCE: 'Digital Resources', OTHER: 'Other'
};

const LibraryAttendance: React.FC = () => {
  const [visits, setVisits] = useState<LibraryVisit[]>([]);
  const [occupancy, setOccupancy] = useState(0);
  const [entryDialog, setEntryDialog] = useState(false);
  const [form, setForm] = useState<any>({ purpose: 'READING', entryMethod: 'MANUAL', memberType: 'STUDENT' });
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [dateFilter, setDateFilter] = useState(format(new Date(), 'yyyy-MM-dd'));

  const fetchData = async () => {
    try {
      const [v, o] = await Promise.all([
        api.get('/library/attendance'),
        api.get('/library/attendance/occupancy'),
      ]);
      setVisits(v.data.data || []);
      setOccupancy(o.data.data?.currentOccupancy || 0);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchData(); const timer = setInterval(fetchData, 30000); return () => clearInterval(timer); }, []);

  const handleEntry = async () => {
    setLoading(true);
    try {
      await api.post('/library/attendance/entry', form);
      setAlert({ type: 'success', msg: 'Entry recorded successfully' });
      fetchData();
      setEntryDialog(false);
    } catch (e: any) {
      setAlert({ type: 'error', msg: e.response?.data?.message || 'Failed to record entry' });
    } finally { setLoading(false); }
  };

  const handleExit = async (visitId: string) => {
    try {
      await api.patch(`/library/attendance/${visitId}/exit`);
      setAlert({ type: 'success', msg: 'Exit recorded' });
      fetchData();
    } catch (e) { setAlert({ type: 'error', msg: 'Failed to record exit' }); }
  };

  const fmt = (d?: string) => { if (!d) return '—'; try { return format(new Date(d), 'HH:mm'); } catch { return d; } };

  const todayVisits = visits.filter(v => {
    try { return format(new Date(v.entryTime), 'yyyy-MM-dd') === dateFilter; } catch { return false; }
  });
  const activeVisits = visits.filter(v => !v.exitTime);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>Library Attendance</Typography>
          <Typography variant="body2" color="text.secondary">Track member entry and exit</Typography>
        </Box>
        <Button variant="contained" startIcon={<LoginIcon />} onClick={() => { setForm({ purpose: 'READING', entryMethod: 'MANUAL', memberType: 'STUDENT' }); setEntryDialog(true); }}>
          Record Entry
        </Button>
      </Box>

      {alert && <Alert severity={alert.type} onClose={() => setAlert(null)} sx={{ mb: 2 }}>{alert.msg}</Alert>}

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card variant="outlined">
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">Currently Inside</Typography>
              <Typography variant="h3" color="primary" sx={{ fontWeight: 'bold' }}>{occupancy}</Typography>
              <Typography variant="caption" color="text.secondary">Members in library</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card variant="outlined">
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">Today's Visits</Typography>
              <Typography variant="h3" color="success.main" sx={{ fontWeight: 'bold' }}>{todayVisits.length}</Typography>
              <Typography variant="caption" color="text.secondary">Total entries today</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card variant="outlined">
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">Avg Duration Today</Typography>
              <Typography variant="h3" color="warning.main" sx={{ fontWeight: 'bold' }}>
                {todayVisits.filter(v => v.durationMinutes).length > 0
                  ? Math.round(todayVisits.reduce((a, v) => a + (v.durationMinutes || 0), 0) / todayVisits.filter(v => v.durationMinutes).length)
                  : 0} <Typography component="span" variant="h6">min</Typography>
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Active visits */}
      {activeVisits.length > 0 && (
        <Paper variant="outlined" sx={{ mb: 2, p: 2, bgcolor: 'success.50', border: '1px solid', borderColor: 'success.200' }}>
          <Typography variant="subtitle2" color="success.main" sx={{ fontWeight: 'medium', mb: 1 }}>
            Currently Inside
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            {activeVisits.map(v => (
              <Chip key={v._id} label={`${v.userId?.firstName || 'Unknown'} ${v.userId?.lastName || ''} (${fmt(v.entryTime)})`}
                onDelete={() => handleExit(v._id)} deleteIcon={<LogoutIcon />} color="success" variant="outlined" />
            ))}
          </Box>
        </Paper>
      )}

      <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
        <TextField type="date" size="small" value={dateFilter} onChange={e => setDateFilter(e.target.value)} label="Filter Date" slotProps={{ inputLabel: { shrink: true } }} />
        <Typography variant="body2" color="text.secondary">{todayVisits.length} visits on {dateFilter}</Typography>
      </Box>

      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: 'grey.50' }}>
              <TableCell>Member</TableCell><TableCell>Type</TableCell><TableCell>Purpose</TableCell>
              <TableCell>Entry</TableCell><TableCell>Exit</TableCell><TableCell>Duration</TableCell>
              <TableCell>Method</TableCell><TableCell align="right">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {todayVisits.map(v => (
              <TableRow key={v._id} hover sx={!v.exitTime ? { bgcolor: 'success.50' } : {}}>
                <TableCell><Typography variant="body2">{v.userId?.firstName} {v.userId?.lastName}</Typography></TableCell>
                <TableCell><Chip label={v.memberType} size="small" variant="outlined" /></TableCell>
                <TableCell><Typography variant="body2" color="text.secondary">{purposeLabels[v.purpose] || v.purpose}</Typography></TableCell>
                <TableCell><Typography variant="body2" sx={{ fontFamily: 'monospace' }}>{fmt(v.entryTime)}</Typography></TableCell>
                <TableCell><Typography variant="body2" color={!v.exitTime ? 'success.main' : 'text.primary'} sx={{ fontFamily: 'monospace' }}>{v.exitTime ? fmt(v.exitTime) : '⚡ Active'}</Typography></TableCell>
                <TableCell><Typography variant="body2">{v.durationMinutes ? `${v.durationMinutes}m` : '—'}</Typography></TableCell>
                <TableCell><Chip label={v.entryMethod} size="small" /></TableCell>
                <TableCell align="right">
                  {!v.exitTime && (
                    <Button size="small" variant="outlined" color="success" startIcon={<LogoutIcon />} onClick={() => handleExit(v._id)}>
                      Exit
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {todayVisits.length === 0 && (
              <TableRow><TableCell colSpan={8}><Typography color="text.secondary" variant="body2" align="center" sx={{ py: 4 }}>No activity found.</Typography></TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={entryDialog} onClose={() => setEntryDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Record Library Entry</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField label="User ID / Member ID" value={form.userId || ''} onChange={e => setForm({ ...form, userId: e.target.value })} required fullWidth />
            <FormControl fullWidth required>
              <InputLabel>Member Type</InputLabel>
              <Select label="Member Type" value={form.memberType} onChange={e => setForm({ ...form, memberType: e.target.value })}>
                {['STUDENT', 'TEACHER', 'STAFF', 'ADMINISTRATOR', 'OTHER', 'GUEST'].map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl fullWidth required>
              <InputLabel>Purpose</InputLabel>
              <Select label="Purpose" value={form.purpose} onChange={e => setForm({ ...form, purpose: e.target.value })}>
                {Object.entries(purposeLabels).map(([k, v]) => <MenuItem key={k} value={k}>{v as string}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Entry Method</InputLabel>
              <Select label="Entry Method" value={form.entryMethod} onChange={e => setForm({ ...form, entryMethod: e.target.value })}>
                {['CARD_SCAN', 'ID_SCAN', 'QR', 'MANUAL'].map(m => <MenuItem key={m} value={m}>{m.replace('_', ' ')}</MenuItem>)}
              </Select>
            </FormControl>
            <TextField label="Library ID (optional)" value={form.libraryId || ''} onChange={e => setForm({ ...form, libraryId: e.target.value })} fullWidth />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEntryDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleEntry} disabled={loading}>Record Entry</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LibraryAttendance;
