import React, { useEffect, useState } from 'react';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Chip, CircularProgress, Button, Switch,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  FormControl, InputLabel, Select, MenuItem, FormControlLabel, Checkbox, Grid
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import { getLeaveTypes, saveLeaveType } from '../api/leave.api';
import type { LeaveType } from '../api/leave.api';

const LeaveTypeManager: React.FC = () => {
  const [types, setTypes] = useState<LeaveType[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingType, setEditingType] = useState<LeaveType | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    domain: 'EMPLOYEE' as 'STUDENT' | 'EMPLOYEE' | 'BOTH',
    isPaid: true,
    allowHalfDay: true,
    requiresDocument: false,
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE'
  });

  const loadTypes = () => {
    setLoading(true);
    getLeaveTypes().then(data => {
      setTypes(data || []);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadTypes();
  }, []);

  const handleOpenCreate = () => {
    setEditingType(null);
    setFormData({
      name: '',
      code: '',
      domain: 'EMPLOYEE',
      isPaid: true,
      allowHalfDay: true,
      requiresDocument: false,
      status: 'ACTIVE'
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (type: LeaveType) => {
    setEditingType(type);
    setFormData({
      name: type.name,
      code: type.code,
      domain: type.domain,
      isPaid: type.isPaid,
      allowHalfDay: type.allowHalfDay,
      requiresDocument: type.requiresDocument,
      status: type.status
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.code) {
      alert('Leave type name and code are required');
      return;
    }
    try {
      setSaving(true);
      await saveLeaveType({
        ...(editingType ? { id: editingType.id || (editingType as any)._id } : {}),
        ...formData
      });
      setModalOpen(false);
      loadTypes();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to save leave type');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (type: LeaveType) => {
    const newStatus = type.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await saveLeaveType({
        id: type.id || (type as any)._id,
        status: newStatus
      });
      loadTypes();
    } catch (err) {
      console.error('Failed to toggle status', err);
    }
  };

  if (loading) return <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress /></Box>;

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>Leave Types & Policies</Typography>
          <Typography variant="body1" color="text.secondary">
            Configure available leave categories and their rules.
          </Typography>
        </Box>
        <Button variant="contained" color="primary" startIcon={<AddIcon />} disableElevation onClick={handleOpenCreate}>
          New Leave Type
        </Button>
      </Box>

      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: 'grey.50' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Code</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Domain</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Paid?</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Doc Req?</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {types.map(type => (
                <TableRow key={type.id || (type as any)._id} hover>
                  <TableCell><Typography variant="body2" sx={{ fontWeight: 700 }}>{type.name}</Typography></TableCell>
                  <TableCell><Typography variant="body2" color="text.secondary">{type.code}</Typography></TableCell>
                  <TableCell><Chip label={type.domain} size="small" variant="outlined" /></TableCell>
                  <TableCell>{type.isPaid ? 'Yes' : 'No'}</TableCell>
                  <TableCell>{type.requiresDocument ? 'Yes' : 'No'}</TableCell>
                  <TableCell>
                    <Switch 
                      checked={type.status === 'ACTIVE'} 
                      color="success" 
                      size="small" 
                      onChange={() => handleToggleStatus(type)}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Button size="small" startIcon={<EditIcon />} onClick={() => handleOpenEdit(type)}>
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {types.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 3 }}>No leave types configured.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Leave Type Modal */}
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>
          {editingType ? 'Edit Leave Type' : 'Create New Leave Type'}
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={8}>
                <TextField 
                  label="Leave Type Name" 
                  fullWidth 
                  required 
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Sick Leave, Casual Leave"
                />
              </Grid>
              <Grid item xs={4}>
                <TextField 
                  label="Code" 
                  fullWidth 
                  required 
                  value={formData.code}
                  onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. SL, CL"
                />
              </Grid>
            </Grid>

            <FormControl fullWidth>
              <InputLabel>Applicable Domain</InputLabel>
              <Select 
                label="Applicable Domain" 
                value={formData.domain} 
                onChange={e => setFormData({ ...formData, domain: e.target.value as any })}
              >
                <MenuItem value="EMPLOYEE">Employees Only</MenuItem>
                <MenuItem value="STUDENT">Students Only</MenuItem>
                <MenuItem value="BOTH">Both Employees & Students</MenuItem>
              </Select>
            </FormControl>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={formData.isPaid} 
                    onChange={e => setFormData({ ...formData, isPaid: e.target.checked })} 
                  />
                }
                label="Paid Leave (Salary / Stipend preserved)"
              />
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={formData.allowHalfDay} 
                    onChange={e => setFormData({ ...formData, allowHalfDay: e.target.checked })} 
                  />
                }
                label="Allow Half-Day Applications"
              />
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={formData.requiresDocument} 
                    onChange={e => setFormData({ ...formData, requiresDocument: e.target.checked })} 
                  />
                }
                label="Requires Supporting Document (e.g. Medical Certificate)"
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : (editingType ? 'Update Leave Type' : 'Create Leave Type')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LeaveTypeManager;
