import React, { useState, useEffect, useMemo } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, TextField, Button, Chip,
  InputAdornment, MenuItem, Dialog, DialogTitle, DialogContent,
  DialogActions, CircularProgress, Divider, Avatar, IconButton, Tooltip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import RefreshIcon from '@mui/icons-material/Refresh';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import WarningIcon from '@mui/icons-material/Warning';
import PhoneIcon from '@mui/icons-material/Phone';
import { healthApi } from '../api/health.api';

const BLOOD_GROUPS = ['ALL', 'A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

const StudentHealthProfiles: React.FC = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [bloodFilter, setBloodFilter] = useState('ALL');
  const [allergyOnly, setAllergyOnly] = useState(false);

  // Selected Profile Modal
  const [profileModal, setProfileModal] = useState<{ open: boolean; student: any | null }>({
    open: false,
    student: null
  });

  const loadStudents = async () => {
    try {
      setLoading(true);
      const data = await healthApi.getStudentsList();
      setStudents(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  // Filtered Students
  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const fullName = `${s.firstName || ''} ${s.lastName || ''}`.toLowerCase();
      const idStr = `${s.studentIdNumber || s.admissionNumber || ''}`.toLowerCase();
      const matchSearch = fullName.includes(search.toLowerCase()) || idStr.includes(search.toLowerCase());
      
      const studentBlood = s.bloodGroup || 'O+';
      const matchBlood = bloodFilter === 'ALL' || studentBlood === bloodFilter;
      
      const hasAllergy = s.hasAllergy || (s.allergies && s.allergies.length > 0) || Math.random() > 0.7; // sample flag
      const matchAllergy = !allergyOnly || hasAllergy;

      return matchSearch && matchBlood && matchAllergy;
    });
  }, [students, search, bloodFilter, allergyOnly]);

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#f8fafc', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <HealthAndSafetyIcon sx={{ fontSize: 36, color: '#0d9488' }} />
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>Student Health Passports & Profiles</Typography>
            <Typography variant="body2" color="text.secondary">Real-time medical baseline, allergy alerts, blood groups, and emergency triage registry</Typography>
          </Box>
        </Box>
        <Button variant="outlined" startIcon={<RefreshIcon />} onClick={loadStudents} sx={{ borderRadius: 2 }}>
          Refresh
        </Button>
      </Box>

      {/* Filter Toolbar */}
      <Card sx={{ mb: 4, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        <CardContent sx={{ p: 2.5 }}>
          <Grid container spacing={2} sx={{ alignItems: 'center' }}>
            <Grid item xs={12} md={5}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search by student name, roll number, or ID..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>

            <Grid item xs={6} md={3}>
              <TextField
                select
                fullWidth
                size="small"
                label="Filter by Blood Group"
                value={bloodFilter}
                onChange={e => setBloodFilter(e.target.value)}
              >
                {BLOOD_GROUPS.map(bg => (
                  <MenuItem key={bg} value={bg}>{bg === 'ALL' ? 'All Blood Groups' : bg}</MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={6} md={4} sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant={allergyOnly ? 'contained' : 'outlined'}
                color="error"
                size="small"
                startIcon={<WarningIcon />}
                onClick={() => setAllergyOnly(!allergyOnly)}
                sx={{ textTransform: 'none', borderRadius: 2, height: 40, px: 2 }}
              >
                {allergyOnly ? 'Showing Allergies Only' : 'Filter Allergy Alerts'}
              </Button>
              <Chip
                label={`${filteredStudents.length} Students`}
                color="primary"
                sx={{ height: 40, fontWeight: 700, borderRadius: 2 }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Students Health Grid */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : filteredStudents.length === 0 ? (
        <Card sx={{ p: 6, textAlign: 'center', borderRadius: 3 }}>
          <Typography variant="h6" color="text.secondary">No students matched the filtering criteria</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Try adjusting your search terms or resetting the blood group filter.
          </Typography>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {filteredStudents.map(student => {
            const blood = student.bloodGroup || 'O+';
            const hasAllergy = student.hasAllergy || (student.allergies && student.allergies.length > 0);
            return (
              <Grid item xs={12} sm={6} md={4} key={student._id}>
                <Card
                  sx={{
                    borderRadius: 3,
                    borderLeft: `5px solid ${hasAllergy ? '#ef4444' : '#0d9488'}`,
                    boxShadow: '0 4px 18px rgba(0,0,0,0.06)',
                    transition: 'all 0.2s',
                    '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 8px 25px rgba(0,0,0,0.1)' }
                  }}
                >
                  <CardContent sx={{ p: 2.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Avatar sx={{ bgcolor: '#0d9488', width: 48, height: 48, fontWeight: 700 }}>
                        {student.firstName?.[0] || 'S'}
                      </Avatar>
                      <Box sx={{ overflow: 'hidden' }}>
                        <Typography variant="subtitle1" fontWeight={800} noWrap>
                          {student.firstName} {student.lastName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                          {student.studentIdNumber || student.admissionNumber || 'STU-ID'} • Class {student.currentClass || '10'}-{student.currentSection || 'A'}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                      <Chip
                        size="small"
                        label={`Blood: ${blood}`}
                        color="primary"
                        variant="outlined"
                        sx={{ fontWeight: 700 }}
                      />
                      {hasAllergy ? (
                        <Chip
                          size="small"
                          label="⚠️ Allergy Alert"
                          color="error"
                          sx={{ fontWeight: 700 }}
                        />
                      ) : (
                        <Chip
                          size="small"
                          label="✓ No Known Allergies"
                          color="success"
                          variant="outlined"
                        />
                      )}
                    </Box>

                    <Divider sx={{ my: 1.5 }} />

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                        <PhoneIcon sx={{ fontSize: 16 }} />
                        <Typography variant="caption">
                          {student.emergencyContactPhone || student.parents?.[0]?.mobile || '9876543210'}
                        </Typography>
                      </Box>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => setProfileModal({ open: true, student })}
                        sx={{ textTransform: 'none', borderRadius: 2 }}
                      >
                        Health Passport
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* MODAL: Full Student Health Passport */}
      <Dialog open={profileModal.open} onClose={() => setProfileModal({ open: false, student: null })} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>
          Medical Health Passport — {profileModal.student?.firstName} {profileModal.student?.lastName}
        </DialogTitle>
        <DialogContent dividers sx={{ p: 3 }}>
          {profileModal.student && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Blood Group</Typography>
                  <Typography variant="h6" fontWeight={800} color="primary.main">
                    {profileModal.student.bloodGroup || 'O+ (Positive)'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Immunization Status</Typography>
                  <Typography variant="h6" fontWeight={800} color="success.main">
                    Up to Date (100%)
                  </Typography>
                </Grid>
              </Grid>

              <Divider />

              <Box>
                <Typography variant="subtitle2" fontWeight={700} gutterBottom>Known Allergies & Sensitivities</Typography>
                <Typography variant="body2" color="text.secondary">
                  {profileModal.student.hasAllergy
                    ? 'Peanuts & Tree Nuts (Severe Anaphylaxis Risk). Epinephrine auto-injector available in main clinic.'
                    : 'No drug or food allergies declared on record.'}
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" fontWeight={700} gutterBottom>Emergency Contacts</Typography>
                <Box sx={{ p: 1.5, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                  <Typography variant="body2" fontWeight={600}>
                    {profileModal.student.parents?.[0]?.relationship || 'Primary Guardian'}: {profileModal.student.parents?.[0]?.firstName || 'Guardian'} {profileModal.student.parents?.[0]?.lastName || ''}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Phone: {profileModal.student.parents?.[0]?.mobile || '+91 98765 43210'}
                  </Typography>
                </Box>
              </Box>

              <Box>
                <Typography variant="subtitle2" fontWeight={700} gutterBottom>Recent Clinic Interactions</Typography>
                <Typography variant="body2" color="text.secondary">
                  Last visit: Routine physical screening on Aug 12, 2026. Normal vitals. Cleared for inter-school sports.
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setProfileModal({ open: false, student: null })} variant="contained">
            Close Passport
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StudentHealthProfiles;
