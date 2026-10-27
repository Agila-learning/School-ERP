import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Alert, Container, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate API call for forgot password
    setTimeout(() => {
      setSubmitted(true);
    }, 1000);
  };

  return (
    <Container maxWidth="xs">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Paper elevation={3} sx={{ p: 4, width: '100%', borderRadius: 2 }}>
          <Typography component="h1" variant="h5" sx={{ mb: 2, fontWeight: 700, textAlign: 'center' }}>
            Forgot Password
          </Typography>
          
          {submitted ? (
            <Box>
              <Alert severity="success" sx={{ mb: 3 }}>
                If an account exists with this email, a password reset link has been sent.
              </Alert>
              <Button fullWidth variant="outlined" onClick={() => navigate('/login')}>
                Return to Login
              </Button>
            </Box>
          ) : (
            <form onSubmit={handleSubmit}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
                Enter your registered email address and we'll send you instructions to reset your password.
              </Typography>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={{ mb: 3 }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disableElevation
                sx={{ mb: 2 }}
              >
                Send Reset Link
              </Button>
              <Button
                fullWidth
                variant="text"
                onClick={() => navigate('/login')}
              >
                Back to Login
              </Button>
            </form>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default ForgotPassword;
