import React from 'react';
import { Box, Typography, Card, Button, Table, TableHead, TableRow, TableCell, TableBody, Chip } from '@mui/material';

const AssetRegistry: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>Asset Registry</Typography>
        <Box>
          <Button variant="outlined" sx={{ mr: 1 }}>Scan QR</Button>
          <Button variant="contained">Add Asset</Button>
        </Box>
      </Box>

      <Card sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Asset Tag</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Assigned To</TableCell>
              <TableCell>Condition</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>AST-10042</TableCell>
              <TableCell>Computer / Laptop</TableCell>
              <TableCell>IT Dept</TableCell>
              <TableCell>John Doe</TableCell>
              <TableCell>Good</TableCell>
              <TableCell><Chip label="In Use" size="small" color="primary" /></TableCell>
            </TableRow>
            <TableRow>
              <TableCell>AST-10043</TableCell>
              <TableCell>Projector</TableCell>
              <TableCell>Room 101</TableCell>
              <TableCell>N/A</TableCell>
              <TableCell>Damaged</TableCell>
              <TableCell><Chip label="Under Maintenance" size="small" color="warning" /></TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Card>
    </Box>
  );
};

export default AssetRegistry;
