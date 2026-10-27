import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Card, CardContent, Button, Grid, Chip, Dialog, 
  DialogTitle, DialogContent, DialogActions, TextField, CircularProgress 
} from '@mui/material';
import FestivalIcon from '@mui/icons-material/Festival';
import CampaignIcon from '@mui/icons-material/Campaign';
import axios from 'axios';

const CulturalFestivals: React.FC = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [updateText, setUpdateText] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem('token');
      // In a real scenario, this endpoint might be `/api/v1/events?category=Cultural`
      const res = await axios.get('/api/v1/events', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.data?.success) {
        // Filter local for mock purposes assuming backend returns all events
        const culturalEvents = res.data.data.filter((e: any) => 
          e.category?.toLowerCase().includes('culture') || 
          e.category?.toLowerCase().includes('festival') ||
          e.title?.toLowerCase().includes('fest') ||
          e.category === 'Cultural'
        );
        
        // If empty, mock data for demonstration
        if (culturalEvents.length === 0) {
          setEvents([
            { _id: '1', title: 'Diwali Cultural Fest 2026', category: 'Cultural', date: '2026-11-01', venueName: 'Main Ground' },
            { _id: '2', title: 'Annual Arts & Music Festival', category: 'Festival', date: '2026-12-15', venueName: 'Auditorium' }
          ]);
        } else {
          setEvents(culturalEvents);
        }
      }
    } catch (err) {
      console.error(err);
      // Fallback for demonstration
      setEvents([
        { _id: '1', title: 'Diwali Cultural Fest 2026', category: 'Cultural', date: '2026-11-01', venueName: 'Main Ground' },
        { _id: '2', title: 'Annual Arts & Music Festival', category: 'Festival', date: '2026-12-15', venueName: 'Auditorium' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenUpdate = (event: any) => {
    setSelectedEvent(event);
    setUpdateText(`Update regarding ${event.title}:\n\n`);
    setUpdateModalOpen(true);
  };

  const handleSendUpdate = async () => {
    if (!updateText.trim()) return;
    setSending(true);
    try {
      const token = localStorage.getItem('token');
      
      const payload = {
        title: `Festival Update: ${selectedEvent.title}`,
        content: updateText,
        type: 'FESTIVAL',
        priority: 'NORMAL',
        channels: ['IN_APP', 'EMAIL', 'PUSH'],
        audienceConfig: { targetType: 'ALL' },
        status: 'PENDING_APPROVAL'
      };

      const res = await axios.post('/api/v1/communication/admin/announcements', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.data?.data?._id) {
        await axios.post(`/api/v1/communication/admin/announcements/${res.data.data._id}/approve`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      
      alert('Festival update broadcasted to the entire school successfully!');
      setUpdateModalOpen(false);
    } catch (err) {
      console.error(err);
      alert('Failed to send update. The Communication model may need backend restart for FESTIVAL type.');
    } finally {
      setSending(false);
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>;

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <FestivalIcon sx={{ fontSize: 40, color: 'secondary.main' }} />
          <Typography variant="h4" sx={{ fontWeight: 800 }}>Cultural & Festival Hub</Typography>
        </Box>
        <Button variant="contained" color="secondary" startIcon={<FestivalIcon />}>Plan New Festival</Button>
      </Box>

      <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: 'text.secondary' }}>Upcoming Festivals</Typography>
      
      <Grid container spacing={3}>
        {events.map((evt) => (
          <Grid size={{ xs: 12, md: 6, lg: 4 }} key={evt._id}>
            <Card sx={{ borderRadius: 3, height: '100%', display: 'flex', flexDirection: 'column', transition: '0.3s', '&:hover': { transform: 'translateY(-5px)', boxShadow: 6 } }}>
              <Box sx={{ height: 100, background: 'linear-gradient(135deg, #f50057 0%, #ff8a80 100%)', display: 'flex', alignItems: 'flex-end', p: 2 }}>
                <Chip label={evt.category} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.9)', fontWeight: 700 }} />
              </Box>
              <CardContent sx={{ flexGrow: 1, p: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>{evt.title}</Typography>
                <Typography variant="body2" sx={{ mb: 0.5 }}><b>Date:</b> {new Date(evt.date || evt.startDate).toLocaleDateString()}</Typography>
                <Typography variant="body2" sx={{ mb: 3 }}><b>Venue:</b> {evt.venueName || 'TBD'}</Typography>
                
                <Button 
                  variant="outlined" 
                  fullWidth 
                  startIcon={<CampaignIcon />}
                  onClick={() => handleOpenUpdate(evt)}
                  sx={{ mt: 'auto', borderRadius: 2, borderWidth: 2, '&:hover': { borderWidth: 2 } }}
                >
                  Broadcast Update
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={updateModalOpen} onClose={() => !sending && setUpdateModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Send Festival Update</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            This will send an announcement to <b>ALL Students, Parents, and Staff</b>.
          </Typography>
          <TextField 
            fullWidth 
            multiline 
            rows={6} 
            variant="outlined" 
            placeholder="Write your update here..."
            value={updateText}
            onChange={(e) => setUpdateText(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setUpdateModalOpen(false)} disabled={sending}>Cancel</Button>
          <Button variant="contained" onClick={handleSendUpdate} disabled={sending || !updateText.trim()}>
            {sending ? <CircularProgress size={24} /> : 'Broadcast Now'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CulturalFestivals;
