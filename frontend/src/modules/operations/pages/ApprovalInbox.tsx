import React from 'react';
import { Box, Typography, Card, Button, Table, TableHead, TableRow, TableCell, TableBody, Chip } from '@mui/material';

const ApprovalInbox: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>My Approvals</Typography>

      <Card sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Request ID</TableCell>
              <TableCell>Module</TableCell>
              <TableCell>Requester</TableCell>
              <TableCell>Priority</TableCell>
              <TableCell>Current Step</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>#REQ-1049</TableCell>
              <TableCell>Purchase</TableCell>
              <TableCell>IT Dept</TableCell>
              <TableCell><Chip label="High" color="error" size="small" /></TableCell>
              <TableCell>Step 2: Principal Approval</TableCell>
              <TableCell align="right">
                <Button size="small" color="success" variant="contained" sx={{ mr: 1 }}>Approve</Button>
                <Button size="small" color="error" variant="outlined">Reject</Button>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>#REQ-1052</TableCell>
              <TableCell>Leave</TableCell>
              <TableCell>Jane Teacher</TableCell>
              <TableCell><Chip label="Medium" color="info" size="small" /></TableCell>
              <TableCell>Step 1: Department Head</TableCell>
              <TableCell align="right">
                <Button size="small" color="success" variant="contained" sx={{ mr: 1 }}>Approve</Button>
                <Button size="small" color="error" variant="outlined">Reject</Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Card>
    </Box>
  );
};

export default ApprovalInbox;
