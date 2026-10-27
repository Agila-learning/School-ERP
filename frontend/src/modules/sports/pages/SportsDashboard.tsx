import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  CircularProgress,
  Snackbar,
  Alert,
  Tooltip,
  InputAdornment,
  LinearProgress
} from '@mui/material';
import {
  EmojiEvents as EmojiEventsIcon,
  SportsSoccer as SportsSoccerIcon,
  SportsCricket as SportsCricketIcon,
  SportsBasketball as SportsBasketballIcon,
  FitnessCenter as FitnessCenterIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Group as GroupIcon,
  CalendarMonth as CalendarMonthIcon,
  Inventory as InventoryIcon,
  CheckCircle as CheckCircleIcon,
  Place as PlaceIcon
} from '@mui/icons-material';
import {
  getSportsDashboardStats,
  getSportsTeams,
  createSportsTeam,
  updateSportsTeam,
  deleteSportsTeam,
  getSportsEvents,
  createSportsEvent,
  updateSportsEvent,
  deleteSportsEvent,
  getSportsEquipment,
  createSportsEquipment,
  updateSportsEquipment,
  deleteSportsEquipment,
  getPracticeSessions,
  createPracticeSession,
  updatePracticeSession,
  deletePracticeSession
} from '../api/sports.api';

const SPORT_TYPES = [
  'FOOTBALL',
  'CRICKET',
  'BASKETBALL',
  'BADMINTON',
  'ATHLETICS',
  'VOLLEYBALL',
  'SWIMMING',
  'CHESS',
  'TABLE_TENNIS',
  'TENNIS',
  'OTHER'
];

const EVENT_TYPES = ['INTER_SCHOOL', 'INTRA_SCHOOL', 'ANNUAL_SPORTS_DAY', 'FRIENDLY', 'DISTRICT_STATE'];
const EVENT_STATUSES = ['UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED'];
const EQ_CONDITIONS = ['EXCELLENT', 'GOOD', 'FAIR', 'DAMAGED'];
const EQ_STATUSES = ['AVAILABLE', 'IN_USE', 'UNDER_MAINTENANCE', 'DISPOSED'];
const SESSION_STATUSES = ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

export const SportsDashboard: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const getTabFromPath = (path: string) => {
    if (path.includes('/events')) return 1;
    if (path.includes('/equipment')) return 2;
    if (path.includes('/sessions')) return 3;
    return 0; // /sports/teams or /sports/dashboard
  };

  const [activeTab, setActiveTab] = useState(() => getTabFromPath(location.pathname));

  useEffect(() => {
    const targetTab = getTabFromPath(location.pathname);
    if (targetTab !== activeTab) {
      setActiveTab(targetTab);
    }
  }, [location.pathname]);

  const handleTabChange = (_: any, val: number) => {
    setActiveTab(val);
    setSearchQuery('');
    if (val === 0) navigate('/sports/teams');
    else if (val === 1) navigate('/sports/events');
    else if (val === 2) navigate('/sports/equipment');
    else if (val === 3) navigate('/sports/sessions');
  };

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [teams, setTeams] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [equipment, setEquipment] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Toast feedback
  const [toast, setToast] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  });

  // Modals
  const [teamModal, setTeamModal] = useState<{ open: boolean; isEdit: boolean; data: any }>({
    open: false,
    isEdit: false,
    data: {}
  });

  const [eventModal, setEventModal] = useState<{ open: boolean; isEdit: boolean; data: any }>({
    open: false,
    isEdit: false,
    data: {}
  });

  const [eqModal, setEqModal] = useState<{ open: boolean; isEdit: boolean; data: any }>({
    open: false,
    isEdit: false,
    data: {}
  });

  const [sessionModal, setSessionModal] = useState<{ open: boolean; isEdit: boolean; data: any }>({
    open: false,
    isEdit: false,
    data: {}
  });

  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    type: 'TEAM' | 'EVENT' | 'EQUIPMENT' | 'SESSION';
    id: string;
    title: string;
  }>({
    open: false,
    type: 'TEAM',
    id: '',
    title: ''
  });

  const [submitting, setSubmitting] = useState(false);

  // Load All Data
  const loadData = async () => {
    try {
      setLoading(true);
      const [statsData, teamsData, eventsData, eqData, sessionsData] = await Promise.all([
        getSportsDashboardStats().catch(() => null),
        getSportsTeams().catch(() => []),
        getSportsEvents().catch(() => []),
        getSportsEquipment().catch(() => []),
        getPracticeSessions().catch(() => [])
      ]);

      setStats(statsData);
      setTeams(teamsData);
      setEvents(eventsData);
      setEquipment(eqData);
      setSessions(sessionsData);
    } catch (err: any) {
      setToast({ open: true, message: 'Failed to load sports data', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered lists
  const filteredTeams = useMemo(() => {
    return teams.filter(
      (t) =>
        t.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.sportType?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.coachName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.captainName?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [teams, searchQuery]);

  const filteredEvents = useMemo(() => {
    return events.filter(
      (e) =>
        e.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.sportType?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.venue?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [events, searchQuery]);

  const filteredEquipment = useMemo(() => {
    return equipment.filter(
      (eq) =>
        eq.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        eq.itemCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        eq.sportCategory?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [equipment, searchQuery]);

  const filteredSessions = useMemo(() => {
    return sessions.filter(
      (s) =>
        s.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.sportType?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.teamName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.coachName?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [sessions, searchQuery]);

  // Handle Team Submit
  const handleTeamSubmit = async () => {
    try {
      setSubmitting(true);
      if (teamModal.isEdit) {
        const updated = await updateSportsTeam(teamModal.data._id, teamModal.data);
        setTeams((prev) => prev.map((t) => (t._id === updated._id ? updated : t)));
        setToast({ open: true, message: 'Sports team updated successfully', severity: 'success' });
      } else {
        const created = await createSportsTeam(teamModal.data);
        setTeams((prev) => [created, ...prev]);
        setToast({ open: true, message: 'Sports team registered successfully', severity: 'success' });
      }
      setTeamModal({ open: false, isEdit: false, data: {} });
      getSportsDashboardStats().then(setStats).catch(() => {});
    } catch (err: any) {
      setToast({
        open: true,
        message: err.response?.data?.message || 'Failed to save team',
        severity: 'error'
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Event Submit
  const handleEventSubmit = async () => {
    try {
      setSubmitting(true);
      if (eventModal.isEdit) {
        const updated = await updateSportsEvent(eventModal.data._id, eventModal.data);
        setEvents((prev) => prev.map((e) => (e._id === updated._id ? updated : e)));
        setToast({ open: true, message: 'Tournament event updated successfully', severity: 'success' });
      } else {
        const created = await createSportsEvent(eventModal.data);
        setEvents((prev) => [created, ...prev]);
        setToast({ open: true, message: 'Tournament event scheduled successfully', severity: 'success' });
      }
      setEventModal({ open: false, isEdit: false, data: {} });
      getSportsDashboardStats().then(setStats).catch(() => {});
    } catch (err: any) {
      setToast({
        open: true,
        message: err.response?.data?.message || 'Failed to save event',
        severity: 'error'
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Equipment Submit
  const handleEquipmentSubmit = async () => {
    try {
      setSubmitting(true);
      if (eqModal.isEdit) {
        const updated = await updateSportsEquipment(eqModal.data._id, eqModal.data);
        setEquipment((prev) => prev.map((e) => (e._id === updated._id ? updated : e)));
        setToast({ open: true, message: 'Sports gear inventory updated', severity: 'success' });
      } else {
        const created = await createSportsEquipment(eqModal.data);
        setEquipment((prev) => [created, ...prev]);
        setToast({ open: true, message: 'Sports equipment added to inventory', severity: 'success' });
      }
      setEqModal({ open: false, isEdit: false, data: {} });
      getSportsDashboardStats().then(setStats).catch(() => {});
    } catch (err: any) {
      setToast({
        open: true,
        message: err.response?.data?.message || 'Failed to save equipment',
        severity: 'error'
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Session Submit
  const handleSessionSubmit = async () => {
    try {
      setSubmitting(true);
      const selectedTeam = teams.find((t) => t._id === sessionModal.data.teamId);
      const payload = {
        ...sessionModal.data,
        teamName: selectedTeam ? selectedTeam.name : sessionModal.data.teamName
      };

      if (sessionModal.isEdit) {
        const updated = await updatePracticeSession(sessionModal.data._id, payload);
        setSessions((prev) => prev.map((s) => (s._id === updated._id ? updated : s)));
        setToast({ open: true, message: 'Practice session updated', severity: 'success' });
      } else {
        const created = await createPracticeSession(payload);
        setSessions((prev) => [created, ...prev]);
        setToast({ open: true, message: 'Practice session scheduled successfully', severity: 'success' });
      }
      setSessionModal({ open: false, isEdit: false, data: {} });
      getSportsDashboardStats().then(setStats).catch(() => {});
    } catch (err: any) {
      setToast({
        open: true,
        message: err.response?.data?.message || 'Failed to save session',
        severity: 'error'
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Delete Confirmation
  const handleDeleteConfirm = async () => {
    try {
      setSubmitting(true);
      if (deleteDialog.type === 'TEAM') {
        await deleteSportsTeam(deleteDialog.id);
        setTeams((prev) => prev.filter((t) => t._id !== deleteDialog.id));
        setToast({ open: true, message: 'Team deleted successfully', severity: 'success' });
      } else if (deleteDialog.type === 'EVENT') {
        await deleteSportsEvent(deleteDialog.id);
        setEvents((prev) => prev.filter((e) => e._id !== deleteDialog.id));
        setToast({ open: true, message: 'Event removed successfully', severity: 'success' });
      } else if (deleteDialog.type === 'EQUIPMENT') {
        await deleteSportsEquipment(deleteDialog.id);
        setEquipment((prev) => prev.filter((e) => e._id !== deleteDialog.id));
        setToast({ open: true, message: 'Equipment deleted successfully', severity: 'success' });
      } else if (deleteDialog.type === 'SESSION') {
        await deletePracticeSession(deleteDialog.id);
        setSessions((prev) => prev.filter((s) => s._id !== deleteDialog.id));
        setToast({ open: true, message: 'Practice session cancelled and deleted', severity: 'success' });
      }
      setDeleteDialog({ open: false, type: 'TEAM', id: '', title: '' });
      getSportsDashboardStats().then(setStats).catch(() => {});
    } catch (err: any) {
      setToast({
        open: true,
        message: err.response?.data?.message || 'Failed to delete record',
        severity: 'error'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getSportBadgeColor = (sport: string) => {
    switch (sport) {
      case 'FOOTBALL': return { bg: '#dcfce7', text: '#15803d' };
      case 'CRICKET': return { bg: '#e0f2fe', text: '#0369a1' };
      case 'BASKETBALL': return { bg: '#ffedd5', text: '#c2410c' };
      case 'ATHLETICS': return { bg: '#fef3c7', text: '#b45309' };
      case 'BADMINTON': return { bg: '#ede9fe', text: '#6d28d9' };
      case 'SWIMMING': return { bg: '#cffafe', text: '#0e7490' };
      default: return { bg: '#f1f5f9', text: '#475569' };
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 2 }}>
        <CircularProgress size={48} thickness={4} color="secondary" />
        <Typography variant="body1" color="text.secondary">Loading Sports & Athletics Arena...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1440, mx: 'auto' }}>
      {/* Header Banner */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { sm: 'center' }, gap: 2, mb: 4 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <EmojiEventsIcon sx={{ fontSize: 38, color: '#f59e0b' }} />
            <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: '-0.5px' }}>
              Sports & Athletics Management
            </Typography>
            <Chip label="Live Arena" size="small" color="secondary" variant="filled" sx={{ fontWeight: 700 }} />
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Manage varsity squads, track inter-school championships, allocate sports grounds, and monitor physical equipment.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadData}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<AddIcon />}
            onClick={() => {
              if (activeTab === 0) setTeamModal({ open: true, isEdit: false, data: { sportType: 'FOOTBALL', status: 'ACTIVE', membersCount: 15 } });
              else if (activeTab === 1) setEventModal({ open: true, isEdit: false, data: { sportType: 'FOOTBALL', eventType: 'INTER_SCHOOL', status: 'UPCOMING', startDate: new Date().toISOString().split('T')[0] } });
              else if (activeTab === 2) setEqModal({ open: true, isEdit: false, data: { sportCategory: 'FOOTBALL', quantity: 10, availableQuantity: 10, condition: 'EXCELLENT', status: 'AVAILABLE' } });
              else setSessionModal({ open: true, isEdit: false, data: { sportType: 'FOOTBALL', status: 'SCHEDULED', sessionDate: new Date().toISOString().split('T')[0], startTime: '06:30 AM', endTime: '08:00 AM' } });
            }}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 700,
              boxShadow: '0 4px 14px rgba(156, 39, 176, 0.35)',
              px: 3
            }}
          >
            {activeTab === 0 && 'Form New Team'}
            {activeTab === 1 && 'Host Tournament'}
            {activeTab === 2 && 'Add Sports Gear'}
            {activeTab === 3 && 'Schedule Practice'}
          </Button>
        </Box>
      </Box>

      {/* KPI Stats Grid */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.05)', background: 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" fontWeight={600}>Active Teams & Squads</Typography>
                  <Typography variant="h3" fontWeight={800} sx={{ color: '#16a34a', my: 0.5 }}>
                    {stats?.totalTeams || teams.length}
                  </Typography>
                  <Typography variant="caption" color="success.main" fontWeight={700}>
                    {stats?.totalAthletes || teams.reduce((acc, curr) => acc + (Number(curr.membersCount) || 0), 0)} Registered Athletes
                  </Typography>
                </Box>
                <GroupIcon sx={{ fontSize: 40, color: '#22c55e' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.05)', background: 'linear-gradient(135deg, #fffbeb 0%, #ffffff 100%)' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" fontWeight={600}>Tournaments & Events</Typography>
                  <Typography variant="h3" fontWeight={800} sx={{ color: '#d97706', my: 0.5 }}>
                    {stats?.upcomingEvents || events.filter((e) => e.status === 'UPCOMING' || e.status === 'ONGOING').length}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {events.length} Total Competitions Tracked
                  </Typography>
                </Box>
                <EmojiEventsIcon sx={{ fontSize: 40, color: '#f59e0b' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.05)', background: 'linear-gradient(135deg, #f0f9ff 0%, #ffffff 100%)' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" fontWeight={600}>Sports Gear Stock</Typography>
                  <Typography variant="h3" fontWeight={800} sx={{ color: '#0284c7', my: 0.5 }}>
                    {equipment.reduce((acc, curr) => acc + (Number(curr.quantity) || 0), 0)}
                  </Typography>
                  <Typography variant="caption" color="info.main" fontWeight={700}>
                    {equipment.reduce((acc, curr) => acc + (Number(curr.availableQuantity) || 0), 0)} Units Available for Use
                  </Typography>
                </Box>
                <InventoryIcon sx={{ fontSize: 40, color: '#0ea5e9' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.05)', background: 'linear-gradient(135deg, #faf5ff 0%, #ffffff 100%)' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" fontWeight={600}>Practice Drills</Typography>
                  <Typography variant="h3" fontWeight={800} sx={{ color: '#9333ea', my: 0.5 }}>
                    {sessions.filter((s) => s.status === 'SCHEDULED').length}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Active Ground Allocations
                  </Typography>
                </Box>
                <CalendarMonthIcon sx={{ fontSize: 40, color: '#a855f7' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Tabs Container */}
      <Card sx={{ borderRadius: 4, boxShadow: '0 8px 30px rgba(0,0,0,0.07)', border: '1px solid rgba(0,0,0,0.06)' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3, pt: 2, display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            textColor="secondary"
            indicatorColor="secondary"
            sx={{
              '& .MuiTab-root': {
                fontWeight: 700,
                textTransform: 'none',
                fontSize: '0.95rem',
                minHeight: 52
              }
            }}
          >
            <Tab icon={<GroupIcon sx={{ mr: 1, fontSize: 20 }} />} iconPosition="start" label={`Teams & Squads (${teams.length})`} />
            <Tab icon={<EmojiEventsIcon sx={{ mr: 1, fontSize: 20 }} />} iconPosition="start" label={`Tournaments & Matches (${events.length})`} />
            <Tab icon={<InventoryIcon sx={{ mr: 1, fontSize: 20 }} />} iconPosition="start" label={`Equipment Register (${equipment.length})`} />
            <Tab icon={<CalendarMonthIcon sx={{ mr: 1, fontSize: 20 }} />} iconPosition="start" label={`Practice Schedule (${sessions.length})`} />
          </Tabs>

          <TextField
            size="small"
            placeholder="Search sports records..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              )
            }}
            sx={{ minWidth: 260, my: 1 }}
          />
        </Box>

        {/* TAB 0: TEAMS & SQUADS */}
        {activeTab === 0 && (
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead sx={{ backgroundColor: 'rgba(0,0,0,0.02)' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Team Name</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Sport Discipline</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Category / Age Group</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Head Coach</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Team Captain</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Athletes</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Achievements</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTeams.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                      No sports teams registered. Click "Form New Team" to create one.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTeams.map((team) => {
                    const badge = getSportBadgeColor(team.sportType);
                    return (
                      <TableRow key={team._id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                        <TableCell>
                          <Typography variant="subtitle2" fontWeight={800}>{team.name}</Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={team.sportType}
                            size="small"
                            sx={{ fontWeight: 800, bgcolor: badge.bg, color: badge.text }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{team.category || 'Senior'}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>{team.coachName || 'Unassigned'}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{team.captainName || 'TBD'}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={700}>{team.membersCount || 0} players</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption" sx={{ color: 'text.secondary', maxWidth: 160, display: 'inline-block', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                            {team.achievements || 'Training Season'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={team.status || 'ACTIVE'}
                            size="small"
                            color={team.status === 'ACTIVE' ? 'success' : 'default'}
                            sx={{ fontWeight: 700 }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="Edit Team">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => setTeamModal({ open: true, isEdit: true, data: { ...team } })}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Team">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => setDeleteDialog({ open: true, type: 'TEAM', id: team._id, title: team.name })}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* TAB 1: TOURNAMENTS & EVENTS */}
        {activeTab === 1 && (
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead sx={{ backgroundColor: 'rgba(0,0,0,0.02)' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Tournament / Event</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Sport</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Level / Scope</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Venue Ground</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Event Dates</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Results / Highlights</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredEvents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                      No sports events or tournaments recorded.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEvents.map((event) => {
                    const badge = getSportBadgeColor(event.sportType);
                    return (
                      <TableRow key={event._id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Box sx={{ p: 1, borderRadius: 2, bgcolor: '#fef3c7', color: '#b45309', display: 'flex' }}>
                              <EmojiEventsIcon fontSize="small" />
                            </Box>
                            <Box>
                              <Typography variant="subtitle2" fontWeight={800}>{event.title}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                {event.participatingTeams ? `Teams: ${event.participatingTeams}` : 'Open Invitation'}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip label={event.sportType} size="small" sx={{ fontWeight: 800, bgcolor: badge.bg, color: badge.text }} />
                        </TableCell>
                        <TableCell>
                          <Chip label={event.eventType?.replace('_', ' ')} size="small" variant="outlined" sx={{ fontWeight: 600 }} />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <PlaceIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                            <Typography variant="body2">{event.venue}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            {event.startDate ? new Date(event.startDate).toLocaleDateString() : 'TBD'}
                          </Typography>
                          {event.endDate && (
                            <Typography variant="caption" color="text.secondary">
                              until {new Date(event.endDate).toLocaleDateString()}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={event.status || 'UPCOMING'}
                            size="small"
                            color={event.status === 'ONGOING' ? 'warning' : event.status === 'COMPLETED' ? 'success' : 'primary'}
                            sx={{ fontWeight: 700 }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {event.results || (event.status === 'COMPLETED' ? 'Concluded' : 'Pending')}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="Edit Tournament / Update Results">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => setEventModal({ open: true, isEdit: true, data: { ...event } })}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Event">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => setDeleteDialog({ open: true, type: 'EVENT', id: event._id, title: event.title })}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* TAB 2: EQUIPMENT INVENTORY */}
        {activeTab === 2 && (
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead sx={{ backgroundColor: 'rgba(0,0,0,0.02)' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Item Code & Name</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Sport Category</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Total Quantity</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Available Units</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Physical Condition</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Storage Location</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredEquipment.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                      No sports equipment records found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEquipment.map((eq) => {
                    const badge = getSportBadgeColor(eq.sportCategory);
                    const availabilityRatio = eq.quantity > 0 ? (eq.availableQuantity / eq.quantity) * 100 : 0;
                    return (
                      <TableRow key={eq._id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Box sx={{ p: 1, borderRadius: 2, bgcolor: '#f0f9ff', color: '#0284c7', display: 'flex' }}>
                              <FitnessCenterIcon fontSize="small" />
                            </Box>
                            <Box>
                              <Typography variant="subtitle2" fontWeight={800}>{eq.name}</Typography>
                              <Typography variant="caption" color="text.secondary">{eq.itemCode}</Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip label={eq.sportCategory} size="small" sx={{ fontWeight: 800, bgcolor: badge.bg, color: badge.text }} />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={700}>{eq.quantity} units</Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2" fontWeight={700} color={eq.availableQuantity > 0 ? 'success.main' : 'error.main'}>
                              {eq.availableQuantity} units
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={availabilityRatio}
                            color={availabilityRatio < 30 ? 'error' : availabilityRatio < 70 ? 'warning' : 'success'}
                            sx={{ height: 4, borderRadius: 2, mt: 0.5, maxWidth: 100 }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={eq.condition || 'GOOD'}
                            size="small"
                            color={eq.condition === 'EXCELLENT' || eq.condition === 'GOOD' ? 'success' : 'warning'}
                            sx={{ fontWeight: 700 }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{eq.location || 'Sports Storage'}</Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={eq.status || 'AVAILABLE'}
                            size="small"
                            color={eq.status === 'AVAILABLE' ? 'primary' : eq.status === 'IN_USE' ? 'info' : 'warning'}
                            sx={{ fontWeight: 700 }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="Edit Sports Equipment">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => setEqModal({ open: true, isEdit: true, data: { ...eq } })}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Equipment">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => setDeleteDialog({ open: true, type: 'EQUIPMENT', id: eq._id, title: eq.name })}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* TAB 3: PRACTICE SESSIONS */}
        {activeTab === 3 && (
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead sx={{ backgroundColor: 'rgba(0,0,0,0.02)' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Training Title & Drills</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Sport Discipline</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Participating Squad</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Coach</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Venue / Turf</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Date & Timings</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredSessions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                      No practice sessions scheduled.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSessions.map((ses) => {
                    const badge = getSportBadgeColor(ses.sportType);
                    return (
                      <TableRow key={ses._id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                        <TableCell>
                          <Typography variant="subtitle2" fontWeight={800}>{ses.title}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            Focus: {ses.drillsFocus || 'Fundamental conditioning'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip label={ses.sportType} size="small" sx={{ fontWeight: 800, bgcolor: badge.bg, color: badge.text }} />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>{ses.teamName || 'Open Squad'}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{ses.coachName}</Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <PlaceIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                            <Typography variant="body2">{ses.venue}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            {ses.sessionDate ? new Date(ses.sessionDate).toLocaleDateString() : 'N/A'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {ses.startTime} - {ses.endTime}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={ses.status || 'SCHEDULED'}
                            size="small"
                            color={ses.status === 'SCHEDULED' ? 'primary' : ses.status === 'IN_PROGRESS' ? 'warning' : 'success'}
                            sx={{ fontWeight: 700 }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="Edit Practice Session">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => setSessionModal({ open: true, isEdit: true, data: { ...ses } })}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Session">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => setDeleteDialog({ open: true, type: 'SESSION', id: ses._id, title: ses.title })}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      {/* ================= MODAL: TEAM CREATE / EDIT ================= */}
      <Dialog
        open={teamModal.open}
        onClose={() => setTeamModal({ open: false, isEdit: false, data: {} })}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, fontSize: '1.25rem' }}>
          {teamModal.isEdit ? 'Edit Sports Team' : 'Form New Sports Team'}
        </DialogTitle>
        <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <TextField
            label="Team Name"
            required
            fullWidth
            value={teamModal.data.name || ''}
            onChange={(e) => setTeamModal({ ...teamModal, data: { ...teamModal.data, name: e.target.value } })}
            placeholder="e.g. FIC Lions Senior Football Club"
          />

          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                select
                label="Sport Discipline"
                required
                fullWidth
                value={teamModal.data.sportType || 'FOOTBALL'}
                onChange={(e) => setTeamModal({ ...teamModal, data: { ...teamModal.data, sportType: e.target.value } })}
              >
                {SPORT_TYPES.map((st) => (
                  <MenuItem key={st} value={st}>{st}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Division / Age Category"
                fullWidth
                value={teamModal.data.category || ''}
                onChange={(e) => setTeamModal({ ...teamModal, data: { ...teamModal.data, category: e.target.value } })}
                placeholder="e.g. Under-17 Boys"
              />
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                label="Head Coach Name"
                fullWidth
                value={teamModal.data.coachName || ''}
                onChange={(e) => setTeamModal({ ...teamModal, data: { ...teamModal.data, coachName: e.target.value } })}
                placeholder="e.g. Coach Devendra Negi"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Team Captain Name"
                fullWidth
                value={teamModal.data.captainName || ''}
                onChange={(e) => setTeamModal({ ...teamModal, data: { ...teamModal.data, captainName: e.target.value } })}
                placeholder="e.g. Aarav Sharma (Grade 10)"
              />
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                type="number"
                label="Number of Athletes"
                fullWidth
                value={teamModal.data.membersCount || 0}
                onChange={(e) => setTeamModal({ ...teamModal, data: { ...teamModal.data, membersCount: Number(e.target.value) } })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                select
                label="Team Status"
                fullWidth
                value={teamModal.data.status || 'ACTIVE'}
                onChange={(e) => setTeamModal({ ...teamModal, data: { ...teamModal.data, status: e.target.value } })}
              >
                <MenuItem value="ACTIVE">ACTIVE</MenuItem>
                <MenuItem value="INACTIVE">INACTIVE</MenuItem>
                <MenuItem value="DISBANDED">DISBANDED</MenuItem>
              </TextField>
            </Grid>
          </Grid>

          <TextField
            label="Honors & Achievements"
            multiline
            rows={2}
            fullWidth
            value={teamModal.data.achievements || ''}
            onChange={(e) => setTeamModal({ ...teamModal, data: { ...teamModal.data, achievements: e.target.value } })}
            placeholder="e.g. District Champions 2025, Regional Runners Up..."
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setTeamModal({ open: false, isEdit: false, data: {} })}>Cancel</Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={handleTeamSubmit}
            disabled={submitting || !teamModal.data.name}
            sx={{ fontWeight: 700, px: 3, borderRadius: 2 }}
          >
            {submitting ? <CircularProgress size={20} /> : teamModal.isEdit ? 'Save Changes' : 'Form Team'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ================= MODAL: EVENT CREATE / EDIT ================= */}
      <Dialog
        open={eventModal.open}
        onClose={() => setEventModal({ open: false, isEdit: false, data: {} })}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, fontSize: '1.25rem' }}>
          {eventModal.isEdit ? 'Edit Tournament Event' : 'Create Tournament or Match'}
        </DialogTitle>
        <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <TextField
            label="Tournament / Match Title"
            required
            fullWidth
            value={eventModal.data.title || ''}
            onChange={(e) => setEventModal({ ...eventModal, data: { ...eventModal.data, title: e.target.value } })}
            placeholder="e.g. 34th Annual Inter-School Football Cup"
          />

          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                select
                label="Sport Type"
                required
                fullWidth
                value={eventModal.data.sportType || 'FOOTBALL'}
                onChange={(e) => setEventModal({ ...eventModal, data: { ...eventModal.data, sportType: e.target.value } })}
              >
                {SPORT_TYPES.map((st) => (
                  <MenuItem key={st} value={st}>{st}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField
                select
                label="Event Scope"
                fullWidth
                value={eventModal.data.eventType || 'INTER_SCHOOL'}
                onChange={(e) => setEventModal({ ...eventModal, data: { ...eventModal.data, eventType: e.target.value } })}
              >
                {EVENT_TYPES.map((et) => (
                  <MenuItem key={et} value={et}>{et.replace('_', ' ')}</MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>

          <TextField
            label="Sports Ground / Stadium Venue"
            required
            fullWidth
            value={eventModal.data.venue || ''}
            onChange={(e) => setEventModal({ ...eventModal, data: { ...eventModal.data, venue: e.target.value } })}
            placeholder="e.g. Main Football Turf Ground"
          />

          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                type="date"
                label="Start Date"
                InputLabelProps={{ shrink: true }}
                required
                fullWidth
                value={eventModal.data.startDate ? new Date(eventModal.data.startDate).toISOString().split('T')[0] : ''}
                onChange={(e) => setEventModal({ ...eventModal, data: { ...eventModal.data, startDate: e.target.value } })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                type="date"
                label="End Date (Optional)"
                InputLabelProps={{ shrink: true }}
                fullWidth
                value={eventModal.data.endDate ? new Date(eventModal.data.endDate).toISOString().split('T')[0] : ''}
                onChange={(e) => setEventModal({ ...eventModal, data: { ...eventModal.data, endDate: e.target.value } })}
              />
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                label="Participating Teams / Schools"
                fullWidth
                value={eventModal.data.participatingTeams || ''}
                onChange={(e) => setEventModal({ ...eventModal, data: { ...eventModal.data, participatingTeams: e.target.value } })}
                placeholder="e.g. FIC, Modern School, DPS Blue"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                select
                label="Current Status"
                fullWidth
                value={eventModal.data.status || 'UPCOMING'}
                onChange={(e) => setEventModal({ ...eventModal, data: { ...eventModal.data, status: e.target.value } })}
              >
                {EVENT_STATUSES.map((es) => (
                  <MenuItem key={es} value={es}>{es}</MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>

          <TextField
            label="Match Results / Scoreboard"
            multiline
            rows={2}
            fullWidth
            value={eventModal.data.results || ''}
            onChange={(e) => setEventModal({ ...eventModal, data: { ...eventModal.data, results: e.target.value } })}
            placeholder="e.g. FIC won 3 - 1 against DPS in the finals."
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setEventModal({ open: false, isEdit: false, data: {} })}>Cancel</Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={handleEventSubmit}
            disabled={submitting || !eventModal.data.title || !eventModal.data.venue}
            sx={{ fontWeight: 700, px: 3, borderRadius: 2 }}
          >
            {submitting ? <CircularProgress size={20} /> : eventModal.isEdit ? 'Save Changes' : 'Publish Tournament'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ================= MODAL: EQUIPMENT CREATE / EDIT ================= */}
      <Dialog
        open={eqModal.open}
        onClose={() => setEqModal({ open: false, isEdit: false, data: {} })}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, fontSize: '1.25rem' }}>
          {eqModal.isEdit ? 'Edit Sports Gear' : 'Register Sports Equipment'}
        </DialogTitle>
        <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <TextField
            label="Equipment / Gear Name"
            required
            fullWidth
            value={eqModal.data.name || ''}
            onChange={(e) => setEqModal({ ...eqModal, data: { ...eqModal.data, name: e.target.value } })}
            placeholder="e.g. FIFA Quality Pro Match Footballs (Size 5)"
          />

          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                select
                label="Sport Category"
                required
                fullWidth
                value={eqModal.data.sportCategory || 'FOOTBALL'}
                onChange={(e) => setEqModal({ ...eqModal, data: { ...eqModal.data, sportCategory: e.target.value } })}
              >
                {SPORT_TYPES.map((st) => (
                  <MenuItem key={st} value={st}>{st}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Storage Locker Location"
                fullWidth
                value={eqModal.data.location || ''}
                onChange={(e) => setEqModal({ ...eqModal, data: { ...eqModal.data, location: e.target.value } })}
                placeholder="e.g. Sports Shed Locker 3"
              />
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                type="number"
                label="Total Quantity"
                required
                fullWidth
                value={eqModal.data.quantity || 1}
                onChange={(e) => setEqModal({ ...eqModal, data: { ...eqModal.data, quantity: Number(e.target.value) } })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                type="number"
                label="Available Units"
                required
                fullWidth
                value={eqModal.data.availableQuantity !== undefined ? eqModal.data.availableQuantity : eqModal.data.quantity || 1}
                onChange={(e) => setEqModal({ ...eqModal, data: { ...eqModal.data, availableQuantity: Number(e.target.value) } })}
              />
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                select
                label="Physical Condition"
                fullWidth
                value={eqModal.data.condition || 'GOOD'}
                onChange={(e) => setEqModal({ ...eqModal, data: { ...eqModal.data, condition: e.target.value } })}
              >
                {EQ_CONDITIONS.map((c) => (
                  <MenuItem key={c} value={c}>{c}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField
                select
                label="Operational Status"
                fullWidth
                value={eqModal.data.status || 'AVAILABLE'}
                onChange={(e) => setEqModal({ ...eqModal, data: { ...eqModal.data, status: e.target.value } })}
              >
                {EQ_STATUSES.map((s) => (
                  <MenuItem key={s} value={s}>{s}</MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setEqModal({ open: false, isEdit: false, data: {} })}>Cancel</Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={handleEquipmentSubmit}
            disabled={submitting || !eqModal.data.name}
            sx={{ fontWeight: 700, px: 3, borderRadius: 2 }}
          >
            {submitting ? <CircularProgress size={20} /> : eqModal.isEdit ? 'Save Changes' : 'Register Gear'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ================= MODAL: PRACTICE SESSION CREATE / EDIT ================= */}
      <Dialog
        open={sessionModal.open}
        onClose={() => setSessionModal({ open: false, isEdit: false, data: {} })}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, fontSize: '1.25rem' }}>
          {sessionModal.isEdit ? 'Edit Practice Session' : 'Schedule Practice Session'}
        </DialogTitle>
        <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <TextField
            label="Training Session Title"
            required
            fullWidth
            value={sessionModal.data.title || ''}
            onChange={(e) => setSessionModal({ ...sessionModal, data: { ...sessionModal.data, title: e.target.value } })}
            placeholder="e.g. U-17 Tactical Set Pieces & Penalty Drills"
          />

          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                select
                label="Sport Discipline"
                required
                fullWidth
                value={sessionModal.data.sportType || 'FOOTBALL'}
                onChange={(e) => setSessionModal({ ...sessionModal, data: { ...sessionModal.data, sportType: e.target.value } })}
              >
                {SPORT_TYPES.map((st) => (
                  <MenuItem key={st} value={st}>{st}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField
                select
                label="Assigned Team"
                fullWidth
                value={sessionModal.data.teamId || ''}
                onChange={(e) => setSessionModal({ ...sessionModal, data: { ...sessionModal.data, teamId: e.target.value } })}
              >
                <MenuItem value="">Open Training (All)</MenuItem>
                {teams.map((t) => (
                  <MenuItem key={t._id} value={t._id}>{t.name}</MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                label="Head Coach In-Charge"
                required
                fullWidth
                value={sessionModal.data.coachName || ''}
                onChange={(e) => setSessionModal({ ...sessionModal, data: { ...sessionModal.data, coachName: e.target.value } })}
                placeholder="e.g. Coach Devendra Negi"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Turf / Ground Venue"
                required
                fullWidth
                value={sessionModal.data.venue || ''}
                onChange={(e) => setSessionModal({ ...sessionModal, data: { ...sessionModal.data, venue: e.target.value } })}
                placeholder="e.g. Main Football Turf"
              />
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField
                type="date"
                label="Session Date"
                InputLabelProps={{ shrink: true }}
                required
                fullWidth
                value={sessionModal.data.sessionDate ? new Date(sessionModal.data.sessionDate).toISOString().split('T')[0] : ''}
                onChange={(e) => setSessionModal({ ...sessionModal, data: { ...sessionModal.data, sessionDate: e.target.value } })}
              />
            </Grid>
            <Grid item xs={6} sm={4}>
              <TextField
                label="Start Time"
                fullWidth
                value={sessionModal.data.startTime || '06:30 AM'}
                onChange={(e) => setSessionModal({ ...sessionModal, data: { ...sessionModal.data, startTime: e.target.value } })}
                placeholder="06:30 AM"
              />
            </Grid>
            <Grid item xs={6} sm={4}>
              <TextField
                label="End Time"
                fullWidth
                value={sessionModal.data.endTime || '08:00 AM'}
                onChange={(e) => setSessionModal({ ...sessionModal, data: { ...sessionModal.data, endTime: e.target.value } })}
                placeholder="08:00 AM"
              />
            </Grid>
          </Grid>

          <TextField
            label="Drills Focus & Coaching Notes"
            multiline
            rows={2}
            fullWidth
            value={sessionModal.data.drillsFocus || ''}
            onChange={(e) => setSessionModal({ ...sessionModal, data: { ...sessionModal.data, drillsFocus: e.target.value } })}
            placeholder="Counter-pressing transition, corner kick defense, conditioning..."
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setSessionModal({ open: false, isEdit: false, data: {} })}>Cancel</Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={handleSessionSubmit}
            disabled={submitting || !sessionModal.data.title || !sessionModal.data.coachName || !sessionModal.data.venue}
            sx={{ fontWeight: 700, px: 3, borderRadius: 2 }}
          >
            {submitting ? <CircularProgress size={20} /> : sessionModal.isEdit ? 'Save Changes' : 'Schedule Session'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ================= DELETE CONFIRMATION MODAL ================= */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, type: 'TEAM', id: '', title: '' })}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: 'error.main' }}>
          Confirm Sports Record Deletion
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to permanently delete <strong>{deleteDialog.title}</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            This will remove this record from the active sports roster and historical reports.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteDialog({ open: false, type: 'TEAM', id: '', title: '' })}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteConfirm}
            disabled={submitting}
            sx={{ fontWeight: 700, px: 3, borderRadius: 2 }}
          >
            {submitting ? <CircularProgress size={20} color="inherit" /> : 'Delete Permanently'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ================= SNACKBAR NOTIFICATIONS ================= */}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast({ ...toast, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setToast({ ...toast, open: false })}
          severity={toast.severity}
          variant="filled"
          sx={{ width: '100%', borderRadius: 2, fontWeight: 600 }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SportsDashboard;
