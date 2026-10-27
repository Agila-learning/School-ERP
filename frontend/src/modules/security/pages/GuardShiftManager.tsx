import React from 'react';
import { Box, Typography, Card, CardContent, Button, Table, TableBody, TableCell, TableHead, TableRow, Chip, Grid } from '@mui/material';
import BadgeIcon from '@mui/icons-material/Badge';
import AddIcon from '@mui/icons-material/Add';

const GuardShiftManager: React.FC = () => (
  <Box sx={{ p: 3 }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <BadgeIcon sx={{ fontSize: 32, color: 'primary.main' }} />
        <Typography variant="h4" sx={{ fontWeight: 700 }}>Guard Shift Management</Typography>
      </Box>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button variant="outlined">Record Handover</Button>
        <Button variant="contained" startIcon={<AddIcon />}>Schedule Shift</Button>
      </Box>
    </Box>
    <Grid container spacing={2} sx={{ mb: 3 }}>
      {[{ label: 'On Duty Now', value: 6, color: 'success.main' }, { label: 'Scheduled Today', value: 9, color: 'primary.main' }, { label: 'Absent Today', value: 1, color: 'error.main' }, { label: 'Handovers Pending', value: 2, color: 'warning.main' }].map(s => (
        <Grid size={{ xs: 6, md: 3 }} key={s.label}>
          <Card sx={{ borderRadius: 2, borderTop: 4, borderColor: s.color }}>
            <CardContent><Typography color="text.secondary" variant="subtitle2">{s.label}</Typography><Typography variant="h4" sx={{ fontWeight: 700 }}>{s.value}</Typography></CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
    <Card sx={{ borderRadius: 2 }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Today's Shift Schedule</Typography>
        <Table>
          <TableHead><TableRow sx={{ bgcolor: 'grey.50' }}>
            <TableCell>Guard</TableCell><TableCell>Shift</TableCell><TableCell>Gate / Post</TableCell><TableCell>Start Time</TableCell><TableCell>End Time</TableCell><TableCell>Check-in</TableCell><TableCell>Supervisor</TableCell><TableCell>Status</TableCell>
          </TableRow></TableHead>
          <TableBody>
            {[
              { name: 'Mohan Lal', shift: 'Morning', gate: 'Main Gate (North)', start: '06:00 AM', end: '02:00 PM', checkin: '05:58 AM', sup: 'Insp. Kumar', status: 'ACTIVE' },
              { name: 'Suresh Nair', shift: 'Morning', gate: 'Staff Entrance (East)', start: '06:00 AM', end: '02:00 PM', checkin: '06:02 AM', sup: 'Insp. Kumar', status: 'ACTIVE' },
              { name: 'Rajesh Pillai', shift: 'Afternoon', gate: 'Main Gate (North)', start: '02:00 PM', end: '10:00 PM', checkin: '—', sup: 'Insp. Singh', status: 'SCHEDULED' },
              { name: 'Vijay Singh', shift: 'Morning', gate: 'Delivery Gate (West)', start: '06:00 AM', end: '02:00 PM', checkin: '—', sup: 'Insp. Kumar', status: 'ABSENT' },
            ].map(row => (
              <TableRow key={row.name}>
                <TableCell><Typography variant="body2" sx={{ fontWeight: 600 }}>{row.name}</Typography></TableCell>
                <TableCell>{row.shift}</TableCell>
                <TableCell>{row.gate}</TableCell>
                <TableCell>{row.start}</TableCell>
                <TableCell>{row.end}</TableCell>
                <TableCell sx={{ color: row.checkin === '—' ? 'text.secondary' : 'success.main', fontWeight: row.checkin !== '—' ? 600 : 400 }}>{row.checkin}</TableCell>
                <TableCell>{row.sup}</TableCell>
                <TableCell>
                  <Chip label={row.status} size="small"
                    color={row.status === 'ACTIVE' ? 'success' : row.status === 'SCHEDULED' ? 'info' : 'error'} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  </Box>
);

export default GuardShiftManager;
