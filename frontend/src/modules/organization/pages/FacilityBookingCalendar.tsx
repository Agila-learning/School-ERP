import React from 'react';
import { Box, Typography, Card, CardContent, Button } from '@mui/material';

const FacilityBookingCalendar: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>Facility Booking Calendar</Typography>
        <Button variant="contained">New Booking</Button>
      </Box>

      <Card sx={{ borderRadius: 2, height: '600px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CardContent sx={{ textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">Calendar Component (e.g., FullCalendar) will be rendered here.</Typography>
          <Typography variant="body2" color="text.secondary">This view prevents overlapping bookings and enforces capacity constraints.</Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default FacilityBookingCalendar;
