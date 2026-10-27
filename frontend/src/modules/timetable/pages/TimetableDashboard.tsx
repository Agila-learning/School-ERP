import React, { useEffect, useState } from 'react';
import { 
  Box, Typography, Paper, Grid, Card, CardContent, CircularProgress,
  List, ListItem, ListItemText, ListItemIcon, Chip, Divider
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutlineOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined';
import { getTimetableVersions, getConflicts, getTimetableDashboardStats } from '../api/timetable.api';
import type { TimetableVersion, TimetableConflict } from '../api/timetable.api';

const TimetableDashboard: React.FC = () => {
  const [activeVersion, setActiveVersion] = useState<TimetableVersion | null>(null);
  const [conflicts, setConflicts] = useState<TimetableConflict[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      const versions = await getTimetableVersions();
      const active = versions.find(v => v.status === 'PUBLISHED') || versions[0] || null;
      setActiveVersion(active);

      if (active) {
        const confs = await getConflicts(active.id);
        setConflicts(confs.filter(c => !c.isResolved));
        
        try {
          const dashboardStats = await getTimetableDashboardStats(active.id);
          setStats(dashboardStats);
        } catch (err) {
          console.error("Failed to fetch stats", err);
        }
      }
      setLoading(false);
    };
    fetchDashboard();
  }, []);

  if (loading) return <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress /></Box>;

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: 'auto', bgcolor: '#f8f9fa', minHeight: '100vh' }}>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>Timetable Dashboard</Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Overview of the current scheduling state across the organization.
      </Typography>

      {/* Active Version Banner */}
      <Paper elevation={0} sx={{ p: 3, mb: 4, borderRadius: 3, borderLeft: '6px solid', borderColor: 'primary.main', bgcolor: 'white' }}>
        <Grid container spacing={3} sx={{ alignItems: 'center' }}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Typography variant="overline" color="primary" sx={{ fontWeight: 700 }}>ACTIVE TIMETABLE</Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, mt: 0.5 }}>
              {activeVersion ? activeVersion.name : 'No Active Timetable'}
            </Typography>
            {activeVersion && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Effective from {activeVersion.effectiveFrom} | v{activeVersion.versionNumber}
              </Typography>
            )}
          </Grid>
          <Grid size={{ xs: 12, md: 4 }} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
            {activeVersion && <Chip label={activeVersion.status} color="success" sx={{ fontWeight: 600 }} />}
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={4}>
        {/* Quick Stats */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Card sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                <CardContent>
                  <Typography color="text.secondary" variant="body2" gutterBottom>Classes Scheduled</Typography>
                  <Typography variant="h3" sx={{ fontWeight: 700, color: '#1976d2' }}>
                    {stats?.classesScheduled || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Card sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                <CardContent>
                  <Typography color="text.secondary" variant="body2" gutterBottom>Teachers Scheduled</Typography>
                  <Typography variant="h3" sx={{ fontWeight: 700, color: '#2e7d32' }}>
                    {stats?.teachersScheduled || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Card sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                <CardContent>
                  <Typography color="text.secondary" variant="body2" gutterBottom>Rooms Utilized</Typography>
                  <Typography variant="h3" sx={{ fontWeight: 700, color: '#f57c00' }}>
                    {stats?.roomsUtilized || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Timetable Completeness / Unscheduled */}
            <Grid size={{ xs: 12 }}>
              <Card sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <EventAvailableIcon color="info" />
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>Scheduling Completeness</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Based on academic subject requirements vs scheduled periods.
                  </Typography>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Total Required Periods: {stats?.totalPeriodsRequired || 0}
                    </Typography>
                    <Typography variant="body2" color="success.main" sx={{ fontWeight: 600 }}>
                      Scheduled: {stats?.totalPeriodsScheduled || 0} (
                      {stats?.totalPeriodsRequired ? Math.round((stats.totalPeriodsScheduled / stats.totalPeriodsRequired) * 100) : 0}%)
                    </Typography>
                  </Box>
                  <Box sx={{ width: '100%', height: 10, bgcolor: 'grey.200', borderRadius: 5, overflow: 'hidden' }}>
                    <Box 
                      sx={{ 
                        width: `${stats?.totalPeriodsRequired ? Math.min(100, (stats.totalPeriodsScheduled / stats.totalPeriodsRequired) * 100) : 0}%`, 
                        height: '100%', 
                        bgcolor: 'success.main' 
                      }} 
                    />
                  </Box>
                  
                  <Box sx={{ mt: 3, p: 2, bgcolor: 'warning.light', borderRadius: 2, color: 'warning.dark' }}>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {Math.max(0, (stats?.totalPeriodsRequired || 0) - (stats?.totalPeriodsScheduled || 0))} periods remaining to be scheduled.
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        {/* Conflicts Panel */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.03)', height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <ErrorOutlineIcon color="error" />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>Active Conflicts</Typography>
                <Chip label={conflicts.length} color="error" size="small" sx={{ ml: 'auto', fontWeight: 700 }} />
              </Box>
              <Divider sx={{ mb: 2 }} />
              
              {conflicts.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <CheckCircleOutlineIcon color="success" sx={{ fontSize: 40, mb: 1, opacity: 0.5 }} />
                  <Typography variant="body2" color="text.secondary">No active conflicts detected in this timetable version.</Typography>
                </Box>
              ) : (
                <List disablePadding>
                  {conflicts.map(conflict => (
                    <ListItem key={conflict.id} sx={{ px: 0, py: 1.5, alignItems: 'flex-start' }}>
                      <ListItemIcon sx={{ minWidth: 40, mt: 0.5 }}>
                        <WarningAmberIcon color={conflict.severity === 'ERROR' ? 'error' : 'warning'} />
                      </ListItemIcon>
                      <ListItemText 
                        primary={<Typography variant="body2" sx={{ fontWeight: 700 }}>{conflict.conflictType.replace(/_/g, ' ')}</Typography>}
                        secondary={<Typography variant="caption" color="text.secondary">{conflict.description}</Typography>}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TimetableDashboard;
