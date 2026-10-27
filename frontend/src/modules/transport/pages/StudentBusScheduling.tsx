import { useState } from 'react';
import { Box, Typography, Paper, Grid, TextField, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Autocomplete } from '@mui/material';
import TimelineIcon from '@mui/icons-material/Timeline';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

export default function StudentBusScheduling() {
  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  const students = [
    { label: 'Alice Smith (Class 10-A)', id: 'STU001', route: 'R-North-01', stop: 'Central Park', fee: 1200, pickupTime: '07:15 AM', dropTime: '04:30 PM' },
    { label: 'Bob Jones (Class 11-B)', id: 'STU002', route: 'R-South-04', stop: 'Times Square', fee: 1500, pickupTime: '07:30 AM', dropTime: '04:15 PM' },
    { label: 'Charlie Brown (Class 9-C)', id: 'STU003', route: 'Unassigned', stop: '-', fee: 0, pickupTime: '-', dropTime: '-' },
  ];

  const routes = [
    { label: 'R-North-01 (Uptown Express)', fee: 1200 },
    { label: 'R-South-04 (Downtown Loop)', fee: 1500 },
    { label: 'R-East-02 (Queens Direct)', fee: 1800 },
  ];

  const stops = [
    'Central Park', 'Times Square', 'Grand Central', 'Queens Plaza', 'Brooklyn Bridge'
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b' }}>
          Student Bus Scheduling & Fee Tracking
        </Typography>
        <Button variant="contained" sx={{ textTransform: 'none', px: 3, borderRadius: 2 }}>
          Save Assignments
        </Button>
      </Box>

      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, borderRadius: 2, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', height: '100%' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>Assign Student to Route</Typography>
            
            <Autocomplete
              options={students}
              renderInput={(params) => <TextField {...params} label="Search Student" sx={{ mb: 3 }} />}
              onChange={(_, v) => setSelectedStudent(v)}
            />

            {selectedStudent && (
              <Box sx={{ mt: 2 }}>
                <Autocomplete
                  options={routes}
                  renderInput={(params) => <TextField {...params} label="Select Route" sx={{ mb: 3 }} />}
                  defaultValue={routes.find(r => r.label.includes(selectedStudent.route))}
                />
                
                <Autocomplete
                  options={stops}
                  renderInput={(params) => <TextField {...params} label="Select Stop" sx={{ mb: 3 }} />}
                  defaultValue={selectedStudent.stop !== '-' ? selectedStudent.stop : null}
                />

                <TextField 
                  fullWidth 
                  label="Calculated Transport Fee (Monthly)" 
                  value={selectedStudent.fee > 0 ? selectedStudent.fee : ''}
                  slotProps={{ input: { startAdornment: <AttachMoneyIcon sx={{ color: '#94a3b8', mr: 1 }} /> } }}
                  sx={{ mb: 3 }}
                />

                <Button variant="contained" color="primary" fullWidth sx={{ py: 1.5, borderRadius: 2, textTransform: 'none', fontWeight: 600 }}>
                  Confirm Schedule
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 0, borderRadius: 2, overflow: 'hidden', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
            <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#334155' }}>
                Current Assignments & Timings
              </Typography>
            </Box>
            <TableContainer>
              <Table>
                <TableHead sx={{ backgroundColor: '#f1f5f9' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, py: 2 }}>Student</TableCell>
                    <TableCell sx={{ fontWeight: 600, py: 2 }}>Assigned Route</TableCell>
                    <TableCell sx={{ fontWeight: 600, py: 2 }}>Pickup/Drop</TableCell>
                    <TableCell sx={{ fontWeight: 600, py: 2 }}>Monthly Fee</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {students.map((student) => (
                    <TableRow key={student.id} hover selected={selectedStudent?.id === student.id}>
                      <TableCell>
                        <Typography sx={{ fontWeight: 600, color: '#0f172a' }}>{student.label.split('(')[0]}</Typography>
                        <Typography variant="caption" sx={{ color: '#64748b' }}>{student.id} • {student.label.match(/\(([^)]+)\)/)?.[1]}</Typography>
                      </TableCell>
                      <TableCell>
                        {student.route !== 'Unassigned' ? (
                          <Chip icon={<DirectionsBusIcon />} label={student.route} size="small" color="primary" variant="outlined" />
                        ) : (
                          <Chip label="Unassigned" size="small" color="default" />
                        )}
                        <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: '#64748b' }}>{student.stop}</Typography>
                      </TableCell>
                      <TableCell>
                        {student.pickupTime !== '-' && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <TimelineIcon sx={{ fontSize: 16, color: '#10b981' }} />
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>{student.pickupTime}</Typography>
                          </Box>
                        )}
                        {student.dropTime !== '-' && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                            <TimelineIcon sx={{ fontSize: 16, color: '#ef4444' }} />
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>{student.dropTime}</Typography>
                          </Box>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ fontWeight: 700, color: student.fee > 0 ? '#1e293b' : '#94a3b8' }}>
                          ${student.fee}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
