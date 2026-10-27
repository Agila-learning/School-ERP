import React, { useEffect, useState } from 'react';
import { 
  Box, Typography, Grid, Card, CardContent, CircularProgress, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip 
} from '@mui/material';
import { getExams, getStudentResults } from '../api/examination.api';
import type { ExaminationMaster, StudentResult } from '../api/examination.api';

const ExamDashboard: React.FC = () => {
  const [exams, setExams] = useState<ExaminationMaster[]>([]);
  const [results, setResults] = useState<StudentResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getExams(),
      getStudentResults({})
    ]).then(([e, r]) => {
      setExams(e);
      setResults(r);
      setLoading(false);
    });
  }, []);

  if (loading) return <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress /></Box>;

  const activeExams = exams.filter(e => e.status !== 'ARCHIVED' && e.status !== 'CANCELLED');
  const publishedResults = results.filter(r => r.status === 'PUBLISHED');

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1400, mx: 'auto' }}>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>Examination Dashboard</Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Overview of current examination sessions, mark entry progress, and results.
      </Typography>

      <Grid container spacing={3} sx={{ mb: 5 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
            <CardContent>
              <Typography color="text.secondary" variant="overline" sx={{ fontWeight: 700 }}>Active Examinations</Typography>
              <Typography variant="h3" sx={{ fontWeight: 800, color: 'primary.main', mt: 1 }}>{activeExams.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
            <CardContent>
              <Typography color="text.secondary" variant="overline" sx={{ fontWeight: 700 }}>Published Results</Typography>
              <Typography variant="h3" sx={{ fontWeight: 800, color: 'success.main', mt: 1 }}>{publishedResults.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
            <CardContent>
              <Typography color="text.secondary" variant="overline" sx={{ fontWeight: 700 }}>Results Under Review</Typography>
              <Typography variant="h3" sx={{ fontWeight: 800, color: 'warning.main', mt: 1 }}>
                {results.filter(r => r.status === 'REVIEWED' || r.status === 'CALCULATED').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Recent Examinations</Typography>
      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: 'grey.50' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Exam Code</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Schedule</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {exams.map(exam => (
                <TableRow key={exam.id} hover>
                  <TableCell><Typography variant="body2" sx={{ fontWeight: 700 }}>{exam.code}</Typography></TableCell>
                  <TableCell>{exam.name}</TableCell>
                  <TableCell>{exam.examType}</TableCell>
                  <TableCell>{new Date(exam.startDate).toLocaleDateString()} to {new Date(exam.endDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Chip 
                      label={exam.status} 
                      size="small" 
                      color={exam.status === 'PUBLISHED' ? 'success' : exam.status === 'MARKS_ENTRY' ? 'warning' : 'primary'}
                      variant="outlined" 
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
};

export default ExamDashboard;
