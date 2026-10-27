import React from 'react';
import { Box, Typography, Card, CardContent, Grid, Button, Divider } from '@mui/material';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

const FacilityDashboard: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>Facility Management</Typography>
        <Button variant="contained" color="primary">Book Facility</Button>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ borderTop: 4, borderColor: 'primary.main', borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography color="text.secondary">Total Rooms & Labs</Typography>
                <MeetingRoomIcon color="primary" />
              </Box>
              <Typography variant="h3" sx={{ mt: 1 }}>142</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ borderTop: 4, borderColor: 'warning.main', borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography color="text.secondary">Active Bookings Today</Typography>
                <MeetingRoomIcon color="warning" />
              </Box>
              <Typography variant="h3" sx={{ mt: 1 }}>12</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ borderRadius: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <WarningAmberIcon color="error" sx={{ mr: 1 }} />
            <Typography variant="h6">Upcoming Safety Inspections</Typography>
          </Box>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="body2"><strong>Chemistry Lab 1</strong> - Fire Safety Inspection due in 3 days.</Typography>
          <Typography variant="body2" sx={{ mt: 1 }}><strong>Auditorium</strong> - HVAC Routine Maintenance due next week.</Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default FacilityDashboard;
