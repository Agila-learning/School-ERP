import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Button, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Chip, IconButton, Tooltip,
  CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useNavigate } from 'react-router-dom';
import { getClasses, deleteClass, updateClass } from '../api/academic.api';
import type { ClassSummary } from '../api/academic.api';

const ClassList: React.FC = () => {
  const navigate = useNavigate();
  const [classes, setClasses] = useState<ClassSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialog, setCreateDialog] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newClass, setNewClass] = useState({ name: '', code: '', capacity: 30, level: 1 });
  
  const [editDialog, setEditDialog] = useState(false);
  const [editClass, setEditClass] = useState<ClassSummary | null>(null);
  const [editing, setEditing] = useState(false);

  const [deleteDialog, setDeleteDialog] = useState(false);
  const [classToDelete, setClassToDelete] = useState<ClassSummary | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const data = await getClasses();
      setClasses(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubmit = async () => {
    if (!newClass.name || !newClass.code) return;
    setCreating(true);
    try {
      const { createClass } = await import('../api/academic.api');
      await createClass({ ...newClass, status: 'ACTIVE' });
      await fetchClasses();
      setCreateDialog(false);
      setNewClass({ name: '', code: '', capacity: 30, level: 1 });
    } catch (error) {
      console.error(error);
    } finally {
      setCreating(false);
    }
  };

  const handleEditClick = (cls: ClassSummary) => {
    setEditClass(cls);
    setEditDialog(true);
  };

  const handleEditSubmit = async () => {
    if (!editClass || !editClass.name || !editClass.code) return;
    setEditing(true);
    try {
      await updateClass(editClass.id, { 
        name: editClass.name, 
        code: editClass.code, 
        capacity: editClass.capacity, 
        level: editClass.level 
      });
      await fetchClasses();
      setEditDialog(false);
      setEditClass(null);
    } catch (error) {
      console.error(error);
    } finally {
      setEditing(false);
    }
  };

  const handleDeleteClick = (cls: ClassSummary) => {
    setClassToDelete(cls);
    setDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!classToDelete) return;
    setDeleting(true);
    try {
      await deleteClass(classToDelete.id);
      await fetchClasses();
      setDeleteDialog(false);
      setClassToDelete(null);
    } catch (error) {
      console.error(error);
      alert('Failed to delete class. It may have active dependencies.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>Classes & Grades</Typography>
          <Typography variant="body1" color="text.secondary">Manage academic classes, sections, and capacities.</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} disableElevation onClick={() => setCreateDialog(true)}>
          New Class
        </Button>
      </Box>

      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: 'grey.50' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Class Name</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Code</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="center">Sections</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="center">Students / Capacity</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6 }}><CircularProgress size={32} /></TableCell>
                </TableRow>
              ) : classes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                    <Typography color="text.secondary">No classes configured.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                classes.map(cls => {
                  const utilization = Math.round((cls.totalStudents / cls.capacity) * 100);
                  const isOverCapacity = cls.totalStudents > cls.capacity;
                  return (
                    <TableRow key={cls.id} hover>
                      <TableCell><Typography variant="body2" sx={{ fontWeight: 600 }}>{cls.name}</Typography></TableCell>
                      <TableCell>{cls.code}</TableCell>
                      <TableCell align="center">
                        <Chip label={`${cls.totalSections} Sections`} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2" color={isOverCapacity ? 'error.main' : 'text.primary'} sx={{ fontWeight: isOverCapacity ? 700 : 400 }}>
                          {cls.totalStudents} / {cls.capacity}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {utilization}% full
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={cls.status} 
                          color={cls.status === 'ACTIVE' ? 'success' : 'default'} 
                          size="small" 
                          variant={cls.status === 'ACTIVE' ? 'filled' : 'outlined'} 
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="View Class Details">
                          <IconButton size="small" color="primary" onClick={() => navigate(`/admin/academics/classes/${cls.id}`)}>
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit Class">
                          <IconButton size="small" color="info" onClick={() => handleEditClick(cls)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Class">
                          <IconButton size="small" color="error" onClick={() => handleDeleteClick(cls)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      {/* Create Dialog */}
      <Dialog open={createDialog} onClose={() => !creating && setCreateDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>New Class</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <input 
              style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
              placeholder="Class Name (e.g., Grade 10)" 
              value={newClass.name} 
              onChange={e => setNewClass({...newClass, name: e.target.value})}
            />
            <input 
              style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
              placeholder="Code (e.g., GR10)" 
              value={newClass.code} 
              onChange={e => setNewClass({...newClass, code: e.target.value})}
            />
            <Typography variant="caption" color="text.secondary">Capacity</Typography>
            <input 
              type="number"
              style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
              value={newClass.capacity} 
              onChange={e => setNewClass({...newClass, capacity: parseInt(e.target.value) || 0})}
            />
            <Typography variant="caption" color="text.secondary">Grade Level (Numeric)</Typography>
            <input 
              type="number"
              style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
              value={newClass.level} 
              onChange={e => setNewClass({...newClass, level: parseInt(e.target.value) || 0})}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={() => setCreateDialog(false)} disabled={creating}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleCreateSubmit} 
            disabled={creating || !newClass.name || !newClass.code}
            disableElevation
          >
            {creating ? <CircularProgress size={24} color="inherit" /> : 'Create Class'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialog} onClose={() => !editing && setEditDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Edit Class</DialogTitle>
        <DialogContent>
          {editClass && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <input 
                style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                placeholder="Class Name" 
                value={editClass.name || ''} 
                onChange={e => setEditClass({...editClass, name: e.target.value})}
              />
              <input 
                style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                placeholder="Code" 
                value={editClass.code || ''} 
                onChange={e => setEditClass({...editClass, code: e.target.value})}
              />
              <Typography variant="caption" color="text.secondary">Capacity</Typography>
              <input 
                type="number"
                style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                value={editClass.capacity || 0} 
                onChange={e => setEditClass({...editClass, capacity: parseInt(e.target.value) || 0})}
              />
              <Typography variant="caption" color="text.secondary">Grade Level (Numeric)</Typography>
              <input 
                type="number"
                style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                value={editClass.level || 0} 
                onChange={e => setEditClass({...editClass, level: parseInt(e.target.value) || 0})}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={() => setEditDialog(false)} disabled={editing}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleEditSubmit} 
            disabled={editing || !editClass?.name || !editClass?.code}
            disableElevation
          >
            {editing ? <CircularProgress size={24} color="inherit" /> : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog} onClose={() => !deleting && setDeleteDialog(false)}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete {classToDelete?.name}? This action cannot be undone. 
            If the class has active sections, deletion will be prevented by the system.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)} disabled={deleting}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error" disabled={deleting}>
            {deleting ? <CircularProgress size={24} color="inherit" /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ClassList;
