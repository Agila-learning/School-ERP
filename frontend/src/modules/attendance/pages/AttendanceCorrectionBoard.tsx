import React, { useEffect, useState } from 'react';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Chip, CircularProgress, IconButton
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { getCorrectionRequests, processCorrection } from '../api/attendance.api';
import type { AttendanceCorrectionRequest } from '../api/attendance.api';

const AttendanceCorrectionBoard: React.FC = () => {
  const [requests, setRequests] = useState<AttendanceCorrectionRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = () => {
    setLoading(true);
    getCorrectionRequests().then(data => {
      setRequests(data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleProcess = async (id: string, action: 'APPROVED' | 'REJECTED') => {
    try {
      await processCorrection(id, { action });
      fetchRequests();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to process correction');
    }
  };

  if (loading) return <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress /></Box>;

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1400, mx: 'auto' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>Attendance Corrections</Typography>
        <Typography variant="body1" color="text.secondary">
          Review and approve requests to modify locked attendance records.
        </Typography>
      </Box>

      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: 'grey.50' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Student</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Requested By</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status Change</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Reason</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {requests.map(req => (
                <TableRow key={req.id} hover>
                  <TableCell><Typography variant="body2">{req.date}</Typography></TableCell>
                  <TableCell><Typography variant="body2" sx={{ fontWeight: 600 }}>{req.studentName}</Typography></TableCell>
                  <TableCell><Typography variant="body2">{req.requestedBy}</Typography></TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip label={req.previousStatus} size="small" variant="outlined" />
                      <Typography variant="caption">→</Typography>
                      <Chip label={req.requestedStatus} size="small" color="primary" />
                    </Box>
                  </TableCell>
                  <TableCell sx={{ maxWidth: 300 }}>
                    <Typography variant="body2" color="text.secondary" noWrap title={req.reason}>
                      {req.reason}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={req.status} 
                      size="small" 
                      color={req.status === 'PENDING' ? 'warning' : req.status === 'APPROVED' ? 'success' : 'error'} 
                    />
                  </TableCell>
                  <TableCell align="right">
                    {req.status === 'PENDING' && (
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                        <IconButton size="small" color="success" title="Approve" onClick={() => handleProcess(req.id, 'APPROVED')}>
                          <CheckIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" color="error" title="Reject" onClick={() => handleProcess(req.id, 'REJECTED')}>
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {requests.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 3 }}>No correction requests pending.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default AttendanceCorrectionBoard;
