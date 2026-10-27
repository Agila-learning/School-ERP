import React from 'react';
import { Box, Typography, Card, CardContent, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';

const EmergencyContacts: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <PersonIcon color="primary" sx={{ fontSize: 32 }} />
          <Typography variant="h4" sx={{ fontWeight: 700 }}>Emergency Contacts & Logs</Typography>
        </Box>
        <Button variant="contained" color="primary">Verify Contacts</Button>
      </Box>

      <Card sx={{ borderRadius: 2 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Recent Emergency Contact Logs</Typography>
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead sx={{ bgcolor: 'grey.50' }}>
                <TableRow>
                  <TableCell>Student</TableCell>
                  <TableCell>Contact Name</TableCell>
                  <TableCell>Relationship</TableCell>
                  <TableCell>Method</TableCell>
                  <TableCell>Time Contacted</TableCell>
                  <TableCell>Result</TableCell>
                  <TableCell>Staff</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>Mark Johnson</TableCell>
                  <TableCell>Sarah Johnson</TableCell>
                  <TableCell>Primary Guardian</TableCell>
                  <TableCell>CALL</TableCell>
                  <TableCell>2026-08-10 11:35 AM</TableCell>
                  <TableCell><Chip label="ANSWERED" size="small" color="success" /></TableCell>
                  <TableCell>Nurse Davis</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Lucy White</TableCell>
                  <TableCell>James White</TableCell>
                  <TableCell>Emergency Contact</TableCell>
                  <TableCell>SMS</TableCell>
                  <TableCell>2026-08-10 09:12 AM</TableCell>
                  <TableCell><Chip label="NO_ANSWER" size="small" color="error" /></TableCell>
                  <TableCell>Nurse Davis</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default EmergencyContacts;
