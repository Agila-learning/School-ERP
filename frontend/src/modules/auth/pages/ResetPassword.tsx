import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Alert, Container, Paper } from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';

const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setError('');
    // Simulate API call for reset password using token
    setTimeout(() => {
      setSuccess(true);
    }, 1000);
  };

  if (!token) {
    return (
      <Container maxWidth="sm" sx={{ mt: 10 }}>
        <Alert severity="error">Invalid or missing reset token.</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xs">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Paper elevation={3} sx={{ p: 4, width: '100%', borderRadius: 2 }}>
          <Typography component="h1" variant="h5" sx={{ mb: 2, fontWeight: 700, textAlign: 'center' }}>
            Reset Password
          </Typography>
          
          {success ? (
            <Box>
              <Alert severity="success" sx={{ mb: 3 }}>
                Your password has been successfully reset.
              </Alert>
              <Button fullWidth variant="contained" onClick={() => navigate('/login')} disableElevation>
                Proceed to Login
              </Button>
            </Box>
          ) : (
            <form onSubmit={handleSubmit}>
              {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
              
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="New Password"
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                sx={{ mb: 2 }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="confirmPassword"
                label="Confirm New Password"
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                sx={{ mb: 3 }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disableElevation
              >
                Reset Password
              </Button>
            </form>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default ResetPassword;
