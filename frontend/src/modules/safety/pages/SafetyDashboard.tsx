import React from 'react';
import { Box, Typography, Grid, Card, CardContent, Divider } from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import AssuredWorkloadIcon from '@mui/icons-material/AssuredWorkload';

const SafetyDashboard: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 700, display: 'flex', alignItems: 'center' }}>
        <VerifiedUserIcon sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
        Safety & Disaster Management Dashboard
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ bgcolor: 'error.main', color: 'white', borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>Active Emergencies</Typography>
              <Typography variant="h3" sx={{ mt: 1, fontWeight: 700 }}>0</Typography>
              <WarningAmberIcon sx={{ position: 'absolute', right: 16, top: 16, opacity: 0.3, fontSize: 60 }} />
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ bgcolor: 'warning.main', color: 'white', borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>Critical Open Risks</Typography>
              <Typography variant="h3" sx={{ mt: 1, fontWeight: 700 }}>2</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ bgcolor: 'info.main', color: 'white', borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>Pending Inspections</Typography>
              <Typography variant="h3" sx={{ mt: 1, fontWeight: 700 }}>5</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ bgcolor: 'success.main', color: 'white', borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>Upcoming Drills</Typography>
              <Typography variant="h3" sx={{ mt: 1, fontWeight: 700 }}>1</Typography>
              <AssuredWorkloadIcon sx={{ position: 'absolute', right: 16, top: 16, opacity: 0.3, fontSize: 60 }} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ borderRadius: 2, height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Recent Incidents</Typography>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="body2" color="text.secondary">No recent critical incidents reported.</Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ borderRadius: 2, height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Equipment Alerts</Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ mb: 2, p: 2, bgcolor: '#fff4e5', borderRadius: 1, border: '1px solid #ffe0b2' }}>
                <Typography variant="subtitle2" color="warning.dark">Fire Extinguisher (Block A)</Typography>
                <Typography variant="body2">Inspection due in 3 days.</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SafetyDashboard;
