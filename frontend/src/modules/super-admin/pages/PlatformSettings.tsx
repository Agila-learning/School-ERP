import { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, CircularProgress, Alert, Divider, Button, TextField, Switch, Stack } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import SaveIcon from '@mui/icons-material/Save';
import { getSettings, bulkUpdateSettings } from '../api/superAdmin.api';

const CATEGORY_LABELS: Record<string, string> = {
  GENERAL: '⚙️ General', BILLING: '💳 Billing', SUBSCRIPTIONS: '📋 Subscriptions', PAYMENT: '💰 Payment Gateway', EMAIL: '📧 Email', SECURITY: '🔒 Security'
};

export default function PlatformSettings() {
  const [settings, setSettings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editedValues, setEditedValues] = useState<Record<string, any>>({});

  useEffect(() => { fetchSettings(); }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await getSettings();
      setSettings(res.data.data);
      const vals: Record<string, any> = {};
      res.data.data.forEach((s: any) => { vals[s.key] = s.value; });
      setEditedValues(vals);
    } catch { setError('Failed to load settings'); }
    finally { setLoading(false); }
  };

  const handleSaveAll = async () => {
    try {
      setSaving(true);
      const settingsToSave = Object.entries(editedValues).map(([key, value]) => ({ key, value }));
      await bulkUpdateSettings(settingsToSave);
      setSuccess('Settings saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch { setError('Failed to save settings'); }
    finally { setSaving(false); }
  };

  const grouped = settings.reduce((acc: Record<string, any[]>, s) => {
    const cat = s.category || 'GENERAL';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(s);
    return acc;
  }, {});

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>;

  return (
    <Box sx={{ p: 4, maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1 }}>
          <SettingsIcon fontSize="large" color="primary" /> Platform Settings
        </Typography>
        <Button variant="contained" startIcon={saving ? <CircularProgress size={16} /> : <SaveIcon />} onClick={handleSaveAll} disabled={saving}>
          {saving ? 'Saving...' : 'Save All Changes'}
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Stack spacing={3}>
        {Object.entries(grouped).map(([category, catSettings]) => (
          <Paper key={category} elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>{CATEGORY_LABELS[category] || category}</Typography>
            <Divider sx={{ mb: 3 }} />
            <Grid container spacing={3}>
              {(catSettings as any[]).map((setting: any) => (
                <Grid key={setting.key} size={{ xs: 12, sm: 6 }}>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>{setting.label}</Typography>
                    {setting.description && <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>{setting.description}</Typography>}
                    {typeof setting.value === 'boolean' ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Switch checked={!!editedValues[setting.key]} onChange={e => setEditedValues({ ...editedValues, [setting.key]: e.target.checked })} />
                        <Typography variant="body2">{editedValues[setting.key] ? 'Enabled' : 'Disabled'}</Typography>
                      </Box>
                    ) : typeof setting.value === 'number' ? (
                      <TextField fullWidth size="small" type="number" value={editedValues[setting.key] ?? setting.value} onChange={e => setEditedValues({ ...editedValues, [setting.key]: Number(e.target.value) })} />
                    ) : (
                      <TextField fullWidth size="small" value={editedValues[setting.key] ?? setting.value ?? ''} onChange={e => setEditedValues({ ...editedValues, [setting.key]: e.target.value })} />
                    )}
                    <Typography variant="caption" color="text.disabled" sx={{ mt: 0.5, display: 'block', fontFamily: 'monospace' }}>{setting.key}</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>
        ))}

        {settings.length === 0 && (
          <Paper elevation={0} sx={{ p: 5, border: '1px solid', borderColor: 'divider', borderRadius: 3, textAlign: 'center' }}>
            <Typography color="text.secondary">No settings found. The backend will auto-seed defaults on next load.</Typography>
          </Paper>
        )}
      </Stack>
    </Box>
  );
}
