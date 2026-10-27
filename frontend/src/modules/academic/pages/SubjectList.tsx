import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Button, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Chip, IconButton, Tooltip,
  CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { getSubjects, deleteSubject } from '../api/academic.api';
import type { SubjectSummary } from '../api/academic.api';

const SubjectList: React.FC = () => {
  const [subjects, setSubjects] = useState<SubjectSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialog, setCreateDialog] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newSubject, setNewSubject] = useState({ name: '', code: '', category: 'Core', creditHours: 3 });

  const [deleteDialog, setDeleteDialog] = useState(false);
  const [subjectToDelete, setSubjectToDelete] = useState<SubjectSummary | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const data = await getSubjects();
      setSubjects(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const handleCreateSubmit = async () => {
    if (!newSubject.name || !newSubject.code) return;
    setCreating(true);
    try {
      const { createSubject } = await import('../api/academic.api');
      await createSubject({ ...newSubject, status: 'ACTIVE' });
      await fetchSubjects();
      setCreateDialog(false);
      setNewSubject({ name: '', code: '', category: 'Core', creditHours: 3 });
    } catch (error) {
      console.error(error);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteClick = (subject: SubjectSummary) => {
    setSubjectToDelete(subject);
    setDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!subjectToDelete) return;
    setDeleting(true);
    try {
      await deleteSubject(subjectToDelete.id);
      await fetchSubjects();
      setDeleteDialog(false);
      setSubjectToDelete(null);
    } catch (error) {
      console.error(error);
      alert('Failed to delete subject. It may be assigned to a class or teacher.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>Subjects</Typography>
          <Typography variant="body1" color="text.secondary">Manage academic subjects, codes, and categories.</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} disableElevation onClick={() => setCreateDialog(true)}>
          New Subject
        </Button>
      </Box>

      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: 'grey.50' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Subject Name</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Code</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="center">Credits</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6 }}><CircularProgress size={32} /></TableCell>
                </TableRow>
              ) : subjects.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                    <Typography color="text.secondary">No subjects configured.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                subjects.map(subject => (
                  <TableRow key={subject.id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{subject.name}</Typography>
                      {subject.shortName && <Typography variant="caption" color="text.secondary">{subject.shortName}</Typography>}
                    </TableCell>
                    <TableCell>{subject.code}</TableCell>
                    <TableCell><Chip label={subject.category} size="small" variant="outlined" /></TableCell>
                    <TableCell align="center">{subject.creditHours}</TableCell>
                    <TableCell>
                      <Chip 
                        label={subject.status} 
                        color={subject.status === 'ACTIVE' ? 'success' : 'default'} 
                        size="small" 
                        variant={subject.status === 'ACTIVE' ? 'filled' : 'outlined'} 
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Edit Subject">
                        <IconButton size="small" color="info">
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Subject">
                        <IconButton size="small" color="error" onClick={() => handleDeleteClick(subject)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      {/* Create Dialog */}
      <Dialog open={createDialog} onClose={() => !creating && setCreateDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>New Subject</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <input 
              style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
              placeholder="Subject Name (e.g., Mathematics)" 
              value={newSubject.name} 
              onChange={e => setNewSubject({...newSubject, name: e.target.value})}
            />
            <input 
              style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
              placeholder="Code (e.g., MAT101)" 
              value={newSubject.code} 
              onChange={e => setNewSubject({...newSubject, code: e.target.value})}
            />
            <Typography variant="caption" color="text.secondary">Category</Typography>
            <input 
              style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
              placeholder="Category (e.g., Core, Elective)" 
              value={newSubject.category} 
              onChange={e => setNewSubject({...newSubject, category: e.target.value})}
            />
            <Typography variant="caption" color="text.secondary">Credit Hours</Typography>
            <input 
              type="number"
              style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
              value={newSubject.creditHours} 
              onChange={e => setNewSubject({...newSubject, creditHours: parseInt(e.target.value) || 0})}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={() => setCreateDialog(false)} disabled={creating}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleCreateSubmit} 
            disabled={creating || !newSubject.name || !newSubject.code}
            disableElevation
          >
            {creating ? <CircularProgress size={24} color="inherit" /> : 'Create Subject'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog} onClose={() => !deleting && setDeleteDialog(false)}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete {subjectToDelete?.name}? This action cannot be undone. 
            If the subject is assigned to teachers or classes, deletion will be prevented.
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

export default SubjectList;
