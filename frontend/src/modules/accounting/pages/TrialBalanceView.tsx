import React from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';

export const TrialBalanceView: React.FC = () => {
  const trialBalanceData = [
    { accountCode: '1100', accountName: 'Bank Account (HDFC)', debit: 1280000, credit: 0 },
    { accountCode: '1200', accountName: 'Student Receivable', debit: 530000, credit: 0 },
    { accountCode: '4000', accountName: 'Fee Income', debit: 0, credit: 1690000 },
    { accountCode: '5000', accountName: 'Operational Expenses', debit: 120000, credit: 0 },
    { accountCode: '2000', accountName: 'Accounts Payable', debit: 0, credit: 240000 },
  ];

  const totalDebit = trialBalanceData.reduce((acc, row) => acc + row.debit, 0);
  const totalCredit = trialBalanceData.reduce((acc, row) => acc + row.credit, 0);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>Trial Balance</Typography>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
        As of {new Date().toLocaleDateString()}
      </Typography>

      <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
        <Table>
          <TableHead sx={{ bgcolor: 'grey.50' }}>
            <TableRow>
              <TableCell><strong>Account Code</strong></TableCell>
              <TableCell><strong>Account Name</strong></TableCell>
              <TableCell align="right"><strong>Debit (₹)</strong></TableCell>
              <TableCell align="right"><strong>Credit (₹)</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {trialBalanceData.map((row) => (
              <TableRow key={row.accountCode} hover>
                <TableCell>{row.accountCode}</TableCell>
                <TableCell>{row.accountName}</TableCell>
                <TableCell align="right">{row.debit > 0 ? row.debit.toLocaleString() : '-'}</TableCell>
                <TableCell align="right">{row.credit > 0 ? row.credit.toLocaleString() : '-'}</TableCell>
              </TableRow>
            ))}
            <TableRow sx={{ bgcolor: 'grey.100' }}>
              <TableCell colSpan={2} align="right"><strong>Total</strong></TableCell>
              <TableCell align="right"><strong>{totalDebit.toLocaleString()}</strong></TableCell>
              <TableCell align="right"><strong>{totalCredit.toLocaleString()}</strong></TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default TrialBalanceView;
