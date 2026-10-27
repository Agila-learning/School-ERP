import React from 'react';
import { Box, Typography, Card, CardContent, Button, Grid, Table, TableHead, TableRow, TableCell, TableBody, Chip } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';

const CounselingPortal: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>Counseling Portal</Typography>
        <Button variant="contained">Book Appointment</Button>
      </Box>
      
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Upcoming Appointments</Typography>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Student</TableCell>
                    <TableCell>Mode</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>Oct 24, 2026 - 10:00 AM</TableCell>
                    <TableCell>Alex Chen (Grade 12)</TableCell>
                    <TableCell>In Person</TableCell>
                    <TableCell><Chip label="Confirmed" size="small" color="success" /></TableCell>
                    <TableCell align="right">
                      <Button size="small">Join/Start</Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ borderRadius: 2, bgcolor: 'error.50' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <LockIcon color="error" sx={{ mr: 1 }} />
                <Typography variant="h6">Private Notes</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Counseling notes are strictly confidential and restricted to authorized counselors only.
              </Typography>
              <Button variant="outlined" color="error" fullWidth sx={{ mt: 2 }}>Access Secure Notes</Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CounselingPortal;
