import React from 'react';
import { Box, Typography, Card, CardContent, Grid, Chip } from '@mui/material';

const HigherEdTracker: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>University Applications</Typography>
      
      <Grid container spacing={3}>
        {['Drafts', 'Under Review', 'Accepted'].map((stage) => (
          <Grid size={{ xs: 12, md: 4 }} key={stage}>
            <Card sx={{ borderRadius: 2, height: '100%', bgcolor: 'grey.50' }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>{stage}</Typography>
                {stage === 'Accepted' && (
                  <Card sx={{ mb: 2 }}>
                    <CardContent>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Stanford University</Typography>
                      <Typography variant="body2" color="text.secondary">Computer Science, B.S.</Typography>
                      <Box sx={{ mt: 1 }}>
                        <Chip label="Alex Chen" size="small" variant="outlined" />
                      </Box>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default HigherEdTracker;
