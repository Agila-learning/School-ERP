import { useState, useEffect } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, Paper, CircularProgress,
  Chip, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Avatar,
} from '@mui/material';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import AssignmentReturnIcon from '@mui/icons-material/AssignmentReturn';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import PeopleIcon from '@mui/icons-material/People';
import AddIcon from '@mui/icons-material/Add';
import api from '../../../core/api/axios';
import { useAuth } from '../../auth/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export default function LibrarianDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBooks: 0,
    activeIssues: 0,
    overdueCount: 0,
    totalMembers: 0,
  });
  const [recentIssues, setRecentIssues] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, issuesRes] = await Promise.allSettled([
          api.get('/library/stats'),
          api.get('/library/issues?status=ISSUED&limit=5'),
        ]);
        if (statsRes.status === 'fulfilled') setStats(statsRes.value.data.data || stats);
        if (issuesRes.status === 'fulfilled') {
          const d = issuesRes.value.data.data;
          setRecentIssues(Array.isArray(d) ? d : (d?.data || []));
        }
      } catch {
        // fail silently
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const statCards = [
    { label: 'Total Books',      value: stats.totalBooks,    icon: <MenuBookIcon />,          color: '#3b82f6' },
    { label: 'Active Issues',    value: stats.activeIssues,  icon: <AssignmentReturnIcon />,  color: '#10b981' },
    { label: 'Overdue Returns',  value: stats.overdueCount,  icon: <WarningAmberIcon />,      color: '#ef4444' },
    { label: 'Library Members',  value: stats.totalMembers,  icon: <PeopleIcon />,            color: '#8b5cf6' },
  ];

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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: 'primary.main', width: 52, height: 52 }}>
            <MenuBookIcon />
          </Avatar>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>Library Dashboard</Typography>
            <Typography variant="body2" color="text.secondary">
              Welcome, {user?.firstName}. Manage your library.
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/library/issue')} sx={{ borderRadius: 2 }}>
            Issue Book
          </Button>
          <Button variant="outlined" startIcon={<AssignmentReturnIcon />} onClick={() => navigate('/library/issue')} sx={{ borderRadius: 2 }}>
            Return Book
          </Button>
        </Box>
      </Box>

      {/* Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statCards.map((card) => (
          <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={card.label}>
            <Card
              elevation={0}
              sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, '&:hover': { boxShadow: 3 } }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontWeight: 600, mb: 1 }}
                    >
                      {card.label}
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 800, color: card.color }}>
                      {card.value}
                    </Typography>
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

      {/* Recent Issues Table */}
      <Paper
        elevation={0}
        sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, overflow: 'hidden', mb: 3 }}
      >
        <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Recent Issues</Typography>
          <Button size="small" onClick={() => navigate('/library/issue')}>View All</Button>
        </Box>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: 'grey.50' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Book</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Member</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Issue Date</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Due Date</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {recentIssues.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                    No active book issues found.
                  </TableCell>
                </TableRow>
              ) : (
                recentIssues.map((issue: any) => (
                  <TableRow key={issue._id} hover>
                    <TableCell>{issue.bookCopyId?.bookId?.title || 'N/A'}</TableCell>
                    <TableCell>{issue.borrowerId?.firstName} {issue.borrowerId?.lastName}</TableCell>
                    <TableCell>
                      {issue.issueDate ? new Date(issue.issueDate).toLocaleDateString() : '-'}
                    </TableCell>
                    <TableCell>
                      {issue.dueDate ? new Date(issue.dueDate).toLocaleDateString() : '-'}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={issue.status}
                        size="small"
                        color={
                          issue.status === 'OVERDUE' ? 'error' :
                          issue.status === 'ISSUED' ? 'info' : 'success'
                        }
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Quick Links */}
      <Grid container spacing={2}>
        {[
          { label: 'Manage Catalog',    path: '/library/catalog',      color: 'primary'   as const },
          { label: 'View Reservations', path: '/library/reservations', color: 'info'      as const },
          { label: 'Manage Fines',      path: '/library/fines',        color: 'warning'   as const },
          { label: 'Library Reports',   path: '/library/reports',      color: 'success'   as const },
        ].map((link) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={link.label}>
            <Button
              fullWidth
              variant="outlined"
              color={link.color}
              sx={{ py: 1.5, borderRadius: 2 }}
              onClick={() => navigate(link.path)}
            >
              {link.label}
            </Button>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
