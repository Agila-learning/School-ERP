import React, { useState, useEffect } from 'react';
import { 
  Box, Stepper, Step, StepLabel, Button, Typography, Paper, 
  FormControl, InputLabel, Select, MenuItem, Grid, TextField
} from '@mui/material';
import { submitApplication } from '../api/admission.api';
import { getClasses, getBranches, getAcademicYears } from '../../academic/api/academic.api';

const steps = ['Student Details', 'Parent Details', 'Address', 'Review & Submit'];

const AdmissionApplicationWizard: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  
  const [classes, setClasses] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [academicYears, setAcademicYears] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    branchId: '',
    academicYearId: '',
    applyingClassId: '',
    studentDetails: {
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      gender: '',
      nationality: 'US', // default
    },
    parentDetails: {
      fatherName: '',
      fatherMobile: '',
      motherName: '',
    },
    address: {
      current: '',
      permanent: '',
    }
  });

  useEffect(() => {
    getClasses().then(setClasses).catch(console.error);
    getBranches().then(setBranches).catch(console.error);
    getAcademicYears().then(setAcademicYears).catch(console.error);
  }, []);

  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);

  const handleSubmit = async () => {
    try {
      const payload = {
        ...formData,
        studentDetails: {
          ...formData.studentDetails,
          dateOfBirth: formData.studentDetails.dateOfBirth ? new Date(formData.studentDetails.dateOfBirth).toISOString() : new Date().toISOString()
        }
      };
      await submitApplication(payload);
      alert('Application Submitted Successfully!');
      setActiveStep(0);
      setFormData({
        branchId: '', academicYearId: '', applyingClassId: '',
        studentDetails: { firstName: '', lastName: '', dateOfBirth: '', gender: '', nationality: 'US' },
        parentDetails: { fatherName: '', fatherMobile: '', motherName: '' },
        address: { current: '', permanent: '' }
      });
    } catch (e: any) {
      alert('Failed to submit application: ' + (e.response?.data?.message || e.message));
    }
  };

  const getStepContent = (step: number) => {
    switch(step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 12 }}>
              <FormControl fullWidth>
                <InputLabel>Branch</InputLabel>
                <Select 
                  value={formData.branchId} 
                  label="Branch"
                  onChange={e => setFormData({ ...formData, branchId: e.target.value })}
                >
                  <MenuItem value=""><em>None</em></MenuItem>
                  {branches.map(b => <MenuItem key={b.id} value={b.id}>{b.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Applying Class</InputLabel>
                <Select 
                  value={formData.applyingClassId} 
                  label="Applying Class"
                  onChange={e => setFormData({ ...formData, applyingClassId: e.target.value })}
                >
                  {classes.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Academic Year</InputLabel>
                <Select 
                  value={formData.academicYearId} 
                  label="Academic Year"
                  onChange={e => setFormData({ ...formData, academicYearId: e.target.value })}
                >
                  {academicYears.map(ay => <MenuItem key={ay.id} value={ay.id}>{ay.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField 
                fullWidth label="First Name" 
                value={formData.studentDetails.firstName}
                onChange={e => setFormData({ ...formData, studentDetails: { ...formData.studentDetails, firstName: e.target.value } })}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField 
                fullWidth label="Last Name" 
                value={formData.studentDetails.lastName}
                onChange={e => setFormData({ ...formData, studentDetails: { ...formData.studentDetails, lastName: e.target.value } })}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField 
                fullWidth type="date" label="Date of Birth" slotProps={{ inputLabel: { shrink: true } }}
                value={formData.studentDetails.dateOfBirth}
                onChange={e => setFormData({ ...formData, studentDetails: { ...formData.studentDetails, dateOfBirth: e.target.value } })}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Gender</InputLabel>
                <Select 
                  label="Gender" 
                  value={formData.studentDetails.gender}
                  onChange={e => setFormData({ ...formData, studentDetails: { ...formData.studentDetails, gender: e.target.value } })}
                >
                  <MenuItem value="Male">Male</MenuItem>
                  <MenuItem value="Female">Female</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        );
      case 1:
        return (
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField 
                fullWidth label="Father's Name" 
                value={formData.parentDetails.fatherName}
                onChange={e => setFormData({ ...formData, parentDetails: { ...formData.parentDetails, fatherName: e.target.value } })}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField 
                fullWidth label="Father's Mobile" 
                value={formData.parentDetails.fatherMobile}
                onChange={e => setFormData({ ...formData, parentDetails: { ...formData.parentDetails, fatherMobile: e.target.value } })}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField 
                fullWidth label="Mother's Name" 
                value={formData.parentDetails.motherName}
                onChange={e => setFormData({ ...formData, parentDetails: { ...formData.parentDetails, motherName: e.target.value } })}
              />
            </Grid>
          </Grid>
        );
      case 2:
        return (
          <Grid container spacing={3}>
            <Grid size={12}>
              <TextField 
                fullWidth multiline rows={3} label="Current Address" 
                value={formData.address.current}
                onChange={e => setFormData({ ...formData, address: { ...formData.address, current: e.target.value } })}
              />
            </Grid>
            <Grid size={12}>
              <TextField 
                fullWidth multiline rows={3} label="Permanent Address" 
                value={formData.address.permanent}
                onChange={e => setFormData({ ...formData, address: { ...formData.address, permanent: e.target.value } })}
              />
            </Grid>
          </Grid>
        );
      case 3:
        return (
          <Typography>Review your application details. Make sure all information is correct before submitting.</Typography>
        );
      default: return null;
    }
  };

  return (
    <Box sx={{ p: 4, width: '100%', maxWidth: 1000, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>Admission Application Wizard</Typography>
      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
        {steps.map(label => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
      </Stepper>
      <Paper sx={{ p: 4, borderRadius: 2 }}>
        {getStepContent(activeStep)}
        <Box sx={{ display: 'flex', mt: 4 }}>
          <Button disabled={activeStep === 0} onClick={handleBack} sx={{ mr: 1 }}>Back</Button>
          <Box sx={{ flex: "1" }} />
          <Button variant="contained" onClick={activeStep === steps.length - 1 ? handleSubmit : handleNext}>
            {activeStep === steps.length - 1 ? 'Submit Application' : 'Next'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default AdmissionApplicationWizard;
