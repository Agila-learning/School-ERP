import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableHead, TableRow,
  Button, Chip, Stack, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Alert, CircularProgress
} from '@mui/material';
import BuildIcon from '@mui/icons-material/Build';
import axios from 'axios';

const AssetMaintenance: React.FC = () => {
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [openCreate, setOpenCreate] = useState(false);
  const [form, setForm] = useState({ assetId: '', maintenanceType: 'CORRECTIVE', issueDescription: '' });
  const [saving, setSaving] = useState(false);

  const fetchAssets = () => {
    setLoading(true);
    axios.get('/api/v1/assets')
      .then(res => setAssets(res.data.data))
      .catch(() => setError('Failed to load assets.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAssets(); }, []);

  const handleCreate = async () => {
    if (!form.assetId || !form.issueDescription) { setError('Asset and Description required'); return; }
    setSaving(true);
    try {
      await axios.post(`/api/v1/assets/${form.assetId}/maintenance`, form);
      setOpenCreate(false);
      setForm({ assetId: '', maintenanceType: 'CORRECTIVE', issueDescription: '' });
      fetchAssets();
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to report issue.');
    } finally { setSaving(false); }
  };

  const maintenanceAssets = assets.filter(a => a.status === 'UNDER_MAINTENANCE');

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>Asset Maintenance</Typography>
        <Button variant="contained" startIcon={<BuildIcon />} onClick={() => setOpenCreate(true)}>
          Report Issue
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
                <TableCell>Asset Tag</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {maintenanceAssets.length === 0 ? (
                <TableRow><TableCell colSpan={5} align="center">No assets under maintenance.</TableCell></TableRow>
              ) : maintenanceAssets.map((asset: any) => (
                <TableRow key={asset._id} hover>
                  <TableCell><code>{asset.assetTag}</code></TableCell>
                  <TableCell>{asset.itemId?.itemName}</TableCell>
                  <TableCell>{asset.branchId?.name || '—'}</TableCell>
                  <TableCell><Chip label={asset.status} size="small" color="warning" /></TableCell>
                  <TableCell>
                    <Button size="small">Update Log</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}

      {/* Report Issue Dialog */}
      <Dialog open={openCreate} onClose={() => setOpenCreate(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Report Asset Issue</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField select label="Select Asset *" value={form.assetId} onChange={e => setForm({ ...form, assetId: e.target.value })} fullWidth size="small">
              {assets.map(a => <MenuItem key={a._id} value={a._id}>{a.assetTag} - {a.itemId?.itemName}</MenuItem>)}
            </TextField>
            <TextField select label="Maintenance Type" value={form.maintenanceType} onChange={e => setForm({ ...form, maintenanceType: e.target.value })} fullWidth size="small">
              {['PREVENTIVE', 'CORRECTIVE', 'EMERGENCY', 'WARRANTY', 'AMC'].map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
            </TextField>
            <TextField label="Issue Description *" value={form.issueDescription} onChange={e => setForm({ ...form, issueDescription: e.target.value })} fullWidth size="small" multiline rows={3} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreate(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate} disabled={saving}>
            {saving ? 'Submitting...' : 'Report Issue'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AssetMaintenance;
