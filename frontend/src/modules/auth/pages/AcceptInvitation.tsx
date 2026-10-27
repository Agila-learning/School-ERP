// @ts-nocheck
import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Paper, CircularProgress, Alert } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const AcceptInvitation: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      await axios.post('http://localhost:3000/api/v1/auth/accept-invitation', {
        token,
        firstName: formData.firstName,
        lastName: formData.lastName,
        password: formData.password
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to accept invitation.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
        <Paper sx={{ p: 4, maxWidth: 400, textAlign: 'center' }}>
          <Typography variant="h5" color="success.main" mb={2}>Account Created!</Typography>
          <Typography variant="body1" mb={3}>Your account has been successfully set up.</Typography>
          <Button variant="contained" fullWidth onClick={() => navigate('/login')}>
            Go to Login
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
      <Paper sx={{ p: 4, maxWidth: 450, width: '100%' }}>
        <Typography variant="h5" fontWeight="bold" mb={1} textAlign="center">
          Accept Invitation
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={4} textAlign="center">
          Please complete your profile to set up your account.
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <TextField label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} required fullWidth />
            <TextField label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} required fullWidth />
          </Box>
          <TextField label="Create Password" name="password" type="password" value={formData.password} onChange={handleChange} required fullWidth sx={{ mb: 3 }} />
          <TextField label="Confirm Password" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} required fullWidth sx={{ mb: 4 }} />

          <Button type="submit" variant="contained" fullWidth size="large" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Create Account'}
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default AcceptInvitation;
