import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, CircularProgress, Button, Alert, TextField
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CheckIcon from '@mui/icons-material/Check';
import TodayIcon from '@mui/icons-material/Today';
import { useNavigate } from 'react-router-dom';
import { getMyProfile } from '../../hr/api/hr.api';
import { getPeriodAttendances } from '../api/attendance.api';
import type { StudentPeriodAttendance } from '../api/attendance.api';

const getStatusColor = (status: string): 'warning' | 'info' | 'success' | 'default' => {
  switch (status) {
    case 'DRAFT': return 'warning';
    case 'SUBMITTED': return 'info';
    case 'LOCKED': return 'success';
    default: return 'default';
  }
};

const TeacherAttendanceDesk: React.FC = () => {
  const [sessions, setSessions] = useState<StudentPeriodAttendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [teacherId, setTeacherId] = useState<string>('');
  const navigate = useNavigate();

  // Load logged-in teacher profile to get their employee ID
  useEffect(() => {
    getMyProfile().then(prof => {
      if (prof?._id) setTeacherId(prof._id);
    }).catch(console.error);
  }, []);

  // Reload sessions when teacher or date changes
  useEffect(() => {
    if (!teacherId) return;
    setLoading(true);
    setError(null);
    getPeriodAttendances({ teacherId, date: selectedDate })
      .then((data: StudentPeriodAttendance[]) => { setSessions(data); })
      .catch(() => setError("Failed to load today's sessions"))
      .finally(() => setLoading(false));
  }, [teacherId, selectedDate]);

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ background: 'linear-gradient(135deg, #059669 0%, #0d9488 100%)', borderRadius: 3, p: 4, mb: 4, color: 'white', position: 'relative', overflow: 'hidden' }}>
        <Box sx={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, bgcolor: 'rgba(255,255,255,0.08)', borderRadius: '50%' }} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>My Daily Classes</Typography>
            <Typography variant="body2" sx={{ opacity: 0.85, mt: 0.5 }}>Select a period below and mark student attendance</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: 'rgba(255,255,255,0.15)', borderRadius: 2, px: 2, py: 1 }}>
            <TodayIcon />
            <TextField
              type="date"
              size="small"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              sx={{ '& .MuiInputBase-input': { color: 'white', fontWeight: 700 }, '& .MuiOutlinedInput-notchedOutline': { border: 'none' } }}
            />
          </Box>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
        {loading ? (
          <Box sx={{ p: 6, textAlign: 'center' }}><CircularProgress /></Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: '#f8fafc' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, color: '#64748b' }}>Period</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#64748b' }}>Class & Section</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#64748b' }}>Subject</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#64748b' }}>Attendance Status</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#64748b' }} align="right">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sessions.map(session => (
                  <TableRow key={session.id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#6366f1' }}>{session.periodDefinitionId}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{session.classId} — {session.sectionId}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{session.subjectId}</Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Chip label={session.status} size="small" color={getStatusColor(session.status)} />
                        {session.isLocked && <Chip label="LOCKED" size="small" variant="outlined" />}
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        variant="contained"
                        disableElevation
                        size="small"
                        color={session.isLocked ? 'inherit' : 'success'}
                        startIcon={session.isLocked ? <CheckIcon /> : <PlayArrowIcon />}
                        onClick={() => navigate(`/attendance/mark`)}
                        sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }}
                      >
                        {session.isLocked ? 'View' : 'Mark Now'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {sessions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 4, color: '#94a3b8' }}>
                      No class sessions found for {selectedDate}. Try a different date.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Quick shortcut to generic marking sheet */}
      <Box sx={{ mt: 3, p: 3, bgcolor: 'white', borderRadius: 3, border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography sx={{ fontWeight: 700, color: '#1e293b' }}>Manual Attendance Sheet</Typography>
          <Typography variant="body2" color="text.secondary">Mark attendance for any class/section by date</Typography>
        </Box>
        <Button variant="contained" onClick={() => navigate('/attendance/mark')} sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }}>
          Open Marking Sheet
        </Button>
      </Box>
    </Box>
  );
};

export default TeacherAttendanceDesk;