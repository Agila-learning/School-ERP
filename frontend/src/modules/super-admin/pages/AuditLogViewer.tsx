import { useState, useEffect } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress, Pagination, TextField, Stack, MenuItem, Select, FormControl, InputLabel, Chip } from '@mui/material';
import HistoryIcon from '@mui/icons-material/History';
import { getAuditLogs } from '../api/superAdmin.api';
import dayjs from 'dayjs';

const ACTION_COLORS: Record<string, any> = {
  TENANT_SUSPENDED: 'error', TENANT_ARCHIVED: 'error', SUBSCRIPTION_CANCELLED: 'error',
  TENANT_REACTIVATED: 'success', SUBSCRIPTION_CREATED: 'success', PAYMENT_RECORDED: 'success',
  INVOICE_GENERATED: 'info', SUBSCRIPTION_UPGRADED: 'info',
};

export default function AuditLogViewer() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionFilter, setActionFilter] = useState('');
  const [entityTypeFilter, setEntityTypeFilter] = useState('');

  useEffect(() => { fetchLogs(); }, [page, actionFilter, entityTypeFilter]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await getAuditLogs({
        page, limit: 50,
        action: actionFilter || undefined,
        entityType: entityTypeFilter || undefined
      });
      setLogs(res.data.data);
      setTotalPages(res.data.pagination?.pages || 1);
    } catch {} finally { setLoading(false); }
  };

  return (
    <Box sx={{ p: 4, maxWidth: 1600, mx: 'auto' }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1 }}>
          <HistoryIcon fontSize="large" color="primary" /> Platform Audit Logs
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>Immutable record of all platform-level actions. Read-only.</Typography>
      </Box>

      <Paper elevation={0} sx={{ p: 2, mb: 3, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
        <Stack direction="row" spacing={2}>
          <TextField placeholder="Filter by action keyword..." size="small" value={actionFilter} onChange={e => { setActionFilter(e.target.value); setPage(1); }} sx={{ minWidth: 250 }} />
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Entity Type</InputLabel>
            <Select value={entityTypeFilter} onChange={e => { setEntityTypeFilter(e.target.value); setPage(1); }} label="Entity Type">
              <MenuItem value="">All</MenuItem>
              {['Tenant', 'Subscription', 'SaasInvoice', 'SaasPayment', 'FeatureFlag', 'PlatformSetting'].map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
            </Select>
          </FormControl>
        </Stack>
      </Paper>

      <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
        <Table size="small">
          <TableHead sx={{ bgcolor: 'grey.50' }}>
            <TableRow>
              <TableCell><strong>Timestamp</strong></TableCell>
              <TableCell><strong>Actor</strong></TableCell>
              <TableCell><strong>Action</strong></TableCell>
              <TableCell><strong>Entity</strong></TableCell>
              <TableCell><strong>School</strong></TableCell>
              <TableCell><strong>Description</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} align="center" sx={{ py: 4 }}><CircularProgress /></TableCell></TableRow>
            ) : logs.length === 0 ? (
              <TableRow><TableCell colSpan={6} align="center" sx={{ py: 4 }}>No audit logs found.</TableCell></TableRow>
            ) : logs.map(log => (
              <TableRow key={log._id} hover>
                <TableCell><Typography variant="caption" sx={{ fontFamily: 'monospace' }}>{dayjs(log.createdAt).format('DD MMM YY HH:mm:ss')}</Typography></TableCell>
                <TableCell>
                  <Typography variant="body2">{log.actor?.firstName} {log.actor?.lastName}</Typography>
                  <Typography variant="caption" color="text.secondary">{log.actorEmail}</Typography>
                </TableCell>
                <TableCell>
                  <Chip size="small" label={log.action} color={ACTION_COLORS[log.action] || 'default'} sx={{ fontFamily: 'monospace', fontSize: '0.65rem' }} />
                </TableCell>
                <TableCell>
                  <Typography variant="caption">{log.entityType}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="caption">{(log.tenantId as any)?.name || '—'}</Typography>
                </TableCell>
                <TableCell><Typography variant="body2" color="text.secondary">{log.description}</Typography></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination count={totalPages} page={page} onChange={(_, v) => setPage(v)} color="primary" />
        </Box>
      )}
    </Box>
  );
}
