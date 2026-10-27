import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Grid, TextField, MenuItem, Button,
  Chip, IconButton, Tooltip, Dialog, DialogTitle,
  DialogContent, DialogActions, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Alert, InputAdornment,
  Avatar, Card, CardContent
} from '@mui/material';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ScienceIcon from '@mui/icons-material/Science';
import ComputerIcon from '@mui/icons-material/Computer';
import DownloadDoneIcon from '@mui/icons-material/DownloadDone';
import PrintIcon from '@mui/icons-material/Print';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

export interface LabAttendee {
  id: string;
  rollNo: string;
  name: string;
  admissionNo: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE';
  workstationNo: string;
  isManualAdd?: boolean;
  manualReason?: string;
  penalty?: {
    itemDamaged: string;
    amount: number;
    billingStatus: 'BILLED_TO_OFFICE' | 'PAID_AT_DESK';
    remarks: string;
  };
}

export interface ClassRosterPreset {
  className: string;
  streamName: string;
  students: { rollNo: string; name: string; admissionNo: string }[];
}

export const LabAttendee = {};
export const ClassRosterPreset = {};

export const CLASS_ROSTERS: Record<string, ClassRosterPreset> = {
  '12-MC': {
    className: 'Grade 12',
    streamName: 'Group 102: Maths - Computer Science',
    students: [
      { rollNo: '12-MC-01', name: 'Aarav Patel', admissionNo: 'ADM-2026-081' },
      { rollNo: '12-MC-02', name: 'Deepak Raj', admissionNo: 'ADM-2026-082' },
      { rollNo: '12-MC-03', name: 'Gautam Siddharth', admissionNo: 'ADM-2026-083' },
      { rollNo: '12-MC-04', name: 'Harish Kalyan', admissionNo: 'ADM-2026-084' },
      { rollNo: '12-MC-05', name: 'Ishita Sharma', admissionNo: 'ADM-2026-085' },
      { rollNo: '12-MC-06', name: 'Jitendra Nath', admissionNo: 'ADM-2026-086' },
      { rollNo: '12-MC-07', name: 'Karthik Raja', admissionNo: 'ADM-2026-087' },
      { rollNo: '12-MC-08', name: 'Lavanya Swaminathan', admissionNo: 'ADM-2026-088' }
    ]
  },
  '12-MB': {
    className: 'Grade 12',
    streamName: 'Group 101: Maths - Biology',
    students: [
      { rollNo: '12-MB-01', name: 'Priya Sundaram', admissionNo: 'ADM-2026-092' },
      { rollNo: '12-MB-02', name: 'Ananya Raghavan', admissionNo: 'ADM-2026-093' },
      { rollNo: '12-MB-03', name: 'Bhavna Chawla', admissionNo: 'ADM-2026-094' },
      { rollNo: '12-MB-04', name: 'Chirag Sethi', admissionNo: 'ADM-2026-095' },
      { rollNo: '12-MB-05', name: 'Divya Nambiar', admissionNo: 'ADM-2026-096' },
      { rollNo: '12-MB-06', name: 'Eshwar Murthy', admissionNo: 'ADM-2026-097' }
    ]
  },
  '12-MICRO': {
    className: 'Grade 12',
    streamName: 'Group 103: Pure Science / Microbiology',
    students: [
      { rollNo: '12-MIC-01', name: 'Kavita Menon', admissionNo: 'ADM-2026-114' },
      { rollNo: '12-MIC-02', name: 'Madhavan Nair', admissionNo: 'ADM-2026-115' },
      { rollNo: '12-MIC-03', name: 'Nandhini Prakash', admissionNo: 'ADM-2026-116' },
      { rollNo: '12-MIC-04', name: 'Ojasvi Kulkarni', admissionNo: 'ADM-2026-117' },
      { rollNo: '12-MIC-05', name: 'Pranitha Reddy', admissionNo: 'ADM-2026-118' }
    ]
  },
  '12-COMM-CS': {
    className: 'Grade 12',
    streamName: 'Group 104: Commerce - Computer Applications',
    students: [
      { rollNo: '12-CC-01', name: 'Mohammed Tariq', admissionNo: 'ADM-2026-105' },
      { rollNo: '12-CC-02', name: 'Quentin Dsouza', admissionNo: 'ADM-2026-106' },
      { rollNo: '12-CC-03', name: 'Rohit Balaji', admissionNo: 'ADM-2026-107' },
      { rollNo: '12-CC-04', name: 'Sneha Chander', admissionNo: 'ADM-2026-108' }
    ]
  },
  '11-MC': {
    className: 'Grade 11',
    streamName: 'Group 102: Maths - Computer Science',
    students: [
      { rollNo: '11-MC-01', name: 'Tarun Varma', admissionNo: 'ADM-2026-150' },
      { rollNo: '11-MC-02', name: 'Uthra Shankar', admissionNo: 'ADM-2026-151' },
      { rollNo: '11-MC-03', name: 'Varun Joshi', admissionNo: 'ADM-2026-152' },
      { rollNo: '11-MC-04', name: 'Yamini Iyer', admissionNo: 'ADM-2026-153' }
    ]
  }
};

export const LabSessionAttendanceDesk: React.FC = () => {
  const [selectedLab, setSelectedLab] = useState('Physics Advanced Lab');
  const [selectedClassKey, setSelectedClassKey] = useState('12-MC');
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split('T')[0]);
  const [sessionPeriod, setSessionPeriod] = useState('Period 3 & 4 (10:15 AM - 11:45 AM)');
  const [experimentTopic, setExperimentTopic] = useState('Verification of Ohm\'s Law & Internal Resistance of Cell');

  // Attendance roster
  const [attendees, setAttendees] = useState<LabAttendee[]>([]);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Manual student add modal
  const [manualAddOpen, setManualAddOpen] = useState(false);
  const [manualStudent, setManualStudent] = useState({
    name: '',
    rollNo: '',
    admissionNo: '',
    workstationNo: 'Table 6 / System 12',
    manualReason: 'Practical repeat / Absence make-up'
  });

  // Breakage Penalty modal
  const [penaltyModalOpen, setPenaltyModalOpen] = useState(false);
  const [penaltyTargetStudent, setPenaltyTargetStudent] = useState<LabAttendee | null>(null);
  const [penaltyForm, setPenaltyForm] = useState({
    itemDamaged: 'Burette 50ml (Borosilicate Class A)',
    amount: 250,
    billingStatus: 'BILLED_TO_OFFICE' as 'BILLED_TO_OFFICE' | 'PAID_AT_DESK',
    remarks: 'Chipped nozzle tip during clamp mounting. Replacement apparatus billed.'
  });

  // 1-Click Import Class Students
  const handleImportClassRoster = () => {
    const preset = CLASS_ROSTERS[selectedClassKey];
    if (!preset) return;

    const imported: LabAttendee[] = preset.students.map((s, idx) => ({
      id: `att-${s.rollNo}-${Date.now()}`,
      rollNo: s.rollNo,
      name: s.name,
      admissionNo: s.admissionNo,
      status: 'PRESENT',
      workstationNo: `Bench / System #${idx + 1}`
    }));

    setAttendees(imported);
    setSavedSuccess(false);
  };

  // Toggle student status
  const handleStatusChange = (id: string, newStatus: LabAttendee['status']) => {
    setAttendees(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));
  };

  // Mark all present
  const handleMarkAllPresent = () => {
    setAttendees(prev => prev.map(a => ({ ...a, status: 'PRESENT' })));
  };

  // Submit manual student add
  const handleAddManualStudent = () => {
    if (!manualStudent.name || !manualStudent.rollNo) return;

    const newAttendee: LabAttendee = {
      id: `manual-${Date.now()}`,
      rollNo: manualStudent.rollNo,
      name: manualStudent.name,
      admissionNo: manualStudent.admissionNo || `ADM-MAN-${Math.floor(100 + Math.random() * 900)}`,
      status: 'PRESENT',
      workstationNo: manualStudent.workstationNo,
      isManualAdd: true,
      manualReason: manualStudent.manualReason
    };

    setAttendees(prev => [...prev, newAttendee]);
    setManualAddOpen(false);
    setManualStudent({
      name: '',
      rollNo: '',
      admissionNo: '',
      workstationNo: 'Table 6 / System 12',
      manualReason: 'Practical repeat / Absence make-up'
    });
  };

  // Open penalty modal
  const handleOpenPenaltyModal = (student: LabAttendee) => {
    setPenaltyTargetStudent(student);
    if (student.penalty) {
      setPenaltyForm({
        itemDamaged: student.penalty.itemDamaged,
        amount: student.penalty.amount,
        billingStatus: student.penalty.billingStatus,
        remarks: student.penalty.remarks
      });
    } else {
      setPenaltyForm({
        itemDamaged: 'Burette 50ml (Borosilicate Class A)',
        amount: 250,
        billingStatus: 'BILLED_TO_OFFICE',
        remarks: 'Accidental breakage during practical session.'
      });
    }
    setPenaltyModalOpen(true);
  };

  // Save penalty
  const handleSavePenalty = () => {
    if (!penaltyTargetStudent) return;

    setAttendees(prev => prev.map(a => {
      if (a.id === penaltyTargetStudent.id) {
        return {
          ...a,
          penalty: {
            itemDamaged: penaltyForm.itemDamaged,
            amount: Number(penaltyForm.amount),
            billingStatus: penaltyForm.billingStatus,
            remarks: penaltyForm.remarks
          }
        };
      }
      return a;
    }));

    // Record in local storage for No-Due desk integration
    try {
      const storedPenalties = JSON.parse(localStorage.getItem('erp_lab_penalties') || '[]');
      storedPenalties.push({
        id: 'pen-' + Date.now(),
        studentName: penaltyTargetStudent.name,
        rollNo: penaltyTargetStudent.rollNo,
        admissionNo: penaltyTargetStudent.admissionNo,
        labName: selectedLab,
        date: sessionDate,
        ...penaltyForm
      });
      localStorage.setItem('erp_lab_penalties', JSON.stringify(storedPenalties));
    } catch (e) {
      console.error(e);
    }

    setPenaltyModalOpen(false);
    setPenaltyTargetStudent(null);
  };

  // Remove penalty
  const handleRemovePenalty = (studentId: string) => {
    setAttendees(prev => prev.map(a => {
      if (a.id === studentId) {
        const { penalty, ...rest } = a;
        return rest;
      }
      return a;
    }));
  };

  // Save attendance sheet
  const handleSaveAttendance = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 4000);
  };

  const presentCount = attendees.filter(a => a.status === 'PRESENT').length;
  const absentCount = attendees.filter(a => a.status === 'ABSENT').length;
  const lateCount = attendees.filter(a => a.status === 'LATE').length;
  const totalPenalties = attendees.reduce((acc, a) => acc + (a.penalty?.amount || 0), 0);

  return (
    <Box sx={{ mt: 2 }}>
      {/* Session Configuration Card */}
      <Paper elevation={0} sx={{ p: 3, mb: 3.5, borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: '#ffffff' }}>
        <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <ScienceIcon sx={{ color: '#0284c7' }} /> Practical Session Setup & Student Roster Import
        </Typography>

        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              select
              fullWidth
              size="small"
              label="Laboratory Facility"
              value={selectedLab}
              onChange={e => setSelectedLab(e.target.value)}
            >
              <MenuItem value="Physics Advanced Lab">Physics Advanced Lab</MenuItem>
              <MenuItem value="Chemistry Research Lab">Chemistry Research Lab</MenuItem>
              <MenuItem value="Biology & Microbiology Lab">Biology & Microbiology Lab</MenuItem>
              <MenuItem value="Computer Science Lab A">Computer Science Lab A</MenuItem>
              <MenuItem value="Computer Science Lab B">Computer Science Lab B</MenuItem>
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3.5 }}>
            <TextField
              select
              fullWidth
              size="small"
              label="Target Class & Stream Roster"
              value={selectedClassKey}
              onChange={e => setSelectedClassKey(e.target.value)}
            >
              <MenuItem value="12-MC">Grade 12 - Group 102 (Maths - Computer)</MenuItem>
              <MenuItem value="12-MB">Grade 12 - Group 101 (Maths - Biology)</MenuItem>
              <MenuItem value="12-MICRO">Grade 12 - Group 103 (Microbiology / Pure Sci)</MenuItem>
              <MenuItem value="12-COMM-CS">Grade 12 - Group 104 (Commerce - CS)</MenuItem>
              <MenuItem value="11-MC">Grade 11 - Group 102 (Maths - Computer)</MenuItem>
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 2.5 }}>
            <TextField
              type="date"
              fullWidth
              size="small"
              label="Session Date"
              slotProps={{ inputLabel: { shrink: true } }}
              value={sessionDate}
              onChange={e => setSessionDate(e.target.value)}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              fullWidth
              size="small"
              label="Session Timings / Period"
              value={sessionPeriod}
              onChange={e => setSessionPeriod(e.target.value)}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 8 }}>
            <TextField
              fullWidth
              size="small"
              label="Experiment Title / Practical Objective"
              value={experimentTopic}
              onChange={e => setExperimentTopic(e.target.value)}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 4 }} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<DownloadDoneIcon />}
              onClick={handleImportClassRoster}
              sx={{
                bgcolor: '#0284c7',
                fontWeight: 700,
                textTransform: 'none',
                py: 1,
                borderRadius: 2,
                boxShadow: '0 4px 12px -2px rgba(2, 132, 199, 0.4)',
                '&:hover': { bgcolor: '#0369a1' }
              }}
            >
              1-Click Import Class Students
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Roster & Attendance Controls */}
      {attendees.length > 0 && (
        <>
          {/* Summary Stats Row */}
          <Grid container spacing={2.5} sx={{ mb: 3 }}>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Card elevation={0} sx={{ p: 2, borderRadius: 2.5, border: '1px solid #dcfce7', bgcolor: '#f0fdf4' }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#166534', textTransform: 'uppercase' }}>Present</Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#15803d' }}>{presentCount}</Typography>
              </Card>
            </Grid>

            <Grid size={{ xs: 6, sm: 3 }}>
              <Card elevation={0} sx={{ p: 2, borderRadius: 2.5, border: '1px solid #fee2e2', bgcolor: '#fef2f2' }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#991b1b', textTransform: 'uppercase' }}>Absent</Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#b91c1c' }}>{absentCount}</Typography>
              </Card>
            </Grid>

            <Grid size={{ xs: 6, sm: 3 }}>
              <Card elevation={0} sx={{ p: 2, borderRadius: 2.5, border: '1px solid #fef3c7', bgcolor: '#fffbeb' }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#92400e', textTransform: 'uppercase' }}>Late / Excused</Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#b45309' }}>{lateCount}</Typography>
              </Card>
            </Grid>

            <Grid size={{ xs: 6, sm: 3 }}>
              <Card elevation={0} sx={{ p: 2, borderRadius: 2.5, border: '1px solid #f1f5f9', bgcolor: '#ffffff' }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#dc2626', textTransform: 'uppercase' }}>Breakage Penalties</Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#dc2626' }}>₹{totalPenalties}</Typography>
              </Card>
            </Grid>
          </Grid>

          {/* Action Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
                Session Roster ({attendees.length} Students)
              </Typography>
              <Chip label={CLASS_ROSTERS[selectedClassKey]?.streamName} size="small" sx={{ fontWeight: 700, bgcolor: '#e0e7ff', color: '#4338ca' }} />
            </Box>

            <Box sx={{ display: 'flex', gap: 1.5 }}>
              <Button
                size="small"
                variant="outlined"
                startIcon={<CheckCircleIcon />}
                onClick={handleMarkAllPresent}
                sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, color: '#16a34a', borderColor: '#86efac' }}
              >
                Mark All Present
              </Button>

              <Button
                size="small"
                variant="outlined"
                startIcon={<PersonAddIcon />}
                onClick={() => setManualAddOpen(true)}
                sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, color: '#4f46e5', borderColor: '#c7d2fe' }}
              >
                Manually Add Student
              </Button>

              <Button
                size="small"
                variant="contained"
                startIcon={<EventAvailableIcon />}
                onClick={handleSaveAttendance}
                sx={{ borderRadius: 2, bgcolor: '#0f172a', fontWeight: 700, textTransform: 'none' }}
              >
                Save Attendance Sheet
              </Button>
            </Box>
          </Box>

          {savedSuccess && (
            <Alert severity="success" sx={{ mb: 2.5, borderRadius: 2 }}>
              Practical session attendance and breakage records saved successfully! Data synced to Student and Office Admin Clearance modules.
            </Alert>
          )}

          {/* Attendance Table */}
          <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <Table>
              <TableHead sx={{ bgcolor: '#f8fafc' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 800 }}>Roll No</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Student Name</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Workstation / Apparatus</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Attendance Status</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Damage / Breakage Penalty</TableCell>
                  <TableCell sx={{ fontWeight: 800, textAlign: 'right' }}>Log Penalty</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {attendees.map(a => (
                  <TableRow key={a.id} hover sx={{ bgcolor: a.status === 'ABSENT' ? '#fff5f5' : a.isManualAdd ? '#f0fdf4' : 'inherit' }}>
                    <TableCell sx={{ fontWeight: 800, color: '#0284c7' }}>
                      {a.rollNo}
                      {a.isManualAdd && (
                        <Chip label="Walk-in / Repeat" size="small" sx={{ ml: 1, height: 18, fontSize: '0.6rem', bgcolor: '#bbf7d0', color: '#166534', fontWeight: 800 }} />
                      )}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: '#6366f1', fontSize: '0.75rem', fontWeight: 700 }}>
                          {a.name.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                            {a.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {a.admissionNo} {a.manualReason ? `• ${a.manualReason}` : ''}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" sx={{ fontWeight: 600, color: '#475569' }}>
                        {a.workstationNo}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Button
                          size="small"
                          variant={a.status === 'PRESENT' ? 'contained' : 'outlined'}
                          color="success"
                          onClick={() => handleStatusChange(a.id, 'PRESENT')}
                          sx={{ minWidth: 70, py: 0.25, fontSize: '0.7rem', fontWeight: 800, textTransform: 'none' }}
                        >
                          Present
                        </Button>
                        <Button
                          size="small"
                          variant={a.status === 'ABSENT' ? 'contained' : 'outlined'}
                          color="error"
                          onClick={() => handleStatusChange(a.id, 'ABSENT')}
                          sx={{ minWidth: 70, py: 0.25, fontSize: '0.7rem', fontWeight: 800, textTransform: 'none' }}
                        >
                          Absent
                        </Button>
                        <Button
                          size="small"
                          variant={a.status === 'LATE' ? 'contained' : 'outlined'}
                          color="warning"
                          onClick={() => handleStatusChange(a.id, 'LATE')}
                          sx={{ minWidth: 60, py: 0.25, fontSize: '0.7rem', fontWeight: 800, textTransform: 'none' }}
                        >
                          Late
                        </Button>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {a.penalty ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip
                            label={`₹${a.penalty.amount} Fine (${a.penalty.itemDamaged})`}
                            size="small"
                            color="error"
                            onDelete={() => handleRemovePenalty(a.id)}
                            sx={{ fontWeight: 800 }}
                          />
                        </Box>
                      ) : (
                        <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                          No Damage Recorded
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell sx={{ textAlign: 'right' }}>
                      <Button
                        size="small"
                        startIcon={<WarningAmberIcon />}
                        onClick={() => handleOpenPenaltyModal(a)}
                        sx={{
                          textTransform: 'none',
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          color: a.penalty ? '#dc2626' : '#64748b',
                          bgcolor: a.penalty ? '#fee2e2' : '#f1f5f9',
                          borderRadius: 1.5,
                          '&:hover': { bgcolor: a.penalty ? '#fecaca' : '#e2e8f0' }
                        }}
                      >
                        {a.penalty ? 'Edit Penalty' : 'Add Penalty'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      {/* Empty State */}
      {attendees.length === 0 && (
        <Paper elevation={0} sx={{ p: 6, textAlign: 'center', borderRadius: 3.5, border: '1px dashed #cbd5e1', bgcolor: '#f8fafc' }}>
          <ScienceIcon sx={{ fontSize: 56, color: '#94a3b8', mb: 1.5 }} />
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#1e293b' }}>
            No class roster imported for this laboratory session yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 500, mx: 'auto', mb: 2.5 }}>
            Click "1-Click Import Class Students" above to automatically pull students from your selected Higher Secondary or Secondary stream with zero re-typing.
          </Typography>
          <Button
            variant="contained"
            startIcon={<DownloadDoneIcon />}
            onClick={handleImportClassRoster}
            sx={{ bgcolor: '#0284c7', fontWeight: 700, textTransform: 'none', px: 3, borderRadius: 2 }}
          >
            Import {CLASS_ROSTERS[selectedClassKey]?.streamName} Students
          </Button>
        </Paper>
      )}

      {/* MANUALLY ADD STUDENT MODAL */}
      <Dialog
        open={manualAddOpen}
        onClose={() => setManualAddOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, borderBottom: '1px solid #e2e8f0' }}>
          Manually Add Student to Lab Session
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
            Add a walk-in student, practical repeat candidate, or transferred student to this session roster.
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Student Full Name"
                placeholder="e.g. Rohith Kumar"
                value={manualStudent.name}
                onChange={e => setManualStudent({ ...manualStudent, name: e.target.value })}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Student Board Roll No"
                placeholder="e.g. 12-MC-99"
                value={manualStudent.rollNo}
                onChange={e => setManualStudent({ ...manualStudent, rollNo: e.target.value })}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Admission Number"
                placeholder="e.g. ADM-2026-199"
                value={manualStudent.admissionNo}
                onChange={e => setManualStudent({ ...manualStudent, admissionNo: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Allocated Workstation"
                value={manualStudent.workstationNo}
                onChange={e => setManualStudent({ ...manualStudent, workstationNo: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Reason for Manual Addition"
                value={manualStudent.manualReason}
                onChange={e => setManualStudent({ ...manualStudent, manualReason: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2, bgcolor: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
          <Button onClick={() => setManualAddOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddManualStudent} sx={{ bgcolor: '#0f172a' }}>
            Add to Session
          </Button>
        </DialogActions>
      </Dialog>

      {/* RECORD APPARATUS BREAKAGE / PENALTY MODAL */}
      <Dialog
        open={penaltyModalOpen}
        onClose={() => setPenaltyModalOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        {penaltyTargetStudent && (
          <>
            <DialogTitle sx={{ fontWeight: 800, borderBottom: '1px solid #e2e8f0' }}>
              Record Apparatus Damage / Penalty • {penaltyTargetStudent.name} ({penaltyTargetStudent.rollNo})
            </DialogTitle>
            <DialogContent sx={{ p: 3 }}>
              <Alert severity="warning" sx={{ mb: 2.5, borderRadius: 2 }}>
                Damages logged here will automatically reflect in the student's profile and Office Admin "No Due" Clearance Desk!
              </Alert>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    select
                    fullWidth
                    label="Damaged Apparatus / Equipment"
                    value={penaltyForm.itemDamaged}
                    onChange={e => setPenaltyForm({ ...penaltyForm, itemDamaged: e.target.value })}
                  >
                    <MenuItem value="Burette 50ml (Borosilicate Class A)">Burette 50ml (Borosilicate Class A) — ₹250</MenuItem>
                    <MenuItem value="Pipette 25ml Graduated">Pipette 25ml Graduated — ₹180</MenuItem>
                    <MenuItem value="Optical Convex Lens (Focal length 15cm)">Optical Convex Lens (15cm) — ₹350</MenuItem>
                    <MenuItem value="Glass Prism 60 Degrees">Equilateral Glass Prism — ₹200</MenuItem>
                    <MenuItem value="Digital Multimeter Probe">Digital Multimeter Probe Set — ₹300</MenuItem>
                    <MenuItem value="Microscope Slide Set & Cover Slips">Microscope Slide Box & Specimen Set — ₹280</MenuItem>
                    <MenuItem value="Computer Keyboard USB">Computer Keyboard USB — ₹450</MenuItem>
                    <MenuItem value="Chemical Reagent Spillage / Contamination">Chemical Reagent Spillage / Contamination — ₹150</MenuItem>
                  </TextField>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    type="number"
                    fullWidth
                    label="Penalty Amount (₹)"
                    value={penaltyForm.amount}
                    onChange={e => setPenaltyForm({ ...penaltyForm, amount: Number(e.target.value) })}
                    slotProps={{
                      input: {
                        startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                      }
                    }}
                    required
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    select
                    fullWidth
                    label="Settlement Channel"
                    value={penaltyForm.billingStatus}
                    onChange={e => setPenaltyForm({ ...penaltyForm, billingStatus: e.target.value as any })}
                  >
                    <MenuItem value="BILLED_TO_OFFICE">Bill to Office Admin No-Due Desk</MenuItem>
                    <MenuItem value="PAID_AT_DESK">Paid Instantly at Lab Desk</MenuItem>
                  </TextField>
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Incident Remarks & Damage Assessment"
                    value={penaltyForm.remarks}
                    onChange={e => setPenaltyForm({ ...penaltyForm, remarks: e.target.value })}
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 2, bgcolor: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
              <Button onClick={() => setPenaltyModalOpen(false)}>Cancel</Button>
              <Button variant="contained" color="error" onClick={handleSavePenalty} sx={{ fontWeight: 700 }}>
                Log Damage Fine
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default LabSessionAttendanceDesk;
