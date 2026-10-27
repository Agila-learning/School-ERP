import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Grid, Button, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Chip, CircularProgress, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem,
  Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { getDepartments, getDesignations, createDepartment, updateDepartment, deactivateDepartment, createDesignation, updateDesignation, deactivateDesignation } from '../../hr/api/hr.api';

const DepartmentDesignationManager: React.FC = () => {
  const [departments, setDepartments] = useState<any[]>([]);
  const [designations, setDesignations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [deptModalOpen, setDeptModalOpen] = useState(false);
  const [desgModalOpen, setDesgModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<any>(null);
  const [editingDesg, setEditingDesg] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [error, setError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [depData, desData] = await Promise.all([getDepartments(), getDesignations()]);
      setDepartments(depData);
      setDesignations(desData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openDeptModal = (dept?: any) => {
    setEditingDept(dept || null);
    setFormData(dept ? { name: dept.name, code: dept.code, status: dept.status } : { name: '', code: '', status: 'ACTIVE' });
    setError('');
    setDeptModalOpen(true);
  };

  const openDesgModal = (desg?: any) => {
    setEditingDesg(desg || null);
    setFormData(desg ? { name: desg.name, code: desg.code, departmentId: desg.departmentId?._id || desg.departmentId, level: desg.level, status: desg.status } : { name: '', code: '', departmentId: '', level: 1, status: 'ACTIVE' });
    setError('');
    setDesgModalOpen(true);
  };

  const handleDeptSubmit = async () => {
    try {
      if (editingDept) {
        await updateDepartment(editingDept._id, formData);
      } else {
        await createDepartment(formData);
      }
      setDeptModalOpen(false);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save department');
    }
  };

  const handleDesgSubmit = async () => {
    try {
      if (editingDesg) {
        await updateDesignation(editingDesg._id, formData);
      } else {
        await createDesignation(formData);
      }
      setDesgModalOpen(false);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save designation');
    }
  };

  const handleDeleteDept = async (id: string) => {
    if(window.confirm('Are you sure you want to deactivate this department?')) {
      await deactivateDepartment(id);
      fetchData();
    }
  };

  const handleDeleteDesg = async (id: string) => {
    if(window.confirm('Are you sure you want to deactivate this designation?')) {
      await deactivateDesignation(id);
      fetchData();
    }
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>;
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>Departments & Designations</Typography>
        <Typography variant="body1" color="text.secondary">Configure the organizational structure for HR.</Typography>
      </Box>

      <Grid container spacing={4}>
        
        {/* Departments */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Departments</Typography>
            <Button size="small" variant="contained" startIcon={<AddIcon />} disableElevation onClick={() => openDeptModal()}>Add Dept</Button>
          </Box>
          <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, overflow: 'hidden' }}>
            <TableContainer>
              <Table size="small">
                <TableHead sx={{ bgcolor: 'grey.50' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Code</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                    <TableCell align="right"></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {departments.map(d => (
                    <TableRow key={d._id} hover>
                      <TableCell><Typography variant="body2" sx={{ fontWeight: 600 }}>{d.name}</Typography></TableCell>
                      <TableCell>{d.code}</TableCell>
                      <TableCell>
                        <Chip label={d.status} color={d.status === 'ACTIVE' ? 'success' : 'default'} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton size="small" onClick={() => openDeptModal(d)}><EditIcon fontSize="inherit" /></IconButton>
                        <IconButton size="small" onClick={() => handleDeleteDept(d._id)} color="error"><DeleteIcon fontSize="inherit" /></IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  {departments.length === 0 && (
                    <TableRow><TableCell colSpan={4} align="center">No departments found.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Designations */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Designations</Typography>
            <Button size="small" variant="contained" startIcon={<AddIcon />} disableElevation onClick={() => openDesgModal()}>Add Desg</Button>
          </Box>
          <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, overflow: 'hidden' }}>
            <TableContainer>
              <Table size="small">
                <TableHead sx={{ bgcolor: 'grey.50' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Title</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Code</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Dept</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                    <TableCell align="right"></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {designations.map(d => (
                    <TableRow key={d._id} hover>
                      <TableCell><Typography variant="body2" sx={{ fontWeight: 600 }}>{d.name}</Typography></TableCell>
                      <TableCell>{d.code}</TableCell>
                      <TableCell>{d.departmentId?.name || '-'}</TableCell>
                      <TableCell>
                        <Chip label={d.status} color={d.status === 'ACTIVE' ? 'success' : 'default'} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                        <IconButton size="small" onClick={() => openDesgModal(d)}><EditIcon fontSize="inherit" /></IconButton>
                        <IconButton size="small" onClick={() => handleDeleteDesg(d._id)} color="error"><DeleteIcon fontSize="inherit" /></IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  {designations.length === 0 && (
                    <TableRow><TableCell colSpan={5} align="center">No designations found.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Dept Modal */}
      <Dialog open={deptModalOpen} onClose={() => setDeptModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingDept ? 'Edit Department' : 'Add Department'}</DialogTitle>
        <DialogContent dividers>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <TextField fullWidth label="Name" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} required size="small" />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField fullWidth label="Code" value={formData.code || ''} onChange={e => setFormData({...formData, code: e.target.value})} required size="small" />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField select fullWidth label="Status" value={formData.status || 'ACTIVE'} onChange={e => setFormData({...formData, status: e.target.value})} size="small">
                <MenuItem value="ACTIVE">Active</MenuItem>
                <MenuItem value="INACTIVE">Inactive</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeptModalOpen(false)}>Cancel</Button>
          <Button onClick={handleDeptSubmit} variant="contained" disableElevation>Save</Button>
        </DialogActions>
      </Dialog>

      {/* Desg Modal */}
      <Dialog open={desgModalOpen} onClose={() => setDesgModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingDesg ? 'Edit Designation' : 'Add Designation'}</DialogTitle>
        <DialogContent dividers>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <TextField fullWidth label="Title" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} required size="small" />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField fullWidth label="Code" value={formData.code || ''} onChange={e => setFormData({...formData, code: e.target.value})} required size="small" />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField select fullWidth label="Department" value={formData.departmentId || ''} onChange={e => setFormData({...formData, departmentId: e.target.value})} required size="small">
                <MenuItem value="">Select Department</MenuItem>
                {departments.map(d => (
                  <MenuItem key={d._id} value={d._id}>{d.name}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField fullWidth label="Level (Hierarchy)" type="number" value={formData.level || 1} onChange={e => setFormData({...formData, level: parseInt(e.target.value)})} size="small" />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField select fullWidth label="Status" value={formData.status || 'ACTIVE'} onChange={e => setFormData({...formData, status: e.target.value})} size="small">
                <MenuItem value="ACTIVE">Active</MenuItem>
                <MenuItem value="INACTIVE">Inactive</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDesgModalOpen(false)}>Cancel</Button>
          <Button onClick={handleDesgSubmit} variant="contained" disableElevation>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DepartmentDesignationManager;
