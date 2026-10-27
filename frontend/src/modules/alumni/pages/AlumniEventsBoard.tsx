import React from 'react';
import { 
  Box, Typography, Paper, Grid, Card, CardContent, Button, 
  Chip, Divider
} from '@mui/material';
import EventIcon from '@mui/icons-material/Event';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import GroupIcon from '@mui/icons-material/Group';

const AlumniEventsBoard: React.FC = () => {
  const upcomingEvents = [
    {
      id: 1,
      title: 'Class of 2016 10-Year Reunion',
      date: 'Oct 15, 2026',
      time: '6:00 PM - 10:00 PM',
      location: 'Grand Hotel Ballroom, City Center',
      type: 'Reunion',
      capacity: 300,
      registered: 245,
      status: 'Open',
      description: 'Join us to celebrate a decade of accomplishments with your fellow classmates from 2016.'
    },
    {
      id: 2,
      title: 'Tech Industry Networking Night',
      date: 'Nov 02, 2026',
      time: '7:00 PM - 9:00 PM',
      location: 'Online (Zoom)',
      type: 'Networking',
      capacity: 100,
      registered: 100,
      waitlist: 15,
      status: 'Waitlist',
      description: 'Connect with alumni working in Software, AI, and IT consulting.'
    }
  ];

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>Alumni Events</Typography>
          <Typography variant="body2" color="text.secondary">Discover and register for reunions, networking events, and career talks.</Typography>
        </Box>
        <Button variant="contained" color="primary" startIcon={<EventIcon />}>
          Host an Event
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>Upcoming Events</Typography>
          {upcomingEvents.map((event) => (
            <Card key={event.id} variant="outlined" sx={{ mb: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                      {event.title}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                      <Chip label={event.type} size="small" color="secondary" variant="outlined" />
                      {event.status === 'Waitlist' ? (
                        <Chip label="Waitlist Only" size="small" color="warning" />
                      ) : (
                        <Chip label="Registration Open" size="small" color="success" />
                      )}
                    </Box>
                  </Box>
                  <Box sx={{ textAlign: 'center', bgcolor: 'grey.100', p: 1, borderRadius: 1, minWidth: 80 }}>
                    <Typography variant="caption" sx={{ display: 'block', textTransform: 'uppercase', fontWeight: 'bold', color: 'error.main' }}>
                      {event.date.split(' ')[0]}
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                      {event.date.split(' ')[1].replace(',', '')}
                    </Typography>
                  </Box>
                </Box>
                
                <Typography variant="body2" sx={{ mb: 3 }}>
                  {event.description}
                </Typography>

                <Box sx={{ display: 'flex', gap: 3, mb: 3, flexWrap: 'wrap' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AccessTimeIcon fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">{event.time}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocationOnIcon fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">{event.location}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <GroupIcon fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      {event.registered} / {event.capacity} Registered
                    </Typography>
                  </Box>
                </Box>
                
                <Divider sx={{ mb: 2 }} />
                
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  {event.status === 'Waitlist' ? (
                    <Button variant="outlined" color="warning">Join Waitlist</Button>
                  ) : (
                    <Button variant="contained" color="primary">Register Now</Button>
                  )}
                </Box>
              </CardContent>
            </Card>
          ))}
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <Paper variant="outlined" sx={{ p: 3, mb: 3, bgcolor: 'grey.50' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>My Registrations</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ p: 2, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>Alumni Webinar: AI in Finance</Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" color="text.secondary">Tomorrow, 5:00 PM</Typography>
                  <Chip label="Confirmed" size="small" color="success" />
                </Box>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AlumniEventsBoard;
