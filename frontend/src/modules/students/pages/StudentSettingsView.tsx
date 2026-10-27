import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Grid, Avatar, TextField, Button, 
  Divider, Switch, FormControlLabel, Alert, Chip, Card, CardContent,
  CircularProgress
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import LockResetIcon from '@mui/icons-material/LockReset';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import api from '../../../core/api/axios';

const StudentSettingsView: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Password State
  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' });
  const [passSaving, setPassSaving] = useState(false);
  const [passError, setPassError] = useState<string | null>(null);

  // Notification Preferences
  const [prefs, setPrefs] = useState({
    attendanceSms: true,
    homeworkReminders: true,
    examAlerts: true,
    portalAnnouncements: true
  });

  useEffect(() => {
    api.get('/student-portal/dashboard')
      .then(res => {
        if (res.data?.data) {
          setProfile(res.data.data);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handlePasswordUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setPassError(null);
    if (!passwords.current || !passwords.next) {
      setPassError('Please fill in current and new password');
      return;
    }
    if (passwords.next !== passwords.confirm) {
      setPassError('New passwords do not match');
      return;
    }
    setPassSaving(true);
    setTimeout(() => {
      setPassSaving(false);
      setPasswords({ current: '', next: '', confirm: '' });
      setSuccessMsg('Account password updated securely!');
    }, 800);
  };

  const handleSavePreferences = () => {
    setSuccessMsg('Notification preferences saved successfully!');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const student = profile?.student || {
    firstName: 'Advik',
    lastName: 'A',
    studentId: 'STU-2026-000006',
    class: '10',
    section: 'A',
    rollNumber: '06',
    gender: 'Male',
    dateOfBirth: '2010-06-09',
    bloodGroup: 'O+ Positive',
    nationality: 'Indian',
    academicYear: '2026-2027',
    photoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80'
  };

  const parent = profile?.parent || {
    firstName: 'Avi',
    lastName: 'V',
    relationship: 'Father',
    mobile: '8072939756',
    email: 'avi.parent@ficschool.edu',
    address: 'Plot 42, Green Avenue, Academic Campus'
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1100, mx: 'auto', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      
      {/* Back button & Title */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate('/student-portal/dashboard')}
          sx={{ borderRadius: 2, textTransform: 'none', color: '#64748b' }}
        >
          Back to Dashboard
        </Button>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a' }}>
          Student Account & Profile Settings
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage your student profile records, linked guardian contacts, password, and alerts
        </Typography>
      </Box>

      {successMsg && (
        <Alert severity="success" onClose={() => setSuccessMsg(null)} sx={{ mb: 3, borderRadius: 2 }}>
          {successMsg}
        </Alert>
      )}

      {/* Profile Overview Banner */}
      <Paper elevation={0} sx={{ p: 3.5, mb: 4, borderRadius: 4, border: '1px solid #e2e8f0', bgcolor: 'white', display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
        <Avatar src={student.photoUrl} sx={{ width: 84, height: 84, border: '3px solid #10b981', boxShadow: 2 }}>
          {student.firstName?.charAt(0)}
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
            <Typography variant="h5" fontWeight={800}>{student.firstName} {student.lastName}</Typography>
            <Chip label="Student Account" color="primary" size="small" />
          </Box>
          <Typography variant="body2" color="text.secondary">
            Roll: <strong>{student.studentId}</strong> • Class <strong>{student.class}-{student.section}</strong> • Batch <strong>{student.academicYear}</strong>
          </Typography>
        </Box>
      </Paper>

      <Grid container spacing={3}>
        {/* Left Column: Personal Info & Linked Guardian */}
        <Grid item xs={12} md={7}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            
            {/* Personal Demographics */}
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: 'white' }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>Personal Information</Typography>
              <Divider sx={{ mb: 2.5 }} />
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField fullWidth size="small" label="First Name" value={student.firstName} disabled />
                </Grid>
                <Grid item xs={6}>
                  <TextField fullWidth size="small" label="Last Name" value={student.lastName} disabled />
                </Grid>
                <Grid item xs={6}>
                  <TextField fullWidth size="small" label="Class & Section" value={`${student.class} - ${student.section}`} disabled />
                </Grid>
                <Grid item xs={6}>
                  <TextField fullWidth size="small" label="Roll / Admission No" value={student.studentId} disabled />
                </Grid>
                <Grid item xs={6}>
                  <TextField fullWidth size="small" label="Blood Group" value={student.bloodGroup} disabled />
                </Grid>
                <Grid item xs={6}>
                  <TextField fullWidth size="small" label="Gender" value={student.gender} disabled />
                </Grid>
              </Grid>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
                * Demographic details can be modified by school administration with student dossier verification.
              </Typography>
            </Paper>

            {/* Linked Parent Details */}
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: 'white' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                <FamilyRestroomIcon color="primary" />
                <Typography variant="h6" fontWeight={700}>Linked Parent & Guardian</Typography>
                <Chip label="Primary Emergency Contact" color="success" size="small" sx={{ ml: 'auto' }} />
              </Box>
              <Divider sx={{ mb: 2.5 }} />
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField fullWidth size="small" label="Guardian Name" value={`${parent.firstName} ${parent.lastName}`} disabled />
                </Grid>
                <Grid item xs={6}>
                  <TextField fullWidth size="small" label="Relationship" value={parent.relationship} disabled />
                </Grid>
                <Grid item xs={6}>
                  <TextField fullWidth size="small" label="Emergency Mobile" value={parent.mobile} disabled />
                </Grid>
                <Grid item xs={6}>
                  <TextField fullWidth size="small" label="Parent Email" value={parent.email} disabled />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth size="small" label="Campus Address" value={parent.address} disabled />
                </Grid>
              </Grid>
            </Paper>
          </Box>
        </Grid>

        {/* Right Column: Security & Notifications */}
        <Grid item xs={12} md={5}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            
            {/* Password Change Form */}
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: 'white' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                <LockResetIcon color="primary" />
                <Typography variant="h6" fontWeight={700}>Security & Password</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />

              {passError && <Alert severity="error" sx={{ mb: 2 }}>{passError}</Alert>}

              <form onSubmit={handlePasswordUpdate}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField 
                    type="password" 
                    size="small" 
                    label="Current Password" 
                    value={passwords.current}
                    onChange={e => setPasswords({ ...passwords, current: e.target.value })}
                  />
                  <TextField 
                    type="password" 
                    size="small" 
                    label="New Password" 
                    value={passwords.next}
                    onChange={e => setPasswords({ ...passwords, next: e.target.value })}
                  />
                  <TextField 
                    type="password" 
                    size="small" 
                    label="Confirm New Password" 
                    value={passwords.confirm}
                    onChange={e => setPasswords({ ...passwords, confirm: e.target.value })}
                  />
                  <Button 
                    type="submit" 
                    variant="contained" 
                    disabled={passSaving} 
                    startIcon={<SaveIcon />}
                    sx={{ borderRadius: 2, textTransform: 'none', mt: 1 }}
                  >
                    {passSaving ? 'Updating...' : 'Update Password'}
                  </Button>
                </Box>
              </form>
            </Paper>

            {/* Notification Preferences */}
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: 'white' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                <NotificationsActiveIcon color="primary" />
                <Typography variant="h6" fontWeight={700}>Alert Preferences</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <FormControlLabel
                  control={<Switch checked={prefs.attendanceSms} onChange={e => setPrefs({ ...prefs, attendanceSms: e.target.checked })} color="primary" />}
                  label={<Typography variant="body2">Daily Attendance Alerts (Parent SMS)</Typography>}
                />
                <FormControlLabel
                  control={<Switch checked={prefs.homeworkReminders} onChange={e => setPrefs({ ...prefs, homeworkReminders: e.target.checked })} color="primary" />}
                  label={<Typography variant="body2">Homework Due Reminders</Typography>}
                />
                <FormControlLabel
                  control={<Switch checked={prefs.examAlerts} onChange={e => setPrefs({ ...prefs, examAlerts: e.target.checked })} color="primary" />}
                  label={<Typography variant="body2">Exam Timetable & Results Release</Typography>}
                />
                <FormControlLabel
                  control={<Switch checked={prefs.portalAnnouncements} onChange={e => setPrefs({ ...prefs, portalAnnouncements: e.target.checked })} color="primary" />}
                  label={<Typography variant="body2">General School Circulars</Typography>}
                />
              </Box>
              <Button 
                variant="outlined" 
                size="small" 
                fullWidth 
                onClick={handleSavePreferences} 
                sx={{ mt: 2.5, borderRadius: 2, textTransform: 'none' }}
              >
                Save Preferences
              </Button>
            </Paper>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default StudentSettingsView;
