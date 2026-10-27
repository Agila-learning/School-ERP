import React from 'react';
import { Box, Typography, Card, CardContent, Grid, Button, Chip } from '@mui/material';
import BuildIcon from '@mui/icons-material/Build';
import ComputerIcon from '@mui/icons-material/Computer';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

const RequestPortal: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>Service Request Portal</Typography>
        <Button variant="contained">New Request</Button>
      </Box>

      <Typography variant="h6" sx={{ mb: 2 }}>Categories</Typography>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'grey.50' } }}>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <ComputerIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h6">IT Support</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'grey.50' } }}>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <BuildIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
              <Typography variant="h6">Facility & Maintenance</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'grey.50' } }}>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <AttachMoneyIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h6">Finance & Fees</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Typography variant="h6" sx={{ mb: 2 }}>My Active Requests</Typography>
      <Card sx={{ borderRadius: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, border: 1, borderColor: 'grey.200', borderRadius: 1, mb: 1 }}>
            <Box>
              <Typography variant="subtitle1">Projector not working in Room 102</Typography>
              <Typography variant="body2" color="text.secondary">IT Support • Created yesterday</Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Chip label="In Progress" color="primary" />
              <Button size="small">View Detail</Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default RequestPortal;
