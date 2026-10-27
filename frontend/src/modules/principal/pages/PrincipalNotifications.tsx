import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, Avatar, List, ListItem, ListItemAvatar, ListItemText, Divider
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
import EventIcon from '@mui/icons-material/Event';
import api from '../../../core/api/axios';

export default function PrincipalNotifications() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await api.get('/principal/notifications');
        if (response.data?.data) {
          setNotifications(response.data.data);
        }
      } catch (err) {
        console.error('Failed to load notifications', err);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'warning': return <WarningIcon color="warning" />;
      case 'info': return <InfoIcon color="info" />;
      case 'event': return <EventIcon color="primary" />;
      default: return <NotificationsIcon />;
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <NotificationsIcon sx={{ fontSize: 40, color: 'primary.main' }} />
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Notifications</Typography>
      </Box>

      <Card elevation={2} sx={{ borderRadius: 2 }}>
        {loading ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography>Loading notifications...</Typography>
          </Box>
        ) : notifications.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">No new notifications.</Typography>
          </Box>
        ) : (
          <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
            {notifications.map((notif, index) => (
              <React.Fragment key={notif.id}>
                <ListItem alignItems="flex-start" sx={{ py: 2 }}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'transparent' }}>
                      {getIcon(notif.type)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={<Typography sx={{ fontWeight: 'bold' }}>{notif.title}</Typography>}
                    secondary={
                      <React.Fragment>
                        <Typography
                          component="span"
                          variant="body2"
                          color="text.primary"
                          sx={{ display: 'block', mt: 0.5 }}
                        >
                          {notif.message}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                          {new Date(notif.date).toLocaleString()}
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
      </Card>
    </Box>
  );
}
