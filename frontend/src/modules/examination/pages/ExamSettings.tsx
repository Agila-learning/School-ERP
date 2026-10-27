import React, { useState } from 'react';
import { 
  Box, Typography, Paper, Grid, TextField, Button, Switch, 
  FormControlLabel, Divider, Alert
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';

const ExamSettings: React.FC = () => {
  const [settings, setSettings] = useState<any>({
    graceMarksLimit: 5,
    allowNegativeMarking: false,
    strictAttendance: true,
    minAttendancePercentage: 75,
    publishResultsAuto: false,
    hideRankings: false
  });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    // Connect to actual API in full implementation
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <Box sx={{ p: 3, maxWidth: 900, mx: 'auto' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>Global Exam Settings</Typography>
        <Typography variant="body2" color="text.secondary">Configure institution-wide rules for assessments and results</Typography>
      </Box>

      {saved && <Alert severity="success" sx={{ mb: 3 }}>Settings saved successfully</Alert>}

      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>Evaluation Rules</Typography>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField 
              type="number" 
              label="Max Grace Marks Allowed" 
              fullWidth 
              value={settings.graceMarksLimit} 
              onChange={e => setSettings({ ...settings, graceMarksLimit: Number(e.target.value) })} 
              helperText="Maximum points a teacher can award as grace"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControlLabel 
              control={<Switch checked={settings.allowNegativeMarking} onChange={e => setSettings({ ...settings, allowNegativeMarking: e.target.checked })} />} 
              label="Allow Negative Marking" 
              sx={{ mt: 1 }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', ml: 4 }}>
              If enabled, marks can drop below zero for specific exam components.
            </Typography>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>Attendance Requirements</Typography>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControlLabel 
              control={<Switch checked={settings.strictAttendance} onChange={e => setSettings({ ...settings, strictAttendance: e.target.checked })} />} 
              label="Enforce Minimum Attendance" 
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField 
              type="number" 
              label="Min Attendance %" 
              fullWidth 
              disabled={!settings.strictAttendance}
              value={settings.minAttendancePercentage} 
              onChange={e => setSettings({ ...settings, minAttendancePercentage: Number(e.target.value) })} 
              helperText="Students below this % will be marked as Not Eligible"
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>Result Publishing & Privacy</Typography>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControlLabel 
              control={<Switch checked={settings.publishResultsAuto} onChange={e => setSettings({ ...settings, publishResultsAuto: e.target.checked })} />} 
              label="Auto-Publish Approved Results" 
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControlLabel 
              control={<Switch checked={settings.hideRankings} onChange={e => setSettings({ ...settings, hideRankings: e.target.checked })} />} 
              label="Hide Student Rankings Globally" 
            />
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', ml: 4 }}>
              If enabled, students will only see their own performance band/percentile, not an explicit class rank.
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSave}>Save Configuration</Button>
      </Box>
    </Box>
  );
};

export default ExamSettings;
