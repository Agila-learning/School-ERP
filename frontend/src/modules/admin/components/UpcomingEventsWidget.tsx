import React from 'react';
import { Card, CardContent, Typography, Box, Divider, CircularProgress, Chip } from '@mui/material';
import type { UpcomingEvent } from '../api/adminDashboard.api';

interface UpcomingEventsWidgetProps {
  events: UpcomingEvent[];
  loading?: boolean;
}

const getTypeColor = (type: string) => {
  switch (type) {
    case 'exam': return 'error';
    case 'meeting': return 'primary';
    case 'holiday': return 'success';
    default: return 'default';
  }
};

const UpcomingEventsWidget: React.FC<UpcomingEventsWidgetProps> = ({ events, loading }) => {
  return (
    <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, height: '100%' }}>
      <CardContent>
        <Typography variant="h6" sx={{ fontWeight: 700 }} gutterBottom>
          Upcoming Events
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : events.length === 0 ? (
          <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
            No upcoming events found.
          </Typography>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {events.map((event) => (
              <Box key={event.id} sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                <Box 
                  sx={{ 
                    bgcolor: 'primary.50', 
                    color: 'primary.main', 
                    p: 1.5, 
                    borderRadius: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    minWidth: 60
                  }}
                >
                  <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>
                    {event.date.split(' ')[0]}
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1 }}>
                    {event.date.split(' ')[1]}
                  </Typography>
                </Box>
                <Box sx={{ flex: 1, py: 0.5 }}>
                  <Typography variant="body1" sx={{ fontWeight: 600 }} gutterBottom>
                    {event.title}
                  </Typography>
                  <Chip 
                    label={event.type} 
                    size="small" 
                    color={getTypeColor(event.type) as any} 
                    variant="outlined"
                    sx={{ textTransform: 'capitalize', height: 20 }}
                  />
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default UpcomingEventsWidget;
