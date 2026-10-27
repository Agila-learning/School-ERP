import React, { useState, useEffect, useMemo } from 'react';
import {
  Box, Typography, Paper, Tabs, Tab, Button, Stack, Table, TableBody, TableCell, TableHead, TableRow,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Alert, Chip, IconButton, Tooltip,
  Grid, Card, CardContent, Avatar, InputAdornment, FormControl, InputLabel, Select, TableContainer,
  FormControlLabel, Checkbox, Divider
} from '@mui/material';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SecurityIcon from '@mui/icons-material/Security';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import PrintIcon from '@mui/icons-material/Print';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import PhoneIcon from '@mui/icons-material/Phone';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SchoolIcon from '@mui/icons-material/School';
import HotelIcon from '@mui/icons-material/Hotel';

import { getOutpasses, createOutpass, updateOutpassStatus, getStudents, getHostels } from '../api/hostel.api';
import { publishNotification } from '../../../core/services/realtimeNotificationBus';

const HostelOutpassManagement: React.FC = () => {
  const [outpasses, setOutpasses] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [hostels, setHostels] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openQRModal, setOpenQRModal] = useState(false);
  const [openReturnModal, setOpenReturnModal] = useState(false);
  const [selectedPass, setSelectedPass] = useState<any>(null);

  // Create Form
  const [createForm, setCreateForm] = useState({
    studentId: '',
    hostelId: '',
    category: 'WEEKEND_HOME',
    destination: 'Home Residence',
    reason: 'Family visit over the weekend',
    leavingDateTime: new Date().toISOString().slice(0, 16),
    expectedReturnDateTime: new Date(Date.now() + 24 * 3600 * 1000).toISOString().slice(0, 16),
    parentConsent: true,
    parentPhone: '',
    remarks: 'Approved by Warden'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [op, st, hs] = await Promise.all([
        getOutpasses(),
        getStudents(),
        getHostels()
      ]);
      setOutpasses(Array.isArray(op) ? op : []);
      setStudents(Array.isArray(st) ? st : []);
      setHostels(Array.isArray(hs) ? hs : []);
    } catch (e: any) {
      console.error(e);
      setError(e.response?.data?.message || 'Failed to fetch outpass records');
    } finally {
      setLoading(false);
    }
  };

  // KPIs
  const stats = useMemo(() => {
    let pending = 0;
    let approved = 0;
    let outside = 0;
    let returned = 0;
    let overdue = 0;

    const now = new Date();

    outpasses.forEach(op => {
      const st = op.status;
      if (st === 'PENDING_WARDEN' || st === 'PENDING') pending++;
      else if (st === 'WARDEN_APPROVED' || st === 'APPROVED') approved++;
      else if (st === 'GATE_EXIT' || st === 'CHECKED_OUT') {
        outside++;
        if (op.expectedReturnDateTime && new Date(op.expectedReturnDateTime) < now) {
          overdue++;
        }
      } else if (st === 'RETURNED' || st === 'GATE_ENTRY') returned++;
    });

    return { pending, approved, outside, returned, overdue, total: outpasses.length };
  }, [outpasses]);

  // Filtered List
  const filteredOutpasses = useMemo(() => {
    return outpasses.filter(op => {
      const s = op.studentId;
      const sName = `${s?.firstName || ''} ${s?.lastName || ''}`.toLowerCase();
      const adm = (s?.admissionNumber || s?.studentId || '').toLowerCase();
      const dest = (op.destination || '').toLowerCase();
      const passNum = (op.gatePassNumber || op._id || '').toLowerCase();

      const matchesSearch = !searchQuery ||
        sName.includes(searchQuery.toLowerCase()) ||
        adm.includes(searchQuery.toLowerCase()) ||
        dest.includes(searchQuery.toLowerCase()) ||
        passNum.includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'ALL' ||
        (statusFilter === 'PENDING' && (op.status === 'PENDING_WARDEN' || op.status === 'PENDING')) ||
        (statusFilter === 'APPROVED' && (op.status === 'WARDEN_APPROVED' || op.status === 'APPROVED')) ||
        (statusFilter === 'OUTSIDE' && (op.status === 'GATE_EXIT' || op.status === 'CHECKED_OUT')) ||
        (statusFilter === 'RETURNED' && (op.status === 'RETURNED' || op.status === 'GATE_ENTRY')) ||
        op.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [outpasses, searchQuery, statusFilter]);

  // Create Outpass
  const handleCreate = async () => {
    if (!createForm.studentId || !createForm.destination) {
      setError('Student and Destination are required.');
      return;
    }
    try {
      await createOutpass({
        studentId: createForm.studentId,
        hostelId: createForm.hostelId || undefined,
        destination: createForm.destination,
        reason: `[${createForm.category}] ${createForm.reason}`,
        leavingDateTime: new Date(createForm.leavingDateTime),
        expectedReturnDateTime: new Date(createForm.expectedReturnDateTime),
        parentConsent: createForm.parentConsent,
        status: 'WARDEN_APPROVED',
        remarks: createForm.remarks
      });

      setSuccess('Gate Pass issued & warden clearance granted!');
      setOpenCreateModal(false);
      setCreateForm({
        studentId: '',
        hostelId: '',
        category: 'WEEKEND_HOME',
        destination: 'Home Residence',
        reason: 'Family visit over the weekend',
        leavingDateTime: new Date().toISOString().slice(0, 16),
        expectedReturnDateTime: new Date(Date.now() + 24 * 3600 * 1000).toISOString().slice(0, 16),
        parentConsent: true,
        parentPhone: '',
        remarks: 'Approved by Warden'
      });
      fetchData();

      // Realtime notification to security watchman
      publishNotification({
        id: `noti-gate-${Date.now()}`,
        title: 'New Digital Gate Pass Issued',
        message: 'A student outpass has been approved by Warden for campus gate exit clearance.',
        type: 'SECURITY_ALERT',
        priority: 'MEDIUM',
        targetRole: 'WATCHMAN',
        timestamp: new Date().toISOString()
      });
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to issue gate pass');
    }
  };

  // 1-Click Approve
  const handleApprove = async (id: string) => {
    try {
      await updateOutpassStatus(id, 'WARDEN_APPROVED');
      setSuccess('Outpass approved! Student can now present QR pass at security gate.');
      fetchData();
      publishNotification({
        id: `noti-gate-app-${Date.now()}`,
        title: 'Gate Pass Approved',
        message: 'Warden approved outpass. Security gate clearance granted.',
        type: 'SECURITY_ALERT',
        priority: 'MEDIUM',
        targetRole: 'WATCHMAN',
        timestamp: new Date().toISOString()
      });
    } catch (e: any) {
      setError('Failed to approve outpass');
    }
  };

  // 1-Click Reject
  const handleReject = async (id: string) => {
    try {
      await updateOutpassStatus(id, 'REJECTED');
      setSuccess('Outpass application declined.');
      fetchData();
    } catch (e: any) {
      setError('Failed to reject outpass');
    }
  };

  // Mark Returned / Check In
  const handleMarkReturned = async () => {
    if (!selectedPass) return;
    try {
      await updateOutpassStatus(selectedPass._id, 'RETURNED');
      setSuccess(`Student checked back into hostel successfully on ${new Date().toLocaleTimeString()}!`);
      setOpenReturnModal(false);
      fetchData();
    } catch (e: any) {
      setError('Failed to mark student returned');
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar sx={{ bgcolor: '#e11d48', width: 44, height: 44, boxShadow: '0 4px 12px rgba(225, 29, 72, 0.25)' }}>
            <ExitToAppIcon sx={{ fontSize: 26, color: '#ffffff' }} />
          </Avatar>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
              Digital Gate Pass & Outpass Clearance Desk
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748b' }}>
              Hostel leave authorisations, live campus gate sync, parent consent verification & curfew return monitoring
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={1.5} flexWrap="wrap">
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchData}
            disabled={loading}
            sx={{ fontWeight: 600, borderColor: '#cbd5e1', color: '#475569' }}
          >
            Refresh
          </Button>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenCreateModal(true)}
            sx={{ 
              fontWeight: 700, 
              background: 'linear-gradient(135deg, #e11d48 0%, #db2777 100%)',
              boxShadow: '0 4px 14px rgba(225, 29, 72, 0.35)',
              borderRadius: 2
            }}
          >
            Issue Gate Pass
          </Button>
        </Stack>
      </Box>

      {/* Alerts */}
      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      {/* KPI Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ borderRadius: 3, border: '1px solid #fed7aa', bgcolor: '#fffaf5' }}>
            <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#ea580c', textTransform: 'uppercase' }}>
                Pending Approvals
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#ea580c', mt: 0.5 }}>
                {stats.pending}
              </Typography>
              <Typography variant="caption" sx={{ color: '#ea580c', fontWeight: 600 }}>
                Requires Warden Action
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ borderRadius: 3, border: '1px solid #bfdbfe', bgcolor: '#f8faff' }}>
            <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#0284c7', textTransform: 'uppercase' }}>
                Approved Passes
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#0284c7', mt: 0.5 }}>
                {stats.approved}
              </Typography>
              <Typography variant="caption" sx={{ color: '#0284c7', fontWeight: 600 }}>
                Cleared for Gate Exit
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ borderRadius: 3, border: '1px solid #fbcfe8', bgcolor: '#fdf2f8' }}>
            <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#db2777', textTransform: 'uppercase' }}>
                Currently Outside
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#db2777', mt: 0.5 }}>
                {stats.outside}
              </Typography>
              <Typography variant="caption" sx={{ color: '#db2777', fontWeight: 600 }}>
                Past Campus Security Gate
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ borderRadius: 3, border: `1px solid ${stats.overdue > 0 ? '#fecaca' : '#e2e8f0'}`, bgcolor: stats.overdue > 0 ? '#fff1f2' : '#ffffff' }}>
            <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#dc2626', textTransform: 'uppercase' }}>
                Curfew Overdue
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#dc2626', mt: 0.5 }}>
                {stats.overdue}
              </Typography>
              <Typography variant="caption" sx={{ color: '#dc2626', fontWeight: 600 }}>
                {stats.overdue > 0 ? 'Curfew Breach Alert!' : 'All In Regular Limits'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ borderRadius: 3, border: '1px solid #bbf7d0', bgcolor: '#f0fdf4' }}>
            <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#16a34a', textTransform: 'uppercase' }}>
                Returned Today
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#16a34a', mt: 0.5 }}>
                {stats.returned}
              </Typography>
              <Typography variant="caption" sx={{ color: '#16a34a', fontWeight: 600 }}>
                Completed & Checked In
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filter and Search Bar */}
      <Paper sx={{ p: 2.5, mb: 3, borderRadius: 3, border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={5}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search student, admission #, destination, pass code..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#94a3b8' }} />
                  </InputAdornment>
                ),
              }}
              sx={{ bgcolor: '#ffffff' }}
            />
          </Grid>

          <Grid item xs={12} md={7}>
            <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent={{ xs: 'flex-start', md: 'flex-end' }}>
              {[
                { key: 'ALL', label: 'All Passes' },
                { key: 'PENDING', label: `Pending (${stats.pending})` },
                { key: 'APPROVED', label: `Approved (${stats.approved})` },
                { key: 'OUTSIDE', label: `Outside (${stats.outside})` },
                { key: 'RETURNED', label: `Returned (${stats.returned})` }
              ].map(item => (
                <Chip
                  key={item.key}
                  label={item.label}
                  onClick={() => setStatusFilter(item.key)}
                  color={statusFilter === item.key ? 'primary' : 'default'}
                  variant={statusFilter === item.key ? 'filled' : 'outlined'}
                  sx={{ fontWeight: 700, cursor: 'pointer' }}
                />
              ))}
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* Main Outpasses Table */}
      <Paper sx={{ borderRadius: 3, overflow: 'hidden', border: '1px solid #e2e8f0' }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ backgroundColor: '#f8fafc' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Gate Pass ID & Student</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Destination & Reason</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Out / In Timings</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Parent Consent</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Gate Status</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, color: '#475569' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredOutpasses.map(op => {
                const s = op.studentId;
                const isPending = op.status === 'PENDING_WARDEN' || op.status === 'PENDING';
                const isApproved = op.status === 'WARDEN_APPROVED' || op.status === 'APPROVED';
                const isOutside = op.status === 'GATE_EXIT' || op.status === 'CHECKED_OUT';
                const isReturned = op.status === 'RETURNED' || op.status === 'GATE_ENTRY';

                const isOverdue = isOutside && op.expectedReturnDateTime && new Date(op.expectedReturnDateTime) < new Date();

                return (
                  <TableRow key={op._id} hover sx={{ bgcolor: isOverdue ? '#fff1f2' : 'inherit' }}>
                    <TableCell>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Avatar sx={{ 
                          bgcolor: isReturned ? '#16a34a' : isOutside ? '#db2777' : isApproved ? '#0284c7' : '#ea580c',
                          width: 38, 
                          height: 38,
                          fontWeight: 700 
                        }}>
                          {s?.firstName?.[0] || 'O'}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 800, color: '#0f172a' }}>
                            {s?.firstName} {s?.lastName}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#475569', display: 'block', fontWeight: 600 }}>
                            Pass: {op.gatePassNumber || `GP-${op._id.slice(-6).toUpperCase()}`}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                            ID: {s?.admissionNumber || s?.studentId || 'N/A'}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e293b' }}>
                        {op.destination}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>
                        {op.reason || 'Personal Leave'}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Box sx={{ p: 1, bgcolor: '#f8fafc', borderRadius: 2, display: 'inline-block' }}>
                        <Typography variant="caption" sx={{ color: '#e11d48', fontWeight: 700, display: 'block' }}>
                          Out: {op.leavingDateTime ? new Date(op.leavingDateTime).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Pending'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: isOverdue ? '#dc2626' : '#16a34a', fontWeight: 700, display: 'block' }}>
                          In: {op.expectedReturnDateTime ? new Date(op.expectedReturnDateTime).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Curfew'}
                        </Typography>
                      </Box>
                    </TableCell>

                    <TableCell>
                      <Chip
                        size="small"
                        icon={op.parentConsent ? <CheckCircleIcon sx={{ fontSize: 14 }} /> : <WarningAmberIcon sx={{ fontSize: 14 }} />}
                        label={op.parentConsent ? 'Verified' : 'Unverified'}
                        color={op.parentConsent ? 'success' : 'warning'}
                        sx={{ fontWeight: 700 }}
                      />
                    </TableCell>

                    <TableCell>
                      <Chip
                        size="small"
                        label={
                          isOverdue ? 'CURFEW OVERDUE' :
                          isOutside ? 'OUTSIDE CAMPUS' :
                          isApproved ? 'WARDEN APPROVED' :
                          isReturned ? 'RETURNED & SAFE' :
                          op.status === 'REJECTED' ? 'REJECTED' : 'PENDING'
                        }
                        color={
                          isOverdue ? 'error' :
                          isOutside ? 'secondary' :
                          isApproved ? 'primary' :
                          isReturned ? 'success' :
                          op.status === 'REJECTED' ? 'error' : 'warning'
                        }
                        sx={{ fontWeight: 800, fontSize: '0.75rem' }}
                      />
                    </TableCell>

                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        {isPending && (
                          <>
                            <Tooltip title="Approve Gate Pass">
                              <IconButton 
                                size="small" 
                                color="success" 
                                onClick={() => handleApprove(op._id)}
                                sx={{ bgcolor: '#dcfce7' }}
                              >
                                <CheckCircleIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Reject Request">
                              <IconButton 
                                size="small" 
                                color="error" 
                                onClick={() => handleReject(op._id)}
                                sx={{ bgcolor: '#fee2e2' }}
                              >
                                <CancelIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}

                        <Tooltip title="Digital QR Gate Pass">
                          <IconButton 
                            size="small" 
                            onClick={() => {
                              setSelectedPass(op);
                              setOpenQRModal(true);
                            }}
                            sx={{ color: '#4f46e5', bgcolor: '#e0e7ff' }}
                          >
                            <QrCode2Icon fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        {isOutside && (
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            startIcon={<AssignmentTurnedInIcon />}
                            onClick={() => {
                              setSelectedPass(op);
                              setOpenReturnModal(true);
                            }}
                            sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}
                          >
                            Check In
                          </Button>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })}

              {filteredOutpasses.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} sx={{ textAlign: 'center', py: 6, color: '#64748b' }}>
                    No gate passes match your filters. Click "+ Issue Gate Pass" to record an outpass.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* --- MODAL 1: CREATE OUTPASS --- */}
      <Dialog open={openCreateModal} onClose={() => setOpenCreateModal(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 800, color: '#0f172a', borderBottom: '1px solid #e2e8f0' }}>
          Issue Student Gate Pass / Outpass
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Stack spacing={2.5}>
            <FormControl fullWidth size="small">
              <InputLabel id="outpass-student-label">Select Student Resident *</InputLabel>
              <Select
                labelId="outpass-student-label"
                label="Select Student Resident *"
                value={createForm.studentId}
                onChange={e => setCreateForm({ ...createForm, studentId: e.target.value })}
              >
                {students.map(s => (
                  <MenuItem key={s._id} value={s._id}>
                    {s.firstName} {s.lastName} ({s.admissionNumber || s.studentId || 'No ID'})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth size="small">
              <InputLabel id="outpass-cat-label">Leave Category *</InputLabel>
              <Select
                labelId="outpass-cat-label"
                label="Leave Category *"
                value={createForm.category}
                onChange={e => setCreateForm({ ...createForm, category: e.target.value })}
              >
                <MenuItem value="WEEKEND_HOME">🏠 Weekend Home Visit</MenuItem>
                <MenuItem value="MEDICAL">🏥 Medical Emergency / Hospital Visit</MenuItem>
                <MenuItem value="ACADEMIC_COMPETITION">🏆 Inter-School Academic / Sports Meet</MenuItem>
                <MenuItem value="MARKET_LOCAL">🛍️ Local Market / Shopping Leave</MenuItem>
                <MenuItem value="OFFICIAL_LEAVE">📄 Official School Sanctioned Leave</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Destination City / Address *"
              value={createForm.destination}
              onChange={e => setCreateForm({ ...createForm, destination: e.target.value })}
              fullWidth
              size="small"
              placeholder="e.g. Home Residence, City Center, Apollo Hospital..."
            />

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label="Departure Date & Time *"
                  type="datetime-local"
                  size="small"
                  value={createForm.leavingDateTime}
                  onChange={e => setCreateForm({ ...createForm, leavingDateTime: e.target.value })}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Expected Curfew Return *"
                  type="datetime-local"
                  size="small"
                  value={createForm.expectedReturnDateTime}
                  onChange={e => setCreateForm({ ...createForm, expectedReturnDateTime: e.target.value })}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>

            <TextField
              label="Reason / Special Notes"
              value={createForm.reason}
              onChange={e => setCreateForm({ ...createForm, reason: e.target.value })}
              fullWidth
              multiline
              rows={2}
              size="small"
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={createForm.parentConsent}
                  onChange={e => setCreateForm({ ...createForm, parentConsent: e.target.checked })}
                  color="success"
                />
              }
              label="Parent / Guardian Telephonic or App Consent Verified"
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, borderTop: '1px solid #e2e8f0' }}>
          <Button onClick={() => setOpenCreateModal(false)} sx={{ fontWeight: 600 }}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleCreate}
            disabled={!createForm.studentId || !createForm.destination}
            sx={{ 
              fontWeight: 700, 
              background: 'linear-gradient(135deg, #e11d48 0%, #db2777 100%)',
              borderRadius: 2 
            }}
          >
            Issue & Grant Gate Clearance
          </Button>
        </DialogActions>
      </Dialog>

      {/* --- MODAL 2: DIGITAL QR GATE PASS --- */}
      <Dialog open={openQRModal} onClose={() => setOpenQRModal(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogContent sx={{ p: 3 }}>
          {selectedPass && (
            <Box id="digital-gate-pass" sx={{ p: 2.5, border: '2px dashed #e11d48', borderRadius: 3, bgcolor: '#ffffff', textAlign: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 900, color: '#e11d48' }}>
                CAMPUS GATE DIGITAL OUTPASS
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 2 }}>
                Present to Security Guard at Campus Exit Gate
              </Typography>

              {/* QR Code graphic */}
              <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 3, display: 'inline-block', mb: 2, border: '1px solid #e2e8f0' }}>
                <QrCode2Icon sx={{ fontSize: 130, color: '#0f172a' }} />
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#0f172a', display: 'block', letterSpacing: 2 }}>
                  {selectedPass.gatePassNumber || `GP-${selectedPass._id.slice(-6).toUpperCase()}`}
                </Typography>
              </Box>

              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a' }}>
                {selectedPass.studentId?.firstName} {selectedPass.studentId?.lastName}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>
                Admission ID: {selectedPass.studentId?.admissionNumber || selectedPass.studentId?.studentId || 'N/A'}
              </Typography>

              <Divider sx={{ my: 1.5 }} />

              <Box sx={{ textAlign: 'left', bgcolor: '#fff1f2', p: 1.5, borderRadius: 2 }}>
                <Typography variant="caption" sx={{ color: '#e11d48', fontWeight: 700, display: 'block' }}>
                  Destination: {selectedPass.destination}
                </Typography>
                <Typography variant="caption" sx={{ color: '#334155', display: 'block' }}>
                  Expected Curfew: {selectedPass.expectedReturnDateTime ? new Date(selectedPass.expectedReturnDateTime).toLocaleString() : '8:30 PM'}
                </Typography>
                <Typography variant="caption" sx={{ color: '#16a34a', fontWeight: 700, display: 'block', mt: 0.5 }}>
                  Status: {selectedPass.status} (Warden Cleared)
                </Typography>
              </Box>

              <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', mt: 2 }}>
                Security Gate Verification Hotline: +91 98765 43210
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid #e2e8f0' }}>
          <Button onClick={() => setOpenQRModal(false)} sx={{ fontWeight: 600 }}>Close</Button>
          <Button 
            variant="contained" 
            startIcon={<PrintIcon />}
            onClick={() => window.print()}
            sx={{ fontWeight: 700, borderRadius: 2 }}
          >
            Print Gate Pass
          </Button>
        </DialogActions>
      </Dialog>

      {/* --- MODAL 3: RETURN CHECK-IN --- */}
      <Dialog open={openReturnModal} onClose={() => setOpenReturnModal(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 800, color: '#16a34a', borderBottom: '1px solid #e2e8f0' }}>
          Confirm Safe Return & Gate Check-In
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {selectedPass && (
            <Stack spacing={2}>
              <Alert severity="success" sx={{ borderRadius: 2 }}>
                Confirming student physical return to hostel grounds and safe return verification.
              </Alert>

              <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                Student: {selectedPass.studentId?.firstName} {selectedPass.studentId?.lastName}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b' }}>
                Destination: {selectedPass.destination}
              </Typography>
              <Typography variant="caption" sx={{ color: '#16a34a', fontWeight: 700 }}>
                Actual Return Time: {new Date().toLocaleTimeString()}
              </Typography>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2.5, borderTop: '1px solid #e2e8f0' }}>
          <Button onClick={() => setOpenReturnModal(false)} sx={{ fontWeight: 600 }}>Cancel</Button>
          <Button 
            variant="contained" 
            color="success" 
            onClick={handleMarkReturned}
            sx={{ fontWeight: 700, borderRadius: 2 }}
          >
            Confirm Safe Return
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
};

export default HostelOutpassManagement;
