import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Grid, Card, CardContent, Chip, Table, TableBody,
  TableCell, TableHead, TableRow, Alert, Button, Divider, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField, MenuItem,
  CircularProgress, IconButton, Tooltip, Snackbar
} from '@mui/material';
import SecurityIcon from '@mui/icons-material/Security';
import PeopleIcon from '@mui/icons-material/People';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import WarningIcon from '@mui/icons-material/Warning';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import ChildCareIcon from '@mui/icons-material/ChildCare';
import LockIcon from '@mui/icons-material/Lock';
import RefreshIcon from '@mui/icons-material/Refresh';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import {
  getSecurityDashboardStats,
  getGates,
  getGateEntries,
  recordGateEntry,
  recordGateExit,
  getSecurityIncidents,
  reportSecurityIncident,
  type SecurityDashboardStats,
  type Gate,
  type GateEntry
} from '../api/security.api';

const StatCard: React.FC<{ label: string; value: number | string; color: string; icon: React.ReactNode; alert?: boolean }> = ({ label, value, color, icon, alert }) => (
  <Card sx={{ borderRadius: 3, borderLeft: `5px solid`, borderColor: color, height: '100%', bgcolor: alert ? 'error.50' : 'background.paper', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
    <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2.5 }}>
      <Box>
        <Typography variant="body2" color="text.secondary" fontWeight={600}>{label}</Typography>
        <Typography variant="h4" sx={{ fontWeight: 800, color: alert ? 'error.main' : 'text.primary', my: 0.5 }}>{value}</Typography>
      </Box>
      <Box sx={{ color, opacity: 0.8, '& svg': { fontSize: 40 } }}>{icon}</Box>
    </CardContent>
  </Card>
);

const CampusSecurityDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<SecurityDashboardStats | null>(null);
  const [gates, setGates] = useState<Gate[]>([]);
  const [entries, setEntries] = useState<GateEntry[]>([]);
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Quick Entry Modal
  const [entryModalOpen, setEntryModalOpen] = useState(false);
  const [entryForm, setEntryForm] = useState({
    personName: '',
    personType: 'VISITOR',
    gateId: '',
    vehicleNumber: '',
    notes: ''
  });

  // Incident Modal
  const [incidentModalOpen, setIncidentModalOpen] = useState(false);
  const [incidentForm, setIncidentForm] = useState({
    title: '',
    category: 'UNAUTHORIZED_ACCESS',
    severity: 'MEDIUM',
    location: '',
    description: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsData, gatesData, entriesData, incidentsData] = await Promise.all([
        getSecurityDashboardStats().catch(() => null),
        getGates().catch(() => []),
        getGateEntries().catch(() => []),
        getSecurityIncidents().catch(() => [])
      ]);
      setStats(statsData);
      setGates(gatesData);
      setEntries(entriesData);
      setIncidents(incidentsData);
      if (gatesData.length > 0 && !entryForm.gateId) {
        setEntryForm(prev => ({ ...prev, gateId: gatesData[0]._id }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleRecordEntry = async () => {
    if (!entryForm.personName.trim()) return;
    try {
      setSubmitting(true);
      await recordGateEntry(entryForm);
      setToast({ open: true, message: 'Gate entry registered in real time', severity: 'success' });
      setEntryModalOpen(false);
      setEntryForm({ personName: '', personType: 'VISITOR', gateId: gates[0]?._id || '', vehicleNumber: '', notes: '' });
      loadData();
    } catch (err: any) {
      setToast({ open: true, message: err?.response?.data?.message || 'Failed to record entry', severity: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRecordExit = async (entryId: string) => {
    try {
      await recordGateExit(entryId);
      setToast({ open: true, message: 'Exit recorded successfully', severity: 'success' });
      loadData();
    } catch (err: any) {
      setToast({ open: true, message: err?.response?.data?.message || 'Failed to record exit', severity: 'error' });
    }
  };

  const handleReportIncident = async () => {
    if (!incidentForm.title.trim()) return;
    try {
      setSubmitting(true);
      await reportSecurityIncident(incidentForm);
      setToast({ open: true, message: 'Incident logged & dispatched to safety officers', severity: 'success' });
      setIncidentModalOpen(false);
      setIncidentForm({ title: '', category: 'UNAUTHORIZED_ACCESS', severity: 'MEDIUM', location: '', description: '' });
      loadData();
    } catch (err: any) {
      setToast({ open: true, message: err?.response?.data?.message || 'Failed to report incident', severity: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#f8fafc', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <SecurityIcon sx={{ fontSize: 40, color: 'primary.main' }} />
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>Campus Security Dashboard</Typography>
            <Typography variant="body2" color="text.secondary">Real-time gate access telemetry, perimeter alerts, and live incident operations</Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            startIcon={<QrCodeScannerIcon />}
            onClick={() => navigate('/security/watchman')}
            sx={{
              borderRadius: 2,
              fontWeight: 800,
              bgcolor: '#0284c7',
              color: '#ffffff',
              boxShadow: '0 4px 14px rgba(2, 132, 199, 0.35)',
              '&:hover': { bgcolor: '#0369a1' }
            }}
          >
            Watchman Gate & Bus Desk
          </Button>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={loadData} sx={{ borderRadius: 2 }}>
            Refresh
          </Button>
          <Button variant="contained" color="secondary" startIcon={<AddCircleIcon />} onClick={() => setEntryModalOpen(true)} sx={{ borderRadius: 2 }}>
            Log Gate Entry
          </Button>
          <Button variant="contained" color="error" startIcon={<WarningIcon />} onClick={() => setIncidentModalOpen(true)} sx={{ borderRadius: 2 }}>
            Report Incident
          </Button>
        </Box>
      </Box>

      {/* Active Alerts Banner */}
      {stats && stats.activeAlerts > 0 ? (
        <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
          <strong>{stats.activeAlerts} Active Security Alerts</strong> — High perimeter monitoring in effect.
        </Alert>
      ) : (
        <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
          All campus perimeters and checkpoints operating under <strong>NORMAL STATUS</strong>.
        </Alert>
      )}

      {/* Primary Telemetry Stats */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard label="Today's Total Entries" value={stats?.todayEntries ?? (loading ? '...' : 0)} color="#0284c7" icon={<PeopleIcon />} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard label="Visitors & Guests Inside" value={stats?.visitorsInside ?? (loading ? '...' : 0)} color="#16a34a" icon={<PeopleIcon />} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard label="Vehicles On Campus" value={stats?.vehiclesInside ?? (loading ? '...' : 0)} color="#9333ea" icon={<DirectionsCarIcon />} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard label="Pending Student Pickups" value={stats?.pendingPickups ?? (loading ? '...' : 0)} color="#ea580c" icon={<ChildCareIcon />} />
        </Grid>
      </Grid>

      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard label="Deliveries Processed" value={stats?.deliveriesToday ?? (loading ? '...' : 0)} color="#0d9488" icon={<LocalShippingIcon />} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard label="Active Incidents" value={stats?.activeIncidents ?? (loading ? '...' : 0)} color="#dc2626" icon={<WarningIcon />} alert={(stats?.activeIncidents || 0) > 0} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard label="Unclaimed Lost Items" value={stats?.lostFoundUnclaimed ?? (loading ? '...' : 0)} color="#d97706" icon={<SecurityIcon />} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard label="Lockdown Status" value={stats?.activeLockdowns ? 'ACTIVE' : 'ALL CLEAR'} color={stats?.activeLockdowns ? '#dc2626' : '#16a34a'} icon={<LockIcon />} alert={!!stats?.activeLockdowns} />
        </Grid>
      </Grid>

      {/* Live Gate Status & Real-Time Log */}
      <Grid container spacing={3}>
        {/* Live Gate Status */}
        <Grid item xs={12} md={5}>
          <Card sx={{ borderRadius: 3, height: '100%', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>Registered Security Gates</Typography>
                <Chip label={`${gates.length} Checkpoints`} size="small" color="primary" />
              </Box>
              <Divider sx={{ mb: 2 }} />

              {gates.length === 0 ? (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">Default gates operational: Main Gate (North), Staff Gate (East), Delivery Gate (West).</Typography>
                </Box>
              ) : (
                gates.map(gate => (
                  <Box key={gate._id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, p: 2, borderRadius: 2, bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{gate.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {gate.location || 'Campus Gate'} • Hours: {gate.operatingHoursStart || '06:00'} - {gate.operatingHoursEnd || '22:00'}
                      </Typography>
                    </Box>
                    <Chip label={gate.emergencyStatus || 'NORMAL'} size="small" color={gate.emergencyStatus === 'NORMAL' ? 'success' : 'error'} sx={{ fontWeight: 700 }} />
                  </Box>
                ))
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Live Gate Entry Activity Feed */}
        <Grid item xs={12} md={7}>
          <Card sx={{ borderRadius: 3, height: '100%', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>Live Gate Telemetry & Access Log</Typography>
                <Button size="small" variant="text" onClick={() => setEntryModalOpen(true)}>+ Quick Entry</Button>
              </Box>
              <Divider sx={{ mb: 2 }} />

              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f1f5f9' }}>
                    <TableCell sx={{ fontWeight: 700 }}>Time</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Person</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Role</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Vehicle / Notes</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="right">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {entries.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                        No gate entries logged yet today. Use the button above to register an entry.
                      </TableCell>
                    </TableRow>
                  ) : (
                    entries.slice(0, 10).map(entry => (
                      <TableRow key={entry._id} hover>
                        <TableCell sx={{ fontWeight: 600, fontSize: '0.85rem' }}>
                          {entry.entryTime ? new Date(entry.entryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>{entry.personName}</TableCell>
                        <TableCell>
                          <Chip label={entry.personType} size="small" variant="outlined" />
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.85rem', color: 'text.secondary' }}>
                          {entry.vehicleNumber ? `🚗 ${entry.vehicleNumber}` : (entry.notes || '-')}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={entry.status}
                            size="small"
                            color={entry.status === 'ENTERED' ? 'success' : entry.status === 'DENIED' ? 'error' : 'default'}
                            sx={{ fontWeight: 700 }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          {entry.status === 'ENTERED' ? (
                            <Tooltip title="Log Person Exit">
                              <IconButton size="small" color="primary" onClick={() => handleRecordExit(entry._id)}>
                                <ExitToAppIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          ) : (
                            <Typography variant="caption" color="text.secondary">Logged</Typography>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* MODAL: Record Gate Entry */}
      <Dialog open={entryModalOpen} onClose={() => setEntryModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Record Real-Time Gate Entry</DialogTitle>
        <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <TextField
            label="Person Name"
            required
            fullWidth
            value={entryForm.personName}
            onChange={e => setEntryForm({ ...entryForm, personName: e.target.value })}
            placeholder="e.g. Ramesh Kumar / Courier Agent"
          />

          <TextField
            select
            label="Person Category"
            fullWidth
            value={entryForm.personType}
            onChange={e => setEntryForm({ ...entryForm, personType: e.target.value })}
          >
            <MenuItem value="VISITOR">Visitor / Parent</MenuItem>
            <MenuItem value="STUDENT">Student</MenuItem>
            <MenuItem value="EMPLOYEE">Teacher / Staff</MenuItem>
            <MenuItem value="DELIVERY">Delivery / Courier</MenuItem>
            <MenuItem value="VENDOR">Contractor / Vendor</MenuItem>
            <MenuItem value="OTHER">Other</MenuItem>
          </TextField>

          {gates.length > 0 && (
            <TextField
              select
              label="Checkpoint Gate"
              fullWidth
              value={entryForm.gateId}
              onChange={e => setEntryForm({ ...entryForm, gateId: e.target.value })}
            >
              {gates.map(g => (
                <MenuItem key={g._id} value={g._id}>{g.name} ({g.location || 'Gate'})</MenuItem>
              ))}
            </TextField>
          )}

          <TextField
            label="Vehicle Registration (Optional)"
            fullWidth
            value={entryForm.vehicleNumber}
            onChange={e => setEntryForm({ ...entryForm, vehicleNumber: e.target.value })}
            placeholder="e.g. KA-01-AB-1234"
          />

          <TextField
            label="Purpose / Notes"
            fullWidth
            multiline
            rows={2}
            value={entryForm.notes}
            onChange={e => setEntryForm({ ...entryForm, notes: e.target.value })}
            placeholder="Meeting with Principal, Fee inquiry, etc."
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setEntryModalOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleRecordEntry} disabled={submitting || !entryForm.personName.trim()}>
            {submitting ? <CircularProgress size={20} /> : 'Save Entry'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* MODAL: Report Incident */}
      <Dialog open={incidentModalOpen} onClose={() => setIncidentModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Log Security Incident</DialogTitle>
        <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <TextField
            label="Incident Title"
            required
            fullWidth
            value={incidentForm.title}
            onChange={e => setIncidentForm({ ...incidentForm, title: e.target.value })}
            placeholder="e.g. Broken window at science block / Overdue visitor"
          />

          <TextField
            select
            label="Category"
            fullWidth
            value={incidentForm.category}
            onChange={e => setIncidentForm({ ...incidentForm, category: e.target.value })}
          >
            <MenuItem value="UNAUTHORIZED_ACCESS">Unauthorized Access Attempt</MenuItem>
            <MenuItem value="SUSPICIOUS_VEHICLE">Suspicious Vehicle</MenuItem>
            <MenuItem value="VISITOR_OVERDUE">Visitor Overdue</MenuItem>
            <MenuItem value="PROPERTY_DAMAGE">Property Damage</MenuItem>
            <MenuItem value="PERIMETER_BREACH">Perimeter Breach</MenuItem>
            <MenuItem value="OTHER">Other Incident</MenuItem>
          </TextField>

          <TextField
            select
            label="Severity"
            fullWidth
            value={incidentForm.severity}
            onChange={e => setIncidentForm({ ...incidentForm, severity: e.target.value })}
          >
            <MenuItem value="LOW">Low</MenuItem>
            <MenuItem value="MEDIUM">Medium</MenuItem>
            <MenuItem value="HIGH">High</MenuItem>
            <MenuItem value="CRITICAL">Critical</MenuItem>
          </TextField>

          <TextField
            label="Location"
            fullWidth
            value={incidentForm.location}
            onChange={e => setIncidentForm({ ...incidentForm, location: e.target.value })}
            placeholder="e.g. North Perimeter, Parking Lot B"
          />

          <TextField
            label="Description"
            fullWidth
            multiline
            rows={3}
            value={incidentForm.description}
            onChange={e => setIncidentForm({ ...incidentForm, description: e.target.value })}
            placeholder="Detailed narrative of what was observed..."
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setIncidentModalOpen(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleReportIncident} disabled={submitting || !incidentForm.title.trim()}>
            {submitting ? <CircularProgress size={20} /> : 'Dispatch Alert'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Toast */}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast({ ...toast, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={toast.severity} onClose={() => setToast({ ...toast, open: false })}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CampusSecurityDashboard;
