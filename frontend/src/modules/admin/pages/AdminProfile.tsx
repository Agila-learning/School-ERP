import React from 'react';
import { Box, Typography, Paper, Grid, Avatar, Divider, Button, List, ListItem, ListItemText } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SecurityIcon from '@mui/icons-material/Security';
import { useAuth } from '../../auth/hooks/useAuth';

const AdminProfile: React.FC = () => {
  const { user, roleNames, currentBranch } = useAuth();

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1000, mx: 'auto' }}>
      <Typography variant="h4" sx={{ fontWeight: 800 }} gutterBottom>
        My Profile
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Manage your personal information and security settings.
      </Typography>

      <Grid container spacing={4}>
        {/* Left Column - Profile Card */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper elevation={0} sx={{ p: 4, textAlign: 'center', border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
            <Avatar 
              sx={{ width: 120, height: 120, mx: 'auto', mb: 2, fontSize: '3rem', bgcolor: 'primary.main' }}
            >
              {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
            </Avatar>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              {user?.firstName} {user?.lastName}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {roleNames.join(', ')}
            </Typography>
            <Button variant="outlined" startIcon={<EditIcon />} sx={{ mt: 3 }} size="small">
              Edit Avatar
            </Button>
          </Paper>
        </Grid>

        {/* Right Column - Details */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper elevation={0} sx={{ p: 4, border: '1px solid', borderColor: 'divider', borderRadius: 3, mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Personal Information</Typography>
              <Button size="small">Edit</Button>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" color="text.secondary">First Name</Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>{user?.firstName}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" color="text.secondary">Last Name</Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>{user?.lastName}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" color="text.secondary">Email Address</Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>{user?.email}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" color="text.secondary">Primary Branch</Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>{currentBranch.name}</Typography>
              </Grid>
            </Grid>
          </Paper>

          <Paper elevation={0} sx={{ p: 4, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
              <SecurityIcon color="action" />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Security Settings</Typography>
            </Box>
            <Divider sx={{ mb: 0 }} />
            <List disablePadding>
              <ListItem sx={{ px: 0, py: 2 }}>
                <ListItemText 
                  primary={<Typography sx={{ fontWeight: 600 }}>Password</Typography>} 
                  secondary="Change your account password" 
                />
                <Button variant="outlined" size="small">Update</Button>
              </ListItem>
              <Divider />
              <ListItem sx={{ px: 0, py: 2 }}>
                <ListItemText 
                  primary={<Typography sx={{ fontWeight: 600 }}>Two-Factor Authentication</Typography>} 
                  secondary="Add an extra layer of security" 
                />
                <Button variant="contained" size="small" disableElevation>Enable</Button>
              </ListItem>
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminProfile;
