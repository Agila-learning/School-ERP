import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, Button, Tabs, Tab, Table,
  TableBody, TableCell, TableHead, TableRow, Chip, Grid, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField, MenuItem,
  CircularProgress, IconButton, Tooltip, Snackbar, Alert, Autocomplete
} from '@mui/material';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import HealingIcon from '@mui/icons-material/Healing';
import { healthApi, type MedicalVisit } from '../api/health.api';

const ClinicDesk: React.FC = () => {
  const [tab, setTab] = useState(0);
  const [visits, setVisits] = useState<MedicalVisit[]>([]);
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<any[]>([]);

  // Register Visit Dialog
  const [openModal, setOpenModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [form, setForm] = useState<{
    visitType: MedicalVisit['visitType'];
    reason: string;
    observedCondition: string;
    firstAidGiven: string;
    disposition: string;
    instructions: string;
  }>({
    visitType: 'FIRST_AID',
    reason: '',
    observedCondition: '',
    firstAidGiven: '',
    disposition: 'RETURNED_TO_CLASS',
    instructions: ''
  });

  const [toast, setToast] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [visitsData, studentsData] = await Promise.all([
        healthApi.getVisits(),
        healthApi.getStudentsList().catch(() => [])
      ]);
      setVisits(visitsData);
      setStudents(studentsData);
    } catch (e) {
      console.error(e);
      setToast({ open: true, message: 'Failed to load clinic visits', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 20000);
    return () => clearInterval(interval);
  }, []);

  const handleRegisterVisit = async () => {
    if (!form.reason) return;
    try {
      setSubmitting(true);
      const studentName = selectedStudent ? `${selectedStudent.firstName} ${selectedStudent.lastName}` : 'Walk-in Student';
      await healthApi.createVisit({
        ...form,
        studentId: selectedStudent?._id,
        studentName,
        status: 'IN_PROGRESS'
      });
      setToast({ open: true, message: 'New clinic visit registered', severity: 'success' });
      setOpenModal(false);
      setSelectedStudent(null);
      setForm({
        visitType: 'FIRST_AID',
        reason: '',
        observedCondition: '',
        firstAidGiven: '',
        disposition: 'RETURNED_TO_CLASS',
        instructions: ''
      });
      loadData();
    } catch (err: any) {
      setToast({ open: true, message: err?.response?.data?.message || 'Failed to register visit', severity: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (visitId: string, status: MedicalVisit['status']) => {
    try {
      await healthApi.updateVisit(visitId, { status });
      setToast({ open: true, message: `Visit marked as ${status}`, severity: 'success' });
      loadData();
    } catch (err: any) {
      setToast({ open: true, message: 'Failed to update visit status', severity: 'error' });
    }
  };

  // Filter lists according to active tab
  const activeVisits = visits.filter(v => v.status === 'IN_PROGRESS');
  const waitingVisits = visits.filter(v => v.status === 'REGISTERED');
  const completedVisits = visits.filter(v => v.status === 'COMPLETED' || v.status === 'CANCELLED');

  const currentList = tab === 0 ? activeVisits : tab === 1 ? waitingVisits : completedVisits;

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#f8fafc', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <LocalHospitalIcon sx={{ fontSize: 36, color: '#0d9488' }} />
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>Clinic Operations Desk</Typography>
            <Typography variant="body2" color="text.secondary">Real-time triage, treatment logs, first aid interventions & student health dispenses</Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={loadData} sx={{ borderRadius: 2 }}>
            Refresh
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenModal(true)} sx={{ borderRadius: 2, bgcolor: '#0d9488', '&:hover': { bgcolor: '#0f766e' } }}>
            Register New Visit
          </Button>
        </Box>
      </Box>

      {/* KPI Stats */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, borderLeft: '5px solid #0d9488', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="body2" color="text.secondary" fontWeight={600}>In Clinic Now</Typography>
              <Typography variant="h3" sx={{ fontWeight: 800, color: '#0d9488', my: 0.5 }}>
                {activeVisits.length}
              </Typography>
              <Typography variant="caption" color="text.secondary">Under medical observation</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, borderLeft: '5px solid #f59e0b', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="body2" color="text.secondary" fontWeight={600}>Waiting Queue</Typography>
              <Typography variant="h3" sx={{ fontWeight: 800, color: '#f59e0b', my: 0.5 }}>
                {waitingVisits.length}
              </Typography>
              <Typography variant="caption" color="text.secondary">Awaiting nurse consultation</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, borderLeft: '5px solid #10b981', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="body2" color="text.secondary" fontWeight={600}>Completed Today</Typography>
              <Typography variant="h3" sx={{ fontWeight: 800, color: '#10b981', my: 0.5 }}>
                {completedVisits.length}
              </Typography>
              <Typography variant="caption" color="text.secondary">Returned or discharged</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, borderLeft: '5px solid #6366f1', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="body2" color="text.secondary" fontWeight={600}>Total Clinic Records</Typography>
              <Typography variant="h3" sx={{ fontWeight: 800, color: '#6366f1', my: 0.5 }}>
                {visits.length}
              </Typography>
              <Typography variant="caption" color="text.secondary">Cumulative consultations</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content Tabs */}
      <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{ borderBottom: 1, borderColor: 'divider', px: 2, pt: 1 }}
        >
          <Tab label={`Active Patients (${activeVisits.length})`} sx={{ fontWeight: 700 }} />
          <Tab label={`Waiting Queue (${waitingVisits.length})`} sx={{ fontWeight: 700 }} />
          <Tab label={`Completed Consultations (${completedVisits.length})`} sx={{ fontWeight: 700 }} />
        </Tabs>

        <CardContent sx={{ p: 0 }}>
          <Table>
            <TableHead sx={{ bgcolor: '#f8fafc' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Visit # / Time</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Student / Patient</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Reported Reason</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>First Aid / Treatment</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Disposition</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <CircularProgress size={28} />
                  </TableCell>
                </TableRow>
              ) : currentList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                    {tab === 0 && 'No students currently undergoing examination in the clinic.'}
                    {tab === 1 && 'No students waiting in queue.'}
                    {tab === 2 && 'No completed visits logged today.'}
                  </TableCell>
                </TableRow>
              ) : (
                currentList.map(visit => (
                  <TableRow key={visit._id} hover>
                    <TableCell>
                      <Typography variant="subtitle2" sx={{ fontFamily: 'monospace', fontWeight: 700 }}>
                        {visit.visitNumber}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {visit.time || '10:00 AM'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={700}>
                        {visit.studentName || 'Student Walk-in'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={visit.visitType} size="small" variant="outlined" color="primary" />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{visit.reason}</Typography>
                      {visit.observedCondition && (
                        <Typography variant="caption" color="text.secondary" display="block">
                          Obs: {visit.observedCondition}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ color: '#0d9488', fontWeight: 600 }}>
                        {visit.firstAidGiven || 'Assessment pending'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={visit.disposition ? visit.disposition.replace(/_/g, ' ') : 'IN CLINIC'}
                        size="small"
                        color={visit.status === 'COMPLETED' ? 'success' : 'default'}
                      />
                    </TableCell>
                    <TableCell align="right">
                      {visit.status === 'IN_PROGRESS' && (
                        <Tooltip title="Complete Visit & Discharge">
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            startIcon={<CheckCircleOutlineIcon />}
                            onClick={() => handleStatusChange(visit._id, 'COMPLETED')}
                            sx={{ textTransform: 'none', borderRadius: 2 }}
                          >
                            Discharge
                          </Button>
                        </Tooltip>
                      )}
                      {visit.status === 'REGISTERED' && (
                        <Button
                          size="small"
                          variant="contained"
                          startIcon={<HealingIcon />}
                          onClick={() => handleStatusChange(visit._id, 'IN_PROGRESS')}
                          sx={{ textTransform: 'none', borderRadius: 2 }}
                        >
                          Take In
                        </Button>
                      )}
                      {visit.status !== 'CANCELLED' && visit.status !== 'COMPLETED' && (
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleStatusChange(visit._id, 'CANCELLED')}
                          sx={{ ml: 1 }}
                        >
                          <CancelOutlinedIcon fontSize="small" />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* MODAL: Register New Visit */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Register New Clinic Visit</DialogTitle>
        <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <Autocomplete
            options={students}
            getOptionLabel={opt => `${opt.firstName || ''} ${opt.lastName || ''} (${opt.studentIdNumber || opt.admissionNumber || 'ID'})`}
            value={selectedStudent}
            onChange={(_, val) => setSelectedStudent(val)}
            renderInput={params => <TextField {...params} label="Search Student / Patient" placeholder="Type student name or ID..." />}
          />

          <TextField
            select
            label="Visit Type"
            fullWidth
            value={form.visitType}
            onChange={e => setForm({ ...form, visitType: e.target.value as any })}
          >
            <MenuItem value="FIRST_AID">First Aid Emergency</MenuItem>
            <MenuItem value="ILLNESS">Illness / Fever / Nausea</MenuItem>
            <MenuItem value="INJURY">Physical Injury / Fall</MenuItem>
            <MenuItem value="ROUTINE">Routine Health Check</MenuItem>
            <MenuItem value="MEDICATION">Scheduled Medication Administration</MenuItem>
            <MenuItem value="FOLLOW_UP">Follow-Up Checkup</MenuItem>
            <MenuItem value="OTHER">Other Reason</MenuItem>
          </TextField>

          <TextField
            label="Chief Complaint / Reason for Visit"
            required
            fullWidth
            value={form.reason}
            onChange={e => setForm({ ...form, reason: e.target.value })}
            placeholder="e.g. Headache, scraping on left knee during PE, high fever..."
          />

          <TextField
            label="Observed Condition / Vitals"
            fullWidth
            value={form.observedCondition}
            onChange={e => setForm({ ...form, observedCondition: e.target.value })}
            placeholder="e.g. Temp: 99.4°F, Pulse: 82 bpm, swelling on elbow..."
          />

          <TextField
            label="First Aid / Treatment Administered"
            fullWidth
            value={form.firstAidGiven}
            onChange={e => setForm({ ...form, firstAidGiven: e.target.value })}
            placeholder="e.g. Antiseptic applied, bandage dressed, rest 20 min..."
          />

          <TextField
            select
            label="Disposition"
            fullWidth
            value={form.disposition}
            onChange={e => setForm({ ...form, disposition: e.target.value })}
          >
            <MenuItem value="RETURNED_TO_CLASS">Returned to Class</MenuItem>
            <MenuItem value="SENT_HOME">Sent Home (Parents Contacted)</MenuItem>
            <MenuItem value="TRANSFERRED_TO_HOSPITAL">Transferred to Hospital</MenuItem>
            <MenuItem value="UNDER_OBSERVATION">Under Clinic Observation</MenuItem>
          </TextField>

          <TextField
            label="Instructions for Class Teacher / Parents"
            fullWidth
            multiline
            rows={2}
            value={form.instructions}
            onChange={e => setForm({ ...form, instructions: e.target.value })}
            placeholder="e.g. No physical exertion for the remainder of the day, monitor temperature..."
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenModal(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleRegisterVisit}
            disabled={submitting || !form.reason}
            sx={{ bgcolor: '#0d9488', '&:hover': { bgcolor: '#0f766e' } }}
          >
            {submitting ? <CircularProgress size={20} /> : 'Save & Triage'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Toast */}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast({ ...toast, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={toast.severity} onClose={() => setToast({ ...toast, open: false })}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ClinicDesk;
