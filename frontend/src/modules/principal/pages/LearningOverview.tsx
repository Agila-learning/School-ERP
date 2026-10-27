import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Card, CardContent, CircularProgress,
  Alert, Grid, LinearProgress
} from '@mui/material';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import api from '../../../core/api/axios';

interface LearningStats {
  totalAssignments: number;
  activeHomework: number;
  syllabusProgress: number;
}

export default function LearningOverview() {
  const [stats, setStats] = useState<LearningStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/principal/learning-stats');
        if (response.data?.data) {
          setStats(response.data.data);
        }
      } catch (err) {
        setError('Failed to load learning stats.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <MenuBookIcon sx={{ fontSize: 40, color: 'primary.main' }} />
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Learning Overview</Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 4 }}>{error}</Alert>}

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card elevation={2} sx={{ borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'info.light' }}>
                  <AssignmentIcon />
                </Avatar>
                <Box>
                  <Typography variant="body2" color="text.secondary">Total Assignments</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{stats?.totalAssignments || 0}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card elevation={2} sx={{ borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'warning.light' }}>
                  <MenuBookIcon />
                </Avatar>
                <Box>
                  <Typography variant="body2" color="text.secondary">Active Homework</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{stats?.activeHomework || 0}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card elevation={2} sx={{ borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                <Avatar sx={{ bgcolor: 'success.light' }}>
                  <ShowChartIcon />
                </Avatar>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="body2" color="text.secondary">Overall Syllabus Progress</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 'bold' }}>{stats?.syllabusProgress || 0}%</Typography>
                </Box>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={stats?.syllabusProgress || 0} 
                color="success" 
                sx={{ height: 8, borderRadius: 4 }} 
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card elevation={2} sx={{ borderRadius: 2 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>Recent Activity</Typography>
          <Typography color="text.secondary">
            Learning analytics dashboards are currently aggregating. Check back later for detailed class-wise progress.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}

// Temporary internal component for Avatar since we forgot to import it from @mui/material above
import { Avatar } from '@mui/material';
