import React, { useEffect, useState } from 'react';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Chip, CircularProgress, Button, ToggleButtonGroup, ToggleButton, TextField
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import SendIcon from '@mui/icons-material/Send';
import LockIcon from '@mui/icons-material/Lock';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useParams, useNavigate } from 'react-router-dom';
import { getPeriodAttendances, savePeriodAttendance } from '../api/attendance.api';
import type { StudentPeriodAttendance, StudentAttendanceEntry, AttendanceStatus } from '../api/attendance.api';
import EmptyState from '../../../core/components/EmptyState';

const AttendanceEntrySheet: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [session, setSession] = useState<StudentPeriodAttendance | null>(null);
  const [entries, setEntries] = useState<StudentAttendanceEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getPeriodAttendances({}).then((data: StudentPeriodAttendance[]) => {
      const found = data.find((s: StudentPeriodAttendance) => s.id === id);
      if (found) {
        setSession(found);
        setEntries(found.entries);
      }
      setLoading(false);
    });
  }, [id]);

  const handleStatusChange = (studentId: string, status: AttendanceStatus | null) => {
    if (session?.isLocked) return;
    if (!status) return; // Prevent deselecting
    setEntries(prev => prev.map(e => e.studentId === studentId ? { ...e, status } : e));
  };

  const handleRemarksChange = (studentId: string, remarks: string) => {
    if (session?.isLocked) return;
    setEntries(prev => prev.map(e => e.studentId === studentId ? { ...e, remarks } : e));
  };

  const handleMarkAll = (status: 'PRESENT' | 'ABSENT') => {
    if (session?.isLocked) return;
    setEntries(prev => prev.map(e => ({ ...e, status })));
  };

  const handleSave = async (submit: boolean) => {
    if (!session) return;
    try {
      setLoading(true);
      await savePeriodAttendance({
        ...session,
        entries,
        status: submit ? 'SUBMITTED' : 'DRAFT'
      });
      navigate('/attendance/teacher');
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  if (loading) return <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress /></Box>;
  if (!session) return <Box sx={{ p: 4 }}><Typography>Session not found</Typography></Box>;

  const isLocked = session.isLocked;

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: 'auto' }}>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/attendance/teacher')} sx={{ mb: 2 }}>
        Back to Classes
      </Button>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>Roll Call</Typography>
          <Typography variant="body1" color="text.secondary">
            {session.classId.replace('CLS-', 'Grade ')} {session.sectionId.replace('SEC-', '')} • {session.subjectId.replace('SUB-', '')} • Period {session.periodDefinitionId}
          </Typography>
        </Box>
        {isLocked ? (
          <Chip icon={<LockIcon />} label="LOCKED" color="error" variant="outlined" sx={{ fontWeight: 700 }} />
        ) : (
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button variant="outlined" onClick={() => handleMarkAll('PRESENT')}>Mark All Present</Button>
            <Button variant="contained" startIcon={<SaveIcon />} onClick={() => handleSave(false)} disableElevation color="inherit">Save Draft</Button>
            <Button variant="contained" startIcon={<SendIcon />} onClick={() => handleSave(true)} disableElevation color="primary">Submit</Button>
          </Box>
        )}
      </Box>

      {isLocked && (
        <Paper sx={{ p: 2, mb: 3, bgcolor: 'error.50', color: 'error.900', border: '1px solid', borderColor: 'error.200' }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>This attendance session is locked and has been submitted to the administration.</Typography>
          <Typography variant="caption">If you need to make corrections, please file an Attendance Correction Request.</Typography>
        </Paper>
      )}

      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: 'grey.50' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, width: 100 }}>Roll No</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Student Name</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Remarks</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {entries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} sx={{ p: 0 }}>
                    <EmptyState 
                      title="No students found"
                      description="No students are enrolled in this class for the current academic year."
                    />
                  </TableCell>
                </TableRow>
              ) : (
                entries.map(entry => (
                  <TableRow key={entry.studentId} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: 'monospace' }}>{entry.rollNumber}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{entry.studentName}</Typography>
                    </TableCell>
                    <TableCell>
                      <ToggleButtonGroup
                        value={entry.status}
                        exclusive
                        onChange={(_, newVal) => handleStatusChange(entry.studentId, newVal)}
                        size="small"
                        disabled={isLocked}
                      >
                        <ToggleButton value="PRESENT" color="success" sx={{ px: 2, fontWeight: 600 }}>P</ToggleButton>
                        <ToggleButton value="ABSENT" color="error" sx={{ px: 2, fontWeight: 600 }}>A</ToggleButton>
                        <ToggleButton value="LATE" color="warning" sx={{ px: 2, fontWeight: 600 }}>L</ToggleButton>
                        <ToggleButton value="EXCUSED" color="info" sx={{ px: 2, fontWeight: 600 }}>E</ToggleButton>
                      </ToggleButtonGroup>
                    </TableCell>
                    <TableCell>
                      <TextField 
                        size="small" 
                        placeholder="Optional remarks" 
                        fullWidth 
                        variant="standard"
                        value={entry.remarks || ''}
                        onChange={e => handleRemarksChange(entry.studentId, e.target.value)}
                        disabled={isLocked}
                        slotProps={{ htmlInput: { readOnly: isLocked } }}
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default AttendanceEntrySheet;
