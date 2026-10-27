import React from 'react';
import { Box, Typography, Grid, Paper, Card, CardContent, Divider } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ReceiptIcon from '@mui/icons-material/Receipt';

export const AccountingDashboard: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
        Accounting Dashboard
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
        General Ledger, Trial Balance, and Financial Overview
      </Typography>

      <Grid container spacing={3}>
        {/* KPIs */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography color="text.secondary" variant="subtitle2">Total Income</Typography>
                <TrendingUpIcon color="success" />
              </Box>
              <Typography variant="h5" sx={{ mt: 2, fontWeight: 'bold' }}>₹4,50,000</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography color="text.secondary" variant="subtitle2">Total Expenses</Typography>
                <TrendingDownIcon color="error" />
              </Box>
              <Typography variant="h5" sx={{ mt: 2, fontWeight: 'bold' }}>₹1,20,000</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography color="text.secondary" variant="subtitle2">Bank Balance</Typography>
                <AccountBalanceWalletIcon color="primary" />
              </Box>
              <Typography variant="h5" sx={{ mt: 2, fontWeight: 'bold' }}>₹12,80,000</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography color="text.secondary" variant="subtitle2">Accounts Receivable</Typography>
                <ReceiptIcon color="warning" />
              </Box>
              <Typography variant="h5" sx={{ mt: 2, fontWeight: 'bold' }}>₹5,30,000</Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Placeholder for Charts / Recent Journals */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2, height: '400px' }}>
            <Typography variant="h6" gutterBottom>Income vs Expense (YTD)</Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80%', color: 'text.secondary' }}>
              [ Chart Component Placeholder ]
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2, height: '400px' }}>
            <Typography variant="h6" gutterBottom>Recent Journal Entries</Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>JE-PAY-171822312</Typography>
                <Typography variant="caption" color="text.secondary">Debit: Gateway, Credit: AR (₹15,000)</Typography>
              </Box>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>JE-EXP-171822450</Typography>
                <Typography variant="caption" color="text.secondary">Debit: Maintenance, Credit: Bank (₹2,500)</Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AccountingDashboard;
