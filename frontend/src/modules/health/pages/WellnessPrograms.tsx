import React from 'react';
import { Box, Typography, Card, CardContent, Button, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip } from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';

const WellnessPrograms: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <SchoolIcon color="primary" sx={{ fontSize: 32 }} />
          <Typography variant="h4" sx={{ fontWeight: 700 }}>Wellness Programs & Campaigns</Typography>
        </Box>
        <Button variant="contained" color="primary">Create Campaign</Button>
      </Box>

      <Card sx={{ borderRadius: 2, mb: 4 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Active Wellness Programs</Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Card variant="outlined" sx={{ borderColor: 'primary.light' }}>
                <CardContent>
                  <Typography variant="h6">Mental Wellness Education</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
                    Stress management workshops for High School students.
                  </Typography>
                  <Chip label="ACTIVE" size="small" color="success" />
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Card variant="outlined" sx={{ borderColor: 'info.light' }}>
                <CardContent>
                  <Typography variant="h6">Nutrition Awareness</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
                    Healthy eating habits for Primary School.
                  </Typography>
                  <Chip label="ACTIVE" size="small" color="success" />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card sx={{ borderRadius: 2 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Upcoming Campaigns</Typography>
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead sx={{ bgcolor: 'grey.50' }}>
                <TableRow>
                  <TableCell>Campaign Name</TableCell>
                  <TableCell>Program Category</TableCell>
                  <TableCell>Target Grades</TableCell>
                  <TableCell>Dates</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>Exam Stress Relief Seminar</TableCell>
                  <TableCell>Mental Wellness</TableCell>
                  <TableCell>Grade 10, Grade 12</TableCell>
                  <TableCell>Sept 1 - Sept 5</TableCell>
                  <TableCell><Chip label="PLANNED" size="small" color="primary" /></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default WellnessPrograms;
