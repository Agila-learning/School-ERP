import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Grid, Card, CardContent, CardActionArea, useTheme, Avatar } from '@mui/material';
import DomainIcon from '@mui/icons-material/Domain';
import SchoolIcon from '@mui/icons-material/School';
import PeopleIcon from '@mui/icons-material/People';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import LocalLibraryIcon from '@mui/icons-material/LocalLibrary';
import HotelIcon from '@mui/icons-material/Hotel';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import HistoryEduIcon from '@mui/icons-material/HistoryEdu';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import PersonIcon from '@mui/icons-material/Person';

const modules = [
  { title: 'Organization', path: '/organization', icon: <DomainIcon />, color: '#1976d2', description: 'Manage branches, campuses, and global settings' },
  { title: 'Academic', path: '/academic', icon: <SchoolIcon />, color: '#9c27b0', description: 'Curriculum, classes, subjects, and academic years' },
  { title: 'Admissions', path: '/admission/review', icon: <HowToRegIcon />, color: '#ed6c02', description: 'Track applications, interviews, and enrollment' },
  { title: 'Students', path: '/students/dashboard', icon: <PeopleIcon />, color: '#2e7d32', description: 'Student directory, lifecycles, and profiles' },
  { title: 'Parents (Admin)', path: '/students/parents', icon: <PeopleIcon />, color: '#004d40', description: 'Parent management, invitations, and relations' },
  { title: 'Parent Portal', path: '/parent-portal', icon: <PersonIcon />, color: '#1a237e', description: 'Simulate parent experience and view child dashboards' },
  { title: 'Staff Portal', path: '/staff-portal', icon: <BusinessCenterIcon />, color: '#bf360c', description: 'Teacher dashboard, attendance, and classes' },
  { title: 'HR & Payroll', path: '/hr/dashboard', icon: <BusinessCenterIcon />, color: '#d32f2f', description: 'Staff directory, payroll, recruitment, and exits' },
  { title: 'Attendance', path: '/attendance/students', icon: <EventAvailableIcon />, color: '#0288d1', description: 'Daily attendance, leave policies, and shifts' },
  { title: 'Timetable', path: '/timetable/class', icon: <CalendarMonthIcon />, color: '#673ab7', description: 'Class routines, teacher availability, and substitution' },
  { title: 'Finance', path: '/finance/parent-dashboard', icon: <AccountBalanceIcon />, color: '#388e3c', description: 'Fee structure, invoices, ledgers, and payments' },
  { title: 'Examinations', path: '/exam/dashboard', icon: <HistoryEduIcon />, color: '#fbc02d', description: 'Exam setup, marks entry, and report cards' },
  { title: 'Transport', path: '/transport/dashboard', icon: <DirectionsBusIcon />, color: '#f57c00', description: 'Fleet, routes, tracking, and assignments' },
  { title: 'Library', path: '/library/dashboard', icon: <LocalLibraryIcon />, color: '#795548', description: 'Catalogue, circulation, and member portal' },
  { title: 'Hostel', path: '/hostel/dashboard', icon: <HotelIcon />, color: '#009688', description: 'Rooms, allocations, mess, and outpasses' },
];

const MainDashboard: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  return (
    <Box sx={{ p: 4, minHeight: '100vh', backgroundColor: theme.palette.grey[50] }}>
      <Box sx={{ mb: 5, textAlign: 'center' }}>
        <Typography variant="h3" sx={{ fontWeight: 800, color: theme.palette.primary.main, mb: 1 }}>
          School ERP Control Center
        </Typography>
        <Typography variant="subtitle1" sx={{ color: theme.palette.text.secondary }}>
          Select a module to manage your institution's operations
        </Typography>
      </Box>

      <Grid container spacing={4} sx={{ maxWidth: 1400, mx: 'auto' }}>
        {modules.map((mod) => (
          <Grid key={mod.title} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <Card 
              elevation={0}
              sx={{ 
                height: '100%',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 4,
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 12px 24px rgba(0,0,0,0.1)',
                  borderColor: mod.color,
                }
              }}
            >
              <CardActionArea 
                onClick={() => navigate(mod.path)}
                sx={{ height: '100%', p: 2, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-start' }}
              >
                <Avatar 
                  sx={{ 
                    bgcolor: `${mod.color}15`, 
                    color: mod.color,
                    width: 56, 
                    height: 56,
                    mb: 2
                  }}
                >
                  {mod.icon}
                </Avatar>
                <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: 'text.primary' }}>
                    {mod.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.5 }}>
                    {mod.description}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default MainDashboard;
