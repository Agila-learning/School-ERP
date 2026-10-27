import { useState, useEffect } from 'react';

import {
  Box, Typography, Button, Table, TableBody, TableCell, TableHead, TableRow, Paper, Chip, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, IconButton, Tooltip, Alert, Divider
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import api from '../../../core/api/axios';

const AnnouncementManager = () => {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [openModal, setOpenModal] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [viewItem, setViewItem] = useState<any>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: '', content: '', type: 'GENERAL', channels: ['APP_PUSH'], status: 'PUBLISHED' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      let res = await api.get('/communication/admin/announcements').catch(() => null);
      if (!res?.data?.data || res.data.data.length === 0) {
        res = await api.get('/communication/announcements').catch(() => null);
      }
      if (res?.data?.success && Array.isArray(res.data.data)) {
        setAnnouncements(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch announcements', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this announcement?")) return;
    try {
      await api.delete(`/communication/admin/announcements/${id}`).catch(() => api.delete(`/communication/announcements/${id}`));
      setAnnouncements(prev => prev.filter(a => a._id !== id));
    } catch {
      setError('Failed to delete announcement');
    }
  };

  const handleOpen = (item?: any) => {
    if (item) {
      setEditingId(item._id);
      setForm({
        title: item.title || '',
        content: item.content || '',
        type: item.type || 'GENERAL',
        channels: item.channels || ['APP_PUSH'],
        status: item.status || 'PUBLISHED'
      });
    } else {
      setEditingId(null);
      setForm({ title: '', content: '', type: 'GENERAL', channels: ['APP_PUSH'], status: 'PUBLISHED' });
    }
    setOpenModal(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.content) {
      setError("Title and content are required");
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        await api.put(`/communication/admin/announcements/${editingId}`, form);
      } else {
        await api.post('/communication/admin/announcements', form);
      }
      setOpenModal(false);
      fetchAnnouncements();
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to save announcement');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: "#1e293b" }}>Announcements & Circulars</Typography>
          <Typography variant="body2" color="text.secondary">Broadcast messages to students, parents, and staff</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()} sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}>
          Compose New
        </Button>
      </Box>

      {error && <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>{error}</Alert>}

      <Paper elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Table>
            <TableHead sx={{ bgcolor: '#f8fafc' }}>
              <TableRow>
                {['Title', 'Type', 'Channels', 'Status', 'Date', 'Actions'].map(h => (
                  <TableCell key={h} sx={{ fontWeight: 700, color: '#64748b' }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {announcements.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4, color: '#94a3b8' }}>No announcements found.</TableCell>
                </TableRow>
              ) : announcements.map((item: any) => (
                <TableRow key={item._id} hover>
                  <TableCell sx={{ fontWeight: 600 }}>{item.title}</TableCell>
                  <TableCell><Chip size="small" label={item.type} variant="outlined" /></TableCell>
                  <TableCell>{item.channels?.join(', ')}</TableCell>
                  <TableCell>
                    <Chip 
                      size="small" 
                      label={item.status} 
                      color={item.status === 'PUBLISHED' ? 'success' : item.status === 'DRAFT' ? 'default' : 'warning'} 
                    />
                  </TableCell>
                  <TableCell>{item.publishedAt ? new Date(item.publishedAt).toLocaleDateString() : item.scheduledFor ? new Date(item.scheduledFor).toLocaleDateString() : '-'}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Tooltip title="View Announcement">
                        <IconButton size="small" color="primary" onClick={() => { setViewItem(item); setViewOpen(true); }}>
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => handleOpen(item)}><EditIcon fontSize="small" /></IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton size="small" color="error" onClick={() => handleDelete(item._id)}><DeleteIcon fontSize="small" /></IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>

      {/* View Announcement Modal */}
      <Dialog open={viewOpen} onClose={() => setViewOpen(false)} maxWidth="sm" fullWidth>
        {viewItem && (
          <>
            <DialogTitle sx={{ fontWeight: 800, pb: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>{viewItem.title}</span>
              <Chip 
                size="small" 
                label={viewItem.type || 'GENERAL'} 
                color={viewItem.type === 'URGENT' ? 'error' : viewItem.type === 'CIRCULAR' ? 'info' : 'primary'} 
              />
            </DialogTitle>
            <DialogContent dividers sx={{ pt: 2, pb: 3 }}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2.5, bgcolor: '#f8fafc', p: 1.5, borderRadius: 2 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Date</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {viewItem.publishedAt ? new Date(viewItem.publishedAt).toLocaleDateString() : viewItem.createdAt ? new Date(viewItem.createdAt).toLocaleDateString() : 'Today'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Status</Typography>
                  <Chip size="small" label={viewItem.status || 'PUBLISHED'} color={viewItem.status === 'PUBLISHED' ? 'success' : 'default'} />
                </Box>
                {viewItem.channels && viewItem.channels.length > 0 && (
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Channels</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{viewItem.channels.join(', ')}</Typography>
                  </Box>
                )}
                {viewItem.audienceConfig?.targetType && (
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Audience</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{viewItem.audienceConfig.targetType}</Typography>
                  </Box>
                )}
              </Box>

              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: '#334155' }}>
                Announcement Content
              </Typography>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', color: '#1e293b', lineHeight: 1.7, bgcolor: '#ffffff', p: 2, borderRadius: 2, border: '1px solid #e2e8f0' }}>
                {viewItem.content || 'No detailed content provided.'}
              </Typography>
            </DialogContent>
            <DialogActions sx={{ p: 2.5 }}>
              <Button onClick={() => setViewOpen(false)} sx={{ fontWeight: 600 }}>Close</Button>
              <Button 
                variant="outlined" 
                onClick={() => {
                  setViewOpen(false);
                  handleOpen(viewItem);
                }} 
                sx={{ borderRadius: 2, fontWeight: 600 }}
              >
                Edit Announcement
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Compose/Edit Modal */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth >
        <DialogTitle sx={{ fontWeight: 700 }}>{editingId ? 'Edit Announcement' : 'Compose Announcement'}</DialogTitle>
        <DialogContent sx={{ pt: '16px !important', display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <TextField label="Title *" fullWidth size="small" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
          <TextField select label="Type" fullWidth size="small" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
            {['GENERAL', 'URGENT', 'EVENT', 'CIRCULAR'].map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
          </TextField>
          <TextField label="Content *" multiline rows={4} fullWidth size="small" value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} />
          <TextField select label="Status" fullWidth size="small" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
            {['DRAFT', 'PUBLISHED'].map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
          </TextField>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button onClick={() => setOpenModal(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving} sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AnnouncementManager;
