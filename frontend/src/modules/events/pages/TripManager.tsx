import React from 'react';
import { Box, Typography, Card, CardContent, Button, Stepper, Step, StepLabel } from '@mui/material';

const TripManager: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>Trip & Itinerary Manager</Typography>
        <Button variant="contained" color="secondary">Add Checkpoint</Button>
      </Box>

      <Card sx={{ borderRadius: 2 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 1 }}>Grade 10 National Museum Trip</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Safety Checkpoint Status Overview
          </Typography>

          <Stepper activeStep={2} alternativeLabel>
            <Step completed>
              <StepLabel>Depart School (9:00 AM)</StepLabel>
            </Step>
            <Step completed>
              <StepLabel>Arrive Museum (10:15 AM)</StepLabel>
            </Step>
            <Step>
              <StepLabel>Lunch Check-in (12:30 PM)</StepLabel>
            </Step>
            <Step>
              <StepLabel>Depart Museum (3:00 PM)</StepLabel>
            </Step>
            <Step>
              <StepLabel>Arrive School (4:30 PM)</StepLabel>
            </Step>
          </Stepper>

          <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button variant="outlined">View Passenger Manifest</Button>
            <Button variant="contained" color="primary">Mark Lunch Checkpoint Reached</Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default TripManager;
