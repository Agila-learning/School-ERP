import React, { useEffect, useState } from 'react';
import { 
  Box, Typography, Paper, Grid, CircularProgress, Alert
} from '@mui/material';
import api from '../../../core/api/axios';

const StudentResultView: React.FC = () => {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await api.get('/examination/results/my-results');
        if (res.data.success) {
          setResults(res.data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, []);

  if (loading) return <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress /></Box>;

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1000, mx: 'auto' }}>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>My Results</Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        View your academic performance and published report cards.
      </Typography>

      {results.length === 0 ? (
        <Alert severity="info" sx={{ borderRadius: 2 }}>
          You do not have any published results at this time.
        </Alert>
      ) : (
        results.map(res => (
          <Paper key={res._id} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, mb: 4, overflow: 'hidden' }}>
            <Box sx={{ p: 3, bgcolor: 'primary.main', color: 'white' }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>{res.examinationId?.name || 'Examination'}</Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>Published on {res.updatedAt ? new Date(res.updatedAt).toLocaleDateString() : 'N/A'}</Typography>
            </Box>
            <Box sx={{ p: 3 }}>
              <Grid container spacing={3}>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Typography variant="body2" color="text.secondary">Total Marks</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800 }}>{res.totalObtained} <Typography component="span" variant="body2">/ {res.totalMaxMarks}</Typography></Typography>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Typography variant="body2" color="text.secondary">Percentage</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800 }}>{res.percentage?.toFixed(1)}%</Typography>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Typography variant="body2" color="text.secondary">Grade</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800 }}>{res.overallGrade}</Typography>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Typography variant="body2" color="text.secondary">Status</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: res.isOverallPassed ? 'success.main' : 'error.main' }}>
                    {res.isOverallPassed ? 'PASSED' : 'FAILED'}
                  </Typography>
                </Grid>
              </Grid>
              
              <Box sx={{ mt: 4 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>Subject Breakdown</Typography>
                <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2, bgcolor: 'grey.50', borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>Subject</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>Marks</Typography>
                  </Box>
                  {/* Fetching the SubjectResults linked to this StudentResult */}
                  {!res.subjects || res.subjects.length === 0 ? (
                    <Box sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary">Subject breakdown will be available on the printed report card.</Typography>
                    </Box>
                  ) : (
                    res.subjects.map((sub: any) => (
                      <Box key={sub._id} sx={{ display: 'flex', justifyContent: 'space-between', p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{sub.subjectName}</Typography>
                          <Typography variant="caption" color="text.secondary">Code: {sub.subjectCode}</Typography>
                        </Box>
                        <Box sx={{ textAlign: 'right' }}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>{sub.obtained} / {sub.max}</Typography>
                          <Typography variant="caption" sx={{ fontWeight: 'bold', color: sub.isPassed ? 'success.main' : 'error.main' }}>
                            Grade: {sub.grade}
                          </Typography>
                        </Box>
                      </Box>
                    ))
                  )}
                </Paper>
              </Box>
            </Box>
          </Paper>
        ))
      )}
    </Box>
  );
};

export default StudentResultView;
