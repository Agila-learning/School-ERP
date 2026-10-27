import React, { useState } from 'react';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Button, MenuItem, Select, FormControl, InputLabel, 
  Checkbox, TextField
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';

const ExamAttendanceManager: React.FC = () => {
  const [examId, setExamId] = useState('');
  const [roomId, setRoomId] = useState('');
  
  const [students, setStudents] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);

  React.useEffect(() => {
    // In a full implementation, load active exams from API
    setExams([]);
    setStudents([]);
  }, []);

  return (
    <Box sx={{ p: 3, maxWidth: 1000, mx: 'auto' }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>Exam Attendance Manager</Typography>
          <Typography variant="body2" color="text.secondary">Record student presence during examinations</Typography>
        </Box>
        <Button variant="contained" startIcon={<SaveIcon />}>Submit Attendance</Button>
      </Box>

      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Select Exam</InputLabel>
            <Select value={examId} label="Select Exam" onChange={(e) => setExamId(e.target.value)}>
              {exams.map(ex => <MenuItem key={ex.id} value={ex.id}>{ex.name}</MenuItem>)}
              <MenuItem value="1">Mid-Term: Mathematics (Grade 10)</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth size="small">
            <InputLabel>Select Room</InputLabel>
            <Select value={roomId} label="Select Room" onChange={(e) => setRoomId(e.target.value)}>
              <MenuItem value="1">Main Exam Hall</MenuItem>
            </Select>
          </FormControl>
          <Button variant="outlined" sx={{ minWidth: 120 }}>Load List</Button>
        </Box>
      </Paper>

      <Paper variant="outlined">
        <TableContainer>
          <Table size="small">
            <TableHead sx={{ bgcolor: 'grey.50' }}>
              <TableRow>
                <TableCell padding="checkbox"><Checkbox /></TableCell>
                <TableCell>Roll No</TableCell>
                <TableCell>Student Name</TableCell>
                <TableCell>Attendance</TableCell>
                <TableCell>Remarks</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {students.map(s => (
                <TableRow key={s.id} hover>
                  <TableCell padding="checkbox"><Checkbox checked={s.status !== 'ABSENT'} /></TableCell>
                  <TableCell>{s.rollNo}</TableCell>
                  <TableCell sx={{ fontWeight: 'medium' }}>{s.name}</TableCell>
                  <TableCell>
                    <Select size="small" value={s.status} sx={{ minWidth: 120, height: 32 }}>
                      <MenuItem value="PRESENT">Present</MenuItem>
                      <MenuItem value="ABSENT">Absent</MenuItem>
                      <MenuItem value="LATE">Late</MenuItem>
                      <MenuItem value="DISQUALIFIED">Disqualified</MenuItem>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <TextField size="small" placeholder="Remarks if any" value={s.reason} fullWidth slotProps={{ htmlInput: { style: { padding: '8px' } } }} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default ExamAttendanceManager;
