import { useState, useEffect } from 'react';
import { 
  Box, Typography, Table, TableBody, TableCell, TableHead, TableRow, 
  Paper, Chip, Button, CircularProgress, Dialog, DialogTitle, DialogContent, 
  DialogActions, TextField, Alert
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoIcon from '@mui/icons-material/Info';
import { getAssignedComplaints, resolveComplaint, type Complaint } from '../api/communication.api';

const ComplaintDesk = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [resolutionRemarks, setResolutionRemarks] = useState('');
  const [resolving, setResolving] = useState(false);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const data = await getAssignedComplaints();
      setComplaints(data);
    } catch (e) {
      console.error(e);
      setError('Failed to fetch assigned complaints');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleResolveClick = (c: Complaint) => {
    setSelectedComplaint(c);
    setResolutionRemarks('');
    setResolveModalOpen(true);
  };

  const submitResolution = async () => {
    if (!selectedComplaint) return;
    setResolving(true);
    try {
      await resolveComplaint(selectedComplaint._id, resolutionRemarks);
      setResolveModalOpen(false);
      fetchComplaints();
    } catch (e) {
      console.error(e);
      alert('Failed to resolve complaint');
    } finally {
      setResolving(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'URGENT': return 'error';
      case 'HIGH': return 'warning';
      case 'NORMAL': return 'info';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'OPEN': return 'error';
      case 'IN_PROGRESS': return 'warning';
      case 'ASSIGNED': return 'info';
      case 'RESOLVED': return 'success';
      case 'CLOSED': return 'default';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>Complaint & Issue Desk</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>Manage and resolve issues assigned to you.</Typography>
        </Box>
        <Button variant="outlined" onClick={fetchComplaints}>Refresh</Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
        <Table>
          <TableHead sx={{ bgcolor: '#f1f5f9' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>ID</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Subject</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Priority</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Submitted By</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}><CircularProgress /></TableCell>
              </TableRow>
            ) : complaints.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4, color: 'text.secondary' }}>No complaints assigned to you.</TableCell>
              </TableRow>
            ) : complaints.map((c) => (
              <TableRow key={c._id} hover>
                <TableCell sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>{c.complaintNumber || c.id || c._id.slice(-6).toUpperCase()}</TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{c.subject}</Typography>
                </TableCell>
                <TableCell>
                  <Chip size="small" label={c.category} variant="outlined" />
                </TableCell>
                <TableCell>
                  <Chip size="small" label={c.priority} color={getPriorityColor(c.priority)} />
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{c.submittedBy?.firstName} {c.submittedBy?.lastName}</Typography>
                  <Typography variant="caption" color="text.secondary">{c.submittedBy?.role}</Typography>
                </TableCell>
                <TableCell>
                  <Chip size="small" label={c.status} color={getStatusColor(c.status)} sx={{ fontWeight: 600 }} />
                </TableCell>
                <TableCell align="right">
                  {c.status !== 'RESOLVED' && c.status !== 'CLOSED' ? (
                    <Button 
                      variant="contained" 
                      color="success" 
                      size="small" 
                      onClick={() => handleResolveClick(c)}
                      sx={{ textTransform: 'none', borderRadius: 2 }}
                    >
                      Resolve
                    </Button>
                  ) : (
                    <Button 
                      variant="text" 
                      color="inherit" 
                      size="small" 
                      startIcon={<InfoIcon />}
                      onClick={() => {
                        setSelectedComplaint(c);
                        setResolutionRemarks(c.resolutionRemarks || 'No remarks provided.');
                        setResolveModalOpen(true);
                      }}
                      sx={{ textTransform: 'none' }}
                    >
                      Details
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      {/* Resolve Modal */}
      <Dialog open={resolveModalOpen} onClose={() => !resolving && setResolveModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
          {selectedComplaint?.status === 'RESOLVED' || selectedComplaint?.status === 'CLOSED' ? <InfoIcon color="info" /> : <CheckCircleIcon color="success" />}
          {selectedComplaint?.status === 'RESOLVED' || selectedComplaint?.status === 'CLOSED' ? 'Complaint Details' : 'Resolve Complaint'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3, p: 2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
            <Typography variant="subtitle2" color="text.secondary">Subject</Typography>
            <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>{selectedComplaint?.subject}</Typography>
            
            <Typography variant="subtitle2" color="text.secondary">Description</Typography>
            <Typography variant="body2">{selectedComplaint?.description}</Typography>
          </Box>

          <TextField
            fullWidth
            label="Resolution Remarks"
            multiline
            rows={4}
            value={resolutionRemarks}
            onChange={(e) => setResolutionRemarks(e.target.value)}
            disabled={selectedComplaint?.status === 'RESOLVED' || selectedComplaint?.status === 'CLOSED' || resolving}
            placeholder="Describe how this issue was resolved..."
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={() => setResolveModalOpen(false)} disabled={resolving}>
            {selectedComplaint?.status === 'RESOLVED' || selectedComplaint?.status === 'CLOSED' ? 'Close' : 'Cancel'}
          </Button>
          {selectedComplaint?.status !== 'RESOLVED' && selectedComplaint?.status !== 'CLOSED' && (
            <Button 
              variant="contained" 
              color="success" 
              onClick={submitResolution} 
              disabled={resolving || !resolutionRemarks.trim()}
              sx={{ borderRadius: 2 }}
            >
              {resolving ? 'Submitting...' : 'Mark as Resolved'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ComplaintDesk;