import { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, Button, IconButton, CircularProgress, Alert,
  Pagination, TextField, Stack, MenuItem, Select, FormControl, InputLabel,
  Dialog, DialogTitle, DialogContent, DialogActions, Tooltip, FormControlLabel, Checkbox
} from '@mui/material';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import AddIcon from '@mui/icons-material/Add';
import UpgradeIcon from '@mui/icons-material/Upgrade';
import CancelIcon from '@mui/icons-material/Cancel';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import TimelapseIcon from '@mui/icons-material/Timelapse';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import {
  getAllSubscriptions, createSubscription, upgradePlan,
  cancelSubscription, getPlans, getTenants,
  freezeSubscription, grantOneDayTrial, reactivateSubscription
} from '../api/superAdmin.api';
import dayjs from 'dayjs';

const STATUS_COLORS: Record<string, any> = {
  ACTIVE: 'success',
  TRIAL: 'info',
  EXPIRED: 'error',
  CANCELLED: 'default',
  PAST_DUE: 'warning',
};

export default function SubscriptionManagement() {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState<any[]>([]);
  const [tenants, setTenants] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  // Dialog states
  const [createOpen, setCreateOpen] = useState(false);
  const [createData, setCreateData] = useState({ tenantId: '', planId: '', billingCycle: 'YEARLY', autoRenew: true, startWithTrial: true });

  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [selectedSub, setSelectedSub] = useState<any>(null);
  const [newPlanId, setNewPlanId] = useState('');

  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchSubscriptions();
  }, [page, statusFilter, search]);

  const fetchInitialData = async () => {
    try {
      const [plansRes, tenantsRes] = await Promise.all([getPlans(), getTenants({ limit: 100 })]);
      setPlans(plansRes.data.data || []);
      // getTenants returns { data: [...], pagination: {...} }
      setTenants(tenantsRes.data.data || []);
    } catch {}
  };

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const res = await getAllSubscriptions({ page, limit: 15, status: statusFilter || undefined, search: search || undefined });
      // getAllSubscriptions returns { data: [...], pagination: {...} }
      setSubscriptions(res.data.data || []);
      setTotalPages(res.data.pagination?.pages || 1);
      setError('');
    } catch {
      setError('Failed to fetch subscriptions.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!createData.tenantId || !createData.planId) {
      alert('Please select both a Tenant and a Plan.');
      return;
    }
    try {
      setActionLoading(true);
      await createSubscription({
        tenantId: createData.tenantId,
        planId: createData.planId,
        billingCycle: createData.billingCycle,
        autoRenew: createData.autoRenew,
        trialDays: createData.startWithTrial ? 1 : 0
      });
      setSuccess(createData.startWithTrial ? 'Subscription created with 1-Day Free Trial. Dashboard freeze can now be tested.' : 'Subscription activated successfully.');
      setCreateOpen(false);
      setCreateData({ tenantId: '', planId: '', billingCycle: 'YEARLY', autoRenew: true, startWithTrial: true });
      fetchSubscriptions();
    } catch (e: any) {
      alert(e.response?.data?.message || 'Failed to create subscription.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleFreeze = async (subId: string, schoolName: string) => {
    if (!confirm(`Freeze dashboard now for "${schoolName}"? This will expire the subscription/trial immediately and lock tenant dashboard access.`)) return;
    try {
      setActionLoading(true);
      await freezeSubscription(subId);
      setSuccess(`Dashboard for ${schoolName} is now FROZEN/EXPIRED. School users will now see the dashboard frozen restriction screen.`);
      fetchSubscriptions();
    } catch (e: any) {
      alert(e.response?.data?.message || 'Failed to freeze subscription.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleGrantTrial = async (subId: string, schoolName: string) => {
    try {
      setActionLoading(true);
      await grantOneDayTrial(subId);
      setSuccess(`1-Day Free Trial granted to ${schoolName}. Dashboard access is active for the next 24 hours.`);
      fetchSubscriptions();
    } catch (e: any) {
      alert(e.response?.data?.message || 'Failed to grant 1-day trial.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReactivate = async (subId: string, schoolName: string) => {
    try {
      setActionLoading(true);
      await reactivateSubscription(subId);
      setSuccess(`Subscription reactivated for ${schoolName}. Dashboard access is restored.`);
      fetchSubscriptions();
    } catch (e: any) {
      alert(e.response?.data?.message || 'Failed to reactivate subscription.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpgrade = async () => {
    if (!newPlanId || !selectedSub) return;
    try {
      setActionLoading(true);
      // Backend expects { newPlanId, reason } not { planId }
      await upgradePlan(selectedSub._id, { newPlanId, reason: 'Plan upgrade by admin' });
      setSuccess('Subscription upgraded successfully.');
      setUpgradeOpen(false);
      fetchSubscriptions();
    } catch (e: any) {
      alert(e.response?.data?.message || 'Failed to upgrade plan.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!cancelReason || !selectedSub) {
      alert('Please provide a cancellation reason.');
      return;
    }
    try {
      setActionLoading(true);
      await cancelSubscription(selectedSub._id, cancelReason);
      setSuccess('Subscription cancelled.');
      setCancelOpen(false);
      setCancelReason('');
      fetchSubscriptions();
    } catch (e: any) {
      alert(e.response?.data?.message || 'Failed to cancel subscription.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <Box sx={{ p: 4, maxWidth: 1440, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <EventAvailableIcon fontSize="large" color="primary" /> Subscriptions & Licensing
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateOpen(true)} sx={{ borderRadius: 2 }}>
          Activate Subscription
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      {/* Filter Bar */}
      <Paper elevation={0} sx={{ p: 2.5, mb: 3, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ alignItems: 'center' }}>
          <TextField
            size="small"
            placeholder="Search by school or code..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            sx={{ minWidth: 280 }}
          />
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Status</InputLabel>
            <Select value={statusFilter} label="Status" onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
              <MenuItem value="">All Statuses</MenuItem>
              <MenuItem value="ACTIVE">Active</MenuItem>
              <MenuItem value="TRIAL">Trial</MenuItem>
              <MenuItem value="PAST_DUE">Past Due</MenuItem>
              <MenuItem value="EXPIRED">Expired</MenuItem>
              <MenuItem value="CANCELLED">Cancelled</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Paper>

      {/* Subscriptions Table */}
      <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, mb: 3 }}>
        <Table>
          <TableHead sx={{ bgcolor: 'action.hover' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Tenant / School</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Plan</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Cycle</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Amount</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Valid Period</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={7} align="center" sx={{ py: 6 }}><CircularProgress /></TableCell></TableRow>
            ) : subscriptions.length === 0 ? (
              <TableRow><TableCell colSpan={7} align="center" sx={{ py: 6, color: 'text.secondary' }}>No subscriptions found.</TableCell></TableRow>
            ) : subscriptions.map(sub => {
              const tenantName = sub.tenantId?.name || 'Unknown School';
              const tenantCode = sub.tenantId?.code || 'N/A';
              const planName = sub.planId?.name || 'Custom Plan';
              const amount = sub.amount || sub.planId?.priceMonthly || 0;
              const isExpiringSoon = sub.endDate && dayjs(sub.endDate).diff(dayjs(), 'day') <= 14 && sub.status === 'ACTIVE';

              return (
                <TableRow key={sub._id} hover>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{tenantName}</Typography>
                    <Typography variant="caption" color="text.secondary">{tenantCode}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip size="small" label={planName} variant="outlined" color="primary" sx={{ fontWeight: 600 }} />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{sub.billingCycle || 'YEARLY'}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>₹{amount.toLocaleString()}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" sx={{ display: 'block' }}>
                      Start: {sub.startDate ? dayjs(sub.startDate).format('DD MMM YYYY') : 'N/A'}
                    </Typography>
                    <Typography variant="caption" color={isExpiringSoon ? 'error.main' : 'text.secondary'} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      {isExpiringSoon && <WarningAmberIcon sx={{ fontSize: 14 }} />}
                      End: {sub.endDate ? dayjs(sub.endDate).format('DD MMM YYYY') : 'Lifetime'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip size="small" label={sub.status} color={STATUS_COLORS[sub.status] || 'default'} sx={{ fontWeight: 700 }} />
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={0.5} sx={{ justifyContent: 'flex-end', flexWrap: 'nowrap' }}>
                      {/* Freeze / Expire Trial Now button for active or trial subscriptions */}
                      {(sub.status === 'ACTIVE' || sub.status === 'TRIAL') && (
                        <Tooltip title="Freeze / Expire Trial Now (Instant Dashboard Lock for Testing)">
                          <IconButton size="small" color="warning" onClick={() => handleFreeze(sub._id, tenantName)}>
                            <AcUnitIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}

                      {/* Grant 1-Day Trial button */}
                      <Tooltip title="Grant 1-Day Free Trial (24h)">
                        <IconButton size="small" color="info" onClick={() => handleGrantTrial(sub._id, tenantName)}>
                          <TimelapseIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      {/* Reactivate / Unfreeze button if expired, past due, or cancelled */}
                      {(sub.status === 'EXPIRED' || sub.status === 'PAST_DUE' || sub.status === 'CANCELLED') && (
                        <Tooltip title="Reactivate & Unfreeze Dashboard">
                          <IconButton size="small" color="success" onClick={() => handleReactivate(sub._id, tenantName)}>
                            <PlayCircleIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}

                      {sub.status === 'ACTIVE' && (
                        <>
                          <Tooltip title="Upgrade Plan">
                            <IconButton size="small" color="primary" onClick={() => { setSelectedSub(sub); setNewPlanId(''); setUpgradeOpen(true); }}>
                              <UpgradeIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Cancel Subscription">
                            <IconButton size="small" color="error" onClick={() => { setSelectedSub(sub); setCancelReason(''); setCancelOpen(true); }}>
                              <CancelIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Pagination count={totalPages} page={page} onChange={(_, p) => setPage(p)} color="primary" />
        </Box>
      )}

      {/* Activate Subscription Modal */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Activate School Subscription</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Select School / Tenant</InputLabel>
              <Select value={createData.tenantId} label="Select School / Tenant" onChange={e => setCreateData({ ...createData, tenantId: e.target.value })}>
                {tenants.map((t: any) => (
                  <MenuItem key={t._id} value={t._id}>{t.name} ({t.code})</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Select Subscription Plan</InputLabel>
              <Select value={createData.planId} label="Select Subscription Plan" onChange={e => setCreateData({ ...createData, planId: e.target.value })}>
                {plans.map((p: any) => (
                  <MenuItem key={p._id} value={p._id}>{p.name} — ₹{p.priceYearly || p.priceMonthly * 12}/yr</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Billing Cycle</InputLabel>
              <Select value={createData.billingCycle} label="Billing Cycle" onChange={e => setCreateData({ ...createData, billingCycle: e.target.value })}>
                <MenuItem value="MONTHLY">Monthly</MenuItem>
                <MenuItem value="QUARTERLY">Quarterly</MenuItem>
                <MenuItem value="YEARLY">Yearly (Recommended)</MenuItem>
              </Select>
            </FormControl>
            <Box sx={{ p: 1.5, bgcolor: 'action.hover', borderRadius: 2 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={createData.startWithTrial}
                    onChange={e => setCreateData({ ...createData, startWithTrial: e.target.checked })}
                    color="primary"
                  />
                }
                label={
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      Enable 1-Day Free Trial (Recommended)
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Dashboard starts with a 24-hour trial period. Easily observe dashboard freezing when the trial expires.
                    </Typography>
                  </Box>
                }
              />
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setCreateOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate} disabled={actionLoading}>
            {actionLoading ? 'Activating...' : 'Activate Plan'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Upgrade Plan Modal */}
      <Dialog open={upgradeOpen} onClose={() => setUpgradeOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Upgrade / Change Plan</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Current Plan: <strong>{selectedSub?.planId?.name}</strong> for <strong>{selectedSub?.tenantId?.name}</strong>
          </Typography>
          <FormControl fullWidth>
            <InputLabel>New Plan</InputLabel>
            <Select value={newPlanId} label="New Plan" onChange={e => setNewPlanId(e.target.value)}>
              {plans.filter(p => p._id !== selectedSub?.planId?._id).map((p: any) => (
                <MenuItem key={p._id} value={p._id}>{p.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setUpgradeOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleUpgrade} disabled={actionLoading || !newPlanId}>
            {actionLoading ? 'Upgrading...' : 'Confirm Upgrade'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Cancel Subscription Modal */}
      <Dialog open={cancelOpen} onClose={() => setCancelOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: 'error.main' }}>Cancel Subscription</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Are you sure you want to cancel the subscription for <strong>{selectedSub?.tenantId?.name}</strong>?
          </Typography>
          <TextField
            fullWidth
            label="Reason for cancellation *"
            multiline
            rows={3}
            value={cancelReason}
            onChange={e => setCancelReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setCancelOpen(false)}>Back</Button>
          <Button variant="contained" color="error" onClick={handleCancel} disabled={actionLoading || !cancelReason}>
            {actionLoading ? 'Cancelling...' : 'Cancel Subscription'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
