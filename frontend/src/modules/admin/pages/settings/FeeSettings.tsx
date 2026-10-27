import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, Grid, CircularProgress, Alert } from '@mui/material';
import { useSettings } from '../../hooks/useSettings';

const FeeSettings: React.FC = () => {
  const { loading, saving, saveSettings, getSettingValue, error, success } = useSettings('FEES');
  
  const [formData, setFormData] = useState({
    receiptPrefix: '',
    lateFeePerDay: '',
    currency: '',
  });

  useEffect(() => {
    if (!loading) {
      setFormData({
        receiptPrefix: getSettingValue('RECEIPT_PREFIX', 'REC-'),
        lateFeePerDay: getSettingValue('LATE_FEE_PER_DAY', '50'),
        currency: getSettingValue('CURRENCY', 'INR'),
      });
    }
  }, [loading]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    await saveSettings([
      { key: 'RECEIPT_PREFIX', value: formData.receiptPrefix },
      { key: 'LATE_FEE_PER_DAY', value: formData.lateFeePerDay },
      { key: 'CURRENCY', value: formData.currency },
    ]);
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>Fee & Finance Configuration</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Configure the receipt formats and late fee rules for the finance module.
      </Typography>

      <Alert severity="warning" sx={{ mb: 4 }}>
        Do not store sensitive credentials here. Use the Secure Integrations page for payment gateways.
      </Alert>
      {error && <Alert severity="error" sx={{ mb: 4 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 4 }}>{success}</Alert>}

      <Grid container spacing={3} sx={{ maxWidth: 600 }}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            label="Receipt Prefix"
            name="receiptPrefix"
            value={formData.receiptPrefix}
            onChange={handleChange}
            helperText="e.g. REC-2026-"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            label="Default Currency"
            name="currency"
            value={formData.currency}
            onChange={handleChange}
            helperText="e.g. INR, USD, EUR"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            label="Late Fee Per Day"
            name="lateFeePerDay"
            type="number"
            value={formData.lateFeePerDay}
            onChange={handleChange}
            helperText="Amount added per day after due date"
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

export default FeeSettings;
