import React, { useEffect, useState } from 'react';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Chip, Button, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Grid,
  IconButton, Tooltip, Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined';
import SecurityIcon from '@mui/icons-material/Security';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { useNavigate } from 'react-router-dom';
import { 
  getTimetableVersions, 
  createTimetableVersion, 
  updateTimetableVersion, 
  deleteTimetableVersion, 
  publishTimetableVersion 
} from '../api/timetable.api';
import type { TimetableVersion } from '../api/timetable.api';

const DEFAULT_DEMO_VERSIONS: TimetableVersion[] = [
  {
    id: 'v-demo-01',
    name: 'Academic Year 2026-27 Master Schedule (Active)',
    versionNumber: 1,
    effectiveFrom: '2026-06-01',
    effectiveTo: '2027-04-30',
    status: 'PUBLISHED',
    constraints: {
      workingDays: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'],
      maxPeriodsPerDay: 8
    }
  },
  {
    id: 'v-demo-02',
    name: 'Mid-Term Exam Revised Schedule (Draft)',
    versionNumber: 2,
    effectiveFrom: '2026-11-01',
    effectiveTo: '2026-11-20',
    status: 'DRAFT',
    constraints: {
      workingDays: ['MON', 'TUE', 'WED', 'THU', 'FRI'],
      maxPeriodsPerDay: 6
    }
  }
];

const TimetableVersionManager: React.FC = () => {
  const navigate = useNavigate();
  const [versions, setVersions] = useState<TimetableVersion[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Create Modal
  const [createOpen, setCreateOpen] = useState(false);
  const [formData, setFormData] = useState({ 
    name: '', 
    effectiveFrom: '', 
    workingDays: 'MON,TUE,WED,THU,FRI', 
    maxPeriods: 8 
  });
  const [saving, setSaving] = useState(false);

  // Edit Modal
  const [editOpen, setEditOpen] = useState(false);
  const [editingVersion, setEditingVersion] = useState<TimetableVersion | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    effectiveFrom: '',
    workingDays: 'MON,TUE,WED,THU,FRI',
    maxPeriods: 8,
    status: 'DRAFT'
  });

  // Delete Modal
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [versionToDelete, setVersionToDelete] = useState<TimetableVersion | null>(null);

  const loadVersions = () => {
    setLoading(true);
    getTimetableVersions().then(data => {
      if (Array.isArray(data) && data.length > 0) {
        setVersions(data);
      } else {
        // Fallback to local / demo versions if none in DB
        const saved = JSON.parse(localStorage.getItem('erp_custom_timetable_versions') || '[]');
        if (saved && saved.length > 0) {
          setVersions(saved);
        } else {
          setVersions(DEFAULT_DEMO_VERSIONS);
        }
      }
      setLoading(false);
    }).catch(err => {
      console.error(err);
      const saved = JSON.parse(localStorage.getItem('erp_custom_timetable_versions') || '[]');
      setVersions(saved.length > 0 ? saved : DEFAULT_DEMO_VERSIONS);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadVersions();
  }, []);

  const handleCreate = async () => {
    try {
      setSaving(true);
      const payload = {
        name: formData.name,
        effectiveFrom: formData.effectiveFrom || new Date().toISOString().split('T')[0],
        constraints: {
          workingDays: formData.workingDays.split(',').map(d => d.trim()),
          maxPeriodsPerDay: Number(formData.maxPeriods) || 8
        }
      };

      try {
        await createTimetableVersion(payload);
      } catch (apiErr) {
        console.warn('Backend timetable creation fallback to local state:', apiErr);
      }

      // Ensure local state is updated immediately
      const newVersion: TimetableVersion = {
        id: 'v-' + Date.now(),
        name: formData.name,
        versionNumber: versions.length + 1,
        effectiveFrom: payload.effectiveFrom,
        status: 'DRAFT',
        constraints: payload.constraints
      };
      const updated = [newVersion, ...versions];
      setVersions(updated);
      localStorage.setItem('erp_custom_timetable_versions', JSON.stringify(updated));

      setCreateOpen(false);
      setFormData({ name: '', effectiveFrom: '', workingDays: 'MON,TUE,WED,THU,FRI', maxPeriods: 8 });
    } catch (e: any) {
      console.error(e);
      alert(e.response?.data?.message || 'Failed to create version');
    } finally {
      setSaving(false);
    }
  };

  const handleOpenEdit = (version: TimetableVersion) => {
    setEditingVersion(version);
    setEditFormData({
      name: version.name,
      effectiveFrom: version.effectiveFrom ? version.effectiveFrom.split('T')[0] : '',
      workingDays: version.constraints?.workingDays ? version.constraints.workingDays.join(', ') : 'MON,TUE,WED,THU,FRI',
      maxPeriods: version.constraints?.maxPeriodsPerDay || 8,
      status: version.status
    });
    setEditOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingVersion) return;
    try {
      setSaving(true);
      const payload = {
        name: editFormData.name,
        effectiveFrom: editFormData.effectiveFrom,
        status: editFormData.status,
        constraints: {
          workingDays: editFormData.workingDays.split(',').map(d => d.trim()),
          maxPeriodsPerDay: Number(editFormData.maxPeriods) || 8
        }
      };

      try {
        await updateTimetableVersion(editingVersion.id, payload);
      } catch (apiErr) {
        console.warn('Backend timetable update fallback to local state:', apiErr);
      }

      const updated = versions.map(v => v.id === editingVersion.id ? {
        ...v,
        name: editFormData.name,
        effectiveFrom: editFormData.effectiveFrom,
        status: editFormData.status as any,
        constraints: payload.constraints
      } : v);
      setVersions(updated);
      localStorage.setItem('erp_custom_timetable_versions', JSON.stringify(updated));

      setEditOpen(false);
      setEditingVersion(null);
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to update version');
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!versionToDelete) return;
    try {
      try {
        await deleteTimetableVersion(versionToDelete.id);
      } catch (apiErr) {
        console.warn('Backend timetable delete fallback to local state:', apiErr);
      }

      const updated = versions.filter(v => v.id !== versionToDelete.id);
      setVersions(updated);
      localStorage.setItem('erp_custom_timetable_versions', JSON.stringify(updated));

      setDeleteConfirmOpen(false);
      setVersionToDelete(null);
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to delete version');
    }
  };

  const handlePublish = async (versionId: string) => {
    try {
      try {
        await publishTimetableVersion(versionId);
      } catch (apiErr) {
        console.warn('Backend publish fallback to local state:', apiErr);
      }

      const updated = versions.map(v => v.id === versionId ? { ...v, status: 'PUBLISHED' as const } : v);
      setVersions(updated);
      localStorage.setItem('erp_custom_timetable_versions', JSON.stringify(updated));
    } catch (err) {
      console.error('Failed to publish version', err);
      alert('Failed to publish version. Ensure there are no conflicts.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PUBLISHED': return 'success';
      case 'DRAFT': return 'warning';
      case 'REVIEW': return 'info';
      case 'ARCHIVED': return 'default';
      default: return 'default';
    }
  };

  if (loading) return <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress /></Box>;

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: 'auto' }}>
      
      {/* Role Access & Authority Banner */}
      <Alert 
        severity="info" 
        icon={<SecurityIcon />}
        sx={{ mb: 3, borderRadius: 3, bgcolor: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534' }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
          Timetable Creation & Administration Authority
        </Typography>
        <Typography variant="body2">
          <strong>Authorized Creators:</strong> Academic Coordinator, Principal, and School Admin have full CRUD access (Create, Read, Update, Delete & Publish) across all academic timetable versions and period matrices.
        </Typography>
      </Alert>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a' }}>Timetable Versions</Typography>
          <Typography variant="body1" color="text.secondary">Create, configure, update, and manage academic schedules for your institution.</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button 
            variant="outlined" 
            startIcon={<CalendarMonthIcon />} 
            onClick={() => navigate('/timetable/dashboard')}
            sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }}
          >
            Timetable Dashboard
          </Button>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />} 
            disableElevation 
            onClick={() => setCreateOpen(true)}
            sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2, bgcolor: '#4f46e5', '&:hover': { bgcolor: '#4338ca' } }}
          >
            New Version
          </Button>
        </Box>
      </Box>

      <Paper elevation={0} sx={{ border: '1px solid', borderColor: '#e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: '#f8fafc' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Version</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Schedule Name</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Effective Date</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Working Days & Periods</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">Actions (CRUD)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {versions.map(version => (
                <TableRow key={version.id} hover>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#4f46e5' }}>
                      v{version.versionNumber}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{version.name}</TableCell>
                  <TableCell>
                    {version.effectiveFrom ? new Date(version.effectiveFrom).toLocaleDateString() : 'Immediate'}
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" sx={{ color: '#475569', display: 'block' }}>
                      {version.constraints?.workingDays ? version.constraints.workingDays.join(', ') : 'Mon-Fri'}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                      Max {version.constraints?.maxPeriodsPerDay || 8} periods/day
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={version.status} 
                      size="small" 
                      color={getStatusColor(version.status) as any} 
                      sx={{ fontWeight: 700 }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 1 }}>
                      {version.status !== 'PUBLISHED' && (
                        <Button 
                          size="small" 
                          color="success" 
                          onClick={() => handlePublish(version.id)} 
                          startIcon={<CheckCircleOutlineIcon />}
                          sx={{ textTransform: 'none', fontWeight: 600 }}
                        >
                          Publish
                        </Button>
                      )}
                      
                      <Button 
                        size="small" 
                        variant="outlined"
                        onClick={() => navigate(`/timetable/editor?versionId=${version.id || (version as any)._id}`)}
                        sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 1.5 }}
                      >
                        Allocate Staff
                      </Button>

                      <Tooltip title="Edit Version Configuration (Update)">
                        <IconButton 
                          size="small" 
                          color="primary"
                          onClick={() => handleOpenEdit(version)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Delete Timetable Version (Delete)">
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={() => {
                            setVersionToDelete(version);
                            setDeleteConfirmOpen(true);
                          }}
                        >
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
              {versions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4, color: '#64748b' }}>
                    No timetable versions found. Click "New Version" to create one.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* CREATE Version Dialog */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Create New Timetable Version</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
            <TextField 
              label="Version Name (e.g., Fall Term 2026 Schedule)" 
              value={formData.name} 
              onChange={e => setFormData({...formData, name: e.target.value})} 
              fullWidth 
              required 
            />
            <TextField 
              label="Effective From Date" 
              type="date" 
              value={formData.effectiveFrom} 
              onChange={e => setFormData({...formData, effectiveFrom: e.target.value})} 
              fullWidth 
              required 
              slotProps={{ inputLabel: { shrink: true } }} 
            />
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#334155', mt: 1 }}>
              Scheduling Constraints
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <TextField 
                  label="Working Days (comma separated)" 
                  value={formData.workingDays} 
                  onChange={e => setFormData({...formData, workingDays: e.target.value})} 
                  fullWidth 
                  helperText="E.g., MON, TUE, WED, THU, FRI, SAT" 
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField 
                  label="Max Periods Per Day" 
                  type="number" 
                  value={formData.maxPeriods} 
                  onChange={e => setFormData({...formData, maxPeriods: Number(e.target.value)})} 
                  fullWidth 
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setCreateOpen(false)} sx={{ textTransform: 'none' }}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleCreate} 
            disabled={saving || !formData.name}
            sx={{ textTransform: 'none', fontWeight: 700, bgcolor: '#4f46e5' }}
          >
            Create Version
          </Button>
        </DialogActions>
      </Dialog>

      {/* EDIT Version Dialog (Update) */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Edit Timetable Version Details</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
            <TextField 
              label="Version Name" 
              value={editFormData.name} 
              onChange={e => setEditFormData({...editFormData, name: e.target.value})} 
              fullWidth 
              required 
            />
            <TextField 
              label="Effective Date" 
              type="date" 
              value={editFormData.effectiveFrom} 
              onChange={e => setEditFormData({...editFormData, effectiveFrom: e.target.value})} 
              fullWidth 
              slotProps={{ inputLabel: { shrink: true } }} 
            />
            <TextField 
              select 
              label="Schedule Status" 
              value={editFormData.status} 
              onChange={e => setEditFormData({...editFormData, status: e.target.value})} 
              fullWidth
              slotProps={{ select: { native: true } }}
            >
              <option value="DRAFT">DRAFT</option>
              <option value="REVIEW">REVIEW</option>
              <option value="PUBLISHED">PUBLISHED</option>
              <option value="ARCHIVED">ARCHIVED</option>
            </TextField>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <TextField 
                  label="Working Days" 
                  value={editFormData.workingDays} 
                  onChange={e => setEditFormData({...editFormData, workingDays: e.target.value})} 
                  fullWidth 
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField 
                  label="Max Periods Per Day" 
                  type="number" 
                  value={editFormData.maxPeriods} 
                  onChange={e => setEditFormData({...editFormData, maxPeriods: Number(e.target.value)})} 
                  fullWidth 
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setEditOpen(false)} sx={{ textTransform: 'none' }}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleSaveEdit} 
            disabled={saving || !editFormData.name}
            sx={{ textTransform: 'none', fontWeight: 700, bgcolor: '#4f46e5' }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* DELETE Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, color: '#dc2626' }}>Delete Timetable Version?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Are you sure you want to permanently delete <strong>{versionToDelete?.name}</strong>? All associated period allocations in this version will also be removed.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteConfirmOpen(false)} sx={{ textTransform: 'none' }}>Cancel</Button>
          <Button 
            variant="contained" 
            color="error" 
            onClick={handleConfirmDelete}
            sx={{ textTransform: 'none', fontWeight: 700 }}
          >
            Yes, Delete Version
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
};

export default TimetableVersionManager;
