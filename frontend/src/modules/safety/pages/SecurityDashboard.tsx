import React from 'react';
import { Box, Typography, Grid, Card, CardContent, Divider, Chip, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import PolicyIcon from '@mui/icons-material/Policy';

const SecurityDashboard: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 700, display: 'flex', alignItems: 'center' }}>
        <PolicyIcon sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
        Campus Security Dashboard
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ borderRadius: 2, borderLeft: '4px solid', borderColor: 'info.main' }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">Students on Campus</Typography>
              <Typography variant="h4" sx={{ mt: 1 }}>1,245</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ borderRadius: 2, borderLeft: '4px solid', borderColor: 'primary.main' }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">Staff on Campus</Typography>
              <Typography variant="h4" sx={{ mt: 1 }}>128</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ borderRadius: 2, borderLeft: '4px solid', borderColor: 'warning.main' }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">Visitors Inside</Typography>
              <Typography variant="h4" sx={{ mt: 1 }}>14</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ borderRadius: 2, borderLeft: '4px solid', borderColor: 'success.main' }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">Active Patrols</Typography>
              <Typography variant="h4" sx={{ mt: 1 }}>2</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ borderRadius: 2 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Recent Access Anomalies</Typography>
          <Divider sx={{ mb: 2 }} />
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Time</TableCell>
                <TableCell>Gate</TableCell>
                <TableCell>Person Type</TableCell>
                <TableCell>Reason</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>08:15 AM</TableCell>
                <TableCell>Main Gate</TableCell>
                <TableCell>Student</TableCell>
                <TableCell>Expired Pass</TableCell>
                <TableCell><Chip size="small" label="Denied" color="error" /></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </Box>
  );
};

export default SecurityDashboard;
