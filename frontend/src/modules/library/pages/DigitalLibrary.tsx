import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Grid, Card, CardContent, CardActions, Button,
  Chip, TextField, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions,
  Stack, Alert, CircularProgress, Tabs, Tab, Table, TableBody, TableCell,
  TableHead, TableRow
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import AudioFileIcon from '@mui/icons-material/AudioFile';
import LinkIcon from '@mui/icons-material/Link';
import axios from 'axios';

const resourceTypeIcons: Record<string, React.ReactNode> = {
  EBOOK: <MenuBookIcon color="primary" />,
  PDF: <PictureAsPdfIcon color="error" />,
  VIDEO: <PlayCircleIcon color="secondary" />,
  AUDIO: <AudioFileIcon color="info" />,
  JOURNAL: <MenuBookIcon color="success" />,
  WEBSITE: <LinkIcon color="action" />,
};

const accessColors: Record<string, any> = {
  PUBLIC: 'success', STUDENT_ONLY: 'info', TEACHER_ONLY: 'warning', STAFF_ONLY: 'secondary', CLASS_SPECIFIC: 'error'
};

const DigitalLibrary: React.FC = () => {
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('grid');
  const [filterType, setFilterType] = useState('');
  const [search, setSearch] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [form, setForm] = useState<any>({
    title: '', author: '', resourceType: 'PDF', url: '', accessRestrictions: 'STUDENT_ONLY', status: 'ACTIVE'
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchResources = () => {
    setLoading(true);
    const params: any = {};
    if (filterType) params.resourceType = filterType;
    if (search) params.search = search;
    axios.get('/api/v1/library/digital-resources', { params })
      .then(res => setResources(res.data.data))
      .catch(() => setError('Failed to load resources.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchResources(); }, [filterType, search]);

  const handleCreate = async () => {
    if (!form.title || !form.url) { setError('Title and URL are required.'); return; }
    setSaving(true);
    try {
      await axios.post('/api/v1/library/digital-resources', form);
      setOpenDialog(false);
      setForm({ title: '', author: '', resourceType: 'PDF', url: '', accessRestrictions: 'STUDENT_ONLY', status: 'ACTIVE' });
      fetchResources();
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to create resource.');
    } finally { setSaving(false); }
  };

  const handleDelete = async (resourceId: string) => {
    if (!window.confirm('Are you sure you want to delete this resource?')) return;
    try {
      await axios.delete(`/api/v1/library/digital-resources/${resourceId}`);
      fetchResources();
    } catch { setError('Failed to delete resource.'); }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>Digital Library</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenDialog(true)}>
          Add Resource
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <TextField
          label="Search resources"
          value={search}
          onChange={e => setSearch(e.target.value)}
          size="small"
          sx={{ minWidth: 250 }}
        />
        <TextField select label="Resource Type" value={filterType} onChange={e => setFilterType(e.target.value)} size="small" sx={{ minWidth: 150 }}>
          <MenuItem value="">All Types</MenuItem>
          {['EBOOK', 'PDF', 'VIDEO', 'AUDIO', 'JOURNAL', 'WEBSITE'].map(t => (
            <MenuItem key={t} value={t}>{t}</MenuItem>
          ))}
        </TextField>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ ml: 'auto' }}>
          <Tab label="Grid" value="grid" />
          <Tab label="Table" value="table" />
        </Tabs>
      </Stack>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}><CircularProgress /></Box>
      ) : tab === 'grid' ? (
        <Grid container spacing={2}>
          {resources.length === 0 ? (
            <Grid size={{ xs: 12 }}><Alert severity="info">No digital resources found.</Alert></Grid>
          ) : resources.map((r: any) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={r._id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flex: 1 }}>
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1 }}>
                    {resourceTypeIcons[r.resourceType] || <MenuBookIcon />}
                    <Chip label={r.resourceType} size="small" variant="outlined" />
                  </Stack>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }} gutterBottom noWrap>{r.title}</Typography>
                  {r.author && <Typography variant="body2" color="text.secondary">By {r.author}</Typography>}
                  <Chip label={r.accessRestrictions} color={accessColors[r.accessRestrictions]} size="small" sx={{ mt: 1 }} />
                </CardContent>
                <CardActions sx={{ pt: 0, px: 2, pb: 2 }}>
                  <Button size="small" href={r.url} target="_blank" rel="noreferrer">Open</Button>
                  <Button size="small" color="error" onClick={() => handleDelete(r._id)}>Delete</Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Paper>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Author</TableCell>
                <TableCell>Access</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {resources.map((r: any) => (
                <TableRow key={r._id} hover>
                  <TableCell><Typography sx={{ fontWeight: 'medium' }}>{r.title}</Typography></TableCell>
                  <TableCell><Chip label={r.resourceType} size="small" /></TableCell>
                  <TableCell>{r.author || '—'}</TableCell>
                  <TableCell><Chip label={r.accessRestrictions} color={accessColors[r.accessRestrictions]} size="small" /></TableCell>
                  <TableCell><Chip label={r.status} color={r.status === 'ACTIVE' ? 'success' : 'default'} size="small" /></TableCell>
                  <TableCell>
                    <Button size="small" href={r.url} target="_blank">Open</Button>
                    <Button size="small" color="error" onClick={() => handleDelete(r._id)}>Delete</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}

      {/* Create Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Digital Resource</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Title *" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} fullWidth size="small" />
            <TextField label="Author / Creator" value={form.author} onChange={e => setForm({ ...form, author: e.target.value })} fullWidth size="small" />
            <TextField select label="Resource Type" value={form.resourceType} onChange={e => setForm({ ...form, resourceType: e.target.value })} fullWidth size="small">
              {['EBOOK', 'PDF', 'VIDEO', 'AUDIO', 'JOURNAL', 'WEBSITE'].map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
            </TextField>
            <TextField label="URL / File Path *" value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} fullWidth size="small" helperText="Paste the direct URL or upload path" />
            <TextField select label="Access Restriction" value={form.accessRestrictions} onChange={e => setForm({ ...form, accessRestrictions: e.target.value })} fullWidth size="small">
              {['PUBLIC', 'STUDENT_ONLY', 'TEACHER_ONLY', 'STAFF_ONLY', 'CLASS_SPECIFIC'].map(a => <MenuItem key={a} value={a}>{a}</MenuItem>)}
            </TextField>
            <TextField label="Published Date" type="date" slotProps={{ inputLabel: { shrink: true } }} value={form.publishedDate || ''} onChange={e => setForm({ ...form, publishedDate: e.target.value })} fullWidth size="small" />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate} disabled={saving}>
            {saving ? 'Saving...' : 'Add Resource'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DigitalLibrary;
