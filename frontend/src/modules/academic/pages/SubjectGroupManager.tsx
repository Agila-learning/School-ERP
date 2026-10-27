import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Button, Grid,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, CircularProgress, TextField, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { getSubjectGroups, createSubjectGroup, updateSubjectGroup, deleteSubjectGroup } from '../api/academic.api';

const SubjectGroupManager: React.FC = () => {
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    status: 'ACTIVE'
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getSubjectGroups();
      setGroups(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpen = (group?: any) => {
    if (group) {
      setEditingId(group.id || group._id);
      setFormData({
        name: group.name,
        code: group.code,
        description: group.description || '',
        status: group.status || 'ACTIVE'
      });
    } else {
      setEditingId(null);
      setFormData({ name: '', code: '', description: '', status: 'ACTIVE' });
    }
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editingId) {
        await updateSubjectGroup(editingId, formData);
      } else {
        await createSubjectGroup(formData);
      }
      setModalOpen(false);
      fetchData();
    } catch (e) {
      alert('Failed to save subject group');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this subject group?')) return;
    try {
      await deleteSubjectGroup(id);
      fetchData();
    } catch (e) {
      alert('Failed to delete subject group');
    }
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>;
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>Subject Groups</Typography>
        <Button variant="contained" startIcon={<AddIcon />} disableElevation onClick={() => handleOpen()}>
          Add Group
        </Button>
      </Box>

      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: 'grey.50' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Code</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {groups.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                    <Typography color="text.secondary">No subject groups found.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                groups.map(g => (
                  <TableRow key={g.id || g._id} hover>
                    <TableCell><Typography variant="body2" sx={{ fontWeight: 600 }}>{g.name}</Typography></TableCell>
                    <TableCell>{g.code}</TableCell>
                    <TableCell>
                      <Chip label={g.status} color={g.status === 'ACTIVE' ? 'success' : 'default'} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell align="right">
                      <Button size="small" startIcon={<EditIcon />} onClick={() => handleOpen(g)}>Edit</Button>
                      <Button size="small" color="error" startIcon={<DeleteIcon />} onClick={() => handleDelete(g.id || g._id)}>Delete</Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Edit Subject Group' : 'Add Subject Group'}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField 
                label="Name" 
                fullWidth 
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField 
                label="Code" 
                fullWidth 
                value={formData.code}
                onChange={e => setFormData({ ...formData, code: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField 
                label="Description" 
                fullWidth 
                multiline
                rows={3}
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>Status</Typography>
              <select 
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value })}
                style={{ width: '100%', padding: '12px', borderRadius: '4px', border: '1px solid #ccc' }}
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={!formData.name || !formData.code}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SubjectGroupManager;
