import React from 'react';
import { Box, Typography, Card, CardContent, Button, LinearProgress, Grid } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';

const FundraisingCampaigns: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>Fundraising & Contributions</Typography>
        <Button variant="contained" color="primary">Create Campaign</Button>
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 1 }}>Scholarship Fund 2026</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Support underprivileged students by sponsoring their tuition fees for the upcoming academic year.
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>$45,000 raised</Typography>
                  <Typography variant="body2" color="text.secondary">Target: $50,000</Typography>
                </Box>
                <LinearProgress variant="determinate" value={90} sx={{ height: 10, borderRadius: 5 }} />
              </Box>
              
              <Button variant="contained" color="secondary" fullWidth startIcon={<FavoriteIcon />}>
                Donate Now
              </Button>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 1 }}>New Library Infrastructure</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Help us build a state-of-the-art digital reading room and multimedia center.
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>$12,000 raised</Typography>
                  <Typography variant="body2" color="text.secondary">Target: $100,000</Typography>
                </Box>
                <LinearProgress variant="determinate" value={12} sx={{ height: 10, borderRadius: 5 }} />
              </Box>
              
              <Button variant="contained" color="secondary" fullWidth startIcon={<FavoriteIcon />}>
                Donate Now
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default FundraisingCampaigns;
