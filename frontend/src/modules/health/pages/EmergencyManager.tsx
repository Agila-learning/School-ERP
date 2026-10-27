import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined';
import PhoneInTalkIcon from '@mui/icons-material/PhoneInTalk';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import { healthApi } from '../api/health.api';
import type { MedicalEmergency } from '../api/health.api';

const EmergencyManager: React.FC = () => {
  const [emergencies, setEmergencies] = useState<MedicalEmergency[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Modal State
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    personName: '',
    personType: 'STUDENT',
    location: '',
    symptomsObserved: '',
    immediateAction: '',
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    status: 'UNDER_RESPONSE'
  });

  const loadEmergencies = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await healthApi.getEmergencies();
      setEmergencies(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load emergencies');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmergencies();
  }, []);

  const handleOpenModal = () => {
    setFormData({
      personName: '',
      personType: 'STUDENT',
      location: '',
      symptomsObserved: '',
      immediateAction: '',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'UNDER_RESPONSE'
    });
    setOpenModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.personName.trim() || !formData.symptomsObserved.trim() || !formData.location.trim()) {
      alert('Please fill in student/person name, location, and symptoms observed.');
      return;
    }
    try {
      setSaving(true);
      await healthApi.reportEmergency({
        personName: formData.personName,
        personType: formData.personType as any,
        location: formData.location,
        symptomsObserved: formData.symptomsObserved,
        immediateAction: formData.immediateAction,
        time: formData.time,
        status: formData.status as any,
        date: new Date().toISOString()
      });
      setOpenModal(false);
      await loadEmergencies();
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || 'Failed to report emergency');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string, notes?: string) => {
    try {
      await healthApi.updateEmergencyStatus(id, newStatus, notes);
      await loadEmergencies();
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || 'Failed to update emergency');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this emergency record?')) return;
    try {
      await healthApi.deleteEmergency(id);
      await loadEmergencies();
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || 'Failed to delete emergency record');
    }
  };

  const filteredEmergencies = emergencies.filter(item => {
    if (filterStatus === 'ALL') return true;
    return item.status === filterStatus;
  });

  const activeCount = emergencies.filter(e => e.status === 'UNDER_RESPONSE' || e.status === 'REPORTED').length;
  const contactedCount = emergencies.filter(e => e.status === 'PARENT_CONTACTED').length;
  const resolvedCount = emergencies.filter(e => e.status === 'RESOLVED' || e.status === 'CLOSED').length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'UNDER_RESPONSE':
      case 'REPORTED':
        return 'error';
      case 'PARENT_CONTACTED':
        return 'warning';
      case 'RESOLVED':
      case 'CLOSED':
        return 'success';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: 'error.main', display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <WarningAmberIcon sx={{ fontSize: 36 }} />
            Emergency Response & Incident Care
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Real-time medical emergency logging, instant triage, and parent notification center
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={loadEmergencies}>
            Refresh
          </Button>
          <Button variant="contained" color="error" startIcon={<AddIcon />} onClick={handleOpenModal}>
            Report Emergency
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* KPI Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card sx={{ bgcolor: 'error.lighter', border: '1px solid', borderColor: 'error.light', borderRadius: 2 }}>
            <CardContent>
              <Typography variant="body2" color="error.dark" fontWeight={600}>
                ACTIVE / CRITICAL
              </Typography>
              <Typography variant="h4" fontWeight={700} color="error.main">
                {activeCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card sx={{ bgcolor: 'warning.lighter', border: '1px solid', borderColor: 'warning.light', borderRadius: 2 }}>
            <CardContent>
              <Typography variant="body2" color="warning.dark" fontWeight={600}>
                PARENT CONTACTED
              </Typography>
              <Typography variant="h4" fontWeight={700} color="warning.main">
                {contactedCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card sx={{ bgcolor: 'success.lighter', border: '1px solid', borderColor: 'success.light', borderRadius: 2 }}>
            <CardContent>
              <Typography variant="body2" color="success.dark" fontWeight={600}>
                RESOLVED INCIDENTS
              </Typography>
              <Typography variant="h4" fontWeight={700} color="success.main">
                {resolvedCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filter Chips */}
      <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
        {['ALL', 'UNDER_RESPONSE', 'PARENT_CONTACTED', 'RESOLVED', 'CLOSED'].map((st) => (
          <Chip
            key={st}
            label={st.replace('_', ' ')}
            clickable
            color={filterStatus === st ? 'primary' : 'default'}
            variant={filterStatus === st ? 'filled' : 'outlined'}
            onClick={() => setFilterStatus(st)}
          />
        ))}
      </Box>

      {/* List */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : filteredEmergencies.length === 0 ? (
        <Card sx={{ p: 5, textAlign: 'center', borderRadius: 2 }}>
          <CheckCircleOutlineIcon sx={{ fontSize: 52, color: 'text.secondary', mb: 1.5 }} />
          <Typography variant="h6" color="text.secondary">
            No emergency reports found.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Clinic is clear. Click "Report Emergency" if an urgent case arises.
          </Typography>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {filteredEmergencies.map((item) => (
            <Grid size={{ xs: 12 }} key={item._id}>
              <Card sx={{
                borderRadius: 2,
                border: '1px solid',
                borderColor: item.status === 'UNDER_RESPONSE' ? 'error.main' : 'divider',
                boxShadow: item.status === 'UNDER_RESPONSE' ? '0 0 10px rgba(211, 47, 47, 0.15)' : 'none'
              }}>
                <CardContent sx={{ p: 2.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="h6" fontWeight={700}>
                          {item.emergencyNumber}
                        </Typography>
                        <Chip
                          label={item.status}
                          color={getStatusColor(item.status) as any}
                          size="small"
                          sx={{ fontWeight: 600 }}
                        />
                        {item.personType && (
                          <Chip label={item.personType} size="small" variant="outlined" />
                        )}
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        Logged on {new Date(item.date).toLocaleDateString()} at {item.time}
                      </Typography>
                    </Box>
                    <IconButton size="small" color="error" onClick={() => handleDelete(item._id)}>
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </Box>

                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <Typography variant="body2" color="text.secondary">Person Affected:</Typography>
                      <Typography variant="body1" fontWeight={600}>{item.personName || 'Unnamed'}</Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <Typography variant="body2" color="text.secondary">Location:</Typography>
                      <Typography variant="body1" fontWeight={600}>{item.location}</Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <Typography variant="body2" color="text.secondary">Parent Contacted:</Typography>
                      <Chip
                        label={item.parentContacted ? 'YES' : 'PENDING'}
                        color={item.parentContacted ? 'success' : 'default'}
                        size="small"
                        sx={{ mt: 0.5 }}
                      />
                    </Grid>
                  </Grid>

                  <Box sx={{ p: 1.5, bgcolor: 'grey.50', borderRadius: 1.5, mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">Symptoms Observed:</Typography>
                    <Typography variant="body2" fontWeight={500} color="error.dark">
                      {item.symptomsObserved}
                    </Typography>
                    {item.immediateAction && (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        <strong>Action Taken:</strong> {item.immediateAction}
                      </Typography>
                    )}
                    {item.outcome && (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        <strong>Outcome:</strong> {item.outcome}
                      </Typography>
                    )}
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {item.status !== 'PARENT_CONTACTED' && item.status !== 'RESOLVED' && (
                      <Button
                        variant="outlined"
                        color="warning"
                        size="small"
                        startIcon={<PhoneInTalkIcon />}
                        onClick={() => handleUpdateStatus(item._id, 'PARENT_CONTACTED', 'Parent called and briefed.')}
                      >
                        Notify Parent
                      </Button>
                    )}
                    {item.status !== 'RESOLVED' && (
                      <Button
                        variant="contained"
                        color="success"
                        size="small"
                        startIcon={<CheckCircleOutlineIcon />}
                        onClick={() => handleUpdateStatus(item._id, 'RESOLVED', 'Patient treated and stable.')}
                      >
                        Mark Resolved
                      </Button>
                    )}
                    {item.status === 'RESOLVED' && (
                      <Button
                        variant="outlined"
                        color="inherit"
                        size="small"
                        onClick={() => handleUpdateStatus(item._id, 'CLOSED', 'Case file closed.')}
                      >
                        Close Case
                      </Button>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Report Modal */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: 'error.main' }}>
          Report Medical Emergency
        </DialogTitle>
        <form onSubmit={handleSave}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Student / Person Name *"
              value={formData.personName}
              onChange={(e) => setFormData({ ...formData, personName: e.target.value })}
              fullWidth
              required
              placeholder="e.g. Rahul Sharma (Grade 8A)"
            />
            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Person Type</InputLabel>
                  <Select
                    value={formData.personType}
                    label="Person Type"
                    onChange={(e) => setFormData({ ...formData, personType: e.target.value })}
                  >
                    <MenuItem value="STUDENT">Student</MenuItem>
                    <MenuItem value="STAFF">Staff</MenuItem>
                    <MenuItem value="VISITOR">Visitor</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField
                  label="Time of Incident"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  fullWidth
                />
              </Grid>
            </Grid>

            <TextField
              label="Location on Campus *"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              fullWidth
              required
              placeholder="e.g. Playground / Chemistry Lab"
            />

            <TextField
              label="Symptoms / Emergency Description *"
              value={formData.symptomsObserved}
              onChange={(e) => setFormData({ ...formData, symptomsObserved: e.target.value })}
              fullWidth
              required
              multiline
              rows={3}
              placeholder="Describe symptoms, e.g. severe asthma attack, fainting, injury..."
            />

            <TextField
              label="Immediate Action Taken"
              value={formData.immediateAction}
              onChange={(e) => setFormData({ ...formData, immediateAction: e.target.value })}
              fullWidth
              multiline
              rows={2}
              placeholder="e.g. Administered inhaler, ice pack applied, rested in clinic..."
            />
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => setOpenModal(false)} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" color="error" disabled={saving}>
              {saving ? 'Submitting...' : 'Submit Emergency Report'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default EmergencyManager;
