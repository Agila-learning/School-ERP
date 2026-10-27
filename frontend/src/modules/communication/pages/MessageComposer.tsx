import React, { useState } from 'react';
import { 
  Box, Typography, TextField, Button, Paper, FormControl, 
  InputLabel, Select, MenuItem, Checkbox, ListItemText, OutlinedInput, Alert 
} from '@mui/material';
import api from '../../../core/api/axios';
import { useNavigate } from 'react-router-dom';

const MessageComposer = () => {
  const navigate = useNavigate();
  const [targetType, setTargetType] = useState('ALL');
  const [channels, setChannels] = useState<string[]>(['IN_APP']);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState('NORMAL');
  const [type, setType] = useState('ANNOUNCEMENT');
  const [scheduledFor, setScheduledFor] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const channelOptions = ['IN_APP', 'EMAIL', 'SMS', 'PUSH', 'WHATSAPP'];

  const handleSubmit = async (e: React.FormEvent, status: 'DRAFT' | 'PENDING_APPROVAL' = 'PENDING_APPROVAL') => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload: any = {
        title,
        content,
        type,
        priority,
        channels,
        audienceConfig: { targetType },
        status: scheduledFor ? 'SCHEDULED' : status
      };
      if (scheduledFor) payload.scheduledFor = new Date(scheduledFor).toISOString();

      const res = await api.post('/communication/admin/announcements', payload);
      
      if (res.data.success && res.data.data?._id) {
        if (status === 'PENDING_APPROVAL') {
          await api.post(`/communication/admin/announcements/${res.data.data._id}/approve`, {});
        }
        alert('Message queued for delivery!');
        navigate('/communication/announcements');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: { xs: 2, md: 4 }, minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>Compose Broadcast</Typography>
        <Typography variant="body2" color="text.secondary">Send announcements and notifications across the school.</Typography>
      </Box>
      
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: '1px solid #e2e8f0' }}>
        <form onSubmit={(e) => handleSubmit(e)}>
          
          <FormControl fullWidth size="small" sx={{ mb: 3 }}>
            <InputLabel>Audience</InputLabel>
            <Select value={targetType} label="Audience" onChange={(e) => setTargetType(e.target.value)}>
              <MenuItem value="ALL">Entire Organization</MenuItem>
              <MenuItem value="STUDENTS">All Students</MenuItem>
              <MenuItem value="PARENTS">All Parents</MenuItem>
              <MenuItem value="TEACHERS">All Teachers</MenuItem>
              <MenuItem value="CLASS">Specific Class / Grade</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth size="small" sx={{ mb: 3 }}>
            <InputLabel>Channels</InputLabel>
            <Select
              multiple
              value={channels}
              onChange={(e) => setChannels(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)}
              input={<OutlinedInput label="Channels" />}
              renderValue={(selected) => selected.join(', ')}
            >
              {channelOptions.map((name) => (
                <MenuItem key={name} value={name}>
                  <Checkbox checked={channels.indexOf(name) > -1} />
                  <ListItemText primary={name} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box sx={{ display: 'flex', gap: 3, mb: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Priority</InputLabel>
              <Select value={priority} label="Priority" onChange={(e) => setPriority(e.target.value)}>
                <MenuItem value="LOW">Low</MenuItem>
                <MenuItem value="NORMAL">Normal</MenuItem>
                <MenuItem value="HIGH">High</MenuItem>
                <MenuItem value="URGENT">Urgent</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth size="small">
              <InputLabel>Type</InputLabel>
              <Select value={type} label="Type" onChange={(e) => setType(e.target.value)}>
                <MenuItem value="ANNOUNCEMENT">Announcement</MenuItem>
                <MenuItem value="GENERAL">General</MenuItem>
                <MenuItem value="ACADEMIC">Academic</MenuItem>
                <MenuItem value="FEE">Fee</MenuItem>
                <MenuItem value="HOLIDAY">Holiday</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <TextField 
            fullWidth 
            type="datetime-local"
            label="Schedule For (Leave empty to send now)" 
            size="small"
            value={scheduledFor} 
            onChange={(e) => setScheduledFor(e.target.value)} 
            sx={{ mb: 3 }} 
            slotProps={{ inputLabel: { shrink: true } }}
          />

          <TextField 
            fullWidth 
            label="Message Title / Subject" 
            size="small"
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            sx={{ mb: 3 }} 
            required 
          />

          <TextField 
            fullWidth 
            label="Content (Supports rich text)" 
            multiline 
            rows={6} 
            value={content} 
            onChange={(e) => setContent(e.target.value)} 
            sx={{ mb: 4 }} 
            required 
          />

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button variant="outlined" onClick={(e) => handleSubmit(e, 'DRAFT')} disabled={loading}>Save as Draft</Button>
            <Button variant="contained" color="primary" type="submit" disabled={loading}>{loading ? 'Sending...' : 'Send Broadcast'}</Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default MessageComposer;