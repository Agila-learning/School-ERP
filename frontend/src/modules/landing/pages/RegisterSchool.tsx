// @ts-nocheck
import React, { useState } from 'react';
import { 
  Box, Typography, TextField, Button, Stepper, Step, StepLabel, 
  Paper, MenuItem, Alert, CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const steps = ['School Information', 'Admin Details', 'Configuration', 'Agreement'];

const RegisterSchool: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    schoolName: '',
    schoolEmail: '',
    schoolPhone: '',
    adminFirstName: '',
    adminLastName: '',
    adminEmail: '',
    adminPassword: '',
    confirmPassword: '',
    timezone: 'UTC',
    currency: 'USD',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateStep = () => {
    if (activeStep === 0) {
      if (!formData.schoolName || !formData.schoolEmail || !formData.schoolPhone) return false;
    }
    if (activeStep === 1) {
      if (!formData.adminFirstName || !formData.adminLastName || !formData.adminEmail || !formData.adminPassword) return false;
      if (formData.adminPassword !== formData.confirmPassword) return false;
    }
    return true;
  };

  const handleNext = () => {
    if (!validateStep()) {
      setError('Please fill in all required fields correctly.');
      return;
    }
    setError(null);
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => setActiveStep((prev) => prev - 1);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);
      // Backend is at port 3000 by proxy or default. Adjust baseURL if needed.
      const response = await axios.post('http://localhost:3000/api/v1/onboarding/register-school', formData);
      setSuccess(response.data.message || 'School registered successfully!');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to register school.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', 
      display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 
    }}>
      <Paper elevation={4} sx={{ p: 5, maxWidth: 800, width: '100%', borderRadius: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" fontWeight="bold" color="primary">Start Your School</Typography>
          <Typography variant="body1" color="text.secondary">
            Join the modern School ERP platform in just a few minutes.
          </Typography>
        </Box>

        {success ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Alert severity="success" sx={{ mb: 4 }}>{success}</Alert>
            <Button variant="contained" onClick={() => navigate('/login')}>
              Return to Login
            </Button>
          </Box>
        ) : (
          <>
            <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 6 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            {error && <Alert severity="error" sx={{ mb: 4 }}>{error}</Alert>}

            <Box sx={{ minHeight: 300 }}>
              {activeStep === 0 && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <TextField label="School Name" name="schoolName" value={formData.schoolName} onChange={handleChange} required fullWidth />
                  <TextField label="School Email" name="schoolEmail" type="email" value={formData.schoolEmail} onChange={handleChange} required fullWidth />
                  <TextField label="School Phone" name="schoolPhone" value={formData.schoolPhone} onChange={handleChange} required fullWidth />
                </Box>
              )}

              {activeStep === 1 && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField label="Admin First Name" name="adminFirstName" value={formData.adminFirstName} onChange={handleChange} required fullWidth />
                    <TextField label="Admin Last Name" name="adminLastName" value={formData.adminLastName} onChange={handleChange} required fullWidth />
                  </Box>
                  <TextField label="Admin Email (Login ID)" name="adminEmail" type="email" value={formData.adminEmail} onChange={handleChange} required fullWidth />
                  <TextField label="Password" name="adminPassword" type="password" value={formData.adminPassword} onChange={handleChange} required fullWidth />
                  <TextField label="Confirm Password" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} required fullWidth />
                </Box>
              )}

              {activeStep === 2 && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <TextField select label="Timezone" name="timezone" value={formData.timezone} onChange={handleChange} fullWidth>
                    <MenuItem value="UTC">UTC</MenuItem>
                    <MenuItem value="Asia/Kolkata">Asia/Kolkata (IST)</MenuItem>
                    <MenuItem value="America/New_York">Eastern Time (EST)</MenuItem>
                  </TextField>
                  <TextField select label="Currency" name="currency" value={formData.currency} onChange={handleChange} fullWidth>
                    <MenuItem value="USD">USD ($)</MenuItem>
                    <MenuItem value="INR">INR (₹)</MenuItem>
                    <MenuItem value="EUR">EUR (€)</MenuItem>
                  </TextField>
                </Box>
              )}

              {activeStep === 3 && (
                <Box sx={{ py: 3, textAlign: 'center' }}>
                  <Typography variant="h6" mb={2}>Review & Submit</Typography>
                  <Typography variant="body2" color="text.secondary" mb={4}>
                    By clicking "Complete Registration", you agree to our Terms of Service and Privacy Policy. 
                    An email will be sent to <strong>{formData.adminEmail}</strong> with verification instructions.
                  </Typography>
                  <Button 
                    variant="contained" 
                    size="large" 
                    onClick={handleSubmit} 
                    disabled={loading}
                    sx={{ px: 5, py: 1.5, borderRadius: 2 }}
                  >
                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Complete Registration'}
                  </Button>
                </Box>
              )}
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button disabled={activeStep === 0 || loading} onClick={handleBack}>
                Back
              </Button>
              {activeStep < steps.length - 1 && (
                <Button variant="contained" onClick={handleNext}>
                  Next
                </Button>
              )}
            </Box>
          </>
        )}
      </Paper>
    </Box>
  );
};

export default RegisterSchool;
