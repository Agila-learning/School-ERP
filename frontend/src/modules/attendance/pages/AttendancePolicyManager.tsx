import React, { useEffect, useState } from 'react';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Chip, CircularProgress, Button, Switch,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  FormControl, InputLabel, Select, MenuItem, Grid
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import { getAttendancePolicies, createAttendancePolicy, updateAttendancePolicy } from '../api/attendance.api';
import type { AttendancePolicy } from '../api/attendance.api';

const AttendancePolicyManager: React.FC = () => {
  const [policies, setPolicies] = useState<AttendancePolicy[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<AttendancePolicy | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    domain: 'STUDENT' as 'STUDENT' | 'EMPLOYEE',
    attendanceMode: 'DAILY' as 'DAILY' | 'PERIOD_WISE',
    minAttendancePercent: 75,
    lockAfterHours: 24,
    gracePeriodMinutes: 15,
    lateThresholdMinutes: 30,
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE'
  });

  const loadPolicies = () => {
    setLoading(true);
    getAttendancePolicies().then(data => {
      setPolicies(data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadPolicies();
  }, []);

  const handleOpenCreate = () => {
    setEditingPolicy(null);
    setFormData({
      name: '',
      domain: 'STUDENT',
      attendanceMode: 'DAILY',
      minAttendancePercent: 75,
      lockAfterHours: 24,
      gracePeriodMinutes: 15,
      lateThresholdMinutes: 30,
      status: 'ACTIVE'
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (policy: AttendancePolicy) => {
    setEditingPolicy(policy);
    setFormData({
      name: policy.name,
      domain: policy.domain,
      attendanceMode: policy.attendanceMode,
      minAttendancePercent: policy.minAttendancePercent,
      lockAfterHours: policy.lockAfterHours,
      gracePeriodMinutes: policy.gracePeriodMinutes || 15,
      lateThresholdMinutes: policy.lateThresholdMinutes || 30,
      status: policy.status
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name) {
      alert('Policy name is required');
      return;
    }
    try {
      setSaving(true);
      if (editingPolicy) {
        await updateAttendancePolicy(editingPolicy.id || (editingPolicy as any)._id, formData);
      } else {
        await createAttendancePolicy(formData);
      }
      setModalOpen(false);
      loadPolicies();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to save attendance policy');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (policy: AttendancePolicy) => {
    const newStatus = policy.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await updateAttendancePolicy(policy.id || (policy as any)._id, { status: newStatus });
      loadPolicies();
    } catch (err) {
      console.error('Failed to toggle status', err);
    }
  };

  if (loading) return <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress /></Box>;

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>Attendance Policies</Typography>
          <Typography variant="body1" color="text.secondary">
            Configure attendance thresholds, lock times, and tracking modes.
          </Typography>
        </Box>
        <Button variant="contained" color="primary" startIcon={<AddIcon />} disableElevation onClick={handleOpenCreate}>
          New Policy
        </Button>
      </Box>

      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: 'grey.50' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Policy Name</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Domain</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Mode</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Min %</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Auto-Lock</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {policies.map(policy => (
                <TableRow key={policy.id || (policy as any)._id} hover>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{policy.name}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={policy.domain} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>
                    <Chip label={policy.attendanceMode?.replace('_', ' ')} size="small" color="info" />
                  </TableCell>
                  <TableCell>{policy.minAttendancePercent}%</TableCell>
                  <TableCell>{policy.lockAfterHours} hours</TableCell>
                  <TableCell>
                    <Switch 
                      checked={policy.status === 'ACTIVE'} 
                      color="success" 
                      size="small" 
                      onChange={() => handleToggleStatus(policy)}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Button size="small" startIcon={<EditIcon />} onClick={() => handleOpenEdit(policy)}>
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {policies.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 3 }}>No policies configured.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Policy Modal */}
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>
          {editingPolicy ? 'Edit Attendance Policy' : 'Create New Attendance Policy'}
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
            <TextField 
              label="Policy Name" 
              fullWidth 
              required 
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Standard High School Attendance Policy"
            />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Domain</InputLabel>
                  <Select 
                    label="Domain" 
                    value={formData.domain} 
                    onChange={e => setFormData({ ...formData, domain: e.target.value as any })}
                  >
                    <MenuItem value="STUDENT">Student</MenuItem>
                    <MenuItem value="EMPLOYEE">Employee</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Attendance Mode</InputLabel>
                  <Select 
                    label="Attendance Mode" 
                    value={formData.attendanceMode} 
                    onChange={e => setFormData({ ...formData, attendanceMode: e.target.value as any })}
                  >
                    <MenuItem value="DAILY">Daily</MenuItem>
                    <MenuItem value="PERIOD_WISE">Period-Wise</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField 
                  label="Minimum Attendance %" 
                  type="number" 
                  fullWidth 
                  value={formData.minAttendancePercent}
                  onChange={e => setFormData({ ...formData, minAttendancePercent: Number(e.target.value) })}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField 
                  label="Auto-Lock After (Hours)" 
                  type="number" 
                  fullWidth 
                  value={formData.lockAfterHours}
                  onChange={e => setFormData({ ...formData, lockAfterHours: Number(e.target.value) })}
                />
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField 
                  label="Grace Period (Minutes)" 
                  type="number" 
                  fullWidth 
                  value={formData.gracePeriodMinutes}
                  onChange={e => setFormData({ ...formData, gracePeriodMinutes: Number(e.target.value) })}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField 
                  label="Late Threshold (Minutes)" 
                  type="number" 
                  fullWidth 
                  value={formData.lateThresholdMinutes}
                  onChange={e => setFormData({ ...formData, lateThresholdMinutes: Number(e.target.value) })}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : (editingPolicy ? 'Update Policy' : 'Create Policy')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AttendancePolicyManager;
