import { useState, useEffect } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Button, IconButton, CircularProgress, Alert, Pagination, Stack, MenuItem, Select, FormControl, InputLabel, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Grid } from '@mui/material';
import ReceiptIcon from '@mui/icons-material/Receipt';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CancelIcon from '@mui/icons-material/Cancel';
import { getInvoices, cancelInvoice, updateInvoiceStatus, generateInvoice, getTenants, getAllSubscriptions } from '../api/superAdmin.api';
import dayjs from 'dayjs';

const STATUS_COLORS: Record<string, any> = {
  PAID: 'success', ISSUED: 'info', SENT: 'info', DRAFT: 'default',
  OVERDUE: 'error', CANCELLED: 'default', PARTIALLY_PAID: 'warning', REFUNDED: 'warning'
};

export default function InvoiceManagement() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  // Generate Invoice modal
  const [genOpen, setGenOpen] = useState(false);
  const [tenants, setTenants] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [genData, setGenData] = useState({ tenantId: '', subscriptionId: '', dueInDays: 7, taxRate: 18, notes: '' });
  const [genLoading, setGenLoading] = useState(false);

  // View Invoice modal
  const [viewInvoice, setViewInvoice] = useState<any>(null);

  useEffect(() => { fetchInvoices(); }, [page, statusFilter]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const res = await getInvoices({ page, limit: 20, status: statusFilter || undefined });
      setInvoices(res.data.data);
      setTotalPages(res.data.pagination?.pages || 1);
    } catch { setError('Failed to load invoices'); }
    finally { setLoading(false); }
  };

  const openGenerateModal = async () => {
    try {
      const [tRes, sRes] = await Promise.all([
        getTenants({ limit: 100 }),
        getAllSubscriptions({ limit: 100 })
      ]);
      setTenants(tRes.data.data || []);
      setSubscriptions(sRes.data.data?.subscriptions || sRes.data.data || []);
    } catch {}
    setGenData({ tenantId: '', subscriptionId: '', dueInDays: 7, taxRate: 18, notes: '' });
    setGenOpen(true);
  };

  const handleGenerate = async () => {
    if (!genData.tenantId || !genData.subscriptionId) return alert('Select tenant and subscription.');
    try {
      setGenLoading(true);
      await generateInvoice({ tenantId: genData.tenantId, subscriptionId: genData.subscriptionId, dueInDays: genData.dueInDays, taxRate: genData.taxRate, notes: genData.notes });
      setGenOpen(false);
      fetchInvoices();
    } catch (e: any) { alert(e.response?.data?.message || 'Failed to generate invoice'); }
    finally { setGenLoading(false); }
  };

  const handleMarkPaid = async (id: string) => {
    if (!window.confirm('Mark this invoice as PAID?')) return;
    try { await updateInvoiceStatus(id, { status: 'PAID', paidAmount: undefined }); fetchInvoices(); }
    catch (e: any) { alert(e.response?.data?.message || 'Failed'); }
  };

  const handleCancel = async (id: string) => {
    if (!window.confirm('Cancel this invoice?')) return;
    try { await cancelInvoice(id); fetchInvoices(); }
    catch (e: any) { alert(e.response?.data?.message || 'Failed to cancel invoice'); }
  };

  return (
    <Box sx={{ p: 4, maxWidth: 1600, mx: 'auto' }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 1 }}>
          <ReceiptIcon fontSize="large" color="primary" /> Invoice Management
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openGenerateModal}>Generate Invoice</Button>
      </Box>

      <Paper elevation={0} sx={{ p: 2, mb: 3, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
        <Stack direction="row" spacing={2}>
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Filter by Status</InputLabel>
            <Select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} label="Filter by Status">
              <MenuItem value="">All</MenuItem>
              {['DRAFT', 'ISSUED', 'SENT', 'PAID', 'PARTIALLY_PAID', 'OVERDUE', 'CANCELLED'].map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
            </Select>
          </FormControl>
        </Stack>
      </Paper>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
        <Table>
          <TableHead sx={{ bgcolor: 'grey.50' }}>
            <TableRow>
              <TableCell><strong>Invoice #</strong></TableCell>
              <TableCell><strong>School</strong></TableCell>
              <TableCell><strong>Invoice Date</strong></TableCell>
              <TableCell><strong>Due Date</strong></TableCell>
              <TableCell><strong>Amount</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell align="right"><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={7} align="center" sx={{ py: 4 }}><CircularProgress /></TableCell></TableRow>
            ) : invoices.length === 0 ? (
              <TableRow><TableCell colSpan={7} align="center" sx={{ py: 4 }}>No invoices found.</TableCell></TableRow>
            ) : invoices.map(inv => (
              <TableRow key={inv._id} hover>
                <TableCell><Typography variant="body2" sx={{ fontWeight: 600, fontFamily: 'monospace' }}>{inv.invoiceNumber}</Typography></TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{inv.tenantId?.name}</Typography>
                  <Typography variant="caption" color="text.secondary">{inv.tenantId?.code}</Typography>
                </TableCell>
                <TableCell>{dayjs(inv.invoiceDate).format('DD MMM YYYY')}</TableCell>
                <TableCell>
                  <Typography variant="body2" color={new Date(inv.dueDate) < new Date() && inv.status !== 'PAID' ? 'error.main' : 'text.primary'}>
                    {dayjs(inv.dueDate).format('DD MMM YYYY')}
                  </Typography>
                </TableCell>
                <TableCell><Typography variant="body2" sx={{ fontWeight: 700 }}>₹{inv.total?.toLocaleString()}</Typography></TableCell>
                <TableCell><Chip label={inv.status} size="small" color={STATUS_COLORS[inv.status] || 'default'} /></TableCell>
                <TableCell align="right">
                  <IconButton size="small" color="primary" title="View Invoice" onClick={() => setViewInvoice(inv)}><VisibilityIcon fontSize="small" /></IconButton>
                  {(inv.status === 'ISSUED' || inv.status === 'SENT' || inv.status === 'OVERDUE' || inv.status === 'PARTIALLY_PAID') && (
                    <Button size="small" variant="outlined" color="success" sx={{ ml: 1 }} onClick={() => handleMarkPaid(inv._id)}>Mark Paid</Button>
                  )}
                  {inv.status !== 'PAID' && inv.status !== 'CANCELLED' && (
                    <IconButton size="small" color="error" title="Cancel Invoice" onClick={() => handleCancel(inv._id)}><CancelIcon fontSize="small" /></IconButton>
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

      {/* Generate Invoice Dialog */}
      <Dialog open={genOpen} onClose={() => setGenOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Generate Invoice</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth>
                <InputLabel>Tenant / School *</InputLabel>
                <Select value={genData.tenantId} label="Tenant / School *" onChange={e => setGenData({ ...genData, tenantId: e.target.value })}>
                  {tenants.map((t: any) => <MenuItem key={t._id} value={t._id}>{t.name} ({t.code})</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth>
                <InputLabel>Subscription *</InputLabel>
                <Select value={genData.subscriptionId} label="Subscription *" onChange={e => setGenData({ ...genData, subscriptionId: e.target.value })}>
                  {subscriptions.filter((s: any) => !genData.tenantId || s.tenantId?._id === genData.tenantId || s.tenantId === genData.tenantId).map((s: any) => (
                    <MenuItem key={s._id} value={s._id}>{s.planId?.name || 'Plan'} — {s.billingCycle} — {s.status}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField fullWidth label="Due In (Days)" type="number" value={genData.dueInDays} onChange={e => setGenData({ ...genData, dueInDays: Number(e.target.value) })} />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField fullWidth label="Tax Rate (%)" type="number" value={genData.taxRate} onChange={e => setGenData({ ...genData, taxRate: Number(e.target.value) })} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField fullWidth label="Notes" multiline rows={2} value={genData.notes} onChange={e => setGenData({ ...genData, notes: e.target.value })} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setGenOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleGenerate} disabled={genLoading}>
            {genLoading ? 'Generating...' : 'Generate Invoice'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Invoice Dialog */}
      <Dialog open={!!viewInvoice} onClose={() => setViewInvoice(null)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Invoice: {viewInvoice?.invoiceNumber}
          <Chip label={viewInvoice?.status} size="small" color={STATUS_COLORS[viewInvoice?.status] || 'default'} />
        </DialogTitle>
        <DialogContent dividers>
          {viewInvoice && (
            <Box>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" color="text.secondary">School</Typography>
                  <Typography sx={{ fontWeight: 700 }}>{viewInvoice.tenantId?.name || '—'}</Typography>
                  <Typography variant="caption">{viewInvoice.tenantId?.code}</Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" color="text.secondary">Invoice Date</Typography>
                  <Typography>{dayjs(viewInvoice.invoiceDate).format('DD MMM YYYY')}</Typography>
                  <Typography variant="caption" color="text.secondary">Due: {dayjs(viewInvoice.dueDate).format('DD MMM YYYY')}</Typography>
                </Grid>
              </Grid>
              <Box sx={{ bgcolor: 'grey.50', borderRadius: 2, p: 2, mb: 2 }}>
                {(viewInvoice.lineItems || []).map((li: any, i: number) => (
                  <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2">{li.description}</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>₹{li.amount?.toLocaleString()}</Typography>
                  </Box>
                ))}
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, alignItems: 'flex-end' }}>
                <Typography variant="body2">Subtotal: <strong>₹{viewInvoice.subtotal?.toLocaleString()}</strong></Typography>
                <Typography variant="body2">Tax ({viewInvoice.taxRate}%): <strong>₹{viewInvoice.taxAmount?.toLocaleString()}</strong></Typography>
                <Typography variant="h6" sx={{ fontWeight: 800 }} color="primary">Total: ₹{viewInvoice.total?.toLocaleString()}</Typography>
                {viewInvoice.paidAmount > 0 && (
                  <Typography variant="body2" color="success.main">Paid: ₹{viewInvoice.paidAmount?.toLocaleString()}</Typography>
                )}
              </Box>
              {viewInvoice.notes && <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>Notes: {viewInvoice.notes}</Typography>}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setViewInvoice(null)}>Close</Button>
          {viewInvoice && (viewInvoice.status === 'ISSUED' || viewInvoice.status === 'SENT' || viewInvoice.status === 'OVERDUE') && (
            <Button variant="contained" color="success" onClick={() => { handleMarkPaid(viewInvoice._id); setViewInvoice(null); }}>Mark as Paid</Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}
