import React from 'react';
import { Box, Typography, Card, CardContent, Grid, LinearProgress } from '@mui/material';
import WorkIcon from '@mui/icons-material/Work';
import SchoolIcon from '@mui/icons-material/School';

const CareerDashboard: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>Career & Placement Dashboard</Typography>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ borderTop: 4, borderColor: 'primary.main', borderRadius: 2 }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>Placement Rate</Typography>
              <Typography variant="h3">85%</Typography>
              <LinearProgress variant="determinate" value={85} sx={{ mt: 2, height: 8, borderRadius: 4 }} />
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ borderTop: 4, borderColor: 'success.main', borderRadius: 2 }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>Total Offers Issued</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <WorkIcon sx={{ color: 'success.main', mr: 1 }} />
                <Typography variant="h3">342</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ borderTop: 4, borderColor: 'info.main', borderRadius: 2 }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>Higher Ed Admissions</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <SchoolIcon sx={{ color: 'info.main', mr: 1 }} />
                <Typography variant="h3">128</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CareerDashboard;
