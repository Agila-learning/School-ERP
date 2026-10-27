import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Button, TextField, Chip, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Dialog, DialogTitle,
  DialogContent, DialogActions, Card, CardContent, Grid, Alert
} from '@mui/material';
import InventoryIcon from '@mui/icons-material/Inventory';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import api from '../../../core/api/axios';
import { format } from 'date-fns';

interface StockAudit {
  _id: string;
  libraryId: string;
  status: string;
  startedAt: string;
  startedBy?: any;
  totalExpected?: number;
  totalCounted?: number;
  discrepancies?: number;
  finalizedAt?: string;
}

const statusColors: any = { IN_PROGRESS: 'warning', COMPLETED: 'success', CANCELLED: 'error' };

const StocktakeManager: React.FC = () => {
  const [audits, setAudits] = useState<StockAudit[]>([]);
  const [startDialog, setStartDialog] = useState(false);
  const [finalizeDialog, setFinalizeDialog] = useState<{ open: boolean; audit: StockAudit | null }>({ open: false, audit: null });
  const [form, setForm] = useState<any>({});
  const [finalizeData, setFinalizeData] = useState<any>({ notes: '' });
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const fetchAudits = async () => {
    try {
      const res = await api.get('/library/stock-verifications');
      setAudits(res.data.data || []);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchAudits(); }, []);

  const handleStart = async () => {
    setLoading(true);
    try {
      await api.post('/library/stock-verification/start', form);
      setAlert({ type: 'success', msg: 'Stock verification started' });
      fetchAudits();
      setStartDialog(false);
    } catch (e: any) {
      setAlert({ type: 'error', msg: e.response?.data?.message || 'Failed to start verification' });
    } finally { setLoading(false); }
  };

  const handleFinalize = async () => {
    if (!finalizeDialog.audit) return;
    setLoading(true);
    try {
      await api.post(`/library/stock-verification/${finalizeDialog.audit._id}/finalize`, finalizeData);
      setAlert({ type: 'success', msg: 'Stock verification finalized' });
      fetchAudits();
      setFinalizeDialog({ open: false, audit: null });
    } catch (e: any) {
      setAlert({ type: 'error', msg: e.response?.data?.message || 'Failed to finalize' });
    } finally { setLoading(false); }
  };

  const fmt = (d?: string) => { if (!d) return '—'; try { return format(new Date(d), 'dd MMM yyyy, HH:mm'); } catch { return d; } };

  const activeAudit = audits.find(a => a.status === 'IN_PROGRESS');

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>Stock Verification</Typography>
          <Typography variant="body2" color="text.secondary">Conduct physical inventory audits of library holdings</Typography>
        </Box>
        <Button variant="contained" startIcon={<PlayArrowIcon />} disabled={!!activeAudit}
          onClick={() => { setForm({}); setStartDialog(true); }}>
          Start New Verification
        </Button>
      </Box>

      {alert && <Alert severity={alert.type} onClose={() => setAlert(null)} sx={{ mb: 2 }}>{alert.msg}</Alert>}

      {activeAudit && (
        <Paper variant="outlined" sx={{ p: 2, mb: 3, borderColor: 'warning.main', border: '2px solid' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="subtitle1" color="warning.main" sx={{ fontWeight: 'bold' }}>
                🔄 Verification In Progress
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Started: {fmt(activeAudit.startedAt)} by {activeAudit.startedBy?.firstName} {activeAudit.startedBy?.lastName}
              </Typography>
            </Box>
            <Button variant="contained" color="success" startIcon={<CheckCircleIcon />}
              onClick={() => setFinalizeDialog({ open: true, audit: activeAudit })}>
              Finalize Verification
            </Button>
          </Box>
        </Paper>
      )}

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card variant="outlined"><CardContent>
            <Typography variant="body2" color="text.secondary">Total Audits</Typography>
              <Typography variant="h3" sx={{ fontWeight: 'bold' }}>{audits.length}</Typography>
          </CardContent></Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card variant="outlined"><CardContent>
            <Typography variant="body2" color="text.secondary">Completed</Typography>
              <Typography variant="h3" color="success.main" sx={{ fontWeight: 'bold' }}>{audits.filter(a => a.status === 'COMPLETED').length}</Typography>
          </CardContent></Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card variant="outlined"><CardContent>
            <Typography variant="body2" color="text.secondary">In Progress</Typography>
              <Typography variant="h3" color="warning.main" sx={{ fontWeight: 'bold' }}>{audits.filter(a => a.status === 'IN_PROGRESS').length}</Typography>
          </CardContent></Card>
        </Grid>
      </Grid>

      <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>Audit History</Typography>
      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'grey.50' }}>
              <TableCell>Started At</TableCell><TableCell>Started By</TableCell><TableCell>Expected</TableCell>
              <TableCell>Counted</TableCell><TableCell>Discrepancies</TableCell><TableCell>Status</TableCell><TableCell>Finalized At</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {audits.map(audit => (
              <TableRow key={audit._id} hover>
                <TableCell>{fmt(audit.startedAt)}</TableCell>
                <TableCell>{audit.startedBy?.firstName} {audit.startedBy?.lastName || '—'}</TableCell>
                <TableCell>{audit.totalExpected ?? '—'}</TableCell>
                <TableCell>{audit.totalCounted ?? '—'}</TableCell>
                <TableCell>
                  {audit.discrepancies !== undefined && (
                    <Chip label={audit.discrepancies} size="small" color={audit.discrepancies > 0 ? 'error' : 'success'} />
                  )}
                  {audit.discrepancies === undefined && '—'}
                </TableCell>
                <TableCell><Chip label={audit.status} size="small" color={statusColors[audit.status] || 'default'} /></TableCell>
                <TableCell>{fmt(audit.finalizedAt)}</TableCell>
              </TableRow>
            ))}
            {audits.length === 0 && (
              <TableRow><TableCell colSpan={7}>
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <InventoryIcon sx={{ fontSize: 48, color: 'text.disabled' }} />
                  <Typography color="text.secondary" sx={{ mt: 2 }}>No stock verifications found</Typography>
                </Box>
              </TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={startDialog} onClose={() => setStartDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Start Stock Verification</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <Alert severity="info" sx={{ mb: 2 }}>
              A stock verification will initiate a physical count of all library holdings. Only one verification can be active at a time.
            </Alert>
            <TextField label="Library ID (Optional)" value={form.libraryId || ''} onChange={e => setForm({ ...form, libraryId: e.target.value })} fullWidth helperText="Leave blank for main library" sx={{ mb: 2 }} />
            <TextField label="Notes (optional)" value={form.notes || ''} onChange={e => setForm({ ...form, notes: e.target.value })} multiline rows={2} fullWidth />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStartDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleStart} disabled={loading}>Start Verification</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={finalizeDialog.open} onClose={() => setFinalizeDialog({ open: false, audit: null })} maxWidth="sm" fullWidth>
        <DialogTitle>Finalize Stock Verification</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <Alert severity="warning" sx={{ mb: 2 }}>
              Finalizing will close this verification and record all discrepancies permanently.
            </Alert>
            <TextField type="number" label="Total Books Counted" value={finalizeData.totalCounted || ''} onChange={e => setFinalizeData({ ...finalizeData, totalCounted: Number(e.target.value) })} fullWidth required sx={{ mb: 2 }} />
            <TextField label="Finalization Notes" value={finalizeData.notes || ''} onChange={e => setFinalizeData({ ...finalizeData, notes: e.target.value })} multiline rows={2} fullWidth />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFinalizeDialog({ open: false, audit: null })}>Cancel</Button>
          <Button variant="contained" color="success" onClick={handleFinalize} disabled={loading}>Finalize</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StocktakeManager;
