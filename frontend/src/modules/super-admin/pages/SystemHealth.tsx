import { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, Card, CardContent, Chip, LinearProgress, CircularProgress, Alert, Divider, Table, TableBody, TableCell, TableContainer, TableRow } from '@mui/material';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import { getSystemHealth } from '../api/superAdmin.api';

const ServiceStatusIcon = ({ status }: { status: string }) => {
  if (status === 'OPERATIONAL') return <CheckCircleIcon color="success" />;
  if (status === 'DOWN') return <ErrorIcon color="error" />;
  return <WarningIcon color="warning" />;
};

export default function SystemHealth() {
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 30000); // auto-refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchHealth = async () => {
    try {
      const res = await getSystemHealth();
      setHealth(res.data.data);
      setLastChecked(new Date());
      setError('');
    } catch { setError('Failed to fetch health status'); }
    finally { setLoading(false); }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress size={60} /></Box>;

  const overallColor = health?.overallStatus === 'OPERATIONAL' ? 'success' : health?.overallStatus === 'DEGRADED' ? 'warning' : 'error';

  return (
    <Box sx={{ p: 4, maxWidth: 1400, mx: 'auto' }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1 }}>
          <MonitorHeartIcon fontSize="large" color="primary" /> System Health
        </Typography>
        <Box sx={{ textAlign: 'right' }}>
          <Chip label={health?.overallStatus || 'UNKNOWN'} color={overallColor as any} size="medium" sx={{ fontWeight: 700, fontSize: '1rem', px: 2 }} />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
            Last checked: {lastChecked?.toLocaleTimeString()} • Auto-refreshes every 30s
          </Typography>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Services */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {(health?.services || []).map((service: any) => (
          <Grid key={service.name} size={{ xs: 12, sm: 6, md: 3 }}>
            <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <ServiceStatusIcon status={service.status} />
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{service.name}</Typography>
                  <Chip size="small" label={service.status} color={service.status === 'OPERATIONAL' ? 'success' : service.status === 'DOWN' ? 'error' : 'warning'} />
                  {service.latency > 0 && <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>{service.latency}ms</Typography>}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Server Metrics */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Server Metrics</Typography>
            <Divider sx={{ mb: 2 }} />
            <TableContainer>
              <Table size="small">
                <TableBody>
                  {[
                    { label: 'Uptime', value: health?.server?.uptimeFormatted },
                    { label: 'Node.js Version', value: health?.server?.nodeVersion },
                    { label: 'Platform', value: health?.server?.platform },
                    { label: 'CPU Load (1m)', value: health?.server?.cpuLoad },
                  ].map(row => (
                    <TableRow key={row.label}>
                      <TableCell sx={{ color: 'text.secondary', border: 'none' }}>{row.label}</TableCell>
                      <TableCell sx={{ fontWeight: 600, border: 'none' }}>{row.value}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Memory Usage</Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">Heap Memory</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>{health?.server?.memoryUsedMB}MB / {health?.server?.memoryTotalMB}MB</Typography>
              </Box>
              <LinearProgress variant="determinate" value={Math.min(((health?.server?.memoryUsedMB || 0) / (health?.server?.memoryTotalMB || 1)) * 100, 100)} sx={{ height: 10, borderRadius: 5 }} color={((health?.server?.memoryUsedMB || 0) / (health?.server?.memoryTotalMB || 1)) > 0.8 ? 'error' : 'primary'} />
            </Box>
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">System Memory</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>{((health?.server?.systemTotalMB || 0) - (health?.server?.systemFreeMB || 0))}MB used / {health?.server?.systemTotalMB}MB total</Typography>
              </Box>
              <LinearProgress variant="determinate" value={Math.min(((( health?.server?.systemTotalMB || 1) - (health?.server?.systemFreeMB || 0)) / (health?.server?.systemTotalMB || 1)) * 100, 100)} sx={{ height: 10, borderRadius: 5 }} color="info" />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
