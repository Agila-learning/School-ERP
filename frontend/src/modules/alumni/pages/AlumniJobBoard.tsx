import React from 'react';
import { Box, Typography, Card, CardContent, Button, Chip, Grid } from '@mui/material';
import WorkIcon from '@mui/icons-material/Work';

const AlumniJobBoard: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>Career & Job Board</Typography>
        <Button variant="contained" color="primary" startIcon={<WorkIcon />}>Post a Job</Button>
      </Box>

      <Grid container spacing={3}>
        {[1, 2, 3].map((job) => (
          <Grid size={{ xs: 12 }} key={job}>
            <Card sx={{ borderRadius: 2 }}>
              <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="h6">Frontend Developer (React)</Typography>
                  <Typography variant="subtitle1" color="primary">Global Tech Solutions</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    San Francisco, CA (Remote) • Full Time • 3-5 Years Experience
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Chip size="small" label="React" />
                    <Chip size="small" label="TypeScript" />
                  </Box>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Posted 2 days ago</Typography>
                  <Button variant="outlined">View Details</Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default AlumniJobBoard;
