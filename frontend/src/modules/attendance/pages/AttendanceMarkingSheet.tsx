import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Grid, Button, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Select, MenuItem, FormControl, InputLabel, Divider, Alert, CircularProgress,
  TextField
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ScheduleIcon from '@mui/icons-material/AccessTime';
import LockIcon from '@mui/icons-material/Lock';
import { getAcademicYears, getClasses, getSections, getEnrollments } from '../../academic/api/academic.api';
import type { AcademicYear, ClassSummary, SectionSummary, EnrollmentSummary } from '../../academic/api/academic.api';
import { getDailyAttendanceSheet, submitDailyAttendance } from '../api/attendance.api';
import type { AttendanceStatus } from '../api/attendance.api';

const statusColors: Record<AttendanceStatus, 'success' | 'error' | 'warning' | 'info' | 'default'> = {
  PRESENT: 'success',
  ABSENT: 'error',
  LATE: 'warning',
  HALF_DAY: 'info',
  EXCUSED: 'default',
  ON_LEAVE: 'info',
  HOLIDAY: 'default',
};

const AttendanceMarkingSheet: React.FC = () => {
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [classes, setClasses] = useState<ClassSummary[]>([]);
  const [sections, setSections] = useState<SectionSummary[]>([]);
  
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);

  const [students, setStudents] = useState<EnrollmentSummary[]>([]);
  const [entries, setEntries] = useState<Record<string, AttendanceStatus>>({});
  const [remarks, setRemarks] = useState<Record<string, string>>({});
  
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    Promise.all([getAcademicYears(), getClasses()]).then(([yearsData, classesData]) => {
      setAcademicYears(yearsData);
      setClasses(classesData);
      const activeYear = yearsData.find(y => y.status === 'active') || yearsData[0];
      if (activeYear) setSelectedYear(activeYear.id);
    }).catch(err => console.error('Failed to load initial data', err));
  }, []);

  useEffect(() => {
    if (selectedClass) {
      getSections(selectedClass).then(setSections).catch(console.error);
    } else {
      setSections([]);
    }
    setSelectedSection('');
  }, [selectedClass]);

  const loadStudentsAndAttendance = async () => {
    if (!selectedYear || !selectedClass || !selectedSection || !selectedDate) {
      setMessage({ type: 'error', text: 'Please select all filters before loading.' });
      return;
    }

    setLoading(true);
    setMessage(null);
    try {
      // 1. Fetch enrolled students
      const enrolled = await getEnrollments(selectedYear, selectedSection);
      setStudents(enrolled);

      // 2. Fetch existing attendance sheet for this date
      const sheet = await getDailyAttendanceSheet(selectedSection, selectedDate, selectedYear);
      
      const newEntries: Record<string, AttendanceStatus> = {};
      const newRemarks: Record<string, string> = {};
      
      if (sheet) {
        setIsLocked(sheet.isLocked);
        sheet.entries.forEach((entry: any) => {
          newEntries[entry.studentId] = entry.status;
          if (entry.remarks) newRemarks[entry.studentId] = entry.remarks;
        });
      } else {
        setIsLocked(false);
      }

      // Default unmarked active students to PRESENT if no sheet exists yet
      if (!sheet) {
        enrolled.forEach(enr => {
          newEntries[enr.studentId._id] = 'PRESENT';
        });
      } else {
        // Ensure all enrolled students have at least a fallback if sheet was partial
        enrolled.forEach(enr => {
          if (!newEntries[enr.studentId._id]) newEntries[enr.studentId._id] = 'PRESENT';
        });
      }

      setEntries(newEntries);
      setRemarks(newRemarks);

      if (enrolled.length === 0) {
        setMessage({ type: 'warning' as any, text: 'No students enrolled in this section.' });
      }

    } catch (error: any) {
      console.error(error);
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to load attendance data.' });
    } finally {
      setLoading(false);
    }
  };

  const markAll = (status: AttendanceStatus) => {
    if (isLocked) return;
    const newEntries = { ...entries };
    students.forEach(s => newEntries[s.studentId._id] = status);
    setEntries(newEntries);
  };

  const handleSave = async () => {
    setSubmitting(true);
    setMessage(null);
    try {
      const payload = {
        academicYearId: selectedYear,
        classId: selectedClass,
        sectionId: selectedSection,
        date: selectedDate,
        entries: students.map(s => ({
          studentId: s.studentId._id,
          status: entries[s.studentId._id] || 'PRESENT',
          remarks: remarks[s.studentId._id]
        }))
      };
      const res = await submitDailyAttendance(payload);
      setIsLocked(res.isLocked);
      setMessage({ type: 'success', text: 'Attendance submitted successfully!' });
    } catch (error: any) {
      console.error(error);
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to save attendance.' });
    } finally {
      setSubmitting(false);
    }
  };

  const presentCount = Object.values(entries).filter(s => s === 'PRESENT').length;
  const absentCount = Object.values(entries).filter(s => s === 'ABSENT').length;
  const lateCount = Object.values(entries).filter(s => s === 'LATE').length;

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1100, mx: 'auto' }}>
      <Typography variant="h4" sx={{ fontWeight: 800 }} gutterBottom>
        Attendance Marking Sheet
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Mark daily attendance for students.
      </Typography>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} sx={{ alignItems: "center" }}>
          <Grid size={{ xs: 12, sm: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Academic Year</InputLabel>
              <Select value={selectedYear} label="Academic Year" onChange={e => setSelectedYear(e.target.value)}>
                {academicYears.map(y => <MenuItem key={y.id} value={y.id}>{y.name}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Class</InputLabel>
              <Select value={selectedClass} label="Class" onChange={e => setSelectedClass(e.target.value)}>
                {classes.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Section</InputLabel>
              <Select value={selectedSection} label="Section" onChange={e => setSelectedSection(e.target.value)} disabled={!selectedClass}>
                {sections.map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 3 }}>
            <TextField 
              fullWidth 
              size="small" 
              type="date" 
              label="Date" 
              slotProps={{ inputLabel: { shrink: true } }}
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 2 }}>
            <Button variant="contained" fullWidth onClick={loadStudentsAndAttendance} disabled={loading}>
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Load'}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {message && <Alert severity={message.type} sx={{ mb: 2 }}>{message.text}</Alert>}

      {isLocked && (
        <Alert severity="warning" icon={<LockIcon />} sx={{ mb: 2 }}>
          This attendance sheet is locked. Modifications are not allowed. Please submit a correction request if changes are needed.
        </Alert>
      )}

      {/* Summary & Bulk Actions */}
      {students.length > 0 && (
        <Paper sx={{ p: 2, mb: 2, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Chip icon={<CheckCircleIcon />} label={`Present: ${presentCount}`} color="success" />
          <Chip icon={<CancelIcon />} label={`Absent: ${absentCount}`} color="error" />
          <Chip icon={<ScheduleIcon />} label={`Late: ${lateCount}`} color="warning" />
          <Divider orientation="vertical" flexItem />
          <Button size="small" variant="outlined" color="success" onClick={() => markAll('PRESENT')} disabled={isLocked}>Mark All Present</Button>
          <Button size="small" variant="outlined" color="error" onClick={() => markAll('ABSENT')} disabled={isLocked}>Mark All Absent</Button>
        </Paper>
      )}

      {/* Student Table */}
      {students.length > 0 && (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.100' }}>
                <TableCell>#</TableCell>
                <TableCell>Roll No / Adm No</TableCell>
                <TableCell>Student Name</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {students.map((enrollment, idx) => {
                const student = enrollment.studentId;
                const status = entries[student._id] || 'PRESENT';
                return (
                  <TableRow key={student._id} hover>
                    <TableCell>{idx + 1}</TableCell>
                    <TableCell>{student.rollNumber || student.admissionNumber}</TableCell>
                    <TableCell>{student.firstName} {student.lastName}</TableCell>
                    <TableCell>
                      <Chip
                        label={status}
                        color={statusColors[status] ?? 'default'}
                        size="small"
                        variant={status === 'PRESENT' ? 'filled' : 'outlined'}
                      />
                    </TableCell>
                    <TableCell>
                      <FormControl size="small" sx={{ minWidth: 130 }}>
                        <Select
                          value={status}
                          disabled={isLocked}
                          onChange={e => setEntries(prev => ({ ...prev, [student._id]: e.target.value as AttendanceStatus }))}
                        >
                          {(['PRESENT', 'ABSENT', 'LATE', 'HALF_DAY', 'EXCUSED', 'ON_LEAVE'] as AttendanceStatus[]).map(s => (
                            <MenuItem key={s} value={s}>{s}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {students.length > 0 && (
        <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleSave} 
            disabled={submitting || isLocked}
            disableElevation
          >
            {submitting ? <CircularProgress size={24} color="inherit" /> : 'Submit Attendance'}
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default AttendanceMarkingSheet;
