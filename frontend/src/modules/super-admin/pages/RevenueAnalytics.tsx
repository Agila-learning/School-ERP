import { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, Card, CardContent, CircularProgress, Alert, Divider, Chip, Stack } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { getRevenueAnalytics } from '../api/superAdmin.api';

const MetricCard = ({ title, value, subtitle, color }: any) => (
  <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
    <CardContent>
      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>{title}</Typography>
      <Typography variant="h4" sx={{ fontWeight: 800, color: `${color}.main`, mb: 0.5 }}>{value}</Typography>
      {subtitle && <Typography variant="caption" color="text.secondary">{subtitle}</Typography>}
    </CardContent>
  </Card>
);

export default function RevenueAnalytics() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getRevenueAnalytics()
      .then(res => setData(res.data.data))
      .catch(() => setError('Failed to load revenue analytics'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress size={60} /></Box>;
  if (error) return <Alert severity="error" sx={{ m: 3 }}>{error}</Alert>;

  return (
    <Box sx={{ p: 4, maxWidth: 1600, mx: 'auto' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1 }}>
          <TrendingUpIcon fontSize="large" color="primary" /> Revenue Analytics
        </Typography>
        <Typography variant="body2" color="text.secondary">Real-time revenue metrics from actual subscription data</Typography>
      </Box>

      {/* Core Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard title="MRR" value={`₹${(data?.mrr || 0).toLocaleString()}`} subtitle="Monthly Recurring Revenue" color="primary" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard title="ARR" value={`₹${(data?.arr || 0).toLocaleString()}`} subtitle="Annual Recurring Revenue" color="success" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard title="This Month" value={`₹${(data?.currentMonthRevenue || 0).toLocaleString()}`} subtitle="Collected this month" color="info" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard title="Trial Conversion" value={`${data?.trialConversionRate || 0}%`} subtitle="Trials converted to paid" color="warning" />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Monthly Revenue History */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Monthly Revenue History</Typography>
            <Divider sx={{ mb: 2 }} />
            {(data?.monthlyRevenue || []).length === 0 ? (
              <Typography color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>No payment data yet.</Typography>
            ) : (
              <Box>
                {(data?.monthlyRevenue || []).map((m: any) => {
                  const maxRevenue = Math.max(...(data?.monthlyRevenue || []).map((x: any) => x.total));
                  const pct = maxRevenue > 0 ? (m.total / maxRevenue) * 100 : 0;
                  return (
                    <Box key={`${m._id.year}-${m._id.month}`} sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2">
                          {new Date(m._id.year, m._id.month - 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>₹{m.total.toLocaleString()} ({m.count} invoices)</Typography>
                      </Box>
                      <Box sx={{ height: 8, bgcolor: 'grey.100', borderRadius: 4, overflow: 'hidden' }}>
                        <Box sx={{ height: '100%', width: `${pct}%`, bgcolor: 'primary.main', borderRadius: 4, transition: 'width 0.5s ease' }} />
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Plan Revenue Breakdown + Subscription Status */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Stack spacing={3}>
            <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Revenue by Plan</Typography>
              <Divider sx={{ mb: 2 }} />
              {(data?.planRevenue || []).length === 0 ? (
                <Typography color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>No data yet.</Typography>
              ) : (data?.planRevenue || []).map((p: any) => (
                <Box key={p._id.planId} sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: '1px solid #f0f0f0' }}>
                  <Typography variant="body2">{p._id.planName}</Typography>
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>₹{p.total?.toLocaleString()}</Typography>
                    <Chip size="small" label={`${p.count} invoices`} />
                  </Stack>
                </Box>
              ))}
            </Paper>

            <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Subscriptions by Status</Typography>
              <Divider sx={{ mb: 2 }} />
              {(data?.subscriptionsByStatus || []).map((s: any) => (
                <Box key={s._id} sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                  <Chip size="small" label={s._id} color={s._id === 'ACTIVE' ? 'success' : s._id === 'TRIAL' ? 'info' : s._id === 'EXPIRED' ? 'warning' : 'default'} />
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>{s.count}</Typography>
                </Box>
              ))}
            </Paper>

            <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Payment Health</Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">Success Rate</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: 'success.main' }}>{data?.paymentSuccessRate || 0}%</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                <Typography variant="body2" color="text.secondary">Failed Payments</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: 'error.main' }}>{data?.failedPayments || 0}</Typography>
              </Box>
            </Paper>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}
