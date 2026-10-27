import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Paper, CircularProgress, Alert, Button, Card, CardContent } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { getHostelDashboardStats } from '../api/hostel.api';
import {
  Domain as DomainIcon,
  MeetingRoom as RoomIcon,
  Hotel as BedIcon,
  Assignment as AllocIcon,
  Build as BuildIcon,
  EventNote as EventNoteIcon,
  Restaurant as MessIcon,
  ReportProblem as AlertIcon,
  ArrowForward as ArrowIcon
} from '@mui/icons-material';

const StatCard = ({ title, value, subtitle, icon, color }: any) => (
  <Paper sx={{ p: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderLeft: `5px solid ${color}`, borderRadius: 2, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
    <Box>
      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>{title}</Typography>
      <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, color: '#1e293b' }}>{value}</Typography>
      {subtitle && <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5, display: 'block' }}>{subtitle}</Typography>}
    </Box>
    <Box sx={{ p: 1.5, borderRadius: '50%', backgroundColor: `${color}15`, color: color, display: 'flex' }}>
      {icon}
    </Box>
  </Paper>
);

const HostelDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const data = await getHostelDashboardStats();
      setStats(data);
    } catch (e: any) {
      console.error(e);
      setError('Failed to fetch dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Box sx={{ p: 6, display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>;

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <div>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a' }}>Hostel Management Dashboard</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            Overview of hostel buildings, room allocations, student outpasses, and mess operations
          </Typography>
        </div>
        <Button variant="outlined" onClick={fetchStats} sx={{ textTransform: 'none', fontWeight: 600 }}>
          Refresh Data
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>{error}</Alert>}

      {/* KPI Stats */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard 
            title="Total Hostels & Bldgs" 
            value={`${stats?.hostels || 0} Hostels`} 
            subtitle={`${stats?.buildings || 0} Buildings`}
            icon={<DomainIcon fontSize="medium" />} 
            color="#4f46e5" 
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard 
            title="Total Rooms" 
            value={stats?.rooms ?? stats?.totalRooms ?? 0} 
            subtitle="Configured rooms"
            icon={<RoomIcon fontSize="medium" />} 
            color="#0284c7" 
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard 
            title="Bed Capacity" 
            value={stats?.beds || 0} 
            subtitle={`${stats?.occupied || 0} Occupied (${stats?.occupancyPct || 0}%)`}
            icon={<BedIcon fontSize="medium" />} 
            color="#059669" 
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard 
            title="Available Beds" 
            value={stats?.available || 0} 
            subtitle={`${stats?.maintenance || 0} In Maintenance`}
            icon={<BedIcon fontSize="medium" />} 
            color="#10b981" 
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard 
            title="Pending Applications" 
            value={stats?.pendingApplications || 0} 
            subtitle="Bed allotment queue"
            icon={<AllocIcon fontSize="medium" />} 
            color="#d97706" 
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard 
            title="Active Outpasses" 
            value={stats?.activeOutpasses || 0} 
            subtitle="Students outside hostel"
            icon={<EventNoteIcon fontSize="medium" />} 
            color="#8b5cf6" 
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard 
            title="Open Incidents & Complaints" 
            value={stats?.openComplaints || 0} 
            subtitle="Requires resolution"
            icon={<AlertIcon fontSize="medium" />} 
            color="#ef4444" 
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard 
            title="Mess Meal Plans" 
            value="Active" 
            subtitle="Menu & Daily Feedbacks"
            icon={<MessIcon fontSize="medium" />} 
            color="#ec4899" 
          />
        </Grid>
      </Grid>

      {/* Quick Action Navigation Modules */}
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#1e293b' }}>Hostel Management Modules</Typography>
      <Grid container spacing={2.5}>
        {[
          {
            title: 'Hostel Structure & Rooms',
            desc: 'Manage hostels, buildings, floors, rooms, and bed configurations.',
            icon: <DomainIcon sx={{ fontSize: 32, color: '#4f46e5' }} />,
            path: '/hostel/rooms',
            btnText: 'Manage Structure',
            color: '#4f46e5'
          },
          {
            title: 'Bed Allocations & Check-In',
            desc: 'Allocate student beds, handle check-in, room transfers, and vacating.',
            icon: <AllocIcon sx={{ fontSize: 32, color: '#059669' }} />,
            path: '/hostel/allocation',
            btnText: 'Manage Allocations',
            color: '#059669'
          },
          {
            title: 'Outpass & Movement Tracker',
            desc: 'Issue, track, approve student gate passes, curfew exits, and returns.',
            icon: <EventNoteIcon sx={{ fontSize: 32, color: '#8b5cf6' }} />,
            path: '/hostel/outpass',
            btnText: 'Manage Outpasses',
            color: '#8b5cf6'
          },
          {
            title: 'Hostel Mess & Meal Plans',
            desc: 'Plan daily menus, record meal logs, and review student meal feedback.',
            icon: <MessIcon sx={{ fontSize: 32, color: '#ec4899' }} />,
            path: '/hostel/mess',
            btnText: 'Manage Mess',
            color: '#ec4899'
          },
          {
            title: 'Complaints & Emergency Incidents',
            desc: 'Track maintenance requests, room repairs, and emergency incidents.',
            icon: <AlertIcon sx={{ fontSize: 32, color: '#ef4444' }} />,
            path: '/hostel/complaints',
            btnText: 'View Complaints',
            color: '#ef4444'
          }
        ].map((item, idx) => (
          <Grid key={idx} size={{ xs: 12, sm: 6, md: 4 }}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderRadius: 2.5, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', transition: 'all 0.2s', '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' } }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ mb: 2 }}>{item.icon}</Box>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: '#0f172a' }}>{item.title}</Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>{item.desc}</Typography>
              </CardContent>
              <Box sx={{ p: 2, pt: 0, borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end' }}>
                <Button 
                  endIcon={<ArrowIcon />} 
                  onClick={() => navigate(item.path)}
                  sx={{ textTransform: 'none', fontWeight: 700, color: item.color }}
                >
                  {item.btnText}
                </Button>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default HostelDashboard;
