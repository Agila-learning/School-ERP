import React, { useState } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, MenuItem, Select, FormControl, InputLabel } from '@mui/material';

export const GeneralLedgerView: React.FC = () => {
  const [selectedAccount, setSelectedAccount] = useState('1100');

  const ledgerData = [
    { date: '2026-08-01', journal: 'JE-OB-001', desc: 'Opening Balance', debit: 1000000, credit: 0, balance: 1000000 },
    { date: '2026-08-05', journal: 'JE-PAY-045', desc: 'Student Fees Received', debit: 250000, credit: 0, balance: 1250000 },
    { date: '2026-08-06', journal: 'JE-EXP-112', desc: 'Electricity Bill Paid', debit: 0, credit: 15000, balance: 1235000 },
    { date: '2026-08-08', journal: 'JE-PAY-089', desc: 'Student Fees Received', debit: 45000, credit: 0, balance: 1280000 },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>General Ledger</Typography>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
        Detailed transaction history by account
      </Typography>

      <Paper elevation={0} sx={{ p: 3, mb: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
        <FormControl size="small" sx={{ minWidth: 300 }}>
          <InputLabel>Account</InputLabel>
          <Select value={selectedAccount} label="Account" onChange={(e) => setSelectedAccount(e.target.value)}>
            <MenuItem value="1100">1100 - Bank Account (HDFC)</MenuItem>
            <MenuItem value="1200">1200 - Student Receivable</MenuItem>
            <MenuItem value="4000">4000 - Fee Income</MenuItem>
            <MenuItem value="5000">5000 - Operational Expenses</MenuItem>
          </Select>
        </FormControl>
      </Paper>

      <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
        <Table>
          <TableHead sx={{ bgcolor: 'grey.50' }}>
            <TableRow>
              <TableCell><strong>Date</strong></TableCell>
              <TableCell><strong>Journal No</strong></TableCell>
              <TableCell><strong>Description</strong></TableCell>
              <TableCell align="right"><strong>Debit (₹)</strong></TableCell>
              <TableCell align="right"><strong>Credit (₹)</strong></TableCell>
              <TableCell align="right"><strong>Balance (₹)</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {ledgerData.map((row, index) => (
              <TableRow key={index} hover>
                <TableCell>{row.date}</TableCell>
                <TableCell><Typography color="primary" sx={{ cursor: 'pointer' }}>{row.journal}</Typography></TableCell>
                <TableCell>{row.desc}</TableCell>
                <TableCell align="right">{row.debit > 0 ? row.debit.toLocaleString() : '-'}</TableCell>
                <TableCell align="right">{row.credit > 0 ? row.credit.toLocaleString() : '-'}</TableCell>
                <TableCell align="right"><strong>{row.balance.toLocaleString()}</strong></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default GeneralLedgerView;
