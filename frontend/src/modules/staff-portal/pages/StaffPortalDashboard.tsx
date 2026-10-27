import React, { useEffect, useState } from 'react';
import { 
  Box, Typography, Grid, Card, CardContent, Avatar, 
  Button, List, ListItem, ListItemAvatar, ListItemText,
  Divider, Chip, CircularProgress 
} from '@mui/material';
import { Link } from 'react-router-dom';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CampaignIcon from '@mui/icons-material/Campaign';
import PersonIcon from '@mui/icons-material/Person';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import api from '../../../core/api/axios';

import { getAcademicEvents } from '../../academic/api/academic.api';

const StaffPortalDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [res, evts] = await Promise.all([
          api.get('/staff-portal/dashboard'),
          getAcademicEvents().catch(() => [])
        ]);
        setDashboardData(res.data?.data);
        setEvents(evts.slice(0, 3));
      } catch (error) {
        console.error('Failed to fetch staff dashboard', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <Box sx={{ p: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const { staff, stats } = dashboardData || {};

  return (
    <Box sx={{ p: 4, backgroundColor: '#f4f6f8', minHeight: '100vh' }}>
      {/* Header Profile Section */}
      <Card sx={{ mb: 4, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', borderLeft: '6px solid #1976d2' }}>
        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 3, p: 3 }}>
          <Avatar src={staff?.photoUrl} sx={{ width: 80, height: 80, bgcolor: '#e3f2fd', color: '#1976d2' }}>
            <PersonIcon fontSize="large" />
          </Avatar>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a237e' }}>
              Welcome back, {staff?.preferredName || staff?.firstName}!
            </Typography>
            <Typography variant="subtitle1" color="textSecondary" sx={{ mt: 0.5 }}>
              Employee ID: {staff?.employeeIdNumber} | Designation: {staff?.designationId?.name || 'Teacher'}
            </Typography>
            <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
              <Chip label={`Status: ${staff?.status}`} color="success" size="small" />
              <Chip label="Academic Year 2026-2027" variant="outlined" size="small" />
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Grid container spacing={4}>
        {/* Quick Stats */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ height: '100%', borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Avatar sx={{ bgcolor: '#e8f5e9', color: '#2e7d32' }}><EventAvailableIcon /></Avatar>
                <Typography variant="h6" color="textSecondary">My Attendance</Typography>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>98%</Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>Present: 45 | Leave: 1</Typography>
              <Button component={Link} to="/leave/my-leave" fullWidth variant="outlined" sx={{ mt: 2, borderRadius: 2 }}>Apply Leave</Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ height: '100%', borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Avatar sx={{ bgcolor: '#fff3e0', color: '#f57c00' }}><AssignmentIcon /></Avatar>
                <Typography variant="h6" color="textSecondary">My Classes</Typography>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#f57c00' }}>
                {stats?.upcomingClasses || 0}
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>Active subject assignments</Typography>
              <Button component={Link} to="/timetable/teacher" fullWidth variant="outlined" color="warning" sx={{ mt: 2, borderRadius: 2 }}>View Timetable</Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ height: '100%', borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Avatar sx={{ bgcolor: '#e3f2fd', color: '#1976d2' }}><CheckCircleIcon /></Avatar>
                <Typography variant="h6" color="textSecondary">Pending Tasks</Typography>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                {stats?.pendingTasks || 0}
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>Payslips, Reimbursements, Advances</Typography>
              <Button component={Link} to="/staff-portal/finance" fullWidth variant="outlined" color="primary" sx={{ mt: 2, borderRadius: 2 }}>Go to My Finance</Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Schedule & Announcements */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>Today's Classes</Typography>
              <List>
                {(!dashboardData?.assignments || dashboardData.assignments.length === 0) ? (
                  <Typography variant="body2" color="textSecondary" sx={{ py: 3, textAlign: 'center' }}>No classes scheduled for today.</Typography>
                ) : (
                  dashboardData.assignments.map((assignment: any, index: number) => (
                    <ListItem key={assignment._id || index} sx={{ bgcolor: index % 2 === 0 ? '#f8f9fa' : '#fff3e0', borderRadius: 2, mb: 1 }}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: index % 2 === 0 ? '#1976d2' : '#f57c00' }}>{index + 1}</Avatar>
                      </ListItemAvatar>
                      <ListItemText 
                        primary={`${assignment.subjectId?.name || 'Subject'} - ${assignment.classId?.name || 'Class'} ${assignment.sectionId?.name || 'Section'}`} 
                        secondary={assignment.isClassCoordinator ? "Class Coordinator" : "Subject Teacher"} 
                      />
                      <Button component={Link} to="/attendance/teacher" variant="contained" size="small" color={index % 2 === 0 ? "primary" : "warning"}>Mark Attendance</Button>
                    </ListItem>
                  ))
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.03)', height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <CampaignIcon color="error" />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Notice Board</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <List>
                {events.length === 0 ? (
                  <Typography variant="body2" color="textSecondary" sx={{ py: 3, textAlign: 'center' }}>No upcoming events.</Typography>
                ) : events.map((evt, idx) => (
                  <React.Fragment key={evt._id || idx}>
                    <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                      <ListItemText 
                        primary={evt.title || evt.name} 
                        secondary={new Date(evt.startDate).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })} 
                      />
                    </ListItem>
                    {idx < events.length - 1 && <Divider component="li" />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default StaffPortalDashboard;
