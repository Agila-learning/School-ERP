import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Chip, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';

export const ChartOfAccounts: React.FC = () => {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/v1/accounting/accounts', { withCredentials: true });
      if (res.data && res.data.data) {
        setAccounts(res.data.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to deactivate this account?')) return;
    try {
      await axios.delete(`/api/v1/accounting/accounts/${id}`, { withCredentials: true });
      fetchAccounts();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Chart of Accounts</Typography>
        <Button variant="contained" startIcon={<AddIcon />}>New Account</Button>
      </Box>

      <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
        <Table>
          <TableHead sx={{ bgcolor: 'grey.50' }}>
            <TableRow>
              <TableCell><strong>Account Code</strong></TableCell>
              <TableCell><strong>Account Name</strong></TableCell>
              <TableCell><strong>Type</strong></TableCell>
              <TableCell><strong>System Mapping</strong></TableCell>
              <TableCell align="center"><strong>Status</strong></TableCell>
              <TableCell align="right"><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} align="center">Loading...</TableCell></TableRow>
            ) : accounts.length === 0 ? (
              <TableRow><TableCell colSpan={6} align="center">No accounts found.</TableCell></TableRow>
            ) : accounts.map((acc) => (
              <TableRow key={acc._id || acc.id} hover>
                <TableCell>{acc.accountCode || acc.code}</TableCell>
                <TableCell>{acc.accountName || acc.name}</TableCell>
                <TableCell>
                  <Chip size="small" label={acc.accountType || acc.type} color={(acc.accountType || acc.type) === 'ASSET' ? 'primary' : (acc.accountType || acc.type) === 'INCOME' ? 'success' : (acc.accountType || acc.type) === 'EXPENSE' ? 'error' : 'default'} />
                </TableCell>
                <TableCell>
                  {acc.systemMapping || acc.systemCode ? <Chip size="small" variant="outlined" label={acc.systemMapping || acc.systemCode} /> : <Typography variant="caption" color="text.secondary">None</Typography>}
                </TableCell>
                <TableCell align="center">
                  <Chip size="small" label={acc.isDeleted ? 'Inactive' : 'Active'} color={!acc.isDeleted ? 'success' : 'default'} />
                </TableCell>
                <TableCell align="right">
                  <IconButton size="small" color="primary"><EditIcon fontSize="small" /></IconButton>
                  <IconButton size="small" color="error" onClick={() => handleDelete(acc._id || acc.id)}><DeleteIcon fontSize="small" /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ChartOfAccounts;
