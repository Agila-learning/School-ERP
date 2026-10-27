import React from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutlined';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="md">
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '80vh',
        textAlign: 'center'
      }}>
        <ErrorOutlineIcon color="primary" sx={{ fontSize: 100, mb: 4, opacity: 0.8 }} />
        <Typography variant="h1" sx={{ fontWeight: 900, mb: 2, color: 'text.primary' }}>
          404
        </Typography>
        <Typography variant="h4" sx={{ mb: 3, color: 'text.secondary', fontWeight: 500 }}>
          Page Not Found
        </Typography>
        <Typography variant="body1" sx={{ mb: 6, color: 'text.secondary', maxWidth: 500 }}>
          The module or page you are looking for does not exist, has been moved, or you do not have permission to access it.
        </Typography>
        <Button 
          variant="contained" 
          size="large" 
          onClick={() => navigate(-1)}
          sx={{ borderRadius: 8, px: 4, py: 1.5, fontWeight: 600 }}
        >
          Go Back
        </Button>
      </Box>
    </Container>
  );
};

export default NotFoundPage;
