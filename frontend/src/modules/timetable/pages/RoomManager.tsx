import React, { useEffect, useState } from 'react';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Chip, Button, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { getRooms, createRoom } from '../api/timetable.api';
import type { Room } from '../api/timetable.api';

const RoomManager: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Room>>({
    name: '', code: '', type: 'Classroom', capacity: 30, status: 'active'
  });
  const [saving, setSaving] = useState(false);

  const fetchRooms = () => {
    setLoading(true);
    getRooms().then(data => {
      setRooms(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleCreate = async () => {
    try {
      setSaving(true);
      await createRoom(formData);
      setOpen(false);
      setFormData({ name: '', code: '', type: 'Classroom', capacity: 30, status: 'active' });
      fetchRooms();
    } catch (e) {
      console.error(e);
      alert('Failed to create room');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress /></Box>;

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>Room Management</Typography>
          <Typography variant="body1" color="text.secondary">Manage physical spaces and their capacities for scheduling.</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} disableElevation onClick={() => setOpen(true)}>
          Add Room
        </Button>
      </Box>

      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: 'grey.50' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Room Code</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Capacity</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rooms.map(room => (
                <TableRow key={room.id} hover>
                  <TableCell><Typography variant="body2" sx={{ fontWeight: 600, fontFamily: 'monospace' }}>{room.code}</Typography></TableCell>
                  <TableCell>{room.name}</TableCell>
                  <TableCell>
                    <Chip label={room.type} size="small" variant="outlined" color="primary" />
                  </TableCell>
                  <TableCell>{room.capacity} students</TableCell>
                  <TableCell>
                    <Chip label={room.status.toUpperCase()} size="small" color={room.status === 'active' ? 'success' : 'default'} />
                  </TableCell>
                  <TableCell align="right">
                    <Button size="small">Edit</Button>
                  </TableCell>
                </TableRow>
              ))}
              {rooms.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 3 }}>No rooms configured.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Add Room Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Room</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField label="Room Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} fullWidth required />
            <TextField label="Room Code" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} fullWidth required />
            <TextField select label="Room Type" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as any})} fullWidth>
              {['Classroom', 'Laboratory', 'Library', 'Auditorium', 'Playground', 'Other'].map(t => (
                <MenuItem key={t} value={t}>{t}</MenuItem>
              ))}
            </TextField>
            <TextField label="Capacity" type="number" value={formData.capacity} onChange={e => setFormData({...formData, capacity: Number(e.target.value)})} fullWidth required />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate} disabled={saving || !formData.name || !formData.code}>Create Room</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RoomManager;
