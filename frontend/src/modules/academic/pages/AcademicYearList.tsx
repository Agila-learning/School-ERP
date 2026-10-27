import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Button, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Chip, IconButton, 
  Dialog, DialogTitle, DialogContent, DialogActions, Alert,
  CircularProgress, DialogContentText
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import LockIcon from '@mui/icons-material/Lock';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { getAcademicYears, activateAcademicYear, deleteAcademicYear } from '../api/academic.api';
import type { AcademicYear } from '../api/academic.api';

const AcademicYearList: React.FC = () => {
  const [years, setYears] = useState<AcademicYear[]>([]);
  const [loading, setLoading] = useState(true);
  const [activateDialog, setActivateDialog] = useState<{ open: boolean; year: AcademicYear | null }>({ open: false, year: null });
  const [activating, setActivating] = useState(false);
  const [createDialog, setCreateDialog] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newYear, setNewYear] = useState({ name: '', startDate: '', endDate: '' });

  const [deleteDialog, setDeleteDialog] = useState(false);
  const [yearToDelete, setYearToDelete] = useState<AcademicYear | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchYears();
  }, []);

  const fetchYears = async () => {
    setLoading(true);
    try {
      const data = await getAcademicYears();
      setYears(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleActivateClick = (year: AcademicYear) => {
    setActivateDialog({ open: true, year });
  };

  const confirmActivation = async () => {
    if (!activateDialog.year) return;
    setActivating(true);
    try {
      const res = await activateAcademicYear(activateDialog.year.id);
      if (res.success) {
        await fetchYears();
        setActivateDialog({ open: false, year: null });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setActivating(false);
    }
  };

  const handleCreateSubmit = async () => {
    if (!newYear.name || !newYear.startDate || !newYear.endDate) return;
    setCreating(true);
    try {
      const { createAcademicYear } = await import('../api/academic.api');
      await createAcademicYear({
        name: newYear.name,
        startDate: new Date(newYear.startDate).toISOString(),
        endDate: new Date(newYear.endDate).toISOString(),
        status: 'upcoming'
      });
      await fetchYears();
      setCreateDialog(false);
      setNewYear({ name: '', startDate: '', endDate: '' });
    } catch (error) {
      console.error(error);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteClick = (year: AcademicYear) => {
    setYearToDelete(year);
    setDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!yearToDelete) return;
    setDeleting(true);
    try {
      await deleteAcademicYear(yearToDelete.id);
      await fetchYears();
      setDeleteDialog(false);
      setYearToDelete(null);
    } catch (error) {
      console.error(error);
      alert('Failed to delete academic year. It may have active dependencies like terms or classes.');
    } finally {
      setDeleting(false);
    }
  };

  const getStatusChip = (status: string) => {
    switch (status) {
      case 'active':
        return <Chip label="Active" color="success" size="small" variant="filled" />;
      case 'completed':
        return <Chip label="Completed" color="default" size="small" variant="outlined" />;
      case 'upcoming':
        return <Chip label="Upcoming" color="primary" size="small" variant="outlined" />;
      default:
        return <Chip label={status} size="small" />;
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>Academic Years</Typography>
          <Typography variant="body1" color="text.secondary">Manage terms, academic sessions, and activation status.</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} disableElevation onClick={() => setCreateDialog(true)}>
          New Academic Year
        </Button>
      </Box>

      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: 'grey.50' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Start Date</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>End Date</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6 }}><CircularProgress size={32} /></TableCell>
                </TableRow>
              ) : years.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                    <Typography color="text.secondary">No academic years found.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                years.map(year => (
                  <TableRow key={year.id} hover>
                    <TableCell><Typography variant="body2" sx={{ fontWeight: 600 }}>{year.name}</Typography></TableCell>
                    <TableCell>{year.startDate}</TableCell>
                    <TableCell>{year.endDate}</TableCell>
                    <TableCell>{getStatusChip(year.status)}</TableCell>
                    <TableCell align="right">
                      {year.status === 'upcoming' && (
                        <Button 
                          size="small" 
                          startIcon={<PlayArrowIcon />} 
                          color="success" 
                          variant="outlined"
                          sx={{ mr: 1 }}
                          onClick={() => handleActivateClick(year)}
                        >
                          Activate
                        </Button>
                      )}
                      {year.status === 'active' && (
                        <Button 
                          size="small" 
                          startIcon={<LockIcon />} 
                          color="error" 
                          variant="outlined"
                          sx={{ mr: 1 }}
                        >
                          Close Year
                        </Button>
                      )}
                      <IconButton size="small" color="primary">
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDeleteClick(year)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Activation Dialog */}
      <Dialog open={activateDialog.open} onClose={() => !activating && setActivateDialog({ open: false, year: null })} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Activate Academic Year</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 3 }}>
            You are about to activate the <strong>{activateDialog.year?.name}</strong> academic year.
          </Alert>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Activating this year will automatically:
          </Typography>
          <Typography variant="body2" component="ul" sx={{ color: 'text.secondary', pl: 3 }}>
            <li>Lock the currently active academic year.</li>
            <li>Apply this year as the default context for all users.</li>
            <li>Enable enrollments, fee generation, and attendance for {activateDialog.year?.name}.</li>
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 600, mt: 2, color: 'error.main' }}>
            This action has significant system-wide impact. Continue?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={() => setActivateDialog({ open: false, year: null })} disabled={activating}>Cancel</Button>
          <Button 
            variant="contained" 
            color="success" 
            onClick={confirmActivation} 
            disabled={activating}
            disableElevation
          >
            {activating ? <CircularProgress size={24} color="inherit" /> : 'Confirm Activation'}
          </Button>
        </DialogActions>
      </Dialog>
      {/* Create Dialog */}
      <Dialog open={createDialog} onClose={() => !creating && setCreateDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>New Academic Year</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            {/* The import-stub is a hack to avoid bringing in TextField from mui manually at the top */}
            {/* The import-stub is a hack to avoid bringing in TextField from mui manually at the top */}
            <input 
              style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
              placeholder="Year Name (e.g., 2026-2027)" 
              value={newYear.name} 
              onChange={e => setNewYear({...newYear, name: e.target.value})}
            />
            <Typography variant="caption" color="text.secondary">Start Date</Typography>
            <input 
              type="date"
              style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
              value={newYear.startDate} 
              onChange={e => setNewYear({...newYear, startDate: e.target.value})}
            />
            <Typography variant="caption" color="text.secondary">End Date</Typography>
            <input 
              type="date"
              style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
              value={newYear.endDate} 
              onChange={e => setNewYear({...newYear, endDate: e.target.value})}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={() => setCreateDialog(false)} disabled={creating}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleCreateSubmit} 
            disabled={creating || !newYear.name || !newYear.startDate || !newYear.endDate}
            disableElevation
          >
            {creating ? <CircularProgress size={24} color="inherit" /> : 'Create Year'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog} onClose={() => !deleting && setDeleteDialog(false)}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the academic year {yearToDelete?.name}? This action cannot be undone. 
            If the academic year has active classes or terms, deletion will be prevented.
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

export default AcademicYearList;
