import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Grid, Card, CardContent, Paper, 
  CircularProgress, Button, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, LinearProgress, Chip
} from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import SchoolIcon from '@mui/icons-material/School';
import AddIcon from '@mui/icons-material/Add';
import DescriptionIcon from '@mui/icons-material/Description';
import { getDashboardStats } from '../api/examination.api';

const ExaminationDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getDashboardStats();
        setStats(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const StatCard = ({ title, value, icon, color }: any) => (
    <Card variant="outlined" sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 'medium' }}>
              {title}
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 'bold', mt: 1, color: `${color}.main` }}>
              {value}
            </Typography>
          </Box>
          <Box sx={{ bgcolor: `${color}.50`, p: 1.5, borderRadius: 2, color: `${color}.main` }}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1400, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Examination Dashboard</Typography>
          <Typography variant="body2" color="text.secondary">Real-time metrics and operations overview</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="outlined" startIcon={<DescriptionIcon />}>Generate Report</Button>
          <Button variant="contained" startIcon={<AddIcon />}>Schedule Exam</Button>
        </Box>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Total Exams" value={stats?.totalExams || 0} icon={<AssignmentIcon />} color="primary" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Ongoing" value={stats?.ongoingExams || 0} icon={<ShowChartIcon />} color="warning" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Completed" value={stats?.completedExams || 0} icon={<CheckCircleOutlineIcon />} color="success" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Pass Rate" value={stats?.passPercentage || '0%'} icon={<SchoolIcon />} color="info" />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Paper variant="outlined" sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Recent Examinations</Typography>
            </Box>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: 'grey.50' }}>
                    <TableCell>Exam Name</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Completion</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {stats?.recentExams && stats.recentExams.length > 0 ? (
                    stats.recentExams.map((exam: any) => (
                      <TableRow hover key={exam._id}>
                        <TableCell><Typography variant="body2" sx={{ fontWeight: 'medium' }}>{exam.name}</Typography></TableCell>
                        <TableCell><Typography variant="body2">{new Date(exam.startDate).toLocaleDateString()}</Typography></TableCell>
                        <TableCell><Chip label={exam.status} size="small" color={exam.status === 'PUBLISHED' ? 'success' : exam.status === 'ONGOING' ? 'warning' : 'default'} /></TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LinearProgress variant="determinate" value={exam.status === 'PUBLISHED' ? 100 : 50} sx={{ flex: 1, height: 6, borderRadius: 3 }} color={exam.status === 'PUBLISHED' ? 'success' : 'primary'} />
                            <Typography variant="caption">{exam.status === 'PUBLISHED' ? '100%' : '50%'}</Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} align="center">No recent exams found.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <Paper variant="outlined" sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>Action Required</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'error.50', border: '1px solid', borderColor: 'error.100' }}>
                <Typography variant="subtitle2" color="error.main" sx={{ fontWeight: 'bold' }}>Pending Approvals ({stats?.pendingApprovals || 0})</Typography>
                <Typography variant="body2" color="error.dark" sx={{ mt: 0.5 }}>Results require approval or publishing.</Typography>
                <Button size="small" sx={{ mt: 1, color: 'error.main' }}>Review Results</Button>
              </Box>
              <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'warning.50', border: '1px solid', borderColor: 'warning.100' }}>
                <Typography variant="subtitle2" color="warning.main" sx={{ fontWeight: 'bold' }}>Missing Marks</Typography>
                <Typography variant="body2" color="warning.dark" sx={{ mt: 0.5 }}>Some marks sheets may not be submitted yet.</Typography>
                <Button size="small" sx={{ mt: 1, color: 'warning.main' }}>Send Reminders</Button>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ExaminationDashboard;
