import { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Grid, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, Button, Switch, CircularProgress, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select,
  MenuItem, FormControl, InputLabel, Card, CardContent, Divider, Stack
} from '@mui/material';
import ExtensionIcon from '@mui/icons-material/Extension';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import {
  getPlanFeatures, createPlanFeature, getPlans, getPlanModules, updatePlanModules
} from '../api/superAdmin.api';

export default function PlanFeatureManager() {
  const [features, setFeatures] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');
  const [enabledModules, setEnabledModules] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [planLoading, setPlanLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // New feature dialog
  const [openModal, setOpenModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    code: '',       // PlanFeature model uses 'code' not 'key'
    category: 'ACADEMIC' as string,
    description: '',
    status: 'ACTIVE' as string,
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedPlanId) {
      loadPlanModules(selectedPlanId);
    }
  }, [selectedPlanId]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [featRes, plansRes] = await Promise.all([getPlanFeatures(), getPlans()]);
      setFeatures(featRes.data.data || []);
      const fetchedPlans = plansRes.data.data || [];
      setPlans(fetchedPlans);
      if (fetchedPlans.length > 0) {
        setSelectedPlanId(fetchedPlans[0]._id);
      }
    } catch {
      setError('Failed to load features catalog.');
    } finally {
      setLoading(false);
    }
  };

  const loadPlanModules = async (planId: string) => {
    try {
      setPlanLoading(true);
      const res = await getPlanModules(planId);
      setEnabledModules(res.data.data?.enabledModules || []);
    } catch {
      setError('Failed to load plan modules mapping.');
    } finally {
      setPlanLoading(false);
    }
  };

  const handleToggleModule = (key: string) => {
    setEnabledModules(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const handleSavePlanModules = async () => {
    if (!selectedPlanId) return;
    try {
      setSaving(true);
      await updatePlanModules(selectedPlanId, enabledModules);
      setSuccess('Plan modules updated successfully.');
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      setError('Failed to save plan modules.');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateFeature = async () => {
    if (!formData.name || !formData.code) {
      alert('Name and Unique Code are required.');
      return;
    }
    try {
      setSaving(true);
      await createPlanFeature({
        name: formData.name,
        code: formData.code,     // Maps to 'code' field in PlanFeature model
        category: formData.category,
        description: formData.description,
        status: formData.status,
      });
      setSuccess(`Feature "${formData.name}" added to catalog.`);
      setOpenModal(false);
      setFormData({ name: '', code: '', category: 'ACADEMIC', description: '', status: 'ACTIVE' });
      const featRes = await getPlanFeatures();
      setFeatures(featRes.data.data || []);
    } catch (e: any) {
      alert(e.response?.data?.message || 'Failed to create feature.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}><CircularProgress /></Box>;

  return (
    <Box sx={{ p: 4, maxWidth: 1440, mx: 'auto' }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <ExtensionIcon fontSize="large" color="primary" /> Plan Modules & Feature Catalog
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenModal(true)} sx={{ borderRadius: 2 }}>
          Add Feature to Catalog
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      {/* Plan Entitlement Matrix */}
      <Paper elevation={0} sx={{ p: 3, mb: 4, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Configure Modules for Plan:</Typography>
            <FormControl size="small" sx={{ minWidth: 220 }}>
              <Select value={selectedPlanId} onChange={e => setSelectedPlanId(e.target.value)}>
                {plans.map(p => (
                  <MenuItem key={p._id} value={p._id}>{p.name} ({p.code || p.name})</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <Button
            variant="contained"
            color="success"
            startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
            onClick={handleSavePlanModules}
            disabled={saving || planLoading}
          >
            Save Plan Entitlements
          </Button>
        </Box>
        <Divider sx={{ mb: 3 }} />

        {planLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
        ) : (
          <Grid container spacing={2}>
            {features.map(feat => {
              const isEnabled = enabledModules.includes(feat.code);
              return (
                <Grid key={feat.key} size={{ xs: 12, sm: 6, md: 4 }}>
                  <Card
                    elevation={0}
                    sx={{
                      p: 1.5,
                      border: '1px solid',
                      borderColor: isEnabled ? 'primary.main' : 'divider',
                      borderRadius: 2.5,
                      bgcolor: isEnabled ? 'primary.50' : 'background.paper',
                      transition: 'all 0.2s',
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box sx={{ pr: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{feat.name}</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                          {feat.description || 'Module feature'}
                        </Typography>
                        <Chip size="small" label={feat.category || 'MODULE'} variant="outlined" sx={{ fontSize: '0.65rem' }} />
                      </Box>
                      <Switch
                        checked={isEnabled}
                        onChange={() => handleToggleModule(feat.code)}
                        color="primary"
                      />
                    </Box>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Paper>

      {/* Feature Catalog Reference Table */}
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Master Feature Registry</Typography>
      <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
        <Table size="small">
          <TableHead sx={{ bgcolor: 'action.hover' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Feature Name</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Unique Key</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Default Value</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {features.map(feat => (
              <TableRow key={feat.key} hover>
                <TableCell sx={{ fontWeight: 600 }}>{feat.name}</TableCell>
                <TableCell sx={{ fontFamily: 'monospace' }}>{feat.code}</TableCell>
                <TableCell><Chip size="small" label={feat.category || 'MODULE'} /></TableCell>
                <TableCell>{feat.type || 'BOOLEAN'}</TableCell>
                <TableCell>{String(feat.defaultValue ?? true)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add Feature Dialog */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Register New Feature / Module</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth label="Feature Name *" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth label="Unique Code (e.g. LMS_MODULE) *" value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase().replace(/\s+/g, '_') })} helperText="Must be unique. e.g. LMS_MODULE" />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select value={formData.category} label="Category" onChange={e => setFormData({ ...formData, category: e.target.value })}>
                  {['ACADEMIC', 'HR', 'FINANCE', 'COMMUNICATION', 'OPERATIONS', 'PLATFORM', 'ADVANCED', 'SYSTEM'].map(c => (
                    <MenuItem key={c} value={c}>{c}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select value={formData.type} label="Type" onChange={e => setFormData({ ...formData, type: e.target.value })}>
                  <MenuItem value="BOOLEAN">Boolean (Toggle)</MenuItem>
                  <MenuItem value="LIMIT">Limit (Number)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField fullWidth label="Description" multiline rows={2} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenModal(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateFeature} disabled={saving}>
            Save Feature
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
