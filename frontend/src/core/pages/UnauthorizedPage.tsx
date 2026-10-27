import React from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import LockPersonIcon from '@mui/icons-material/LockPerson';
import { useAuth } from '../../modules/auth/hooks/useAuth';

const UnauthorizedPage: React.FC = () => {
  const navigate = useNavigate();
  const { activePortal, isAuthenticated, user, isSuperAdmin, isAdmin, isParent, isStudent, isTeacher } = useAuth();

  const handleReturn = () => {
    if (isAuthenticated) {
      if (isSuperAdmin) {
        navigate('/super-admin/dashboard');
      } else if (activePortal && activePortal.startsWith('/')) {
        navigate(activePortal);
      } else if (user?.dashboardRoute) {
        navigate(user.dashboardRoute);
      } else if (isParent) {
        navigate('/parent-portal');
      } else if (isStudent) {
        navigate('/student-portal/dashboard');
      } else if (isTeacher) {
        navigate('/teacher/dashboard');
      } else if (isAdmin) {
        navigate('/admin/dashboard');
      } else if (activePortal) {
        navigate(`/${activePortal}/dashboard`);
      } else {
        navigate('/admin/dashboard');
      }
    } else {
      navigate('/login');
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <LockPersonIcon sx={{ fontSize: 80, color: 'error.main', mb: 3 }} />
        <Typography variant="h3" color="error.main" gutterBottom sx={{ fontWeight: 800 }}>
          403 Access Denied
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
          You do not have the required permissions to view this page. If you believe this is a mistake, please contact your system administrator.
        </Typography>
        <Button variant="contained" size="large" onClick={handleReturn} disableElevation>
          Return to Dashboard
        </Button>
      </Box>
    </Container>
  );
};

export default UnauthorizedPage;
