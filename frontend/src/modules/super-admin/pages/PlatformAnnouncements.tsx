import { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, Card, CardContent, Chip, Button, CircularProgress, Divider, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select, MenuItem, FormControl, InputLabel, Stack } from '@mui/material';
import CampaignIcon from '@mui/icons-material/Campaign';
import AddIcon from '@mui/icons-material/Add';
import PublishIcon from '@mui/icons-material/Publish';
import { getAnnouncements, createAnnouncement, publishAnnouncement, deleteAnnouncement } from '../api/superAdmin.api';
import dayjs from 'dayjs';

const TYPE_COLORS: Record<string, any> = {
  MAINTENANCE: 'warning', FEATURE: 'success', BILLING: 'info', POLICY: 'default', OUTAGE: 'error', GENERAL: 'default'
};

export default function PlatformAnnouncements() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '', content: '', type: 'GENERAL', priority: 'MEDIUM', targetAudience: 'ALL', expiresAt: ''
  });

  useEffect(() => { fetchAnnouncements(); }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await getAnnouncements();
      setAnnouncements(res.data.data);
    } catch {} finally { setLoading(false); }
  };

  const handleCreate = async () => {
    try {
      const payload: any = { ...formData };
      if (!payload.expiresAt) delete payload.expiresAt;
      await createAnnouncement(payload);
      setOpenModal(false);
      setFormData({ title: '', content: '', type: 'GENERAL', priority: 'MEDIUM', targetAudience: 'ALL', expiresAt: '' });
      fetchAnnouncements();
    } catch (e: any) { alert(e.response?.data?.message || 'Failed to create'); }
  };

  const handlePublish = async (id: string) => {
    try { await publishAnnouncement(id); fetchAnnouncements(); }
    catch { alert('Failed to publish'); }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this announcement?')) return;
    try { await deleteAnnouncement(id); fetchAnnouncements(); }
    catch { alert('Failed to delete'); }
  };

  return (
    <Box sx={{ p: 4, maxWidth: 1400, mx: 'auto' }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1 }}>
          <CampaignIcon fontSize="large" color="primary" /> Platform Announcements
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenModal(true)}>New Announcement</Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>
      ) : (
        <Grid container spacing={3}>
          {announcements.length === 0 ? (
            <Grid size={{ xs: 12 }}>
              <Paper elevation={0} sx={{ p: 5, border: '1px solid', borderColor: 'divider', borderRadius: 3, textAlign: 'center' }}>
                <CampaignIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                <Typography color="text.secondary">No announcements yet. Create one to communicate with your school users.</Typography>
              </Paper>
            </Grid>
          ) : announcements.map(ann => (
            <Grid key={ann._id} size={{ xs: 12, md: 6 }}>
              <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Stack direction="row" spacing={1}>
                      <Chip size="small" label={ann.type} color={TYPE_COLORS[ann.type] || 'default'} />
                      <Chip size="small" label={ann.priority} color={ann.priority === 'CRITICAL' ? 'error' : ann.priority === 'HIGH' ? 'warning' : 'default'} />
                      <Chip size="small" label={ann.status} color={ann.status === 'PUBLISHED' ? 'success' : 'default'} />
                    </Stack>
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, mt: 1 }}>{ann.title}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
                    {ann.content}
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Audience: {ann.targetAudience}</Typography>
                      <br />
                      <Typography variant="caption" color="text.secondary">Created: {dayjs(ann.createdAt).format('DD MMM YYYY')}</Typography>
                    </Box>
                    <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
                      {ann.status === 'DRAFT' && (
                        <Button size="small" variant="contained" color="success" startIcon={<PublishIcon />} onClick={() => handlePublish(ann._id)}>Publish</Button>
                      )}
                      <Button size="small" variant="outlined" color="error" onClick={() => handleDelete(ann._id)}>Delete</Button>
                    </Stack>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Create Announcement</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12 }}><TextField fullWidth label="Title *" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} /></Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <FormControl fullWidth><InputLabel>Type</InputLabel>
                <Select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} label="Type">
                  {['MAINTENANCE', 'FEATURE', 'BILLING', 'POLICY', 'OUTAGE', 'GENERAL'].map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <FormControl fullWidth><InputLabel>Priority</InputLabel>
                <Select value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})} label="Priority">
                  {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <FormControl fullWidth><InputLabel>Target Audience</InputLabel>
                <Select value={formData.targetAudience} onChange={e => setFormData({...formData, targetAudience: e.target.value})} label="Target Audience">
                  {['ALL', 'ACTIVE', 'TRIAL', 'ENTERPRISE'].map(a => <MenuItem key={a} value={a}>{a}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12 }}><TextField fullWidth label="Content *" multiline rows={5} value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Expires At (optional)" type="date" value={formData.expiresAt} onChange={e => setFormData({...formData, expiresAt: e.target.value})} slotProps={{ inputLabel: { shrink: true } }} /></Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenModal(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate}>Create</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
