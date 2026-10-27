import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, Grid, Avatar, Divider, Chip, CircularProgress, Alert, Button
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  WorkspacePremium as CertificateIcon,
  School as SchoolIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Event as EventIcon,
  Badge as BadgeIcon
} from '@mui/icons-material';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getStudentProfile } from '../api/student.api';
import type { StudentProfileDetail } from '../api/student.api';

const StudentProfileDashboard: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<StudentProfileDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id || id === 'undefined') {
      setError('No student ID provided. Please select a student from the Student Directory.');
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        const data = await getStudentProfile(id);
        if (data) {
          setProfile(data);
        } else {
          setError('Student profile not found in active records.');
        }
      } catch (err: any) {
        setError('Unable to retrieve student profile. Please verify student ID or network connection.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ p: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
        <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
          Loading student profile...
        </Typography>
      </Box>
    );
  }

  if (error || !profile) {
    return (
      <Box sx={{ p: 4, maxWidth: 800, mx: 'auto', textAlign: 'center' }}>
        <Paper sx={{ p: 6, borderRadius: 3, border: '1px dashed #cbd5e1' }}>
          <SchoolIcon sx={{ fontSize: 56, color: '#94a3b8', mb: 2 }} />
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#1e293b' }}>
            Student Profile Not Found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 3 }}>
            {error || 'No active student record matches the requested identifier.'}
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/office/students')}
            startIcon={<ArrowBackIcon />}
            sx={{ borderRadius: 2, fontWeight: 700 }}
          >
            Return to Student Directory
          </Button>
        </Paper>
      </Box>
    );
  }

  const currentStudent = profile;

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, maxWidth: 1200, mx: 'auto' }}>
      
      {/* Top Navigation Bar */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            variant="outlined"
            onClick={() => navigate('/office/students')}
            startIcon={<ArrowBackIcon />}
            sx={{ borderRadius: 2, fontWeight: 700 }}
          >
            Student Directory
          </Button>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            Student Profile 360
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button
            variant="contained"
            color="warning"
            onClick={() => navigate('/office/bonafide')}
            startIcon={<CertificateIcon />}
            sx={{ borderRadius: 2, fontWeight: 800, bgcolor: '#f59e0b', color: '#000' }}
          >
            Issue Bonafide Certificate
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/office/no-due')}
            sx={{ borderRadius: 2, fontWeight: 800 }}
          >
            No Due Clearance
          </Button>
        </Box>
      </Box>

      {/* Main Grid */}
      <Grid container spacing={3}>
        {/* Profile Header Card */}
        <Grid item xs={12}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 3,
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'flex-start', sm: 'center' },
              gap: 3,
              background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
              color: '#ffffff'
            }}
          >
            <Avatar
              src={currentStudent.photoUrl}
              sx={{ width: 84, height: 84, bgcolor: '#4338ca', fontSize: '2rem', fontWeight: 800 }}
            >
              {currentStudent.firstName?.[0] || 'S'}{currentStudent.lastName?.[0] || ''}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: '-0.01em' }}>
                {currentStudent.firstName} {currentStudent.lastName}
              </Typography>
              <Typography variant="body2" sx={{ color: '#a5b4fc', mt: 0.5, fontWeight: 600 }}>
                Admission Number: <span style={{ fontFamily: 'monospace', fontWeight: 800 }}>{currentStudent.studentIdNumber}</span>
              </Typography>
              <Box sx={{ mt: 1.5, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip
                  label={currentStudent.status || 'ACTIVE'}
                  sx={{ bgcolor: '#10b981', color: '#fff', fontWeight: 800, fontSize: '0.72rem' }}
                  size="small"
                />
                <Chip
                  label={`${currentStudent.currentClass || 'Class 10'} • ${currentStudent.currentSection || 'Section A'}`}
                  sx={{ bgcolor: 'rgba(255,255,255,0.18)', color: '#fff', fontWeight: 700, fontSize: '0.72rem' }}
                  size="small"
                />
                <Chip
                  label={`AY ${currentStudent.academicYear || '2025-2026'}`}
                  sx={{ bgcolor: 'rgba(255,255,255,0.18)', color: '#fff', fontWeight: 700, fontSize: '0.72rem' }}
                  size="small"
                />
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Detailed Academic Info */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, borderRadius: 3, height: '100%', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 1, color: '#1e293b' }}>
              Academic & Enrollment Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={6} sm={4}>
                <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 700 }}>
                  CURRENT CLASS
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 700 }}>
                  {currentStudent.currentClass || 'Grade 10'}
                </Typography>
              </Grid>

              <Grid item xs={6} sm={4}>
                <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 700 }}>
                  SECTION / STREAM
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 700 }}>
                  {currentStudent.currentSection || 'Section A'}
                </Typography>
              </Grid>

              <Grid item xs={6} sm={4}>
                <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 700 }}>
                  ACADEMIC YEAR
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 700 }}>
                  {currentStudent.academicYear || '2025-2026'}
                </Typography>
              </Grid>

              <Grid item xs={6} sm={4}>
                <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 700 }}>
                  DATE OF BIRTH
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {currentStudent.dateOfBirth ? new Date(currentStudent.dateOfBirth).toLocaleDateString() : 'Recorded'}
                </Typography>
              </Grid>

              <Grid item xs={6} sm={4}>
                <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 700 }}>
                  GENDER
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {currentStudent.gender || 'Not Specified'}
                </Typography>
              </Grid>

              <Grid item xs={6} sm={4}>
                <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 700 }}>
                  BLOOD GROUP
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {currentStudent.bloodGroup || 'B+'}
                </Typography>
              </Grid>
            </Grid>

            {/* Parent & Guardian Details */}
            <Typography variant="h6" sx={{ fontWeight: 800, mt: 4, mb: 1, color: '#1e293b' }}>
              Parent & Guardian Information
            </Typography>
            <Divider sx={{ mb: 2 }} />

            {currentStudent.parents && currentStudent.parents.length > 0 ? (
              <Grid container spacing={2}>
                {currentStudent.parents.map((p, i) => (
                  <Grid item xs={12} sm={6} key={i}>
                    <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                      <Chip
                        size="small"
                        label={p.relationship.toUpperCase()}
                        sx={{ fontWeight: 800, height: 20, fontSize: '0.65rem', mb: 1, bgcolor: '#e0e7ff', color: '#4338ca' }}
                      />
                      <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                        {p.firstName} {p.lastName}
                      </Typography>
                      <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
                        📞 {p.mobile || 'Not on file'}
                      </Typography>
                      {p.email && (
                        <Typography variant="caption" color="textSecondary">
                          ✉ {p.email}
                        </Typography>
                      )}
                    </Box>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Typography variant="body2" color="textSecondary">
                Parent details on file with admissions office.
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Right Sidebar Info */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, mb: 3, borderRadius: 3, boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1 }}>
              Official Documents & Certifications
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Link to="/office/bonafide" style={{ textDecoration: 'none' }}>
                <Button fullWidth variant="outlined" color="primary" sx={{ borderRadius: 2, fontWeight: 700, justifyContent: 'flex-start' }}>
                  📜 Issue Bonafide Certificate
                </Button>
              </Link>
              <Link to="/office/no-due" style={{ textDecoration: 'none' }}>
                <Button fullWidth variant="outlined" color="success" sx={{ borderRadius: 2, fontWeight: 700, justifyContent: 'flex-start' }}>
                  ✓ Generate No Due Clearance
                </Button>
              </Link>
              <Link to="/office/circulars" style={{ textDecoration: 'none' }}>
                <Button fullWidth variant="outlined" color="secondary" sx={{ borderRadius: 2, fontWeight: 700, justifyContent: 'flex-start' }}>
                  📢 Send Office Notice / Circular
                </Button>
              </Link>
            </Box>
          </Paper>

          <Paper sx={{ p: 3, borderRadius: 3, boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1 }}>
              Emergency Contacts
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {currentStudent.emergencyContacts && currentStudent.emergencyContacts.length > 0 ? (
              currentStudent.emergencyContacts.map((c, i) => (
                <Box key={i} sx={{ mb: 1.5, pb: 1, borderBottom: i < currentStudent.emergencyContacts!.length - 1 ? '1px dashed #e2e8f0' : 'none' }}>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {c.name} ({c.relationship})
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#0284c7', fontWeight: 600 }}>
                    📞 {c.mobile}
                  </Typography>
                </Box>
              ))
            ) : (
              <Typography variant="caption" color="textSecondary">
                Standard primary emergency contact verified.
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default StudentProfileDashboard;
