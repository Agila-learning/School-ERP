import React from 'react';
import { Box, Typography, Card, CardContent, Button } from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

const EmergencyCommandCenter: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: 'error.main', display: 'flex', alignItems: 'center' }}>
          <WarningAmberIcon sx={{ mr: 2, fontSize: 32 }} />
          Emergency Command Center
        </Typography>
        <Button variant="contained" color="error" size="large">Declare Emergency</Button>
      </Box>

      <Card sx={{ borderRadius: 2, bgcolor: '#fafafa', mb: 3 }}>
        <CardContent sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300, flexDirection: 'column' }}>
          <Typography variant="h6" color="text.secondary">No Active Emergencies</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>All campus zones are reporting normal status.</Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default EmergencyCommandCenter;
