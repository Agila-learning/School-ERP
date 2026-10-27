import React from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import { useAuth } from '../../modules/auth/hooks/useAuth';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  const { activePortal, isAuthenticated, user, isParent, isStudent, isTeacher } = useAuth();

  const handleReturn = () => {
    if (isAuthenticated) {
      if (activePortal && activePortal.startsWith('/')) {
        navigate(activePortal);
      } else if (user?.dashboardRoute) {
        navigate(user.dashboardRoute);
      } else if (isParent) {
        navigate('/parent-portal');
      } else if (isStudent) {
        navigate('/student-portal/dashboard');
      } else if (isTeacher) {
        navigate('/teacher/dashboard');
      } else if (activePortal) {
        navigate(`/${activePortal}/dashboard`);
      } else {
        navigate('/admin/dashboard');
      }
    } else {
      navigate('/');
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <SearchOffIcon sx={{ fontSize: 80, color: 'text.disabled', mb: 3 }} />
        <Typography variant="h3" gutterBottom sx={{ fontWeight: 800 }}>
          404 Not Found
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
          The page you are looking for does not exist or has been moved.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="outlined" size="large" onClick={() => navigate(-1)} disableElevation sx={{ borderRadius: 2 }}>
            Go Back
          </Button>
          <Button variant="contained" size="large" onClick={handleReturn} disableElevation sx={{ borderRadius: 2 }}>
            Return to Dashboard
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default NotFoundPage;
