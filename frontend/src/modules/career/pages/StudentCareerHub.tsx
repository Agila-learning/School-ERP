import React from 'react';
import { Box, Typography, Card, CardContent, Grid, Button, Chip } from '@mui/material';
import FlagIcon from '@mui/icons-material/Flag';
import FilePresentIcon from '@mui/icons-material/FilePresent';

const StudentCareerHub: React.FC = () => {
  return (
    <Box sx={{ p: 3, maxWidth: 1000, mx: 'auto' }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>My Career Hub</Typography>

      <Grid container spacing={3}>
        {/* Profile/Goals */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ borderRadius: 2, mb: 3, borderLeft: 4, borderColor: 'primary.main' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                    <FlagIcon sx={{ mr: 1, color: 'primary.main' }} /> Current Goal
                  </Typography>
                  <Typography variant="body1">Secure a Software Engineering role at a Tier 1 Tech Company.</Typography>
                </Box>
                <Button variant="outlined" size="small">Edit Goal</Button>
              </Box>
            </CardContent>
          </Card>

          <Typography variant="h6" sx={{ mb: 2 }}>Job Recommendations</Typography>
          <Card sx={{ borderRadius: 2, mb: 2 }}>
            <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h6">Junior Frontend Developer</Typography>
                <Typography variant="body2" color="text.secondary">Tech Corp Campus Drive</Typography>
                <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                  <Chip label="Match: 95%" size="small" color="success" />
                  <Chip label="Full Time" size="small" />
                </Box>
              </Box>
              <Button variant="contained">Apply Now</Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Sidebar widgets */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ borderRadius: 2, mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>My Resume</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                <FilePresentIcon sx={{ color: 'error.main', mr: 2, fontSize: 32 }} />
                <Box>
                  <Typography variant="subtitle2">Alex_Resume_2026.pdf</Typography>
                  <Typography variant="caption" color="text.secondary">Updated 2 days ago</Typography>
                </Box>
              </Box>
              <Button fullWidth variant="outlined">Update Resume</Button>
            </CardContent>
          </Card>

          <Card sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Next Steps</Typography>
              <ul style={{ paddingLeft: '20px', margin: 0 }}>
                <li><Typography variant="body2">Complete Mock Interview</Typography></li>
                <li><Typography variant="body2">Schedule Counselor Meeting</Typography></li>
              </ul>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default StudentCareerHub;
