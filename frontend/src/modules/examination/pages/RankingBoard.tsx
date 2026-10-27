import React, { useState, useEffect, useMemo } from 'react';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Chip, Select, MenuItem, FormControl, InputLabel, Grid, CircularProgress
} from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { getExams, getStudentResults } from '../api/examination.api';
import { getClasses } from '../../academic/api/academic.api';

const RankingBoard: React.FC = () => {
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

  useEffect(() => {
    if (selectedExam && selectedClass) {
      setLoading(true);
      getStudentResults({ examinationId: selectedExam, classId: selectedClass })
        .then(setResults)
        .catch(console.error)
        .finally(() => setLoading(false));
    } else {
      setResults([]);
    }
  }, [selectedExam, selectedClass]);

  const rankedResults = useMemo(() => {
    // Only show ranked students, sorted by rank
    return results
      .filter(r => r.rank && r.rank > 0)
      .sort((a, b) => a.rank - b.rank);
  }, [results]);

  return (
    <Box sx={{ p: 3, maxWidth: 900, mx: 'auto' }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>Ranking Board</Typography>
          <Typography variant="body2" color="text.secondary">View dynamic class and section rankings</Typography>
        </Box>
      </Box>

      <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small">
              <InputLabel>Examination</InputLabel>
              <Select label="Examination" value={selectedExam} onChange={e => setSelectedExam(e.target.value as string)}>
                {exams.map(ex => <MenuItem key={ex.id || ex._id} value={ex.id || ex._id}>{ex.name}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small">
              <InputLabel>Class</InputLabel>
              <Select label="Class" value={selectedClass} onChange={e => setSelectedClass(e.target.value as string)}>
                {classes.map(cls => <MenuItem key={cls.id || cls._id} value={cls.id || cls._id}>{cls.name}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      <Paper variant="outlined">
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: 'grey.50' }}>
              <TableRow>
                <TableCell>Rank</TableCell>
                <TableCell>Student Name</TableCell>
                <TableCell>Total Marks</TableCell>
                <TableCell>Percentage</TableCell>
                <TableCell>Grade</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} align="center"><CircularProgress size={24} /></TableCell></TableRow>
              ) : rankedResults.length === 0 ? (
                <TableRow><TableCell colSpan={5} align="center">No rankings found for this selection.</TableCell></TableRow>
              ) : rankedResults.map(r => (
                <TableRow key={r._id} hover>
                  <TableCell>
                    {r.rank <= 3 ? (
                      <Chip 
                        icon={<EmojiEventsIcon />} 
                        label={`Rank ${r.rank}`} 
                        size="small" 
                        color={r.rank === 1 ? 'warning' : r.rank === 2 ? 'default' : 'primary'} 
                        sx={{ fontWeight: 'bold' }}
                      />
                    ) : (
                      <Typography variant="body2" sx={{ fontWeight: 'bold', pl: 2 }}>{r.rank}</Typography>
                    )}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>
                    {r.studentId?.firstName} {r.studentId?.lastName}
                    <Typography variant="caption" display="block" color="text.secondary">
                      {r.studentId?.admissionNumber}
                    </Typography>
                  </TableCell>
                  <TableCell>{r.totalObtained} / {r.totalMaxMarks}</TableCell>
                  <TableCell>{r.percentage}%</TableCell>
                  <TableCell><Chip label={r.overallGrade} size="small" color={r.isOverallPassed ? "success" : "error"} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default RankingBoard;
