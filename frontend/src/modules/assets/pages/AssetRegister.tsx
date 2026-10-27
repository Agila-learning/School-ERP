import React, { useState, useEffect } from 'react';
import { getAssets, createAsset, getAssetCategories } from '../api/asset.api';
import { getItems } from '../../inventory/api/inventory.api';
import { Box, Typography, Grid, Card, CardContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Stack, Alert } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

const AssetRegister: React.FC = () => {
  const [assets, setAssets] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  
  const [openCreate, setOpenCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ assetTag: '', categoryId: '', itemId: '', serialNumber: '', status: 'AVAILABLE' });

  useEffect(() => {
    fetchData();
    getAssetCategories().then(setCategories).catch(console.error);
    getItems().then(setItems).catch(console.error);
  }, []);

  const fetchData = async () => {
    try {
      const res = await getAssets();
      setAssets(res || []);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreate = async () => {
    if (!form.assetTag || !form.categoryId) { setError('Asset Tag and Category are required'); return; }
    setSaving(true); setError('');
    try {
      await createAsset(form);
      setOpenCreate(false);
      fetchData();
      setForm({ assetTag: '', categoryId: '', itemId: '', serialNumber: '', status: 'AVAILABLE' });
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to create asset');
    } finally { setSaving(false); }
  };

  return (
    <Box sx={{ p: 4, bgcolor: '#f4f6f8', minHeight: '100vh' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Fixed Asset Register</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenCreate(true)}>
          Add Asset
        </Button>
      </Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      <Grid container spacing={4} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 4 }}  >
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Total Fixed Assets</Typography>
              <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#1976d2' }}>{assets.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}  >
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Assets Assigned</Typography>
              <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#f57c00' }}>
                {assets.filter(a => a.status === 'ASSIGNED').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>Asset List</Typography>
      <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
        <Table>
          <TableHead sx={{ bgcolor: '#f5f5f5' }}>
            <TableRow>
              <TableCell>Asset Tag</TableCell>
              <TableCell>Item Name</TableCell>
              <TableCell>Serial No.</TableCell>
              <TableCell>Assigned To</TableCell>
              <TableCell align="center">Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {assets.map((ast) => (
              <TableRow key={ast._id}>
                <TableCell sx={{ fontWeight: 'bold' }}>{ast.assetTag}</TableCell>
                <TableCell>{ast.itemId?.itemName}</TableCell>
                <TableCell>{ast.serialNumber || 'N/A'}</TableCell>
                <TableCell>
                  {ast.assignedToEmployeeId ? `${ast.assignedToEmployeeId.firstName} ${ast.assignedToEmployeeId.lastName}` : 'Unassigned'}
                </TableCell>
                <TableCell align="center">
                  <Chip 
                    size="small" 
                    label={ast.status} 
                    color={ast.status === 'AVAILABLE' ? 'success' : (ast.status === 'ASSIGNED' ? 'warning' : 'default')} 
                  />
                </TableCell>
              </TableRow>
            ))}
            {assets.length === 0 && (
              <TableRow><TableCell colSpan={5} align="center">No assets found in register</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* CREATE MODAL */}
      <Dialog open={openCreate} onClose={() => setOpenCreate(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Asset</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3}>
            <TextField label="Asset Tag *" value={form.assetTag} onChange={e => setForm({...form, assetTag: e.target.value})} size="small" />
            <TextField select label="Category *" value={form.categoryId} onChange={e => setForm({...form, categoryId: e.target.value})} size="small">
              {categories.map(c => <MenuItem key={c._id} value={c._id}>{c.name}</MenuItem>)}
            </TextField>
            <TextField select label="Link to Inventory Item" value={form.itemId} onChange={e => setForm({...form, itemId: e.target.value})} size="small">
              <MenuItem value="">None</MenuItem>
              {items.map(i => <MenuItem key={i._id} value={i._id}>{i.sku} - {i.itemName}</MenuItem>)}
            </TextField>
            <TextField label="Serial Number" value={form.serialNumber} onChange={e => setForm({...form, serialNumber: e.target.value})} size="small" />
            <TextField select label="Status" value={form.status} onChange={e => setForm({...form, status: e.target.value})} size="small">
              {['AVAILABLE', 'ASSIGNED', 'MAINTENANCE', 'RETIRED'].map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreate(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate} disabled={saving}>
            {saving ? 'Creating...' : 'Create Asset'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AssetRegister;
