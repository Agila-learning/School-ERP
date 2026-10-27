import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Button, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Chip, IconButton, Tooltip,
  CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText,
  Grid, TextField, MenuItem
} from '@mui/material';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import DeleteIcon from '@mui/icons-material/Delete';
import { getTeacherAssignments, removeTeacherAssignment, assignTeacher, getSections, getSubjects } from '../api/academic.api';
import type { TeacherAssignmentSummary, SectionSummary, SubjectSummary } from '../api/academic.api';
import { getStaffList } from '../../staff/api/staff.api';

const TeacherAssignments: React.FC = () => {
  const [assignments, setAssignments] = useState<TeacherAssignmentSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const [deleteDialog, setDeleteDialog] = useState(false);
  const [assignmentToDelete, setAssignmentToDelete] = useState<TeacherAssignmentSummary | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [assignDialog, setAssignDialog] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sections, setSections] = useState<SectionSummary[]>([]);
  const [subjects, setSubjects] = useState<SubjectSummary[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    teacherId: '',
    sectionId: '',
    subjectId: ''
  });

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const [data, secs, subs, stfs] = await Promise.all([
        getTeacherAssignments(),
        getSections(),
        getSubjects(),
        getStaffList().catch(() => []) // Fallback if api not available
      ]);
      setAssignments(data);
      setSections(secs);
      setSubjects(subs);
      setStaff(stfs);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const handleDeleteClick = (assignment: TeacherAssignmentSummary) => {
    setAssignmentToDelete(assignment);
    setDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!assignmentToDelete) return;
    setDeleting(true);
    try {
      await removeTeacherAssignment(assignmentToDelete.id);
      await fetchAssignments();
      setDeleteDialog(false);
      setAssignmentToDelete(null);
    } catch (error) {
      console.error(error);
      alert('Failed to remove assignment.');
    } finally {
      setDeleting(false);
    }
  };

  const handleSaveAssignment = async () => {
    setSaving(true);
    try {
      await assignTeacher(formData);
      setAssignDialog(false);
      setFormData({ teacherId: '', sectionId: '', subjectId: '' });
      await fetchAssignments();
    } catch (error: any) {
      console.error(error);
      const errMsg = error.response?.data?.message || error.message || 'Failed to assign teacher.';
      alert(errMsg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>Teacher Assignments</Typography>
          <Typography variant="body1" color="text.secondary">Map teachers to subjects, classes, and sections.</Typography>
        </Box>
        <Button variant="contained" startIcon={<AssignmentIndIcon />} disableElevation onClick={() => setAssignDialog(true)}>
          Assign Teacher
        </Button>
      </Box>

      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: 'grey.50' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Teacher Name</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Subject</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Class</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Section</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6 }}><CircularProgress size={32} /></TableCell>
                </TableRow>
              ) : assignments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                    <Typography color="text.secondary">No teacher assignments configured.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                assignments.map(assignment => (
                  <TableRow key={assignment.id} hover>
                    <TableCell><Typography variant="body2" sx={{ fontWeight: 600 }}>{assignment.teacherName}</Typography></TableCell>
                    <TableCell>{assignment.subjectName}</TableCell>
                    <TableCell>{assignment.className}</TableCell>
                    <TableCell>{assignment.sectionName}</TableCell>
                    <TableCell>
                      <Chip 
                        label={assignment.status} 
                        color={assignment.status === 'ACTIVE' ? 'success' : 'default'} 
                        size="small" 
                        variant={assignment.status === 'ACTIVE' ? 'filled' : 'outlined'} 
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Remove Assignment">
                        <IconButton size="small" color="error" onClick={() => handleDeleteClick(assignment)}>
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog} onClose={() => !deleting && setDeleteDialog(false)}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to remove {assignmentToDelete?.teacherName}'s assignment to {assignmentToDelete?.className} - {assignmentToDelete?.subjectName}?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)} disabled={deleting}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error" disabled={deleting}>
            {deleting ? <CircularProgress size={24} color="inherit" /> : 'Remove'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Assign Dialog */}
      <Dialog open={assignDialog} onClose={() => !saving && setAssignDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Assign Teacher</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <TextField 
                select 
                fullWidth 
                label="Teacher" 
                value={formData.teacherId} 
                onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
              >
                {staff.map(s => (
                  <MenuItem key={s.id || s._id} value={s.id || s._id}>{s.firstName} {s.lastName}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField 
                select 
                fullWidth 
                label="Section" 
                value={formData.sectionId} 
                onChange={(e) => setFormData({ ...formData, sectionId: e.target.value })}
              >
                {sections.map(s => (
                  <MenuItem key={s.id} value={s.id}>{s.name} ({s.code})</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField 
                select 
                fullWidth 
                label="Subject" 
                value={formData.subjectId} 
                onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
              >
                {subjects.map(s => (
                  <MenuItem key={s.id} value={s.id}>{s.name} {s.code && s.code !== s.name ? `(${s.code})` : ''}</MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignDialog(false)} disabled={saving}>Cancel</Button>
          <Button onClick={handleSaveAssignment} variant="contained" disabled={saving || !formData.teacherId || !formData.sectionId || !formData.subjectId}>
            {saving ? <CircularProgress size={24} color="inherit" /> : 'Assign'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TeacherAssignments;
