import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableHead, TableRow,
  Button, Chip, TextField, Dialog, DialogTitle, DialogContent, DialogActions,
  Stack, Alert, CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import StoreIcon from '@mui/icons-material/Store';
import axios from 'axios';

const LibraryVendorManagement: React.FC = () => {
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [form, setForm] = useState<any>({ name: '', contactPerson: '', email: '', phone: '', address: '', gstNumber: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchVendors = () => {
    setLoading(true);
    axios.get('/api/v1/library/vendors')
      .then(res => setVendors(res.data.data))
      .catch(() => setError('Failed to load vendors.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchVendors(); }, []);

  const handleCreate = async () => {
    if (!form.name) { setError('Vendor name is required.'); return; }
    setSaving(true);
    try {
      await axios.post('/api/v1/library/vendors', form);
      setOpenDialog(false);
      setForm({ name: '', contactPerson: '', email: '', phone: '', address: '', gstNumber: '' });
      fetchVendors();
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to create vendor.');
    } finally { setSaving(false); }
  };

  const handleStatusToggle = async (vendorId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await axios.patch(`/api/v1/library/vendors/${vendorId}`, { status: newStatus });
      fetchVendors();
    } catch { setError('Failed to update vendor status.'); }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <StoreIcon color="primary" />
          <Typography variant="h4" sx={{ fontWeight: 700 }}>Library Vendors</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenDialog(true)}>
          Add Vendor
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}><CircularProgress /></Box>
      ) : (
        <Paper>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Vendor Name</TableCell>
                <TableCell>Contact Person</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>GST No.</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {vendors.length === 0 ? (
                <TableRow><TableCell colSpan={7} align="center">No vendors added yet.</TableCell></TableRow>
              ) : vendors.map((v: any) => (
                <TableRow key={v._id} hover>
                  <TableCell><Typography sx={{ fontWeight: 500 }}>{v.name}</Typography></TableCell>
                  <TableCell>{v.contactPerson || '—'}</TableCell>
                  <TableCell>{v.email || '—'}</TableCell>
                  <TableCell>{v.phone || '—'}</TableCell>
                  <TableCell>{v.gstNumber || '—'}</TableCell>
                  <TableCell>
                    <Chip label={v.status} color={v.status === 'ACTIVE' ? 'success' : v.status === 'BLACKLISTED' ? 'error' : 'default'} size="small" />
                  </TableCell>
                  <TableCell>
                    <Button size="small" onClick={() => handleStatusToggle(v._id, v.status)}>
                      {v.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Library Vendor</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField label="Vendor Name *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} fullWidth size="small" />
            <TextField label="Contact Person" value={form.contactPerson} onChange={e => setForm({ ...form, contactPerson: e.target.value })} fullWidth size="small" />
            <TextField label="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} fullWidth size="small" />
            <TextField label="Phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} fullWidth size="small" />
            <TextField label="Address" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} fullWidth size="small" multiline rows={2} />
            <TextField label="GST Number" value={form.gstNumber} onChange={e => setForm({ ...form, gstNumber: e.target.value })} fullWidth size="small" />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate} disabled={saving}>
            {saving ? 'Saving...' : 'Create Vendor'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LibraryVendorManagement;
