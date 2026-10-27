import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Button, TextField, Select, MenuItem, FormControl, 
  InputLabel, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  IconButton, Tabs, Tab, Dialog, DialogTitle, DialogContent, DialogActions, Chip, Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import api from '../../../core/api/axios';

interface Section { _id: string; libraryId: string; code: string; name: string; status: string; }
interface Rack { _id: string; sectionId: string; rackNumber: string; name?: string; capacity?: number; status: string; }
interface Shelf { _id: string; rackId: string; shelfNumber: string; label?: string; capacity?: number; status: string; }

const ShelfManager: React.FC = () => {
  const [sections, setSections] = useState<Section[]>([]);
  const [racks, setRacks] = useState<Rack[]>([]);
  const [shelves, setShelves] = useState<Shelf[]>([]);
  const [tab, setTab] = useState(0);
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedRack, setSelectedRack] = useState('');
  const [dialog, setDialog] = useState<{ open: boolean; type: string; item: any }>({ open: false, type: '', item: null });
  const [form, setForm] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const fetchAll = async () => {
    try {
      const [s, r, sh] = await Promise.all([
        api.get('/library/sections'),
        api.get('/library/racks' + (selectedSection ? `?sectionId=${selectedSection}` : '')),
        api.get('/library/shelves' + (selectedRack ? `?rackId=${selectedRack}` : '')),
      ]);
      setSections(s.data.data || []);
      setRacks(r.data.data || []);
      setShelves(sh.data.data || []);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchAll(); }, [selectedSection, selectedRack]);

  const openCreate = (type: string) => {
    const defaults: any = { status: 'ACTIVE' };
    if (type === 'rack' && selectedSection) defaults.sectionId = selectedSection;
    if (type === 'shelf' && selectedRack) defaults.rackId = selectedRack;
    setForm(defaults);
    setDialog({ open: true, type, item: null });
  };
  const openEdit = (type: string, item: any) => { setForm({ ...item }); setDialog({ open: true, type, item }); };

  const handleSave = async () => {
    setLoading(true);
    try {
      const { type, item } = dialog;
      const eps: any = { section: '/library/sections', rack: '/library/racks', shelf: '/library/shelves' };
      if (item) await api.patch(`${eps[type]}/${item._id}`, form);
      else await api.post(eps[type], form);
      setAlert({ type: 'success', msg: `${type.toUpperCase()} saved successfully!` });
      fetchAll();
      setDialog({ open: false, type: '', item: null });
    } catch (e: any) {
      console.error(e);
      setAlert({ type: 'error', msg: e.response?.data?.message || `Failed to save ${dialog.type}` });
    }
    finally { setLoading(false); }
  };

  const StatusChip = ({ status }: any) => <Chip label={status} size="small" color={status === 'ACTIVE' ? 'success' : 'default'} />;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>Library Shelves & Racks</Typography>
          <Typography variant="body2" color="text.secondary">Manage library sections, racks, and shelves</Typography>
        </Box>
      </Box>

      {alert && <Alert severity={alert.type} onClose={() => setAlert(null)} sx={{ mb: 2 }}>{alert.msg}</Alert>}

      <Paper sx={{ mb: 2 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ px: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="Sections" />
          <Tab label="Racks" />
          <Tab label="Shelves" />
        </Tabs>
      </Paper>

      {/* Sections */}
      {tab === 0 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => openCreate('section')}>Add Section</Button>
          </Box>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead><TableRow sx={{ bgcolor: 'grey.50' }}>
                <TableCell>Code</TableCell><TableCell>Name</TableCell><TableCell>Status</TableCell><TableCell align="right">Actions</TableCell>
              </TableRow></TableHead>
              <TableBody>
                {sections.map(s => (
                  <TableRow key={s._id} hover>
                    <TableCell><Typography variant="body2" sx={{ fontWeight: 'medium', fontFamily: 'monospace' }}>{s.code}</Typography></TableCell>
                    <TableCell>{s.name}</TableCell>
                    <TableCell><StatusChip status={s.status} /></TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => openEdit('section', s)}><EditIcon fontSize="small" /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {sections.length === 0 && <TableRow><TableCell colSpan={5}><Typography variant="body2" color="text.secondary" align="center" sx={{ py: 2 }}>No sections found</Typography></TableCell></TableRow>}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* Racks */}
      {tab === 1 && (
        <Box>
          <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Filter by Section</InputLabel>
              <Select label="Filter by Section" value={selectedSection} onChange={e => setSelectedSection(e.target.value)}>
                <MenuItem value="">All Sections</MenuItem>
                {sections.map(s => <MenuItem key={s._id} value={s._id}>{s.name}</MenuItem>)}
              </Select>
            </FormControl>
            <Box sx={{ flex: 1 }} />
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => openCreate('rack')}>Add Rack</Button>
          </Box>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead><TableRow sx={{ bgcolor: 'grey.50' }}>
                <TableCell>Rack #</TableCell><TableCell>Name</TableCell><TableCell>Capacity</TableCell><TableCell>Status</TableCell><TableCell align="right">Actions</TableCell>
              </TableRow></TableHead>
              <TableBody>
                {racks.map(r => (
                  <TableRow key={r._id} hover>
                    <TableCell><Typography variant="body2" sx={{ fontWeight: 'medium', fontFamily: 'monospace' }}>{r.rackNumber}</Typography></TableCell>
                    <TableCell>{r.name || '—'}</TableCell>
                    <TableCell>{r.capacity || '—'}</TableCell>
                    <TableCell><StatusChip status={r.status} /></TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => openEdit('rack', r)}><EditIcon fontSize="small" /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {racks.length === 0 && <TableRow><TableCell colSpan={5}><Typography variant="body2" color="text.secondary" align="center" sx={{ py: 2 }}>No racks found</Typography></TableCell></TableRow>}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* Shelves */}
      {tab === 2 && (
        <Box>
          <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Filter by Rack</InputLabel>
              <Select label="Filter by Rack" value={selectedRack} onChange={e => setSelectedRack(e.target.value)}>
                <MenuItem value="">All Racks</MenuItem>
                {racks.map(r => <MenuItem key={r._id} value={r._id}>{r.rackNumber} {r.name ? `— ${r.name}` : ''}</MenuItem>)}
              </Select>
            </FormControl>
            <Box sx={{ flex: 1 }} />
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => openCreate('shelf')}>Add Shelf</Button>
          </Box>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead><TableRow sx={{ bgcolor: 'grey.50' }}>
                <TableCell>Shelf #</TableCell><TableCell>Label</TableCell><TableCell>Capacity</TableCell><TableCell>Status</TableCell><TableCell align="right">Actions</TableCell>
              </TableRow></TableHead>
              <TableBody>
                {shelves.map(s => (
                  <TableRow key={s._id} hover>
                    <TableCell><Typography variant="body2" sx={{ fontWeight: 'medium', fontFamily: 'monospace' }}>{s.shelfNumber}</Typography></TableCell>
                    <TableCell>{s.label || '—'}</TableCell>
                    <TableCell>{s.capacity || '—'}</TableCell>
                    <TableCell><StatusChip status={s.status} /></TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => openEdit('shelf', s)}><EditIcon fontSize="small" /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {shelves.length === 0 && <TableRow><TableCell colSpan={5}><Typography variant="body2" color="text.secondary" align="center" sx={{ py: 2 }}>No shelves found</Typography></TableCell></TableRow>}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* Dialog */}
      <Dialog open={dialog.open} onClose={() => setDialog({ open: false, type: '', item: null })} maxWidth="sm" fullWidth>
        <DialogTitle>{dialog.item ? 'Edit' : 'Add'} {dialog.type === 'section' ? 'Section' : dialog.type === 'rack' ? 'Rack' : 'Shelf'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            {dialog.type === 'section' && <>
              <TextField label="Section Code" value={form.code || ''} onChange={e => setForm({ ...form, code: e.target.value })} required fullWidth />
              <TextField label="Section Name" value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} required fullWidth />
              <TextField label="Description" value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} multiline rows={2} fullWidth />
            </>}
            {dialog.type === 'rack' && <>
              <FormControl fullWidth required>
                <InputLabel>Section</InputLabel>
                <Select label="Section" value={form.sectionId || ''} onChange={e => setForm({ ...form, sectionId: e.target.value })}>
                  {sections.map(s => <MenuItem key={s._id} value={s._id}>{s.name}</MenuItem>)}
                </Select>
              </FormControl>
              <TextField label="Rack Number" value={form.rackNumber || ''} onChange={e => setForm({ ...form, rackNumber: e.target.value })} required fullWidth />
              <TextField label="Name/Description" value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} fullWidth />
              <TextField label="Capacity (number of books)" type="number" value={form.capacity || ''} onChange={e => setForm({ ...form, capacity: Number(e.target.value) })} fullWidth />
            </>}
            {dialog.type === 'shelf' && <>
              <FormControl fullWidth required>
                <InputLabel>Rack</InputLabel>
                <Select label="Rack" value={form.rackId || ''} onChange={e => setForm({ ...form, rackId: e.target.value })}>
                  {racks.map(r => <MenuItem key={r._id} value={r._id}>{r.rackNumber} {r.name ? `— ${r.name}` : ''}</MenuItem>)}
                </Select>
              </FormControl>
              <TextField label="Shelf Number" value={form.shelfNumber || ''} onChange={e => setForm({ ...form, shelfNumber: e.target.value })} required fullWidth />
              <TextField label="Label" value={form.label || ''} onChange={e => setForm({ ...form, label: e.target.value })} fullWidth />
              <TextField label="Capacity" type="number" value={form.capacity || ''} onChange={e => setForm({ ...form, capacity: Number(e.target.value) })} fullWidth />
            </>}
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select label="Status" value={form.status || 'ACTIVE'} onChange={e => setForm({ ...form, status: e.target.value })}>
                <MenuItem value="ACTIVE">Active</MenuItem>
                <MenuItem value="INACTIVE">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialog({ open: false, type: '', item: null })}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={loading}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ShelfManager;
