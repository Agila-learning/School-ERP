import React, { useEffect, useState } from 'react';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Chip, CircularProgress, IconButton, Button
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { getLeaveRequests, processLeaveRequest } from '../api/leave.api';
import type { LeaveRequest } from '../api/leave.api';

const LeaveApprovalBoard: React.FC = () => {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = () => {
    setLoading(true);
    getLeaveRequests({ status: 'PENDING' }).then(data => {
      setRequests(data);
      setLoading(false);
    }).catch(console.error);
  };

  const handleProcess = async (id: string, action: 'APPROVED' | 'REJECTED') => {
    try {
      await processLeaveRequest(id, action);
      loadRequests();
    } catch (error) {
      console.error(error);
      alert('Failed to process request');
    }
  };

  if (loading) return <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress /></Box>;

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1400, mx: 'auto' }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>Leave Approvals</Typography>
          <Typography variant="body1" color="text.secondary">
            Review and manage pending leave requests from staff and students.
          </Typography>
        </Box>
        <Button variant="outlined" color="primary">View History</Button>
      </Box>

      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: 'grey.50' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Submitted</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Applicant</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Domain</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Leave Type</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Duration</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Reason</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {requests.map(req => (
                <TableRow key={req.id || (req as any)._id} hover>
                  <TableCell><Typography variant="body2">{new Date(req.submittedAt).toLocaleDateString()}</Typography></TableCell>
                  <TableCell><Typography variant="body2" sx={{ fontWeight: 700 }}>{req.applicantName}</Typography></TableCell>
                  <TableCell><Chip label={req.domain} size="small" variant="outlined" /></TableCell>
                  <TableCell><Typography variant="body2" sx={{ fontWeight: 600 }}>{req.leaveTypeName}</Typography></TableCell>
                  <TableCell>
                    {req.startDate} to {req.endDate}
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>({req.totalDays} days)</Typography>
                  </TableCell>
                  <TableCell sx={{ maxWidth: 250 }}>
                    <Typography variant="body2" color="text.secondary" noWrap title={req.reason}>
                      {req.reason}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                      <IconButton size="small" color="primary" title="View Details">
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        color="success" 
                        title="Approve" 
                        onClick={() => handleProcess(req.id || (req as any)._id, 'APPROVED')}
                      >
                        <CheckIcon fontSize="small" />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        color="error" 
                        title="Reject" 
                        onClick={() => handleProcess(req.id || (req as any)._id, 'REJECTED')}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
              {requests.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 3 }}>No pending leave requests.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default LeaveApprovalBoard;
