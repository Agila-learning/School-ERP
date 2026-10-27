import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
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
  IconButton,
  Alert
} from '@mui/material';
import EventNoteIcon from '@mui/icons-material/EventNote';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';
import { healthApi } from '../api/health.api';
import type { MedicalVisit } from '../api/health.api';

const MedicalVisits: React.FC = () => {
  const [visits, setVisits] = useState<MedicalVisit[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modal
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    studentName: '',
    visitType: 'ROUTINE',
    reason: '',
    firstAidGiven: '',
    instructions: '',
    disposition: 'RETURNED_TO_CLASS',
    status: 'COMPLETED',
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  });

  const loadVisits = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await healthApi.getVisits();
      setVisits(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to fetch medical visits');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVisits();
  }, []);

  const handleOpenModal = () => {
    setFormData({
      studentName: '',
      visitType: 'ROUTINE',
      reason: '',
      firstAidGiven: '',
      instructions: '',
      disposition: 'RETURNED_TO_CLASS',
      status: 'COMPLETED',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
    setOpenModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.studentName.trim() || !formData.reason.trim()) {
      alert('Please provide student name and reason for visit.');
      return;
    }

    try {
      setSaving(true);
      await healthApi.createVisit({
        studentName: formData.studentName,
        visitType: formData.visitType as any,
        reason: formData.reason,
        firstAidGiven: formData.firstAidGiven,
        instructions: formData.instructions,
        disposition: formData.disposition,
        status: formData.status as any,
        time: formData.time,
        date: new Date().toISOString()
      });
      setOpenModal(false);
      await loadVisits();
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || 'Failed to record visit');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this visit record?')) return;
    try {
      await healthApi.deleteVisit(id);
      await loadVisits();
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || 'Failed to delete visit');
    }
  };

  // Metrics
  const totalCount = visits.length;
  const firstAidCount = visits.filter(v => v.visitType === 'FIRST_AID').length;
  const sentHomeCount = visits.filter(v => v.disposition === 'PARENT_PICKUP' || v.disposition === 'RETURNED_TO_HOSTEL').length;
  const inProgressCount = visits.filter(v => v.status === 'IN_PROGRESS' || v.status === 'REGISTERED').length;

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <EventNoteIcon color="primary" sx={{ fontSize: 36 }} />
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>Medical Visits Log</Typography>
            <Typography variant="body2" color="text.secondary">Real-time daily clinic visits, complaints, and treatment logs</Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={loadVisits}>
            Refresh
          </Button>
          <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleOpenModal}>
            Record Visit
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Metric Cards */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ borderTop: 4, borderColor: 'primary.main', borderRadius: 2 }}>
            <CardContent>
              <Typography color="text.secondary" variant="body2">Total Visits Logged</Typography>
              <Typography variant="h3" sx={{ mt: 1, fontWeight: 700 }}>{totalCount}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ borderTop: 4, borderColor: 'warning.main', borderRadius: 2 }}>
            <CardContent>
              <Typography color="text.secondary" variant="body2">First Aid Cases</Typography>
              <Typography variant="h3" sx={{ mt: 1, fontWeight: 700 }}>{firstAidCount}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ borderTop: 4, borderColor: 'error.main', borderRadius: 2 }}>
            <CardContent>
              <Typography color="text.secondary" variant="body2">Sent Home / Hostel</Typography>
              <Typography variant="h3" sx={{ mt: 1, fontWeight: 700 }}>{sentHomeCount}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ borderTop: 4, borderColor: 'info.main', borderRadius: 2 }}>
            <CardContent>
              <Typography color="text.secondary" variant="body2">Under Observation</Typography>
              <Typography variant="h3" sx={{ mt: 1, fontWeight: 700 }}>{inProgressCount}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Visits Table */}
      <Card sx={{ borderRadius: 2 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Recorded Visits</Typography>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress />
            </Box>
          ) : visits.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
              No clinic visits recorded yet. Click "Record Visit" above to log one.
            </Box>
          ) : (
            <TableContainer component={Paper} elevation={0}>
              <Table>
                <TableHead sx={{ bgcolor: 'grey.50' }}>
                  <TableRow>
                    <TableCell>Visit #</TableCell>
                    <TableCell>Date & Time</TableCell>
                    <TableCell>Student / Patient</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Reason / Complaint</TableCell>
                    <TableCell>Treatment / Action</TableCell>
                    <TableCell>Disposition</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {visits.map((row) => (
                    <TableRow key={row._id} hover>
                      <TableCell sx={{ fontWeight: 600 }}>{row.visitNumber}</TableCell>
                      <TableCell>
                        {new Date(row.date).toLocaleDateString()} {row.time}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{row.studentName || 'Student'}</TableCell>
                      <TableCell>
                        <Chip label={row.visitType} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell>{row.reason}</TableCell>
                      <TableCell>{row.firstAidGiven || row.instructions || 'Observed & Checked'}</TableCell>
                      <TableCell>{row.disposition?.replace(/_/g, ' ')}</TableCell>
                      <TableCell>
                        <Chip
                          label={row.status}
                          size="small"
                          color={row.status === 'COMPLETED' ? 'success' : 'warning'}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton size="small" color="error" onClick={() => handleDelete(row._id)}>
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Record Visit Modal */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Record Clinic Visit</DialogTitle>
        <form onSubmit={handleSave}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Student / Patient Name *"
              value={formData.studentName}
              onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
              fullWidth
              required
              placeholder="e.g. Jane Smith (Grade 8B)"
            />
            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Visit Type</InputLabel>
                  <Select
                    value={formData.visitType}
                    label="Visit Type"
                    onChange={(e) => setFormData({ ...formData, visitType: e.target.value })}
                  >
                    <MenuItem value="ROUTINE">Routine Checkup</MenuItem>
                    <MenuItem value="ILLNESS">Illness / Fever</MenuItem>
                    <MenuItem value="INJURY">Injury</MenuItem>
                    <MenuItem value="FIRST_AID">First Aid</MenuItem>
                    <MenuItem value="EMERGENCY">Emergency</MenuItem>
                    <MenuItem value="MEDICATION">Medication Admin</MenuItem>
                    <MenuItem value="HEALTH_SCREENING">Screening</MenuItem>
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
              label="Complaint / Reason for Visit *"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              fullWidth
              required
              multiline
              rows={2}
              placeholder="e.g. Fever, headache, stomachache, abrasion on right knee..."
            />

            <TextField
              label="Action Taken / Treatment Given"
              value={formData.firstAidGiven}
              onChange={(e) => setFormData({ ...formData, firstAidGiven: e.target.value })}
              fullWidth
              multiline
              rows={2}
              placeholder="e.g. Given ORS / rested in infirmary for 30 mins / antiseptic applied..."
            />

            <FormControl fullWidth>
              <InputLabel>Disposition (Outcome)</InputLabel>
              <Select
                value={formData.disposition}
                label="Disposition (Outcome)"
                onChange={(e) => setFormData({ ...formData, disposition: e.target.value })}
              >
                <MenuItem value="RETURNED_TO_CLASS">Returned to Class</MenuItem>
                <MenuItem value="REST_AT_CLINIC">Resting at Clinic</MenuItem>
                <MenuItem value="RETURNED_TO_HOSTEL">Returned to Hostel</MenuItem>
                <MenuItem value="PARENT_PICKUP">Parent Pickup (Sent Home)</MenuItem>
                <MenuItem value="REFERRED_TO_DOCTOR">Referred to Specialist</MenuItem>
                <MenuItem value="HOSPITAL_REFERRAL">Hospital Referral</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                label="Status"
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <MenuItem value="COMPLETED">Completed</MenuItem>
                <MenuItem value="IN_PROGRESS">In Progress (Observing)</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => setOpenModal(false)} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={saving}>
              {saving ? 'Saving...' : 'Save Visit Record'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default MedicalVisits;
