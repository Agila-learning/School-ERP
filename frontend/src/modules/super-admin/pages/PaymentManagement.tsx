import { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, Button, CircularProgress, Alert, Pagination,
  TextField, Stack, MenuItem, Select, FormControl, InputLabel, Dialog,
  DialogTitle, DialogContent, DialogActions, Grid
} from '@mui/material';
import PaymentsIcon from '@mui/icons-material/Payments';
import AddIcon from '@mui/icons-material/Add';
import { getPayments, recordPayment, getInvoices, getTenants } from '../api/superAdmin.api';
import dayjs from 'dayjs';

const STATUS_COLORS: Record<string, any> = {
  SUCCESS: 'success',
  PENDING: 'warning',
  FAILED: 'error',
  REFUNDED: 'default',
};

export default function PaymentManagement() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  // Record Payment Dialog
  const [openModal, setOpenModal] = useState(false);
  const [tenants, setTenants] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    tenantId: '',
    invoiceId: '',
    amount: '',
    paymentMethod: 'BANK_TRANSFER',
    transactionId: '',
    notes: '',
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchPayments();
  }, [page, statusFilter, search]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await getPayments({ page, limit: 15, status: statusFilter || undefined });
      // Backend returns { data: [...], pagination: {...} }
      setPayments(res.data.data || []);
      setTotalPages(res.data.pagination?.pages || 1);
      setError('');
    } catch {
      setError('Failed to fetch payment records.');
    } finally {
      setLoading(false);
    }
  };

  const openRecordModal = async () => {
    try {
      const [tRes, invRes] = await Promise.all([
        getTenants({ limit: 100 }),
        getInvoices({ status: 'ISSUED', limit: 100 })
      ]);
      // Both return { data: [...] }
      setTenants(tRes.data.data || []);
      setInvoices(invRes.data.data || []);
      setOpenModal(true);
    } catch {
      alert('Failed to load tenants/invoices for recording payment');
    }
  };

  const handleRecord = async () => {
    if (!formData.tenantId || !formData.amount) {
      alert('Please select a tenant and provide an amount.');
      return;
    }
    try {
      setSaving(true);
      await recordPayment({
        tenantId: formData.tenantId,
        invoiceId: formData.invoiceId || undefined,
        amount: Number(formData.amount),
        paymentMethod: formData.paymentMethod,
        transactionId: formData.transactionId || `TXN-${Date.now()}`,
        status: 'SUCCESS',
        notes: formData.notes,
      });
      setSuccess('Payment recorded successfully.');
      setOpenModal(false);
      setFormData({ tenantId: '', invoiceId: '', amount: '', paymentMethod: 'BANK_TRANSFER', transactionId: '', notes: '' });
      fetchPayments();
    } catch (e: any) {
      alert(e.response?.data?.message || 'Failed to record payment');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ p: 4, maxWidth: 1440, mx: 'auto' }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <PaymentsIcon fontSize="large" color="primary" /> Payment Transactions
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openRecordModal} sx={{ borderRadius: 2 }}>
          Record Payment
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      {/* Filter Bar */}
      <Paper elevation={0} sx={{ p: 2.5, mb: 3, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ alignItems: 'center' }}>
          <TextField
            size="small"
            placeholder="Search by txn # or note..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            sx={{ minWidth: 280 }}
          />
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Status</InputLabel>
            <Select value={statusFilter} label="Status" onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
              <MenuItem value="">All Statuses</MenuItem>
              <MenuItem value="SUCCESS">Success</MenuItem>
              <MenuItem value="PENDING">Pending</MenuItem>
              <MenuItem value="FAILED">Failed</MenuItem>
              <MenuItem value="REFUNDED">Refunded</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Paper>

      {/* Payments Table */}
      <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, mb: 3 }}>
        <Table>
          <TableHead sx={{ bgcolor: 'action.hover' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Payment Reference</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Tenant / School</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Invoice #</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Method</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Amount</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={7} align="center" sx={{ py: 6 }}><CircularProgress /></TableCell></TableRow>
            ) : payments.length === 0 ? (
              <TableRow><TableCell colSpan={7} align="center" sx={{ py: 6, color: 'text.secondary' }}>No payment records found.</TableCell></TableRow>
            ) : payments.map(pmt => (
              <TableRow key={pmt._id} hover>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: 'monospace' }}>
                    {pmt.paymentNumber || pmt._id.slice(-8).toUpperCase()}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontFamily: 'monospace' }}>
                    TXN: {pmt.transactionId || 'N/A'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{pmt.tenantId?.name || 'School'}</Typography>
                  <Typography variant="caption" color="text.secondary">{pmt.tenantId?.code || ''}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{pmt.invoiceId?.invoiceNumber || 'Manual Receipt'}</Typography>
                </TableCell>
                <TableCell>
                  <Chip size="small" label={pmt.paymentMethod || 'BANK_TRANSFER'} variant="outlined" />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: 'success.main' }}>
                    ₹{(pmt.amount || 0).toLocaleString()}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{dayjs(pmt.createdAt).format('DD MMM YYYY, hh:mm A')}</Typography>
                </TableCell>
                <TableCell>
                  <Chip size="small" label={pmt.status} color={STATUS_COLORS[pmt.status] || 'default'} sx={{ fontWeight: 700 }} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Pagination count={totalPages} page={page} onChange={(_, p) => setPage(p)} color="primary" />
        </Box>
      )}

      {/* Record Payment Dialog */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Record Manual Payment</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth>
                <InputLabel>Select School / Tenant *</InputLabel>
                <Select value={formData.tenantId} label="Select School / Tenant *" onChange={e => setFormData({ ...formData, tenantId: e.target.value })}>
                  {tenants.map((t: any) => (
                    <MenuItem key={t._id} value={t._id}>{t.name} ({t.code})</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth>
                <InputLabel>Associated Invoice (Optional)</InputLabel>
                <Select value={formData.invoiceId} label="Associated Invoice (Optional)" onChange={e => setFormData({ ...formData, invoiceId: e.target.value })}>
                  <MenuItem value="">None / Standalone Payment</MenuItem>
                  {invoices.map((inv: any) => (
                    <MenuItem key={inv._id} value={inv._id}>
                      {inv.invoiceNumber} — ₹{inv.totalAmount?.toLocaleString()} ({inv.tenantId?.name})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Amount (₹) *"
                type="number"
                value={formData.amount}
                onChange={e => setFormData({ ...formData, amount: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Payment Method</InputLabel>
                <Select value={formData.paymentMethod} label="Payment Method" onChange={e => setFormData({ ...formData, paymentMethod: e.target.value })}>
                  <MenuItem value="BANK_TRANSFER">Bank Transfer / NEFT</MenuItem>
                  <MenuItem value="UPI">UPI</MenuItem>
                  <MenuItem value="CHEQUE">Cheque</MenuItem>
                  <MenuItem value="CASH">Cash</MenuItem>
                  <MenuItem value="ONLINE">Online Card</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Bank Ref / Cheque / Transaction ID"
                value={formData.transactionId}
                onChange={e => setFormData({ ...formData, transactionId: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Notes / Comments"
                multiline
                rows={2}
                value={formData.notes}
                onChange={e => setFormData({ ...formData, notes: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenModal(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleRecord} disabled={saving}>
            {saving ? 'Recording...' : 'Record Payment'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
