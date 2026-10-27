import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Button, IconButton, Dialog, DialogTitle, DialogContent, 
  DialogActions, TextField, Switch, FormControlLabel, Chip, Alert, Snackbar, CircularProgress, Tooltip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import api from '../../../core/api/axios';

const PromotionPolicyManager: React.FC = () => {
  const [policies, setPolicies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  });

  const [form, setForm] = useState<any>({ 
    name: '',
    academicYear: '2026-27',
    minAttendance: 75, 
    minOverall: 40, 
    graceMarks: 5,
    allowSupplementary: true,
    allowConditionalPromotion: false,
    status: 'ACTIVE'
  });

  const fetchPolicies = async () => {
    try {
      setLoading(true);
      const res = await api.get('/promotion/policies');
      const data = res.data?.data || res.data || [];
      setPolicies(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('Failed to load policies', err);
      setSnackbar({ open: true, message: 'Failed to load promotion policies', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  const handleSavePolicy = async () => {
    if (!form.name.trim()) {
      setSnackbar({ open: true, message: 'Policy Name is required', severity: 'error' });
      return;
    }

    try {
      setSaving(true);
      const payload = {
        name: form.name.trim(),
        minAttendance: Number(form.minAttendance),
        minOverall: Number(form.minOverall),
        graceMarks: Number(form.graceMarks),
        allowSupplementary: Boolean(form.allowSupplementary),
        allowConditionalPromotion: Boolean(form.allowConditionalPromotion),
        status: form.status || 'ACTIVE'
      };

      const res = await api.post('/promotion/policies', payload);
      const newPolicy = res.data?.data || res.data;
      setPolicies(prev => [newPolicy, ...prev]);
      setDialogOpen(false);
      setForm({
        name: '',
        academicYear: '2026-27',
        minAttendance: 75,
        minOverall: 40,
        graceMarks: 5,
        allowSupplementary: true,
        allowConditionalPromotion: false,
        status: 'ACTIVE'
      });
      setSnackbar({ open: true, message: 'Promotion policy saved successfully', severity: 'success' });
    } catch (err: any) {
      console.error('Failed to save policy', err);
      setSnackbar({ 
        open: true, 
        message: err.response?.data?.message || 'Failed to store promotion policy', 
        severity: 'error' 
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePolicy = async (id: string) => {
    try {
      await api.delete(`/promotion/policies/${id}`);
      setPolicies(prev => prev.filter(p => (p._id || p.id) !== id));
      setSnackbar({ open: true, message: 'Policy deleted successfully', severity: 'success' });
    } catch (err: any) {
      setSnackbar({ open: true, message: 'Failed to delete policy', severity: 'error' });
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#1e293b' }}>Promotion Policies</Typography>
          <Typography variant="body2" color="text.secondary">Configure and store academic progression criteria for automated student promotion</Typography>
        </Box>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />} 
          onClick={() => setDialogOpen(true)}
          sx={{ borderRadius: 2, textTransform: 'none', px: 2.5, fontWeight: 600 }}
        >
          Create Policy
        </Button>
      </Box>

      <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
        Active policies govern eligibility thresholds including attendance percentage, overall aggregate, and grace marks allowances.
      </Alert>

      <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <TableContainer sx={{ width: '100%', overflowX: 'auto' }}>
          <Table sx={{ minWidth: 800 }}>
            <TableHead sx={{ bgcolor: '#f8fafc' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Policy Name</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Min. Attendance</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Min. Overall</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Grace Marks</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Supplementary</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                    <CircularProgress size={32} />
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>Loading policies...</Typography>
                  </TableCell>
                </TableRow>
              ) : policies.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: 'text.secondary' }}>No policies configured yet</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Click "Create Policy" above to add your first academic progression rule.</Typography>
                    <Button variant="outlined" size="small" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>Create Policy</Button>
                  </TableCell>
                </TableRow>
              ) : (
                policies.map((p, idx) => {
                  const policyId = p._id || p.id || idx;
                  const minAtt = p.minAttendancePercentage !== undefined ? p.minAttendancePercentage : (p.minAttendance ?? 75);
                  const minOver = p.minOverallPercentage !== undefined ? p.minOverallPercentage : (p.minOverall ?? 40);
                  const grace = p.graceMarksAllowed !== undefined ? p.graceMarksAllowed : (p.graceMarks ?? 0);
                  const isAct = p.status === 'ACTIVE';

                  return (
                    <TableRow key={policyId} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a' }}>{p.name}</Typography>
                        <Typography variant="caption" color="text.secondary">Version {p.version || 1}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={`${minAtt}%`} size="small" sx={{ fontWeight: 600, bgcolor: '#e0f2fe', color: '#0369a1' }} />
                      </TableCell>
                      <TableCell>
                        <Chip label={`${minOver}%`} size="small" sx={{ fontWeight: 600, bgcolor: '#fef3c7', color: '#b45309' }} />
                      </TableCell>
                      <TableCell>{grace} marks</TableCell>
                      <TableCell>
                        {p.allowSupplementary ? (
                          <Chip label="Allowed" size="small" color="success" variant="outlined" />
                        ) : (
                          <Chip label="None" size="small" color="default" variant="outlined" />
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={p.status || 'ACTIVE'} 
                          size="small" 
                          color={isAct ? 'success' : 'default'}
                          icon={isAct ? <CheckCircleIcon fontSize="small" /> : undefined}
                          sx={{ fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Delete Policy">
                          <IconButton size="small" color="error" onClick={() => handleDeletePolicy(policyId)}>
                            <DeleteOutlineIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Create Dialog */}
      <Dialog open={dialogOpen} onClose={() => !saving && setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Create Academic Promotion Policy</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField 
              label="Policy Name" 
              required 
              fullWidth 
              placeholder="e.g. Senior Secondary Promotion Criteria 2026-27"
              value={form.name} 
              onChange={e => setForm({ ...form, name: e.target.value })} 
            />
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextField 
                type="number" 
                label="Min Attendance %" 
                required 
                fullWidth 
                value={form.minAttendance} 
                onChange={e => setForm({ ...form, minAttendance: Number(e.target.value) })} 
              />
              <TextField 
                type="number" 
                label="Min Overall Marks %" 
                required 
                fullWidth 
                value={form.minOverall} 
                onChange={e => setForm({ ...form, minOverall: Number(e.target.value) })} 
              />
            </Box>
            <TextField 
              type="number" 
              label="Grace Marks Allowed" 
              fullWidth 
              value={form.graceMarks} 
              onChange={e => setForm({ ...form, graceMarks: Number(e.target.value) })} 
            />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, bgcolor: '#f8fafc', p: 2, borderRadius: 2 }}>
              <FormControlLabel 
                control={
                  <Switch 
                    checked={Boolean(form.allowSupplementary)} 
                    onChange={e => setForm({ ...form, allowSupplementary: e.target.checked })} 
                  />
                } 
                label="Allow Supplementary Examinations" 
              />
              <FormControlLabel 
                control={
                  <Switch 
                    checked={Boolean(form.allowConditionalPromotion)} 
                    onChange={e => setForm({ ...form, allowConditionalPromotion: e.target.checked })} 
                  />
                } 
                label="Allow Conditional Promotion on Probation" 
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDialogOpen(false)} disabled={saving}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleSavePolicy} 
            disabled={saving}
            startIcon={saving ? <CircularProgress size={16} /> : undefined}
          >
            {saving ? 'Storing...' : 'Save Policy'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PromotionPolicyManager;
