import React from 'react';
import { Card, CardContent, Typography, Box, Divider, CircularProgress } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoIcon from '@mui/icons-material/Info';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import type { RecentActivity } from '../api/adminDashboard.api';

interface RecentActivityWidgetProps {
  activities: RecentActivity[];
  loading?: boolean;
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'success': return <CheckCircleIcon color="success" fontSize="small" />;
    case 'warning': return <WarningIcon color="warning" fontSize="small" />;
    case 'error': return <ErrorIcon color="error" fontSize="small" />;
    default: return <InfoIcon color="info" fontSize="small" />;
  }
};

const RecentActivityWidget: React.FC<RecentActivityWidgetProps> = ({ activities, loading }) => {
  return (
    <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, height: '100%' }}>
      <CardContent>
        <Typography variant="h6" sx={{ fontWeight: 700 }} gutterBottom>
          Recent Activity
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : activities.length === 0 ? (
          <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
            No recent activities found.
          </Typography>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {activities.map((activity) => (
              <Box key={activity.id} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                <Box sx={{ mt: 0.5 }}>{getStatusIcon(activity.status)}</Box>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {activity.action}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {activity.user} • {activity.time}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentActivityWidget;
