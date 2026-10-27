import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Grid, Avatar, Chip, Button, 
  Tabs, Tab 
} from '@mui/material';
import { useParams, useNavigate, Routes, Route, useLocation } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import { getStaffById } from '../api/staff.api';
import type { StaffProfileDetail } from '../api/staff.api';
import PageHeader from '../../../core/components/PageHeader';
import StatusBadge from '../../../core/components/StatusBadge';
import EmptyState from '../../../core/components/EmptyState';
import LoadingState from '../../../core/components/LoadingState';

import StaffOverviewTab from '../components/StaffOverviewTab';
import StaffEmploymentTab from '../components/StaffEmploymentTab';
import StaffAcademicTab from '../components/StaffAcademicTab';

const StaffProfileShell: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [staff, setStaff] = useState<StaffProfileDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStaff = async () => {
      setLoading(true);
      try {
        if (id) {
          const data = await getStaffById(id);
          setStaff(data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchStaff();
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: 'auto' }}>
        <LoadingState type="skeleton-card" />
      </Box>
    );
  }

  if (!staff) {
    return (
      <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: 'auto' }}>
        <EmptyState 
          title="Staff Not Found"
          description="This staff member does not exist or has been removed."
          actionLabel="Back to Directory"
          onAction={() => navigate('/admin/staff')}
        />
      </Box>
    );
  }

  const currentTab = location.pathname.split('/').pop() || 'overview';
  const getTabValue = () => {
    switch (currentTab) {
      case 'employment': return 1;
      case 'academic': return 2;
      case 'documents': return 3;
      default: return 0;
    }
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    switch (newValue) {
      case 0: navigate(`/admin/staff/${id}`); break;
      case 1: navigate(`/admin/staff/${id}/employment`); break;
      case 2: navigate(`/admin/staff/${id}/academic`); break;
      case 3: navigate(`/admin/staff/${id}/documents`); break;
    }
  };



  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: 'auto' }}>
      
      <PageHeader 
        title="Staff Profile"
        breadcrumbs={[
          { label: 'Admin', href: '/admin/dashboard' },
          { label: 'Staff', href: '/admin/staff' },
          { label: 'Profile' }
        ]}
      />

      {/* Hero Header */}
      <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, mb: 4, border: '1px solid', borderColor: 'divider', borderRadius: 3, position: 'relative', overflow: 'hidden' }}>
        <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 80, bgcolor: 'primary.main', opacity: 0.05 }} />
        
        <Grid container spacing={3} sx={{ position: 'relative', zIndex: 1, alignItems: 'center' }}>
          <Grid>
            <Avatar 
              src={staff.photoUrl} 
              sx={{ width: 100, height: 100, border: '4px solid white', boxShadow: 1, bgcolor: 'primary.main', fontSize: '2rem' }}
            >
              {staff.firstName.charAt(0)}{staff.lastName.charAt(0)}
            </Avatar>
          </Grid>
          
          <Grid size="grow">
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1, alignItems: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 800 }}>{staff.firstName} {staff.lastName}</Typography>
              <Box sx={{ ml: { xs: 0, md: 2 } }}><StatusBadge status={staff.status} size="small" /></Box>
              {staff.isTeacher && <Chip label="Teaching Staff" color="info" size="small" variant="outlined" />}
            </Box>
            
            <Typography variant="h6" color="text.secondary" sx={{ mb: 2, fontWeight: 500 }}>
              {staff.designationName} • {staff.departmentName}
            </Typography>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                <BusinessCenterIcon fontSize="small" />
                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>{staff.employeeIdNumber}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                <EmailIcon fontSize="small" />
                <Typography variant="body2">{staff.email}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                <PhoneIcon fontSize="small" />
                <Typography variant="body2">{staff.mobile}</Typography>
              </Box>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, md: 'auto' }} sx={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Button variant="outlined" startIcon={<EditIcon />}>Edit Profile</Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Navigation & Content */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
        
        <Box sx={{ width: { xs: '100%', md: 200 }, flexShrink: 0 }}>
          <Tabs 
            orientation="vertical" 
            variant="scrollable"
            value={getTabValue()} 
            onChange={handleTabChange}
            sx={{ 
              borderRight: 1, borderColor: 'divider',
              '& .MuiTab-root': { alignItems: 'flex-start', textAlign: 'left', borderRadius: 2, mx: 1, minHeight: 48 }
            }}
          >
            <Tab label="Overview" />
            <Tab label="Employment History" />
            {staff.isTeacher && <Tab label="Academic Assignments" />}
            <Tab label="Documents" />
          </Tabs>
        </Box>

        <Box sx={{ flexGrow: 1 }}>
          <Routes>
            <Route path="/" element={<StaffOverviewTab staff={staff} />} />
            <Route path="employment" element={<StaffEmploymentTab staff={staff} />} />
            {staff.isTeacher && <Route path="academic" element={<StaffAcademicTab staff={staff} />} />}
            <Route path="documents" element={
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h6" color="text.secondary">Document storage integrated with Cloudinary.</Typography>
              </Box>
            } />
          </Routes>
        </Box>

      </Box>
    </Box>
  );
};

export default StaffProfileShell;
