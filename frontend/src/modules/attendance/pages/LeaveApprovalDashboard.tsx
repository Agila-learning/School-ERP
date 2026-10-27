import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, Button, Tab, Tabs, Avatar, CircularProgress, Alert
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { getLeaveRequests, processLeaveRequest } from '../api/attendance.api';

const LeaveApprovalDashboard: React.FC = () => {
  const [tab, setTab] = useState(0);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const data = await getLeaveRequests();
      setRequests(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAction = async (id: string, action: 'APPROVED' | 'REJECTED') => {
    try {
      await processLeaveRequest(id, { action });
      setRequests(prev => prev.map(r => r._id === id ? { ...r, status: action } : r));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to process request');
    }
  };

  const filtered = tab === 0 ? requests.filter(r => r.status === 'PENDING') : requests.filter(r => r.status !== 'PENDING');

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" sx={{ fontWeight: 700 }} gutterBottom>Leave Approval Dashboard</Typography>

      {/* KPI Strip */}
      <Box sx={{ display: 'flex', gap: 3, mb: 3 }}>
        <Paper sx={{ p: 2, minWidth: 140, textAlign: 'center' }}>
          <Typography color="textSecondary" variant="body2">Pending</Typography>
          <Typography variant="h5" sx={{ fontWeight: 700 }} color="warning.main">
            {requests.filter(r => r.status === 'PENDING').length}
          </Typography>
        </Paper>
        <Paper sx={{ p: 2, minWidth: 140, textAlign: 'center' }}>
          <Typography color="textSecondary" variant="body2">Approved This Month</Typography>
          <Typography variant="h5" sx={{ fontWeight: 700 }} color="success.main">
            {requests.filter(r => r.status === 'APPROVED').length}
          </Typography>
        </Paper>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Paper>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="Pending Requests" />
          <Tab label="Processed" />
        </Tabs>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                <TableCell>Employee</TableCell>
                <TableCell>Leave Type</TableCell>
                <TableCell>Dates</TableCell>
                <TableCell>Days</TableCell>
                <TableCell>Reason</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center"><CircularProgress /></TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography color="textSecondary" sx={{ py: 4 }}>No requests found.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map(req => {
                  const user = req.studentId || req.employeeId || {};
                  const name = user.firstName ? `${user.firstName} ${user.lastName}` : 'Unknown';
                  return (
                    <TableRow key={req._id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ width: 32, height: 32 }}>{name[0]}</Avatar>
                          {name}
                          {req.domain && <Chip label={req.domain} size="small" variant="outlined" sx={{ ml: 1, fontSize: '10px', height: 20 }} />}
                        </Box>
                      </TableCell>
                      <TableCell>{req.leaveTypeId || 'Standard'}</TableCell>
                      <TableCell>{new Date(req.startDate).toLocaleDateString()} → {new Date(req.endDate).toLocaleDateString()}</TableCell>
                      <TableCell>{req.totalDays}</TableCell>
                      <TableCell>{req.reason}</TableCell>
                      <TableCell>
                        <Chip
                          label={req.status}
                          color={req.status === 'APPROVED' ? 'success' : req.status === 'REJECTED' ? 'error' : 'warning'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {req.status === 'PENDING' && (
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                              size="small"
                              variant="contained"
                              color="success"
                              startIcon={<CheckCircleIcon />}
                              onClick={() => handleAction(req._id, 'APPROVED')}
                            >
                              Approve
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              color="error"
                              startIcon={<CancelIcon />}
                              onClick={() => handleAction(req._id, 'REJECTED')}
                            >
                              Reject
                            </Button>
                          </Box>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default LeaveApprovalDashboard;
