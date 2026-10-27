import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Paper, Tabs, Tab, FormControl, InputLabel, Select, MenuItem, OutlinedInput, Checkbox, ListItemText, CircularProgress } from '@mui/material';
import api from '../../../core/api/axios';
import { useNavigate } from 'react-router-dom';

interface MessageState {
  title: string;
  content: string;
}

const PrincipalAnnouncer: React.FC = () => {
  const navigate = useNavigate();
  const [tabIndex, setTabIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  
  const [staffMsg, setStaffMsg] = useState<MessageState>({ title: '', content: '' });
  const [studentMsg, setStudentMsg] = useState<MessageState>({ title: '', content: '' });
  const [parentMsg, setParentMsg] = useState<MessageState>({ title: '', content: '' });

  const [channels, setChannels] = useState<string[]>(['IN_APP', 'EMAIL']);
  const [priority, setPriority] = useState('HIGH');
  const channelOptions = ['IN_APP', 'EMAIL', 'SMS', 'PUSH', 'WHATSAPP'];

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

  const handleBroadcast = async () => {
    if (!staffMsg.title && !studentMsg.title && !parentMsg.title) {
      alert("Please enter a message for at least one audience.");
      return;
    }
    
    setLoading(true);
    
    const sendAnnouncement = async (msg: MessageState, targetType: string) => {
      if (!msg.title || !msg.content) return null;
      
      const payload = {
        title: msg.title,
        content: msg.content,
        type: 'ANNOUNCEMENT',
        priority,
        channels,
        audienceConfig: { targetType },
        status: 'PENDING_APPROVAL'
      };

      try {
        const res = await api.post('/communication/admin/announcements', payload);
        if (res.data?.data?._id) {
          // Auto-approve since this is the Principal Announcer
          await api.post(`/communication/admin/announcements/${res.data.data._id}/approve`);
        }
        return true;
      } catch (err) {
        console.error(`Failed to send to ${targetType}`, err);
        return false;
      }
    };

    const results = await Promise.all([
      sendAnnouncement(staffMsg, 'TEACHERS'),
      sendAnnouncement(studentMsg, 'STUDENTS'),
      sendAnnouncement(parentMsg, 'PARENTS')
    ]);

    setLoading(false);
    
    if (results.some(r => r === false)) {
      alert("Some messages failed to send. Please check the logs.");
    } else {
      alert("Multicast Announcement successfully broadcasted!");
      navigate('/admin/dashboard');
    }
  };

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', p: { xs: 2, md: 4 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>Principal's Announcer</Typography>
          <Typography color="text.secondary">Broadcast customized messages to Staff, Students, and Parents simultaneously.</Typography>
        </Box>
        <Button 
          variant="contained" 
          size="large" 
          color="error" 
          onClick={handleBroadcast} 
          disabled={loading}
          sx={{ fontWeight: 700, px: 4, py: 1.5, borderRadius: 2 }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : 'BROADCAST ALL'}
        </Button>
      </Box>

      <Paper sx={{ mb: 4, p: 3, borderRadius: 3, bgcolor: 'grey.50' }} elevation={0} variant="outlined">
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>Delivery Settings (Applies to all)</Typography>
        <Box sx={{ display: 'flex', gap: 3, mt: 2 }}>
          <FormControl sx={{ flex: 2 }}>
            <InputLabel>Delivery Channels</InputLabel>
            <Select
              multiple
              value={channels}
              onChange={(e) => setChannels(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)}
              input={<OutlinedInput label="Delivery Channels" />}
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
          <FormControl sx={{ flex: 1 }}>
            <InputLabel>Priority</InputLabel>
            <Select value={priority} label="Priority" onChange={(e) => setPriority(e.target.value)}>
              <MenuItem value="NORMAL">Normal</MenuItem>
              <MenuItem value="HIGH">High</MenuItem>
              <MenuItem value="URGENT">Urgent (Overrides DND)</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      <Paper sx={{ borderRadius: 3, overflow: 'hidden' }} elevation={2}>
        <Tabs 
          value={tabIndex} 
          onChange={handleTabChange} 
          variant="fullWidth" 
          sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'primary.main', '& .MuiTab-root': { color: 'rgba(255,255,255,0.7)', fontWeight: 600 }, '& .Mui-selected': { color: '#fff !important' }, '& .MuiTabs-indicator': { backgroundColor: '#fff', height: 3 } }}
        >
          <Tab label="Staff Message" />
          <Tab label="Student Message" />
          <Tab label="Parent Message" />
        </Tabs>
        
        <Box sx={{ p: 4 }}>
          {tabIndex === 0 && (
            <MessageEditor 
              title="Message to Staff & Teachers" 
              state={staffMsg} 
              setState={setStaffMsg} 
              placeholder="e.g., Dear Staff, please ensure all grades are finalized before the upcoming festival..." 
            />
          )}
          {tabIndex === 1 && (
            <MessageEditor 
              title="Message to Students" 
              state={studentMsg} 
              setState={setStudentMsg} 
              placeholder="e.g., Dear Students, the cultural festival is approaching! Get ready for..." 
            />
          )}
          {tabIndex === 2 && (
            <MessageEditor 
              title="Message to Parents" 
              state={parentMsg} 
              setState={setParentMsg} 
              placeholder="e.g., Dear Parents, we cordially invite you to our annual cultural festival..." 
            />
          )}
        </Box>
      </Paper>
    </Box>
  );
};

const MessageEditor = ({ title, state, setState, placeholder }: { title: string, state: MessageState, setState: (s: MessageState) => void, placeholder: string }) => (
  <Box>
    <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>{title}</Typography>
    <TextField 
      fullWidth 
      label="Subject line" 
      variant="outlined" 
      sx={{ mb: 3 }} 
      value={state.title}
      onChange={e => setState({ ...state, title: e.target.value })}
      placeholder="Enter subject..."
    />
    <TextField 
      fullWidth 
      label="Message Body" 
      multiline 
      rows={10} 
      variant="outlined" 
      value={state.content}
      onChange={e => setState({ ...state, content: e.target.value })}
      placeholder={placeholder}
    />
  </Box>
);

export default PrincipalAnnouncer;
