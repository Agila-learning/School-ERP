import { useState, useEffect } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Button, IconButton, TextField, MenuItem, Select, FormControl, InputLabel, CircularProgress, Alert, Pagination, Stack, Dialog, DialogTitle, DialogContent, DialogActions, Grid, InputAdornment } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArchiveIcon from '@mui/icons-material/Archive';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate } from 'react-router-dom';
import { getTenants, createTenant, updateTenant, suspendTenant, reactivateTenant, archiveTenant } from '../api/superAdmin.api';
import { getPlans } from '../api/superAdmin.api';
import dayjs from 'dayjs';

const STATUS_COLORS: Record<string, 'success' | 'error' | 'warning' | 'info' | 'default'> = {
  ACTIVE: 'success', active: 'success',
  TRIAL: 'info', PROSPECT: 'default',
  SUSPENDED: 'error', suspended: 'error',
  EXPIRED: 'warning', CANCELLED: 'default', ARCHIVED: 'default',
};

export default function TenantManagement() {
  const navigate = useNavigate();
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [suspendModal, setSuspendModal] = useState<{open: boolean, id: string, name: string}>({ open: false, id: '', name: '' });
  const [suspendReason, setSuspendReason] = useState('');
  const [plans, setPlans] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    organizationName: '', schoolName: '', email: '', phone: '', adminName: '', password: '', planId: '', city: '', state: '', country: 'India'
  });

  // Edit School Dialog state
  const [editModal, setEditModal] = useState<{ open: boolean; id: string }>({ open: false, id: '' });
  const [editData, setEditData] = useState<any>({
    name: '', legalName: '', schoolType: 'SECONDARY', phone: '', website: '',
    city: '', state: '', country: 'India', postalCode: '', primaryContactName: '',
    primaryContactEmail: '', primaryContactPhone: '', notes: ''
  });
  const [editSaving, setEditSaving] = useState(false);
  const [phoneError, setPhoneError] = useState('');

  useEffect(() => { fetchData(); }, [page, statusFilter]);
  useEffect(() => { getPlans().then(r => setPlans(r.data.data)).catch(() => {}); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await getTenants({ page, limit: 15, status: statusFilter || undefined, search: search || undefined });
      setTenants(res.data.data);
      setTotalPages(res.data.pagination?.pages || 1);
    } catch { setError('Failed to load schools'); }
    finally { setLoading(false); }
  };

  const handleSearch = () => { setPage(1); fetchData(); };
  const handleKeyDown = (e: any) => { if (e.key === 'Enter') handleSearch(); };

  const handleCreate = async () => {
    // 10-digit phone validation
    const phoneDigits = formData.phone.replace(/\D/g, '');
    if (phoneDigits.length !== 10) {
      setPhoneError('Mobile number must be exactly 10 digits.');
      return;
    }
    setPhoneError('');
    try {
      await createTenant({ ...formData, phone: phoneDigits });
      setOpenModal(false);
      setFormData({ organizationName: '', schoolName: '', email: '', phone: '', adminName: '', password: '', planId: '', city: '', state: '', country: 'India' });
      fetchData();
    } catch (e: any) { alert(e.response?.data?.message || 'Failed to create school'); }
  };

  const handleSuspend = async () => {
    if (!suspendReason.trim()) return alert('Please provide a suspension reason.');
    try {
      await suspendTenant(suspendModal.id, suspendReason);
      setSuspendModal({ open: false, id: '', name: '' });
      setSuspendReason('');
      fetchData();
    } catch (e: any) { alert(e.response?.data?.message || 'Failed to suspend'); }
  };

  const handleReactivate = async (id: string) => {
    if (!window.confirm('Reactivate this school?')) return;
    try { await reactivateTenant(id); fetchData(); }
    catch (e: any) { alert(e.response?.data?.message || 'Failed to reactivate'); }
  };

  const handleArchive = async (id: string, name: string) => {
    if (!window.confirm(`Archive "${name}"? The school data will be retained.`)) return;
    try { await archiveTenant(id); fetchData(); }
    catch (e: any) { alert(e.response?.data?.message || 'Failed to archive'); }
  };

  const handleOpenEdit = (t: any) => {
    setEditModal({ open: true, id: t._id });
    setEditData({
      name: t.name || '',
      legalName: t.legalName || t.name || '',
      schoolType: t.schoolType || 'SECONDARY',
      phone: t.phone || '',
      website: t.website || '',
      city: t.city || t.address?.city || '',
      state: t.state || t.address?.state || '',
      country: t.country || t.address?.country || 'India',
      postalCode: t.postalCode || t.address?.postalCode || '',
      primaryContactName: t.primaryContactName || t.adminName || '',
      primaryContactEmail: t.primaryContactEmail || t.adminEmail || '',
      primaryContactPhone: t.primaryContactPhone || t.phone || '',
      notes: t.notes || '',
    });
  };

  const handleSaveEdit = async () => {
    if (!editData.name) return alert('School Name is required.');
    try {
      setEditSaving(true);
      await updateTenant(editModal.id, editData);
      setEditModal({ open: false, id: '' });
      fetchData();
    } catch (e: any) {
      alert(e.response?.data?.message || 'Failed to update school');
    } finally {
      setEditSaving(false);
    }
  };

  return (
    <Box sx={{ p: 4, maxWidth: 1600, mx: 'auto' }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: '#1e293b' }}>Schools & Tenants</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenModal(true)}>Onboard New School</Button>
      </Box>

      {/* Filters */}
      <Paper elevation={0} sx={{ p: 2, mb: 3, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
          <TextField placeholder="Search school name..." value={search} onChange={e => setSearch(e.target.value)} onKeyDown={handleKeyDown} size="small" slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon color="action" /></InputAdornment> } }} sx={{ flexGrow: 1 }} />
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Status</InputLabel>
            <Select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} label="Status">
              <MenuItem value="">All</MenuItem>
              {['ACTIVE', 'TRIAL', 'PROSPECT', 'SUSPENDED', 'EXPIRED', 'CANCELLED', 'ARCHIVED'].map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
            </Select>
          </FormControl>
          <Button variant="outlined" onClick={handleSearch}>Search</Button>
        </Stack>
      </Paper>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
        <Table>
          <TableHead sx={{ bgcolor: 'grey.50' }}>
            <TableRow>
              <TableCell><strong>School</strong></TableCell>
              <TableCell><strong>Code</strong></TableCell>
              <TableCell><strong>Admin Email</strong></TableCell>
              <TableCell><strong>City</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell><strong>Onboarding</strong></TableCell>
              <TableCell><strong>Created</strong></TableCell>
              <TableCell align="right"><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={8} align="center" sx={{ py: 4 }}><CircularProgress /></TableCell></TableRow>
            ) : tenants.length === 0 ? (
              <TableRow><TableCell colSpan={8} align="center" sx={{ py: 4 }}>No schools found.</TableCell></TableRow>
            ) : tenants.map(t => (
              <TableRow key={t._id} hover>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{t.name}</Typography>
                  {t.legalName && <Typography variant="caption" color="text.secondary">{t.legalName}</Typography>}
                </TableCell>
                <TableCell><Chip label={t.code} size="small" variant="outlined" /></TableCell>
                <TableCell>{t.adminEmail}</TableCell>
                <TableCell>{t.city || '—'}</TableCell>
                <TableCell><Chip label={t.status} size="small" color={STATUS_COLORS[t.status] || 'default'} /></TableCell>
                <TableCell>
                  <Chip label={t.onboardingStatus || 'NOT_STARTED'} size="small" variant="outlined" color={t.onboardingStatus === 'COMPLETED' ? 'success' : 'default'} />
                </TableCell>
                <TableCell>{dayjs(t.createdAt).format('DD MMM YYYY')}</TableCell>
                <TableCell align="right">
                  <IconButton size="small" color="primary" onClick={() => navigate(`/super-admin/tenants/${t._id}`)} title="View Details"><VisibilityIcon fontSize="small" /></IconButton>
                  <IconButton size="small" onClick={() => handleOpenEdit(t)} title="Edit"><EditIcon fontSize="small" /></IconButton>
                  {(t.status === 'ACTIVE' || t.status === 'active' || t.status === 'TRIAL') && (
                    <IconButton size="small" color="error" title="Suspend" onClick={() => setSuspendModal({ open: true, id: t._id, name: t.name })}><BlockIcon fontSize="small" /></IconButton>
                  )}
                  {(t.status === 'SUSPENDED' || t.status === 'suspended' || t.status === 'EXPIRED') && (
                    <IconButton size="small" color="success" title="Reactivate" onClick={() => handleReactivate(t._id)}><CheckCircleIcon fontSize="small" /></IconButton>
                  )}
                  {t.status !== 'ARCHIVED' && (
                    <IconButton size="small" title="Archive" onClick={() => handleArchive(t._id, t.name)}><ArchiveIcon fontSize="small" /></IconButton>
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

      {/* Onboard Modal */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Onboard New School</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Organization Name *" value={formData.organizationName} onChange={e => setFormData({...formData, organizationName: e.target.value})} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="School Name *" value={formData.schoolName} onChange={e => setFormData({...formData, schoolName: e.target.value})} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Admin Name *" value={formData.adminName} onChange={e => setFormData({...formData, adminName: e.target.value})} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Admin Email *" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Admin Password *" type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} helperText="Min 8 characters" /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Mobile Number *"
                value={formData.phone}
                onChange={e => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                  setFormData({...formData, phone: val});
                  setPhoneError(val.length > 0 && val.length < 10 ? 'Must be 10 digits' : '');
                }}
                error={!!phoneError}
                helperText={phoneError || '10-digit mobile number'}
                slotProps={{ htmlInput: { inputMode: 'numeric', maxLength: 10 } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}><TextField fullWidth label="City" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} /></Grid>
            <Grid size={{ xs: 12, sm: 4 }}><TextField fullWidth label="State" value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} /></Grid>
            <Grid size={{ xs: 12, sm: 4 }}><TextField fullWidth label="Country" value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})} /></Grid>
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth>
                <InputLabel>Subscription Plan</InputLabel>
                <Select value={formData.planId} onChange={e => setFormData({...formData, planId: e.target.value})} label="Subscription Plan">
                  {plans.map(p => <MenuItem key={p._id} value={p._id}>{p.name} — ₹{p.price} / {p.billingCycle} ({p.trialDays}d trial)</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenModal(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate}>Onboard School</Button>
        </DialogActions>
      </Dialog>

      {/* Suspend Modal */}
      <Dialog open={suspendModal.open} onClose={() => setSuspendModal({ open: false, id: '', name: '' })} maxWidth="sm" fullWidth>
        <DialogTitle color="error">Suspend School: {suspendModal.name}</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>This will immediately suspend access for all users of this school. Provide a reason:</Typography>
          <TextField fullWidth label="Suspension Reason *" value={suspendReason} onChange={e => setSuspendReason(e.target.value)} multiline rows={3} select={false} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSuspendModal({ open: false, id: '', name: '' })}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleSuspend}>Confirm Suspension</Button>
        </DialogActions>
      </Dialog>

      {/* Edit School Modal */}
      <Dialog open={editModal.open} onClose={() => setEditModal({ open: false, id: '' })} maxWidth="md" fullWidth>
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
          <Button onClick={() => setEditModal({ open: false, id: '' })}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveEdit} disabled={editSaving}>
            {editSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
