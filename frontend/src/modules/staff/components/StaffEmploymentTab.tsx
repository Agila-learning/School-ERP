import React from 'react';
import { Box, Typography, Grid, Paper, Divider } from '@mui/material';
import Timeline from '@mui/lab/Timeline';
import TimelineItem, { timelineItemClasses } from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import type { StaffProfileDetail } from '../api/staff.api';

interface Props {
  staff: StaffProfileDetail;
}

const StaffEmploymentTab: React.FC<Props> = ({ staff }) => {
  return (
    <Box>
      <Grid container spacing={4}>
        
        {/* Employment Basics */}
        <Grid size={{ xs: 12 }} >
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Current Employment</Typography>
          <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}   >
                <Typography color="text.secondary" variant="caption">Employee ID</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: 'monospace' }}>{staff.employeeIdNumber}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}   >
                <Typography color="text.secondary" variant="caption">Type</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{staff.employmentType}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}   >
                <Typography color="text.secondary" variant="caption">Joining Date</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{staff.joiningDate}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}   >
                <Typography color="text.secondary" variant="caption">Status</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{staff.status}</Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12 }} ><Divider sx={{ my: 2 }} /></Grid>

        {/* Qualifications */}
        <Grid size={{ xs: 12, md: 6 }}  >
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Educational Qualifications</Typography>
          <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, overflow: 'hidden' }}>
            <Timeline sx={{ [`& .${timelineItemClasses.root}:before`]: { flex: 0, padding: 0 } }}>
              {staff.qualifications.length === 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ p: 3 }}>No qualifications recorded.</Typography>
              )}
              {staff.qualifications.map((q, i) => (
                <TimelineItem key={i}>
                  <TimelineSeparator>
                    <TimelineDot color="primary" variant="outlined" />
                    {i < staff.qualifications.length - 1 && <TimelineConnector />}
                  </TimelineSeparator>
                  <TimelineContent sx={{ py: '12px', px: 2 }}>
                    <Typography variant="h6" component="span" sx={{ fontSize: '1rem', fontWeight: 600 }}>
                      {q.degree}
                    </Typography>
                    <Typography color="text.secondary">{q.institution}</Typography>
                    <Typography variant="caption" color="text.secondary">Completed: {q.year}</Typography>
                  </TimelineContent>
                </TimelineItem>
              ))}
            </Timeline>
          </Paper>
        </Grid>

        {/* Experience */}
        <Grid size={{ xs: 12, md: 6 }}  >
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Previous Experience</Typography>
          <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, overflow: 'hidden' }}>
            <Timeline sx={{ [`& .${timelineItemClasses.root}:before`]: { flex: 0, padding: 0 } }}>
              {staff.experience.length === 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ p: 3 }}>No previous experience recorded.</Typography>
              )}
              {staff.experience.map((e, i) => (
                <TimelineItem key={i}>
                  <TimelineSeparator>
                    <TimelineDot color="info" />
                    {i < staff.experience.length - 1 && <TimelineConnector />}
                  </TimelineSeparator>
                  <TimelineContent sx={{ py: '12px', px: 2 }}>
                    <Typography variant="h6" component="span" sx={{ fontSize: '1rem', fontWeight: 600 }}>
                      {e.role}
                    </Typography>
                    <Typography color="text.secondary">{e.organization}</Typography>
                    <Typography variant="caption" color="text.secondary">{e.duration}</Typography>
                  </TimelineContent>
                </TimelineItem>
              ))}
            </Timeline>
          </Paper>
        </Grid>

      </Grid>
    </Box>
  );
};

export default StaffEmploymentTab;
