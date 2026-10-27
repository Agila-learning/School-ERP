import React, { useState } from 'react';
import { 
  Box, Typography, Paper, Switch, Divider, Button, 
  List, ListItem, ListItemText, ListItemSecondaryAction, Avatar,
  Snackbar, Alert
} from '@mui/material';
import BackButton from '../../../shared/components/BackButton';
import { useParentContext } from '../context/ParentContext';
import SettingsIcon from '@mui/icons-material/Settings';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import LockIcon from '@mui/icons-material/Lock';
import ColorLensIcon from '@mui/icons-material/ColorLens';

const ParentSettings: React.FC = () => {
  const { selectedChild } = useParentContext();
  
  const [emailNotif, setEmailNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(true);
  const [pushNotif, setPushNotif] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handleSave = () => {
    setShowToast(true);
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <BackButton to="/parent-portal" />
      
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar sx={{ bgcolor: '#3b82f6', width: 56, height: 56 }}>
          <SettingsIcon sx={{ fontSize: 32 }} />
        </Avatar>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#1e293b' }}>Settings & Preferences</Typography>
          <Typography variant="body2" color="text.secondary">
            Manage notifications and account preferences for your parent profile.
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, maxWidth: 800 }}>
        {/* Notifications */}
        <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: '1px solid #e2e8f0' }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
            <NotificationsActiveIcon color="primary" /> Notifications
          </Typography>
          <List disablePadding>
            <ListItem disablePadding sx={{ mb: 2 }}>
              <ListItemText 
                primary={<Typography sx={{ fontWeight: 600 }}>Email Notifications</Typography>}
                secondary="Receive daily attendance and grade reports via email." 
              />
              <ListItemSecondaryAction>
                <Switch edge="end" checked={emailNotif} onChange={(e) => setEmailNotif(e.target.checked)} color="primary" />
              </ListItemSecondaryAction>
            </ListItem>
            <Divider sx={{ my: 1 }} />
            <ListItem disablePadding sx={{ mb: 2, mt: 2 }}>
              <ListItemText 
                primary={<Typography sx={{ fontWeight: 600 }}>SMS Alerts</Typography>}
                secondary="Receive instant SMS for urgent alerts (e.g., bus delays, absences)." 
              />
              <ListItemSecondaryAction>
                <Switch edge="end" checked={smsNotif} onChange={(e) => setSmsNotif(e.target.checked)} color="primary" />
              </ListItemSecondaryAction>
            </ListItem>
            <Divider sx={{ my: 1 }} />
            <ListItem disablePadding sx={{ mt: 2 }}>
              <ListItemText 
                primary={<Typography sx={{ fontWeight: 600 }}>Push Notifications</Typography>}
                secondary="Receive alerts on your mobile device through the app." 
              />
              <ListItemSecondaryAction>
                <Switch edge="end" checked={pushNotif} onChange={(e) => setPushNotif(e.target.checked)} color="primary" />
              </ListItemSecondaryAction>
            </ListItem>
          </List>
        </Paper>

        {/* Security */}
        <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: '1px solid #e2e8f0' }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
            <LockIcon color="primary" /> Security
          </Typography>
          <Button variant="outlined" color="primary" sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}>
            Change Password
          </Button>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Last password change: 3 months ago. We recommend changing your password every 6 months.
          </Typography>
        </Paper>

        {/* Appearance */}
        <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: '1px solid #e2e8f0' }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
            <ColorLensIcon color="primary" /> Appearance
          </Typography>
          <List disablePadding>
            <ListItem disablePadding>
              <ListItemText 
                primary={<Typography sx={{ fontWeight: 600 }}>Dark Mode</Typography>}
                secondary="Toggle dark mode for the parent portal interface." 
              />
              <ListItemSecondaryAction>
                <Switch edge="end" checked={darkMode} onChange={(e) => setDarkMode(e.target.checked)} color="primary" />
              </ListItemSecondaryAction>
            </ListItem>
          </List>
        </Paper>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleSave}
            sx={{ px: 4, py: 1.5, borderRadius: 2, fontWeight: 700, textTransform: 'none', boxShadow: '0 4px 14px 0 rgba(59, 130, 246, 0.39)' }}
          >
            Save Preferences
          </Button>
        </Box>
      </Box>

      <Snackbar open={showToast} autoHideDuration={3000} onClose={() => setShowToast(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={() => setShowToast(false)} severity="success" sx={{ width: '100%', borderRadius: 2 }}>
          Preferences updated successfully!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ParentSettings;
