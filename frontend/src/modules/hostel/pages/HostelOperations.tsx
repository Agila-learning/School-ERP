import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Tabs, Tab, Button, Stack, Table, TableBody, TableCell, TableHead, TableRow,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Alert, Chip, Tooltip, IconButton
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import AddIcon from '@mui/icons-material/Add';
import { 
  getStudents, getOutpasses, createOutpass, updateOutpassStatus, 
  getVisitors, checkInVisitor, checkOutVisitor 
} from '../api/hostel.api';

interface TabPanelProps { children?: React.ReactNode; value: number; index: number; }
const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div hidden={value !== index}>{value === index && <Box sx={{ pt: 3 }}>{children}</Box>}</div>
);

const HostelOperations: React.FC = () => {
  const [tab, setTab] = useState(0);
  const [outpasses, setOutpasses] = useState<any[]>([]);
  const [visitors, setVisitors] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Modals
  const [openOutpassModal, setOpenOutpassModal] = useState(false);
  const [openVisitorModal, setOpenVisitorModal] = useState(false);

  const [outpassForm, setOutpassForm] = useState({
    studentId: '',
    destination: 'City Center',
    reason: 'Weekend Home Visit',
    expectedReturnHours: 6
  });

  const [visitorForm, setVisitorForm] = useState({
    studentId: '',
    visitorName: '',
    relationship: 'PARENT',
    contactNumber: '',
    purpose: 'Family Visit'
  });

  useEffect(() => {
    fetchData();
  }, [tab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const st = await getStudents();
      setStudents(Array.isArray(st) ? st : []);

      if (tab === 0) {
        const data = await getOutpasses();
        setOutpasses(Array.isArray(data) ? data : []);
      } else {
        const data = await getVisitors();
        setVisitors(Array.isArray(data) ? data : []);
      }
    } catch (e: any) {
      console.error(e);
      setError(e.response?.data?.message || 'Failed to fetch operations data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOutpass = async () => {
    if (!outpassForm.studentId || !outpassForm.destination) {
      setError('Student and destination are required.');
      return;
    }
    try {
      const returnTime = new Date(Date.now() + (outpassForm.expectedReturnHours || 6) * 3600 * 1000);
      await createOutpass({
        studentId: outpassForm.studentId,
        destination: outpassForm.destination,
        reason: outpassForm.reason,
        leavingDateTime: new Date(),
        expectedReturnDateTime: returnTime,
        status: 'WARDEN_APPROVED'
      });
      setSuccess('Outpass created & approved successfully');
      setOpenOutpassModal(false);
      setOutpassForm({ studentId: '', destination: 'City Center', reason: 'Weekend Home Visit', expectedReturnHours: 6 });
      fetchData();
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to create outpass');
    }
  };

  const handleUpdateOutpass = async (id: string, status: string) => {
    try {
      await updateOutpassStatus(id, status);
      setSuccess(`Outpass marked as ${status}`);
      fetchData();
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to update outpass status');
    }
  };

  const handleCheckInVisitor = async () => {
    if (!visitorForm.studentId || !visitorForm.visitorName) {
      setError('Student and visitor name are required.');
      return;
    }
    try {
      await checkInVisitor(visitorForm);
      setSuccess('Visitor checked in successfully');
      setOpenVisitorModal(false);
      setVisitorForm({ studentId: '', visitorName: '', relationship: 'PARENT', contactNumber: '', purpose: 'Family Visit' });
      fetchData();
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to check in visitor');
    }
  };

  const handleCheckOutVisitor = async (id: string) => {
    try {
      await checkOutVisitor(id);
      setSuccess('Visitor logged out successfully');
      fetchData();
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to check out visitor');
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <div>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a' }}>Outpass & Visitor Tracking</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Manage student gate movement, curfew hours, and hostel visitor security logs
          </Typography>
        </div>
        <Stack direction="row" spacing={1.5}>
          {tab === 0 ? (
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenOutpassModal(true)} sx={{ fontWeight: 700 }}>
              Issue Outpass
            </Button>
          ) : (
            <Button variant="contained" color="secondary" startIcon={<AddIcon />} onClick={() => setOpenVisitorModal(true)} sx={{ fontWeight: 700 }}>
              Check In Visitor
            </Button>
          )}
        </Stack>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      <Paper sx={{ mb: 3, borderRadius: 2 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label={`Outpass Requests (${outpasses.length})`} sx={{ fontWeight: 700 }} />
          <Tab label={`Visitor Security Log (${visitors.length})`} sx={{ fontWeight: 700 }} />
        </Tabs>
      </Paper>

      {/* TAB 0: OUTPASSES */}
      <TabPanel value={tab} index={0}>
        <Paper sx={{ borderRadius: 2, overflow: 'hidden', border: '1px solid #e2e8f0' }}>
          <Table>
            <TableHead sx={{ backgroundColor: '#f8fafc' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Student</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Destination</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Reason</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Expected Return</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {outpasses.map(o => (
                <TableRow key={o._id} hover>
                  <TableCell sx={{ fontWeight: 700, color: '#1e293b' }}>
                    {o.studentId?.firstName} {o.studentId?.lastName}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{o.destination}</TableCell>
                  <TableCell>{o.reason || 'Personal'}</TableCell>
                  <TableCell>
                    {o.expectedReturnDateTime ? new Date(o.expectedReturnDateTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      size="small" 
                      label={o.status} 
                      color={o.status === 'RETURNED' ? 'success' : o.status === 'ACTIVE' ? 'warning' : o.status === 'OVERDUE' ? 'error' : 'primary'} 
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      {o.status === 'WARDEN_APPROVED' && (
                        <Button 
                          size="small" 
                          variant="outlined" 
                          color="warning" 
                          onClick={() => handleUpdateOutpass(o._id, 'ACTIVE')}
                          sx={{ textTransform: 'none', fontWeight: 600 }}
                        >
                          Mark Departed
                        </Button>
                      )}
                      {o.status === 'ACTIVE' && (
                        <Button 
                          size="small" 
                          variant="contained" 
                          color="success" 
                          startIcon={<CheckCircleIcon />}
                          onClick={() => handleUpdateOutpass(o._id, 'RETURNED')}
                          sx={{ textTransform: 'none', fontWeight: 600 }}
                        >
                          Mark Returned
                        </Button>
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
              {outpasses.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
                    No outpass records found. Click "+ Issue Outpass" to create one.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Paper>
      </TabPanel>

      {/* TAB 1: VISITORS */}
      <TabPanel value={tab} index={1}>
        <Paper sx={{ borderRadius: 2, overflow: 'hidden', border: '1px solid #e2e8f0' }}>
          <Table>
            <TableHead sx={{ backgroundColor: '#f8fafc' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Visitor Name</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Relationship</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Hostel Student</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Check In Time</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {visitors.map(v => (
                <TableRow key={v._id} hover>
                  <TableCell sx={{ fontWeight: 700, color: '#1e293b' }}>
                    {v.visitorName}
                    <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>
                      Ph: {v.contactNumber || 'N/A'}
                    </Typography>
                  </TableCell>
                  <TableCell><Chip size="small" label={v.relationship} variant="outlined" /></TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{v.studentId?.firstName} {v.studentId?.lastName}</TableCell>
                  <TableCell>{v.checkInTime ? new Date(v.checkInTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'N/A'}</TableCell>
                  <TableCell>
                    <Chip 
                      size="small" 
                      label={v.status || 'CHECKED_IN'} 
                      color={v.status === 'CHECKED_OUT' ? 'default' : 'success'} 
                    />
                  </TableCell>
                  <TableCell align="right">
                    {v.status !== 'CHECKED_OUT' && (
                      <Button 
                        size="small" 
                        variant="outlined" 
                        color="error" 
                        startIcon={<LogoutIcon />}
                        onClick={() => handleCheckOutVisitor(v._id)}
                        sx={{ textTransform: 'none', fontWeight: 600 }}
                      >
                        Check Out
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {visitors.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
                    No visitor records found. Click "+ Check In Visitor" to log entry.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Paper>
      </TabPanel>

      {/* OUTPASS MODAL */}
      <Dialog open={openOutpassModal} onClose={() => setOpenOutpassModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Issue Student Outpass</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.5}>
            <TextField 
              select 
              label="Select Student *" 
              value={outpassForm.studentId} 
              onChange={e => setOutpassForm({ ...outpassForm, studentId: e.target.value })} 
              fullWidth 
              size="small"
            >
              {students.map(s => (
                <MenuItem key={s._id} value={s._id}>
                  {s.firstName} {s.lastName} ({s.admissionNumber || 'Student'})
                </MenuItem>
              ))}
            </TextField>
            <TextField 
              label="Destination *" 
              value={outpassForm.destination} 
              onChange={e => setOutpassForm({ ...outpassForm, destination: e.target.value })} 
              fullWidth 
              size="small"
              placeholder="e.g. City Library, Home, Medical Clinic"
            />
            <TextField 
              label="Reason / Purpose" 
              value={outpassForm.reason} 
              onChange={e => setOutpassForm({ ...outpassForm, reason: e.target.value })} 
              fullWidth 
              size="small"
              placeholder="e.g. Academic project, family visit"
            />
            <TextField 
              label="Expected Duration (Hours)" 
              type="number" 
              value={outpassForm.expectedReturnHours} 
              onChange={e => setOutpassForm({ ...outpassForm, expectedReturnHours: +e.target.value })} 
              fullWidth 
              size="small"
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenOutpassModal(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateOutpass} sx={{ fontWeight: 700 }}>
            Authorize & Issue
          </Button>
        </DialogActions>
      </Dialog>

      {/* VISITOR MODAL */}
      <Dialog open={openVisitorModal} onClose={() => setOpenVisitorModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Check In Visitor</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.5}>
            <TextField 
              select 
              label="Student Being Visited *" 
              value={visitorForm.studentId} 
              onChange={e => setVisitorForm({ ...visitorForm, studentId: e.target.value })} 
              fullWidth 
              size="small"
            >
              {students.map(s => (
                <MenuItem key={s._id} value={s._id}>
                  {s.firstName} {s.lastName}
                </MenuItem>
              ))}
            </TextField>
            <TextField 
              label="Visitor Full Name *" 
              value={visitorForm.visitorName} 
              onChange={e => setVisitorForm({ ...visitorForm, visitorName: e.target.value })} 
              fullWidth 
              size="small"
            />
            <TextField 
              select 
              label="Relationship" 
              value={visitorForm.relationship} 
              onChange={e => setVisitorForm({ ...visitorForm, relationship: e.target.value })} 
              fullWidth 
              size="small"
            >
              {['PARENT', 'GUARDIAN', 'SIBLING', 'RELATIVE', 'OTHER'].map(r => (
                <MenuItem key={r} value={r}>{r}</MenuItem>
              ))}
            </TextField>
            <TextField 
              label="Phone Number" 
              value={visitorForm.contactNumber} 
              onChange={e => setVisitorForm({ ...visitorForm, contactNumber: e.target.value })} 
              fullWidth 
              size="small"
            />
            <TextField 
              label="Purpose of Visit" 
              value={visitorForm.purpose} 
              onChange={e => setVisitorForm({ ...visitorForm, purpose: e.target.value })} 
              fullWidth 
              size="small"
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenVisitorModal(false)}>Cancel</Button>
          <Button variant="contained" color="secondary" onClick={handleCheckInVisitor} sx={{ fontWeight: 700 }}>
            Log Entry
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default HostelOperations;
