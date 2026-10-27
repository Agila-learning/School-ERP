import React, { useState, useEffect } from 'react';
import { 
  Badge, IconButton, Popover, Box, Typography, List, ListItem, 
  ListItemText, ListItemAvatar, Avatar, Divider, Button, CircularProgress 
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CampaignIcon from '@mui/icons-material/Campaign';
import PaymentIcon from '@mui/icons-material/Payment';
import AssignmentIcon from '@mui/icons-material/Assignment';
import EventIcon from '@mui/icons-material/Event';
import api from '../api/axios';
import { useAuth } from '../../modules/auth/hooks/useAuth';
import { io, Socket } from 'socket.io-client';

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: string;
  readStatus: boolean;
  createdAt: string;
}

export default function NotificationCenter() {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      
      // Initialize Socket.io
      const token = localStorage.getItem('token');
      const newSocket = io(import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:5001', {
        auth: { token }
      });

      newSocket.on('connect', () => {
        console.log('Connected to real-time notification service');
      });

      newSocket.on('new_notification', (data: Notification) => {
        setNotifications(prev => [data, ...prev]);
        setUnreadCount(prev => prev + 1);
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      // Fallback to Communication API if our global one isn't wired fully
      const res = await api.get('/communication/notifications').catch(() => null);
      if (res?.data?.data) {
        // Adapt the structure if it's coming from CommunicationDelivery
        const payload = res.data.data;
        if (payload.notifications) {
          // New generic format
          setNotifications(payload.notifications);
          setUnreadCount(payload.unreadCount || 0);
        } else if (Array.isArray(payload)) {
          // Old format
          setNotifications(payload as any);
          setUnreadCount(payload.filter((n: any) => !n.readStatus && n.status !== 'READ').length);
        }
      }
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
    if (unreadCount > 0) {
      markAllAsRead();
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const markAllAsRead = async () => {
    try {
      await api.patch('/communication/notifications/read-all').catch(() => null);
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, readStatus: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'FEE': return <PaymentIcon color="error" />;
      case 'ASSIGNMENT': return <AssignmentIcon color="primary" />;
      case 'EXAM': return <EventIcon color="secondary" />;
      default: return <CampaignIcon color="info" />;
    }
  };

  const open = Boolean(anchorEl);
  const id = open ? 'notification-popover' : undefined;

  return (
    <>
      <IconButton color="inherit" onClick={handleOpen}>
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: { width: 360, maxHeight: 500, mt: 1.5, borderRadius: 2, boxShadow: 4 }
        }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'grey.50', borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Notifications</Typography>
          {unreadCount > 0 && (
            <Button size="small" onClick={markAllAsRead}>Mark all as read</Button>
          )}
        </Box>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress size={30} />
          </Box>
        ) : notifications.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <NotificationsIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
            <Typography color="text.secondary">No notifications yet</Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {notifications.map((notif, index) => (
              <React.Fragment key={notif._id}>
                <ListItem 
                  alignItems="flex-start" 
                  sx={{ 
                    bgcolor: notif.readStatus || (notif as any).status === 'READ' ? 'transparent' : 'primary.50',
                    transition: 'background-color 0.3s'
                  }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'background.paper', boxShadow: 1 }}>
                      {getIcon(notif.type || (notif as any).communicationId?.type)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={<Typography variant="subtitle2" sx={{ fontWeight: notif.readStatus ? 500 : 700 }}>{notif.title || (notif as any).communicationId?.title}</Typography>}
                    secondary={
                      <React.Fragment>
                        <Typography variant="body2" color="text.primary" sx={{ display: 'block', mb: 0.5 }}>
                          {notif.message || (notif as any).communicationId?.content}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(notif.createdAt).toLocaleString()}
                        </Typography>
                      </React.Fragment>
                    }
                  />
                </ListItem>
                {index < notifications.length - 1 && <Divider component="li" />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Popover>
    </>
  );
}
