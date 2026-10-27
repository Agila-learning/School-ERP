import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';

const EventCalendar: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>School Event Calendar</Typography>
      <Card sx={{ borderRadius: 2, height: '70vh' }}>
        <CardContent sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {/* Typically this would render a FullCalendar or similar component */}
          <Typography variant="h6" color="text.secondary">Global Event Calendar Integration Point</Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default EventCalendar;
