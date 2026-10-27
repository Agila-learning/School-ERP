import { useState } from 'react';
import { Box, Typography, Paper, Grid, TextField, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, MenuItem, Chip, Avatar } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import AccessTimeFilledIcon from '@mui/icons-material/AccessTimeFilled';

export default function SubjectAttendanceDesk() {
  const [selectedClass, setSelectedClass] = useState('10');
  const [selectedSection, setSelectedSection] = useState('A');
  const [selectedSubject, setSelectedSubject] = useState('Mathematics');
  const [selectedDate, setSelectedDate] = useState('2026-09-02');
  const [period, setPeriod] = useState('2');
  
  const [students, setStudents] = useState([
    { id: 'STU001', name: 'Alice Smith', rollNo: '1', status: 'PRESENT' },
    { id: 'STU002', name: 'Bob Jones', rollNo: '2', status: 'ABSENT' },
    { id: 'STU003', name: 'Charlie Brown', rollNo: '3', status: 'LATE' },
    { id: 'STU004', name: 'Diana Prince', rollNo: '4', status: 'PRESENT' },
    { id: 'STU005', name: 'Evan Wright', rollNo: '5', status: 'PRESENT' },
  ]);

  const handleStatusChange = (id: string, status: string) => {
    setStudents(students.map(s => s.id === id ? { ...s, status } : s));
  };

  const handleSave = () => {
    alert('Subject attendance saved successfully!');
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 700, color: '#1e293b' }}>
        Subject-Wise Attendance Maintenance
      </Typography>

      <Paper sx={{ p: 3, mb: 4, borderRadius: 2, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
        <Grid container spacing={3} sx={{ alignItems: 'center' }}>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <TextField
              select
              fullWidth
              label="Class"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              <MenuItem value="10">Class 10</MenuItem>
              <MenuItem value="11">Class 11</MenuItem>
              <MenuItem value="12">Class 12</MenuItem>
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <TextField
              select
              fullWidth
              label="Section"
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
            >
              <MenuItem value="A">Section A</MenuItem>
              <MenuItem value="B">Section B</MenuItem>
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              select
              fullWidth
              label="Subject"
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
            >
              <MenuItem value="Mathematics">Mathematics</MenuItem>
              <MenuItem value="Physics">Physics</MenuItem>
              <MenuItem value="Chemistry">Chemistry</MenuItem>
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <TextField
              select
              fullWidth
              label="Period"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
            >
              <MenuItem value="1">Period 1 (08:00)</MenuItem>
              <MenuItem value="2">Period 2 (09:00)</MenuItem>
              <MenuItem value="3">Period 3 (10:00)</MenuItem>
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              type="date"
              fullWidth
              label="Date"
              slotProps={{ inputLabel: { shrink: true } }}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 0, borderRadius: 2, overflow: 'hidden', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
        <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#334155' }}>
            Marking Attendance: {selectedSubject} (Period {period})
          </Typography>
          <Button variant="contained" color="primary" onClick={handleSave} sx={{ textTransform: 'none', px: 4, py: 1, borderRadius: 2 }}>
            Save Attendance
          </Button>
        </Box>
        <TableContainer>
          <Table>
            <TableHead sx={{ backgroundColor: '#f1f5f9' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, py: 2 }}>Roll No.</TableCell>
                <TableCell sx={{ fontWeight: 600, py: 2 }}>Student Info</TableCell>
                <TableCell sx={{ fontWeight: 600, py: 2, textAlign: 'center' }}>Mark Status</TableCell>
                <TableCell sx={{ fontWeight: 600, py: 2, textAlign: 'right' }}>Current Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {students.map((student) => (
                <TableRow key={student.id} hover>
                  <TableCell>
                    <Typography sx={{ fontWeight: 500 }}>{student.rollNo}</Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: '#cbd5e1', fontSize: '0.875rem' }}>
                        {student.name.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography sx={{ fontWeight: 600, color: '#1e293b' }}>{student.name}</Typography>
                        <Typography variant="caption" sx={{ color: '#64748b' }}>{student.id}</Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                      <Button
                        variant={student.status === 'PRESENT' ? 'contained' : 'outlined'}
                        color="success"
                        size="small"
                        onClick={() => handleStatusChange(student.id, 'PRESENT')}
                        sx={{ minWidth: 40, p: 0.5 }}
                      >
                        <CheckCircleIcon fontSize="small" />
                      </Button>
                      <Button
                        variant={student.status === 'ABSENT' ? 'contained' : 'outlined'}
                        color="error"
                        size="small"
                        onClick={() => handleStatusChange(student.id, 'ABSENT')}
                        sx={{ minWidth: 40, p: 0.5 }}
                      >
                        <CancelIcon fontSize="small" />
                      </Button>
                      <Button
                        variant={student.status === 'LATE' ? 'contained' : 'outlined'}
                        color="warning"
                        size="small"
                        onClick={() => handleStatusChange(student.id, 'LATE')}
                        sx={{ minWidth: 40, p: 0.5 }}
                      >
                        <AccessTimeFilledIcon fontSize="small" />
                      </Button>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ textAlign: 'right' }}>
                    <Chip
                      label={student.status}
                      color={student.status === 'PRESENT' ? 'success' : student.status === 'ABSENT' ? 'error' : 'warning'}
                      size="small"
                      sx={{ fontWeight: 600, minWidth: 80 }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}
