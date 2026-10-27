import React, { useEffect, useState } from 'react';
import { 
  Box, Typography, Paper, Grid, Chip
} from '@mui/material';
import { getLeaveRequests } from '../api/leave.api';
import type { LeaveRequest } from '../api/leave.api';

const LeaveCalendarView: React.FC = () => {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);

  useEffect(() => {
    getLeaveRequests({ status: 'APPROVED' }).then(data => {
      setRequests(data || []);
    });
  }, []);
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  });

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1400, mx: 'auto' }}>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>Absence Calendar</Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Overview of upcoming approved and pending leaves for scheduling.
      </Typography>

      <Grid container spacing={2}>
        {days.map((day, i) => {
          const isWeekend = day.getDay() === 0 || day.getDay() === 6;
          
          // Find leaves for this day
          const dayLeaves = requests.filter(req => {
            const start = new Date(req.startDate);
            const end = new Date(req.endDate);
            // reset times for comparison
            start.setHours(0,0,0,0);
            end.setHours(0,0,0,0);
            const current = new Date(day);
            current.setHours(0,0,0,0);
            return current >= start && current <= end;
          });
          
          return (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={i}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 2, 
                  height: 120, 
                  border: '1px solid', 
                  borderColor: isWeekend ? 'grey.300' : 'divider',
                  bgcolor: isWeekend ? 'grey.50' : 'white',
                  borderRadius: 2
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: isWeekend ? 'text.secondary' : 'text.primary' }}>
                  {day.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </Typography>
                
                <Box sx={{ mt: 1 }}>
                  {isWeekend ? (
                    <Typography variant="caption" color="text.secondary">Weekend</Typography>
                  ) : dayLeaves.length > 0 ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      {dayLeaves.map(leave => (
                        <Chip key={leave.id || (leave as any)._id} label={`${leave.applicantName || 'Unknown'} (L)`} size="small" color="warning" sx={{ height: 20, fontSize: '0.7rem' }} />
                      ))}
                    </Box>
                  ) : null}
                </Box>
              </Paper>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default LeaveCalendarView;
