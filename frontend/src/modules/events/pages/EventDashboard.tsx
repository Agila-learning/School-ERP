import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, Button, Grid, Chip, CircularProgress } from '@mui/material';
import EventIcon from '@mui/icons-material/Event';
import GroupIcon from '@mui/icons-material/Group';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { getEventStats, getEvents } from '../api/events.api';
import type { EventStats, SchoolEvent } from '../api/events.api';

const EventDashboard: React.FC = () => {
  const [stats, setStats] = useState<EventStats | null>(null);
  const [events, setEvents] = useState<SchoolEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const statsData = await getEventStats();
        setStats(statsData);
        
        const eventsData = await getEvents();
        setEvents(eventsData.slice(0, 3)); // Get top 3 upcoming
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>Event Dashboard</Typography>
        <Button variant="contained" color="primary" startIcon={<EventIcon />}>Create Event</Button>
      </Box>

      {loading ? (
        <CircularProgress />
      ) : (
        <>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Card sx={{ bgcolor: 'primary.main', color: 'white', borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ opacity: 0.9 }}>Active Events</Typography>
                  <Typography variant="h3" sx={{ fontWeight: 700, mt: 1 }}>{stats?.activeEvents || 0}</Typography>
                  <EventIcon sx={{ position: 'absolute', right: 20, top: 20, opacity: 0.3, fontSize: 60 }} />
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Card sx={{ bgcolor: 'secondary.main', color: 'white', borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ opacity: 0.9 }}>Total Participants</Typography>
                  <Typography variant="h3" sx={{ fontWeight: 700, mt: 1 }}>{stats?.totalParticipants || 0}</Typography>
                  <GroupIcon sx={{ position: 'absolute', right: 20, top: 20, opacity: 0.3, fontSize: 60 }} />
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Card sx={{ bgcolor: 'success.main', color: 'white', borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ opacity: 0.9 }}>Pending Approvals</Typography>
                  <Typography variant="h3" sx={{ fontWeight: 700, mt: 1 }}>{stats?.pendingApprovals || 0}</Typography>
                  <CheckCircleIcon sx={{ position: 'absolute', right: 20, top: 20, opacity: 0.3, fontSize: 60 }} />
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Recent & Upcoming Events</Typography>
          <Grid container spacing={3}>
            {events.map((event) => (
              <Grid size={{ xs: 12, md: 4 }} key={event._id}>
                <Card sx={{ borderRadius: 2 }}>
                  <CardContent>
                    <Typography variant="h6">{event.title}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Organized by {event.organizer || 'School'}</Typography>
                    <Chip size="small" label={event.status} color={event.status === 'Approved' ? 'success' : 'primary'} sx={{ mb: 2 }} />
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>Date: {new Date(event.startDate).toLocaleDateString()}</Typography>
                    <Typography variant="body2">Venue: {event.venue}</Typography>
                    <Button variant="outlined" fullWidth size="small" sx={{ mt: 2 }}>Manage Event</Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
            {events.length === 0 && (
              <Grid size={{ xs: 12 }}>
                <Typography color="text.secondary">No upcoming events found.</Typography>
              </Grid>
            )}
          </Grid>
        </>
      )}
    </Box>
  );
};

export default EventDashboard;
