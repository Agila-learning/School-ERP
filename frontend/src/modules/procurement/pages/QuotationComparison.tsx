import React from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Chip } from '@mui/material';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const QuotationComparison: React.FC = () => {
  const comparisonData = {
    rfqNumber: 'RFQ-2026-003',
    item: 'Dell Laptops (x50)',
    vendors: [
      { id: 'V1', name: 'TechCorp Solutions', price: '$45,000', delivery: '15 Days', warranty: '3 Years', paymentTerms: 'Net 30', score: 85, isSelected: false },
      { id: 'V2', name: 'Global IT Suppliers', price: '$42,500', delivery: '30 Days', warranty: '1 Year', paymentTerms: 'Immediate', score: 72, isSelected: false },
      { id: 'V3', name: 'Elite Electronics', price: '$46,000', delivery: '7 Days', warranty: '3 Years', paymentTerms: 'Net 45', score: 92, isSelected: true },
    ]
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <CompareArrowsIcon fontSize="large" color="primary" />
        Quotation Comparison: {comparisonData.rfqNumber}
      </Typography>

      <TableContainer component={Paper} elevation={3}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: 'background.default' }}>
              <TableCell><strong>Criteria</strong></TableCell>
              {comparisonData.vendors.map(v => (
                <TableCell key={v.id} align="center">
                  <Typography variant="h6">{v.name}</Typography>
                  {v.isSelected && <Chip icon={<CheckCircleIcon />} label="Selected Vendor" color="success" size="small" sx={{ mt: 1 }} />}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell><strong>Total Price</strong></TableCell>
              {comparisonData.vendors.map(v => <TableCell key={v.id} align="center">{v.price}</TableCell>)}
            </TableRow>
            <TableRow>
              <TableCell><strong>Delivery Time</strong></TableCell>
              {comparisonData.vendors.map(v => <TableCell key={v.id} align="center">{v.delivery}</TableCell>)}
            </TableRow>
            <TableRow>
              <TableCell><strong>Warranty</strong></TableCell>
              {comparisonData.vendors.map(v => <TableCell key={v.id} align="center">{v.warranty}</TableCell>)}
            </TableRow>
            <TableRow>
              <TableCell><strong>Payment Terms</strong></TableCell>
              {comparisonData.vendors.map(v => <TableCell key={v.id} align="center">{v.paymentTerms}</TableCell>)}
            </TableRow>
            <TableRow>
              <TableCell><strong>Evaluation Score</strong></TableCell>
              {comparisonData.vendors.map(v => (
                <TableCell key={v.id} align="center">
                  <Typography color={v.score > 80 ? 'success.main' : 'warning.main'} sx={{ fontWeight: 'bold' }}>
                    {v.score} / 100
                  </Typography>
                </TableCell>
              ))}
            </TableRow>
            <TableRow>
              <TableCell><strong>Actions</strong></TableCell>
              {comparisonData.vendors.map(v => (
                <TableCell key={v.id} align="center">
                  <Button variant={v.isSelected ? "contained" : "outlined"} color={v.isSelected ? "success" : "primary"}>
                    {v.isSelected ? "Awarded" : "Award PO"}
                  </Button>
                </TableCell>
              ))}
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default QuotationComparison;
