import React from 'react';
import { Box, Typography, Card, CardContent, Grid, Button, Avatar } from '@mui/material';

const ClubManager: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>School Clubs & Societies</Typography>
        <Button variant="contained">Create Club</Button>
      </Box>

      <Grid container spacing={3}>
        {[1, 2, 3, 4].map((idx) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={idx}>
            <Card sx={{ borderRadius: 2, textAlign: 'center', p: 2 }}>
              <CardContent>
                <Avatar sx={{ width: 80, height: 80, mx: 'auto', mb: 2, bgcolor: 'primary.main' }}>C{idx}</Avatar>
                <Typography variant="h6">Robotics Club</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  45 Active Members
                </Typography>
                <Button variant="outlined" size="small" fullWidth>Manage Members</Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ClubManager;
