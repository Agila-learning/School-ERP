import React, { useEffect, useState } from 'react';
import { Box, Typography, Grid, Paper, CircularProgress, Alert, Card, CardContent, Button, Divider, Chip } from '@mui/material';
import { Assignment, CheckCircle, Warning, Timeline } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getStudentLMSDashboard, getAssignments } from '../api/lms.api';
import dayjs from 'dayjs';

const StudentLMSDashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [recentAssignments, setRecentAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [dashRes, assignRes] = await Promise.all([
        getStudentLMSDashboard(),
        getAssignments()
      ]);
      setData(dashRes.data.data);
      // Show next 5 upcoming assignments
      const upcoming = assignRes.data.data
        .filter((a: any) => new Date(a.dueDate) > new Date() && a.status === 'PUBLISHED')
        .slice(0, 5);
      setRecentAssignments(upcoming);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error" sx={{ m: 3 }}>{error}</Alert>;

  const statCards = [
    { title: 'Pending Work', value: data?.pendingSubmissions || 0, icon: <Warning color="warning" sx={{ fontSize: 40 }}/>, color: '#fff3e0' },
    { title: 'Submitted', value: data?.mySubmissions || 0, icon: <CheckCircle color="success" sx={{ fontSize: 40 }}/>, color: '#e8f5e9' },
    { title: 'Evaluated', value: data?.evaluatedSubmissions || 0, icon: <Timeline color="primary" sx={{ fontSize: 40 }}/>, color: '#e3f2fd' },
    { title: 'Active Assignments', value: data?.activeAssignments || 0, icon: <Assignment color="info" sx={{ fontSize: 40 }}/>, color: '#f3e5f5' }
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ fontWeight: "bold" }} mb={3}>My Learning Dashboard</Typography>
      
      <Grid container spacing={3}>
        {statCards.map((card, idx) => (
          <Grid key={idx} size={{ xs: 12, sm: 6, md: 3 }}>
            <Card elevation={2} sx={{ bgcolor: card.color }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', p: 3 }}>
                <Box sx={{ mr: 3 }}>{card.icon}</Box>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: "bold" }}>{card.value}</Typography>
                  <Typography variant="body2" color="text.secondary">{card.title}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper elevation={2} sx={{ p: 3, minHeight: 400 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: "bold" }}>Upcoming Deadlines</Typography>
              <Button onClick={() => navigate('/lms/student/assignments')}>View All</Button>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            {recentAssignments.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 5 }}>
                <CheckCircle sx={{ fontSize: 60, color: 'success.main', opacity: 0.5, mb: 2 }} />
                <Typography color="text.secondary">You have no upcoming assignments! Great job.</Typography>
              </Box>
            ) : (
              recentAssignments.map(assignment => (
                <Box key={assignment._id} sx={{ mb: 2, p: 2, border: '1px solid #eee', borderRadius: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography sx={{ fontWeight: "bold" }}>{assignment.title}</Typography>
                    <Typography variant="body2" color="text.secondary">{assignment.subjectId?.name} • Due: {dayjs(assignment.dueDate).format('DD MMM YYYY, hh:mm A')}</Typography>
                  </Box>
                  <Box>
                    <Chip size="small" label={assignment.type} sx={{ mr: 2 }} />
                    <Button variant="contained" size="small" onClick={() => navigate(`/lms/student/assignments/${assignment._id}`)}>Start</Button>
                  </Box>
                </Box>
              ))
            )}
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper elevation={2} sx={{ p: 3, minHeight: 400 }}>
            <Typography variant="h6" sx={{ fontWeight: "bold" }} gutterBottom>Recent Grades</Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ textAlign: 'center', py: 5 }}>
              <Timeline sx={{ fontSize: 60, color: 'primary.main', opacity: 0.5, mb: 2 }} />
              <Typography color="text.secondary">Go to your marks dashboard to view your recent evaluation history.</Typography>
              <Button sx={{ mt: 2 }} onClick={() => navigate('/student-portal/marks')}>View Grades</Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default StudentLMSDashboard;
