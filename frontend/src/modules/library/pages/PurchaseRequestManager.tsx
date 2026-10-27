import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableHead, TableRow,
  Button, Chip, TextField, MenuItem, Dialog, DialogTitle, DialogContent,
  DialogActions, Stack, Alert, CircularProgress, Tooltip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import axios from 'axios';

const priorityColors: Record<string, any> = { LOW: 'default', NORMAL: 'info', HIGH: 'warning', URGENT: 'error' };
const statusColors: Record<string, any> = {
  DRAFT: 'default', PENDING_APPROVAL: 'warning', APPROVED: 'success', REJECTED: 'error',
  ORDERED: 'info', RECEIVED: 'success', CANCELLED: 'default'
};

const PurchaseRequestManager: React.FC = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [openCreate, setOpenCreate] = useState(false);
  const [openApprove, setOpenApprove] = useState<{ id: string; approve: boolean } | null>(null);
  const [form, setForm] = useState<any>({ bookTitle: '', quantity: 1, priority: 'NORMAL', reason: '' });
  const [rejectReason, setRejectReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchRequests = () => {
    setLoading(true);
    const params: any = {};
    if (statusFilter) params.status = statusFilter;
    axios.get('/api/v1/library/purchase-requests', { params })
      .then(res => setRequests(res.data.data))
      .catch(() => setError('Failed to load purchase requests.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchRequests(); }, [statusFilter]);

  const handleCreate = async () => {
    if (!form.bookTitle || !form.quantity) { setError('Book title and quantity are required.'); return; }
    setSaving(true);
    try {
      await axios.post('/api/v1/library/purchase-requests', form);
      setOpenCreate(false);
      setForm({ bookTitle: '', quantity: 1, priority: 'NORMAL', reason: '' });
      fetchRequests();
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to create request.');
    } finally { setSaving(false); }
  };

  const handleApprovalAction = async () => {
    if (!openApprove) return;
    setSaving(true);
    try {
      await axios.patch(`/api/v1/library/purchase-requests/${openApprove.id}/approve`, {
        approved: openApprove.approve,
        reason: rejectReason
      });
      setOpenApprove(null);
      setRejectReason('');
      fetchRequests();
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to process request.');
    } finally { setSaving(false); }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>Book Purchase Requests</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenCreate(true)}>
          New Request
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <TextField select label="Filter by Status" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} size="small" sx={{ minWidth: 200 }}>
          <MenuItem value="">All Statuses</MenuItem>
          {['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'ORDERED', 'RECEIVED', 'CANCELLED'].map(s => (
            <MenuItem key={s} value={s}>{s}</MenuItem>
          ))}
        </TextField>
      </Stack>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}><CircularProgress /></Box>
      ) : (
        <Paper>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Request No.</TableCell>
                <TableCell>Book Title</TableCell>
                <TableCell>Qty</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Requested By</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {requests.length === 0 ? (
                <TableRow><TableCell colSpan={7} align="center">No purchase requests found.</TableCell></TableRow>
              ) : requests.map((r: any) => (
                <TableRow key={r._id} hover>
                  <TableCell><code>{r.requestNumber}</code></TableCell>
                  <TableCell>
                    <Typography sx={{ fontWeight: 600 }}>{r.bookTitle}</Typography>
                    {r.isbn && <Typography variant="caption" color="text.secondary">ISBN: {r.isbn}</Typography>}
                  </TableCell>
                  <TableCell>{r.quantity}</TableCell>
                  <TableCell>
                    <Chip label={r.priority} color={priorityColors[r.priority]} size="small" />
                  </TableCell>
                  <TableCell>{r.requestedBy?.firstName} {r.requestedBy?.lastName}</TableCell>
                  <TableCell>
                    <Chip label={r.status} color={statusColors[r.status]} size="small" />
                  </TableCell>
                  <TableCell>
                    {r.status === 'PENDING_APPROVAL' && (
                      <Stack direction="row" spacing={1}>
                        <Tooltip title="Approve">
                          <Button size="small" color="success" startIcon={<CheckCircleIcon />}
                            onClick={() => setOpenApprove({ id: r._id, approve: true })}>
                            Approve
                          </Button>
                        </Tooltip>
                        <Tooltip title="Reject">
                          <Button size="small" color="error" startIcon={<CancelIcon />}
                            onClick={() => setOpenApprove({ id: r._id, approve: false })}>
                            Reject
                          </Button>
                        </Tooltip>
                      </Stack>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}

      {/* Create Dialog */}
      <Dialog open={openCreate} onClose={() => setOpenCreate(false)} maxWidth="sm" fullWidth>
        <DialogTitle>New Book Purchase Request</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField label="Title" value={form.title || ''} onChange={e => setForm({ ...form, title: e.target.value })} fullWidth required size="small" />
            <TextField label="Author" value={form.author || ''} onChange={e => setForm({ ...form, author: e.target.value })} fullWidth size="small" />
            <TextField label="ISBN (optional)" value={form.isbn || ''} onChange={e => setForm({ ...form, isbn: e.target.value })} fullWidth size="small" />
            <TextField label="Quantity" type="number" value={form.quantity || 1} onChange={e => setForm({ ...form, quantity: Number(e.target.value) })} fullWidth size="small" slotProps={{ htmlInput: { min: 1 } }} />
            <TextField label="Reason / Notes" value={form.reason || ''} onChange={e => setForm({ ...form, reason: e.target.value })} multiline rows={3} fullWidth size="small" />
            <TextField select label="Priority" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })} fullWidth size="small">
              {['LOW', 'NORMAL', 'HIGH', 'URGENT'].map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreate(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate} disabled={saving}>
            {saving ? 'Submitting...' : 'Submit Request'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Approve/Reject Dialog */}
      <Dialog open={!!openApprove} onClose={() => setOpenApprove(null)} maxWidth="xs" fullWidth>
        <DialogTitle>{openApprove?.approve ? 'Approve Request' : 'Reject Request'}</DialogTitle>
        <DialogContent>
          {!openApprove?.approve && (
            <TextField label="Rejection Reason" value={rejectReason} onChange={e => setRejectReason(e.target.value)} fullWidth multiline rows={3} sx={{ mt: 1 }} />
          )}
          {openApprove?.approve && (
            <Typography variant="body2">Are you sure you want to approve this purchase request?</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenApprove(null)}>Cancel</Button>
          <Button variant="contained" color={openApprove?.approve ? 'success' : 'error'} onClick={handleApprovalAction} disabled={saving}>
            {saving ? 'Processing...' : openApprove?.approve ? 'Approve' : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PurchaseRequestManager;
