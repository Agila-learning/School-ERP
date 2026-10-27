import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Button, TextField, Chip, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Dialog, DialogTitle,
  DialogContent, DialogActions, Grid, Card, CardContent, Alert, CircularProgress,
  IconButton, Tooltip, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { fetchBranches, createBranch, updateBranch, type Branch } from '../api/organization.api';

const BranchManagement: React.FC = () => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [form, setForm] = useState<any>({
    name: '',
    code: '',
    phone: '',
    email: '',
    status: 'ACTIVE',
    address: { street: '', city: '', state: '', country: 'India', postalCode: '' },
    workingHours: { start: '08:00', end: '16:00' }
  });
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const loadBranches = async () => {
    setLoading(true);
    try {
      const res = await fetchBranches();
      setBranches(res.data || []);
    } catch (err: any) {
      console.error(err);
      setAlert({ type: 'error', msg: err.response?.data?.message || 'Failed to load branches' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBranches();
  }, []);

  const handleOpenDialog = (branch?: Branch) => {
    if (branch) {
      setEditingBranch(branch);
      setForm({
        name: branch.name,
        code: branch.code,
        phone: branch.phone || '',
        email: branch.email || '',
        status: branch.status || 'ACTIVE',
        address: {
          street: branch.address?.street || '',
          city: branch.address?.city || '',
          state: branch.address?.state || '',
          country: branch.address?.country || 'India',
          postalCode: branch.address?.postalCode || ''
        },
        workingHours: {
          start: branch.workingHours?.start || '08:00',
          end: branch.workingHours?.end || '16:00'
        }
      });
    } else {
      setEditingBranch(null);
      setForm({
        name: '',
        code: '',
        phone: '',
        email: '',
        status: 'ACTIVE',
        address: { street: '', city: '', state: '', country: 'India', postalCode: '' },
        workingHours: { start: '08:00', end: '16:00' }
      });
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.code) {
      setAlert({ type: 'error', msg: 'Branch Name and Branch Code are required' });
      return;
    }
    setSaving(true);
    try {
      if (editingBranch) {
        await updateBranch(editingBranch._id, form);
        setAlert({ type: 'success', msg: 'Branch updated successfully' });
      } else {
        await createBranch(form);
        setAlert({ type: 'success', msg: 'Branch created successfully' });
      }
      setDialogOpen(false);
      loadBranches();
    } catch (err: any) {
      console.error(err);
      setAlert({ type: 'error', msg: err.response?.data?.message || 'Failed to save branch' });
    } finally {
      setSaving(false);
    }
  };

  const filtered = branches.filter(b =>
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    b.code.toLowerCase().includes(search.toLowerCase()) ||
    (b.address?.city || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, minHeight: '100vh', bgcolor: '#f8fafc' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#1e293b' }}>
            🏢 Branch Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage institutional branches, campuses, locations, and working schedules
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, px: 3, py: 1 }}
        >
          Create Branch
        </Button>
      </Box>

      {alert && (
        <Alert severity={alert.type} onClose={() => setAlert(null)} sx={{ mb: 3 }}>
          {alert.msg}
        </Alert>
      )}

      {/* KPI Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary">Total Branches</Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#1e293b', mt: 0.5 }}>
                {branches.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary">Active Branches</Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#16a34a', mt: 0.5 }}>
                {branches.filter(b => b.status === 'ACTIVE').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary">Inactive / Pending</Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#64748b', mt: 0.5 }}>
                {branches.filter(b => b.status !== 'ACTIVE').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search Bar */}
      <Paper elevation={0} sx={{ p: 2, mb: 3, border: '1px solid #e2e8f0', borderRadius: 3 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search by branch name, code, or city..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </Paper>

      {/* Branch Table */}
      <Paper elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: '#f1f5f9' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Branch Name</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Code</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Contact</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Location</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Working Hours</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map(b => (
                  <TableRow key={b._id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <AccountBalanceIcon color="primary" />
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{b.name}</Typography>
                          <Typography variant="caption" color="text.secondary">{b.schoolId?.name || 'School Campus'}</Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                        {b.code}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        {b.phone && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <PhoneIcon sx={{ fontSize: 14, color: '#64748b' }} />
                            <Typography variant="caption">{b.phone}</Typography>
                          </Box>
                        )}
                        {b.email && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <EmailIcon sx={{ fontSize: 14, color: '#64748b' }} />
                            <Typography variant="caption">{b.email}</Typography>
                          </Box>
                        )}
                        {!b.phone && !b.email && '—'}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <LocationOnIcon sx={{ fontSize: 16, color: '#64748b' }} />
                        <Typography variant="body2">
                          {[b.address?.street, b.address?.city, b.address?.state].filter(Boolean).join(', ') || '—'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <AccessTimeIcon sx={{ fontSize: 14, color: '#64748b' }} />
                        <Typography variant="caption">
                          {b.workingHours?.start && b.workingHours?.end ? `${b.workingHours.start} - ${b.workingHours.end}` : 'Standard'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={b.status}
                        size="small"
                        color={b.status === 'ACTIVE' ? 'success' : 'default'}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Edit Branch">
                        <IconButton size="small" onClick={() => handleOpenDialog(b)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                      <AccountBalanceIcon sx={{ fontSize: 48, color: '#cbd5e1', mb: 1 }} />
                      <Typography color="text.secondary">No branches found. Click "+ Create Branch" to add your first branch.</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>
          {editingBranch ? '✏️ Edit Branch' : '🏢 Create New Branch'}
        </DialogTitle>
        <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Branch Name *"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Main Campus, North City Branch"
            fullWidth
            required
          />
          <TextField
            label="Branch Code *"
            value={form.code}
            onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })}
            placeholder="e.g. MC-01, NCB-02"
            fullWidth
            required
            helperText="Unique uppercase identifier for this branch"
          />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Phone Number"
              value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })}
              fullWidth
            />
            <TextField
              label="Official Email"
              type="email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              fullWidth
            />
          </Box>
          <FormControl fullWidth size="small">
            <InputLabel>Status</InputLabel>
            <Select
              label="Status"
              value={form.status}
              onChange={e => setForm({ ...form, status: e.target.value })}
            >
              <MenuItem value="ACTIVE">ACTIVE</MenuItem>
              <MenuItem value="INACTIVE">INACTIVE</MenuItem>
            </Select>
          </FormControl>

          <Typography variant="subtitle2" sx={{ fontWeight: 700, mt: 1 }}>
            Address & Location
          </Typography>
          <TextField
            label="Street Address"
            value={form.address.street}
            onChange={e => setForm({ ...form, address: { ...form.address, street: e.target.value } })}
            fullWidth
          />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="City"
              value={form.address.city}
              onChange={e => setForm({ ...form, address: { ...form.address, city: e.target.value } })}
              fullWidth
            />
            <TextField
              label="State / Province"
              value={form.address.state}
              onChange={e => setForm({ ...form, address: { ...form.address, state: e.target.value } })}
              fullWidth
            />
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Country"
              value={form.address.country}
              onChange={e => setForm({ ...form, address: { ...form.address, country: e.target.value } })}
              fullWidth
            />
            <TextField
              label="Postal Code"
              value={form.address.postalCode}
              onChange={e => setForm({ ...form, address: { ...form.address, postalCode: e.target.value } })}
              fullWidth
            />
          </Box>

          <Typography variant="subtitle2" sx={{ fontWeight: 700, mt: 1 }}>
            Working Hours
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Start Time"
              type="time"
              value={form.workingHours.start}
              onChange={e => setForm({ ...form, workingHours: { ...form.workingHours, start: e.target.value } })}
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              label="End Time"
              type="time"
              value={form.workingHours.end}
              onChange={e => setForm({ ...form, workingHours: { ...form.workingHours, end: e.target.value } })}
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving} sx={{ px: 3 }}>
            {saving ? 'Saving...' : 'Save Branch'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BranchManagement;
