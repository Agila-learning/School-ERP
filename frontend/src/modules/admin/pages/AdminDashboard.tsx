import React, { useEffect, useState } from 'react';
import { Box, Grid, Alert, Button, Card, CardContent, Typography } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import SchoolIcon from '@mui/icons-material/School';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import RefreshIcon from '@mui/icons-material/Refresh';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import SecurityIcon from '@mui/icons-material/Security';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import ScienceIcon from '@mui/icons-material/Science';
import StarsIcon from '@mui/icons-material/Stars';
import FolderSpecialIcon from '@mui/icons-material/FolderSpecial';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/hooks/useAuth';
import PageHeader from '../../../core/components/PageHeader';

// API Hooks & Data Interfaces
import { 
  getDashboardSummary, 
  getAttendanceSummary, 
  getFeeSummary, 
  getUpcomingEvents, 
  getRecentActivities
} from '../api/adminDashboard.api';

import type {
  DashboardSummary,
  AttendanceSummary,
  FeeSummary,
  UpcomingEvent,
  RecentActivity
} from '../api/adminDashboard.api';

// Widgets
import KPICardWidget from '../components/KPICardWidget';
import AttendanceChartWidget from '../components/AttendanceChartWidget';
import FeeCollectionChartWidget from '../components/FeeCollectionChartWidget';
import UpcomingEventsWidget from '../components/UpcomingEventsWidget';
import RecentActivityWidget from '../components/RecentActivityWidget';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Widget States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [attendance, setAttendance] = useState<AttendanceSummary | null>(null);
  const [fees, setFees] = useState<FeeSummary | null>(null);
  const [events, setEvents] = useState<UpcomingEvent[]>([]);
  const [activities, setActivities] = useState<RecentActivity[]>([]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const ayId = undefined;
      const [sumData, attData, feeData, evtData, actData] = await Promise.all([
        getDashboardSummary(ayId),
        getAttendanceSummary(ayId),
        getFeeSummary(ayId),
        getUpcomingEvents(ayId),
        getRecentActivities(ayId)
      ]);

      setSummary(sumData);
      setAttendance(attData);
      setFees(feeData);
      setEvents(evtData);
      setActivities(actData);
    } catch (err) {
      setError('Failed to load dashboard data. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []); // Reload when component mounts

  return (
    <Box sx={{ p: 1 }}>
      <PageHeader 
        title={`Welcome back, ${user?.firstName}`}
        description={`Here's what's happening at your school today.`}
        breadcrumbs={[
          { label: 'Admin', href: '/admin/dashboard' },
          { label: 'Overview' }
        ]}
        primaryAction={
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              startIcon={<FolderSpecialIcon />}
              onClick={() => navigate('/admin/documents')}
              sx={{ bgcolor: '#0f172a', textTransform: 'none', fontWeight: 700, '&:hover': { bgcolor: '#1e293b' } }}
            >
              Document Vault & NOCs
            </Button>
            <Button 
              variant="outlined" 
              startIcon={<RefreshIcon />} 
              onClick={fetchDashboardData}
              disabled={loading}
              sx={{ textTransform: 'none', fontWeight: 600 }}
            >
              Refresh
            </Button>
          </Box>
        }
      />

      {/* Global Error Boundary */}
      {error && (
        <Alert severity="error" sx={{ mb: 4 }} action={
          <Button color="inherit" size="small" onClick={fetchDashboardData}>
            RETRY
          </Button>
        }>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* KPI Row */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KPICardWidget 
            title="Total Students" 
            value={summary?.totalStudents ?? 0} 
            icon={PeopleIcon} 
            color="primary" 
            loading={loading} 
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KPICardWidget 
            title="Total Teachers" 
            value={summary?.totalTeachers ?? 0} 
            icon={SchoolIcon} 
            color="secondary" 
            loading={loading} 
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KPICardWidget 
            title="Total Staff" 
            value={summary?.totalStaff ?? 0} 
            icon={BusinessCenterIcon} 
            color="success" 
            loading={loading} 
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KPICardWidget 
            title="Active Vehicles" 
            value={summary?.activeVehicles ?? 0} 
            icon={DirectionsBusIcon} 
            color="warning" 
            loading={loading} 
          />
        </Grid>

        {/* Quick Operations & Department Hub */}
        <Grid size={{ xs: 12 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 1.5, color: '#1e293b' }}>
            Core Operations & Day-by-Day Scheduling
          </Typography>
          <Grid container spacing={2}>
            {/* Timetable Card */}
            <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
              <Card sx={{ 
                borderRadius: 2.5, 
                boxShadow: '0 2px 10px rgba(0,0,0,0.04)', 
                border: '1px solid #e2e8f0', 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 6px 16px rgba(99, 102, 241, 0.12)' }
              }}>
                <CardContent sx={{ p: 2, pb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Box sx={{ p: 1, bgcolor: '#eff6ff', borderRadius: 2, color: '#2563eb' }}>
                      <CalendarMonthIcon fontSize="small" />
                    </Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1e293b' }}>
                      Timetable
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5, minHeight: 36 }}>
                    Allocate staff, subjects, and periods day-by-day (Mon-Sat, P1-P8).
                  </Typography>
                  <Button 
                    variant="contained" 
                    fullWidth 
                    size="small" 
                    endIcon={<ArrowForwardIcon fontSize="small" />}
                    onClick={() => navigate('/timetable/editor')}
                    sx={{ textTransform: 'none', borderRadius: 1.5, fontWeight: 700, bgcolor: '#2563eb' }}
                  >
                    Allocate Staff
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            {/* Student 360 Hub Card */}
            <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
              <Card sx={{ 
                borderRadius: 2.5, 
                boxShadow: '0 2px 10px rgba(0,0,0,0.04)', 
                border: '1px solid #e2e8f0', 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 6px 16px rgba(16, 185, 129, 0.12)' }
              }}>
                <CardContent sx={{ p: 2, pb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Box sx={{ p: 1, bgcolor: '#ecfdf5', borderRadius: 2, color: '#059669' }}>
                      <PeopleIcon fontSize="small" />
                    </Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1e293b' }}>
                      Student 360
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5, minHeight: 36 }}>
                    Homeworks, marks, sports, labs, teachers & parents.
                  </Typography>
                  <Button 
                    variant="contained" 
                    fullWidth 
                    size="small" 
                    endIcon={<ArrowForwardIcon fontSize="small" />}
                    onClick={() => navigate('/student-portal/dashboard')}
                    sx={{ textTransform: 'none', borderRadius: 1.5, fontWeight: 700, bgcolor: '#059669', '&:hover': { bgcolor: '#047857' } }}
                  >
                    Student Hub
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            {/* Campus Security Card */}
            <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
              <Card sx={{ 
                borderRadius: 2.5, 
                boxShadow: '0 2px 10px rgba(0,0,0,0.04)', 
                border: '1px solid #e2e8f0', 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 6px 16px rgba(16, 185, 129, 0.12)' }
              }}>
                <CardContent sx={{ p: 2, pb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Box sx={{ p: 1, bgcolor: '#ecfdf5', borderRadius: 2, color: '#059669' }}>
                      <SecurityIcon fontSize="small" />
                    </Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1e293b' }}>
                      Campus Security
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5, minHeight: 36 }}>
                    Live gate entry & exit, visitor passes, and lost & found custody.
                  </Typography>
                  <Button 
                    variant="contained" 
                    fullWidth 
                    size="small" 
                    endIcon={<ArrowForwardIcon fontSize="small" />}
                    onClick={() => navigate('/admin/security/dashboard')}
                    sx={{ textTransform: 'none', borderRadius: 1.5, fontWeight: 700, bgcolor: '#059669', '&:hover': { bgcolor: '#047857' } }}
                  >
                    Gate Entries
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            {/* Health & Medical Card */}
            <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
              <Card sx={{ 
                borderRadius: 2.5, 
                boxShadow: '0 2px 10px rgba(0,0,0,0.04)', 
                border: '1px solid #e2e8f0', 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 6px 16px rgba(225, 29, 72, 0.12)' }
              }}>
                <CardContent sx={{ p: 2, pb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Box sx={{ p: 1, bgcolor: '#fff1f2', borderRadius: 2, color: '#e11d48' }}>
                      <LocalHospitalIcon fontSize="small" />
                    </Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1e293b' }}>
                      Health & Medical
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5, minHeight: 36 }}>
                    Clinic desk visits, medications, screenings, and emergencies.
                  </Typography>
                  <Button 
                    variant="contained" 
                    fullWidth 
                    size="small" 
                    endIcon={<ArrowForwardIcon fontSize="small" />}
                    onClick={() => navigate('/health/dashboard')}
                    sx={{ textTransform: 'none', borderRadius: 1.5, fontWeight: 700, bgcolor: '#e11d48', '&:hover': { bgcolor: '#be123c' } }}
                  >
                    Clinic Desk
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            {/* Sports & Athletics Card */}
            <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
              <Card sx={{ 
                borderRadius: 2.5, 
                boxShadow: '0 2px 10px rgba(0,0,0,0.04)', 
                border: '1px solid #e2e8f0', 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 6px 16px rgba(217, 119, 6, 0.12)' }
              }}>
                <CardContent sx={{ p: 2, pb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Box sx={{ p: 1, bgcolor: '#fef3c7', borderRadius: 2, color: '#d97706' }}>
                      <EmojiEventsIcon fontSize="small" />
                    </Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1e293b' }}>
                      Sports & Athletics
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5, minHeight: 36 }}>
                    Manage teams, host tournaments, sports gear, and practice drills.
                  </Typography>
                  <Button 
                    variant="contained" 
                    fullWidth 
                    size="small" 
                    endIcon={<ArrowForwardIcon fontSize="small" />}
                    onClick={() => navigate('/sports/dashboard')}
                    sx={{ textTransform: 'none', borderRadius: 1.5, fontWeight: 700, bgcolor: '#d97706', '&:hover': { bgcolor: '#b45309' } }}
                  >
                    Sports Hub
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            {/* Laboratories Card */}
            <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
              <Card sx={{ 
                borderRadius: 2.5, 
                boxShadow: '0 2px 10px rgba(0,0,0,0.04)', 
                border: '1px solid #e2e8f0', 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 6px 16px rgba(124, 58, 237, 0.12)' }
              }}>
                <CardContent sx={{ p: 2, pb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Box sx={{ p: 1, bgcolor: '#f5f3ff', borderRadius: 2, color: '#7c3aed' }}>
                      <ScienceIcon fontSize="small" />
                    </Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1e293b' }}>
                      Laboratories
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5, minHeight: 36 }}>
                    Apparatus inventory, lab bookings, and science equipment.
                  </Typography>
                  <Button 
                    variant="contained" 
                    fullWidth 
                    size="small" 
                    endIcon={<ArrowForwardIcon fontSize="small" />}
                    onClick={() => navigate('/lab/dashboard')}
                    sx={{ textTransform: 'none', borderRadius: 1.5, fontWeight: 700, bgcolor: '#7c3aed', '&:hover': { bgcolor: '#6d28d9' } }}
                  >
                    Lab Hub
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            {/* Special Classes Card */}
            <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
              <Card sx={{ 
                borderRadius: 2.5, 
                boxShadow: '0 2px 10px rgba(0,0,0,0.04)', 
                border: '1px solid #e2e8f0', 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 6px 16px rgba(147, 51, 234, 0.16)' }
              }}>
                <CardContent sx={{ p: 2, pb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Box sx={{ p: 1, bgcolor: '#faf5ff', borderRadius: 2, color: '#9333ea' }}>
                      <StarsIcon fontSize="small" />
                    </Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1e293b' }}>
                      Special Classes
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5, minHeight: 36 }}>
                    Masterclasses, remedial sessions, practical workshops & revision tracks.
                  </Typography>
                  <Button 
                    variant="contained" 
                    fullWidth 
                    size="small" 
                    endIcon={<ArrowForwardIcon fontSize="small" />}
                    onClick={() => navigate('/academic/special-classes')}
                    sx={{ textTransform: 'none', borderRadius: 1.5, fontWeight: 700, bgcolor: '#9333ea', '&:hover': { bgcolor: '#7e22ce' } }}
                  >
                    Special Classes
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        {/* Charts Row */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <AttendanceChartWidget data={attendance} loading={loading} />
        </Grid>
        <Grid size={{ xs: 12, lg: 6 }}>
          <FeeCollectionChartWidget data={fees} loading={loading} />
        </Grid>

        {/* Info Row */}
        <Grid size={{ xs: 12, md: 6 }}>
          <UpcomingEventsWidget events={events} loading={loading} />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <RecentActivityWidget activities={activities} loading={loading} />
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard;
