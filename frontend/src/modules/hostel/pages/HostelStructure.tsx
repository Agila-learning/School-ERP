import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Tabs, Tab, Button, Stack, Table, TableBody, TableCell, TableHead, TableRow,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Alert, IconButton, Chip, Tooltip, Grid
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { 
  getHostels, createHostel, updateHostel, deleteHostel, 
  getRooms, createRoom, updateRoom, deleteRoom, 
  getBuildings, getBlocks, getFloors, 
  createBuilding, createBlock, createFloor, 
  deleteBuilding, deleteBlock, deleteFloor 
} from '../api/hostel.api';

interface TabPanelProps { children?: React.ReactNode; value: number; index: number; }
const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div hidden={value !== index}>{value === index && <Box sx={{ pt: 3 }}>{children}</Box>}</div>
);

const HostelStructure: React.FC = () => {
  const [tab, setTab] = useState(0);
  const [hostels, setHostels] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [buildings, setBuildings] = useState<any[]>([]);
  const [blocks, setBlocks] = useState<any[]>([]);
  const [floors, setFloors] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Modals
  const [openHostelModal, setOpenHostelModal] = useState(false);
  const [editingHostelId, setEditingHostelId] = useState<string | null>(null);

  const [openRoomModal, setOpenRoomModal] = useState(false);
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);

  const [openStructModal, setOpenStructModal] = useState(false);

  // Forms
  const [hostelForm, setHostelForm] = useState({
    code: '',
    name: '',
    hostelType: 'BOYS',
    genderApplicability: 'MALE',
    totalCapacity: 100,
    address: '',
    description: ''
  });

  const [roomForm, setRoomForm] = useState({
    hostelId: '',
    buildingId: '',
    blockId: '',
    floorId: '',
    roomNumber: '',
    roomType: 'DOUBLE',
    capacity: 2,
    genderApplicability: 'MIXED'
  });

  const [structForm, setStructForm] = useState({
    type: 'BUILDING',
    hostelId: '',
    buildingId: '',
    blockId: '',
    name: '',
    code: '',
    floorNumber: 1,
    capacity: 50
  });

  useEffect(() => {
    fetchData();
  }, [tab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const hData = await getHostels();
      setHostels(Array.isArray(hData) ? hData : []);

      if (tab === 1 || tab === 2) {
        const rData = await getRooms();
        setRooms(Array.isArray(rData) ? rData : []);
      }
      
      const bData = await getBuildings();
      setBuildings(Array.isArray(bData) ? bData : []);
      const blkData = await getBlocks();
      setBlocks(Array.isArray(blkData) ? blkData : []);
      const fData = await getFloors();
      setFloors(Array.isArray(fData) ? fData : []);
    } catch (e: any) {
      setError(e.response?.data?.message || e.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  // --- HOSTEL CRUD ---
  const handleOpenAddHostel = () => {
    setEditingHostelId(null);
    setHostelForm({
      code: `H00${hostels.length + 1}`,
      name: '',
      hostelType: 'BOYS',
      genderApplicability: 'MALE',
      totalCapacity: 100,
      address: '',
      description: ''
    });
    setOpenHostelModal(true);
  };

  const handleOpenEditHostel = (h: any) => {
    setEditingHostelId(h._id);
    setHostelForm({
      code: h.code || '',
      name: h.name || '',
      hostelType: h.hostelType || 'BOYS',
      genderApplicability: h.genderApplicability || 'MALE',
      totalCapacity: h.totalCapacity || 100,
      address: h.address || '',
      description: h.description || ''
    });
    setOpenHostelModal(true);
  };

  const handleSaveHostel = async () => {
    if (!hostelForm.code || !hostelForm.name) {
      setError('Hostel Code and Name are required.');
      return;
    }
    try {
      if (editingHostelId) {
        await updateHostel(editingHostelId, hostelForm);
        setSuccess('Hostel updated successfully');
      } else {
        await createHostel(hostelForm);
        setSuccess('Hostel created successfully');
      }
      setOpenHostelModal(false);
      fetchData();
    } catch (e: any) {
      setError(e.response?.data?.message || e.message || 'Failed to save hostel');
    }
  };

  const handleDeleteHostel = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete hostel "${name}"?`)) return;
    try {
      await deleteHostel(id);
      setSuccess(`Hostel "${name}" deleted`);
      fetchData();
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to delete hostel');
    }
  };

  // --- ROOM CRUD ---
  const handleOpenAddRoom = () => {
    setEditingRoomId(null);
    setRoomForm({
      hostelId: hostels[0]?._id || '',
      buildingId: buildings[0]?._id || '',
      blockId: '',
      floorId: '',
      roomNumber: `${rooms.length + 101}`,
      roomType: 'DOUBLE',
      capacity: 2,
      genderApplicability: hostels[0]?.genderApplicability || 'MIXED'
    });
    setOpenRoomModal(true);
  };

  const handleOpenEditRoom = (r: any) => {
    setEditingRoomId(r._id);
    setRoomForm({
      hostelId: r.hostelId?._id || r.hostelId || '',
      buildingId: r.buildingId?._id || r.buildingId || '',
      blockId: r.blockId?._id || r.blockId || '',
      floorId: r.floorId?._id || r.floorId || '',
      roomNumber: r.roomNumber || '',
      roomType: r.roomType || 'DOUBLE',
      capacity: r.capacity || 2,
      genderApplicability: r.genderApplicability || 'MIXED'
    });
    setOpenRoomModal(true);
  };

  const handleSaveRoom = async () => {
    if (!roomForm.hostelId || !roomForm.roomNumber) {
      setError('Hostel and Room Number are required');
      return;
    }
    try {
      if (editingRoomId) {
        await updateRoom(editingRoomId, roomForm);
        setSuccess('Room updated successfully');
      } else {
        await createRoom(roomForm);
        setSuccess('Room and beds created successfully');
      }
      setOpenRoomModal(false);
      fetchData();
    } catch (e: any) {
      setError(e.response?.data?.message || e.message || 'Failed to save room');
    }
  };

  const handleDeleteRoom = async (id: string, roomNumber: string) => {
    if (!window.confirm(`Are you sure you want to delete room "${roomNumber}"?`)) return;
    try {
      await deleteRoom(id);
      setSuccess(`Room "${roomNumber}" deleted`);
      fetchData();
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to delete room');
    }
  };

  // --- STRUCTURE CRUD ---
  const handleCreateStructure = async () => {
    setError('');
    setSuccess('');
    if (!structForm.name) {
      setError('Structure name is required');
      return;
    }
    try {
      if (structForm.type === 'BUILDING') {
        const hId = structForm.hostelId || hostels[0]?._id;
        if (!hId) throw new Error('Please select a hostel first');
        await createBuilding({
          hostelId: hId,
          name: structForm.name,
          code: structForm.code || `BLD-${structForm.name.slice(0, 3).toUpperCase()}`,
          numberOfFloors: 3,
          capacity: structForm.capacity || 50
        } as any);
        setSuccess('Building created successfully');
      } else if (structForm.type === 'BLOCK') {
        const bId = structForm.buildingId || buildings[0]?._id;
        if (!bId) throw new Error('Please select a building first');
        await createBlock({
          buildingId: bId,
          blockName: structForm.name,
          capacity: structForm.capacity || 50
        } as any);
        setSuccess('Block created successfully');
      } else {
        const blkId = structForm.blockId || blocks[0]?._id;
        if (!blkId) throw new Error('Please select a block first');
        await createFloor({
          blockId: blkId,
          floorName: structForm.name,
          floorNumber: structForm.floorNumber || 1,
          capacity: structForm.capacity || 50
        } as any);
        setSuccess('Floor created successfully');
      }
      setOpenStructModal(false);
      fetchData();
    } catch (e: any) {
      setSuccess('');
      setError(e.response?.data?.message || e.message || 'Failed to create structure');
    }
  };

  const handleDeleteBuilding = async (id: string) => {
    if (!window.confirm('Delete this building?')) return;
    try {
      await deleteBuilding(id);
      setSuccess('Building deleted');
      fetchData();
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to delete building');
    }
  };

  const handleDeleteBlock = async (id: string) => {
    if (!window.confirm('Delete this block?')) return;
    try {
      await deleteBlock(id);
      setSuccess('Block deleted');
      fetchData();
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to delete block');
    }
  };

  const handleDeleteFloor = async (id: string) => {
    if (!window.confirm('Delete this floor?')) return;
    try {
      await deleteFloor(id);
      setSuccess('Floor deleted');
      fetchData();
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to delete floor');
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <div>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a' }}>Hostel Structure & Configuration</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Manage hostels, buildings, floors, rooms, and bed capacity
          </Typography>
        </div>
        <Stack direction="row" spacing={1.5}>
          {tab === 0 && (
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenAddHostel} sx={{ fontWeight: 700 }}>
              Add Hostel
            </Button>
          )}
          {tab === 1 && (
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenAddRoom} sx={{ fontWeight: 700 }}>
              Add Room & Auto-Beds
            </Button>
          )}
          {tab === 2 && (
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenStructModal(true)} sx={{ fontWeight: 700 }}>
              Add Building / Block / Floor
            </Button>
          )}
        </Stack>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      <Paper sx={{ mb: 3, borderRadius: 2 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label={`Hostels (${hostels.length})`} sx={{ fontWeight: 700 }} />
          <Tab label={`Rooms & Beds (${rooms.length})`} sx={{ fontWeight: 700 }} />
          <Tab label={`Hierarchy (${buildings.length} Bldgs / ${blocks.length} Blocks)`} sx={{ fontWeight: 700 }} />
        </Tabs>
      </Paper>

      {/* TAB 0: HOSTELS */}
      <TabPanel value={tab} index={0}>
        <Paper sx={{ borderRadius: 2, overflow: 'hidden', border: '1px solid #e2e8f0' }}>
          <Table>
            <TableHead sx={{ backgroundColor: '#f8fafc' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Code</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Hostel Type</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Gender</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Capacity</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {hostels.map(h => (
                <TableRow key={h._id} hover>
                  <TableCell sx={{ fontWeight: 600 }}>{h.code}</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#1e293b' }}>{h.name}</TableCell>
                  <TableCell>
                    <Chip size="small" label={h.hostelType} color={h.hostelType === 'GIRLS' ? 'secondary' : h.hostelType === 'BOYS' ? 'primary' : 'default'} />
                  </TableCell>
                  <TableCell>{h.genderApplicability}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{h.totalCapacity} beds</TableCell>
                  <TableCell>
                    <Chip size="small" label={h.status || 'ACTIVE'} color={h.status === 'INACTIVE' ? 'default' : 'success'} variant="outlined" />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit Hostel">
                      <IconButton size="small" color="primary" onClick={() => handleOpenEditHostel(h)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Hostel">
                      <IconButton size="small" color="error" onClick={() => handleDeleteHostel(h._id, h.name)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
              {hostels.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
                    No hostels found. Click "+ Add Hostel" to create your first hostel.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Paper>
      </TabPanel>

      {/* TAB 1: ROOMS */}
      <TabPanel value={tab} index={1}>
        <Paper sx={{ borderRadius: 2, overflow: 'hidden', border: '1px solid #e2e8f0' }}>
          <Table>
            <TableHead sx={{ backgroundColor: '#f8fafc' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Room Number</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Hostel</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Room Type</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Gender</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Capacity</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Occupancy</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rooms.map(r => (
                <TableRow key={r._id} hover>
                  <TableCell sx={{ fontWeight: 700, color: '#4f46e5' }}>{r.roomNumber}</TableCell>
                  <TableCell>{r.hostelId?.name || 'Default Hostel'}</TableCell>
                  <TableCell>{r.roomType}</TableCell>
                  <TableCell>{r.genderApplicability}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{r.capacity} beds</TableCell>
                  <TableCell>{r.currentOccupancy || 0} occupied</TableCell>
                  <TableCell>
                    <Chip 
                      size="small" 
                      label={r.status || 'AVAILABLE'} 
                      color={r.status === 'FULL' ? 'error' : r.status === 'PARTIALLY_OCCUPIED' ? 'warning' : 'success'} 
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit Room">
                      <IconButton size="small" color="primary" onClick={() => handleOpenEditRoom(r)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Room">
                      <IconButton size="small" color="error" onClick={() => handleDeleteRoom(r._id, r.roomNumber)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
              {rooms.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
                    No rooms found. Click "+ Add Room & Auto-Beds" to configure rooms.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Paper>
      </TabPanel>

      {/* TAB 2: BUILDINGS, BLOCKS, FLOORS */}
      <TabPanel value={tab} index={2}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper sx={{ p: 2.5, borderRadius: 2, border: '1px solid #e2e8f0' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Buildings ({buildings.length})</Typography>
                <Button size="small" variant="outlined" onClick={() => { setStructForm({ ...structForm, type: 'BUILDING' }); setOpenStructModal(true); }}>+ Add</Button>
              </Box>
              <Stack spacing={1.5}>
                {buildings.map(b => (
                  <Box key={b._id} sx={{ p: 1.5, borderRadius: 1.5, backgroundColor: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>{b.name}</Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>Code: {b.code} | Cap: {b.capacity}</Typography>
                    </div>
                    <IconButton size="small" color="error" onClick={() => handleDeleteBuilding(b._id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
                {buildings.length === 0 && <Typography variant="caption" sx={{ color: 'text.secondary' }}>No buildings added yet.</Typography>}
              </Stack>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Paper sx={{ p: 2.5, borderRadius: 2, border: '1px solid #e2e8f0' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Blocks ({blocks.length})</Typography>
                <Button size="small" variant="outlined" onClick={() => { setStructForm({ ...structForm, type: 'BLOCK' }); setOpenStructModal(true); }}>+ Add</Button>
              </Box>
              <Stack spacing={1.5}>
                {blocks.map(blk => (
                  <Box key={blk._id} sx={{ p: 1.5, borderRadius: 1.5, backgroundColor: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>{blk.blockName || blk.name}</Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>Cap: {blk.capacity}</Typography>
                    </div>
                    <IconButton size="small" color="error" onClick={() => handleDeleteBlock(blk._id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
                {blocks.length === 0 && <Typography variant="caption" sx={{ color: 'text.secondary' }}>No blocks added yet.</Typography>}
              </Stack>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Paper sx={{ p: 2.5, borderRadius: 2, border: '1px solid #e2e8f0' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Floors ({floors.length})</Typography>
                <Button size="small" variant="outlined" onClick={() => { setStructForm({ ...structForm, type: 'FLOOR' }); setOpenStructModal(true); }}>+ Add</Button>
              </Box>
              <Stack spacing={1.5}>
                {floors.map(f => (
                  <Box key={f._id} sx={{ p: 1.5, borderRadius: 1.5, backgroundColor: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>{f.floorName || `Floor ${f.floorNumber}`}</Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>Cap: {f.capacity}</Typography>
                    </div>
                    <IconButton size="small" color="error" onClick={() => handleDeleteFloor(f._id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
                {floors.length === 0 && <Typography variant="caption" sx={{ color: 'text.secondary' }}>No floors added yet.</Typography>}
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>

      {/* HOSTEL MODAL */}
      <Dialog open={openHostelModal} onClose={() => setOpenHostelModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>{editingHostelId ? 'Edit Hostel' : 'Add New Hostel'}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.5}>
            <TextField 
              label="Hostel Code *" 
              value={hostelForm.code} 
              onChange={e => setHostelForm({ ...hostelForm, code: e.target.value })} 
              fullWidth 
              size="small"
              placeholder="e.g. 009, H-NORTH"
            />
            <TextField 
              label="Hostel Name *" 
              value={hostelForm.name} 
              onChange={e => setHostelForm({ ...hostelForm, name: e.target.value })} 
              fullWidth 
              size="small"
              placeholder="e.g. Avilian Hall"
            />
            <TextField 
              select 
              label="Hostel Type *" 
              value={hostelForm.hostelType} 
              onChange={e => {
                const t = e.target.value;
                setHostelForm({
                  ...hostelForm,
                  hostelType: t,
                  genderApplicability: t === 'GIRLS' ? 'FEMALE' : t === 'BOYS' ? 'MALE' : 'MIXED'
                });
              }} 
              fullWidth
              size="small"
            >
              {['BOYS', 'GIRLS', 'MIXED', 'STAFF'].map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
            </TextField>
            <TextField 
              select 
              label="Gender Applicability" 
              value={hostelForm.genderApplicability} 
              onChange={e => setHostelForm({ ...hostelForm, genderApplicability: e.target.value })} 
              fullWidth
              size="small"
            >
              {['MALE', 'FEMALE', 'MIXED'].map(g => <MenuItem key={g} value={g}>{g}</MenuItem>)}
            </TextField>
            <TextField 
              label="Capacity (Beds) *" 
              type="number" 
              value={hostelForm.totalCapacity} 
              onChange={e => setHostelForm({ ...hostelForm, totalCapacity: +e.target.value })} 
              fullWidth 
              size="small"
            />
            <TextField 
              label="Address / Location" 
              value={hostelForm.address} 
              onChange={e => setHostelForm({ ...hostelForm, address: e.target.value })} 
              fullWidth 
              size="small"
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenHostelModal(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveHostel} sx={{ fontWeight: 700 }}>
            {editingHostelId ? 'Update' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ROOM MODAL */}
      <Dialog open={openRoomModal} onClose={() => setOpenRoomModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>{editingRoomId ? 'Edit Room' : 'Add New Room & Auto-Beds'}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.5}>
            <TextField 
              select 
              label="Hostel *" 
              value={roomForm.hostelId} 
              onChange={e => setRoomForm({ ...roomForm, hostelId: e.target.value })} 
              fullWidth 
              size="small"
            >
              {hostels.map(h => <MenuItem key={h._id} value={h._id}>{h.name} ({h.code})</MenuItem>)}
            </TextField>
            {buildings.length > 0 && (
              <TextField 
                select 
                label="Building (Optional)" 
                value={roomForm.buildingId} 
                onChange={e => setRoomForm({ ...roomForm, buildingId: e.target.value })} 
                fullWidth 
                size="small"
              >
                <MenuItem value="">None / Main</MenuItem>
                {buildings.map(b => <MenuItem key={b._id} value={b._id}>{b.name}</MenuItem>)}
              </TextField>
            )}
            <TextField 
              label="Room Number *" 
              value={roomForm.roomNumber} 
              onChange={e => setRoomForm({ ...roomForm, roomNumber: e.target.value })} 
              fullWidth 
              size="small"
              placeholder="e.g. 101, A-12"
            />
            <TextField 
              select 
              label="Room Type *" 
              value={roomForm.roomType} 
              onChange={e => {
                const rt = e.target.value;
                const capMap: any = { SINGLE: 1, DOUBLE: 2, TRIPLE: 3, FOUR_BED: 4, DORMITORY: 8 };
                setRoomForm({ ...roomForm, roomType: rt, capacity: capMap[rt] || 2 });
              }} 
              fullWidth 
              size="small"
            >
              {['SINGLE', 'DOUBLE', 'TRIPLE', 'FOUR_BED', 'DORMITORY'].map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
            </TextField>
            <TextField 
              label="Capacity (Number of Beds) *" 
              type="number" 
              value={roomForm.capacity} 
              onChange={e => setRoomForm({ ...roomForm, capacity: +e.target.value })} 
              fullWidth 
              size="small"
            />
            <TextField 
              select 
              label="Gender Applicability" 
              value={roomForm.genderApplicability} 
              onChange={e => setRoomForm({ ...roomForm, genderApplicability: e.target.value })} 
              fullWidth 
              size="small"
            >
              {['MALE', 'FEMALE', 'MIXED'].map(g => <MenuItem key={g} value={g}>{g}</MenuItem>)}
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenRoomModal(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveRoom} sx={{ fontWeight: 700 }}>
            {editingRoomId ? 'Update Room' : 'Save Room & Beds'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* STRUCTURE MODAL */}
      <Dialog open={openStructModal} onClose={() => setOpenStructModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Build Structure Level</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.5}>
            <TextField 
              select 
              label="Structure Type *" 
              value={structForm.type} 
              onChange={e => setStructForm({ ...structForm, type: e.target.value })} 
              fullWidth 
              size="small"
            >
              {['BUILDING', 'BLOCK', 'FLOOR'].map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
            </TextField>
            
            {structForm.type === 'BUILDING' && (
              <TextField 
                select 
                label="Hostel *" 
                value={structForm.hostelId || hostels[0]?._id || ''} 
                onChange={e => setStructForm({ ...structForm, hostelId: e.target.value })} 
                fullWidth 
                size="small"
              >
                {hostels.map(h => <MenuItem key={h._id} value={h._id}>{h.name}</MenuItem>)}
              </TextField>
            )}

            {structForm.type === 'BLOCK' && (
              <TextField 
                select 
                label="Building *" 
                value={structForm.buildingId || buildings[0]?._id || ''} 
                onChange={e => setStructForm({ ...structForm, buildingId: e.target.value })} 
                fullWidth 
                size="small"
              >
                {buildings.map(b => <MenuItem key={b._id} value={b._id}>{b.name}</MenuItem>)}
              </TextField>
            )}

            {structForm.type === 'FLOOR' && (
              <TextField 
                select 
                label="Block *" 
                value={structForm.blockId || blocks[0]?._id || ''} 
                onChange={e => setStructForm({ ...structForm, blockId: e.target.value })} 
                fullWidth 
                size="small"
              >
                {blocks.map(b => <MenuItem key={b._id} value={b._id}>{b.blockName || b.name}</MenuItem>)}
              </TextField>
            )}

            <TextField 
              label="Name / Title *" 
              value={structForm.name} 
              onChange={e => setStructForm({ ...structForm, name: e.target.value })} 
              fullWidth 
              size="small"
              placeholder={structForm.type === 'BUILDING' ? 'e.g. Science Block Tower' : structForm.type === 'BLOCK' ? 'e.g. Wing A' : 'e.g. First Floor'}
            />
            {structForm.type === 'BUILDING' && (
              <TextField 
                label="Building Code" 
                value={structForm.code} 
                onChange={e => setStructForm({ ...structForm, code: e.target.value })} 
                fullWidth 
                size="small" 
              />
            )}
            {structForm.type === 'FLOOR' && (
              <TextField 
                type="number" 
                label="Floor Number" 
                value={structForm.floorNumber} 
                onChange={e => setStructForm({ ...structForm, floorNumber: +e.target.value })} 
                fullWidth 
                size="small" 
              />
            )}
            <TextField 
              type="number" 
              label="Capacity" 
              value={structForm.capacity} 
              onChange={e => setStructForm({ ...structForm, capacity: +e.target.value })} 
              fullWidth 
              size="small" 
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenStructModal(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateStructure} sx={{ fontWeight: 700 }}>
            Create Structure
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default HostelStructure;
