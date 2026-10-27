import { useState, useEffect } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Button, IconButton, CircularProgress, Alert, Pagination, Stack, Select, MenuItem, FormControl, InputLabel, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Grid } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import { getCoupons, createCoupon, updateCoupon, deleteCoupon } from '../api/superAdmin.api';
import dayjs from 'dayjs';

export default function CouponManagement() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState('');
  const [formData, setFormData] = useState({
    code: '', description: '', discountType: 'PERCENTAGE', discountValue: 10, maximumDiscount: '', minimumAmount: 0,
    startDate: dayjs().format('YYYY-MM-DD'), endDate: '', usageLimit: '', perSchoolLimit: 1, status: 'ACTIVE'
  });

  useEffect(() => { fetchCoupons(); }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const res = await getCoupons();
      setCoupons(res.data.data);
    } catch {} finally { setLoading(false); }
  };

  const handleSave = async () => {
    try {
      const payload: any = { ...formData };
      if (!payload.maximumDiscount) delete payload.maximumDiscount;
      if (!payload.endDate) delete payload.endDate;
      if (!payload.usageLimit) delete payload.usageLimit;

      if (isEditing) await updateCoupon(currentId, payload);
      else await createCoupon(payload);
      setOpenModal(false);
      fetchCoupons();
    } catch (e: any) { alert(e.response?.data?.message || 'Failed to save coupon'); }
  };

  const openEdit = (c: any) => {
    setIsEditing(true);
    setCurrentId(c._id);
    setFormData({ code: c.code, description: c.description || '', discountType: c.discountType, discountValue: c.discountValue, maximumDiscount: c.maximumDiscount || '', minimumAmount: c.minimumAmount || 0, startDate: dayjs(c.startDate).format('YYYY-MM-DD'), endDate: c.endDate ? dayjs(c.endDate).format('YYYY-MM-DD') : '', usageLimit: c.usageLimit || '', perSchoolLimit: c.perSchoolLimit || 1, status: c.status });
    setOpenModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this coupon?')) return;
    try { await deleteCoupon(id); fetchCoupons(); }
    catch (e: any) { alert(e.response?.data?.message || 'Failed'); }
  };

  return (
    <Box sx={{ p: 4, maxWidth: 1400, mx: 'auto' }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1 }}>
          <LocalOfferIcon fontSize="large" color="primary" /> Coupons & Discounts
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setIsEditing(false); setFormData({ code: '', description: '', discountType: 'PERCENTAGE', discountValue: 10, maximumDiscount: '', minimumAmount: 0, startDate: dayjs().format('YYYY-MM-DD'), endDate: '', usageLimit: '', perSchoolLimit: 1, status: 'ACTIVE' }); setOpenModal(true); }}>
          Create Coupon
        </Button>
      </Box>

      <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
        <Table>
          <TableHead sx={{ bgcolor: 'grey.50' }}>
            <TableRow>
              <TableCell><strong>Code</strong></TableCell>
              <TableCell><strong>Type</strong></TableCell>
              <TableCell><strong>Discount</strong></TableCell>
              <TableCell><strong>Used / Limit</strong></TableCell>
              <TableCell><strong>Expires</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell align="right"><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={7} align="center" sx={{ py: 4 }}><CircularProgress /></TableCell></TableRow>
            ) : coupons.length === 0 ? (
              <TableRow><TableCell colSpan={7} align="center" sx={{ py: 4 }}>No coupons found.</TableCell></TableRow>
            ) : coupons.map(c => (
              <TableRow key={c._id} hover>
                <TableCell><Chip label={c.code} sx={{ fontFamily: 'monospace', fontWeight: 700 }} /></TableCell>
                <TableCell>{c.discountType}</TableCell>
                <TableCell><Typography sx={{ fontWeight: 700 }}>{c.discountType === 'PERCENTAGE' ? `${c.discountValue}%` : `₹${c.discountValue}`}</Typography></TableCell>
                <TableCell>{c.timesUsed} / {c.usageLimit || '∞'}</TableCell>
                <TableCell>{c.endDate ? dayjs(c.endDate).format('DD MMM YYYY') : 'No expiry'}</TableCell>
                <TableCell><Chip size="small" label={c.status} color={c.status === 'ACTIVE' ? 'success' : 'default'} /></TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={() => openEdit(c)}><EditIcon fontSize="small" /></IconButton>
                  <IconButton size="small" color="error" onClick={() => handleDelete(c._id)}><DeleteIcon fontSize="small" /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>{isEditing ? 'Edit Coupon' : 'Create Coupon'}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Coupon Code *" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} disabled={isEditing} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth><InputLabel>Discount Type</InputLabel>
                <Select value={formData.discountType} onChange={e => setFormData({...formData, discountType: e.target.value})} label="Discount Type">
                  <MenuItem value="PERCENTAGE">Percentage (%)</MenuItem>
                  <MenuItem value="FIXED_AMOUNT">Fixed Amount (₹)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Discount Value *" type="number" value={formData.discountValue} onChange={e => setFormData({...formData, discountValue: Number(e.target.value)})} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Max Discount (₹)" type="number" value={formData.maximumDiscount} onChange={e => setFormData({...formData, maximumDiscount: e.target.value})} helperText="Leave blank for no cap" /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Minimum Amount (₹)" type="number" value={formData.minimumAmount} onChange={e => setFormData({...formData, minimumAmount: Number(e.target.value)})} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Usage Limit" type="number" value={formData.usageLimit} onChange={e => setFormData({...formData, usageLimit: e.target.value})} helperText="Leave blank for unlimited" /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Start Date" type="date" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} InputLabelProps={{ shrink: true }} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="End Date" type="date" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} InputLabelProps={{ shrink: true }} /></Grid>
            <Grid size={{ xs: 12 }}><TextField fullWidth label="Description" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} /></Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenModal(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>Save Coupon</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
