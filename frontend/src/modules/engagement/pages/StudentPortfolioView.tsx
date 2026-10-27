import React from 'react';
import { Box, Typography, Card, CardContent, Grid, Avatar, Chip, Divider, Paper } from '@mui/material';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import GroupsIcon from '@mui/icons-material/Groups';
import LocalActivityIcon from '@mui/icons-material/LocalActivity';

const StudentPortfolioView: React.FC = () => {
  return (
    <Box sx={{ p: 3, maxWidth: 1000, mx: 'auto' }}>
      <Paper sx={{ p: 4, borderRadius: 3, background: 'linear-gradient(to right bottom, #ffffff, #f0f4f8)' }}>
        
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <Avatar sx={{ width: 100, height: 100, mr: 3 }} />
          <Box>
            <Typography variant="h3" sx={{ fontWeight: 700 }}>Alex Chen</Typography>
            <Typography variant="h6" color="text.secondary">Grade 11 • Gryffindor House • Class of 2028</Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 4 }} />

        <Grid container spacing={4}>
          {/* Left Column */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center' }}>
              <WorkspacePremiumIcon sx={{ mr: 1, color: 'warning.main' }} /> Verified Achievements
            </Typography>
            <Card sx={{ mb: 4, borderRadius: 2, borderLeft: 4, borderColor: 'primary.main' }}>
              <CardContent>
                <Typography variant="h6">National Science Olympiad - Gold Medalist</Typography>
                <Typography variant="body2" color="text.secondary">National Level • Aug 2026</Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>Achieved top 1% nationwide in advanced physics.</Typography>
              </CardContent>
            </Card>

            <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center' }}>
              <LocalActivityIcon sx={{ mr: 1, color: 'success.main' }} /> Extracurricular Activities
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              <Chip label="Debate Club President" color="primary" variant="outlined" />
              <Chip label="Varsity Basketball (Captain)" color="success" variant="outlined" />
              <Chip label="Robotics Team Member" color="info" variant="outlined" />
            </Box>
          </Grid>

          {/* Right Column */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ borderRadius: 2, mb: 3, bgcolor: 'primary.50' }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>Digital Badges</Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Avatar sx={{ bgcolor: 'warning.main' }}><WorkspacePremiumIcon /></Avatar>
                  <Avatar sx={{ bgcolor: 'info.main' }}><GroupsIcon /></Avatar>
                </Box>
              </CardContent>
            </Card>

            <Card sx={{ borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 1 }}>Volunteer Hours</Typography>
                <Typography variant="h3" sx={{ fontWeight: 700, color: 'success.main' }}>120</Typography>
                <Typography variant="body2" color="text.secondary">Total recorded hours</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

      </Paper>
    </Box>
  );
};

export default StudentPortfolioView;
