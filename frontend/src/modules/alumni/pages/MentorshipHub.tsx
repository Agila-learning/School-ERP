import React from 'react';
import { Box, Typography, Card, CardContent, Button, Tabs, Tab, Grid } from '@mui/material';

const MentorshipHub: React.FC = () => {
  const [tab, setTab] = React.useState(0);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>Mentorship Hub</Typography>
        <Button variant="contained" color="secondary">Become a Mentor</Button>
      </Box>

      <Card sx={{ borderRadius: 2, mb: 3 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="Find a Mentor" />
          <Tab label="My Requests" />
          <Tab label="My Sessions" />
        </Tabs>
        
        <CardContent sx={{ minHeight: 400 }}>
          {tab === 0 && (
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 4 }}>
                <Card sx={{ border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
                  <CardContent>
                    <Typography variant="h6">Sarah Williams</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Senior Product Manager • 10 Yrs Exp</Typography>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      Available for: Career Guidance, Resume Review, Interview Prep
                    </Typography>
                    <Button variant="outlined" fullWidth>Request Mentorship</Button>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default MentorshipHub;
