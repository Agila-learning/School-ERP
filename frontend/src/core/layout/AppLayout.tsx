import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Toolbar } from '@mui/material';
import Header from './Header';
import Sidebar from './Sidebar';
import AIChatbot from '../components/AIChatbot';
import RoleChatWidget from '../components/RoleChatWidget';
import RealtimeNotificationToaster from '../components/RealtimeNotificationToaster';
import { FrozenAccountOverlay } from '../components/FrozenAccountOverlay';

const drawerWidth = 260;

const AppLayout: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Header
        handleDrawerToggle={handleDrawerToggle}
        drawerWidth={drawerWidth}
      />

      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        <Sidebar
          mobileOpen={mobileOpen}
          handleDrawerToggle={handleDrawerToggle}
          drawerWidth={drawerWidth}
        />
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 1.5, sm: 2.5, md: 3 },
          pb: { xs: 8, md: 12 },
          width: { xs: '100%', md: `calc(100% - ${drawerWidth}px)` },
          maxWidth: '100vw',
          overflowX: 'hidden',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box'
        }}
      >
        {/* MUI Toolbar spacer — auto-sizes to exact AppBar height */}
        <Toolbar />
        {/* Child routes render here */}
        <Outlet />
      </Box>

      <RealtimeNotificationToaster />
      <RoleChatWidget />
      <AIChatbot />
      <FrozenAccountOverlay />
    </Box>
  );
};

export default AppLayout;
