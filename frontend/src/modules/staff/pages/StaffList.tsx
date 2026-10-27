import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Button, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, IconButton, Tooltip,
  Avatar, TextField, InputAdornment, Chip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../../core/components/PageHeader';
import StatusBadge from '../../../core/components/StatusBadge';
import EmptyState from '../../../core/components/EmptyState';
import LoadingState from '../../../core/components/LoadingState';
import { getStaffList } from '../api/staff.api';
import type { StaffSummary } from '../api/staff.api';

const StaffList: React.FC = () => {
  const navigate = useNavigate();
  const [staffList, setStaffList] = useState<StaffSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchStaff = async () => {
      setLoading(true);
      try {
        const data = await getStaffList();
        setStaffList(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchStaff();
  }, []);

  const filteredStaff = staffList.filter(s => 
    (s.firstName + ' ' + s.lastName).toLowerCase().includes(search.toLowerCase()) ||
    (s.employeeIdNumber || '').toLowerCase().includes(search.toLowerCase()) ||
    (s.departmentName || '').toLowerCase().includes(search.toLowerCase())
  );



  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: 'auto' }}>
      <PageHeader 
        title="Staff Directory"
        description="Manage teachers, administration, and support staff."
        breadcrumbs={[
          { label: 'Admin', href: '/admin/dashboard' },
          { label: 'Staff', href: '/admin/staff' },
          { label: 'Directory' }
        ]}
        primaryAction={
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/admin/staff/new')}>
            Onboard Staff
          </Button>
        }
      />

      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, overflow: 'hidden' }}>
        
        {/* Toolbar */}
        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'grey.50' }}>
          <TextField
            size="small"
            placeholder="Search by name, ID, or department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ width: { xs: '100%', md: 400 }, bgcolor: 'white' }}
            slotProps={{
              input: {
                startAdornment: <InputAdornment position="start"><SearchIcon color="action" fontSize="small" /></InputAdornment>
              }
            }}
          />
        </Box>

        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: 'grey.50' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Employee</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>ID</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Role</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} sx={{ p: 0 }}>
                    <LoadingState type="skeleton-table" />
                  </TableCell>
                </TableRow>
              ) : filteredStaff.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} sx={{ p: 0 }}>
                    <EmptyState 
                      title="No staff found"
                      description={search ? "Try adjusting your search criteria." : "Get started by onboarding your first staff member."}
                      actionLabel={!search ? "Onboard Staff" : undefined}
                      onAction={!search ? () => navigate('/admin/staff/new') : undefined}
                    />
                  </TableCell>
                </TableRow>
              ) : (
                filteredStaff.map((staff, idx) => {
                  const palettes = [
                    { border: '#6366f1', avatarBg: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', badgeBg: '#eef2ff', badgeText: '#4338ca', hover: '#fafbff' },
                    { border: '#06b6d4', avatarBg: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)', badgeBg: '#ecfeff', badgeText: '#0e7490', hover: '#f0fdfa' },
                    { border: '#10b981', avatarBg: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', badgeBg: '#ecfdf5', badgeText: '#047857', hover: '#f0fdf4' },
                    { border: '#f59e0b', avatarBg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', badgeBg: '#fffbeb', badgeText: '#b45309', hover: '#fffdf5' },
                    { border: '#ec4899', avatarBg: 'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)', badgeBg: '#fdf2f8', badgeText: '#be185d', hover: '#fff1f2' },
                    { border: '#8b5cf6', avatarBg: 'linear-gradient(135deg, #8b5cf6 0%, #c084fc 100%)', badgeBg: '#f5f3ff', badgeText: '#6d28d9', hover: '#faf5ff' },
                  ];
                  const p = palettes[idx % palettes.length];

                  return (
                    <TableRow 
                      key={staff.id} 
                      hover
                      sx={{ 
                        borderLeft: `4px solid ${p.border}`,
                        transition: 'all 0.2s ease',
                        '&:hover': { bgcolor: p.hover }
                      }}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar 
                            src={staff.photoUrl} 
                            alt={staff.firstName} 
                            sx={{ 
                              width: 42, 
                              height: 42, 
                              background: p.avatarBg,
                              fontWeight: 700,
                              boxShadow: '0 3px 8px rgba(0,0,0,0.12)'
                            }}
                          >
                            {staff.firstName.charAt(0)}{staff.lastName.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                              {staff.firstName} {staff.lastName}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#64748b' }}>
                              {staff.branchName || 'Main Campus'}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600, color: '#334155' }}>
                          {staff.employeeIdNumber}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, alignItems: 'flex-start' }}>
                          <Chip 
                            label={staff.designationName || 'Staff Member'} 
                            size="small" 
                            sx={{ 
                              bgcolor: p.badgeBg, 
                              color: p.badgeText, 
                              fontWeight: 700, 
                              borderRadius: '6px',
                              fontSize: '0.75rem'
                            }} 
                          />
                          <Typography variant="caption" color="text.secondary">
                            {staff.departmentName || 'Academics'}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={staff.employmentType || 'Permanent'} 
                          size="small" 
                          variant="outlined" 
                          sx={{ fontWeight: 600, fontSize: '0.75rem' }} 
                        />
                      </TableCell>
                      <TableCell><StatusBadge status={staff.status} /></TableCell>
                      <TableCell align="right">
                        <Tooltip title="View Profile">
                          <IconButton size="small" color="primary" onClick={() => navigate(`/admin/staff/${staff.id}`)}>
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton size="small" color="info">
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default StaffList;
