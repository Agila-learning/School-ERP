import { useState, useEffect } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Switch, Button, IconButton, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, TextField, FormControl, InputLabel, Select, MenuItem, Grid, Alert } from '@mui/material';
import FlagIcon from '@mui/icons-material/Flag';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { getFeatureFlags, createFeatureFlag, toggleFeatureFlag, deleteFeatureFlag } from '../api/superAdmin.api';

const DEFAULT_FLAGS = [
  { key: 'AI_ASSISTANT', name: 'AI Assistant', description: 'Enable AI-powered assistant', scope: 'PER_PLAN' },
  { key: 'ONLINE_PAYMENT', name: 'Online Payment', description: 'Accept online fee payments', scope: 'GLOBAL' },
  { key: 'MOBILE_APP', name: 'Mobile App Access', description: 'Allow mobile app access', scope: 'PER_PLAN' },
  { key: 'ADVANCED_ANALYTICS', name: 'Advanced Analytics', description: 'Advanced reporting dashboards', scope: 'PER_PLAN' },
  { key: 'WHATSAPP', name: 'WhatsApp Integration', description: 'Send notifications via WhatsApp', scope: 'PER_TENANT' },
  { key: 'API_ACCESS', name: 'API Access', description: 'REST API access for integrations', scope: 'PER_PLAN' },
  { key: 'WHITE_LABEL', name: 'White Label', description: 'Custom branding per school', scope: 'PER_PLAN' },
];

export default function FeatureFlags() {
  const [flags, setFlags] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({ key: '', name: '', description: '', scope: 'GLOBAL', enabled: false });

  useEffect(() => { fetchFlags(); }, []);

  const fetchFlags = async () => {
    try {
      setLoading(true);
      const res = await getFeatureFlags();
      setFlags(res.data.data);
    } catch { setError('Failed to load feature flags'); }
    finally { setLoading(false); }
  };

  const handleToggle = async (id: string) => {
    try { await toggleFeatureFlag(id); fetchFlags(); }
    catch { alert('Failed to toggle feature flag'); }
  };

  const handleCreate = async () => {
    try {
      await createFeatureFlag(formData);
      setOpenModal(false);
      setFormData({ key: '', name: '', description: '', scope: 'GLOBAL', enabled: false });
      fetchFlags();
    } catch (e: any) { alert(e.response?.data?.message || 'Failed to create feature flag'); }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this feature flag?')) return;
    try { await deleteFeatureFlag(id); fetchFlags(); }
    catch { alert('Failed to delete'); }
  };

  const seedDefaults = async () => {
    for (const def of DEFAULT_FLAGS) {
      try { await createFeatureFlag({ ...def, enabled: false }); } catch {}
    }
    fetchFlags();
  };

  return (
    <Box sx={{ p: 4, maxWidth: 1400, mx: 'auto' }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1 }}>
          <FlagIcon fontSize="large" color="primary" /> Feature Flags
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="outlined" onClick={seedDefaults}>Seed Defaults</Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenModal(true)}>Create Flag</Button>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
        <Table>
          <TableHead sx={{ bgcolor: 'grey.50' }}>
            <TableRow>
              <TableCell><strong>Key</strong></TableCell>
              <TableCell><strong>Name</strong></TableCell>
              <TableCell><strong>Scope</strong></TableCell>
              <TableCell><strong>Description</strong></TableCell>
              <TableCell><strong>Enabled</strong></TableCell>
              <TableCell align="right"><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} align="center" sx={{ py: 4 }}><CircularProgress /></TableCell></TableRow>
            ) : flags.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">No feature flags. Click "Seed Defaults" to add standard flags.</Typography>
                </TableCell>
              </TableRow>
            ) : flags.map(f => (
              <TableRow key={f._id} hover>
                <TableCell><Chip label={f.key} size="small" sx={{ fontFamily: 'monospace', fontWeight: 700 }} /></TableCell>
                <TableCell><Typography variant="body2" sx={{ fontWeight: 600 }}>{f.name}</Typography></TableCell>
                <TableCell><Chip size="small" label={f.scope} color={f.scope === 'GLOBAL' ? 'primary' : 'default'} /></TableCell>
                <TableCell><Typography variant="body2" color="text.secondary">{f.description}</Typography></TableCell>
                <TableCell>
                  <Switch checked={f.enabled} onChange={() => handleToggle(f._id)} color="success" />
                  <Chip size="small" label={f.enabled ? 'ON' : 'OFF'} color={f.enabled ? 'success' : 'default'} sx={{ ml: 1 }} />
                </TableCell>
                <TableCell align="right">
                  <IconButton size="small" color="error" onClick={() => handleDelete(f._id)}><DeleteIcon fontSize="small" /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Create Feature Flag</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Flag Key (uppercase)" value={formData.key} onChange={e => setFormData({...formData, key: e.target.value.toUpperCase().replace(/\s/g, '_')})} helperText="e.g. MY_FEATURE" /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Display Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} /></Grid>
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth><InputLabel>Scope</InputLabel>
                <Select value={formData.scope} onChange={e => setFormData({...formData, scope: e.target.value})} label="Scope">
                  <MenuItem value="GLOBAL">Global (affects all)</MenuItem>
                  <MenuItem value="PER_PLAN">Per Plan</MenuItem>
                  <MenuItem value="PER_TENANT">Per Tenant</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12 }}><TextField fullWidth label="Description" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} multiline rows={2} /></Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenModal(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate}>Create Flag</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
