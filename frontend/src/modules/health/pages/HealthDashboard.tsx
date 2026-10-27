import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Grid, Card, CardContent, Divider, Chip, Table, 
  TableBody, TableCell, TableHead, TableRow, Button, CircularProgress 
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useNavigate } from 'react-router-dom';
import { healthApi } from '../api/health.api';
import type { MedicalEmergency, MedicalVisit, HealthIncident } from '../api/health.api';

const HealthDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);
  const [visits, setVisits] = useState<MedicalVisit[]>([]);
  const [emergencies, setEmergencies] = useState<MedicalEmergency[]>([]);
  const [incidents, setIncidents] = useState<HealthIncident[]>([]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [v, e, inc] = await Promise.all([
        healthApi.getVisits(),
        healthApi.getEmergencies(),
        healthApi.getIncidents()
      ]);
      setVisits(v);
      setEmergencies(e);
      setIncidents(inc);
    } catch (err) {
      console.error('Failed to load health dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const activeEmergencies = emergencies.filter(e => e.status === 'UNDER_RESPONSE' || e.status === 'REPORTED');
  const totalVisits = visits.length;
  const firstAidVisits = visits.filter(v => v.visitType === 'FIRST_AID').length;
  const resolvedEmergencies = emergencies.filter(e => e.status === 'RESOLVED' || e.status === 'CLOSED').length;

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center' }}>
          <DashboardIcon sx={{ mr: 2, fontSize: 36, color: 'primary.main' }} />
          Health & Medical Dashboard
        </Typography>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={loadData}>
            Refresh
          </Button>
          <Button variant="contained" color="error" startIcon={<WarningAmberIcon />} onClick={() => navigate('/health/emergency')}>
            Report Emergency
          </Button>
        </Box>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ bgcolor: 'info.main', color: 'white', borderRadius: 2, position: 'relative', overflow: 'hidden' }}>
            <CardContent>
              <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 600 }}>Active Clinic Visits</Typography>
              <Typography variant="h3" sx={{ mt: 1, fontWeight: 700 }}>
                {loading ? <CircularProgress size={30} color="inherit" /> : totalVisits}
              </Typography>
              <LocalHospitalIcon sx={{ position: 'absolute', right: 16, top: 16, opacity: 0.25, fontSize: 60 }} />
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ bgcolor: 'warning.main', color: 'white', borderRadius: 2, position: 'relative', overflow: 'hidden' }}>
            <CardContent>
              <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 600 }}>First Aid Interventions</Typography>
              <Typography variant="h3" sx={{ mt: 1, fontWeight: 700 }}>
                {loading ? <CircularProgress size={30} color="inherit" /> : firstAidVisits}
              </Typography>
              <MedicalServicesIcon sx={{ position: 'absolute', right: 16, top: 16, opacity: 0.25, fontSize: 60 }} />
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ bgcolor: 'error.main', color: 'white', borderRadius: 2, position: 'relative', overflow: 'hidden' }}>
            <CardContent>
              <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 600 }}>Active Emergencies</Typography>
              <Typography variant="h3" sx={{ mt: 1, fontWeight: 700 }}>
                {loading ? <CircularProgress size={30} color="inherit" /> : activeEmergencies.length}
              </Typography>
              <WarningAmberIcon sx={{ position: 'absolute', right: 16, top: 16, opacity: 0.25, fontSize: 60 }} />
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ bgcolor: 'success.main', color: 'white', borderRadius: 2, position: 'relative', overflow: 'hidden' }}>
            <CardContent>
              <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 600 }}>Resolved Emergencies</Typography>
              <Typography variant="h3" sx={{ mt: 1, fontWeight: 700 }}>
                {loading ? <CircularProgress size={30} color="inherit" /> : resolvedEmergencies}
              </Typography>
              <CheckCircleOutlineIcon sx={{ position: 'absolute', right: 16, top: 16, opacity: 0.25, fontSize: 60 }} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Recent Clinic Visits */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Card sx={{ borderRadius: 2, height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>Recent Clinic Visits</Typography>
                <Button size="small" onClick={() => navigate('/admin/health/visits')}>View All</Button>
              </Box>
              <Divider sx={{ mb: 2 }} />
              {visits.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
                  No clinic visits logged yet.
                </Typography>
              ) : (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Visit #</TableCell>
                      <TableCell>Patient</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Time</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {visits.slice(0, 5).map((row) => (
                      <TableRow key={row._id} hover>
                        <TableCell sx={{ fontWeight: 600 }}>{row.visitNumber}</TableCell>
                        <TableCell>{row.studentName || 'Student'}</TableCell>
                        <TableCell><Chip label={row.visitType} size="small" variant="outlined" /></TableCell>
                        <TableCell>{row.time}</TableCell>
                        <TableCell>
                          <Chip label={row.status} size="small" color={row.status === 'COMPLETED' ? 'success' : 'warning'} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Live Emergencies Alert Panel */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Card sx={{ borderRadius: 2, height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: 'error.main' }}>
                  Active Emergency Alerts
                </Typography>
                <Button size="small" color="error" onClick={() => navigate('/health/emergency')}>Manage</Button>
              </Box>
              <Divider sx={{ mb: 2 }} />

              {activeEmergencies.length === 0 ? (
                <Box sx={{ py: 4, textAlign: 'center' }}>
                  <CheckCircleOutlineIcon sx={{ fontSize: 44, color: 'success.main', mb: 1 }} />
                  <Typography variant="body1" fontWeight={600} color="success.dark">
                    All Clear!
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    No active medical emergencies currently reported.
                  </Typography>
                </Box>
              ) : (
                activeEmergencies.slice(0, 4).map((em) => (
                  <Box key={em._id} sx={{ p: 1.5, mb: 1.5, bgcolor: 'error.lighter', border: '1px solid', borderColor: 'error.light', borderRadius: 1.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="subtitle2" fontWeight={700} color="error.dark">
                        {em.emergencyNumber}: {em.personName}
                      </Typography>
                      <Chip label={em.status} size="small" color="error" />
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      Location: {em.location} | {em.time}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.5, color: 'text.primary' }}>
                      {em.symptomsObserved}
                    </Typography>
                  </Box>
                ))
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default HealthDashboard;
