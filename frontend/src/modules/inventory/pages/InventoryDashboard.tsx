import React, { useState, useEffect } from 'react';
import api from '../../../core/api/axios';
import { Box, Typography, Grid, Card, CardContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip } from '@mui/material';

const InventoryDashboard: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [stockBalances, setStockBalances] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [itemsRes, stockRes] = await Promise.all([
        api.get('/inventory/items'),
        api.get('/inventory/stock-balances')
      ]);
      setItems(itemsRes.data?.data || []);
      setStockBalances(stockRes.data?.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Box sx={{ p: 4, bgcolor: '#f4f6f8', minHeight: '100vh' }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>Inventory Dashboard</Typography>
      
      <Grid container spacing={4} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Total Items Cataloged</Typography>
              <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#1976d2' }}>{items.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}  >
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Active Warehouses</Typography>
              <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
                {new Set(stockBalances.map(sb => sb.warehouseId?._id)).size}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>Stock Ledger (Balances)</Typography>
      <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
        <Table>
          <TableHead sx={{ bgcolor: '#f5f5f5' }}>
            <TableRow>
              <TableCell>SKU</TableCell>
              <TableCell>Item Name</TableCell>
              <TableCell>Warehouse</TableCell>
              <TableCell align="right">Available Qty</TableCell>
              <TableCell align="right">Reserved Qty</TableCell>
              <TableCell align="center">Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {stockBalances.map((sb) => (
              <TableRow key={sb._id}>
                <TableCell>{sb.itemId?.sku}</TableCell>
                <TableCell>{sb.itemId?.itemName}</TableCell>
                <TableCell>{sb.warehouseId?.name}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>{sb.availableQuantity}</TableCell>
                <TableCell align="right" sx={{ color: 'warning.main' }}>{sb.reservedQuantity}</TableCell>
                <TableCell align="center">
                  <Chip 
                    size="small" 
                    label={sb.availableQuantity > (sb.itemId?.minimumStock || 0) ? 'In Stock' : 'Low Stock'} 
                    color={sb.availableQuantity > (sb.itemId?.minimumStock || 0) ? 'success' : 'error'} 
                  />
                </TableCell>
              </TableRow>
            ))}
            {stockBalances.length === 0 && (
              <TableRow><TableCell colSpan={6} align="center">No stock found</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default InventoryDashboard;
