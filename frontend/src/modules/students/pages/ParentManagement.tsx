import React, { useEffect, useState } from 'react';
import { 
  Box, Button, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Select, MenuItem, FormControl, InputLabel, Chip, Alert, Snackbar, CircularProgress,
  Autocomplete, Typography
} from '@mui/material';
import api from '../../../core/api/axios';
import PageHeader from '../../../core/components/PageHeader';
import StatusBadge from '../../../core/components/StatusBadge';
import EmptyState from '../../../core/components/EmptyState';
import LoadingState from '../../../core/components/LoadingState';
import ConfirmDialog from '../../../core/components/ConfirmDialog';

import { useNavigate } from 'react-router-dom';

const ParentManagement: React.FC = () => {
  const navigate = useNavigate();
  const [parents, setParents] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openAssignDialog, setOpenAssignDialog] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [confirmDeactivateOpen, setConfirmDeactivateOpen] = useState(false);
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);
  const [studentIdToAssign, setStudentIdToAssign] = useState('');
  const [assignRelationship, setAssignRelationship] = useState('Parent');
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });
  
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', relationship: 'Father', mobile: '', email: ''
  });

  const fetchParents = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/parents?page=${page}&limit=10`);
      setParents(res.data.data.parents);
      setTotalPages(res.data.data.pagination.totalPages || 1);
    } catch (error) {
      console.error('Failed to fetch parents', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await api.get('/students/search?limit=100');
      const list = res.data.data?.data || res.data.data || [];
      setStudents(list);
    } catch (e) {
      console.error('Failed to load students list', e);
    }
  };

  useEffect(() => {
    fetchParents();
    fetchStudents();
  }, [page]);

  const handleAddParent = async () => {
    try {
      await api.post('/parents', formData);
      setOpenAddDialog(false);
      setSnackbar({ open: true, message: 'Parent added successfully', severity: 'success' });
      fetchParents();
    } catch (error: any) {
      setSnackbar({ open: true, message: error.response?.data?.message || 'Failed to add parent', severity: 'error' });
    }
  };

  const handleDeactivate = async () => {
    if (selectedParentId) {
      try {
        await api.delete(`/parents/${selectedParentId}`);
        setConfirmDeactivateOpen(false);
        setSnackbar({ open: true, message: 'Parent deactivated successfully', severity: 'success' });
        fetchParents();
      } catch (error: any) {
        setSnackbar({ open: true, message: error.response?.data?.message || 'Failed to deactivate parent', severity: 'error' });
      }
    }
  };

  const handleAssignStudent = async () => {
    if (!selectedParentId || !studentIdToAssign.trim()) return;
    setAssigning(true);
    try {
      const res = await api.post(`/parents/${selectedParentId}/relationships`, {
        studentId: studentIdToAssign.trim(),
        relationshipType: assignRelationship
      });
      setOpenAssignDialog(false);
      setStudentIdToAssign('');
      setSnackbar({ 
        open: true, 
        message: res.data?.message || 'Student assigned to parent successfully!', 
        severity: 'success' 
      });
      fetchParents();
    } catch (error: any) {
      console.error('Failed to assign student', error);
      const errMsg = error.response?.data?.message || error.message || 'Failed to assign student';
      setSnackbar({ open: true, message: errMsg, severity: 'error' });
    } finally {
      setAssigning(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 1.5, sm: 2, md: 3 }, width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
      <PageHeader 
        title="Parent Management"
        description="Manage parent accounts and link them to students."
        breadcrumbs={[
          { label: 'Admin', href: '/admin/dashboard' },
          { label: 'Parents', href: '/admin/parents' },
          { label: 'Management' }
        ]}
        primaryAction={
          <Button variant="contained" color="primary" onClick={() => setOpenAddDialog(true)}>
            Add Parent
          </Button>
        }
      />

      {loading ? (
        <LoadingState type="skeleton-table" />
      ) : parents.length === 0 ? (
        <EmptyState 
          title="No parents found"
          description="Get started by adding a parent."
          actionLabel="Add Parent"
          onAction={() => setOpenAddDialog(true)}
        />
      ) : (
        <>
          <TableContainer component={Paper} sx={{ width: '100%', overflowX: 'auto', borderRadius: 3, boxShadow: '0 2px 10px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
            <Table sx={{ minWidth: 950 }}>
            <TableHead sx={{ bgcolor: '#f8fafc' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, minWidth: 150 }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 700, minWidth: 110 }}>Relationship</TableCell>
                <TableCell sx={{ fontWeight: 700, minWidth: 130 }}>Mobile</TableCell>
                <TableCell sx={{ fontWeight: 700, minWidth: 150 }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 700, minWidth: 180 }}>Linked Children</TableCell>
                <TableCell sx={{ fontWeight: 700, minWidth: 90 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700, minWidth: 260, textAlign: 'center' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {parents.map((parent) => (
                <TableRow key={parent._id} hover>
                  <TableCell sx={{ fontWeight: 600 }}>{parent.firstName} {parent.lastName}</TableCell>
                  <TableCell>{parent.relationship}</TableCell>
                  <TableCell sx={{ fontFamily: 'monospace' }}>{parent.mobile}</TableCell>
                  <TableCell>{parent.email || '—'}</TableCell>
                  <TableCell>
                    {parent.children && parent.children.length > 0 ? (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {parent.children.map((child: any) => (
                          <Chip 
                            key={child._id} 
                            label={`${child.firstName} ${child.lastName} (${child.studentIdNumber || 'N/A'})`} 
                            size="small" 
                            color="primary" 
                            variant="outlined" 
                          />
                        ))}
                      </Box>
                    ) : (
                      <Typography variant="caption" color="text.secondary">No linked children</Typography>
                    )}
                  </TableCell>
                  <TableCell><StatusBadge status={parent.accountStatus || 'INACTIVE'} /></TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', whiteSpace: 'nowrap' }}>
                      <Button size="small" variant="contained" onClick={() => navigate(`/admin/parents/${parent._id}`)}>
                        View Profile
                      </Button>
                      <Button size="small" variant="outlined" onClick={() => {
                        setSelectedParentId(parent._id);
                        setAssignRelationship(parent.relationship || 'Parent');
                        setOpenAssignDialog(true);
                      }}>Link Child</Button>
                      <Button size="small" variant="outlined" color="error" onClick={() => {
                        setSelectedParentId(parent._id);
                        setConfirmDeactivateOpen(true);
                      }}>Deactivate</Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, gap: 2 }}>
          <Button disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</Button>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>Page {page} of {totalPages}</Box>
          <Button disabled={page === totalPages} onClick={() => setPage(page + 1)}>Next</Button>
        </Box>
      </>
      )}

      {/* Add Parent Dialog */}
      <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)}>
        <DialogTitle>Add New Parent</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField 
            label="First Name" 
            fullWidth 
            value={formData.firstName}
            onChange={(e) => setFormData({...formData, firstName: e.target.value})}
          />
          <TextField 
            label="Last Name" 
            fullWidth 
            value={formData.lastName}
            onChange={(e) => setFormData({...formData, lastName: e.target.value})}
          />
          <FormControl fullWidth>
            <InputLabel>Relationship</InputLabel>
            <Select 
              value={formData.relationship}
              label="Relationship"
              onChange={(e) => setFormData({...formData, relationship: e.target.value})}
            >
              <MenuItem value="Father">Father</MenuItem>
              <MenuItem value="Mother">Mother</MenuItem>
              <MenuItem value="Guardian">Guardian</MenuItem>
              <MenuItem value="Grandparent">Grandparent</MenuItem>
              <MenuItem value="Other">Other</MenuItem>
            </Select>
          </FormControl>
          <TextField 
            label="Mobile" 
            fullWidth 
            value={formData.mobile}
            onChange={(e) => setFormData({...formData, mobile: e.target.value})}
          />
          <TextField 
            label="Email" 
            type="email" 
            fullWidth 
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddDialog(false)}>Cancel</Button>
          <Button onClick={handleAddParent} variant="contained" color="primary">Add Parent</Button>
        </DialogActions>
      </Dialog>

      {/* Assign Student Dialog */}
      <Dialog open={openAssignDialog} onClose={() => !assigning && setOpenAssignDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Assign Student to Parent</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Select a student from the list or enter their Student ID / Enrollment Number (e.g. STU-2026-000002).
          </Typography>

          <Autocomplete
            freeSolo
            options={students}
            getOptionLabel={(option) => typeof option === 'string' ? option : `${option.firstName} ${option.lastName} (${option.studentIdNumber || option._id})`}
            onInputChange={(_, newInputValue) => {
              setStudentIdToAssign(newInputValue);
            }}
            onChange={(_, value) => {
              if (value && typeof value !== 'string') {
                setStudentIdToAssign(value.studentIdNumber || value._id);
              }
            }}
            renderInput={(params) => (
              <TextField 
                {...params} 
                label="Student ID or Search Name" 
                fullWidth 
                placeholder="Search student or type STU-2026-000002..."
                helperText="Matches Student ID number, admission number, or ObjectId."
              />
            )}
          />

          <FormControl fullWidth>
            <InputLabel>Relationship to Student</InputLabel>
            <Select 
              value={assignRelationship}
              label="Relationship to Student"
              onChange={(e) => setAssignRelationship(e.target.value)}
            >
              <MenuItem value="Father">Father</MenuItem>
              <MenuItem value="Mother">Mother</MenuItem>
              <MenuItem value="Guardian">Guardian</MenuItem>
              <MenuItem value="Grandparent">Grandparent</MenuItem>
              <MenuItem value="Parent">Parent</MenuItem>
              <MenuItem value="Other">Other</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAssignDialog(false)} disabled={assigning}>Cancel</Button>
          <Button 
            onClick={handleAssignStudent} 
            variant="contained" 
            color="primary"
            disabled={assigning || !studentIdToAssign.trim()}
          >
            {assigning ? <CircularProgress size={24} color="inherit" /> : 'Assign Student'}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog 
        open={confirmDeactivateOpen}
        title="Deactivate Parent?"
        message="Are you sure you want to deactivate this parent?"
        confirmLabel="Deactivate"
        onConfirm={handleDeactivate}
        onCancel={() => setConfirmDeactivateOpen(false)}
        isDestructive={true}
      />

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={5000} 
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} 
          severity={snackbar.severity} 
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ParentManagement;
