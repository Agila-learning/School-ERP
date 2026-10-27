import React from 'react';
import { Box, Typography, Card, CardContent, Grid, Button, Table, TableHead, TableRow, TableCell, TableBody, Chip } from '@mui/material';

const PlacementDriveManager: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>Placement Drives</Typography>
        <Button variant="contained">Create Drive</Button>
      </Box>

      <Card sx={{ borderRadius: 2, mb: 4 }}>
        <CardContent>
          <Grid container spacing={3} sx={{ alignItems: 'center' }}>
            <Grid size={{ xs: 12, md: 3 }}>
              <Typography variant="h6">Tech Corp Campus Drive</Typography>
              <Typography variant="body2" color="text.secondary">Software Engineer Role</Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 2 }}>
              <Chip label="Shortlisting Phase" color="warning" />
            </Grid>
            <Grid size={{ xs: 12, md: 2 }}>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>142</Typography>
              <Typography variant="body2">Applications</Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 5 }} sx={{ textAlign: 'right' }}>
              <Button variant="outlined" sx={{ mr: 1 }}>View Job</Button>
              <Button variant="contained">Manage Shortlist</Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Typography variant="h6" sx={{ mb: 2 }}>Recent Offers Issued</Typography>
      <Card sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Student</TableCell>
              <TableCell>Employer</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>Jane Smith</TableCell>
              <TableCell>Global Finance LLC</TableCell>
              <TableCell>Financial Analyst</TableCell>
              <TableCell><Chip label="Accepted" color="success" size="small" /></TableCell>
              <TableCell align="right">
                <Button size="small">View Detail</Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Card>
    </Box>
  );
};

export default PlacementDriveManager;
