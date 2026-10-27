import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, Button, Grid, Chip, Dialog, DialogTitle, DialogContent, TextField, DialogActions } from '@mui/material';
import { getEvents, registerParticipant } from '../api/events.api';
import type { SchoolEvent } from '../api/events.api';

const EventRegistrationHub: React.FC = () => {
  const [events, setEvents] = useState<SchoolEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<SchoolEvent | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [participantData, setParticipantData] = useState({ studentId: '', role: 'ATTENDEE' });

  const fetchOpenEvents = async () => {
    try {
      const allEvents = await getEvents();
      // Filter for Registration Open
      setEvents(allEvents.filter(e => e.status === 'Registration Open' || e.status === 'Published'));
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchOpenEvents();
  }, []);

  const handleRegister = async () => {
    if (!selectedEvent || !participantData.studentId) return;
    try {
      await registerParticipant(selectedEvent._id, participantData);
      alert('Registered successfully!');
      setModalOpen(false);
      fetchOpenEvents();
    } catch (e: any) {
      alert('Failed to register: ' + (e.response?.data?.message || e.message));
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>Registration Hub</Typography>
      <Grid container spacing={3}>
        {events.map((event) => (
          <Grid size={{ xs: 12, md: 6 }} key={event._id}>
            <Card sx={{ borderRadius: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6">{event.title}</Typography>
                  <Chip label="Open" color="success" size="small" />
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {event.type} - Organized by {event.organizer}
                </Typography>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>Venue: {event.venue}</Typography>
                <Typography variant="subtitle2" sx={{ mb: 2 }}>Date: {new Date(event.startDate).toLocaleDateString()}</Typography>
                <Button variant="contained" fullWidth onClick={() => { setSelectedEvent(event); setModalOpen(true); }}>
                  Register Now
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
        {events.length === 0 && (
          <Grid size={{ xs: 12 }}>
            <Typography>No events currently open for registration.</Typography>
          </Grid>
        )}
      </Grid>

      <Dialog open={modalOpen} onClose={() => setModalOpen(false)}>
        <DialogTitle>Register for {selectedEvent?.title}</DialogTitle>
        <DialogContent sx={{ mt: 1, minWidth: 300 }}>
          <TextField 
            label="Student ID" 
            fullWidth 
            value={participantData.studentId} 
            onChange={(e) => setParticipantData({ ...participantData, studentId: e.target.value })} 
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleRegister}>Submit Registration</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EventRegistrationHub;
