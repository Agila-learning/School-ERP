import React, { useState } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Chip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

export const ExpenseManager: React.FC = () => {
  const [expenses] = useState([
    { id: '1', date: '2026-08-07', category: 'Maintenance', vendor: 'ABC Services', amount: 15000, status: 'PAID' },
    { id: '2', date: '2026-08-08', category: 'Stationery', vendor: 'Office World', amount: 4500, status: 'PENDING' },
    { id: '3', date: '2026-08-08', category: 'Software', vendor: 'AWS', amount: 25000, status: 'APPROVED' },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID': return 'success';
      case 'PENDING': return 'warning';
      case 'APPROVED': return 'info';
      case 'REJECTED': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Expense Manager</Typography>
        <Button variant="contained" startIcon={<AddIcon />}>Submit Expense</Button>
      </Box>

      <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
        <Table>
          <TableHead sx={{ bgcolor: 'grey.50' }}>
            <TableRow>
              <TableCell><strong>Date</strong></TableCell>
              <TableCell><strong>Category</strong></TableCell>
              <TableCell><strong>Vendor</strong></TableCell>
              <TableCell align="right"><strong>Amount (₹)</strong></TableCell>
              <TableCell align="center"><strong>Status</strong></TableCell>
              <TableCell align="right"><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {expenses.map((exp) => (
              <TableRow key={exp.id} hover>
                <TableCell>{exp.date}</TableCell>
                <TableCell>{exp.category}</TableCell>
                <TableCell>{exp.vendor}</TableCell>
                <TableCell align="right">{exp.amount.toLocaleString()}</TableCell>
                <TableCell align="center">
                  <Chip size="small" label={exp.status} color={getStatusColor(exp.status) as any} />
                </TableCell>
                <TableCell align="right">
                  {exp.status === 'PENDING' && (
                    <Button size="small" color="primary">Approve</Button>
                  )}
                  {exp.status === 'APPROVED' && (
                    <Button size="small" color="success">Pay & Post GL</Button>
                  )}
                  <Button size="small" color="inherit">View</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ExpenseManager;
