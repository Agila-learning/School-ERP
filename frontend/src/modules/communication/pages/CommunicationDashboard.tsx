import { useState, useEffect } from 'react';
import { Typography, Grid, Paper, Box, CircularProgress, Card, CardContent } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import DraftsIcon from '@mui/icons-material/Drafts';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import ErrorOutlinedIcon from '@mui/icons-material/ErrorOutlined';
import MailIcon from '@mui/icons-material/Mail';
import api from '../../../core/api/axios';

interface AnnouncementItem {
  _id: string;
  title: string;
  targetAudience?: string;
  channels?: string[];
  status?: string;
  createdAt?: string;
}

const CommunicationDashboard = () => {
  const [stats, setStats] = useState({
    totalSent: 0,
    delivered: 0,
    read: 0,
    failed: 0,
    pendingApproval: 0
  });
  const [recentAnnouncements, setRecentAnnouncements] = useState<AnnouncementItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/communication/announcements');
        const items: AnnouncementItem[] = Array.isArray(res.data?.data) ? res.data.data : [];
        
        const total = items.length;
        const pending = items.filter(i => i.status === 'PENDING_APPROVAL' || i.status === 'DRAFT').length;
        const sent = items.filter(i => i.status === 'PUBLISHED' || i.status === 'SENT').length;

        setStats({
          totalSent: sent || total,
          delivered: sent || total,
          read: 0,
          failed: 0,
          pendingApproval: pending
        });
        setRecentAnnouncements(items.slice(0, 5));
      } catch (err) {
        setStats({
          totalSent: 0,
          delivered: 0,
          read: 0,
          failed: 0,
          pendingApproval: 0
        });
        setRecentAnnouncements([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /></Box>;
  }

  const statCards = [
    { title: 'Total Sent', value: stats.totalSent, icon: <SendIcon color="primary" />, color: '#e3f2fd' },
    { title: 'Delivered', value: stats.delivered, icon: <DoneAllIcon color="success" />, color: '#e8f5e9' },
    { title: 'Read', value: stats.read, icon: <MailIcon color="info" />, color: '#e1f5fe' },
    { title: 'Failed', value: stats.failed, icon: <ErrorOutlinedIcon color="error" />, color: '#ffebee' },
    { title: 'Pending Approval', value: stats.pendingApproval, icon: <DraftsIcon color="warning" />, color: '#fff8e1' },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 3 }}>Communication Dashboard</Typography>
      
      <Grid container spacing={3}>
        {statCards.map((card, idx) => (
          <Grid size={{ xs: 12, sm: 6, md: 2.4 }} key={idx}>
            <Card sx={{ bgcolor: card.color, borderRadius: 3, boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {card.icon}
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 800 }}>{card.value}</Typography>
                  <Typography variant="body2" color="textSecondary">{card.title}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      <Box sx={{ mt: 4 }}>
        <Paper sx={{ p: 3, borderRadius: 3, boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }} gutterBottom>Recent Announcements & Circulars</Typography>
          {recentAnnouncements.length === 0 ? (
            <Box sx={{ py: 4, textAlign: 'center' }}>
              <Typography variant="body1" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                No recent communication broadcasts
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
                Create a new announcement or circular to notify parents and staff.
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 1 }}>
              {recentAnnouncements.map((item) => (
                <Box key={item._id} sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{item.title}</Typography>
                    <Typography variant="caption" color="textSecondary">
                      Audience: {item.targetAudience || 'All'} • {item.channels?.join(', ') || 'In-App'}
                    </Typography>
                  </Box>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: '#0284c7' }}>
                    {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Recent'}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}
        </Paper>
      </Box>
    </Box>
  );
};

export default CommunicationDashboard;
