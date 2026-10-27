import React, { useEffect, useState } from 'react';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, CircularProgress, Button, LinearProgress
} from '@mui/material';
import { getLeaveBalances } from '../api/leave.api';
import type { LeaveBalance } from '../api/leave.api';

const LeaveBalanceManager: React.FC = () => {
  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, we would get the logged-in employee ID or list all if admin
    // We will use a fallback for now or assume an employee context
    const empId = 'current_user_emp_id'; // Placeholder for actual auth context
    getLeaveBalances(empId).then(data => {
      setBalances(data || []);
      setLoading(false);
    }).catch(() => {
      setBalances([]);
      setLoading(false);
    });
  }, []);

  if (loading) return <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress /></Box>;

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>Employee Leave Balances</Typography>
          <Typography variant="body1" color="text.secondary">
            View and manually allocate leave balances for the current academic year.
          </Typography>
        </Box>
        <Button variant="outlined" color="primary">
          Bulk Allocate
        </Button>
      </Box>

      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: 'grey.50' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Employee ID</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Leave Type</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">Entitlement</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">Used</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">Pending</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">Available</TableCell>
                <TableCell sx={{ fontWeight: 600, width: 150 }}>Usage</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {balances.map(balance => {
                const usagePercent = (balance.usedDays / balance.totalEntitlement) * 100;
                return (
                  <TableRow key={balance.id || (balance as any)._id} hover>
                    <TableCell><Typography variant="body2" sx={{ fontWeight: 700 }}>{balance.employeeId}</Typography></TableCell>
                    <TableCell>{balance.leaveTypeId}</TableCell>
                    <TableCell align="right">{balance.totalEntitlement}</TableCell>
                    <TableCell align="right">{balance.usedDays}</TableCell>
                    <TableCell align="right">{balance.pendingDays}</TableCell>
                    <TableCell align="right"><Typography variant="body2" sx={{ fontWeight: 700, color: 'success.main' }}>{balance.availableDays}</Typography></TableCell>
                    <TableCell>
                      <LinearProgress 
                        variant="determinate" 
                        value={usagePercent || 0} 
                        color={usagePercent > 80 ? 'error' : usagePercent > 50 ? 'warning' : 'primary'}
                        sx={{ height: 6, borderRadius: 3 }}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
              {balances.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 3 }}>No balance records found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default LeaveBalanceManager;
