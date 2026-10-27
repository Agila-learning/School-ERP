import React from 'react';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, LinearProgress 
} from '@mui/material';

const ClassAttendanceReport: React.FC = () => {
  const data = [
    { class: 'Grade 10', section: 'A', strength: 40, present: 38, percent: 95 },
    { class: 'Grade 10', section: 'B', strength: 38, present: 34, percent: 89.5 },
    { class: 'Grade 9', section: 'A', strength: 42, present: 41, percent: 97.6 },
    { class: 'Grade 9', section: 'B', strength: 41, present: 30, percent: 73.1 }, // Low
  ];

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>Class Attendance Report</Typography>
        <Typography variant="body1" color="text.secondary">
          Compare attendance rates across different sections for today.
        </Typography>
      </Box>

      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: 'grey.50' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Class</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Section</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">Strength</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">Present Today</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="center">Attendance Rate</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((row, idx) => (
                <TableRow key={idx} hover>
                  <TableCell><Typography variant="body2" sx={{ fontWeight: 700 }}>{row.class}</Typography></TableCell>
                  <TableCell>{row.section}</TableCell>
                  <TableCell align="right">{row.strength}</TableCell>
                  <TableCell align="right">{row.present}</TableCell>
                  <TableCell sx={{ width: 300 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ flexGrow: 1 }}>
                        <LinearProgress 
                          variant="determinate" 
                          value={row.percent} 
                          color={row.percent < 75 ? 'error' : row.percent < 90 ? 'warning' : 'success'} 
                          sx={{ height: 8, borderRadius: 4 }}
                        />
                      </Box>
                      <Typography variant="body2" sx={{ fontWeight: 700, minWidth: 40 }}>{row.percent}%</Typography>
                    </Box>
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

export default ClassAttendanceReport;
