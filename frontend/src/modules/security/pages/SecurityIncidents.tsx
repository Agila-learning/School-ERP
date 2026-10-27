import React from 'react';
import { Box, Typography, Card, CardContent, Button, Table, TableBody, TableCell, TableHead, TableRow, Chip, TextField, Grid } from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import AddIcon from '@mui/icons-material/Add';

const SecurityIncidents: React.FC = () => (
  <Box sx={{ p: 3 }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <WarningIcon sx={{ fontSize: 32, color: 'error.main' }} />
        <Typography variant="h4" sx={{ fontWeight: 700 }}>Security Incidents</Typography>
      </Box>
      <Button variant="contained" color="error" startIcon={<AddIcon />}>Report Incident</Button>
    </Box>
    <Grid container spacing={2} sx={{ mb: 3 }}>
      {[
        { label: 'Open', value: 2, color: 'error.main' },
        { label: 'Investigating', value: 1, color: 'warning.main' },
        { label: 'Resolved Today', value: 3, color: 'success.main' },
        { label: 'This Month', value: 14, color: 'info.main' },
      ].map(s => (
        <Grid size={{ xs: 6, md: 3 }} key={s.label}>
          <Card sx={{ borderRadius: 2, borderTop: 4, borderColor: s.color }}>
            <CardContent><Typography color="text.secondary" variant="subtitle2">{s.label}</Typography><Typography variant="h4" sx={{ fontWeight: 700 }}>{s.value}</Typography></CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
    <Card sx={{ borderRadius: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField size="small" placeholder="Search incidents..." sx={{ flexGrow: 1 }} />
        </Box>
        <Table>
          <TableHead><TableRow sx={{ bgcolor: 'grey.50' }}>
            <TableCell>Incident #</TableCell><TableCell>Type</TableCell><TableCell>Severity</TableCell><TableCell>Location</TableCell><TableCell>Date & Time</TableCell><TableCell>Reported By</TableCell><TableCell>Status</TableCell><TableCell>Actions</TableCell>
          </TableRow></TableHead>
          <TableBody>
            <TableRow>
              <TableCell sx={{ fontFamily: 'monospace', fontWeight: 700 }}>INC-2026-042</TableCell>
              <TableCell>UNAUTHORIZED_ENTRY</TableCell>
              <TableCell><Chip label="HIGH" size="small" color="error" /></TableCell>
              <TableCell>East Gate</TableCell>
              <TableCell>Aug 10 · 08:15 AM</TableCell>
              <TableCell>Guard Mohan</TableCell>
              <TableCell><Chip label="INVESTIGATING" size="small" color="warning" /></TableCell>
              <TableCell><Button size="small" variant="outlined">Manage</Button></TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontFamily: 'monospace', fontWeight: 700 }}>INC-2026-041</TableCell>
              <TableCell>SUSPICIOUS_ACTIVITY</TableCell>
              <TableCell><Chip label="MEDIUM" size="small" color="warning" /></TableCell>
              <TableCell>Parking Lot B</TableCell>
              <TableCell>Aug 10 · 07:50 AM</TableCell>
              <TableCell>Guard Rajesh</TableCell>
              <TableCell><Chip label="REPORTED" size="small" color="info" /></TableCell>
              <TableCell><Button size="small" variant="outlined">Manage</Button></TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontFamily: 'monospace', fontWeight: 700 }}>INC-2026-040</TableCell>
              <TableCell>THEFT</TableCell>
              <TableCell><Chip label="HIGH" size="small" color="error" /></TableCell>
              <TableCell>Computer Lab</TableCell>
              <TableCell>Aug 9 · 03:30 PM</TableCell>
              <TableCell>IT Staff</TableCell>
              <TableCell><Chip label="RESOLVED" size="small" color="success" /></TableCell>
              <TableCell><Button size="small" variant="outlined" disabled>Closed</Button></TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  </Box>
);

export default SecurityIncidents;
