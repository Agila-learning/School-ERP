import React from 'react';
import { Box, Typography, Card, CardContent, Button, TextField, InputAdornment, Chip, Avatar, Grid } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';

const AlumniDirectory: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>Alumni Directory</Typography>
      </Box>

      <Card sx={{ borderRadius: 2, mb: 4 }}>
        <CardContent sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            placeholder="Search by name, company, or skills..."
            variant="outlined"
            size="small"
            sx={{ flexGrow: 1, minWidth: 300 }}
            slotProps={{
              input: {
                startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
              }
            }}
          />
          <Button variant="outlined" startIcon={<FilterListIcon />}>Filters</Button>
          <Button variant="contained">Search</Button>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {[1, 2, 3, 4, 5, 6].map((idx) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={idx}>
            <Card sx={{ borderRadius: 2, '&:hover': { boxShadow: 4 }, transition: 'box-shadow 0.2s' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Avatar sx={{ width: 64, height: 64, bgcolor: 'primary.main' }}>AL</Avatar>
                  <Box>
                    <Typography variant="h6">Alex Johnson</Typography>
                    <Typography variant="body2" color="text.secondary">Class of 2018 • Science</Typography>
                  </Box>
                </Box>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Software Engineer</strong> at Tech Corp
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                  <Chip size="small" label="React" />
                  <Chip size="small" label="Node.js" />
                  <Chip size="small" label="Mentor" color="secondary" />
                </Box>
                <Button variant="outlined" fullWidth size="small">View Profile</Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default AlumniDirectory;
