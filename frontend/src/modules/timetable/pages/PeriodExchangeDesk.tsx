import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Button, Chip, Select, MenuItem,
  FormControl, InputLabel, Alert, Divider, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Grid, Tooltip, IconButton
} from '@mui/material';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/hooks/useAuth';

export interface PeriodExchangeRequest {
  id: string;
  requesterName: string;
  requesterRole: string;
  classSection: string;
  fromDay: string;
  fromPeriod: string;
  colleagueName: string;
  toDay: string;
  toPeriod: string;
  reason: string; // Mandatory reason
  status: 'PENDING_PRINCIPAL_APPROVAL' | 'PRINCIPAL_APPROVED' | 'ADMIN_PROCESSED' | 'REJECTED';
  principalRemarks?: string;
  adminRemarks?: string;
  createdAt: string;
}

const DEFAULT_EXCHANGES: PeriodExchangeRequest[] = [
  {
    id: 'exch_101',
    requesterName: 'Mrs. Ananya Sharma',
    requesterRole: 'Mathematics Teacher',
    classSection: 'Grade 10 - Section A',
    fromDay: 'Monday',
    fromPeriod: 'Period 2 (09:45 - 10:30)',
    colleagueName: 'Mr. Rajesh Patel',
    toDay: 'Wednesday',
    toPeriod: 'Period 4 (11:30 - 12:15)',
    reason: 'Parent-Teacher Special Consultative Meeting regarding Term Exam results.',
    status: 'PENDING_PRINCIPAL_APPROVAL',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString()
  },
  {
    id: 'exch_102',
    requesterName: 'Dr. Vikram Rajan',
    requesterRole: 'Physics Faculty',
    classSection: 'Grade 12 - Section B',
    fromDay: 'Tuesday',
    fromPeriod: 'Period 3 (10:30 - 11:15)',
    colleagueName: 'Ms. Sneha Sengupta',
    toDay: 'Thursday',
    toPeriod: 'Period 1 (09:00 - 09:45)',
    reason: 'District Level Science Exhibition judging panel member invitation.',
    status: 'PRINCIPAL_APPROVED',
    principalRemarks: 'Approved by Principal Dr. Sundaram. Proceed with routine change.',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
  }
];

export const PeriodExchangeDesk: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const userRole = (user?.role || 'TEACHER').toUpperCase();
  const isPrincipal = userRole === 'PRINCIPAL' || userRole === 'SUPER_ADMIN';
  const isAdmin = userRole === 'ADMIN' || userRole === 'OFFICE_ADMIN' || userRole === 'SUPER_ADMIN';

  const [requests, setRequests] = useState<PeriodExchangeRequest[]>(() => {
    const cached = localStorage.getItem('fic_period_exchange_requests');
    return cached ? JSON.parse(cached) : DEFAULT_EXCHANGES;
  });

  const [openModal, setOpenModal] = useState(false);
  const [form, setForm] = useState({
    classSection: 'Grade 10 - Section A',
    fromDay: 'Monday',
    fromPeriod: 'Period 2 (09:45 - 10:30)',
    colleagueName: '',
    toDay: 'Tuesday',
    toPeriod: 'Period 3 (10:30 - 11:15)',
    reason: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const saveToStorage = (updated: PeriodExchangeRequest[]) => {
    setRequests(updated);
    localStorage.setItem('fic_period_exchange_requests', JSON.stringify(updated));
  };

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.colleagueName.trim()) {
      setError('Please specify the colleague / substitute teacher you are exchanging with.');
      return;
    }
    if (!form.reason.trim()) {
      setError('A valid reason is strictly mandatory for Principal approval.');
      return;
    }

    const newReq: PeriodExchangeRequest = {
      id: `exch_${Date.now()}`,
      requesterName: `${user?.firstName || 'Staff'} ${user?.lastName || 'Member'}`.trim(),
      requesterRole: userRole.replace('_', ' '),
      classSection: form.classSection,
      fromDay: form.fromDay,
      fromPeriod: form.fromPeriod,
      colleagueName: form.colleagueName,
      toDay: form.toDay,
      toPeriod: form.toPeriod,
      reason: form.reason.trim(),
      status: 'PENDING_PRINCIPAL_APPROVAL',
      createdAt: new Date().toISOString()
    };

    const updated = [newReq, ...requests];
    saveToStorage(updated);
    setOpenModal(false);
    setForm({
      classSection: 'Grade 10 - Section A',
      fromDay: 'Monday',
      fromPeriod: 'Period 2 (09:45 - 10:30)',
      colleagueName: '',
      toDay: 'Tuesday',
      toPeriod: 'Period 3 (10:30 - 11:15)',
      reason: ''
    });
    setSuccessMsg('Period exchange submitted! It is now pending Principal approval.');
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  // Step 1: Principal Approval
  const handlePrincipalAction = (id: string, action: 'APPROVE' | 'REJECT') => {
    const remarks = window.prompt(action === 'APPROVE' ? 'Enter Principal Approval Remarks (Optional):' : 'Enter Reason for Rejection:');
    if (action === 'REJECT' && remarks === null) return;

    const updated = requests.map(r => {
      if (r.id === id) {
        return {
          ...r,
          status: (action === 'APPROVE' ? 'PRINCIPAL_APPROVED' : 'REJECTED') as any,
          principalRemarks: remarks || (action === 'APPROVE' ? 'Approved by Principal' : 'Rejected by Principal')
        };
      }
      return r;
    });

    saveToStorage(updated);
    setSuccessMsg(action === 'APPROVE' 
      ? 'Principal approved! The request has been forwarded to Admin for processing.' 
      : 'Exchange request rejected.');
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  // Step 2: Admin Processing
  const handleAdminProcess = (id: string) => {
    const remarks = window.prompt('Admin processing remarks / routine confirmation note (Optional):');
    const updated = requests.map(r => {
      if (r.id === id) {
        return {
          ...r,
          status: 'ADMIN_PROCESSED' as const,
          adminRemarks: remarks || 'Period exchange processed and routine updated successfully by Admin.'
        };
      }
      return r;
    });

    saveToStorage(updated);
    setSuccessMsg('Admin successfully processed the timetable exchange and updated class routines!');
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1300, mx: 'auto' }}>
      {/* Top Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            variant="outlined"
            onClick={() => window.history.length > 1 ? navigate(-1) : navigate('/timetable/dashboard')}
            sx={{ textTransform: 'none', borderRadius: 2 }}
          >
            Back
          </Button>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              Staff Timetable Period Exchange Desk
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Two-step verified workflow: <strong>Principal Approval</strong> first &rarr; <strong>Admin Timetable Processing</strong>.
            </Typography>
          </Box>
        </Box>

        <Button
          variant="contained"
          color="primary"
          startIcon={<AddCircleOutlineIcon />}
          onClick={() => { setError(null); setOpenModal(true); }}
          sx={{ fontWeight: 700, borderRadius: 2, px: 3, py: 1 }}
        >
          Request Period Exchange
        </Button>
      </Box>

      {successMsg && <Alert severity="success" sx={{ mb: 3 }}>{successMsg}</Alert>}

      {/* Workflow Explanation Banner */}
      <Paper elevation={0} sx={{ p: 2.5, mb: 4, borderRadius: 3, bgcolor: '#f0f9ff', border: '1px solid #bae6fd' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
          <SwapHorizIcon sx={{ color: '#0284c7' }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0369a1' }}>
            Exchange Flow Architecture
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ color: '#0c4a6e' }}>
          1. <strong>Teacher Submission:</strong> State the exchange colleague and a <em>strictly mandatory reason</em>.
          <br />
          2. <strong>Principal First Approval:</strong> Principal validates academic feasibility and grants authorization.
          <br />
          3. <strong>Admin Processing:</strong> Timetable Administrator finalizes and automatically commits the period swap to the school routine.
        </Typography>
      </Paper>

      {/* Requests Table */}
      <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <TableContainer sx={{ overflowX: 'auto' }}>
          <Table sx={{ minWidth: 950 }}>
            <TableHead sx={{ bgcolor: '#f8fafc' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Teacher / Role</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Current Slot</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Exchange With</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Target Slot</TableCell>
                <TableCell sx={{ fontWeight: 700, minWidth: 220 }}>Mandatory Reason</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700, textAlign: 'right' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {requests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6, color: '#94a3b8' }}>
                    No period exchange requests found.
                  </TableCell>
                </TableRow>
              ) : (
                requests.map(req => (
                  <TableRow key={req.id} hover>
                    <TableCell>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{req.requesterName}</Typography>
                      <Typography variant="caption" color="text.secondary">{req.requesterRole}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{req.fromPeriod}</Typography>
                      <Typography variant="caption" color="text.secondary">{req.fromDay} • {req.classSection}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{req.colleagueName}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{req.toPeriod}</Typography>
                      <Typography variant="caption" color="text.secondary">{req.toDay}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ color: '#334155', fontStyle: 'italic' }}>
                        "{req.reason}"
                      </Typography>
                      {req.principalRemarks && (
                        <Typography variant="caption" sx={{ display: 'block', color: '#0369a1', mt: 0.5, fontWeight: 600 }}>
                          Principal: {req.principalRemarks}
                        </Typography>
                      )}
                      {req.adminRemarks && (
                        <Typography variant="caption" sx={{ display: 'block', color: '#15803d', mt: 0.5, fontWeight: 600 }}>
                          Admin: {req.adminRemarks}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {req.status === 'PENDING_PRINCIPAL_APPROVAL' && (
                        <Chip size="small" icon={<HourglassEmptyIcon />} label="Pending Principal" color="warning" />
                      )}
                      {req.status === 'PRINCIPAL_APPROVED' && (
                        <Chip size="small" icon={<CheckCircleIcon />} label="Principal Approved" color="info" />
                      )}
                      {req.status === 'ADMIN_PROCESSED' && (
                        <Chip size="small" icon={<AdminPanelSettingsIcon />} label="Admin Processed" color="success" />
                      )}
                      {req.status === 'REJECTED' && (
                        <Chip size="small" icon={<CancelIcon />} label="Rejected" color="error" />
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                        {/* Principal Action Buttons */}
                        {req.status === 'PENDING_PRINCIPAL_APPROVAL' && (
                          <>
                            <Tooltip title="Principal Approve">
                              <Button
                                size="small"
                                variant="contained"
                                color="success"
                                sx={{ textTransform: 'none', borderRadius: 1.5, fontWeight: 700 }}
                                onClick={() => handlePrincipalAction(req.id, 'APPROVE')}
                              >
                                Principal Approve
                              </Button>
                            </Tooltip>
                            <Tooltip title="Reject">
                              <Button
                                size="small"
                                variant="outlined"
                                color="error"
                                sx={{ textTransform: 'none', borderRadius: 1.5 }}
                                onClick={() => handlePrincipalAction(req.id, 'REJECT')}
                              >
                                Reject
                              </Button>
                            </Tooltip>
                          </>
                        )}

                        {/* Admin Processing Button */}
                        {req.status === 'PRINCIPAL_APPROVED' && (
                          <Button
                            size="small"
                            variant="contained"
                            color="primary"
                            startIcon={<AdminPanelSettingsIcon />}
                            sx={{ textTransform: 'none', borderRadius: 1.5, fontWeight: 700 }}
                            onClick={() => handleAdminProcess(req.id)}
                          >
                            Process Routine
                          </Button>
                        )}

                        {req.status === 'ADMIN_PROCESSED' && (
                          <Chip size="small" label="Swap Complete" variant="outlined" color="success" />
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Period Exchange Request Modal */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1 }}>
          <SwapHorizIcon color="primary" />
          <span>New Period Exchange Request</span>
        </DialogTitle>
        <form onSubmit={handleCreateRequest}>
          <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {error && <Alert severity="error">{error}</Alert>}

            <Typography variant="body2" color="text.secondary">
              Note: This exchange must be reviewed and <strong>approved by the Principal</strong> before the Admin can update official routines.
            </Typography>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Class & Section"
                  value={form.classSection}
                  onChange={e => setForm({ ...form, classSection: e.target.value })}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Exchange With Colleague *"
                  placeholder="e.g. Mr. Rajesh Patel"
                  value={form.colleagueName}
                  onChange={e => setForm({ ...form, colleagueName: e.target.value })}
                  required
                />
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="My Current Day"
                  value={form.fromDay}
                  onChange={e => setForm({ ...form, fromDay: e.target.value })}
                >
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(d => (
                    <MenuItem key={d} value={d}>{d}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="My Current Period"
                  value={form.fromPeriod}
                  onChange={e => setForm({ ...form, fromPeriod: e.target.value })}
                />
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Target Day with Colleague"
                  value={form.toDay}
                  onChange={e => setForm({ ...form, toDay: e.target.value })}
                >
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(d => (
                    <MenuItem key={d} value={d}>{d}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Target Period with Colleague"
                  value={form.toPeriod}
                  onChange={e => setForm({ ...form, toPeriod: e.target.value })}
                />
              </Grid>
            </Grid>

            <TextField
              fullWidth
              multiline
              rows={3}
              size="small"
              label="Reason for Period Exchange * (Mandatory)"
              placeholder="State clear reasons (e.g. academic symposium, parent consultation, medical appointment)..."
              value={form.reason}
              onChange={e => setForm({ ...form, reason: e.target.value })}
              required
            />
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => setOpenModal(false)}>Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              sx={{ fontWeight: 700, borderRadius: 2, px: 3 }}
            >
              Submit for Principal Approval
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default PeriodExchangeDesk;
