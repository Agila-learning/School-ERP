import React, { useState } from 'react';
import { 
  Box, Typography, Paper, Grid, TextField, Button, Card, CardContent, 
  Switch, FormControlLabel, Tabs, Tab, Divider
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const AlumniProfileManager: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [isEditing, setIsEditing] = useState(false);

  // Mock data
  const profile = {
    name: 'David Smith',
    batch: 'Class of 2021',
    program: 'B.Sc Computer Science',
    currentCity: 'Seattle',
    currentCountry: 'USA',
    bio: 'Software Engineer with a passion for web development and AI.',
    privacySettings: {
      profileVisibility: 'Alumni Only',
      contactVisibility: 'Private',
      mentorAvailability: true,
    },
    professionalLinks: {
      linkedIn: 'https://linkedin.com/in/davidsmith',
      github: 'https://github.com/davidsmith',
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>My Alumni Profile</Typography>
          <Typography variant="body2" color="text.secondary">Manage your professional information, visibility, and mentorship preferences</Typography>
        </Box>
        <Button 
          variant={isEditing ? 'contained' : 'outlined'} 
          color={isEditing ? 'success' : 'primary'}
          startIcon={isEditing ? <SaveIcon /> : <EditIcon />}
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? 'Save Changes' : 'Edit Profile'}
        </Button>
      </Box>

      <Paper variant="outlined" sx={{ mb: 4 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={(_, nv) => setTabValue(nv)}>
            <Tab label="Basic Info" />
            <Tab label="Career & Education" />
            <Tab label="Privacy Settings" />
          </Tabs>
        </Box>

        <CustomTabPanel value={tabValue} index={0}>
          <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField fullWidth label="Full Name" defaultValue={profile.name} disabled />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField fullWidth label="Batch / Class" defaultValue={profile.batch} disabled />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField fullWidth label="Current City" defaultValue={profile.currentCity} disabled={!isEditing} />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField fullWidth label="Current Country" defaultValue={profile.currentCountry} disabled={!isEditing} />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField fullWidth multiline rows={4} label="Bio / Summary" defaultValue={profile.bio} disabled={!isEditing} />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField fullWidth label="LinkedIn Profile" defaultValue={profile.professionalLinks.linkedIn} disabled={!isEditing} />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField fullWidth label="GitHub Profile" defaultValue={profile.professionalLinks.github} disabled={!isEditing} />
              </Grid>
            </Grid>
          </Box>
        </CustomTabPanel>

        <CustomTabPanel value={tabValue} index={1}>
          <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Employment History</Typography>
              {isEditing && <Button size="small" variant="outlined">Add Employment</Button>}
            </Box>
            <Card variant="outlined" sx={{ mb: 4 }}>
              <CardContent>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Software Engineer</Typography>
                <Typography variant="body2" color="text.secondary">Tech Corp Inc. • Seattle, USA</Typography>
                <Typography variant="caption" color="text.secondary">2022 - Present</Typography>
              </CardContent>
            </Card>

            <Divider sx={{ mb: 4 }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Higher Education</Typography>
              {isEditing && <Button size="small" variant="outlined">Add Education</Button>}
            </Box>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>M.S. Computer Science</Typography>
                <Typography variant="body2" color="text.secondary">University of Technology</Typography>
                <Typography variant="caption" color="text.secondary">2021 - 2023</Typography>
              </CardContent>
            </Card>
          </Box>
        </CustomTabPanel>

        <CustomTabPanel value={tabValue} index={2}>
          <Box sx={{ p: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>Profile Visibility</Typography>
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField select fullWidth label="Profile Visibility" defaultValue={profile.privacySettings.profileVisibility} disabled={!isEditing} slotProps={{ select: { native: true } }}>
                  <option>Public</option>
                  <option>Alumni Only</option>
                  <option>School Only</option>
                  <option>Private</option>
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField select fullWidth label="Contact Information" defaultValue={profile.privacySettings.contactVisibility} disabled={!isEditing} slotProps={{ select: { native: true } }}>
                  <option>Public</option>
                  <option>Alumni Only</option>
                  <option>School Only</option>
                  <option>Private</option>
                </TextField>
              </Grid>
            </Grid>

            <Divider sx={{ mb: 4 }} />
            
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>Mentorship Program</Typography>
            <FormControlLabel 
              control={<Switch defaultChecked={profile.privacySettings.mentorAvailability} disabled={!isEditing} />} 
              label="I am available to mentor current students and other alumni" 
            />
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
              Enabling this adds you to the Mentorship Hub where others can request guidance on career, higher studies, or industry knowledge.
            </Typography>
          </Box>
        </CustomTabPanel>

      </Paper>
    </Box>
  );
};

export default AlumniProfileManager;
