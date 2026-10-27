import React, { useState } from 'react';
import { Box, Typography, Card, CardContent, Button, Grid, Table, TableBody, TableCell, TableHead, TableRow, Chip, Alert, Tab, Tabs } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import WarningIcon from '@mui/icons-material/Warning';

const LockdownManager: React.FC = () => {
  const [tab, setTab] = useState(0);
  const [activeLockdown] = useState(false);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <LockIcon sx={{ fontSize: 32, color: 'error.main' }} />
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>Emergency Lockdown Manager</Typography>
            <Typography variant="body2" color="text.secondary">Only authorized administrators may activate or clear a lockdown</Typography>
          </Box>
        </Box>
      </Box>

      {activeLockdown && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2, border: '2px solid red' }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>🔴 CAMPUS LOCKDOWN ACTIVE</Typography>
          Activated at 11:45 AM · Scope: Campus-Wide · By: Principal Johnson · All gates locked
        </Alert>
      )}

      {!activeLockdown && (
        <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
          No active lockdown. Campus is operating normally.
        </Alert>
      )}

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ borderRadius: 2, border: '2px solid', borderColor: 'error.main', bgcolor: 'error.50', textAlign: 'center' }}>
            <CardContent sx={{ py: 4 }}>
              <LockIcon sx={{ fontSize: 60, color: 'error.main', mb: 2 }} />
              <Typography variant="h5" sx={{ fontWeight: 700, color: 'error.dark', mb: 1 }}>Campus Lockdown</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Locks all gates and restricts all movement. Requires Principal or Security Head authorization.</Typography>
              <Button variant="contained" color="error" size="large" fullWidth startIcon={<LockIcon />}>Activate Campus Lockdown</Button>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ borderRadius: 2, border: '2px solid', borderColor: 'warning.main', bgcolor: 'warning.50', textAlign: 'center' }}>
            <CardContent sx={{ py: 4 }}>
              <WarningIcon sx={{ fontSize: 60, color: 'warning.main', mb: 2 }} />
              <Typography variant="h5" sx={{ fontWeight: 700, color: 'warning.dark', mb: 1 }}>Zone Lockdown</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Restrict access to a specific building, floor, or zone. Requires Security Head authorization.</Typography>
              <Button variant="contained" color="warning" size="large" fullWidth startIcon={<WarningIcon />}>Activate Zone Lockdown</Button>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ borderRadius: 2, border: '2px solid', borderColor: 'info.main', bgcolor: 'info.50', textAlign: 'center' }}>
            <CardContent sx={{ py: 4 }}>
              <WarningIcon sx={{ fontSize: 60, color: 'info.main', mb: 2 }} />
              <Typography variant="h5" sx={{ fontWeight: 700, color: 'info.dark', mb: 1 }}>Security Alert</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Issue a heightened security alert without full lockdown. Notifies all security personnel.</Typography>
              <Button variant="contained" color="info" size="large" fullWidth>Issue Security Alert</Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
        <strong>⚠ Important:</strong> Activating lockdown is logged with your identity, timestamp, and reason. This system does NOT automatically control physical gate hardware unless a hardware integration is configured by your IT administrator. Manually secure all gates immediately upon activation.
      </Alert>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="Lockdown History" />
        <Tab label="Active Alerts" />
      </Tabs>

      <Card sx={{ borderRadius: 2 }}>
        <CardContent>
          <Table>
            <TableHead><TableRow sx={{ bgcolor: 'grey.50' }}>
              <TableCell>Lockdown ID</TableCell><TableCell>Scope</TableCell><TableCell>Reason</TableCell><TableCell>Triggered By</TableCell><TableCell>Activated</TableCell><TableCell>All-Clear</TableCell><TableCell>Status</TableCell>
            </TableRow></TableHead>
            <TableBody>
              <TableRow>
                <TableCell sx={{ fontFamily: 'monospace' }}>LKD-2026-003</TableCell>
                <TableCell><Chip label="ZONE" size="small" color="warning" /></TableCell>
                <TableCell>Unidentified person in Lab Wing</TableCell>
                <TableCell>Security Head</TableCell>
                <TableCell>Aug 8 · 02:30 PM</TableCell>
                <TableCell>Aug 8 · 03:15 PM</TableCell>
                <TableCell><Chip label="ALL_CLEAR" size="small" color="success" /></TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontFamily: 'monospace' }}>LKD-2026-002</TableCell>
                <TableCell><Chip label="CAMPUS_WIDE" size="small" color="error" /></TableCell>
                <TableCell>Security Threat — External</TableCell>
                <TableCell>Principal</TableCell>
                <TableCell>Jul 22 · 10:05 AM</TableCell>
                <TableCell>Jul 22 · 11:40 AM</TableCell>
                <TableCell><Chip label="ALL_CLEAR" size="small" color="success" /></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </Box>
  );
};

export default LockdownManager;
