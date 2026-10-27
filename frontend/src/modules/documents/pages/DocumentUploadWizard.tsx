import React from 'react';
import { Box, Typography, Paper, Stepper, Step, StepLabel, Button } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const steps = ['Select Category & Type', 'Upload File', 'Review & Submit'];

export default function DocumentUploadWizard() {
  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" fontWeight="600" mb={4}>Upload Document</Typography>
      
      <Paper sx={{ p: 4, borderRadius: 2 }}>
        <Stepper activeStep={1} alternativeLabel sx={{ mb: 6 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box sx={{ 
          border: '2px dashed', 
          borderColor: 'divider', 
          borderRadius: 2, 
          p: 6, 
          textAlign: 'center',
          bgcolor: 'background.default'
        }}>
          <CloudUploadIcon color="primary" sx={{ fontSize: 64, mb: 2 }} />
          <Typography variant="h6" mb={1}>Drag and drop your file here</Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Supports PDF, JPG, PNG up to 10MB
          </Typography>
          <Button variant="contained" disableElevation>Browse Files</Button>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button>Back</Button>
          <Button variant="contained" disableElevation>Next</Button>
        </Box>
      </Paper>
    </Box>
  );
}
