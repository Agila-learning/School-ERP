import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Button, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow, Chip, LinearProgress, IconButton
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';

const BudgetManager: React.FC = () => {
  const [budgets, setBudgets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBudgets();
  }, []);

  const fetchBudgets = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/v1/accounting/budgets', { withCredentials: true });
      if (res.data && res.data.data) {
        setBudgets(res.data.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this budget?')) return;
    try {
      await axios.delete(`/api/v1/accounting/budgets/${id}`, { withCredentials: true });
      fetchBudgets();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <RequestQuoteIcon fontSize="large" color="primary" />
          Budget Management
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />}>Allocate Budget</Button>
      </Box>

      <TableContainer component={Paper} elevation={3}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Account / Department</strong></TableCell>
              <TableCell align="right"><strong>Allocated ($)</strong></TableCell>
              <TableCell align="right"><strong>Used ($)</strong></TableCell>
              <TableCell align="right"><strong>Remaining ($)</strong></TableCell>
              <TableCell><strong>Utilization</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell align="right"><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={7} align="center">Loading...</TableCell></TableRow>
            ) : budgets.length === 0 ? (
              <TableRow><TableCell colSpan={7} align="center">No budgets found.</TableCell></TableRow>
            ) : budgets.map((budget) => {
              const allocated = budget.allocatedAmount || budget.allocated || 0;
              const used = budget.usedAmount || budget.used || 0;
              const remaining = allocated - used;
              const utilization = allocated > 0 ? (used / allocated) * 100 : 0;
              
              const accountName = budget.accountId?.accountName || budget.account || 'Unknown Account';

              return (
                <TableRow key={budget._id || budget.id}>
                  <TableCell>{accountName}</TableCell>
                  <TableCell align="right">{allocated.toLocaleString()}</TableCell>
                  <TableCell align="right">{used.toLocaleString()}</TableCell>
                  <TableCell align="right">{remaining.toLocaleString()}</TableCell>
                  <TableCell sx={{ minWidth: 150 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: '100%' }}>
                        <LinearProgress 
                          variant="determinate" 
                          value={Math.min(utilization, 100)} 
                          color={utilization >= 100 ? 'error' : utilization > 80 ? 'warning' : 'success'}
                        />
                      </Box>
                      <Typography variant="caption">{Math.round(utilization)}%</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={budget.status} 
                      color={budget.status === 'APPROVED' ? 'success' : 'error'} 
                      size="small" 
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" color="primary"><EditIcon fontSize="small" /></IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDelete(budget._id || budget.id)}><DeleteIcon fontSize="small" /></IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default BudgetManager;
