import React from 'react';
import { Box, Typography, Card, CardContent, Button, Grid } from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import GroupIcon from '@mui/icons-material/Group';
import EventIcon from '@mui/icons-material/Event';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

const AlumniDashboard: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>Alumni Platform</Typography>
        <Button variant="contained" color="primary">Manage Batches</Button>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ bgcolor: 'primary.main', color: 'white', borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>Total Alumni</Typography>
              <Typography variant="h3" sx={{ fontWeight: 700, mt: 1 }}>4,520</Typography>
              <SchoolIcon sx={{ position: 'absolute', right: 20, top: 20, opacity: 0.3, fontSize: 60 }} />
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ bgcolor: 'secondary.main', color: 'white', borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>Active Mentors</Typography>
              <Typography variant="h3" sx={{ fontWeight: 700, mt: 1 }}>142</Typography>
              <GroupIcon sx={{ position: 'absolute', right: 20, top: 20, opacity: 0.3, fontSize: 60 }} />
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ bgcolor: 'success.main', color: 'white', borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>Upcoming Reunions</Typography>
              <Typography variant="h3" sx={{ fontWeight: 700, mt: 1 }}>3</Typography>
              <EventIcon sx={{ position: 'absolute', right: 20, top: 20, opacity: 0.3, fontSize: 60 }} />
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ bgcolor: 'warning.main', color: 'white', borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>Campaign Goal Reached</Typography>
              <Typography variant="h3" sx={{ fontWeight: 700, mt: 1 }}>85%</Typography>
              <AttachMoneyIcon sx={{ position: 'absolute', right: 20, top: 20, opacity: 0.3, fontSize: 60 }} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ borderRadius: 2, height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Recent Conversions (Students to Alumni)</Typography>
              {/* Table stub */}
              <Typography variant="body2" color="text.secondary">Batch 2026 graduation processed successfully. 350 profiles generated.</Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ borderRadius: 2, height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Pending Verifications</Typography>
              <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1, mb: 1 }}>
                <Typography variant="subtitle2">John Doe (2020 Batch)</Typography>
                <Typography variant="body2" color="text.secondary">ID: ST-2020-001</Typography>
                <Button size="small" variant="outlined" sx={{ mt: 1 }}>Review</Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AlumniDashboard;
