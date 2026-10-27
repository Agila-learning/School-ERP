import React, { useState } from 'react';
import { Box, Typography, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';

const RFQManager: React.FC = () => {
  const [rfqs] = useState([
    { id: '1', rfqNumber: 'RFQ-2026-001', issueDate: '2026-08-01', closingDate: '2026-08-15', status: 'PUBLISHED' },
    { id: '2', rfqNumber: 'RFQ-2026-002', issueDate: '2026-08-05', closingDate: '2026-08-20', status: 'OPEN' },
    { id: '3', rfqNumber: 'RFQ-2026-003', issueDate: '2026-07-20', closingDate: '2026-07-30', status: 'EVALUATION' },
  ]);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <RequestQuoteIcon fontSize="large" color="primary" />
          Request For Quotation (RFQ) Manager
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />}>Publish New RFQ</Button>
      </Box>

      <TableContainer component={Paper} elevation={3}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>RFQ Number</strong></TableCell>
              <TableCell><strong>Issue Date</strong></TableCell>
              <TableCell><strong>Closing Date</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell align="right"><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rfqs.map((rfq) => (
              <TableRow key={rfq.id}>
                <TableCell>{rfq.rfqNumber}</TableCell>
                <TableCell>{rfq.issueDate}</TableCell>
                <TableCell>{rfq.closingDate}</TableCell>
                <TableCell>
                  <Chip 
                    label={rfq.status} 
                    color={
                      rfq.status === 'PUBLISHED' ? 'info' : 
                      rfq.status === 'OPEN' ? 'success' : 'warning'
                    } 
                    size="small" 
                  />
                </TableCell>
                <TableCell align="right">
                  <Button size="small" variant="outlined">View</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default RFQManager;
