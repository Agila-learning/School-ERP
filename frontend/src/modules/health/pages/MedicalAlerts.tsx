import React from 'react';
import { Box, Typography, Card, CardContent, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip } from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';

const MedicalAlerts: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <WarningIcon color="error" sx={{ fontSize: 32 }} />
          <Typography variant="h4" sx={{ fontWeight: 700 }}>Medical Alerts</Typography>
        </Box>
        <Button variant="contained" color="error">Add Alert</Button>
      </Box>

      <Card sx={{ borderRadius: 2 }}>
        <CardContent>
          <Typography variant="subtitle1" sx={{ mb: 2, color: 'text.secondary' }}>
            To protect privacy, specific condition details are hidden from this view. These are actionable alerts distributed to authorized teachers/staff.
          </Typography>
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead sx={{ bgcolor: 'grey.50' }}>
                <TableRow>
                  <TableCell>Student</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Visibility</TableCell>
                  <TableCell>Alert Message / Restriction</TableCell>
                  <TableCell>Emergency Instructions</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>Alice Brown</TableCell>
                  <TableCell><Chip label="FOOD_ALLERGY" size="small" color="warning" /></TableCell>
                  <TableCell>Teachers, Cafeteria</TableCell>
                  <TableCell>Strict No Peanut exposure</TableCell>
                  <TableCell>EpiPen in Health Office. Contact Nurse immediately.</TableCell>
                  <TableCell><Chip label="ACTIVE" size="small" color="error" /></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default MedicalAlerts;
