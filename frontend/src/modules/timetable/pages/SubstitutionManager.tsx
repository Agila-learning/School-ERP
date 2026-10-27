import React, { useState } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Button, Chip, Select, MenuItem,
  FormControl, InputLabel, Alert, Divider,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/AccountCircle';
import WarningAmberIcon from '@mui/icons-material/Warning';

const mockPending = [
  { id: '1', period: 'P1 09:00', section: 'Grade 10-A', subject: 'Mathematics', originalTeacher: 'Mrs. Rao', day: 'MON', room: 'R101' },
  { id: '2', period: 'P3 10:30', section: 'Grade 9-B', subject: 'Mathematics', originalTeacher: 'Mrs. Rao', day: 'MON', room: 'R103' },
];

const availableSubstitutes = [
  { id: 'emp1', name: 'Mr. Patel (Mathematics)', available: true },
  { id: 'emp2', name: 'Ms. Gupta (General)', available: true },
  { id: 'emp3', name: 'Dr. Rajan (Physics)', available: false },
];

const SubstitutionManager: React.FC = () => {
  const [assignments, setAssignments] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState<Record<string, boolean>>({});

  const handleAssign = (requestId: string) => {
    if (assignments[requestId]) {
      setSubmitted(prev => ({ ...prev, [requestId]: true }));
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" sx={{ fontWeight: 700 }} gutterBottom>Substitution Manager</Typography>

      <Alert severity="warning" icon={<WarningAmberIcon />} sx={{ mb: 3 }}>
        <strong>Mrs. Rao</strong> is absent today. 2 periods require a substitute teacher.
      </Alert>

      <Paper sx={{ mb: 3, p: 2 }}>
        <Typography variant="h6" gutterBottom>Affected Periods — Monday</Typography>
        <Divider sx={{ mb: 2 }} />
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                <TableCell>Period</TableCell>
                <TableCell>Section</TableCell>
                <TableCell>Subject</TableCell>
                <TableCell>Room</TableCell>
                <TableCell>Assign Substitute</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {mockPending.map(req => (
                <TableRow key={req.id} hover>
                  <TableCell><Typography variant="body2" sx={{ fontWeight: 600 }}>{req.period}</Typography></TableCell>
                  <TableCell>{req.section}</TableCell>
                  <TableCell>{req.subject}</TableCell>
                  <TableCell>{req.room}</TableCell>
                  <TableCell>
                    {!submitted[req.id] ? (
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <FormControl size="small" sx={{ minWidth: 220 }}>
                          <InputLabel>Select Substitute</InputLabel>
                          <Select
                            value={assignments[req.id] ?? ''}
                            label="Select Substitute"
                            onChange={e => setAssignments(prev => ({ ...prev, [req.id]: e.target.value }))}
                          >
                            {availableSubstitutes.map(sub => (
                              <MenuItem key={sub.id} value={sub.id} disabled={!sub.available}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <PersonIcon fontSize="small" />
                                  {sub.name}
                                  {!sub.available && <Chip label="Busy" size="small" color="error" sx={{ ml: 1, height: 16 }} />}
                                </Box>
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        <Button
                          variant="contained"
                          size="small"
                          disabled={!assignments[req.id]}
                          onClick={() => handleAssign(req.id)}
                        >
                          Assign
                        </Button>
                      </Box>
                    ) : null}
                  </TableCell>
                  <TableCell>
                    {submitted[req.id] ? (
                      <Chip label="ASSIGNED" color="success" size="small" />
                    ) : (
                      <Chip label="PENDING" color="warning" size="small" />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {Object.values(submitted).some(v => v) && (
        <Alert severity="success">
          Substitution assigned. Affected classes and teachers will be notified.
        </Alert>
      )}
    </Box>
  );
};

export default SubstitutionManager;
