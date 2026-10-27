import { useState, useEffect } from 'react';
import { 
  Box, Typography, Card, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Button, IconButton, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Grid, Chip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import AssignmentIcon from '@mui/icons-material/Assignment';
import api from '../../../core/api/axios';

export default function PlanManagement() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    billingCycle: 'YEARLY',
    price: 0,
    trialDays: 14,
    maxStudents: 100,
    maxStaff: 10,
    maxBranches: 1,
    enabledModules: 'student,staff,attendance,finance'
  });

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const res = await api.get('/super-admin/plans');
      setPlans(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenNew = () => {
    setIsEditing(false);
    setCurrentId(null);
    setFormData({
      name: '',
      code: '',
      description: '',
      billingCycle: 'YEARLY',
      price: 0,
      trialDays: 14,
      maxStudents: 100,
      maxStaff: 10,
      maxBranches: 1,
      enabledModules: 'student,staff,attendance,finance'
    });
    setOpenModal(true);
  };

  const handleOpenEdit = (plan: any) => {
    setIsEditing(true);
    setCurrentId(plan._id);
    setFormData({
      name: plan.name,
      code: plan.code,
      description: plan.description || '',
      billingCycle: plan.billingCycle,
      price: plan.price,
      trialDays: plan.trialDays,
      maxStudents: plan.maxStudents,
      maxStaff: plan.maxStaff,
      maxBranches: plan.maxBranches,
      enabledModules: plan.enabledModules.join(',')
    });
    setOpenModal(true);
  };

  const handleSave = async () => {
    try {
      const payload = {
        ...formData,
        enabledModules: formData.enabledModules.split(',').map(m => m.trim())
      };

      if (isEditing && currentId) {
        await api.patch(`/super-admin/plans/${currentId}`, payload);
      } else {
        await api.post('/super-admin/plans', payload);
      }
      setOpenModal(false);
      fetchPlans();
    } catch (err) {
      console.error(err);
      alert('Failed to save plan');
    }
  };

  return (
    <Box sx={{ p: 4, maxWidth: 1400, mx: 'auto' }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 1 }}>
          <AssignmentIcon fontSize="large" color="primary" /> SaaS Plans
        </Typography>
        <Button variant="contained" onClick={handleOpenNew}>+ Create Plan</Button>
      </Box>

      <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, overflow: 'hidden' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: 'grey.50' }}>
                <TableRow>
                  <TableCell><strong>Plan Name</strong></TableCell>
                  <TableCell><strong>Code</strong></TableCell>
                  <TableCell><strong>Price</strong></TableCell>
                  <TableCell><strong>Cycle</strong></TableCell>
                  <TableCell><strong>Limits (Stu/Staff)</strong></TableCell>
                  <TableCell align="right"><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {plans.map((p) => (
                  <TableRow key={p._id} hover>
                    <TableCell sx={{ fontWeight: 600 }}>{p.name}</TableCell>
                    <TableCell><Chip label={p.code} size="small" /></TableCell>
                    <TableCell>${p.price}</TableCell>
                    <TableCell>{p.billingCycle}</TableCell>
                    <TableCell>{p.maxStudents} / {p.maxStaff}</TableCell>
                    <TableCell align="right">
                      <IconButton color="primary" onClick={() => handleOpenEdit(p)}><EditIcon /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {plans.length === 0 && (
                  <TableRow><TableCell colSpan={6} align="center">No plans found.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="md" fullWidth>
        <DialogTitle>{isEditing ? 'Edit Plan' : 'Create New Plan'}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth label="Plan Name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth label="Code" value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value})} disabled={isEditing} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField fullWidth label="Description" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField fullWidth label="Price" type="number" value={formData.price} onChange={(e) => setFormData({...formData, price: Number(e.target.value)})} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField fullWidth label="Billing Cycle (MONTHLY/YEARLY)" value={formData.billingCycle} onChange={(e) => setFormData({...formData, billingCycle: e.target.value})} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField fullWidth label="Trial Days" type="number" value={formData.trialDays} onChange={(e) => setFormData({...formData, trialDays: Number(e.target.value)})} />
            </Grid>
            
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2" color="primary" sx={{ mt: 1 }}>Limits & Features</Typography>
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField fullWidth label="Max Students" type="number" value={formData.maxStudents} onChange={(e) => setFormData({...formData, maxStudents: Number(e.target.value)})} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField fullWidth label="Max Staff" type="number" value={formData.maxStaff} onChange={(e) => setFormData({...formData, maxStaff: Number(e.target.value)})} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField fullWidth label="Max Branches" type="number" value={formData.maxBranches} onChange={(e) => setFormData({...formData, maxBranches: Number(e.target.value)})} />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField fullWidth label="Enabled Modules (comma separated)" value={formData.enabledModules} onChange={(e) => setFormData({...formData, enabledModules: e.target.value})} helperText="e.g. student,staff,attendance,finance,library,transport" />
            </Grid>

          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenModal(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>Save Plan</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
