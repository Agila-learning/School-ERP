import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, Typography, Paper, Grid, Avatar, Button, Tabs, Tab, 
  Divider, Card, CardContent, Chip, IconButton
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

const ParentProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [parent, setParent] = useState<any>(null);
  const [relationships, setRelationships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    const fetchParent = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/parents/${id}`);
        setParent(res.data.data.parent);
        setRelationships(res.data.data.relationships || []);
      } catch (error) {
        console.error('Failed to fetch parent profile', error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchParent();
  }, [id]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleUnlink = async (studentId: string) => {
    try {
      await api.delete(`/parents/${id}/relationships/${studentId}`);
      setRelationships(relationships.filter(r => r.studentId._id !== studentId));
    } catch (error) {
      console.error('Failed to unlink student', error);
    }
  };

  if (loading) return <LoadingState />;
  if (!parent) return <Box p={4}><Typography color="error">Parent not found</Typography></Box>;

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
        <IconButton onClick={() => navigate(-1)}><ArrowBackIcon /></IconButton>
        <Typography variant="h4" fontWeight="bold">Parent Profile</Typography>
      </Box>

      {/* Main Card */}
      <Paper sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Grid container spacing={4} alignItems="center">
          <Grid item>
            <Avatar 
              src={parent.profilePhotoUrl} 
              sx={{ width: 100, height: 100, bgcolor: 'primary.main', fontSize: '2rem' }}
            >
              {parent.firstName[0]}
            </Avatar>
          </Grid>
          <Grid item xs>
            <Typography variant="h4" fontWeight="bold">
              {parent.firstName} {parent.lastName}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              {parent.relationship}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
              <StatusBadge status={parent.accountStatus} />
              <Chip label={parent.verificationStatus} size="small" variant="outlined" />
            </Box>
          </Grid>
          <Grid item>
             <Button variant="outlined" color="primary">Edit Profile</Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabs */}
      <Paper sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Overview" />
            <Tab label="Personal Details" />
            <Tab label={`Linked Children (${relationships.length})`} />
          </Tabs>
        </Box>
        
        {/* Tab 1: Overview */}
        <CustomTabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
               <Card variant="outlined">
                 <CardContent>
                   <Typography variant="h6" gutterBottom>Contact Information</Typography>
                   <Divider sx={{ mb: 2 }} />
                   <Typography variant="body2" color="text.secondary">Mobile</Typography>
                   <Typography variant="body1" gutterBottom>{parent.mobile}</Typography>
                   <Typography variant="body2" color="text.secondary" mt={1}>Email</Typography>
                   <Typography variant="body1">{parent.email || 'N/A'}</Typography>
                 </CardContent>
               </Card>
            </Grid>
            <Grid item xs={12} md={6}>
               <Card variant="outlined">
                 <CardContent>
                   <Typography variant="h6" gutterBottom>Linked Children</Typography>
                   <Divider sx={{ mb: 2 }} />
                   {relationships.length === 0 ? (
                     <Typography variant="body2" color="text.secondary">No children linked yet.</Typography>
                   ) : (
                     relationships.map(rel => (
                       <Box key={rel._id} sx={{ mb: 1, p: 1, bgcolor: 'background.default', borderRadius: 1 }}>
                         <Typography variant="subtitle2">
                           {rel.studentId.firstName} {rel.studentId.lastName}
                         </Typography>
                         <Typography variant="caption" color="text.secondary">
                           ID: {rel.studentId.studentIdNumber} | Relationship: {rel.relationshipType}
                         </Typography>
                       </Box>
                     ))
                   )}
                 </CardContent>
               </Card>
            </Grid>
          </Grid>
        </CustomTabPanel>

        {/* Tab 2: Personal Details */}
        <CustomTabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">Occupation</Typography>
              <Typography variant="body1" gutterBottom>{parent.occupation || 'N/A'}</Typography>
              
              <Typography variant="subtitle2" color="text.secondary" mt={2}>Employer</Typography>
              <Typography variant="body1" gutterBottom>{parent.employer || 'N/A'}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">Address</Typography>
              <Typography variant="body1" gutterBottom>
                {parent.address?.currentAddress || 'N/A'}<br/>
                {parent.address?.city} {parent.address?.state} {parent.address?.postalCode}
              </Typography>
            </Grid>
          </Grid>
        </CustomTabPanel>

        {/* Tab 3: Linked Children */}
        <CustomTabPanel value={tabValue} index={2}>
           {relationships.length === 0 ? (
             <Box textAlign="center" py={4}>
               <Typography color="text.secondary">No students linked to this parent.</Typography>
             </Box>
           ) : (
             <Grid container spacing={2}>
               {relationships.map(rel => (
                 <Grid item xs={12} md={6} key={rel._id}>
                   <Card variant="outlined">
                     <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Box sx={{ display: 'flex', gap: 2 }}>
                            <Avatar src={rel.studentId.photoUrl}>{rel.studentId.firstName[0]}</Avatar>
                            <Box>
                              <Typography variant="h6">{rel.studentId.firstName} {rel.studentId.lastName}</Typography>
                              <Typography variant="body2" color="text.secondary">
                                Student ID: {rel.studentId.studentIdNumber}
                              </Typography>
                              <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                                {rel.isPrimaryGuardian && <Chip size="small" label="Primary Guardian" color="primary" />}
                                {rel.isEmergencyContact && <Chip size="small" label="Emergency Contact" color="error" />}
                              </Box>
                            </Box>
                          </Box>
                          <Button
                            variant="outlined" 
                            color="error" 
                            size="small"
                            onClick={() => handleUnlink(rel.studentId._id)}
                          >
                            Unlink
                          </Button>
                        </Box>
                     </CardContent>
                   </Card>
                 </Grid>
               ))}
             </Grid>
           )}
        </CustomTabPanel>

      </Paper>
    </Box>
  );
};

export default ParentProfile;
