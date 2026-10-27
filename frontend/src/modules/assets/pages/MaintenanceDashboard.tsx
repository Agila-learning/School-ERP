import React from 'react';
import { Box, Typography, Card, CardContent, Grid, Button } from '@mui/material';
import BuildIcon from '@mui/icons-material/Build';
import UpdateIcon from '@mui/icons-material/Update';

const MaintenanceDashboard: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>Maintenance Operations</Typography>
        <Button variant="contained">New Work Order</Button>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ borderTop: 4, borderColor: 'error.main', borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography color="text.secondary">Open Work Orders</Typography>
                <BuildIcon color="error" />
              </Box>
              <Typography variant="h3" sx={{ mt: 1 }}>14</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ borderTop: 4, borderColor: 'warning.main', borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography color="text.secondary">Preventive Maintenance Due</Typography>
                <UpdateIcon color="warning" />
              </Box>
              <Typography variant="h3" sx={{ mt: 1 }}>8</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default MaintenanceDashboard;
