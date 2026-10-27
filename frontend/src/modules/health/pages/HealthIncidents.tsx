import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
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
  FormControlLabel,
  Checkbox,
  Alert,
  Grid
} from '@mui/material';
import HistoryEduIcon from '@mui/icons-material/HistoryEdu';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import { healthApi } from '../api/health.api';
import type { HealthIncident } from '../api/health.api';

const HealthIncidents: React.FC = () => {
  const [incidents, setIncidents] = useState<HealthIncident[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modal
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    personName: '',
    type: 'SPORTS_INJURY',
    description: '',
    location: '',
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    immediateAction: '',
    firstAidGiven: true,
    referredToHospital: false,
    parentNotified: false
  });

  const loadIncidents = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await healthApi.getIncidents();
      setIncidents(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load health incidents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIncidents();
  }, []);

  const handleOpenModal = () => {
    setFormData({
      personName: '',
      type: 'SPORTS_INJURY',
      description: '',
      location: '',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      immediateAction: '',
      firstAidGiven: true,
      referredToHospital: false,
      parentNotified: false
    });
    setOpenModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description.trim() || !formData.location.trim()) {
      alert('Please fill description and location.');
      return;
    }
    try {
      setSaving(true);
      await healthApi.reportIncident({
        ...formData,
        date: new Date().toISOString()
      });
      setOpenModal(false);
      await loadIncidents();
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || 'Failed to report incident');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <HistoryEduIcon color="error" sx={{ fontSize: 36 }} />
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>Health & Safety Incidents</Typography>
            <Typography variant="body2" color="text.secondary">
              Campus incident logging for sports, laboratory, transport, and unexpected health occurrences
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={loadIncidents}>
            Refresh
          </Button>
          <Button variant="contained" color="error" startIcon={<AddIcon />} onClick={handleOpenModal}>
            Report Incident
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Card sx={{ borderRadius: 2 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Recorded Campus Incidents</Typography>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress />
            </Box>
          ) : incidents.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
              No incidents reported yet. Click "Report Incident" to log one.
            </Box>
          ) : (
            <TableContainer component={Paper} elevation={0}>
              <Table>
                <TableHead sx={{ bgcolor: 'grey.50' }}>
                  <TableRow>
                    <TableCell>Date & Time</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Location</TableCell>
                    <TableCell>Description & Immediate Action</TableCell>
                    <TableCell>Hospital Referral</TableCell>
                    <TableCell>Parent Notified</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {incidents.map((row) => (
                    <TableRow key={row._id} hover>
                      <TableCell>{new Date(row.date).toLocaleDateString()} {row.time}</TableCell>
                      <TableCell>
                        <Chip label={row.type?.replace('_', ' ')} size="small" color="warning" />
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{row.location}</TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>{row.description}</Typography>
                        {row.immediateAction && (
                          <Typography variant="caption" color="text.secondary">Action: {row.immediateAction}</Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={row.referredToHospital ? 'YES' : 'NO'}
                          size="small"
                          color={row.referredToHospital ? 'error' : 'default'}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={row.parentNotified ? 'YES' : 'NO'}
                          size="small"
                          color={row.parentNotified ? 'success' : 'default'}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={row.status}
                          size="small"
                          color={row.status === 'RESOLVED' || row.status === 'CLOSED' ? 'success' : 'error'}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Report Modal */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: 'error.main' }}>Report Health & Safety Incident</DialogTitle>
        <form onSubmit={handleSave}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Incident Type</InputLabel>
                  <Select
                    value={formData.type}
                    label="Incident Type"
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  >
                    <MenuItem value="SPORTS_INJURY">Sports Injury</MenuItem>
                    <MenuItem value="INJURY">General Injury</MenuItem>
                    <MenuItem value="SUDDEN_ILLNESS">Sudden Illness</MenuItem>
                    <MenuItem value="FAINTING">Fainting / Heatstroke</MenuItem>
                    <MenuItem value="LAB_INCIDENT">Laboratory Incident</MenuItem>
                    <MenuItem value="TRANSPORT_INCIDENT">Transport Incident</MenuItem>
                    <MenuItem value="OTHER">Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField
                  label="Time"
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
              placeholder="e.g. Football ground, Chemistry Lab 2, Main Gate"
            />

            <TextField
              label="Incident Description *"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              fullWidth
              required
              multiline
              rows={3}
              placeholder="Detailed description of what occurred..."
            />

            <TextField
              label="Immediate Action Taken"
              value={formData.immediateAction}
              onChange={(e) => setFormData({ ...formData, immediateAction: e.target.value })}
              fullWidth
              multiline
              rows={2}
              placeholder="Action taken immediately after incident..."
            />

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.firstAidGiven}
                    onChange={(e) => setFormData({ ...formData, firstAidGiven: e.target.checked })}
                  />
                }
                label="First Aid Given"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.referredToHospital}
                    onChange={(e) => setFormData({ ...formData, referredToHospital: e.target.checked })}
                  />
                }
                label="Referred to Hospital"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.parentNotified}
                    onChange={(e) => setFormData({ ...formData, parentNotified: e.target.checked })}
                  />
                }
                label="Parent Notified"
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => setOpenModal(false)} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" color="error" disabled={saving}>
              {saving ? 'Submitting...' : 'Submit Incident Report'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default HealthIncidents;
