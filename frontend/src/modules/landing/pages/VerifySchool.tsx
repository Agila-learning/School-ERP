// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, CircularProgress, Button } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const VerifySchool: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const response = await axios.post('http://localhost:3000/api/v1/onboarding/verify-school', { token });
        setStatus('success');
        setMessage(response.data.message || 'Verification successful!');
      } catch (err: any) {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Verification failed. Token may be invalid or expired.');
      }
    };
    
    if (token) {
      verifyToken();
    } else {
      setStatus('error');
      setMessage('No verification token provided.');
    }
  }, [token]);

  return (
    <Box sx={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
      <Paper elevation={3} sx={{ p: 5, maxWidth: 500, width: '100%', textAlign: 'center', borderRadius: 4 }}>
        {status === 'verifying' && (
          <>
            <CircularProgress size={48} sx={{ mb: 3 }} />
            <Typography variant="h6">Verifying your school...</Typography>
            <Typography variant="body2" color="text.secondary">Please wait while we validate your token.</Typography>
          </>
        )}
        
        {status === 'success' && (
          <>
            <Typography variant="h3" mb={2}>🎉</Typography>
            <Typography variant="h5" color="success.main" mb={2}>{message}</Typography>
            <Typography variant="body1" color="text.secondary" mb={4}>
              Your school account is now fully active. You can log in and start setting up your system.
            </Typography>
            <Button variant="contained" size="large" onClick={() => navigate('/login')}>
              Proceed to Login
            </Button>
          </>
        )}

        {status === 'error' && (
          <>
            <Typography variant="h3" mb={2}>❌</Typography>
            <Typography variant="h5" color="error.main" mb={2}>Verification Failed</Typography>
            <Typography variant="body1" color="text.secondary" mb={4}>{message}</Typography>
            <Button variant="outlined" size="large" onClick={() => navigate('/register-school')}>
              Back to Registration
            </Button>
          </>
        )}
      </Paper>
    </Box>
  );
};

export default VerifySchool;
