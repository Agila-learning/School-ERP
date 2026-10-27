import { useState, useEffect, useMemo } from 'react';
import { Box, Typography, Paper, Grid, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Avatar, CircularProgress, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import CampaignIcon from '@mui/icons-material/Campaign';
import { getExams, getStudentResults } from '../api/examination.api';
import { getClasses } from '../../academic/api/academic.api';

export default function ExamToppersBoard() {
  const [exams, setExams] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  
  const [selectedExam, setSelectedExam] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([getExams(), getClasses()]).then(([ex, cls]) => {
      setExams(ex);
      setClasses(cls);
    });
  }, []);

  const handleGenerate = () => {
    if (selectedExam && selectedClass) {
      setLoading(true);
      getStudentResults({ examinationId: selectedExam, classId: selectedClass })
        .then(setResults)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  };

  const toppers = useMemo(() => {
    return results
      .filter(r => r.rank && r.rank > 0)
      .sort((a, b) => a.rank - b.rank)
      .slice(0, 5); // top 5
  }, [results]);

  const handleAnnounce = () => {
    if (toppers.length === 0) return alert('No toppers to announce!');
    alert(`Announcing Top ${toppers.length} Toppers via Principal Announcer!`);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b' }}>
          Exam Toppers & Ranking Board
        </Typography>
        <Button 
          variant="contained" 
          color="secondary"
          startIcon={<CampaignIcon />} 
          onClick={handleAnnounce}
          disabled={toppers.length === 0}
          sx={{ textTransform: 'none', px: 3, borderRadius: 2, backgroundColor: '#8b5cf6', '&:hover': { backgroundColor: '#7c3aed' } }}
        >
          Broadcast Announcement
        </Button>
      </Box>

      <Paper sx={{ p: 3, mb: 4, borderRadius: 2, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
        <Grid container spacing={3} sx={{ alignItems: 'center' }}>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Examination</InputLabel>
              <Select label="Examination" value={selectedExam} onChange={e => setSelectedExam(e.target.value as string)}>
                {exams.map(ex => <MenuItem key={ex.id || ex._id} value={ex.id || ex._id}>{ex.name}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Class</InputLabel>
              <Select label="Class" value={selectedClass} onChange={e => setSelectedClass(e.target.value as string)}>
                {classes.map(cls => <MenuItem key={cls.id || cls._id} value={cls.id || cls._id}>{cls.name}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 12, md: 4 }}>
            <Button variant="outlined" fullWidth sx={{ py: 1.5, borderRadius: 2, textTransform: 'none', fontWeight: 600 }} onClick={handleGenerate} disabled={!selectedExam || !selectedClass || loading}>
              {loading ? 'Generating...' : 'Generate Ranks'}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 0, borderRadius: 2, overflow: 'hidden', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
        <Box sx={{ p: 3, borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#334155' }}>
            Top 5 Performers
          </Typography>
        </Box>
        <TableContainer>
          <Table>
            <TableHead sx={{ backgroundColor: '#f1f5f9' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, py: 2 }}>Rank</TableCell>
                <TableCell sx={{ fontWeight: 600, py: 2 }}>Student</TableCell>
                <TableCell sx={{ fontWeight: 600, py: 2 }}>Marks Obtained</TableCell>
                <TableCell sx={{ fontWeight: 600, py: 2 }}>Percentage</TableCell>
                <TableCell sx={{ fontWeight: 600, py: 2 }}>Grade</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} align="center"><CircularProgress size={24} sx={{ my: 4 }} /></TableCell></TableRow>
              ) : toppers.length === 0 ? (
                <TableRow><TableCell colSpan={5} align="center" sx={{ py: 4 }}>No toppers found for the selected criteria.</TableCell></TableRow>
              ) : toppers.map((student) => {
                const name = `${student.studentId?.firstName || ''} ${student.studentId?.lastName || ''}`.trim();
                const roll = student.studentId?.admissionNumber || student.studentId?.rollNumber || 'N/A';
                return (
                  <TableRow key={student._id} hover sx={{ backgroundColor: student.rank === 1 ? '#fffbeb' : student.rank === 2 ? '#f8fafc' : student.rank === 3 ? '#fdf4ff' : 'inherit' }}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {student.rank === 1 && <EmojiEventsIcon sx={{ color: '#fbbf24', mr: 1 }} />}
                        {student.rank === 2 && <EmojiEventsIcon sx={{ color: '#94a3b8', mr: 1 }} />}
                        {student.rank === 3 && <EmojiEventsIcon sx={{ color: '#b45309', mr: 1 }} />}
                        <Typography sx={{ fontWeight: 700, fontSize: '1.1rem', color: '#1e293b', ml: student.rank > 3 ? 4 : 0 }}>
                          #{student.rank}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ width: 36, height: 36, bgcolor: '#cbd5e1', fontWeight: 600, color: '#475569' }}>
                          {name.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography sx={{ fontWeight: 600, color: '#0f172a' }}>{name}</Typography>
                          <Typography variant="caption" sx={{ color: '#64748b' }}>{roll}</Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontWeight: 600, color: '#334155' }}>
                        {student.totalObtained} / {student.totalMaxMarks}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontWeight: 700, color: student.percentage > 95 ? '#10b981' : '#3b82f6' }}>
                        {student.percentage}%
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={student.overallGrade} size="small" color={student.isOverallPassed ? "primary" : "error"} sx={{ fontWeight: 600 }} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}
