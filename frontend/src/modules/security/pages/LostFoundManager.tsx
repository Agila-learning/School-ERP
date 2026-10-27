import React, { useState, useEffect, useMemo } from 'react';
import {
  Box, Typography, Card, CardContent, Button, Table, TableBody,
  TableCell, TableHead, TableRow, Chip, Grid, TextField, InputAdornment,
  Dialog, DialogTitle, DialogContent, DialogActions, MenuItem,
  CircularProgress, Snackbar, Alert, IconButton, Tooltip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import {
  getLostFoundItems,
  createLostFoundItem,
  claimLostFoundItem,
  deleteLostFoundItem,
  type LostFoundItem
} from '../api/security.api';

const LostFoundManager: React.FC = () => {
  const [items, setItems] = useState<LostFoundItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'FOUND' | 'CLAIMED'>('ALL');

  // Register Modal
  const [registerModal, setRegisterModal] = useState(false);
  const [registerForm, setRegisterForm] = useState<Partial<LostFoundItem>>({
    title: '',
    description: '',
    category: 'OTHER',
    locationFound: '',
    storageLocation: 'Security Desk — Shelf A',
    foundBy: ''
  });

  // Claim Modal
  const [claimModal, setClaimModal] = useState<{ open: boolean; item: LostFoundItem | null }>({
    open: false,
    item: null
  });
  const [claimForm, setClaimForm] = useState({
    claimedBy: '',
    claimantContact: '',
    remarks: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  });

  const loadItems = async () => {
    try {
      setLoading(true);
      const data = await getLostFoundItems();
      setItems(data);
    } catch (e) {
      console.error(e);
      setToast({ open: true, message: 'Failed to load Lost & Found items', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const filteredItems = useMemo(() => {
    return items.filter(it => {
      const matchSearch =
        it.title?.toLowerCase().includes(search.toLowerCase()) ||
        it.itemNumber?.toLowerCase().includes(search.toLowerCase()) ||
        it.description?.toLowerCase().includes(search.toLowerCase()) ||
        it.locationFound?.toLowerCase().includes(search.toLowerCase());
      const matchStatus = filterStatus === 'ALL' || it.status === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [items, search, filterStatus]);

  const handleRegister = async () => {
    if (!registerForm.title || !registerForm.locationFound) return;
    try {
      setSubmitting(true);
      await createLostFoundItem(registerForm);
      setToast({ open: true, message: 'Found item registered successfully', severity: 'success' });
      setRegisterModal(false);
      setRegisterForm({
        title: '',
        description: '',
        category: 'OTHER',
        locationFound: '',
        storageLocation: 'Security Desk — Shelf A',
        foundBy: ''
      });
      loadItems();
    } catch (err: any) {
      setToast({ open: true, message: err?.response?.data?.message || 'Failed to register item', severity: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleClaimSubmit = async () => {
    if (!claimModal.item || !claimForm.claimedBy) return;
    try {
      setSubmitting(true);
      await claimLostFoundItem(claimModal.item._id, claimForm);
      setToast({ open: true, message: 'Item marked as claimed', severity: 'success' });
      setClaimModal({ open: false, item: null });
      setClaimForm({ claimedBy: '', claimantContact: '', remarks: '' });
      loadItems();
    } catch (err: any) {
      setToast({ open: true, message: err?.response?.data?.message || 'Failed to process claim', severity: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this record?')) return;
    try {
      await deleteLostFoundItem(id);
      setToast({ open: true, message: 'Record deleted', severity: 'success' });
      loadItems();
    } catch (err: any) {
      setToast({ open: true, message: err?.response?.data?.message || 'Failed to delete record', severity: 'error' });
    }
  };

  const unclaimedCount = items.filter(i => i.status === 'FOUND').length;
  const claimedCount = items.filter(i => i.status === 'CLAIMED').length;

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#f8fafc', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Inventory2Icon sx={{ fontSize: 36, color: 'primary.main' }} />
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>Lost & Found Custody</Typography>
            <Typography variant="body2" color="text.secondary">Cataloging unclaimed items, verifying ownership, and managing claim handovers</Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={loadItems} sx={{ borderRadius: 2 }}>
            Refresh
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setRegisterModal(true)} sx={{ borderRadius: 2 }}>
            Register Found Item
          </Button>
        </Box>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Card sx={{ borderRadius: 3, borderLeft: '5px solid #f59e0b', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography color="text.secondary" variant="body2" fontWeight={600}>Items in Custody (Unclaimed)</Typography>
              <Typography variant="h3" sx={{ fontWeight: 800, color: '#f59e0b', my: 0.5 }}>
                {unclaimedCount}
              </Typography>
              <Typography variant="caption" color="text.secondary">Stored at Security Checkpoint</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ borderRadius: 3, borderLeft: '5px solid #10b981', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography color="text.secondary" variant="body2" fontWeight={600}>Verified Claims & Returned</Typography>
              <Typography variant="h3" sx={{ fontWeight: 800, color: '#10b981', my: 0.5 }}>
                {claimedCount}
              </Typography>
              <Typography variant="caption" color="text.secondary">Handed over to rightful owners</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ borderRadius: 3, borderLeft: '5px solid #3b82f6', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography color="text.secondary" variant="body2" fontWeight={600}>Total Cataloged</Typography>
              <Typography variant="h3" sx={{ fontWeight: 800, color: '#3b82f6', my: 0.5 }}>
                {items.length}
              </Typography>
              <Typography variant="caption" color="text.secondary">All lifetime entries</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Table Card */}
      <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
        <Box sx={{ p: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, borderBottom: '1px solid #e2e8f0' }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant={filterStatus === 'ALL' ? 'contained' : 'outlined'}
              size="small"
              onClick={() => setFilterStatus('ALL')}
            >
              All ({items.length})
            </Button>
            <Button
              variant={filterStatus === 'FOUND' ? 'contained' : 'outlined'}
              color="warning"
              size="small"
              onClick={() => setFilterStatus('FOUND')}
            >
              Unclaimed ({unclaimedCount})
            </Button>
            <Button
              variant={filterStatus === 'CLAIMED' ? 'contained' : 'outlined'}
              color="success"
              size="small"
              onClick={() => setFilterStatus('CLAIMED')}
            >
              Claimed ({claimedCount})
            </Button>
          </Box>

          <TextField
            size="small"
            placeholder="Search items, tags, locations..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              )
            }}
            sx={{ minWidth: 280 }}
          />
        </Box>

        <CardContent sx={{ p: 0 }}>
          <Table>
            <TableHead sx={{ bgcolor: '#f8fafc' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Item ID</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Found Date / Location</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Storage Location</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <CircularProgress size={28} />
                  </TableCell>
                </TableRow>
              ) : filteredItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                    No lost & found items match your criteria.
                  </TableCell>
                </TableRow>
              ) : (
                filteredItems.map(item => (
                  <TableRow key={item._id} hover>
                    <TableCell sx={{ fontFamily: 'monospace', fontWeight: 700, color: 'primary.main' }}>
                      {item.itemNumber}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={700}>{item.title}</Typography>
                      <Typography variant="caption" color="text.secondary">{item.description}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={item.category.replace('_', ' ')} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {item.dateFound ? new Date(item.dateFound).toLocaleDateString() : 'Recent'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">📍 {item.locationFound}</Typography>
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.85rem' }}>
                      {item.storageLocation || 'Security Safe'}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={item.status}
                        size="small"
                        color={item.status === 'FOUND' ? 'warning' : 'success'}
                        sx={{ fontWeight: 700 }}
                      />
                      {item.status === 'CLAIMED' && item.claimedBy && (
                        <Typography variant="caption" display="block" color="text.secondary">
                          By: {item.claimedBy}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      {item.status === 'FOUND' ? (
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          startIcon={<CheckCircleIcon />}
                          onClick={() => setClaimModal({ open: true, item })}
                          sx={{ textTransform: 'none', borderRadius: 2 }}
                        >
                          Process Claim
                        </Button>
                      ) : (
                        <Typography variant="caption" color="success.main" fontWeight={600}>
                          ✓ Verified Handover
                        </Typography>
                      )}
                      <IconButton size="small" color="error" onClick={() => handleDelete(item._id)} sx={{ ml: 1 }}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* MODAL: Register Found Item */}
      <Dialog open={registerModal} onClose={() => setRegisterModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Register Found Item</DialogTitle>
        <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <TextField
            label="Item Title"
            required
            fullWidth
            value={registerForm.title}
            onChange={e => setRegisterForm({ ...registerForm, title: e.target.value })}
            placeholder="e.g. Blue Titan Water Bottle / Class 8 Math Notebook"
          />

          <TextField
            label="Detailed Description"
            fullWidth
            multiline
            rows={2}
            value={registerForm.description}
            onChange={e => setRegisterForm({ ...registerForm, description: e.target.value })}
            placeholder="Color, brand, identifying stickers, scratches, etc."
          />

          <TextField
            select
            label="Category"
            fullWidth
            value={registerForm.category}
            onChange={e => setRegisterForm({ ...registerForm, category: e.target.value as any })}
          >
            <MenuItem value="BAG">Bag / Backpack</MenuItem>
            <MenuItem value="BOTTLE">Water Bottle / Lunchbox</MenuItem>
            <MenuItem value="ELECTRONICS">Electronics (Phone, Watch, Calculator)</MenuItem>
            <MenuItem value="CLOTHING">Clothing / Jacket / Cap</MenuItem>
            <MenuItem value="BOOKS_STATIONERY">Books & Stationery</MenuItem>
            <MenuItem value="ID_CARD">ID Card / Wallet / Keys</MenuItem>
            <MenuItem value="OTHER">Other</MenuItem>
          </TextField>

          <TextField
            label="Location Found"
            required
            fullWidth
            value={registerForm.locationFound}
            onChange={e => setRegisterForm({ ...registerForm, locationFound: e.target.value })}
            placeholder="e.g. Football Ground Bleachers / Library 2nd Floor"
          />

          <TextField
            label="Storage Location"
            fullWidth
            value={registerForm.storageLocation}
            onChange={e => setRegisterForm({ ...registerForm, storageLocation: e.target.value })}
            placeholder="e.g. Security Locker #4 / Principal Office Safe"
          />

          <TextField
            label="Turned In By (Name / Role)"
            fullWidth
            value={registerForm.foundBy}
            onChange={e => setRegisterForm({ ...registerForm, foundBy: e.target.value })}
            placeholder="e.g. Staff Mohan (Gardener)"
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setRegisterModal(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleRegister}
            disabled={submitting || !registerForm.title || !registerForm.locationFound}
          >
            {submitting ? <CircularProgress size={20} /> : 'Save & Register'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* MODAL: Process Claim */}
      <Dialog open={claimModal.open} onClose={() => setClaimModal({ open: false, item: null })} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Process Claim Handover</DialogTitle>
        <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          {claimModal.item && (
            <Alert severity="info">
              Releasing <strong>{claimModal.item.title}</strong> ({claimModal.item.itemNumber})
            </Alert>
          )}

          <TextField
            label="Claimed By (Person Name)"
            required
            fullWidth
            value={claimForm.claimedBy}
            onChange={e => setClaimForm({ ...claimForm, claimedBy: e.target.value })}
            placeholder="Student Name, Parent Name, or Staff Member"
          />

          <TextField
            label="Contact Number / Email"
            fullWidth
            value={claimForm.claimantContact}
            onChange={e => setClaimForm({ ...claimForm, claimantContact: e.target.value })}
            placeholder="e.g. +91 98765 43210"
          />

          <TextField
            label="Verification Remarks"
            fullWidth
            multiline
            rows={2}
            value={claimForm.remarks}
            onChange={e => setClaimForm({ ...claimForm, remarks: e.target.value })}
            placeholder="Ownership verified through identity proof / description match..."
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setClaimModal({ open: false, item: null })}>Cancel</Button>
          <Button
            variant="contained"
            color="success"
            onClick={handleClaimSubmit}
            disabled={submitting || !claimForm.claimedBy}
          >
            {submitting ? <CircularProgress size={20} /> : 'Confirm Handover'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Toast */}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast({ ...toast, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={toast.severity} onClose={() => setToast({ ...toast, open: false })}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default LostFoundManager;
