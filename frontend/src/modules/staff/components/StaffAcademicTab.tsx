import React from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip } from '@mui/material';
import type { StaffProfileDetail } from '../api/staff.api';

interface Props {
  staff: StaffProfileDetail;
}

const StaffAcademicTab: React.FC<Props> = ({ staff }) => {
  if (!staff.isTeacher) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>Not a Teacher</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Academic assignments are only applicable to teaching staff.
        </Typography>
      </Box>
    );
  }

  // Mock Academic Assignments for demonstration
  const mockAssignments = [
    { id: 1, subject: 'Mathematics', class: 'Grade 10', section: 'A', status: 'ACTIVE' },
    { id: 2, subject: 'Mathematics', class: 'Grade 10', section: 'B', status: 'ACTIVE' },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>Academic Assignments (2025-2026)</Typography>
      </Box>

      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: 'grey.50' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Subject</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Class</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Section</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {mockAssignments.map(a => (
                <TableRow key={a.id} hover>
                  <TableCell><Typography variant="body2" sx={{ fontWeight: 600 }}>{a.subject}</Typography></TableCell>
                  <TableCell>{a.class}</TableCell>
                  <TableCell>{a.section}</TableCell>
                  <TableCell>
                    <Chip label={a.status} color="success" size="small" variant="outlined" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default StaffAcademicTab;
