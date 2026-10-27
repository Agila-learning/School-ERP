import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, Card, CardContent, Button, Chip, Divider, Alert } from '@mui/material';
import LoginIcon from '@mui/icons-material/ExitToApp';
import LogoutIcon from '@mui/icons-material/PowerSettingsNew';
import { employeeCheckIn, employeeCheckOut, getEmployeeTodayStatus } from '../api/attendance.api';

const EmployeeAttendanceDashboard: React.FC = () => {
  const [checkedIn, setCheckedIn] = useState(false);
  const [checkedOut, setCheckedOut] = useState(false);
  const [checkInTime, setCheckInTime] = useState<string | null>(null);
  const [checkOutTime, setCheckOutTime] = useState<string | null>(null);
  const [message, setMessage] = useState<{type: 'success'|'error', text: string} | null>(null);

  useEffect(() => {
    getEmployeeTodayStatus().then((status) => {
      if (status) {
        if (status.checkInTime) {
          setCheckedIn(true);
          setCheckInTime(new Date(status.checkInTime).toLocaleTimeString());
        }
        if (status.checkOutTime) {
          setCheckedOut(true);
          setCheckOutTime(new Date(status.checkOutTime).toLocaleTimeString());
        }
      }
    }).catch(console.error);
  }, []);

  const handleCheckIn = async () => {
    try {
      setMessage(null);
      const res = await employeeCheckIn({ source: 'WEB' } as any);
      setCheckedIn(true);
      setCheckInTime(new Date(res.event.timestamp).toLocaleTimeString());
      setMessage({ type: 'success', text: res.isLate ? 'Checked in late.' : 'Checked in successfully.' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to check in' });
    }
  };

  const handleCheckOut = async () => {
    try {
      setMessage(null);
      const res = await employeeCheckOut({ source: 'WEB' } as any);
      setCheckedOut(true);
      setCheckOutTime(new Date(res.event.timestamp).toLocaleTimeString());
      setMessage({ type: 'success', text: `Checked out successfully. Duration: ${res.workDurationMinutes} mins.` });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to check out' });
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" sx={{ fontWeight: 700 }} gutterBottom>My Attendance</Typography>

      {/* Check-in / Check-out Panel */}
      <Paper sx={{ p: 4, mb: 4 }}>
        <Typography variant="h6" gutterBottom>Today — {new Date().toDateString()}</Typography>
        <Divider sx={{ mb: 3 }} />
        <Grid container spacing={3} sx={{ alignItems: "center" }}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Button
              variant="contained"
              color="success"
              size="large"
              startIcon={<LoginIcon />}
              fullWidth
              disabled={checkedIn}
              onClick={handleCheckIn}
            >
              {checkedIn ? `Checked In at ${checkInTime}` : 'Check In'}
            </Button>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Button
              variant="contained"
              color="error"
              size="large"
              startIcon={<LogoutIcon />}
              fullWidth
              disabled={!checkedIn || checkedOut}
              onClick={handleCheckOut}
            >
              {checkedOut ? `Checked Out at ${checkOutTime}` : 'Check Out'}
            </Button>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'grey.50' }}>
              <Typography color="textSecondary" variant="body2">Today's Status</Typography>
              <Chip
                label={checkedOut ? 'COMPLETED' : checkedIn ? 'PRESENT' : 'NOT MARKED'}
                color={checkedOut ? 'success' : checkedIn ? 'warning' : 'default'}
                sx={{ mt: 1 }}
              />
            </Paper>
          </Grid>
        </Grid>
        {message && (
          <Alert severity={message.type} sx={{ mt: 3 }}>
            {message.text}
          </Alert>
        )}
      </Paper>

      {/* Monthly Summary */}
      <Grid container spacing={3}>
        {[
          { label: 'Present Days', value: 18, color: 'success.main' },
          { label: 'Absent Days', value: 1, color: 'error.main' },
          { label: 'Late Days', value: 2, color: 'warning.main' },
          { label: 'Leave Days', value: 1, color: 'info.main' },
        ].map(stat => (
          <Grid size={{ xs: 6, md: 3 }} key={stat.label}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" variant="body2">{stat.label}</Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: stat.color }}>{stat.value}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default EmployeeAttendanceDashboard;
