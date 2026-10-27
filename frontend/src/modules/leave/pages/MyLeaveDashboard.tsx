import React, { useEffect, useState } from 'react';
import { 
  Box, Typography, Paper, Grid, Card, CardContent, 
  Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, CircularProgress,
  IconButton, Tooltip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useNavigate } from 'react-router-dom';
import { getLeaveBalances, getMyLeaveRequests } from '../api/leave.api';
import type { LeaveBalance, LeaveRequest } from '../api/leave.api';
import { useAuth } from '../../auth/hooks/useAuth';

const MyLeaveDashboard: React.FC = () => {
  const { user } = useAuth();
  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

  const fetchData = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);

    const empId = user?.id || 'EMP-CURRENT';
    try {
      const [b, r] = await Promise.all([
        getLeaveBalances(empId),
        getMyLeaveRequests()
      ]);
      setBalances(b || []);
      setRequests(r || []);
    } catch (err) {
      console.error('Error fetching my leave data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  if (loading) return <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress /></Box>;

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>My Leave</Typography>
          <Typography variant="body1" color="text.secondary">View your balances and track application status.</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
          <Tooltip title="Refresh">
            <IconButton onClick={() => fetchData(true)} disabled={refreshing} sx={{ bgcolor: 'background.paper', border: '1px solid #e2e8f0' }}>
              <RefreshIcon sx={{ animation: refreshing ? 'spin 1s linear infinite' : 'none', '@keyframes spin': { '0%': { transform: 'rotate(0deg)' }, '100%': { transform: 'rotate(360deg)' } } }} />
            </IconButton>
          </Tooltip>
          <Button variant="contained" startIcon={<AddIcon />} disableElevation onClick={() => navigate('/leave/apply')}>
            Apply for Leave
          </Button>
        </Box>
      </Box>

      {/* Balances */}
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Current Balances</Typography>
      <Grid container spacing={3} sx={{ mb: 5 }}>
        {balances.map((b, idx) => {
          const typeName = (b as any).leaveTypeName || (b as any).name || (b.leaveTypeId === 'LT-1' || b.leaveTypeId === 'casual' ? 'Casual Leave' : b.leaveTypeId === 'LT-2' || b.leaveTypeId === 'sick' ? 'Sick Leave' : b.leaveTypeId || 'Standard Leave');
          return (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={b.id || idx}>
              <Card sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0' }}>
                <CardContent>
                  <Typography color="text.secondary" variant="overline" sx={{ fontWeight: 700 }}>
                    {typeName}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mt: 1 }}>
                    <Typography variant="h3" sx={{ fontWeight: 800, color: 'primary.main' }}>{b.availableDays ?? 0}</Typography>
                    <Typography variant="body2" color="text.secondary">days available</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 2, mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="caption" color="text.secondary">Total: {b.totalEntitlement ?? 0}</Typography>
                    <Typography variant="caption" color="text.secondary">Used: {b.usedDays ?? 0}</Typography>
                    {(b.pendingDays ?? 0) > 0 && <Typography variant="caption" color="warning.main">Pending: {b.pendingDays}</Typography>}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* History */}
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Application History</Typography>
      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: 'grey.50' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Date Applied</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Leave Type</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Duration</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Reason</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {requests.map(req => (
                <TableRow key={req.id || (req as any)._id} hover>
                  <TableCell>{req.submittedAt ? new Date(req.submittedAt).toLocaleDateString() : '-'}</TableCell>
                  <TableCell><Typography variant="body2" sx={{ fontWeight: 600 }}>{req.leaveTypeName || 'Leave'}</Typography></TableCell>
                  <TableCell>
                    {req.startDate} to {req.endDate}
                    <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>({req.totalDays} days)</Typography>
                  </TableCell>
                  <TableCell sx={{ maxWidth: 200 }}>
                    <Typography variant="body2" noWrap title={req.reason}>{req.reason}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={req.status || 'PENDING'} 
                      size="small" 
                      color={req.status === 'APPROVED' ? 'success' : req.status === 'REJECTED' ? 'error' : 'warning'} 
                    />
                  </TableCell>
                </TableRow>
              ))}
              {requests.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                    No past leave applications found. Click "Apply for Leave" to submit your first request.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default MyLeaveDashboard;
