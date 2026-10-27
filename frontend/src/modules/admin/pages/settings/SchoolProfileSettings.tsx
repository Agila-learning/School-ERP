import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, Grid, CircularProgress, Alert } from '@mui/material';
import { useSettings } from '../../hooks/useSettings';

const SchoolProfileSettings: React.FC = () => {
  const { loading, saving, saveSettings, getSettingValue, error, success } = useSettings('GENERAL');
  
  const [formData, setFormData] = useState({
    timezone: '',
    dateFormat: '',
    schoolEmail: '',
    schoolPhone: '',
    website: '',
  });

  useEffect(() => {
    if (!loading) {
      setFormData({
        timezone: getSettingValue('TIMEZONE', 'Asia/Kolkata'),
        dateFormat: getSettingValue('DATE_FORMAT', 'DD/MM/YYYY'),
        schoolEmail: getSettingValue('SCHOOL_EMAIL', ''),
        schoolPhone: getSettingValue('SCHOOL_PHONE', ''),
        website: getSettingValue('WEBSITE', ''),
      });
    }
  }, [loading]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    await saveSettings([
      { key: 'TIMEZONE', value: formData.timezone },
      { key: 'DATE_FORMAT', value: formData.dateFormat },
      { key: 'SCHOOL_EMAIL', value: formData.schoolEmail },
      { key: 'SCHOOL_PHONE', value: formData.schoolPhone },
      { key: 'WEBSITE', value: formData.website },
    ]);
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>General School Preferences</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Configure general contact information and locale preferences for the entire school.
      </Typography>

      <Alert severity="info" sx={{ mb: 4 }}>
        Note: The official School Name and Subdomain are managed in the Tenant profile and cannot be changed here.
      </Alert>
      {error && <Alert severity="error" sx={{ mb: 4 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 4 }}>{success}</Alert>}

      <Grid container spacing={3} sx={{ maxWidth: 800 }}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            label="Support Email"
            name="schoolEmail"
            type="email"
            value={formData.schoolEmail}
            onChange={handleChange}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            label="Support Phone"
            name="schoolPhone"
            value={formData.schoolPhone}
            onChange={handleChange}
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <TextField
            fullWidth
            label="Website URL"
            name="website"
            value={formData.website}
            onChange={handleChange}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            label="Timezone"
            name="timezone"
            value={formData.timezone}
            onChange={handleChange}
            helperText="e.g. Asia/Kolkata"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            label="Date Format"
            name="dateFormat"
            value={formData.dateFormat}
            onChange={handleChange}
            helperText="e.g. DD/MM/YYYY"
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

export default SchoolProfileSettings;
