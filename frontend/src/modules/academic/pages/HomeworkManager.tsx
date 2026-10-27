import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Paper, Table, TableHead, TableRow, TableCell, TableBody,
  Chip, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem,
  CircularProgress, Alert, IconButton, Tooltip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AssignmentIcon from '@mui/icons-material/Assignment';
import {
  getHomeworks, getClasses, getSubjects, createHomework,
  updateHomework, deleteHomework
} from '../api/academic.api';
import type { ClassSummary, SubjectSummary } from '../api/academic.api';

const statusColors: Record<string, 'success' | 'error' | 'warning' | 'default'> = {
  ACTIVE: 'success',
  INACTIVE: 'error',
  DRAFT: 'warning',
};

const HomeworkManager: React.FC = () => {
  const [homeworks, setHomeworks] = useState<any[]>([]);
  const [classes, setClasses] = useState<ClassSummary[]>([]);
  const [subjects, setSubjects] = useState<SubjectSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: '', description: '', classId: '', subjectId: '',
    dueDate: '', instructions: '', maxMarks: ''
  });

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [hw, cls, sub] = await Promise.all([getHomeworks(), getClasses(), getSubjects()]);
      setHomeworks(hw);
      setClasses(cls);
      setSubjects(sub);
    } catch (e) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleOpen = (hw?: any) => {
    if (hw) {
      setEditingId(hw._id || hw.id);
      setForm({
        title: hw.title || '',
        description: hw.description || '',
        classId: hw.classId?._id || hw.classId || '',
        subjectId: hw.subjectId?._id || hw.subjectId || '',
        dueDate: hw.dueDate ? hw.dueDate.split('T')[0] : '',
        instructions: hw.instructions || '',
        maxMarks: hw.maxMarks || ''
      });
    } else {
      setEditingId(null);
      setForm({ title: '', description: '', classId: '', subjectId: '', dueDate: '', instructions: '', maxMarks: '' });
    }
    setOpen(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.classId || !form.subjectId || !form.dueDate) {
      setError('Please fill all required fields'); return;
    }
    setSaving(true);
    try {
      const payload = { ...form, maxMarks: form.maxMarks ? Number(form.maxMarks) : undefined };
      if (editingId) {
        await updateHomework(editingId, payload);
      } else {
        await createHomework(payload);
      }
      setOpen(false);
      fetchAll();
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to save homework');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this homework?')) return;
    try {
      await deleteHomework(id);
      fetchAll();
    } catch (e) { setError('Failed to delete'); }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: "#1e293b" }}>Homework Manager</Typography>
          <Typography variant="body2" color="text.secondary">Assign and manage homework for your classes</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()} sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}>
          Create Homework
        </Button>
      </Box>

      {error && <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>{error}</Alert>}

      <Paper elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}><CircularProgress /></Box>
        ) : (
          <Table>
            <TableHead sx={{ bgcolor: '#f8fafc' }}>
              <TableRow>
                {['Title', 'Class', 'Subject', 'Due Date', 'Max Marks', 'Status', 'Actions'].map(h => (
                  <TableCell key={h} sx={{ fontWeight: 700, color: '#64748b' }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {homeworks.length === 0 ? (
                <TableRow><TableCell colSpan={7} align="center" sx={{ py: 4, color: '#94a3b8' }}>No homework found. Create one to get started.</TableCell></TableRow>
              ) : homeworks.map(hw => (
                <TableRow key={hw._id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AssignmentIcon sx={{ fontSize: 18, color: '#6366f1' }} />
                      <Typography fontWeight={600}>{hw.title}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{hw.classId?.name || 'N/A'}</TableCell>
                  <TableCell>{hw.subjectId?.name || 'N/A'}</TableCell>
                  <TableCell>{hw.dueDate ? new Date(hw.dueDate).toLocaleDateString('en-IN') : 'N/A'}</TableCell>
                  <TableCell>{hw.maxMarks || '-'}</TableCell>
                  <TableCell><Chip label={hw.status || 'ACTIVE'} size="small" color={statusColors[hw.status] || 'default'} /></TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => handleOpen(hw)}><EditIcon fontSize="small" /></IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton size="small" color="error" onClick={() => handleDelete(hw._id || hw.id)}><DeleteIcon fontSize="small" /></IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth >
        <DialogTitle sx={{ fontWeight: 700 }}>{editingId ? 'Edit Homework' : 'Create Homework'}</DialogTitle>
        <DialogContent sx={{ pt: '16px !important', display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <TextField label="Title *" fullWidth size="small" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
          <TextField label="Description" fullWidth size="small" multiline rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField select label="Class *" fullWidth size="small" value={form.classId} onChange={e => setForm({ ...form, classId: e.target.value })}>
              {classes.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
            </TextField>
            <TextField select label="Subject *" fullWidth size="small" value={form.subjectId} onChange={e => setForm({ ...form, subjectId: e.target.value })}>
              {subjects.map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
            </TextField>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField label="Due Date *" type="date" fullWidth size="small" slotProps={{ inputLabel: { shrink: true } }} value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} />
            <TextField label="Max Marks" type="number" fullWidth size="small" value={form.maxMarks} onChange={e => setForm({ ...form, maxMarks: e.target.value })} />
          </Box>
          <TextField label="Instructions" fullWidth size="small" multiline rows={2} value={form.instructions} onChange={e => setForm({ ...form, instructions: e.target.value })} />
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving} sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}>
            {saving ? 'Saving...' : editingId ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default HomeworkManager;
