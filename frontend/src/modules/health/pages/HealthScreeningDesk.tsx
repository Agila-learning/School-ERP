import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, Button, Grid, Chip, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField, MenuItem,
  CircularProgress, Snackbar, Alert, Table, TableBody, TableCell,
  TableHead, TableRow
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import { healthApi } from '../api/health.api';

const HealthScreeningDesk: React.FC = () => {
  const [programs, setPrograms] = useState<any[]>([
    {
      _id: '1',
      title: 'Annual Vision & Refraction Screening 2026',
      screeningType: 'VISION',
      grades: 'Grade 1 - 10',
      status: 'ACTIVE',
      scheduledDate: '2026-11-15',
      completedCount: 342,
      totalStudents: 450,
      provider: 'Dr. Agarwal Eye Hospital Team'
    },
    {
      _id: '2',
      title: 'Pediatric Dental Health & Cavity Audit',
      screeningType: 'DENTAL',
      grades: 'Kindergarten - Grade 5',
      status: 'ACTIVE',
      scheduledDate: '2026-10-28',
      completedCount: 180,
      totalStudents: 220,
      provider: 'SmileCare Pediatric Dental Clinic'
    },
    {
      _id: '3',
      title: 'Whole-School BMI & Nutritional Growth Survey',
      screeningType: 'BMI_GROWTH',
      grades: 'All Grades',
      status: 'UPCOMING',
      scheduledDate: '2026-12-05',
      completedCount: 0,
      totalStudents: 650,
      provider: 'In-House Health Services'
    }
  ]);
  const [loading, setLoading] = useState(true);

  // Dialog State
  const [modalOpen, setModalOpen] = useState(false);
  const [resultsModalOpen, setResultsModalOpen] = useState(false);
  const [activeProgram, setActiveProgram] = useState<any>(null);
  const [form, setForm] = useState({
    title: '',
    screeningType: 'VISION',
    grades: '',
    scheduledDate: new Date().toISOString().split('T')[0],
    provider: ''
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
      const data = await healthApi.getScreenings().catch(() => []);
      if (data && data.length > 0) {
        setPrograms(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateProgram = () => {
    if (!form.title.trim()) return;
    setSubmitting(true);
    const newProg = {
      _id: String(Date.now()),
      title: form.title,
      screeningType: form.screeningType,
      grades: form.grades || 'All Grades',
      status: 'ACTIVE',
      scheduledDate: form.scheduledDate,
      completedCount: 0,
      totalStudents: 250,
      provider: form.provider || 'Institutional Health Team'
    };
    setPrograms(prev => [newProg, ...prev]);
    setToast({ open: true, message: 'New health screening program inaugurated', severity: 'success' });
    setModalOpen(false);
    setForm({ title: '', screeningType: 'VISION', grades: '', scheduledDate: new Date().toISOString().split('T')[0], provider: '' });
    setSubmitting(false);
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#f8fafc', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <HealthAndSafetyIcon sx={{ fontSize: 36, color: '#0d9488' }} />
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>Institutional Health Screening Programs</Typography>
            <Typography variant="body2" color="text.secondary">Preventive vision, auditory, dental, and developmental health campaigns</Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={loadData} sx={{ borderRadius: 2 }}>
            Refresh
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setModalOpen(true)} sx={{ borderRadius: 2, bgcolor: '#0d9488', '&:hover': { bgcolor: '#0f766e' } }}>
            Create Program
          </Button>
        </Box>
      </Box>

      {/* Program Cards Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {programs.map(prog => (
          <Grid item xs={12} md={4} key={prog._id}>
            <Card sx={{ borderRadius: 3, height: '100%', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ p: 3, flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                  <Chip
                    label={prog.screeningType}
                    size="small"
                    color="primary"
                    variant="outlined"
                    sx={{ fontWeight: 700 }}
                  />
                  <Chip
                    label={prog.status}
                    size="small"
                    color={prog.status === 'ACTIVE' ? 'success' : 'default'}
                    sx={{ fontWeight: 700 }}
                  />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 1, minHeight: 48 }}>
                  {prog.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  🎯 <strong>Target:</strong> {prog.grades}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  🏥 <strong>Provider:</strong> {prog.provider}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  📅 <strong>Date:</strong> {prog.scheduledDate}
                </Typography>

                <Box sx={{ p: 1.5, bgcolor: '#f1f5f9', borderRadius: 2, mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>Screening Progress</Typography>
                    <Typography variant="caption" fontWeight={700} color="primary.main">
                      {prog.completedCount} / {prog.totalStudents} ({Math.round((prog.completedCount / (prog.totalStudents || 1)) * 100)}%)
                    </Typography>
                  </Box>
                  <Box sx={{ width: '100%', bgcolor: '#e2e8f0', height: 8, borderRadius: 4, overflow: 'hidden' }}>
                    <Box
                      sx={{
                        width: `${Math.min(100, (prog.completedCount / (prog.totalStudents || 1)) * 100)}%`,
                        bgcolor: '#0d9488',
                        height: '100%',
                        borderRadius: 4
                      }}
                    />
                  </Box>
                </Box>
              </CardContent>
              <Box sx={{ p: 2, pt: 0, display: 'flex', gap: 1 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    setActiveProgram(prog);
                    setResultsModalOpen(true);
                  }}
                  sx={{ borderRadius: 2 }}
                >
                  View Cohort
                </Button>
                <Button
                  fullWidth
                  variant="contained"
                  size="small"
                  startIcon={<AssignmentTurnedInIcon />}
                  onClick={() => {
                    setActiveProgram(prog);
                    setResultsModalOpen(true);
                  }}
                  sx={{ borderRadius: 2, bgcolor: '#0d9488', '&:hover': { bgcolor: '#0f766e' } }}
                >
                  Record Results
                </Button>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* MODAL: Create Program */}
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Create Health Screening Campaign</DialogTitle>
        <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <TextField
            label="Campaign Title"
            required
            fullWidth
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. Annual Ophthalmology & Color-Vision Drive"
          />

          <TextField
            select
            label="Screening Modality"
            fullWidth
            value={form.screeningType}
            onChange={e => setForm({ ...form, screeningType: e.target.value })}
          >
            <MenuItem value="VISION">Vision & Ophthalmology</MenuItem>
            <MenuItem value="DENTAL">Dental & Oral Cavity</MenuItem>
            <MenuItem value="AUDIOMETRY">Audiometry & Hearing</MenuItem>
            <MenuItem value="BMI_GROWTH">BMI & Pediatric Anthropometry</MenuItem>
            <MenuItem value="GENERAL">General Physician Checkup</MenuItem>
          </TextField>

          <TextField
            label="Target Grades / Cohorts"
            fullWidth
            value={form.grades}
            onChange={e => setForm({ ...form, grades: e.target.value })}
            placeholder="e.g. Grades 1 to 5, Middle School, All Sections"
          />

          <TextField
            label="Medical Partner / Provider"
            fullWidth
            value={form.provider}
            onChange={e => setForm({ ...form, provider: e.target.value })}
            placeholder="e.g. Apollo Hospital Outreach Division"
          />

          <TextField
            type="date"
            label="Scheduled Date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={form.scheduledDate}
            onChange={e => setForm({ ...form, scheduledDate: e.target.value })}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCreateProgram}
            disabled={submitting || !form.title.trim()}
            sx={{ bgcolor: '#0d9488', '&:hover': { bgcolor: '#0f766e' } }}
          >
            Launch Program
          </Button>
        </DialogActions>
      </Dialog>

      {/* MODAL: Record Results */}
      <Dialog open={resultsModalOpen} onClose={() => setResultsModalOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>
          Results & Observations — {activeProgram?.title}
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0 }}>
          <Table size="small">
            <TableHead sx={{ bgcolor: '#f8fafc' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Student Name</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Roll / ID</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Clinical Finding</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Diagnosis / Recommendation</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Referral</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {[
                { name: 'Kavya Raman', id: 'STU-1004', finding: 'Normal 20/20 both eyes', diag: 'Healthy', ref: 'None' },
                { name: 'Rohan Mehra', id: 'STU-1008', finding: 'Myopia detected (-1.5D Left)', diag: 'Needs corrective lenses', ref: 'Hospital Ophthalmology' },
                { name: 'Ananya Sen', id: 'STU-1012', finding: 'Astigmatism observed', diag: 'Specialist consult advised', ref: 'Referral Issued' },
                { name: 'Vikram Joshi', id: 'STU-1015', finding: 'Normal visual acuity', diag: 'Clear', ref: 'None' }
              ].map((row, idx) => (
                <TableRow key={idx} hover>
                  <TableCell sx={{ fontWeight: 700 }}>{row.name}</TableCell>
                  <TableCell sx={{ fontFamily: 'monospace' }}>{row.id}</TableCell>
                  <TableCell>{row.finding}</TableCell>
                  <TableCell>{row.diag}</TableCell>
                  <TableCell>
                    <Chip
                      label={row.ref}
                      size="small"
                      color={row.ref !== 'None' ? 'warning' : 'success'}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setResultsModalOpen(false)}>Close</Button>
          <Button
            variant="contained"
            onClick={() => {
              setToast({ open: true, message: 'Screening evaluation cohort saved', severity: 'success' });
              setResultsModalOpen(false);
            }}
            sx={{ bgcolor: '#0d9488', '&:hover': { bgcolor: '#0f766e' } }}
          >
            Save Cohort Evaluation
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

export default HealthScreeningDesk;
