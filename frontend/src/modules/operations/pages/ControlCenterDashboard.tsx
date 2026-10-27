import React from 'react';
import { Box, Typography, Card, CardContent, Grid, Button, Divider, Chip } from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import AssignmentIcon from '@mui/icons-material/Assignment';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';

const ControlCenterDashboard: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>Control Center</Typography>
        <Button variant="contained" color="primary">Global Search</Button>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card sx={{ borderTop: 4, borderColor: 'primary.main', borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography color="text.secondary">Pending Approvals</Typography>
                <TaskAltIcon color="primary" />
              </Box>
              <Typography variant="h3" sx={{ mt: 1 }}>24</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card sx={{ borderTop: 4, borderColor: 'warning.main', borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography color="text.secondary">Overdue Tasks</Typography>
                <AssignmentIcon color="warning" />
              </Box>
              <Typography variant="h3" sx={{ mt: 1 }}>12</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card sx={{ borderTop: 4, borderColor: 'info.main', borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography color="text.secondary">Open Requests</Typography>
                <AssignmentIcon color="info" />
              </Box>
              <Typography variant="h3" sx={{ mt: 1 }}>89</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card sx={{ borderTop: 4, borderColor: 'error.main', borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography color="text.secondary">SLA Breaches</Typography>
                <ReportProblemIcon color="error" />
              </Box>
              <Typography variant="h3" sx={{ mt: 1 }}>3</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ borderRadius: 2, height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <WarningAmberIcon color="error" sx={{ mr: 1 }} />
                <Typography variant="h6">Critical Alerts</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2">Database Backup Failed</Typography>
                <Typography variant="body2" color="text.secondary">System Exception • 10 mins ago</Typography>
                <Chip size="small" color="error" label="Requires Acknowledgement" sx={{ mt: 1 }} />
              </Box>
              <Box>
                <Typography variant="subtitle2">Finance Approval SLA Breached</Typography>
                <Typography variant="body2" color="text.secondary">Workflow • 1 hour ago</Typography>
                <Chip size="small" color="warning" label="Escalated to Principal" sx={{ mt: 1 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ borderRadius: 2, height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Global Activity Feed</Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2"><strong>Alex Admin</strong> approved Purchase Request #442.</Typography>
                <Typography variant="caption" color="text.secondary">2 mins ago</Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2"><strong>System</strong> escalated Fee Reminder Task to Finance Head.</Typography>
                <Typography variant="caption" color="text.secondary">15 mins ago</Typography>
              </Box>
              <Box>
                <Typography variant="body2"><strong>Jane Teacher</strong> created a Facility Maintenance request.</Typography>
                <Typography variant="caption" color="text.secondary">1 hour ago</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ControlCenterDashboard;
