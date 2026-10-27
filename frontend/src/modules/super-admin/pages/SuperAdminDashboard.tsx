import { useState, useEffect } from 'react';
import { Box, Typography, Grid, Card, CardContent, CircularProgress, Alert, Divider, Chip, Button, LinearProgress, Paper } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import BusinessIcon from '@mui/icons-material/Business';
import PeopleIcon from '@mui/icons-material/People';
import ReceiptIcon from '@mui/icons-material/Receipt';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { useNavigate } from 'react-router-dom';
import { getSaasDashboard, getRevenueAnalytics, getExpiringSoon } from '../api/superAdmin.api';

const StatCard = ({ title, value, subtitle, icon, color, onClick }: any) => (
  <Card elevation={0} onClick={onClick} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, cursor: onClick ? 'pointer' : 'default', transition: 'all 0.2s', '&:hover': onClick ? { transform: 'translateY(-2px)', boxShadow: 4 } : {} }}>
    <CardContent sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ p: 1.5, bgcolor: `${color}.50`, borderRadius: 2 }}>{icon}</Box>
      </Box>
      <Typography variant="h3" sx={{ fontWeight: 800, color: `${color}.main`, mb: 0.5 }}>{value}</Typography>
      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary' }}>{title}</Typography>
      {subtitle && <Typography variant="caption" color="text.secondary">{subtitle}</Typography>}
    </CardContent>
  </Card>
);

export default function SuperAdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [revenue, setRevenue] = useState<any>(null);
  const [expiring, setExpiring] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [dashRes, revRes, expRes] = await Promise.all([
        getSaasDashboard(),
        getRevenueAnalytics(),
        getExpiringSoon(30)
      ]);
      setStats(dashRes.data.data);
      setRevenue(revRes.data.data);
      setExpiring(expRes.data.data?.slice(0, 5) || []);
    } catch {
      setError('Failed to load SaaS dashboard. Please ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}><CircularProgress size={60} /></Box>;
  if (error) return <Alert severity="error" sx={{ m: 3 }}>{error}</Alert>;

  const schoolCards = [
    { title: 'Total Schools', value: stats?.totalSchools || 0, subtitle: `${stats?.activeTenants || 0} active tenants`, icon: <BusinessIcon sx={{ color: 'primary.main' }} />, color: 'primary', path: '/super-admin/tenants' },
    { title: 'Active Subscriptions', value: stats?.activeSubscriptions || 0, subtitle: 'Currently on paid plans', icon: <CheckCircleIcon sx={{ color: 'success.main' }} />, color: 'success', path: '/super-admin/subscriptions' },
    { title: 'Total Students', value: (stats?.totalStudents || 0).toLocaleString(), subtitle: 'Across all schools', icon: <PeopleIcon sx={{ color: 'info.main' }} />, color: 'info', path: '/super-admin/usage' },
    { title: 'Total Staff', value: (stats?.totalStaff || 0).toLocaleString(), subtitle: 'Teachers & staff', icon: <PeopleIcon sx={{ color: 'secondary.main' }} />, color: 'secondary', path: '/super-admin/usage' },
  ];

  const revenueCards = [
    { title: 'MRR', value: `₹${(revenue?.mrr || 0).toLocaleString()}`, subtitle: 'Monthly Recurring Revenue', icon: <TrendingUpIcon sx={{ color: 'success.main' }} />, color: 'success' },
    { title: 'ARR', value: `₹${(revenue?.arr || 0).toLocaleString()}`, subtitle: 'Annual Recurring Revenue', icon: <TrendingUpIcon sx={{ color: 'primary.main' }} />, color: 'primary' },
    { title: 'Payment Success Rate', value: `${revenue?.paymentSuccessRate || 0}%`, subtitle: `${revenue?.failedPayments || 0} failed payments`, icon: <ReceiptIcon sx={{ color: 'warning.main' }} />, color: 'warning' },
    { title: 'Trial Conversion', value: `${revenue?.trialConversionRate || 0}%`, subtitle: 'Trials converted to paid', icon: <DashboardIcon sx={{ color: 'info.main' }} />, color: 'info' },
  ];

  return (
    <Box sx={{ p: 4, maxWidth: 1600, mx: 'auto' }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 1 }}>
            <DashboardIcon fontSize="large" color="primary" /> SaaS Platform Dashboard
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Complete platform overview • {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </Typography>
        </Box>
        <Button variant="contained" onClick={() => navigate('/super-admin/tenants')} startIcon={<BusinessIcon />}>
          Manage Schools
        </Button>
      </Box>

      {/* Platform KPIs */}
      <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: 2 }}>PLATFORM OVERVIEW</Typography>
      <Grid container spacing={3} sx={{ mt: 0.5, mb: 4 }}>
        {schoolCards.map((card, i) => (
          <Grid key={i} size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard {...card} onClick={() => navigate(card.path)} />
          </Grid>
        ))}
      </Grid>

      {/* Revenue KPIs */}
      <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: 2 }}>REVENUE METRICS</Typography>
      <Grid container spacing={3} sx={{ mt: 0.5, mb: 4 }}>
        {revenueCards.map((card, i) => (
          <Grid key={i} size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard {...card} />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Recent Tenants */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Recent Schools</Typography>
              <Button size="small" onClick={() => navigate('/super-admin/tenants')}>View All</Button>
            </Box>
            <Divider sx={{ mb: 2 }} />
            {(stats?.recentTenants || []).map((t: any) => (
              <Box key={t._id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1.5, borderBottom: '1px solid #f0f0f0' }}>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{t.name}</Typography>
                  <Typography variant="caption" color="text.secondary">{t.code}</Typography>
                </Box>
                <Chip size="small" label={t.status} color={t.status === 'ACTIVE' || t.status === 'active' ? 'success' : t.status === 'SUSPENDED' || t.status === 'suspended' ? 'error' : 'default'} />
              </Box>
            ))}
            {(stats?.recentTenants || []).length === 0 && <Typography color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>No schools yet.</Typography>}
          </Paper>
        </Grid>

        {/* Expiring Subscriptions */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AccessTimeIcon color="warning" />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>Expiring Soon (30 days)</Typography>
              </Box>
              <Button size="small" onClick={() => navigate('/super-admin/subscriptions')}>View All</Button>
            </Box>
            <Divider sx={{ mb: 2 }} />
            {expiring.map((sub: any) => {
              const daysLeft = Math.ceil((new Date(sub.endDate).getTime() - Date.now()) / 86400000);
              return (
                <Box key={sub._id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1.5, borderBottom: '1px solid #f0f0f0' }}>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{sub.tenantId?.name}</Typography>
                    <Typography variant="caption" color="text.secondary">{sub.planId?.name}</Typography>
                  </Box>
                  <Chip size="small" label={`${daysLeft}d left`} color={daysLeft <= 7 ? 'error' : daysLeft <= 14 ? 'warning' : 'default'} icon={<WarningIcon />} />
                </Box>
              );
            })}
            {expiring.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <CheckCircleIcon color="success" sx={{ fontSize: 40, mb: 1 }} />
                <Typography color="text.secondary">No subscriptions expiring in 30 days.</Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Subscription Status Breakdown */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Subscriptions by Status</Typography>
            <Divider sx={{ mb: 2 }} />
            {(revenue?.subscriptionsByStatus || []).map((s: any) => (
              <Box key={s._id} sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{s._id}</Typography>
                  <Typography variant="body2">{s.count}</Typography>
                </Box>
                <LinearProgress variant="determinate" value={Math.min((s.count / (stats?.activeSubscriptions + 5 || 1)) * 100, 100)} sx={{ height: 6, borderRadius: 3 }} />
              </Box>
            ))}
          </Paper>
        </Grid>

        {/* Quick Actions */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Quick Actions</Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              {[
                { label: 'Onboard School', path: '/super-admin/tenants', icon: '🏫' },
                { label: 'Create Plan', path: '/super-admin/plans', icon: '📋' },
                { label: 'Generate Invoice', path: '/super-admin/invoices', icon: '🧾' },
                { label: 'View Tickets', path: '/super-admin/support', icon: '🎫' },
                { label: 'Feature Flags', path: '/super-admin/feature-flags', icon: '🚩' },
                { label: 'System Health', path: '/super-admin/health', icon: '🏥' },
              ].map(action => (
                <Grid key={action.label} size={{ xs: 6 }}>
                  <Button fullWidth variant="outlined" onClick={() => navigate(action.path)} sx={{ py: 1.5, justifyContent: 'flex-start', gap: 1 }}>
                    <span>{action.icon}</span> {action.label}
                  </Button>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
