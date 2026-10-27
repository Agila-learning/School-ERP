// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, TextField, Select, MenuItem, Chip, Paper, IconButton } from '@mui/material';
import { Add, Search, Visibility, Block, CheckCircle } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const SchoolDirectory = () => {
  const navigate = useNavigate();
  const [schools, setSchools] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchSchools = async () => {
    try {
      const token = localStorage.getItem('token');
      const params: any = {};
      if (search) params.search = search;
      if (statusFilter !== 'all') params.status = statusFilter;

      const res = await axios.get('http://localhost:5001/api/v1/tenant', {
        headers: { Authorization: `Bearer ${token}` },
        params
      });
      setSchools(res.data.data);
    } catch (error) {
      console.error('Failed to fetch schools', error);
    }
  };

  useEffect(() => {
    fetchSchools();
  }, [search, statusFilter]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`http://localhost:5001/api/v1/tenant/${id}/status`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchSchools();
    } catch (error) {
      console.error('Failed to update status', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'suspended': return 'error';
      case 'inactive': return 'warning';
      default: return 'default';
    }
  };

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight="bold">School Directory</Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<Add />}
          onClick={() => navigate('/organization/onboarding')}
        >
          Add School
        </Button>
      </Box>

      <Box display="flex" gap={2} mb={3}>
        <TextField
          placeholder="Search schools..."
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{ startAdornment: <Search color="action" /> }}
        />
        <Select
          size="small"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <MenuItem value="all">All Statuses</MenuItem>
          <MenuItem value="active">Active</MenuItem>
          <MenuItem value="inactive">Inactive</MenuItem>
          <MenuItem value="suspended">Suspended</MenuItem>
        </Select>
      </Box>

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #e0e0e0', backgroundColor: '#f5f5f5' }}>
              <th style={{ padding: '16px' }}>School Name</th>
              <th style={{ padding: '16px' }}>Code</th>
              <th style={{ padding: '16px' }}>Admin</th>
              <th style={{ padding: '16px' }}>Status</th>
              <th style={{ padding: '16px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {schools.map(school => (
              <tr key={school._id} style={{ borderBottom: '1px solid #e0e0e0' }}>
                <td style={{ padding: '16px' }}>
                  <Typography variant="subtitle2">{school.name}</Typography>
                </td>
                <td style={{ padding: '16px' }}>
                  <Chip label={school.code} size="small" variant="outlined" />
                </td>
                <td style={{ padding: '16px' }}>
                  <Typography variant="body2">{school.adminName}</Typography>
                  <Typography variant="caption" color="textSecondary">{school.adminEmail}</Typography>
                </td>
                <td style={{ padding: '16px' }}>
                  <Chip 
                    label={school.status} 
                    size="small" 
                    color={getStatusColor(school.status) as any} 
                  />
                </td>
                <td style={{ padding: '16px' }}>
                  <IconButton size="small" onClick={() => navigate(`/super-admin/schools/${school._id}`)} title="View Details">
                    <Visibility fontSize="small" />
                  </IconButton>
                  {school.status === 'active' ? (
                    <IconButton size="small" color="error" onClick={() => handleStatusChange(school._id, 'suspended')} title="Suspend">
                      <Block fontSize="small" />
                    </IconButton>
                  ) : (
                    <IconButton size="small" color="success" onClick={() => handleStatusChange(school._id, 'active')} title="Activate">
                      <CheckCircle fontSize="small" />
                    </IconButton>
                  )}
                </td>
              </tr>
            ))}
            {schools.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: '24px', textAlign: 'center' }}>
                  <Typography color="textSecondary">No schools found</Typography>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Paper>
    </Box>
  );
};

export default SchoolDirectory;
