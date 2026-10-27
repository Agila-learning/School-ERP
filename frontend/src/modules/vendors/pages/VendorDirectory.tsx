import React, { useState, useEffect } from 'react';
import api from '../../../core/api/axios';
import { Box, Typography, Grid, CardContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip } from '@mui/material';

const VendorDirectory: React.FC = () => {
  const [vendors, setVendors] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await api.get('/vendors');
      setVendors(res.data?.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Box sx={{ p: 4, bgcolor: '#f4f6f8', minHeight: '100vh' }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>Vendor Directory</Typography>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Total Registered Vendors</Typography>
              <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#1976d2' }}>{vendors.length}</Typography>
            </CardContent>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2, height: '100%' }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Verified Vendors</Typography>
              <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
                {vendors.filter(v => v.status === 'VERIFIED').length}
              </Typography>
            </CardContent>
          </Paper>
        </Grid>
      </Grid>

      <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>Vendor List</Typography>
      <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
        <Table>
          <TableHead sx={{ bgcolor: '#f5f5f5' }}>
            <TableRow>
              <TableCell>Vendor ID</TableCell>
              <TableCell>Display Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell align="center">Rating</TableCell>
              <TableCell align="center">Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {vendors.map((v) => (
              <TableRow key={v._id}>
                <TableCell sx={{ fontWeight: 'bold' }}>{v.vendorIdString}</TableCell>
                <TableCell>{v.displayName}</TableCell>
                <TableCell>{v.vendorType}</TableCell>
                <TableCell>{v.email}</TableCell>
                <TableCell>{v.phone}</TableCell>
                <TableCell align="center">{v.rating} / 5</TableCell>
                <TableCell align="center">
                  <Chip 
                    size="small" 
                    label={v.status} 
                    color={v.status === 'VERIFIED' ? 'success' : (v.status === 'PENDING' ? 'warning' : 'default')} 
                  />
                </TableCell>
              </TableRow>
            ))}
            {vendors.length === 0 && (
              <TableRow><TableCell colSpan={7} align="center">No vendors found</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default VendorDirectory;
