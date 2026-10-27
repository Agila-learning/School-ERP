import { useState, useEffect } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Button, IconButton, CircularProgress, Alert, Pagination, Stack, Select, MenuItem, FormControl, InputLabel, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Grid } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CheckIcon from '@mui/icons-material/Check';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { getTickets, createTicket, updateTicket, getTenants } from '../api/superAdmin.api';
import dayjs from 'dayjs';

const PRIORITY_COLORS: Record<string, any> = { LOW: 'default', MEDIUM: 'info', HIGH: 'warning', CRITICAL: 'error' };
const STATUS_COLORS: Record<string, any> = { OPEN: 'warning', IN_PROGRESS: 'info', WAITING_FOR_CUSTOMER: 'default', RESOLVED: 'success', CLOSED: 'default' };

export default function SupportTicketDesk() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [tenants, setTenants] = useState<any[]>([]);
  const [detailModal, setDetailModal] = useState<{open: boolean, ticket: any}>({ open: false, ticket: null });
  const [formData, setFormData] = useState({ tenantId: '', category: 'TECHNICAL', priority: 'MEDIUM', subject: '', description: '' });
  const [formError, setFormError] = useState('');

  useEffect(() => { fetchTickets(); }, [page, statusFilter]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await getTickets({ page, limit: 20, status: statusFilter || undefined });
      setTickets(res.data.data || []);
      setStats(res.data.stats || {});
      setTotalPages(res.data.pagination?.pages || 1);
    } catch {} finally { setLoading(false); }
  };

  const openCreateModal = async () => {
    try {
      const tRes = await getTenants({ limit: 200 });
      setTenants(tRes.data.data || []);
    } catch {}
    setFormData({ tenantId: '', category: 'TECHNICAL', priority: 'MEDIUM', subject: '', description: '' });
    setFormError('');
    setOpenModal(true);
  };

  const handleCreate = async () => {
    if (!formData.tenantId) { setFormError('Please select a school / tenant.'); return; }
    if (!formData.subject.trim()) { setFormError('Subject is required.'); return; }
    if (!formData.description.trim()) { setFormError('Description is required.'); return; }
    setFormError('');
    try {
      await createTicket({ tenantId: formData.tenantId, category: formData.category, priority: formData.priority, subject: formData.subject, description: formData.description });
      setOpenModal(false);
      fetchTickets();
    } catch (e: any) { setFormError(e.response?.data?.message || 'Failed to create ticket'); }
  };

  const handleResolve = async (id: string) => {
    try { await updateTicket(id, { status: 'RESOLVED', resolution: 'Resolved by platform admin' }); fetchTickets(); }
    catch (e: any) { alert('Failed to resolve ticket'); }
  };

  return (
    <Box sx={{ p: 4, maxWidth: 1600, mx: 'auto' }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1 }}>
          <AssignmentIcon fontSize="large" color="primary" /> Support Helpdesk
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreateModal}>Create Ticket</Button>
      </Box>

      {/* Stats */}
      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Open', value: stats.open || 0, color: 'warning.main' },
          { label: 'In Progress', value: stats.inProgress || 0, color: 'info.main' },
          { label: 'Critical', value: stats.critical || 0, color: 'error.main' },
          { label: 'Unassigned', value: stats.unassigned || 0, color: 'text.secondary' },
        ].map(s => (
          <Paper key={s.label} elevation={0} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2, minWidth: 100, textAlign: 'center' }}>
            <Typography variant="h4" sx={{ fontWeight: 800, color: s.color }}>{s.value}</Typography>
            <Typography variant="caption">{s.label}</Typography>
          </Paper>
        ))}
      </Stack>

      <Paper elevation={0} sx={{ p: 2, mb: 3, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>Status</InputLabel>
          <Select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} label="Status">
            <MenuItem value="">All</MenuItem>
            {['OPEN', 'IN_PROGRESS', 'WAITING_FOR_CUSTOMER', 'RESOLVED', 'CLOSED'].map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
          </Select>
        </FormControl>
      </Paper>

      <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
        <Table>
          <TableHead sx={{ bgcolor: 'grey.50' }}>
            <TableRow>
              <TableCell><strong>Ticket #</strong></TableCell>
              <TableCell><strong>School</strong></TableCell>
              <TableCell><strong>Subject</strong></TableCell>
              <TableCell><strong>Category</strong></TableCell>
              <TableCell><strong>Priority</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell><strong>Created</strong></TableCell>
              <TableCell align="right"><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={8} align="center" sx={{ py: 4 }}><CircularProgress /></TableCell></TableRow>
            ) : tickets.length === 0 ? (
              <TableRow><TableCell colSpan={8} align="center" sx={{ py: 4 }}>No tickets found.</TableCell></TableRow>
            ) : tickets.map(t => (
              <TableRow key={t._id} hover>
                <TableCell><Typography sx={{ fontFamily: 'monospace', fontWeight: 700 }}>{t.ticketNumber}</Typography></TableCell>
                <TableCell>{t.tenantId?.name || '—'}</TableCell>
                <TableCell><Typography variant="body2" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.subject}</Typography></TableCell>
                <TableCell>{t.category}</TableCell>
                <TableCell><Chip size="small" label={t.priority} color={PRIORITY_COLORS[t.priority] || 'default'} /></TableCell>
                <TableCell><Chip size="small" label={t.status} color={STATUS_COLORS[t.status] || 'default'} /></TableCell>
                <TableCell>{dayjs(t.createdAt).format('DD MMM YY')}</TableCell>
                <TableCell align="right">
                  {t.status !== 'RESOLVED' && t.status !== 'CLOSED' && (
                    <IconButton size="small" color="success" title="Resolve" onClick={() => handleResolve(t._id)}><CheckIcon fontSize="small" /></IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination count={totalPages} page={page} onChange={(_, v) => setPage(v)} color="primary" />
        </Box>
      )}

      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Create Support Ticket</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth required>
                <InputLabel>School / Tenant *</InputLabel>
                <Select value={formData.tenantId} label="School / Tenant *" onChange={e => setFormData({ ...formData, tenantId: e.target.value })}>
                  <MenuItem value=""><em>Select a school...</em></MenuItem>
                  {tenants.map((t: any) => <MenuItem key={t._id} value={t._id}>{t.name} ({t.code})</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth><InputLabel>Category</InputLabel>
                <Select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} label="Category">
                  {['TECHNICAL', 'BILLING', 'SUBSCRIPTION', 'FEATURE_REQUEST', 'ACCOUNT', 'OTHER'].map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth><InputLabel>Priority</InputLabel>
                <Select value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})} label="Priority">
                  {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12 }}><TextField fullWidth label="Subject *" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} /></Grid>
            <Grid size={{ xs: 12 }}><TextField fullWidth label="Description *" multiline rows={4} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} /></Grid>
            {formError && <Grid size={{ xs: 12 }}><Alert severity="error">{formError}</Alert></Grid>}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenModal(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate}>Create Ticket</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
