import React from 'react';
import { Box, Typography, Grid, Paper } from '@mui/material';
import type { StaffProfileDetail } from '../api/staff.api';

interface Props {
  staff: StaffProfileDetail;
}

const StaffOverviewTab: React.FC<Props> = ({ staff }) => {
  return (
    <Box>
      <Grid container spacing={4}>
        
        {/* Personal Details */}
        <Grid size={{ xs: 12, md: 6 }}  >
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Personal Details</Typography>
          <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 4 }} ><Typography color="text.secondary" variant="body2">Full Name</Typography></Grid>
              <Grid size={{ xs: 8 }} ><Typography variant="body2" sx={{ fontWeight: 600 }}>{staff.firstName} {staff.lastName}</Typography></Grid>
              
              <Grid size={{ xs: 4 }} ><Typography color="text.secondary" variant="body2">Email</Typography></Grid>
              <Grid size={{ xs: 8 }} ><Typography variant="body2">{staff.email}</Typography></Grid>
              
              <Grid size={{ xs: 4 }} ><Typography color="text.secondary" variant="body2">Mobile</Typography></Grid>
              <Grid size={{ xs: 8 }} ><Typography variant="body2">{staff.mobile}</Typography></Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Emergency Contact */}
        <Grid size={{ xs: 12, md: 6 }}  >
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Emergency Contact</Typography>
          <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 4 }} ><Typography color="text.secondary" variant="body2">Name</Typography></Grid>
              <Grid size={{ xs: 8 }} ><Typography variant="body2" sx={{ fontWeight: 600 }}>{staff.emergencyContact.name}</Typography></Grid>
              
              <Grid size={{ xs: 4 }} ><Typography color="text.secondary" variant="body2">Relationship</Typography></Grid>
              <Grid size={{ xs: 8 }} ><Typography variant="body2">{staff.emergencyContact.relationship}</Typography></Grid>
              
              <Grid size={{ xs: 4 }} ><Typography color="text.secondary" variant="body2">Phone</Typography></Grid>
              <Grid size={{ xs: 8 }} ><Typography variant="body2">{staff.emergencyContact.phone}</Typography></Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Address */}
        <Grid size={{ xs: 12 }} >
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Address</Typography>
          <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
            <Typography variant="body2">{staff.address.current}</Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default StaffOverviewTab;
