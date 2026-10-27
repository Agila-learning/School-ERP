import React, { useState } from 'react';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Chip, Button, Tabs, Tab
} from '@mui/material';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import PersonIcon from '@mui/icons-material/Person';
import BuildIcon from '@mui/icons-material/Build';

const ExamLogisticsManager: React.FC = () => {
  const [tab, setTab] = useState(0);

  const [rooms, setRooms] = useState<any[]>([]);
  const [invigilators, setInvigilators] = useState<any[]>([]);

  React.useEffect(() => {
    // In a complete implementation, fetch from /v1/exam/rooms and /v1/exam/invigilators
    setRooms([]);
    setInvigilators([]);
  }, []);

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>Exam Logistics & Seating</Typography>
        <Typography variant="body2" color="text.secondary">Manage rooms, capacities, and invigilator assignments</Typography>
      </Box>

      <Paper variant="outlined" sx={{ mb: 3 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab icon={<MeetingRoomIcon />} iconPosition="start" label="Rooms & Seating" />
          <Tab icon={<PersonIcon />} iconPosition="start" label="Invigilators" />
        </Tabs>
        
        {tab === 0 && (
          <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Room Allocation for: Mid-Term 2026</Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button variant="outlined" startIcon={<BuildIcon />}>Auto-Generate Seating</Button>
                <Button variant="contained">Allocate Room</Button>
              </Box>
            </Box>
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: 'grey.50' }}>
                  <TableRow>
                    <TableCell>Room Name</TableCell>
                    <TableCell>Capacity</TableCell>
                    <TableCell>Assigned</TableCell>
                    <TableCell>Available Seats</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rooms.map(r => (
                    <TableRow key={r.id} hover>
                      <TableCell sx={{ fontWeight: 'medium' }}>{r.name}</TableCell>
                      <TableCell>{r.capacity}</TableCell>
                      <TableCell>{r.assigned}</TableCell>
                      <TableCell>{r.capacity - r.assigned}</TableCell>
                      <TableCell>
                        <Chip label={r.status} size="small" color={r.status === 'AVAILABLE' ? 'success' : r.status === 'READY' ? 'primary' : 'warning'} />
                      </TableCell>
                      <TableCell align="right">
                        <Button size="small">View Plan</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {tab === 1 && (
          <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Active Duty Assignments</Typography>
              <Button variant="contained">Assign Invigilator</Button>
            </Box>
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: 'grey.50' }}>
                  <TableRow>
                    <TableCell>Staff Name</TableCell>
                    <TableCell>Department</TableCell>
                    <TableCell>Current Assignments</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {invigilators.map(i => (
                    <TableRow key={i.id} hover>
                      <TableCell sx={{ fontWeight: 'medium' }}>{i.name}</TableCell>
                      <TableCell>{i.department}</TableCell>
                      <TableCell>{i.assignments} duties</TableCell>
                      <TableCell>
                        <Chip label={i.status} size="small" color={i.status === 'AVAILABLE' ? 'success' : 'error'} />
                      </TableCell>
                      <TableCell align="right">
                        <Button size="small">View Schedule</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default ExamLogisticsManager;
