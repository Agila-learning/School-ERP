// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Paper, Grid, Divider, Chip, CircularProgress, Alert } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowBack, Edit, Business, Email, Phone, Language, DateRange } from '@mui/icons-material';
import axios from 'axios';

const SchoolProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [school, setSchool] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSchool = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`http://localhost:5001/api/v1/tenant/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSchool(res.data.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch school details');
      } finally {
        setLoading(false);
      }
    };
    fetchSchool();
  }, [id]);

  if (loading) return <Box p={4} display="flex" justifyContent="center"><CircularProgress /></Box>;
  if (error) return <Box p={4}><Alert severity="error">{error}</Alert></Box>;
  if (!school) return <Box p={4}><Typography>School not found.</Typography></Box>;

  return (
    <Box p={3}>
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/super-admin/schools')}>Back to Directory</Button>
      </Box>

      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={4}>
        <Box display="flex" gap={3} alignItems="center">
          <Box
            width={80}
            height={80}
            bgcolor="primary.main"
            color="white"
            display="flex"
            alignItems="center"
            justifyContent="center"
            borderRadius={2}
            fontSize={24}
            fontWeight="bold"
          >
            {school.code}
          </Box>
          <Box>
            <Typography variant="h4" fontWeight="bold">{school.name}</Typography>
            <Box display="flex" gap={1} mt={1}>
              <Chip label={`Status: ${school.status}`} color={school.status === 'active' ? 'success' : 'default'} size="small" />
              <Chip label={`Plan: ${school.plan}`} variant="outlined" size="small" />
            </Box>
          </Box>
        </Box>
        <Button variant="outlined" startIcon={<Edit />}>Edit Profile</Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" mb={2} fontWeight="bold">General Information</Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <Business color="action" />
                  <Box>
                    <Typography variant="caption" color="textSecondary">Address</Typography>
                    <Typography variant="body2">
                      {school.address?.street}<br />
                      {school.address?.city}, {school.address?.state} {school.address?.postalCode}<br />
                      {school.address?.country}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <DateRange color="action" />
                  <Box>
                    <Typography variant="caption" color="textSecondary">Created Date</Typography>
                    <Typography variant="body2">{new Date(school.createdAt).toLocaleDateString()}</Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <Language color="action" />
                  <Box>
                    <Typography variant="caption" color="textSecondary">Subdomain</Typography>
                    <Typography variant="body2">{school.subdomain || 'Not configured'}</Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" mb={2} fontWeight="bold">Initial Administrator</Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <Email color="action" />
                  <Box>
                    <Typography variant="caption" color="textSecondary">Admin Name & Email</Typography>
                    <Typography variant="body2">{school.adminName}</Typography>
                    <Typography variant="body2" color="primary">{school.adminEmail}</Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <Phone color="action" />
                  <Box>
                    <Typography variant="caption" color="textSecondary">Phone</Typography>
                    <Typography variant="body2">{school.phone || 'Not provided'}</Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" mb={2} fontWeight="bold">Quick Stats</Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Box mb={2}>
              <Typography variant="caption" color="textSecondary">Storage Used</Typography>
              <Typography variant="h6">{school.storageUsed} MB / {school.storageQuota} MB</Typography>
            </Box>
            
            <Box mb={2}>
              <Typography variant="caption" color="textSecondary">Total Users</Typography>
              <Typography variant="h6">Configuring...</Typography>
            </Box>

            <Box>
              <Typography variant="caption" color="textSecondary">Active Students</Typography>
              <Typography variant="h6">Configuring...</Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SchoolProfile;
