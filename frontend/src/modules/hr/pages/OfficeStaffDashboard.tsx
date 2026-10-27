import { useState, useEffect } from 'react';
import { 
  Box, Typography, Grid, Card, CardContent, Paper, 
  CircularProgress, Alert, Button, Divider 
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import BadgeIcon from '@mui/icons-material/Badge';
import ContactMailIcon from '@mui/icons-material/ContactMail';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import PaymentIcon from '@mui/icons-material/Payment';
import api from '../../../core/api/axios';
import { useNavigate } from 'react-router-dom';

export default function OfficeStaffDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get('/staff-portal/office-dashboard');
        setStats(response.data.data);
      } catch (err: any) {
        console.error('Failed to load office dashboard:', err);
        setError('Failed to load office dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error" variant="filled">{error}</Alert>
        <Button variant="outlined" sx={{ mt: 2 }} onClick={() => window.location.reload()}>Retry</Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4, maxWidth: 1400, mx: 'auto' }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 1 }}>
            <DashboardIcon fontSize="large" color="primary" /> Office Dashboard
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" sx={{ mt: 0.5 }}>
            Overview of today's front-office operations and admission archives.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button
            variant="contained"
            onClick={() => navigate('/office/documents')}
            sx={{ borderRadius: 2.5, textTransform: 'none', fontWeight: 700, bgcolor: '#0284c7', '&:hover': { bgcolor: '#0369a1' } }}
          >
            📁 Student Documents & Archives
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, '&:hover': { bgcolor: 'primary.50' } }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <PersonAddIcon sx={{ color: 'primary.main', fontSize: 28 }} />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>Admissions</Typography>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 800, mb: 1, color: 'primary.main' }}>
                {stats?.todayAdmissions || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">Admissions processed today</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, '&:hover': { bgcolor: 'info.50' } }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <BadgeIcon sx={{ color: 'info.main', fontSize: 28 }} />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>Visitors</Typography>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 800, mb: 1, color: 'info.main' }}>
                {stats?.todayVisitors || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">Checked-in visitors today</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, '&:hover': { bgcolor: 'warning.50' } }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <ContactMailIcon sx={{ color: 'warning.main', fontSize: 28 }} />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>Enquiries</Typography>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 800, mb: 1, color: 'warning.main' }}>
                {stats?.recentEnquiries || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">New enquiries pending</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', height: '100%' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <EventAvailableIcon color="secondary" /> Appointments
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{stats?.upcomingAppointments || 0} Upcoming</Typography>
                <Typography variant="caption" color="text.secondary">Scheduled for today</Typography>
              </Box>
              <Button variant="outlined" size="small" onClick={() => navigate('/office/appointments')}>View Schedule</Button>
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', height: '100%' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <PaymentIcon color="error" /> Pending Follow-ups
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{stats?.pendingFeeFollowUps || 0} Fee Reminders</Typography>
                <Typography variant="caption" color="text.secondary">Requires attention</Typography>
              </Box>
              <Button variant="outlined" size="small" color="error" onClick={() => navigate('/office/fees')}>Action Needed</Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
