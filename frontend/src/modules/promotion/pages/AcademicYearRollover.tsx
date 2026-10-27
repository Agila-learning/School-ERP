import React, { useState } from 'react';
import { 
  Box, Typography, Paper, Button, Alert, List, ListItem, 
  ListItemIcon, ListItemText, Divider, Checkbox, FormControlLabel, CircularProgress 
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import ErrorIcon from '@mui/icons-material/Error';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const AcademicYearRollover: React.FC = () => {
  const [confirmed, setConfirmed] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [status, setStatus] = useState<'IDLE' | 'VALIDATING' | 'READY' | 'COMPLETED'>('IDLE');

  const handleValidate = () => {
    setStatus('VALIDATING');
    setTimeout(() => setStatus('READY'), 1500);
  };

  const handleExecute = () => {
    setExecuting(true);
    setTimeout(() => {
      setExecuting(false);
      setStatus('COMPLETED');
    }, 3000);
  };

  if (status === 'COMPLETED') {
    return (
      <Box sx={{ p: 3, maxWidth: 800, mx: 'auto', textAlign: 'center', mt: 10 }}>
        <CheckCircleIcon color="success" sx={{ fontSize: 80, mb: 2 }} />
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2 }}>Rollover Successful</Typography>
        <Typography variant="body1" color="text.secondary">
          The 2025-26 Academic Year has been successfully finalized. 1,200 students have been migrated to the 2026-27 Academic Year.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'error.main' }}>Academic Year Rollover</Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
          This is a critical operation. It finalizes the current academic year, permanently records promotion histories, and shifts all active students into their new allocated classes for the upcoming year.
        </Typography>
      </Box>

      {status === 'IDLE' && (
        <Paper variant="outlined" sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Step 1: Validate System Readiness</Typography>
          <Button variant="contained" size="large" onClick={handleValidate}>Validate Constraints</Button>
        </Paper>
      )}

      {status === 'VALIDATING' && (
        <Paper variant="outlined" sx={{ p: 5, textAlign: 'center' }}>
          <CircularProgress size={40} sx={{ mb: 2 }} />
          <Typography>Scanning for pending results, unapproved promotions, and allocation conflicts...</Typography>
        </Paper>
      )}

      {status === 'READY' && (
        <Paper variant="outlined" sx={{ p: 3 }}>
          <Alert severity="success" sx={{ mb: 3 }}>
            Validation Passed. The system is ready for rollover.
          </Alert>
          
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>Pre-flight Checklist</Typography>
          <List>
            <ListItem>
              <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
              <ListItemText primary="All examination results published" />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
              <ListItemText primary="All promotion decisions approved (1,200/1,200)" />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
              <ListItemText primary="All section allocations resolved" />
            </ListItem>
            <ListItem>
              <ListItemIcon><ErrorIcon color="warning" /></ListItemIcon>
              <ListItemText primary="Warning: 15 students have pending supplementary exams" secondary="These students will be rolled over conditionally." />
            </ListItem>
          </List>

          <Divider sx={{ my: 3 }} />

          <Alert severity="error" icon={<LockIcon />} sx={{ mb: 3 }}>
            <strong>Warning: This action is irreversible via the UI.</strong> Historical data for the current year will become read-only.
          </Alert>

          <FormControlLabel 
            control={<Checkbox checked={confirmed} onChange={e => setConfirmed(e.target.checked)} />} 
            label="I confirm that I want to finalize the 2025-26 academic year."
          />

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button 
              variant="contained" 
              color="error" 
              size="large" 
              disabled={!confirmed || executing}
              onClick={handleExecute}
            >
              {executing ? 'Executing Transaction...' : 'Execute Rollover'}
            </Button>
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default AcademicYearRollover;
