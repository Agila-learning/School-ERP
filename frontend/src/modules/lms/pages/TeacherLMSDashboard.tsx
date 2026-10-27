import { useEffect, useState } from 'react';
import { Box, Typography, Grid, Paper, CircularProgress, Alert, Button, Card, CardContent, Divider } from '@mui/material';
import { Assignment, Create, Feedback, Class } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getTeacherLMSDashboard } from '../api/lms.api';

const TeacherLMSDashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await getTeacherLMSDashboard();
      setData(res.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error" sx={{ m: 3 }}>{error}</Alert>;

  const statCards = [
    { title: 'Total Assignments', value: data?.totalAssignments || 0, icon: <Assignment color="primary" sx={{ fontSize: 40 }}/>, color: '#e3f2fd' },
    { title: 'Published', value: data?.publishedAssignments || 0, icon: <Class color="success" sx={{ fontSize: 40 }}/>, color: '#e8f5e9' },
    { title: 'Drafts', value: data?.draftAssignments || 0, icon: <Create color="warning" sx={{ fontSize: 40 }}/>, color: '#fff3e0' },
    { title: 'Pending Evaluations', value: data?.pendingEvaluations || 0, icon: <Feedback color="error" sx={{ fontSize: 40 }}/>, color: '#ffebee' }
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>LMS Dashboard</Typography>
        <Box>
          <Button variant="contained" startIcon={<Assignment />} onClick={() => navigate('/lms/assignments/new')} sx={{ mr: 2 }}>
            Create Assignment
          </Button>
          <Button variant="outlined" onClick={() => navigate('/lms/assignments')}>
            Manage Assignments
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {statCards.map((card, idx) => (
          <Grid key={idx} size={{ xs: 12, sm: 6, md: 3 }}>
            <Card elevation={2} sx={{ bgcolor: card.color }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', p: 3 }}>
                <Box sx={{ mr: 3 }}>
                  {card.icon}
                </Box>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{card.value}</Typography>
                  <Typography variant="body2" color="text.secondary">{card.title}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>Recent Submissions Needing Evaluation</Typography>
            <Divider sx={{ mb: 2 }} />
            {data?.pendingEvaluations === 0 ? (
              <Typography color="text.secondary">You're all caught up! No pending evaluations.</Typography>
            ) : (
              <Button variant="text" onClick={() => navigate('/lms/evaluations')}>View {data?.pendingEvaluations} Pending Evaluations</Button>
            )}
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>Quick Actions</Typography>
            <Divider sx={{ mb: 2 }} />
            <Box>
              <Button fullWidth variant="text" onClick={() => navigate('/lms/materials')} sx={{ justifyContent: 'flex-start', mb: 1 }}>
                Upload Learning Material
              </Button>
              <Button fullWidth variant="text" onClick={() => navigate('/academic/lesson-plans')} sx={{ justifyContent: 'flex-start', mb: 1 }}>
                Manage Lesson Plans
              </Button>
              <Button fullWidth variant="text" onClick={() => navigate('/lms/assignments')} sx={{ justifyContent: 'flex-start' }}>
                View Class Performance Reports
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TeacherLMSDashboard;
