import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Paper, Grid, Tabs, Tab, Chip, Button, CircularProgress,
  Alert, Divider, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Stack, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BusinessIcon from '@mui/icons-material/Business';
import SchoolIcon from '@mui/icons-material/School';
import PeopleIcon from '@mui/icons-material/People';
import ReceiptIcon from '@mui/icons-material/Receipt';
import HistoryIcon from '@mui/icons-material/History';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EditIcon from '@mui/icons-material/Edit';
import {
  getTenantDetail, suspendTenant,
  reactivateTenant, archiveTenant, updateTenant
} from '../api/superAdmin.api';
import dayjs from 'dayjs';

const STATUS_COLORS: Record<string, any> = {
  ACTIVE: 'success', active: 'success',
  SUSPENDED: 'error', suspended: 'error',
  TRIAL: 'info',
  EXPIRED: 'warning',
  ARCHIVED: 'default',
};

export default function SchoolDetail360() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [tenant, setTenant] = useState<any>(null);
  const [schools, setSchools] = useState<any[]>([]);
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [subHistory, setSubHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);

  // Suspend modal
  const [suspendOpen, setSuspendOpen] = useState(false);
  const [suspendReason, setSuspendReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Edit School modal
  const [editOpen, setEditOpen] = useState(false);
  const [editSaving, setEditSaving] = useState(false);
  const [editData, setEditData] = useState<any>({
    name: '', legalName: '', schoolType: 'SECONDARY', phone: '', website: '',
    city: '', state: '', country: 'India', postalCode: '', primaryContactName: '',
    primaryContactEmail: '', primaryContactPhone: '', notes: ''
  });

  useEffect(() => {
    if (id) {
      loadTenantData(id);
    }
  }, [id]);

  const loadTenantData = async (tenantId: string) => {
    try {
      setLoading(true);
      const res = await getTenantDetail(tenantId);
      const data = res.data.data;
      setTenant(data.tenant);
      // Backend returns: { tenant, schools, branches, admins, subscriptionHistory }
      setSchools(data.schools || []);
      setAdminUsers(data.admins || []);          // FIXED: backend key is 'admins'
      setSubHistory(data.subscriptionHistory || []);
      setInvoices([]);  // Invoices fetched separately via InvoiceManagement page

      setError('');
    } catch {
      setError('Failed to load tenant 360 profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleSuspend = async () => {
    if (!suspendReason) return;
    try {
      setActionLoading(true);
      await suspendTenant(id!, suspendReason);
      setSuccess('School tenant has been suspended.');
      setSuspendOpen(false);
      setSuspendReason('');
      loadTenantData(id!);
    } catch (e: any) {
      alert(e.response?.data?.message || 'Failed to suspend tenant.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReactivate = async () => {
    if (!window.confirm('Reactivate this school tenant and restore full platform access?')) return;
    try {
      setActionLoading(true);
      await reactivateTenant(id!);
      setSuccess('School tenant has been reactivated.');
      loadTenantData(id!);
    } catch (e: any) {
      alert(e.response?.data?.message || 'Failed to reactivate tenant.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleArchive = async () => {
    if (!window.confirm('Archive this tenant? This action will mark all records as archived.')) return;
    try {
      setActionLoading(true);
      await archiveTenant(id!);
      setSuccess('Tenant archived.');
      loadTenantData(id!);
    } catch (e: any) {
      alert(e.response?.data?.message || 'Failed to archive tenant.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenEdit = () => {
    if (!tenant) return;
    setEditData({
      name: tenant.name || '',
      legalName: tenant.legalName || tenant.name || '',
      schoolType: tenant.schoolType || 'SECONDARY',
      phone: tenant.phone || '',
      website: tenant.website || '',
      city: tenant.city || tenant.address?.city || '',
      state: tenant.state || tenant.address?.state || '',
      country: tenant.country || tenant.address?.country || 'India',
      postalCode: tenant.postalCode || tenant.address?.postalCode || '',
      primaryContactName: tenant.primaryContactName || tenant.adminName || '',
      primaryContactEmail: tenant.primaryContactEmail || tenant.adminEmail || '',
      primaryContactPhone: tenant.primaryContactPhone || tenant.phone || '',
      notes: tenant.notes || '',
    });
    setEditOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editData.name) return alert('School Name is required.');
    try {
      setEditSaving(true);
      await updateTenant(id!, editData);
      setSuccess('School updated successfully.');
      setEditOpen(false);
      loadTenantData(id!);
    } catch (e: any) {
      alert(e.response?.data?.message || 'Failed to update school');
    } finally {
      setEditSaving(false);
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}><CircularProgress /></Box>;
  if (!tenant) return <Box sx={{ p: 4 }}><Alert severity="error">Tenant not found.</Alert></Box>;

  return (
    <Box sx={{ p: 4, maxWidth: 1440, mx: 'auto' }}>
      {/* Top Breadcrumb / Action */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/super-admin/tenants')}>
          Back to Schools
        </Button>
        <Stack direction="row" spacing={1.5}>
          <Button variant="contained" startIcon={<EditIcon />} onClick={handleOpenEdit}>
            Edit School
          </Button>
          {tenant.status === 'ACTIVE' || tenant.status === 'active' ? (
            <Button variant="outlined" color="error" startIcon={<BlockIcon />} onClick={() => setSuspendOpen(true)}>
              Suspend School
            </Button>
          ) : (
            <Button variant="contained" color="success" startIcon={<CheckCircleIcon />} onClick={handleReactivate}>
              Reactivate School
            </Button>
          )}
          {tenant.status !== 'ARCHIVED' && (
            <Button variant="outlined" color="inherit" onClick={handleArchive}>
              Archive
            </Button>
          )}
        </Stack>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      {/* Header Profile Card */}
      <Paper elevation={0} sx={{ p: 3.5, mb: 4, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
        <Grid container spacing={3} sx={{ alignItems: 'center' }}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              <Typography variant="h4" sx={{ fontWeight: 800 }}>{tenant.name}</Typography>
              <Chip label={tenant.code} sx={{ fontFamily: 'monospace', fontWeight: 700 }} />
              <Chip
                label={tenant.status}
                color={STATUS_COLORS[tenant.status] || 'default'}
                sx={{ fontWeight: 700 }}
              />
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Legal: <strong>{tenant.legalName || tenant.name}</strong> • Type: {tenant.schoolType || 'K-12 School'} • Created: {dayjs(tenant.createdAt).format('DD MMM YYYY')}
            </Typography>
            {tenant.suspensionReason && (
              <Alert severity="error" sx={{ mt: 2, py: 0.5 }}>
                Suspended Reason: {tenant.suspensionReason}
              </Alert>
            )}
          </Grid>
          <Grid size={{ xs: 12, md: 4 }} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Current Plan</Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
              {tenant.currentSubscriptionId?.planId?.name || 'Standard Tier'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Expires: {tenant.currentSubscriptionId?.endDate ? dayjs(tenant.currentSubscriptionId.endDate).format('DD MMM YYYY') : 'Active'}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabs */}
      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, overflow: 'hidden' }}>
        <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
          <Tab icon={<BusinessIcon fontSize="small" />} iconPosition="start" label="Overview & Contact" />
          <Tab icon={<SchoolIcon fontSize="small" />} iconPosition="start" label={`Campuses (${schools.length})`} />
          <Tab icon={<PeopleIcon fontSize="small" />} iconPosition="start" label={`Administrators (${adminUsers.length})`} />
          <Tab icon={<ReceiptIcon fontSize="small" />} iconPosition="start" label={`Invoices (${invoices.length})`} />
          <Tab icon={<HistoryIcon fontSize="small" />} iconPosition="start" label="Subscription History" />
        </Tabs>

        {/* Tab 0: Overview */}
        {tabValue === 0 && (
          <Box sx={{ p: 4 }}>
            <Grid container spacing={4}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Primary Contact Details</Typography>
                <Divider sx={{ mb: 2 }} />
                <Stack spacing={1.5}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography color="text.secondary">Contact Person:</Typography>
                    <Typography sx={{ fontWeight: 600 }}>{tenant.primaryContactName || tenant.adminName || 'N/A'}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography color="text.secondary">Email Address:</Typography>
                    <Typography sx={{ fontWeight: 600 }}>{tenant.primaryContactEmail || tenant.adminEmail || 'N/A'}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography color="text.secondary">Phone Number:</Typography>
                    <Typography sx={{ fontWeight: 600 }}>{tenant.primaryContactPhone || tenant.phone || 'N/A'}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography color="text.secondary">Official Website:</Typography>
                    <Typography sx={{ fontWeight: 600 }}>{tenant.website || 'N/A'}</Typography>
                  </Box>
                </Stack>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Location & Settings</Typography>
                <Divider sx={{ mb: 2 }} />
                <Stack spacing={1.5}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography color="text.secondary">City / State:</Typography>
                    <Typography sx={{ fontWeight: 600 }}>{tenant.city || 'Mumbai'}, {tenant.state || 'Maharashtra'}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography color="text.secondary">Country:</Typography>
                    <Typography sx={{ fontWeight: 600 }}>{tenant.country || 'India'}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography color="text.secondary">Currency / Timezone:</Typography>
                    <Typography sx={{ fontWeight: 600 }}>{tenant.currency || 'INR (₹)'} • {tenant.timezone || 'Asia/Kolkata'}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography color="text.secondary">Onboarding Status:</Typography>
                    <Chip size="small" label={tenant.onboardingStatus || 'COMPLETED'} color="success" />
                  </Box>
                </Stack>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Tab 1: Campuses */}
        {tabValue === 1 && (
          <Box sx={{ p: 4 }}>
            <TableContainer>
              <Table size="small">
                <TableHead sx={{ bgcolor: 'action.hover' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>School Campus Name</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Code</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {schools.length === 0 ? (
                    <TableRow><TableCell colSpan={4} align="center" sx={{ py: 3, color: 'text.secondary' }}>No campuses found.</TableCell></TableRow>
                  ) : schools.map(s => (
                    <TableRow key={s._id} hover>
                      <TableCell sx={{ fontWeight: 600 }}>{s.displayName || s.name}</TableCell>
                      <TableCell sx={{ fontFamily: 'monospace' }}>{s.code}</TableCell>
                      <TableCell>{s.email || 'N/A'}</TableCell>
                      <TableCell><Chip size="small" label={s.status || 'ACTIVE'} color={STATUS_COLORS[s.status] || 'default'} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {/* Tab 2: Admin Users */}
        {tabValue === 2 && (
          <Box sx={{ p: 4 }}>
            <TableContainer>
              <Table size="small">
                <TableHead sx={{ bgcolor: 'action.hover' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {adminUsers.length === 0 ? (
                    <TableRow><TableCell colSpan={3} align="center" sx={{ py: 3, color: 'text.secondary' }}>No admin users found.</TableCell></TableRow>
                  ) : adminUsers.map(u => (
                    <TableRow key={u._id} hover>
                      <TableCell sx={{ fontWeight: 600 }}>{u.firstName} {u.lastName}</TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell><Chip size="small" label={u.accountStatus || 'active'} color="success" /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {/* Tab 3: Invoices */}
        {tabValue === 3 && (
          <Box sx={{ p: 4 }}>
            <TableContainer>
              <Table size="small">
                <TableHead sx={{ bgcolor: 'action.hover' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Invoice #</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Amount</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Due Date</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {invoices.length === 0 ? (
                    <TableRow><TableCell colSpan={4} align="center" sx={{ py: 3, color: 'text.secondary' }}>No invoices issued yet.</TableCell></TableRow>
                  ) : invoices.map(inv => (
                    <TableRow key={inv._id} hover>
                      <TableCell sx={{ fontWeight: 700, fontFamily: 'monospace' }}>{inv.invoiceNumber}</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>₹{(inv.totalAmount || 0).toLocaleString()}</TableCell>
                      <TableCell>{dayjs(inv.dueDate).format('DD MMM YYYY')}</TableCell>
                      <TableCell><Chip size="small" label={inv.status} color={inv.status === 'PAID' ? 'success' : 'warning'} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {/* Tab 4: Subscription History */}
        {tabValue === 4 && (
          <Box sx={{ p: 4 }}>
            <TableContainer>
              <Table size="small">
                <TableHead sx={{ bgcolor: 'action.hover' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Event</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>From Plan</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>To Plan</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {subHistory.length === 0 ? (
                    <TableRow><TableCell colSpan={4} align="center" sx={{ py: 3, color: 'text.secondary' }}>No subscription history recorded yet.</TableCell></TableRow>
                  ) : subHistory.map(h => (
                    <TableRow key={h._id} hover>
                      <TableCell><Chip size="small" label={h.changeType} color="primary" /></TableCell>
                      <TableCell>{h.previousPlan?.name || 'None'}</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{h.newPlan?.name || 'N/A'}</TableCell>
                      <TableCell>{dayjs(h.createdAt).format('DD MMM YYYY, hh:mm A')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </Paper>

      {/* Suspend School Modal */}
      <Dialog open={suspendOpen} onClose={() => setSuspendOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: 'error.main' }}>Suspend School Tenant</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Suspending <strong>{tenant.name}</strong> will block login access for all users belonging to this school immediately.
          </Typography>
          <TextField
            fullWidth
            label="Suspension Reason *"
            multiline
            rows={3}
            value={suspendReason}
            onChange={e => setSuspendReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setSuspendOpen(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleSuspend} disabled={actionLoading || !suspendReason}>
            {actionLoading ? 'Suspending...' : 'Confirm Suspension'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit School Modal */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Edit School Details</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth label="School Display Name *" value={editData.name} onChange={e => setEditData({...editData, name: e.target.value})} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth label="Legal Name" value={editData.legalName} onChange={e => setEditData({...editData, legalName: e.target.value})} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel>School Type</InputLabel>
                <Select value={editData.schoolType} label="School Type" onChange={e => setEditData({...editData, schoolType: e.target.value})}>
                  {['PRIMARY', 'SECONDARY', 'HIGHER_SECONDARY', 'UNIVERSITY', 'VOCATIONAL', 'INTERNATIONAL', 'OTHER'].map(st => (
                    <MenuItem key={st} value={st}>{st}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth label="Phone" value={editData.phone} onChange={e => setEditData({...editData, phone: e.target.value})} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth label="Official Website" value={editData.website} onChange={e => setEditData({...editData, website: e.target.value})} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth label="Primary Contact Person" value={editData.primaryContactName} onChange={e => setEditData({...editData, primaryContactName: e.target.value})} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth label="Primary Contact Email" value={editData.primaryContactEmail} onChange={e => setEditData({...editData, primaryContactEmail: e.target.value})} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth label="Primary Contact Phone" value={editData.primaryContactPhone} onChange={e => setEditData({...editData, primaryContactPhone: e.target.value})} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField fullWidth label="City" value={editData.city} onChange={e => setEditData({...editData, city: e.target.value})} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField fullWidth label="State" value={editData.state} onChange={e => setEditData({...editData, state: e.target.value})} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField fullWidth label="Postal Code" value={editData.postalCode} onChange={e => setEditData({...editData, postalCode: e.target.value})} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField fullWidth label="Internal Notes" multiline rows={2} value={editData.notes} onChange={e => setEditData({...editData, notes: e.target.value})} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveEdit} disabled={editSaving}>
            {editSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
