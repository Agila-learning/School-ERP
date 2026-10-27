import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Tabs, Tab, Button, Stack, Table, TableBody, TableCell, TableHead, TableRow,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Alert, Chip, Tooltip, IconButton
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AddIcon from '@mui/icons-material/Add';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import { 
  getComplaints, createComplaint, updateComplaintStatus, 
  getIncidents, createIncident, getHostels 
} from '../api/hostel.api';

interface TabPanelProps { children?: React.ReactNode; value: number; index: number; }
const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div hidden={value !== index}>{value === index && <Box sx={{ pt: 3 }}>{children}</Box>}</div>
);

const HostelComplaintsView: React.FC = () => {
  const [tab, setTab] = useState(0);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [incidents, setIncidents] = useState<any[]>([]);
  const [hostels, setHostels] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Modals
  const [openComplaintModal, setOpenComplaintModal] = useState(false);
  const [openIncidentModal, setOpenIncidentModal] = useState(false);

  // Forms
  const [complaintForm, setComplaintForm] = useState({
    title: '',
    category: 'ROOM',
    description: '',
    priority: 'NORMAL',
    hostelId: ''
  });

  const [incidentForm, setIncidentForm] = useState({
    incidentType: 'MEDICAL',
    severity: 'HIGH',
    description: '',
    location: '',
    actionTaken: '',
    hostelId: ''
  });

  useEffect(() => {
    fetchData();
  }, [tab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const hs = await getHostels();
      setHostels(Array.isArray(hs) ? hs : []);

      if (tab === 0) {
        const data = await getComplaints();
        setComplaints(Array.isArray(data) ? data : []);
      } else if (tab === 1) {
        const data = await getIncidents();
        setIncidents(Array.isArray(data) ? data : []);
      }
    } catch (e: any) {
      console.error(e);
      setError(e.response?.data?.message || 'Failed to fetch complaints data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateComplaint = async () => {
    if (!complaintForm.description) {
      setError('Please provide a description of the complaint.');
      return;
    }
    try {
      await createComplaint({
        ...complaintForm,
        title: complaintForm.title || `${complaintForm.category} Issue`
      });
      setSuccess('Complaint logged successfully');
      setOpenComplaintModal(false);
      setComplaintForm({ title: '', category: 'ROOM', description: '', priority: 'NORMAL', hostelId: '' });
      fetchData();
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to log complaint');
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await updateComplaintStatus(id, { status: newStatus, notes: `Status updated to ${newStatus}` });
      setSuccess(`Complaint marked as ${newStatus}`);
      fetchData();
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to update complaint status');
    }
  };

  const handleCreateIncident = async () => {
    if (!incidentForm.description) {
      setError('Incident description is required.');
      return;
    }
    try {
      await createIncident(incidentForm);
      setSuccess('Emergency incident reported successfully');
      setOpenIncidentModal(false);
      setIncidentForm({ incidentType: 'MEDICAL', severity: 'HIGH', description: '', location: '', actionTaken: '', hostelId: '' });
      fetchData();
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to report incident');
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <div>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a' }}>Complaints & Incidents</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Track hostel maintenance tickets, room grievances, and emergency incident logs
          </Typography>
        </div>
        <Stack direction="row" spacing={1.5}>
          <Button variant="outlined" startIcon={<AddIcon />} onClick={() => setOpenComplaintModal(true)} sx={{ fontWeight: 600 }}>
            Log Complaint
          </Button>
          <Button variant="contained" color="error" startIcon={<ReportProblemIcon />} onClick={() => setOpenIncidentModal(true)} sx={{ fontWeight: 700 }}>
            Report Incident
          </Button>
        </Stack>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      <Paper sx={{ mb: 3, borderRadius: 2 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label={`Complaints & Tickets (${complaints.length})`} sx={{ fontWeight: 700 }} />
          <Tab label={`Emergency Incidents (${incidents.length})`} sx={{ fontWeight: 700 }} />
          <Tab label="Maintenance Schedule" sx={{ fontWeight: 700 }} />
        </Tabs>
      </Paper>

      {/* TAB 0: COMPLAINTS */}
      <TabPanel value={tab} index={0}>
        <Paper sx={{ borderRadius: 2, overflow: 'hidden', border: '1px solid #e2e8f0' }}>
          <Table>
            <TableHead sx={{ backgroundColor: '#f8fafc' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Ticket Title</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Priority</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {complaints.map(c => (
                <TableRow key={c._id} hover>
                  <TableCell sx={{ fontWeight: 700, color: '#1e293b' }}>
                    {c.title}
                    <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>
                      {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : 'Recent'}
                    </Typography>
                  </TableCell>
                  <TableCell><Chip size="small" label={c.category} variant="outlined" /></TableCell>
                  <TableCell>
                    <Chip 
                      size="small" 
                      label={c.priority || 'NORMAL'} 
                      color={c.priority === 'HIGH' || c.priority === 'EMERGENCY' ? 'error' : 'default'} 
                    />
                  </TableCell>
                  <TableCell sx={{ maxWidth: 300 }}>{c.description}</TableCell>
                  <TableCell>
                    <Chip 
                      size="small" 
                      label={c.status} 
                      color={c.status === 'RESOLVED' || c.status === 'CLOSED' ? 'success' : c.status === 'IN_PROGRESS' ? 'warning' : 'primary'} 
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      {c.status === 'OPEN' && (
                        <Button 
                          size="small" 
                          variant="outlined" 
                          color="warning" 
                          onClick={() => handleUpdateStatus(c._id, 'IN_PROGRESS')}
                          sx={{ textTransform: 'none', fontWeight: 600 }}
                        >
                          In Progress
                        </Button>
                      )}
                      {c.status !== 'RESOLVED' && c.status !== 'CLOSED' && (
                        <Button 
                          size="small" 
                          variant="contained" 
                          color="success" 
                          startIcon={<CheckCircleIcon />}
                          onClick={() => handleUpdateStatus(c._id, 'RESOLVED')}
                          sx={{ textTransform: 'none', fontWeight: 600 }}
                        >
                          Resolve
                        </Button>
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
              {complaints.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
                    No complaints recorded. Click "+ Log Complaint" to report a room or hostel issue.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Paper>
      </TabPanel>

      {/* TAB 1: EMERGENCY INCIDENTS */}
      <TabPanel value={tab} index={1}>
        <Paper sx={{ borderRadius: 2, overflow: 'hidden', border: '1px solid #e2e8f0' }}>
          <Table>
            <TableHead sx={{ backgroundColor: '#f8fafc' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Incident Type</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Severity</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Location</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {incidents.map(inc => (
                <TableRow key={inc._id} hover>
                  <TableCell sx={{ fontWeight: 700, color: '#dc2626' }}>{inc.incidentType}</TableCell>
                  <TableCell>
                    <Chip 
                      size="small" 
                      label={inc.severity} 
                      color={inc.severity === 'CRITICAL' || inc.severity === 'HIGH' ? 'error' : 'warning'} 
                    />
                  </TableCell>
                  <TableCell>{inc.description}</TableCell>
                  <TableCell>{inc.location || 'Hostel Campus'}</TableCell>
                  <TableCell>{inc.incidentDateTime ? new Date(inc.incidentDateTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'Recent'}</TableCell>
                  <TableCell>
                    <Chip size="small" label={inc.status || 'OPEN'} color={inc.status === 'RESOLVED' ? 'success' : 'error'} />
                  </TableCell>
                </TableRow>
              ))}
              {incidents.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
                    No emergency incidents logged.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Paper>
      </TabPanel>

      {/* TAB 2: MAINTENANCE */}
      <TabPanel value={tab} index={2}>
        <Paper sx={{ p: 4, borderRadius: 2, textAlign: 'center', border: '1px solid #e2e8f0' }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: '#1e293b' }}>Scheduled Facility Maintenance</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
            Plumbing, electrical inspections, pest control, and air conditioning maintenance routines.
          </Typography>
          <Chip label="Facility Maintenance: Normal" color="success" />
        </Paper>
      </TabPanel>

      {/* COMPLAINT MODAL */}
      <Dialog open={openComplaintModal} onClose={() => setOpenComplaintModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Log Hostel Complaint / Issue</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.5}>
            <TextField 
              label="Complaint Title" 
              value={complaintForm.title} 
              onChange={e => setComplaintForm({ ...complaintForm, title: e.target.value })} 
              fullWidth 
              size="small"
              placeholder="e.g. Water leakage in Room 204"
            />
            <TextField 
              select 
              label="Category *" 
              value={complaintForm.category} 
              onChange={e => setComplaintForm({ ...complaintForm, category: e.target.value })} 
              fullWidth 
              size="small"
            >
              {['ROOM', 'FOOD', 'WATER', 'ELECTRICITY', 'CLEANING', 'WIFI', 'OTHER'].map(t => (
                <MenuItem key={t} value={t}>{t}</MenuItem>
              ))}
            </TextField>
            <TextField 
              select 
              label="Priority" 
              value={complaintForm.priority} 
              onChange={e => setComplaintForm({ ...complaintForm, priority: e.target.value })} 
              fullWidth 
              size="small"
            >
              {['LOW', 'NORMAL', 'HIGH', 'EMERGENCY'].map(p => (
                <MenuItem key={p} value={p}>{p}</MenuItem>
              ))}
            </TextField>
            <TextField 
              label="Detailed Description *" 
              value={complaintForm.description} 
              onChange={e => setComplaintForm({ ...complaintForm, description: e.target.value })} 
              fullWidth 
              multiline 
              rows={3} 
              size="small" 
              placeholder="Describe the issue in detail..."
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenComplaintModal(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateComplaint} sx={{ fontWeight: 700 }}>
            Submit Ticket
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* INCIDENT MODAL */}
      <Dialog open={openIncidentModal} onClose={() => setOpenIncidentModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Report Emergency Incident</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.5}>
            <TextField 
              select 
              label="Incident Type *" 
              value={incidentForm.incidentType} 
              onChange={e => setIncidentForm({ ...incidentForm, incidentType: e.target.value })} 
              fullWidth 
              size="small"
            >
              {['MEDICAL', 'ACCIDENT', 'MISSING_STUDENT', 'SECURITY', 'FIRE', 'OTHER'].map(t => (
                <MenuItem key={t} value={t}>{t}</MenuItem>
              ))}
            </TextField>
            <TextField 
              select 
              label="Severity *" 
              value={incidentForm.severity} 
              onChange={e => setIncidentForm({ ...incidentForm, severity: e.target.value })} 
              fullWidth 
              size="small"
            >
              {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map(t => (
                <MenuItem key={t} value={t}>{t}</MenuItem>
              ))}
            </TextField>
            <TextField 
              label="Location of Incident" 
              value={incidentForm.location} 
              onChange={e => setIncidentForm({ ...incidentForm, location: e.target.value })} 
              fullWidth 
              size="small"
              placeholder="e.g. Block B, 2nd Floor Corridor"
            />
            <TextField 
              label="Description of Incident *" 
              value={incidentForm.description} 
              onChange={e => setIncidentForm({ ...incidentForm, description: e.target.value })} 
              fullWidth 
              multiline 
              rows={3} 
              size="small" 
            />
            <TextField 
              label="Immediate Action Taken" 
              value={incidentForm.actionTaken} 
              onChange={e => setIncidentForm({ ...incidentForm, actionTaken: e.target.value })} 
              fullWidth 
              size="small" 
              placeholder="e.g. First aid administered, warden informed"
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenIncidentModal(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleCreateIncident} sx={{ fontWeight: 700 }}>
            Report Incident
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default HostelComplaintsView;
