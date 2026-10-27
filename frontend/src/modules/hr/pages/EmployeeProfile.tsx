import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, Avatar, Chip, Tabs, Tab, CircularProgress } from '@mui/material';
import { useParams } from 'react-router-dom';
import { getStaffById } from '../../staff/api/staff.api';

const EmployeeProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [tab, setTab] = useState(0);
  const [employee, setEmployee] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      getStaffById(id).then(data => {
        setEmployee(data);
        setLoading(false);
      }).catch(err => {
        console.error(err);
        setLoading(false);
      });
    }
  }, [id]);

  if (loading) return <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>;
  if (!employee) return <Box sx={{ p: 4 }}><Typography color="error">Employee not found.</Typography></Box>;

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>Employee 360 Profile</Typography>
      
      <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
        <Avatar src={employee.photoUrl} sx={{ width: 100, height: 100 }}>
          {employee.firstName?.[0]}{employee.lastName?.[0]}
        </Avatar>
        <Box>
          <Typography variant="h5">{employee.firstName} {employee.lastName}</Typography>
          <Typography variant="subtitle1" color="textSecondary">ID: {employee.employeeIdNumber} | {employee.designationName}</Typography>
          <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
            <Chip label={employee.status} color={employee.status === 'ACTIVE' ? 'success' : 'default'} size="small" />
            <Chip label={employee.departmentName} color="primary" size="small" />
          </Box>
        </Box>
      </Paper>

      <Paper sx={{ width: '100%' }}>
        <Tabs value={tab} onChange={(_e, v) => setTab(v)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="Personal" />
          <Tab label="Employment" />
          <Tab label="Qualifications & Exp" />
          <Tab label="Documents" />
          <Tab label="Bank & Statutory (Secure)" />
        </Tabs>
        
        <Box sx={{ p: 3 }}>
          {tab === 0 && (
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography color="textSecondary">Mobile</Typography>
                <Typography>{employee.mobile || 'N/A'}</Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography color="textSecondary">Email</Typography>
                <Typography>{employee.email || 'N/A'}</Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography color="textSecondary">Emergency Contact</Typography>
                <Typography>{employee.emergencyContact?.name} ({employee.emergencyContact?.relationship}) - {employee.emergencyContact?.phone}</Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography color="textSecondary">Current Address</Typography>
                <Typography>{employee.address?.current || 'N/A'}</Typography>
              </Grid>
            </Grid>
          )}
          {tab === 1 && (
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography color="textSecondary">Joining Date</Typography>
                <Typography>{employee.joiningDate ? new Date(employee.joiningDate).toLocaleDateString() : 'N/A'}</Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography color="textSecondary">Employment Type</Typography>
                <Typography>{employee.employmentType || 'N/A'}</Typography>
              </Grid>
            </Grid>
          )}
          {tab === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom>Qualifications</Typography>
              {employee.qualifications?.length > 0 ? (
                <ul>{employee.qualifications.map((q: any, i: number) => <li key={i}>{q.degree} from {q.institution} ({q.year})</li>)}</ul>
              ) : <Typography color="textSecondary">No qualifications added.</Typography>}
              <Typography variant="h6" sx={{ mt: 2 }} gutterBottom>Experience</Typography>
              {employee.experience?.length > 0 ? (
                <ul>{employee.experience.map((e: any, i: number) => <li key={i}>{e.role} at {e.organization} ({e.duration})</li>)}</ul>
              ) : <Typography color="textSecondary">No experience added.</Typography>}
            </Box>
          )}
          {tab === 3 && <Typography>Document Vault Integration (Available via API /employees/:id/documents)</Typography>}
          {tab === 4 && (
            <Box>
              <Typography color="error" variant="subtitle2" gutterBottom>RESTRICTED ACCESS AREA</Typography>
              <Typography>Only HR and Finance can view this data.</Typography>
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default EmployeeProfile;
