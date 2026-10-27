import React, { useEffect, useState } from 'react';
import { 
  Box, Typography, Paper, Grid, Card, CardContent, CircularProgress,
  List, ListItem, ListItemText, Chip, Divider, Button, Alert
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined';
import SettingsIcon from '@mui/icons-material/Settings';
import { useNavigate } from 'react-router-dom';
import { getAcademicYears } from '../../academic/api/academic.api';
import { getStudentDashboardStats } from '../api/attendance.api';

const StudentAttendanceDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState<any>(null);
  const [activeYear, setActiveYear] = useState<any>(null);
  const navigate = useNavigate();

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const years = await getAcademicYears();
        const year = years.find((y: any) => y.status === 'active') || years[0];
        setActiveYear(year);

        if (year) {
          const dashboardStats = await getStudentDashboardStats(year.id, today);
          setStats(dashboardStats);
        }
      } catch (err: any) {
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [today]);

  if (loading) return <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress /></Box>;
  if (error) return <Box sx={{ p: 4 }}><Alert severity="error">{error}</Alert></Box>;

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: 'auto', bgcolor: '#f8f9fa', minHeight: '100vh' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>Attendance Dashboard</Typography>
          <Typography variant="body1" color="text.secondary">
            Today's attendance statistics and system health.
          </Typography>
        </Box>
        <Button 
          variant="outlined" 
          startIcon={<SettingsIcon />} 
          onClick={() => navigate('/attendance/policy')}
        >
          Policies
        </Button>
      </Box>

      {/* Date Banner */}
      <Paper elevation={0} sx={{ p: 3, mb: 4, borderRadius: 3, borderLeft: '6px solid', borderColor: 'primary.main', bgcolor: 'white' }}>
        <Grid container spacing={3} sx={{ alignItems: 'center' }}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Typography variant="overline" color="primary" sx={{ fontWeight: 700 }}>TODAY'S DATE</Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, mt: 0.5 }}>
              {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
            {activeYear && <Chip label={`Academic Year ${activeYear.name}`} color="default" sx={{ fontWeight: 600 }} />}
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={4}>
        {/* Quick Stats */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Card sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography color="text.secondary" variant="body2">Overall Attendance Rate</Typography>
                    <TrendingUpIcon color="success" />
                  </Box>
                  <Typography variant="h3" sx={{ fontWeight: 800, color: '#1976d2' }}>{stats?.overallRate}%</Typography>
                  <Typography variant="caption" color="text.secondary">Based on submitted classes</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Card sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                <CardContent>
                  <Typography color="text.secondary" variant="body2" gutterBottom>Students Present</Typography>
                  <Typography variant="h3" sx={{ fontWeight: 700, color: '#2e7d32' }}>{stats?.present}</Typography>
                  <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                    <Typography variant="caption" color="text.secondary">Absent: {stats?.absent}</Typography>
                    <Typography variant="caption" color="text.secondary">Late: {stats?.late}</Typography>
                    <Typography variant="caption" color="text.secondary">Excused: {stats?.excused}</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Submission Status */}
            <Grid size={{ xs: 12 }}>
              <Card sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <CheckCircleOutlineIcon color="primary" />
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>Roll Call Submissions</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Classes that have submitted their attendance for Period 1 today.
                  </Typography>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>Total Sheets Submitted: {stats?.submittedClasses}</Typography>
                  </Box>
                  <Box sx={{ width: '100%', height: 10, bgcolor: 'success.main', borderRadius: 5, overflow: 'hidden' }}>
                  </Box>
                  
                  <Box sx={{ mt: 3, p: 2, bgcolor: 'info.light', borderRadius: 2, color: 'info.dark' }}>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{stats?.submittedClasses} class(es) have submitted attendance today.</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        {/* Action Required Panel */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.03)', height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <WarningAmberIcon color="error" />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>Action Required</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              
              <Typography variant="overline" color="text.secondary">Correction Requests (1)</Typography>
              <List disablePadding sx={{ mb: 3 }}>
                <ListItem sx={{ px: 0, py: 1.5, alignItems: 'flex-start', cursor: 'pointer' }} onClick={() => navigate('/attendance/corrections')}>
                  <ListItemText 
                    primary={<Typography variant="body2" sx={{ fontWeight: 700 }}>Priya S (Grade 10A)</Typography>}
                    secondary={<Typography variant="caption" color="error.main">Absent → Excused Request</Typography>}
                  />
                  <Chip label="Review" size="small" color="primary" />
                </ListItem>
              </List>

              <Typography variant="overline" color="text.secondary">Low Attendance Alerts</Typography>
              <List disablePadding>
                <ListItem sx={{ px: 0, py: 1.5 }}>
                  <ListItemText 
                    primary={<Typography variant="body2" sx={{ fontWeight: 700 }}>Rahul M</Typography>}
                    secondary={<Typography variant="caption" color="text.secondary">Grade 10A</Typography>}
                  />
                  <Typography variant="body2" sx={{ fontWeight: 700, color: 'error.main' }}>69%</Typography>
                </ListItem>
                <ListItem sx={{ px: 0, py: 1.5 }}>
                  <ListItemText 
                    primary={<Typography variant="body2" sx={{ fontWeight: 700 }}>Sneha V</Typography>}
                    secondary={<Typography variant="caption" color="text.secondary">Grade 9B</Typography>}
                  />
                  <Typography variant="body2" sx={{ fontWeight: 700, color: 'warning.main' }}>73%</Typography>
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default StudentAttendanceDashboard;
