import React from 'react';
import { Box, Typography, Card, CardContent, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';

const ImmunizationTracker: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <SettingsIcon color="primary" sx={{ fontSize: 32 }} />
          <Typography variant="h4" sx={{ fontWeight: 700 }}>Immunization Tracker</Typography>
        </Box>
        <Button variant="contained" color="primary">Record Vaccination</Button>
      </Box>

      <Card sx={{ borderRadius: 2 }}>
        <CardContent>
          <Typography variant="subtitle1" sx={{ mb: 2, color: 'text.secondary' }}>
            Note: This system does not automatically mark a student as non-compliant solely because records are missing. Missing records signify 'Pending Verification' rather than 'Unvaccinated'.
          </Typography>
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead sx={{ bgcolor: 'grey.50' }}>
                <TableRow>
                  <TableCell>Student</TableCell>
                  <TableCell>Vaccine Type</TableCell>
                  <TableCell>Dose</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Provider</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>Alice Brown</TableCell>
                  <TableCell>MMR</TableCell>
                  <TableCell>Dose 2</TableCell>
                  <TableCell>2018-05-12</TableCell>
                  <TableCell>City Clinic</TableCell>
                  <TableCell><Chip label="VERIFIED" size="small" color="success" /></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ImmunizationTracker;
