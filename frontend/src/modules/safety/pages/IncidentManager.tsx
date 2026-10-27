import React from 'react';
import { Box, Typography, Card, CardContent, Button, Grid, Chip } from '@mui/material';

const IncidentManager: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>Incident Management</Typography>
        <Button variant="contained" color="primary">Report Incident</Button>
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12 }}>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Open Incidents</Typography>
              <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>INC-9A1B2: Broken Window (Block B)</Typography>
                  <Chip size="small" label="Under Investigation" color="warning" />
                </Box>
                <Typography variant="body2" color="text.secondary">Reported By: John Smith (Security)</Typography>
                <Typography variant="body2" color="text.secondary">Date: 2026-08-09</Typography>
                <Button size="small" variant="outlined" sx={{ mt: 1 }}>View Details</Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default IncidentManager;
