import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Grid, Card, CardContent, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  LinearProgress
} from '@mui/material';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import PeopleIcon from '@mui/icons-material/People';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import api from '../../../core/api/axios';

const LibraryAnalytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [reports, setReports] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [a, r] = await Promise.all([
        api.get('/library/analytics'),
        api.get('/library/reports/overview'),
      ]);
      setAnalytics(a.data.data || {});
      setReports(r.data.data || {});
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const statCard = (title: string, value: any, sub?: string, color?: string, icon?: React.ReactNode) => (
    <Card variant="outlined">
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="body2" color="text.secondary">{title}</Typography>
            <Typography variant="h3" color={color || 'text.primary'} sx={{ fontWeight: 'bold' }}>{value ?? '—'}</Typography>
            {sub && <Typography variant="caption" color="text.secondary">{sub}</Typography>}
          </Box>
          {icon && <Box sx={{ color: color || 'primary.main', opacity: 0.7 }}>{icon}</Box>}
        </Box>
      </CardContent>
    </Card>
  );

  const copyStats = analytics?.categoryStats || [];
  const totalCopies = copyStats.reduce((a: number, s: any) => a + s.count, 0);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>Library Analytics</Typography>
        <Typography variant="body2" color="text.secondary">Insights and trends across all library operations</Typography>
      </Box>

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {/* Overview KPIs */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          {statCard('Total Book Titles', reports?.totalBooks, 'Unique titles in catalogue', 'primary.main', <MenuBookIcon sx={{ fontSize: 40 }} />)}
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          {statCard('Total Copies', reports?.totalCopies, 'Physical book copies', 'info.main', <MenuBookIcon sx={{ fontSize: 40 }} />)}
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          {statCard('Active Members', reports?.totalMembers, 'Current library members', 'success.main', <PeopleIcon sx={{ fontSize: 40 }} />)}
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          {statCard('Pending Fines', reports?.pendingFines, 'Unpaid library fines', 'warning.main', <WarningAmberIcon sx={{ fontSize: 40 }} />)}
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Copy Status Breakdown */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>Copy Status Distribution</Typography>
            {copyStats.length > 0 ? copyStats.map((s: any) => {
              const pct = totalCopies > 0 ? Math.round((s.count / totalCopies) * 100) : 0;
              const colors: any = { AVAILABLE: 'success', ISSUED: 'primary', RESERVED: 'warning', LOST: 'error', DAMAGED: 'warning', UNDER_REPAIR: 'default' };
              return (
                <Box key={s._id} sx={{ mb: 1.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip label={s._id || 'UNKNOWN'} size="small" color={colors[s._id] || 'default'} />
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>{s.count} ({pct}%)</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={pct} color={colors[s._id] || 'inherit'} sx={{ height: 6, borderRadius: 3 }} />
                </Box>
              );
            }) : <Typography color="text.secondary" variant="body2">No data available yet</Typography>}
          </Paper>
        </Grid>

        {/* Most Borrowed Books */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>Most Borrowed Books (Top 10)</Typography>
            {(analytics?.mostBorrowed || []).length > 0 ? (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow><TableCell>Book ID</TableCell><TableCell align="right">Times Borrowed</TableCell></TableRow>
                  </TableHead>
                  <TableBody>
                    {(analytics?.mostBorrowed || []).map((b: any, i: number) => (
                      <TableRow key={i} hover>
                        <TableCell><Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: 11 }}>{b._id?.toString().slice(-8) || 'N/A'}</Typography></TableCell>
                        <TableCell align="right">
                          <Chip label={b.count} size="small" color="primary" />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : <Typography color="text.secondary" variant="body2">No borrowing data available yet</Typography>}
          </Paper>
        </Grid>

        {/* Overdue Trend */}
        <Grid size={{ xs: 12 }}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>Overdue Books by Month</Typography>
            {(analytics?.overdueTrend || []).length > 0 ? (
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end', height: 120 }}>
                {(analytics?.overdueTrend || []).map((t: any) => {
                  const months = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                  const maxCount = Math.max(...(analytics?.overdueTrend || []).map((x: any) => x.count));
                  const height = maxCount > 0 ? Math.max((t.count / maxCount) * 100, 5) : 5;
                  return (
                    <Box key={t._id} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5, flex: 1 }}>
                      <Typography variant="caption">{t.count}</Typography>
                      <Box sx={{ width: '100%', height: `${height}px`, bgcolor: 'warning.main', borderRadius: 1, minHeight: 4 }} />
                      <Typography variant="caption" color="text.secondary">{months[t._id] || t._id}</Typography>
                    </Box>
                  );
                })}
              </Box>
            ) : <Typography color="text.secondary" variant="body2">No overdue trend data available yet</Typography>}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default LibraryAnalytics;
