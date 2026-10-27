import React from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, LinearProgress, Chip } from '@mui/material';
import AssessmentIcon from '@mui/icons-material/Assessment';

const VendorPerformance: React.FC = () => {
  const vendors = [
    { id: '1', name: 'TechCorp Solutions', category: 'IT Equipment', onTimeDelivery: 95, defectRate: 2, priceCompetitiveness: 88, overallScore: 92 },
    { id: '2', name: 'Global IT Suppliers', category: 'Software', onTimeDelivery: 75, defectRate: 15, priceCompetitiveness: 90, overallScore: 78 },
    { id: '3', name: 'Office Plus', category: 'Stationery', onTimeDelivery: 99, defectRate: 0.5, priceCompetitiveness: 95, overallScore: 98 },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <AssessmentIcon fontSize="large" color="primary" />
        Vendor Performance Analytics
      </Typography>

      <TableContainer component={Paper} elevation={3}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Vendor Name</strong></TableCell>
              <TableCell><strong>Category</strong></TableCell>
              <TableCell><strong>On-Time Delivery</strong></TableCell>
              <TableCell><strong>Defect Rate</strong></TableCell>
              <TableCell><strong>Price Competitiveness</strong></TableCell>
              <TableCell align="center"><strong>Overall Rating</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {vendors.map((vendor) => (
              <TableRow key={vendor.id}>
                <TableCell>{vendor.name}</TableCell>
                <TableCell>
                  <Chip label={vendor.category} size="small" variant="outlined" />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LinearProgress variant="determinate" value={vendor.onTimeDelivery} sx={{ width: 100 }} color={vendor.onTimeDelivery > 90 ? 'success' : 'warning'} />
                    <Typography variant="body2">{vendor.onTimeDelivery}%</Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography color={vendor.defectRate > 5 ? 'error.main' : 'success.main'}>
                    {vendor.defectRate}%
                  </Typography>
                </TableCell>
                <TableCell>{vendor.priceCompetitiveness}%</TableCell>
                <TableCell align="center">
                  <Chip 
                    label={`${vendor.overallScore} / 100`}
                    color={vendor.overallScore > 90 ? 'success' : vendor.overallScore > 75 ? 'warning' : 'error'}
                    size="small"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default VendorPerformance;
