import React, { useEffect, useState } from 'react';
import { getFinanceDashboardStats } from '../api/finance.api';
import type { DashboardStats } from '../api/finance.api';
import { Box, Typography, Paper, Grid, Card, CardContent, CircularProgress } from '@mui/material';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import ReceiptIcon from '@mui/icons-material/Receipt';
import PaymentsIcon from '@mui/icons-material/Payments';
import Layout from '../../../core/components/Layout';

const FinanceDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    getFinanceDashboardStats().then(data => {
      setStats(data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  return (
    <Layout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: 'text.primary' }}>
          Finance Overview
        </Typography>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {/* Total Collected Today */}
            <Grid size={{ xs: 12, sm: 4 }}>
              <Card elevation={2} sx={{ borderRadius: 2, background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)', color: 'white' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>Today's Collection</Typography>
                      <Typography variant="h4" sx={{ fontWeight: 'bold' }}>₹{stats?.todaysCollection || 0}</Typography>
                    </Box>
                    <AccountBalanceIcon sx={{ fontSize: 40, opacity: 0.8 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Total Outstanding */}
            <Grid size={{ xs: 12, sm: 4 }}>
              <Card elevation={2} sx={{ borderRadius: 2, background: 'linear-gradient(135deg, #ed6c02 0%, #e65100 100%)', color: 'white' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>Total Outstanding</Typography>
                      <Typography variant="h4" sx={{ fontWeight: 'bold' }}>₹{stats?.totalOutstanding || 0}</Typography>
                    </Box>
                    <ReceiptIcon sx={{ fontSize: 40, opacity: 0.8 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Online vs Offline */}
            <Grid size={{ xs: 12, sm: 4 }}>
              <Card elevation={2} sx={{ borderRadius: 2, background: 'linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)', color: 'white' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>Online Collections (MTD)</Typography>
                      <Typography variant="h4" sx={{ fontWeight: 'bold' }}>₹{stats?.onlineCollectionsMTD || 0}</Typography>
                    </Box>
                    <PaymentsIcon sx={{ fontSize: 40, opacity: 0.8 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Recent Transactions List */}
            <Grid size={{ xs: 12 }}>
              <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2, mt: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Recent Transactions
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  No recent transactions available yet. (API Integration pending)
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        )}
      </Box>
    </Layout>
  );
};

export default FinanceDashboard;
