import React from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemButton, ListItemText, Grid, Divider } from '@mui/material';
import { useLocation, useNavigate, Routes, Route, Navigate } from 'react-router-dom';

import SchoolProfileSettings from './settings/SchoolProfileSettings';
import AttendanceSettings from './settings/AttendanceSettings';
import FeeSettings from './settings/FeeSettings';
import { 
  Settings as GeneralIcon, 
  AccessTime as AttendanceIcon,
  Payment as FeeIcon,
  Security as SecurityIcon 
} from '@mui/icons-material';

const AdminSettingsShell: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { title: 'General Preferences', path: '/admin/settings/general', icon: <GeneralIcon fontSize="small" /> },
    { title: 'Attendance Rules', path: '/admin/settings/attendance', icon: <AttendanceIcon fontSize="small" /> },
    { title: 'Fee Configuration', path: '/admin/settings/fees', icon: <FeeIcon fontSize="small" /> },
    { title: 'Roles & Permissions', path: '/admin/settings/roles', icon: <SecurityIcon fontSize="small" /> },
  ];

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" sx={{ fontWeight: 800 }} gutterBottom>
        System Settings
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Configure the global ERP behavior and access control policies.
      </Typography>

      <Grid container spacing={4}>
        {/* Settings Navigation Sidebar */}
        <Grid item xs={12} md={3}>
          <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, overflow: 'hidden' }}>
            <List disablePadding>
              {menuItems.map((item, index) => {
                const isActive = location.pathname.startsWith(item.path);
                return (
                  <React.Fragment key={item.title}>
                    <ListItem disablePadding>
                      <ListItemButton 
                        selected={isActive}
                        onClick={() => navigate(item.path)}
                        sx={{
                          py: 2,
                          px: 3,
                          '&.Mui-selected': {
                            bgcolor: 'primary.50',
                            borderLeft: '4px solid',
                            borderColor: 'primary.main',
                          }
                        }}
                      >
                        <Box sx={{ mr: 2, color: isActive ? 'primary.main' : 'text.secondary', display: 'flex' }}>
                          {item.icon}
                        </Box>
                        <ListItemText 
                          primary={
                            <Typography sx={{ 
                              fontWeight: isActive ? 600 : 500,
                              color: isActive ? 'primary.main' : 'text.primary'
                            }}>
                              {item.title}
                            </Typography>
                          } 
                        />
                      </ListItemButton>
                    </ListItem>
                    {index < menuItems.length - 1 && <Divider />}
                  </React.Fragment>
                );
              })}
            </List>
          </Paper>
        </Grid>

        {/* Settings Content Area */}
        <Grid item xs={12} md={9}>
          <Paper elevation={0} sx={{ p: 4, border: '1px solid', borderColor: 'divider', borderRadius: 3, minHeight: 500 }}>
            <Routes>
              <Route path="/" element={<Navigate to="general" replace />} />
              <Route path="general" element={<SchoolProfileSettings />} />
              <Route path="attendance" element={<AttendanceSettings />} />
              <Route path="fees" element={<FeeSettings />} />
              <Route path="roles" element={<Typography>Roles & Permissions Configuration Placeholder</Typography>} />
            </Routes>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminSettingsShell;
