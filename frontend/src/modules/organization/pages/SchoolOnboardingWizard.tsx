import React, { useState } from 'react';
import { 
  Box, Stepper, Step, StepLabel, Button, Typography, 
  Paper, TextField, Grid,
  FormGroup, FormControlLabel, Switch
} from '@mui/material';
import api from '../../../core/api/axios';

const steps = [
  'School Information',
  'Address',
  'Academic Year',
  'Academic Structure',
  'Working Days',
  'Grading',
  'Admin User',
  'Modules',
  'Branding',
  'Complete Setup'
];

const SchoolOnboardingWizard: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    school: { name: '', code: '' },
    address: { street: '', city: '', state: '', country: '', postalCode: '' },
    admin: { name: '', email: '', password: '' },
    academicYear: { name: '', startDate: '', endDate: '' },
    modules: { library: true, transport: false, hostel: false }
  });

  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);

  const submitSetup = async () => {
    try {
      // Mock API call to submit massive payload or step-by-step
      await api.post('/tenant/onboard', {
        schoolName: formData.school.name,
        schoolCode: formData.school.code,
        address: formData.address,
        adminName: formData.admin.name,
        adminEmail: formData.admin.email,
        adminPassword: formData.admin.password
      });
      // Further calls for Academic Year, Config etc...
      alert('School successfully onboarded!');
    } catch (error) {
      console.error(error);
      alert('Failed to complete onboarding');
    }
  };

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth label="School Name" required value={formData.school.name} onChange={(e) => setFormData({...formData, school: {...formData.school, name: e.target.value}})} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth label="School Code (e.g. SCH001)" required value={formData.school.code} onChange={(e) => setFormData({...formData, school: {...formData.school, code: e.target.value}})} />
            </Grid>
          </Grid>
        );
      case 1:
        return (
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Street" value={formData.address.street} onChange={(e) => setFormData({...formData, address: {...formData.address, street: e.target.value}})}/></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="City" value={formData.address.city} onChange={(e) => setFormData({...formData, address: {...formData.address, city: e.target.value}})}/></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="State" value={formData.address.state} onChange={(e) => setFormData({...formData, address: {...formData.address, state: e.target.value}})}/></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Country" value={formData.address.country} onChange={(e) => setFormData({...formData, address: {...formData.address, country: e.target.value}})}/></Grid>
          </Grid>
        );
      case 6:
        return (
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField fullWidth label="Admin Name" required value={formData.admin.name} onChange={(e) => setFormData({...formData, admin: {...formData.admin, name: e.target.value}})} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField fullWidth label="Admin Email" required type="email" value={formData.admin.email} onChange={(e) => setFormData({...formData, admin: {...formData.admin, email: e.target.value}})} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField fullWidth label="Admin Password" required type="password" value={formData.admin.password} onChange={(e) => setFormData({...formData, admin: {...formData.admin, password: e.target.value}})} />
            </Grid>
          </Grid>
        );
      case 7:
        return (
          <FormGroup>
            <FormControlLabel control={<Switch checked={formData.modules.library} onChange={(e) => setFormData({...formData, modules: {...formData.modules, library: e.target.checked}})}/>} label="Library Management" />
            <FormControlLabel control={<Switch checked={formData.modules.transport} onChange={(e) => setFormData({...formData, modules: {...formData.modules, transport: e.target.checked}})}/>} label="Transport Management" />
            <FormControlLabel control={<Switch checked={formData.modules.hostel} onChange={(e) => setFormData({...formData, modules: {...formData.modules, hostel: e.target.checked}})}/>} label="Hostel Management" />
          </FormGroup>
        );
      case 9:
        return (
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="h5" gutterBottom>Review & Complete</Typography>
            <Typography variant="body1">You are about to finalize the setup for {formData.school.name || 'the school'}.</Typography>
          </Box>
        );
      default:
        return <Typography>Settings for {steps[step]} will be populated here.</Typography>;
    }
  };

  return (
    <Box sx={{ width: '100%', p: 4 }}>
      <Typography variant="h4" gutterBottom>School Onboarding Wizard</Typography>
      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      
      <Paper elevation={3} sx={{ p: 4 }}>
        {activeStep === steps.length ? (
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="h5" gutterBottom>Setup Complete!</Typography>
            <Button onClick={() => setActiveStep(0)}>Reset</Button>
          </Box>
        ) : (
          <React.Fragment>
            <Box sx={{ mt: 2, mb: 4 }}>
              {getStepContent(activeStep)}
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
              <Button color="inherit" disabled={activeStep === 0} onClick={handleBack} sx={{ mr: 1 }}>Back</Button>
              <Box sx={{ flex: '1 1 auto' }} />
              <Button variant="contained" onClick={activeStep === steps.length - 1 ? submitSetup : handleNext}>
                {activeStep === steps.length - 1 ? 'Finish Setup' : 'Next Step'}
              </Button>
            </Box>
          </React.Fragment>
        )}
      </Paper>
    </Box>
  );
};

export default SchoolOnboardingWizard;
