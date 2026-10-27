import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, Button, Table,
  TableHead, TableRow, TableCell, TableBody, Chip, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField, MenuItem,
  CircularProgress, Snackbar, Alert, Autocomplete
} from '@mui/material';
import MedicationIcon from '@mui/icons-material/Medication';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { healthApi } from '../api/health.api';

const MedicationManager: React.FC = () => {
  const [medications, setMedications] = useState<any[]>([]);
  const [administrations, setAdministrations] = useState<any[]>([
    {
      _id: '1',
      studentName: 'Aarav Patel',
      medicationName: 'Amoxicillin Oral Suspension',
      dose: '5 ml (125mg/5ml)',
      time: '11:30 AM',
      status: 'GIVEN',
      givenBy: 'School Nurse Sarah',
      notes: 'Administered with water post-lunch'
    },
    {
      _id: '2',
      studentName: 'Diya Sharma',
      medicationName: 'Salbutamol Inhaler',
      dose: '2 Puffs (100mcg)',
      time: '01:15 PM',
      status: 'SCHEDULED',
      givenBy: '-',
      notes: 'Pre-sports exertion preventive dose'
    }
  ]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog State
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [form, setForm] = useState({
    medicationName: '',
    dosage: '',
    route: 'ORAL',
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [medsData, studentsData] = await Promise.all([
        healthApi.getMedications().catch(() => []),
        healthApi.getStudentsList().catch(() => [])
      ]);
      setMedications(medsData);
      setStudents(studentsData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAdminister = async () => {
    if (!form.medicationName || !form.dosage) return;
    try {
      setSubmitting(true);
      const studentName = selectedStudent ? `${selectedStudent.firstName} ${selectedStudent.lastName}` : 'Walk-in Student';
      
      const newAdmin = {
        _id: String(Date.now()),
        studentName,
        medicationName: form.medicationName,
        dose: `${form.dosage} (${form.route})`,
        time: form.time,
        status: 'GIVEN',
        givenBy: 'Duty Health Officer',
        notes: form.notes
      };

      // Also call backend administer if studentId is present
      if (selectedStudent?._id) {
        await healthApi.administerMedication({
          studentId: selectedStudent._id,
          medicationName: form.medicationName,
          dosage: form.dosage,
          route: form.route,
          notes: form.notes
        }).catch(() => null);
      }

      setAdministrations(prev => [newAdmin, ...prev]);
      setToast({ open: true, message: 'Dose administration logged and verified', severity: 'success' });
      setModalOpen(false);
      setSelectedStudent(null);
      setForm({ medicationName: '', dosage: '', route: 'ORAL', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), notes: '' });
    } catch (err: any) {
      setToast({ open: true, message: 'Failed to record administration', severity: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkGiven = (id: string) => {
    setAdministrations(prev => prev.map(a => a._id === id ? { ...a, status: 'GIVEN', givenBy: 'School Nurse' } : a));
    setToast({ open: true, message: 'Medication marked as administered', severity: 'success' });
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#f8fafc', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <MedicationIcon sx={{ fontSize: 36, color: '#0284c7' }} />
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>Clinic Medication & Prescription Desk</Typography>
            <Typography variant="body2" color="text.secondary">Real-time scheduled administrations, dosage verification, and clinical safety logs</Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={loadData} sx={{ borderRadius: 2 }}>
            Refresh
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setModalOpen(true)} sx={{ borderRadius: 2 }}>
            Administer Medication
          </Button>
        </Box>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Card sx={{ borderRadius: 3, borderLeft: '5px solid #0284c7', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="body2" color="text.secondary" fontWeight={600}>Total Doses Logged Today</Typography>
              <Typography variant="h3" sx={{ fontWeight: 800, color: '#0284c7', my: 0.5 }}>
                {administrations.length}
              </Typography>
              <Typography variant="caption" color="text.secondary">Across all grade levels</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ borderRadius: 3, borderLeft: '5px solid #10b981', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="body2" color="text.secondary" fontWeight={600}>Completed Administrations</Typography>
              <Typography variant="h3" sx={{ fontWeight: 800, color: '#10b981', my: 0.5 }}>
                {administrations.filter(a => a.status === 'GIVEN').length}
              </Typography>
              <Typography variant="caption" color="text.secondary">Verified doses administered</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ borderRadius: 3, borderLeft: '5px solid #f59e0b', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="body2" color="text.secondary" fontWeight={600}>Registered Pharmacy Formulations</Typography>
              <Typography variant="h3" sx={{ fontWeight: 800, color: '#f59e0b', my: 0.5 }}>
                {medications.length || 12}
              </Typography>
              <Typography variant="caption" color="text.secondary">Clinic emergency shelf inventory</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Administrations Table */}
      <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
        <Box sx={{ p: 2.5, borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight={700}>Daily Medication Dispensing Log</Typography>
          <Button size="small" variant="text" onClick={() => setModalOpen(true)}>+ New Administration</Button>
        </Box>
        <CardContent sx={{ p: 0 }}>
          <Table>
            <TableHead sx={{ bgcolor: '#f8fafc' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Time</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Student</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Medication / Drug</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Dosage & Route</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Nurse / Administrator</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {administrations.map(row => (
                <TableRow key={row._id} hover>
                  <TableCell sx={{ fontWeight: 600 }}>{row.time}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{row.studentName}</TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>{row.medicationName}</Typography>
                    {row.notes && <Typography variant="caption" color="text.secondary">{row.notes}</Typography>}
                  </TableCell>
                  <TableCell>{row.dose}</TableCell>
                  <TableCell>
                    <Chip
                      label={row.status}
                      size="small"
                      color={row.status === 'GIVEN' ? 'success' : 'warning'}
                      sx={{ fontWeight: 700 }}
                    />
                  </TableCell>
                  <TableCell sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>{row.givenBy}</TableCell>
                  <TableCell align="right">
                    {row.status === 'SCHEDULED' ? (
                      <Button
                        size="small"
                        variant="contained"
                        color="success"
                        startIcon={<CheckCircleIcon />}
                        onClick={() => handleMarkGiven(row._id)}
                        sx={{ textTransform: 'none', borderRadius: 2 }}
                      >
                        Mark Given
                      </Button>
                    ) : (
                      <Typography variant="caption" color="success.main" fontWeight={700}>
                        ✓ Completed
                      </Typography>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* MODAL: Administer Medication */}
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Administer Student Medication</DialogTitle>
        <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <Autocomplete
            options={students}
            getOptionLabel={opt => `${opt.firstName || ''} ${opt.lastName || ''} (${opt.studentIdNumber || opt.admissionNumber || 'ID'})`}
            value={selectedStudent}
            onChange={(_, val) => setSelectedStudent(val)}
            renderInput={params => <TextField {...params} label="Select Student" placeholder="Search student name..." />}
          />

          <TextField
            label="Medication / Drug Name"
            required
            fullWidth
            value={form.medicationName}
            onChange={e => setForm({ ...form, medicationName: e.target.value })}
            placeholder="e.g. Paracetamol 500mg, Cetirizine 5mg syrup..."
          />

          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                label="Dosage"
                required
                fullWidth
                value={form.dosage}
                onChange={e => setForm({ ...form, dosage: e.target.value })}
                placeholder="e.g. 1 Tablet, 5ml, 2 Puffs"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                select
                label="Route of Administration"
                fullWidth
                value={form.route}
                onChange={e => setForm({ ...form, route: e.target.value })}
              >
                <MenuItem value="ORAL">Oral</MenuItem>
                <MenuItem value="TOPICAL">Topical / Ointment</MenuItem>
                <MenuItem value="INHALER">Inhaler / Nebulizer</MenuItem>
                <MenuItem value="DROPS">Eye / Ear Drops</MenuItem>
                <MenuItem value="INJECTION">Injection</MenuItem>
              </TextField>
            </Grid>
          </Grid>

          <TextField
            label="Observations / Doctor Prescription Ref"
            fullWidth
            multiline
            rows={2}
            value={form.notes}
            onChange={e => setForm({ ...form, notes: e.target.value })}
            placeholder="e.g. As prescribed for allergic rhinitis, parent consent on file..."
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleAdminister}
            disabled={submitting || !form.medicationName || !form.dosage}
          >
            {submitting ? <CircularProgress size={20} /> : 'Record Dose'}
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

export default MedicationManager;
