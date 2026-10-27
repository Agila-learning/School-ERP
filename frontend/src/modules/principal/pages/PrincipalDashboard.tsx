import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, Paper, CircularProgress,
  Alert, Avatar, Button, Divider, Chip, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Tooltip, IconButton, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField, Tabs, Tab
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import SchoolIcon from '@mui/icons-material/School';
import DashboardCustomizeIcon from '@mui/icons-material/DashboardCustomize';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import CampaignIcon from '@mui/icons-material/Campaign';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ChatIcon from '@mui/icons-material/Chat';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import api from '../../../core/api/axios';
import { useAuth } from '../../auth/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { QuickLeaveRequestModal } from '../../../shared/components/QuickLeaveRequestModal';

interface PrincipalStats {
  totalStudents: number;
  totalTeachers: number;
  totalStaff: number;
  totalClasses: number;
  attendanceRate: number;
  pendingLeaves: number;
  upcomingExams: number;
  collectionRate: number;
}

const DEFAULT_ANNOUNCEMENTS: any[] = [];

const DEFAULT_QUERIES: any[] = [];

export default function PrincipalDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<PrincipalStats | null>(null);
  const [upcomingExams, setUpcomingExams] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Announcements State
  const [announcements, setAnnouncements] = useState<any[]>(DEFAULT_ANNOUNCEMENTS);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<any>(null);
  const [announcementModalOpen, setAnnouncementModalOpen] = useState(false);

  // Queries State
  const [queries, setQueries] = useState<any[]>(() => {
    const cached = localStorage.getItem('fic_principal_direct_queries');
    return cached ? JSON.parse(cached) : DEFAULT_QUERIES;
  });
  const [queryFilter, setQueryFilter] = useState('ALL');
  const [selectedQuery, setSelectedQuery] = useState<any>(null);
  const [queryModalOpen, setQueryModalOpen] = useState(false);
  const [queryReply, setQueryReply] = useState('');

  // Leave Modal
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);

  const loadAllQueries = async () => {
    try {
      const res = await api.get('/communication/principal/queries').catch(() => null);
      const serverQueries = res?.data?.data || [];
      const cached = localStorage.getItem('fic_principal_direct_queries');
      const localQueries = cached ? JSON.parse(cached) : DEFAULT_QUERIES;

      // Merge and deduplicate
      const combined = [...localQueries, ...serverQueries];
      const seen = new Set();
      const unique = combined.filter(q => {
        const key = q._id || q.id;
        if (!key || seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      setQueries(unique);
      localStorage.setItem('fic_principal_direct_queries', JSON.stringify(unique));
    } catch {
      const cached = localStorage.getItem('fic_principal_direct_queries');
      if (cached) setQueries(JSON.parse(cached));
    }
  };

  useEffect(() => {
    loadAllQueries();
    const handleQueryUpdate = (e: any) => {
      loadAllQueries();
    };
    window.addEventListener('principal_queries_updated', handleQueryUpdate);
    window.addEventListener('storage', handleQueryUpdate);
    return () => {
      window.removeEventListener('principal_queries_updated', handleQueryUpdate);
      window.removeEventListener('storage', handleQueryUpdate);
    };
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [statsRes, examsRes, annRes] = await Promise.all([
          api.get('/principal/dashboard-stats').catch(() => null),
          api.get('/principal/upcoming-exams').catch(() => null),
          api.get('/communication/announcements').catch(() => null)
        ]);

        if (statsRes?.data?.data) {
          setStats(statsRes.data.data);
        } else {
          setStats({
            totalStudents: 0,
            totalTeachers: 0,
            totalStaff: 0,
            totalClasses: 0,
            attendanceRate: 0,
            pendingLeaves: 0,
            upcomingExams: 0,
            collectionRate: 0
          });
        }

        if (examsRes?.data?.data) {
          setUpcomingExams(examsRes.data.data);
        }
        if (annRes?.data?.data && Array.isArray(annRes.data.data) && annRes.data.data.length > 0) {
          setAnnouncements(annRes.data.data);
        }
      } catch {
        setError('Loaded dashboard in offline/cached resilience mode.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const handleUpdateQueryStatus = (queryId: string, newStatus: string) => {
    const updated = queries.map(q => q.id === queryId ? { ...q, status: newStatus } : q);
    setQueries(updated);
    localStorage.setItem('fic_principal_direct_queries', JSON.stringify(updated));
    if (selectedQuery && selectedQuery.id === queryId) {
      setSelectedQuery({ ...selectedQuery, status: newStatus });
    }
  };

  const handleSendQueryReply = async () => {
    if (!selectedQuery) return;
    const qId = selectedQuery._id || selectedQuery.id;
    const replyText = queryReply || 'Acknowledged and resolved by Principal.';

    try {
      await api.put(`/communication/principal/queries/${qId}/reply`, { reply: replyText }).catch(() => null);
    } catch (e) {
      console.warn('Backend query reply sync error:', e);
    }

    const updated = queries.map(q => {
      if ((q._id && q._id === qId) || q.id === qId) {
        return {
          ...q,
          status: 'RESOLVED',
          principalReply: replyText,
          repliedAt: new Date().toISOString()
        };
      }
      return q;
    });
    setQueries(updated);
    localStorage.setItem('fic_principal_direct_queries', JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('principal_queries_updated'));

    // Realtime notification to sender
    try {
      const { publishNotification } = await import('../../../core/services/realtimeNotificationBus');
      publishNotification({
        title: `Principal Replied to Your Query`,
        message: `Topic: "${selectedQuery.subject}". Response: "${replyText.slice(0, 50)}..."`,
        category: 'ADMIN',
        severity: 'success',
        link: selectedQuery.senderRole === 'STUDENT' ? '/student-portal/dashboard' : '/principal/dashboard'
      });
    } catch {}

    setQueryModalOpen(false);
    setQueryReply('');
  };

  const filteredQueries = queryFilter === 'ALL'
    ? queries
    : queries.filter(q => q.senderRole === queryFilter || q.status === queryFilter);

  const statCards = stats
    ? [
        { label: 'Total Students', value: stats.totalStudents, icon: <PeopleIcon />, color: '#3b82f6', subtitle: 'Enrolled this year' },
        { label: 'Total Teachers', value: stats.totalTeachers, icon: <SchoolIcon />, color: '#10b981', subtitle: 'Active faculty' },
        { label: 'Pending Approvals', value: stats.pendingLeaves, icon: <AssignmentTurnedInIcon />, color: '#f59e0b', subtitle: 'Principal First Approval' },
        { label: 'Direct Queries', value: queries.filter(q => q.status === 'PENDING').length, icon: <QuestionAnswerIcon />, color: '#8b5cf6', subtitle: 'Awaiting Principal' },
      ]
    : [];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56, fontSize: '1.5rem' }}>
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </Avatar>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              Principal Executive Dashboard
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Welcome, Principal {user?.firstName} {user?.lastName}. Complete oversight & first-tier approvals.
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button
            variant="outlined"
            startIcon={<EventAvailableIcon />}
            onClick={() => setLeaveModalOpen(true)}
            sx={{ borderRadius: 2, fontWeight: 700 }}
          >
            Leave Request
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AssignmentTurnedInIcon />}
            onClick={() => navigate('/principal/approvals')}
            sx={{ borderRadius: 2, fontWeight: 700 }}
          >
            Approval Center
          </Button>
        </Box>
      </Box>

      {error && <Alert severity="info" sx={{ mb: 3 }}>{error}</Alert>}

      {/* Stat Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statCards.map((card) => (
          <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={card.label}>
            <Card
              elevation={0}
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 3,
                '&:hover': { boxShadow: 4, transform: 'translateY(-2px)', transition: 'all 0.2s' },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, mb: 1 }}>
                      {card.label}
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 800, color: card.color }}>
                      {card.value}
                    </Typography>
                    <Typography variant="caption" color="text.disabled">{card.subtitle}</Typography>
                  </Box>
                  <Box sx={{ p: 1.5, bgcolor: `${card.color}18`, borderRadius: 2, color: card.color }}>
                    {card.icon}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* SECTION 1: DIRECT EXECUTIVE QUERIES DESK */}
      <Paper elevation={0} sx={{ p: 3, mb: 4, border: '1px solid #e2e8f0', borderRadius: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 2.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <QuestionAnswerIcon color="primary" />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                Direct Queries & Role Chat Desk
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Private inquiries, grievances, and requests submitted directly to the Principal by Teachers, Staff, Drivers, Parents, and Students.
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {['ALL', 'STUDENT', 'TEACHER', 'STAFF', 'DRIVER', 'PARENT', 'PENDING'].map(chip => (
              <Chip
                key={chip}
                label={chip}
                size="small"
                onClick={() => setQueryFilter(chip)}
                color={queryFilter === chip ? 'primary' : 'default'}
                variant={queryFilter === chip ? 'filled' : 'outlined'}
                sx={{ fontWeight: 600 }}
              />
            ))}
          </Box>
        </Box>

        <TableContainer sx={{ overflowX: 'auto' }}>
          <Table size="small" sx={{ minWidth: 900 }}>
            <TableHead sx={{ bgcolor: '#f8fafc' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Sender</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Subject & Message</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Priority</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700, textAlign: 'right' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredQueries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4, color: '#94a3b8' }}>
                    No queries found under this filter.
                  </TableCell>
                </TableRow>
              ) : (
                filteredQueries.map(q => (
                  <TableRow key={q.id} hover>
                    <TableCell>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{q.senderName}</Typography>
                      <Chip
                        size="small"
                        label={q.senderRole}
                        sx={{ fontSize: '0.65rem', height: 18 }}
                        color={q.senderRole === 'STUDENT' ? 'secondary' : q.senderRole === 'TEACHER' ? 'success' : q.senderRole === 'DRIVER' ? 'warning' : 'info'}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip size="small" label={q.category} variant="outlined" />
                    </TableCell>
                    <TableCell sx={{ maxWidth: 350 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{q.subject}</Typography>
                      <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
                        {q.message}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={q.priority}
                        color={q.priority === 'URGENT' ? 'error' : q.priority === 'HIGH' ? 'warning' : 'default'}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={q.status}
                        color={q.status === 'RESOLVED' ? 'success' : q.status === 'IN_REVIEW' ? 'info' : 'warning'}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<ChatIcon fontSize="small" />}
                          onClick={() => {
                            setSelectedQuery(q);
                            setQueryReply(q.principalReply || '');
                            setQueryModalOpen(true);
                          }}
                          sx={{ textTransform: 'none', borderRadius: 1.5, fontWeight: 600 }}
                        >
                          Review & Reply
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* SECTION 2: SCHOOL ANNOUNCEMENTS (WITH WORKING VIEW) & QUICK ACTIONS */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper elevation={0} sx={{ p: 3, border: '1px solid #e2e8f0', borderRadius: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CampaignIcon color="secondary" />
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  School Circulars & Announcements
                </Typography>
              </Box>
              <Button
                size="small"
                variant="contained"
                color="secondary"
                onClick={() => navigate('/communication/announcements')}
                sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 700 }}
              >
                Manage All Announcements
              </Button>
            </Box>

            <TableContainer>
              <Table size="small">
                <TableHead sx={{ bgcolor: '#f8fafc' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Title</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Audience</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 700, textAlign: 'right' }}>View</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {announcements.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 4, color: '#94a3b8' }}>
                        No published circulars or announcements at this time.
                      </TableCell>
                    </TableRow>
                  ) : (
                    announcements.map(ann => (
                      <TableRow key={ann._id} hover>
                        <TableCell sx={{ fontWeight: 600 }}>{ann.title}</TableCell>
                        <TableCell>
                          <Chip size="small" label={ann.audienceConfig?.targetType || 'ALL'} variant="outlined" />
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(ann.publishedAt || Date.now()).toLocaleDateString()}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="View Announcement">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => {
                                setSelectedAnnouncement(ann);
                                setAnnouncementModalOpen(true);
                              }}
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Paper elevation={0} sx={{ p: 3, border: '1px solid #e2e8f0', borderRadius: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
              Executive Shortcuts
            </Typography>
            {[
              { label: 'Multi-Flow Approval Center', path: '/principal/approvals', color: 'warning' as const, icon: <AssignmentTurnedInIcon fontSize="small" /> },
              { label: 'Period Exchange Desk', path: '/timetable/exchange', color: 'primary' as const, icon: <SwapHorizIcon fontSize="small" /> },
              { label: 'Campus Referral Hub (In-School & Out-School)', path: '/career/referrals', color: 'success' as const, icon: <CardGiftcardIcon fontSize="small" /> },
              { label: 'Master Timetable Editor', path: '/timetable/editor', color: 'info' as const, icon: <DashboardCustomizeIcon fontSize="small" /> },
            ].map((action) => (
              <Button
                key={action.label}
                fullWidth
                variant="outlined"
                color={action.color}
                startIcon={action.icon}
                sx={{ mb: 1.5, justifyContent: 'flex-start', borderRadius: 2, fontWeight: 600, py: 1 }}
                onClick={() => navigate(action.path)}
              >
                {action.label}
              </Button>
            ))}
          </Paper>
        </Grid>
      </Grid>

      {/* VIEW ANNOUNCEMENT DETAIL MODAL */}
      <Dialog
        open={announcementModalOpen}
        onClose={() => setAnnouncementModalOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        {selectedAnnouncement && (
          <>
            <DialogTitle sx={{ fontWeight: 800, pb: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>{selectedAnnouncement.title}</span>
              <Chip size="small" label={selectedAnnouncement.type || 'CIRCULAR'} color="primary" />
            </DialogTitle>
            <DialogContent dividers sx={{ pt: 2, pb: 3 }}>
              <Box sx={{ display: 'flex', gap: 2, mb: 2, bgcolor: '#f8fafc', p: 1.5, borderRadius: 2 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">Published Date</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {new Date(selectedAnnouncement.publishedAt || Date.now()).toLocaleDateString()}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Audience Target</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {selectedAnnouncement.audienceConfig?.targetType || 'School Community'}
                  </Typography>
                </Box>
              </Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: '#334155' }}>
                Full Announcement Notice:
              </Typography>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.7, bgcolor: '#fff', p: 2, borderRadius: 2, border: '1px solid #e2e8f0' }}>
                {selectedAnnouncement.content}
              </Typography>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button onClick={() => setAnnouncementModalOpen(false)} sx={{ fontWeight: 700 }}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* QUERY REVIEW & REPLY MODAL */}
      <Dialog
        open={queryModalOpen}
        onClose={() => setQueryModalOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        {selectedQuery && (
          <>
            <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>
              Query Review: {selectedQuery.subject}
            </DialogTitle>
            <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ bgcolor: '#f8fafc', p: 2, borderRadius: 2 }}>
                <Typography variant="caption" color="text.secondary">Sender</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {selectedQuery.senderName} ({selectedQuery.senderRole})
                </Typography>
                <Typography variant="body2" sx={{ mt: 1, color: '#1e293b' }}>
                  "{selectedQuery.message}"
                </Typography>
              </Box>

              <TextField
                fullWidth
                multiline
                rows={3}
                size="small"
                label="Principal's Executive Reply"
                placeholder="Enter instructions, resolution, or guidance..."
                value={queryReply}
                onChange={e => setQueryReply(e.target.value)}
              />
            </DialogContent>
            <DialogActions sx={{ p: 2.5 }}>
              <Button onClick={() => handleUpdateQueryStatus(selectedQuery.id, 'IN_REVIEW')} color="info">
                Mark In Review
              </Button>
              <Button variant="contained" color="success" onClick={handleSendQueryReply} sx={{ borderRadius: 2, fontWeight: 700 }}>
                Resolve & Send Reply
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Quick Leave Request Modal */}
      <QuickLeaveRequestModal
        open={leaveModalOpen}
        onClose={() => setLeaveModalOpen(false)}
        defaultRole="STAFF"
        applicantName={`Principal ${user?.firstName || ''} ${user?.lastName || ''}`.trim()}
      />
    </Box>
  );
}

