import React from 'react';
import { Box, Typography, Card, CardContent, Grid, Button } from '@mui/material';
import DevicesIcon from '@mui/icons-material/Devices';
import ConstructionIcon from '@mui/icons-material/Construction';
import InventoryIcon from '@mui/icons-material/Inventory';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';

const AssetDashboard: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>Asset Dashboard</Typography>
        <Button variant="contained" color="primary">Add New Asset</Button>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card sx={{ borderTop: 4, borderColor: 'primary.main', borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography color="text.secondary">Total Assets</Typography>
                <DevicesIcon color="primary" />
              </Box>
              <Typography variant="h3" sx={{ mt: 1 }}>1,245</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card sx={{ borderTop: 4, borderColor: 'warning.main', borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography color="text.secondary">Under Maintenance</Typography>
                <ConstructionIcon color="warning" />
              </Box>
              <Typography variant="h3" sx={{ mt: 1 }}>32</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card sx={{ borderTop: 4, borderColor: 'info.main', borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography color="text.secondary">Allocated Assets</Typography>
                <InventoryIcon color="info" />
              </Box>
              <Typography variant="h3" sx={{ mt: 1 }}>856</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card sx={{ borderTop: 4, borderColor: 'success.main', borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography color="text.secondary">Total Value</Typography>
                <MonetizationOnIcon color="success" />
              </Box>
              <Typography variant="h3" sx={{ mt: 1 }}>$452K</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AssetDashboard;
