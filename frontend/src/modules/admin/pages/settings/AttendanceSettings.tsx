import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, Grid, CircularProgress, Alert } from '@mui/material';
import { useSettings } from '../../hooks/useSettings';

const AttendanceSettings: React.FC = () => {
  const { loading, saving, saveSettings, getSettingValue, error, success } = useSettings('ATTENDANCE');
  
  const [formData, setFormData] = useState({
    lateThreshold: '',
    minimumAttendancePercentage: '',
    halfDayThreshold: '',
  });

  useEffect(() => {
    if (!loading) {
      setFormData({
        lateThreshold: getSettingValue('LATE_THRESHOLD', '09:15'),
        minimumAttendancePercentage: getSettingValue('MIN_ATTENDANCE_PERCENTAGE', '75'),
        halfDayThreshold: getSettingValue('HALF_DAY_THRESHOLD', '11:00'),
      });
    }
  }, [loading]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    await saveSettings([
      { key: 'LATE_THRESHOLD', value: formData.lateThreshold },
      { key: 'MIN_ATTENDANCE_PERCENTAGE', value: formData.minimumAttendancePercentage },
      { key: 'HALF_DAY_THRESHOLD', value: formData.halfDayThreshold },
    ]);
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>Attendance Configuration</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Configure the core rules for student and staff attendance tracking.
      </Typography>

      <Alert severity="info" sx={{ mb: 4 }}>
        Changes to these settings will affect all future attendance calculations but will not rewrite historical data.
      </Alert>
      {error && <Alert severity="error" sx={{ mb: 4 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 4 }}>{success}</Alert>}

      <Grid container spacing={3} sx={{ maxWidth: 600 }}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            label="Late Threshold (Time)"
            name="lateThreshold"
            type="time"
            value={formData.lateThreshold}
            onChange={handleChange}
            slotProps={{ inputLabel: { shrink: true } }}
            helperText="Students arriving after this time are marked LATE"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            label="Half-Day Threshold (Time)"
            name="halfDayThreshold"
            type="time"
            value={formData.halfDayThreshold}
            onChange={handleChange}
            slotProps={{ inputLabel: { shrink: true } }}
            helperText="Students arriving after this time are marked HALF_DAY"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            label="Minimum Attendance (%)"
            name="minimumAttendancePercentage"
            type="number"
            value={formData.minimumAttendancePercentage}
            onChange={handleChange}
            helperText="Required percentage to sit for final exams"
          />
        </Grid>
      </Grid>

      <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
        <Button 
          variant="contained" 
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </Box>
    </Box>
  );
};

export default AttendanceSettings;
