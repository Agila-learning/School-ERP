import React from 'react';
import { Box, Typography, Card, CardContent, Button, Grid, LinearProgress, Avatar } from '@mui/material';
import HowToVoteIcon from '@mui/icons-material/HowToVote';

const ElectionDashboard: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>Student Council Elections 2026</Typography>

      <Grid container spacing={3}>
        {/* Voting Portal for Students */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Active Ballot: Head Boy</Typography>
          <Grid container spacing={2}>
            {[1, 2].map((idx) => (
              <Grid size={{ xs: 12, sm: 6 }} key={idx}>
                <Card sx={{ borderRadius: 2, textAlign: 'center', p: 2 }}>
                  <CardContent>
                    <Avatar sx={{ width: 80, height: 80, mx: 'auto', mb: 2 }} />
                    <Typography variant="h6">Candidate {idx}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      "Building a better tomorrow, together."
                    </Typography>
                    <Button variant="contained" fullWidth startIcon={<HowToVoteIcon />}>Cast Vote</Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>

        {/* Live Admin Turnout Tracking (Not candidate results) */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Admin Tracking</Typography>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>Overall Voter Turnout</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Box sx={{ width: '100%', mr: 1 }}>
                  <LinearProgress variant="determinate" value={78} sx={{ height: 10, borderRadius: 5 }} />
                </Box>
                <Box sx={{ minWidth: 35 }}>
                  <Typography variant="body2" color="text.secondary">78%</Typography>
                </Box>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>1,120 / 1,430 eligible voters have cast their ballots.</Typography>
              
              <Button variant="outlined" color="error" fullWidth>Close Election & Tally</Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ElectionDashboard;
