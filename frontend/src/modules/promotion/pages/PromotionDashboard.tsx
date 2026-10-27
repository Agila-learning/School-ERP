import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Grid, Card, CardContent, Paper, 
  CircularProgress, Button, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Chip
} from '@mui/material';
import GroupIcon from '@mui/icons-material/Group';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import AddIcon from '@mui/icons-material/Add';
import DescriptionIcon from '@mui/icons-material/Description';

import api from '../../../core/api/axios';

const PromotionDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>({
    totalStudents: 0,
    eligible: 0,
    notEligible: 0,
    conditional: 0,
    detained: 0,
    graduating: 0,
    pendingReview: 0,
    promotionPercentage: 0
  });

  useEffect(() => {
    api.get('/promotion/dashboard')
      .then(res => {
        if (res.data?.data) {
          setStats(res.data.data);
        }
      })
      .catch(err => {
        console.error('Failed to load promotion stats', err);
      })
      .finally(() => {
        setLoading(false);
      });
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
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Promotion & Progression</Typography>
          <Typography variant="body2" color="text.secondary">Academic year-end transitions and eligibility overview</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="outlined" startIcon={<DescriptionIcon />}>Export Analytics</Button>
          <Button variant="contained" startIcon={<AddIcon />}>Run Evaluation</Button>
        </Box>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Total Students" value={stats.totalStudents} icon={<GroupIcon />} color="primary" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Eligible for Promotion" value={stats.eligible} icon={<CheckCircleIcon />} color="success" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Conditional / Review" value={stats.conditional + stats.pendingReview} icon={<WarningAmberIcon />} color="warning" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Detained" value={stats.detained} icon={<CancelOutlinedIcon />} color="error" />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Paper variant="outlined" sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Grade-wise Progression (Preview)</Typography>
            </Box>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: 'grey.50' }}>
                    <TableCell>Grade</TableCell>
                    <TableCell>Total</TableCell>
                    <TableCell>Promoted</TableCell>
                    <TableCell>Detained</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {stats?.gradeProgression && stats.gradeProgression.length > 0 ? (
                    stats.gradeProgression.map((gp: any, idx: number) => (
                      <TableRow hover key={idx}>
                        <TableCell><Typography variant="body2" sx={{ fontWeight: 'medium' }}>{gp.grade}</Typography></TableCell>
                        <TableCell>{gp.total}</TableCell>
                        <TableCell><Typography sx={{ color: 'success.main' }}>{gp.promoted}</Typography></TableCell>
                        <TableCell><Typography sx={{ color: 'error.main' }}>{gp.detained}</Typography></TableCell>
                        <TableCell><Chip label={gp.status} size="small" color={gp.status === 'APPROVED' ? 'success' : 'warning'} /></TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                        No grade-wise promotion evaluations generated yet. Click "Run Evaluation" to calculate progression.
                      </TableCell>
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
              <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'warning.50', border: '1px solid', borderColor: 'warning.100' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'warning.main' }}>Pending Teacher Reviews ({stats.pendingReview})</Typography>
                <Typography variant="body2" sx={{ color: 'warning.dark', mt: 0.5 }}>Teachers must complete their recommendations before final rollover.</Typography>
                <Button size="small" sx={{ mt: 1, color: 'warning.main' }}>View List</Button>
              </Box>
              <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'info.50', border: '1px solid', borderColor: 'info.100' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'info.main' }}>Ready for Rollover</Typography>
                <Typography variant="body2" sx={{ color: 'info.dark', mt: 0.5 }}>Grade 10 results and promotions have been approved. Proceed to rollover.</Typography>
                <Button size="small" sx={{ mt: 1, color: 'info.main' }}>Execute Rollover</Button>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PromotionDashboard;
