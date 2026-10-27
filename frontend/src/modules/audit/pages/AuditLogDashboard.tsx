import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Chip, CircularProgress,
  TextField, MenuItem, Select, FormControl, InputLabel, Pagination, Grid, Tooltip, IconButton,
  Dialog, DialogTitle, DialogContent
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { getAuditLogs } from '../api/audit.api';
import type { AuditLog, AuditLogResponse } from '../api/audit.api';

const AuditLogDashboard: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState('');
  const [entityFilter, setEntityFilter] = useState('');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  useEffect(() => {
    fetchLogs();
  }, [page, actionFilter, entityFilter]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await getAuditLogs({
        page,
        limit: 20,
        action: actionFilter || undefined,
        entityType: entityFilter || undefined
      });
      setLogs(data);
    } catch (error) {
      console.error('Failed to fetch audit logs', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'CREATE': return 'success';
      case 'UPDATE': return 'info';
      case 'DELETE': return 'error';
      case 'LOGIN': return 'primary';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>System Audit Logs</Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Monitor all system activity, data modifications, and user access.
      </Typography>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Action</InputLabel>
              <Select value={actionFilter} label="Action" onChange={e => setActionFilter(e.target.value)}>
                <MenuItem value="">All Actions</MenuItem>
                <MenuItem value="CREATE">Create</MenuItem>
                <MenuItem value="UPDATE">Update</MenuItem>
                <MenuItem value="DELETE">Delete</MenuItem>
                <MenuItem value="LOGIN">Login</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField 
              size="small" 
              fullWidth 
              label="Entity Type (e.g. StudentProfile)" 
              value={entityFilter} 
              onChange={e => setEntityFilter(e.target.value)}
            />
          </Grid>
        </Grid>
      </Paper>

      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: 'grey.50' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Timestamp</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>User</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Action</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Entity</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">Details</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6 }}><CircularProgress size={32} /></TableCell>
                </TableRow>
              ) : !logs || logs.data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                    <Typography color="text.secondary">No audit logs found.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                logs.data.map(log => (
                  <TableRow key={log._id} hover>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>
                      {new Date(log.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {log.performedBy ? `${log.performedBy.firstName} ${log.performedBy.lastName}` : 'System'}
                      {log.performedBy && <Typography variant="caption" sx={{ display: 'block' }} color="text.secondary">{log.performedBy.email}</Typography>}
                    </TableCell>
                    <TableCell>
                      <Chip label={log.action} size="small" color={getActionColor(log.action) as any} variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{log.entityType}</Typography>
                      <Typography variant="caption" color="text.secondary">{log.entityId}</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="View JSON Payload">
                        <IconButton size="small" color="primary" onClick={() => setSelectedLog(log)}>
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        {logs && logs.meta.totalPages > 1 && (
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'center', borderTop: '1px solid', borderColor: 'divider' }}>
            <Pagination count={logs.meta.totalPages} page={page} onChange={(_, p) => setPage(p)} color="primary" />
          </Box>
        )}
      </Paper>

      <Dialog open={!!selectedLog} onClose={() => setSelectedLog(null)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Audit Payload: {selectedLog?.action} {selectedLog?.entityType}</DialogTitle>
        <DialogContent dividers>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>Changes applied:</Typography>
          <Box component="pre" sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 2, overflow: 'auto', fontSize: '0.85rem' }}>
            {JSON.stringify(selectedLog?.changes || {}, null, 2)}
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default AuditLogDashboard;