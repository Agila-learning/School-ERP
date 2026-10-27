import React from 'react';
import { Box, Typography, Card, Button, Table, TableBody, TableCell, TableHead, TableRow, Chip } from '@mui/material';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';

const AchievementManager: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>Achievement Verification Queue</Typography>
      
      <Card sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Student</TableCell>
              <TableCell>Achievement Title</TableCell>
              <TableCell>Level</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Evidence</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>John Doe (Grade 10)</TableCell>
              <TableCell>State Chess Championship Winner</TableCell>
              <TableCell>State</TableCell>
              <TableCell>Oct 10, 2026</TableCell>
              <TableCell><Button size="small" variant="text">View PDF</Button></TableCell>
              <TableCell><Chip label="Under Review" size="small" color="warning" /></TableCell>
              <TableCell align="right">
                <Button size="small" color="success" startIcon={<VerifiedUserIcon />} sx={{ mr: 1 }}>Verify</Button>
                <Button size="small" color="error">Reject</Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Card>
    </Box>
  );
};

export default AchievementManager;
