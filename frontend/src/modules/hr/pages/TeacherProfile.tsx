import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, Typography, Paper, Grid, Avatar, Button, Tabs, Tab, 
  Divider, Card, CardContent, Chip, IconButton, Table, TableBody, TableCell, TableHead, TableRow
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import api from '../../../core/api/axios';
import LoadingState from '../../../core/components/LoadingState';
import StatusBadge from '../../../core/components/StatusBadge';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const TeacherProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    const fetchTeacher = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/teachers/${id}`);
        setData(res.data.data);
      } catch (error) {
        console.error('Failed to fetch teacher profile', error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchTeacher();
  }, [id]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (loading) return <LoadingState />;
  if (!data || !data.employee) return <Box p={4}><Typography color="error">Teacher not found</Typography></Box>;

  const { employee, profile, assignments, classTeacherAssignments } = data;

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
        <IconButton onClick={() => navigate(-1)}><ArrowBackIcon /></IconButton>
        <Typography variant="h4" fontWeight="bold">Teacher Profile</Typography>
      </Box>

      {/* Main Card */}
      <Paper sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Grid container spacing={4} alignItems="center">
          <Grid item>
            <Avatar 
              src={employee.photoUrl} 
              sx={{ width: 100, height: 100, bgcolor: 'primary.main', fontSize: '2rem' }}
            >
              {employee.firstName[0]}
            </Avatar>
          </Grid>
          <Grid item xs>
            <Typography variant="h4" fontWeight="bold">
              {employee.firstName} {employee.lastName}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              ID: {employee.employeeIdNumber}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
              <StatusBadge status={employee.status} />
              <Chip label={employee.employmentType} size="small" variant="outlined" />
            </Box>
          </Grid>
          <Grid item>
             <Button variant="outlined" color="primary">Manage Assignments</Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabs */}
      <Paper sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Overview" />
            <Tab label="Academic Assignments" />
            <Tab label="Class Coordinator" />
          </Tabs>
        </Box>
        
        {/* Tab 1: Overview */}
        <CustomTabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
               <Card variant="outlined">
                 <CardContent>
                   <Typography variant="h6" gutterBottom>Contact & Personal</Typography>
                   <Divider sx={{ mb: 2 }} />
                   <Typography variant="body2" color="text.secondary">Mobile</Typography>
                   <Typography variant="body1" gutterBottom>{employee.mobile}</Typography>
                   <Typography variant="body2" color="text.secondary" mt={1}>Email</Typography>
                   <Typography variant="body1">{employee.email}</Typography>
                   <Typography variant="body2" color="text.secondary" mt={1}>Gender</Typography>
                   <Typography variant="body1">{employee.gender}</Typography>
                 </CardContent>
               </Card>
            </Grid>
            <Grid item xs={12} md={6}>
               <Card variant="outlined">
                 <CardContent>
                   <Typography variant="h6" gutterBottom>Teaching Profile</Typography>
                   <Divider sx={{ mb: 2 }} />
                   {!profile ? (
                     <Typography variant="body2" color="text.secondary">No teaching profile configured.</Typography>
                   ) : (
                     <>
                        <Typography variant="body2" color="text.secondary">Specialization</Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                          {profile.subjectSpecialization?.map((sub: string) => (
                             <Chip key={sub} label={sub} size="small" />
                          ))}
                        </Box>
                        <Typography variant="body2" color="text.secondary">Experience</Typography>
                        <Typography variant="body1">{profile.teachingExperienceYears} Years</Typography>
                     </>
                   )}
                 </CardContent>
               </Card>
            </Grid>
          </Grid>
        </CustomTabPanel>

        {/* Tab 2: Academic Assignments (Subjects & Classes) */}
        <CustomTabPanel value={tabValue} index={1}>
           {assignments && assignments.length > 0 ? (
             <Table>
               <TableHead>
                 <TableRow>
                   <TableCell>Class</TableCell>
                   <TableCell>Section</TableCell>
                   <TableCell>Subject</TableCell>
                   <TableCell>Roles</TableCell>
                 </TableRow>
               </TableHead>
               <TableBody>
                 {assignments.map((assignment: any) => (
                   <TableRow key={assignment._id}>
                     <TableCell>{assignment.classId?.name}</TableCell>
                     <TableCell>{assignment.sectionId?.name}</TableCell>
                     <TableCell>{assignment.subjectId?.name} ({assignment.subjectId?.code})</TableCell>
                     <TableCell>
                       <Box sx={{ display: 'flex', gap: 1 }}>
                         {assignment.isClassCoordinator && <Chip size="small" color="primary" label="Coordinator" />}
                         {assignment.isExaminationIncharge && <Chip size="small" color="secondary" label="Exam Incharge" />}
                       </Box>
                     </TableCell>
                   </TableRow>
                 ))}
               </TableBody>
             </Table>
           ) : (
             <Box textAlign="center" py={4}>
               <Typography color="text.secondary">No subjects assigned for the current academic year.</Typography>
             </Box>
           )}
        </CustomTabPanel>

        {/* Tab 3: Class Coordinator */}
        <CustomTabPanel value={tabValue} index={2}>
           {classTeacherAssignments && classTeacherAssignments.length > 0 ? (
             <Table>
               <TableHead>
                 <TableRow>
                   <TableCell>Class</TableCell>
                   <TableCell>Section</TableCell>
                   <TableCell>Type</TableCell>
                 </TableRow>
               </TableHead>
               <TableBody>
                 {classTeacherAssignments.map((cta: any) => (
                   <TableRow key={cta._id}>
                     <TableCell>{cta.classId?.name}</TableCell>
                     <TableCell>{cta.sectionId?.name}</TableCell>
                     <TableCell>
                        <Chip size="small" color={cta.isPrimary ? "primary" : "default"} label={cta.isPrimary ? "Primary Class Teacher" : "Co-Teacher"} />
                     </TableCell>
                   </TableRow>
                 ))}
               </TableBody>
             </Table>
           ) : (
             <Box textAlign="center" py={4}>
               <Typography color="text.secondary">Not assigned as a class teacher for any sections.</Typography>
             </Box>
           )}
        </CustomTabPanel>
      </Paper>
    </Box>
  );
};

export default TeacherProfile;
