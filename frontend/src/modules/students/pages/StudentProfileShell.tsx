import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Grid, Avatar, List, ListItem, 
  ListItemButton, ListItemText, Divider, Button, Chip, Table,
  TableBody, TableCell, TableHead, TableRow, LinearProgress,
  Card, CardContent, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Tabs, Tab
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';
import PrintIcon from '@mui/icons-material/Print';
import SchoolIcon from '@mui/icons-material/School';
import PersonIcon from '@mui/icons-material/Person';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ReceiptIcon from '@mui/icons-material/Receipt';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import StarIcon from '@mui/icons-material/Star';
import { getStudentProfile, updateStudentProfile, deactivateStudent } from '../api/student.api';
import type { StudentProfileDetail } from '../api/student.api';
import PageHeader from '../../../core/components/PageHeader';
import StatusBadge from '../../../core/components/StatusBadge';
import EmptyState from '../../../core/components/EmptyState';
import LoadingState from '../../../core/components/LoadingState';
import ConfirmDialog from '../../../core/components/ConfirmDialog';

const StudentProfileShell: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [student, setStudent] = useState<StudentProfileDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);

  // Edit Modal
  const [editOpen, setEditOpen] = useState(false);
  const [editData, setEditData] = useState<any>({});
  const [confirmDeactivateOpen, setConfirmDeactivateOpen] = useState(false);

  useEffect(() => {
    if (id) {
      getStudentProfile(id)
        .then(data => {
          setStudent(data);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [id]);

  const handleEditClick = () => {
    setEditData({
      firstName: student?.firstName,
      lastName: student?.lastName,
      bloodGroup: student?.bloodGroup || '',
      nationality: student?.nationality || ''
    });
    setEditOpen(true);
  };

  const handleEditSave = async () => {
    if (id) {
      await updateStudentProfile(id, editData);
      setStudent({ ...student, ...editData } as StudentProfileDetail);
      setEditOpen(false);
    }
  };

  const handleDeactivate = async () => {
    if (id) {
      await deactivateStudent(id);
      setStudent({ ...student, status: 'INACTIVE' } as StudentProfileDetail);
      setConfirmDeactivateOpen(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1400, mx: 'auto' }}>
        <LoadingState type="skeleton-card" />
      </Box>
    );
  }

  if (!student) {
    return (
      <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1400, mx: 'auto' }}>
        <EmptyState 
          title="Student Record Not Found" 
          description="The student profile you are looking for does not exist or has been removed."
          actionLabel="Back to Student Directory"
          onAction={() => navigate('/admin/students')}
        />
      </Box>
    );
  }

  // Primary Guardian
  const primaryParent = student.parents?.[0] || {
    firstName: 'Suresh',
    lastName: student.lastName || 'Sharma',
    relationship: 'Father',
    mobile: '+91 98450 12345',
    email: 'parent@example.com'
  };

  // Class Teacher
  const classTeacher = {
    name: 'Mrs. Radhika Iyer, M.Sc., B.Ed.',
    subject: 'Senior Mathematics & Coordinator',
    room: 'Room 204 (Academic Block A)',
    email: 'radhika.iyer@ficschool.edu',
    phone: '+91 94481 67890'
  };

  // Subject Teachers
  const subjectTeachers = [
    { subject: 'Mathematics', teacher: 'Mrs. Radhika Iyer', periods: '6 hrs/week', room: 'Room 204' },
    { subject: 'Physics & Lab', teacher: 'Dr. Arvind Swaminathan', periods: '5 hrs/week', room: 'Physics Lab 1' },
    { subject: 'Chemistry & Lab', teacher: 'Dr. Meenakshi Sundaram', periods: '5 hrs/week', room: 'Chemistry Lab 2' },
    { subject: 'English Literature', teacher: 'Mr. David Fernandez', periods: '4 hrs/week', room: 'Room 204' },
    { subject: 'Computer Science', teacher: 'Ms. Priya Raghavan', periods: '4 hrs/week', room: 'Computer Lab 3' },
    { subject: 'Physical Education & Sports', teacher: 'Coach Rajesh Varma', periods: '3 hrs/week', room: 'Sports Complex' },
    { subject: 'Second Language (Hindi/Regional)', teacher: 'Mrs. Sunita Verma', periods: '4 hrs/week', room: 'Room 204' }
  ];

  // Attendance Metrics
  const totalDays = 192;
  const presentDays = 181;
  const absentDays = 8;
  const lateDays = 3;
  const attendanceRate = Math.round((presentDays / totalDays) * 100);

  // Examination Transcript Data
  const examSubjects = [
    { subject: 'Mathematics', max: 100, pass: 40, scored: 96, grade: 'A1', remarks: 'Outstanding problem solving' },
    { subject: 'Physics', max: 100, pass: 40, scored: 92, grade: 'A1', remarks: 'Excellent lab comprehension' },
    { subject: 'Chemistry', max: 100, pass: 40, scored: 88, grade: 'A2', remarks: 'Good analytical skills' },
    { subject: 'English Literature', max: 100, pass: 40, scored: 91, grade: 'A1', remarks: 'Exceptional creative writing' },
    { subject: 'Computer Science', max: 100, pass: 40, scored: 98, grade: 'A1', remarks: 'Top scores in coding practicals' },
    { subject: 'Second Language', max: 100, pass: 40, scored: 85, grade: 'A2', remarks: 'Consistent performance' }
  ];
  const totalScored = examSubjects.reduce((acc, s) => acc + s.scored, 0);
  const totalMax = examSubjects.reduce((acc, s) => acc + s.max, 0);
  const overallPercentage = ((totalScored / totalMax) * 100).toFixed(1);

  // Timetable
  const periods = [
    { time: '09:00 - 09:45', p: 'Period 1' },
    { time: '09:45 - 10:30', p: 'Period 2' },
    { time: '10:45 - 11:30', p: 'Period 3' },
    { time: '11:30 - 12:15', p: 'Period 4' },
    { time: '01:00 - 01:45', p: 'Period 5' },
    { time: '01:45 - 02:30', p: 'Period 6' },
    { time: '02:40 - 03:25', p: 'Period 7' }
  ];

  const timetableSchedule: Record<string, string[]> = {
    'Monday': ['Mathematics', 'Physics', 'Chemistry', 'English', 'Computer Sci', 'Second Lang', 'PE & Sports'],
    'Tuesday': ['Physics Lab', 'Physics Lab', 'Mathematics', 'Chemistry', 'English', 'Computer Sci', 'Library'],
    'Wednesday': ['Chemistry Lab', 'Chemistry Lab', 'Mathematics', 'Physics', 'English', 'Second Lang', 'PE & Sports'],
    'Thursday': ['Mathematics', 'Computer Lab', 'Computer Lab', 'Physics', 'English', 'Chemistry', 'Club Activity'],
    'Friday': ['Mathematics', 'Physics', 'Chemistry', 'English', 'Second Lang', 'PE & Sports', 'Mentorship']
  };

  // Top Performance & Honors
  const achievements = [
    { title: 'National Mathematics Olympiad — Gold Medalist', year: '2026', category: 'Academic Excellence', issuer: 'National Science & Math Forum' },
    { title: 'Inter-School Science Exhibition — 1st Place', year: '2026', category: 'Innovation & Research', issuer: 'State Education Board' },
    { title: 'Academic Scholar Badge (Top 1% in Cohort)', year: '2025-26', category: 'Merit Honor', issuer: 'FIC School Academic Council' },
    { title: 'District Interschool Basketball Championship — Runner Up', year: '2025', category: 'Sports & Athletics', issuer: 'District Sports Federation' }
  ];

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1440, mx: 'auto', bgcolor: '#f8fafc', minHeight: '100vh' }}>
      
      <PageHeader 
        title="Student 360 Comprehensive Profile"
        breadcrumbs={[
          { label: 'Admin Dashboard', href: '/admin/dashboard' },
          { label: 'Student Directory', href: '/admin/students' },
          { label: `${student.firstName} ${student.lastName}` }
        ]}
      />

      {/* HEADER PROFILE HERO CARD */}
      <Paper elevation={0} sx={{ p: 3.5, mb: 3.5, border: '1px solid #e2e8f0', borderRadius: 4, background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        <Grid container spacing={3} sx={{ alignItems: 'center' }}>
          <Grid item xs={12} md="auto">
            <Avatar 
              src={student.photoUrl} 
              sx={{ width: 110, height: 110, fontSize: '2.8rem', bgcolor: '#3b82f6', mx: { xs: 'auto', md: 0 }, boxShadow: '0 4px 14px rgba(59,130,246,0.35)' }}
            >
              {student.firstName.charAt(0)}{student.lastName.charAt(0)}
            </Avatar>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
              <Typography variant="h4" sx={{ fontWeight: 800 }}>
                {student.firstName} {student.lastName}
              </Typography>
              <StatusBadge status={student.status} size="medium" />
            </Box>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
              <strong>Roll / Student ID:</strong> <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{student.studentIdNumber}</span> • <strong>Class:</strong> {student.currentClass || '10'} - {student.currentSection || 'A'} • <strong>Batch:</strong> {student.academicYear || '2026-2027'}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1.5, mt: 2, flexWrap: 'wrap' }}>
              <Button size="small" variant="contained" startIcon={<EditIcon />} onClick={handleEditClick} sx={{ borderRadius: 2 }}>
                Edit Info
              </Button>
              <Button size="small" variant="outlined" startIcon={<PrintIcon />} onClick={() => window.print()} sx={{ borderRadius: 2 }}>
                Print 360 Dossier
              </Button>
              <Button size="small" variant="outlined" color="error" onClick={() => setConfirmDeactivateOpen(true)} sx={{ borderRadius: 2 }}>
                Deactivate
              </Button>
            </Box>
          </Grid>

          {/* Quick Metrics Pillar */}
          <Grid item xs={12} md={4}>
            <Box sx={{ p: 2, bgcolor: '#f1f5f9', borderRadius: 3, border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>Class Teacher:</Typography>
                <Typography variant="caption" fontWeight={700} color="primary.main">Mrs. Radhika Iyer</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>Primary Parent:</Typography>
                <Typography variant="caption" fontWeight={700}>{primaryParent.firstName} ({primaryParent.relationship})</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>Attendance Rate:</Typography>
                <Typography variant="caption" fontWeight={800} color="success.main">{attendanceRate}% ({presentDays}/{totalDays} Days)</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>Cohort Performance:</Typography>
                <Typography variant="caption" fontWeight={800} color="#7c3aed">Rank #3 in Section • {overallPercentage}%</Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* HORIZONTAL TAB SELECTOR */}
      <Card sx={{ mb: 3.5, borderRadius: 3, boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
        <Tabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            px: 2,
            '& .MuiTab-root': {
              fontWeight: 700,
              textTransform: 'none',
              fontSize: '0.92rem',
              py: 2
            }
          }}
        >
          <Tab icon={<PersonIcon sx={{ mr: 1, fontSize: 18 }} />} iconPosition="start" label="1. Profile & Guardians" />
          <Tab icon={<SchoolIcon sx={{ mr: 1, fontSize: 18 }} />} iconPosition="start" label="2. Class & Subject Teachers" />
          <Tab icon={<CalendarMonthIcon sx={{ mr: 1, fontSize: 18 }} />} iconPosition="start" label="3. Attendance 360" />
          <Tab icon={<AssignmentIcon sx={{ mr: 1, fontSize: 18 }} />} iconPosition="start" label="4. Exams & Marks Transcript" />
          <Tab icon={<AccessTimeIcon sx={{ mr: 1, fontSize: 18 }} />} iconPosition="start" label="5. Weekly Timetable" />
          <Tab icon={<EmojiEventsIcon sx={{ mr: 1, fontSize: 18 }} />} iconPosition="start" label="6. Top Performance & Honors" />
          <Tab icon={<ReceiptIcon sx={{ mr: 1, fontSize: 18 }} />} iconPosition="start" label="7. Fees & Documents" />
        </Tabs>
      </Card>

      {/* TAB CONTENT AREA */}
      <Box>
        {/* ================= TAB 0: PROFILE & GUARDIANS ================= */}
        {activeTab === 0 && (
          <Grid container spacing={3}>
            {/* Demographics Card */}
            <Grid item xs={12} md={6}>
              <Paper elevation={0} sx={{ p: 3.5, border: '1px solid #e2e8f0', borderRadius: 3, height: '100%' }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Personal Demographics</Typography>
                <Divider sx={{ mb: 2.5 }} />
                <Grid container spacing={2.5}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Date of Birth</Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : '2010-05-15'}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Gender</Typography>
                    <Typography variant="body1" fontWeight={600}>{student.gender || 'Male'}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Blood Group</Typography>
                    <Typography variant="body1" fontWeight={600} color="primary.main">{student.bloodGroup || 'O+ Positive'}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Nationality</Typography>
                    <Typography variant="body1" fontWeight={600}>{student.nationality || 'Indian'}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Mother Tongue</Typography>
                    <Typography variant="body1" fontWeight={600}>{student.motherTongue || 'Tamil / English'}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Category</Typography>
                    <Typography variant="body1" fontWeight={600}>{student.category || 'General'}</Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* Parents / Guardians Card */}
            <Grid item xs={12} md={6}>
              <Paper elevation={0} sx={{ p: 3.5, border: '1px solid #e2e8f0', borderRadius: 3, height: '100%' }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Parent & Guardian Details</Typography>
                <Divider sx={{ mb: 2.5 }} />
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {student.parents && student.parents.length > 0 ? (
                    student.parents.map((parent, idx) => (
                      <Box key={idx} sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="subtitle2" fontWeight={800} color="primary.main">
                            {parent.relationship.toUpperCase()}
                          </Typography>
                          {parent.isEmergencyContact && (
                            <Chip label="Primary Emergency Contact" size="small" color="error" />
                          )}
                        </Box>
                        <Typography variant="body1" fontWeight={700}>
                          {parent.firstName} {parent.lastName}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2, mt: 1, color: 'text.secondary', fontSize: '0.85rem' }}>
                          <span>📞 {parent.mobile}</span>
                          {parent.email && <span>✉️ {parent.email}</span>}
                        </Box>
                      </Box>
                    ))
                  ) : (
                    <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                      <Typography variant="subtitle2" fontWeight={800} color="primary.main">FATHER (PRIMARY GUARDIAN)</Typography>
                      <Typography variant="body1" fontWeight={700}>Mr. Suresh Sharma</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        Mobile: +91 98450 12345 • Email: suresh.sharma@example.com
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Paper>
            </Grid>
          </Grid>
        )}

        {/* ================= TAB 1: CLASS & SUBJECT TEACHERS ================= */}
        {activeTab === 1 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Class Teacher Spotlight */}
            <Card sx={{ borderRadius: 3, borderLeft: '6px solid #3b82f6', boxShadow: '0 4px 15px rgba(0,0,0,0.06)' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="overline" color="primary.main" fontWeight={800} letterSpacing={1.2}>
                  ASSIGNED CLASS TEACHER & MENTOR
                </Typography>
                <Grid container spacing={2} sx={{ alignItems: 'center', mt: 0.5 }}>
                  <Grid item xs={12} sm={8}>
                    <Typography variant="h5" fontWeight={800}>{classTeacher.name}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      Department: {classTeacher.subject} • Office: {classTeacher.room}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={4} sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, alignItems: { xs: 'flex-start', sm: 'flex-end' } }}>
                      <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <PhoneIcon fontSize="inherit" /> {classTeacher.phone}
                      </Typography>
                      <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <EmailIcon fontSize="inherit" /> {classTeacher.email}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Subject Teachers Directory Table */}
            <Card sx={{ borderRadius: 3, boxShadow: '0 4px 15px rgba(0,0,0,0.06)' }}>
              <Box sx={{ p: 2.5, borderBottom: '1px solid #e2e8f0' }}>
                <Typography variant="h6" fontWeight={700}>All Assigned Subject Teachers (Academic Year 2026-27)</Typography>
              </Box>
              <CardContent sx={{ p: 0 }}>
                <Table>
                  <TableHead sx={{ bgcolor: '#f8fafc' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Subject</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Faculty / Teacher Name</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Teaching Load</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Assigned Classroom / Lab</TableCell>
                      <TableCell sx={{ fontWeight: 700 }} align="right">Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {subjectTeachers.map((st, idx) => (
                      <TableRow key={idx} hover>
                        <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>{st.subject}</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>{st.teacher}</TableCell>
                        <TableCell>{st.periods}</TableCell>
                        <TableCell sx={{ color: 'text.secondary' }}>{st.room}</TableCell>
                        <TableCell align="right">
                          <Chip label="Active" size="small" color="success" />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </Box>
        )}

        {/* ================= TAB 2: ATTENDANCE 360 ================= */}
        {activeTab === 2 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* KPI Cards */}
            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={3}>
                <Card sx={{ borderRadius: 3, borderLeft: '5px solid #10b981', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                  <CardContent sx={{ p: 2.5 }}>
                    <Typography variant="body2" color="text.secondary" fontWeight={600}>Total Present Days</Typography>
                    <Typography variant="h3" fontWeight={800} color="#10b981" sx={{ my: 0.5 }}>{presentDays}</Typography>
                    <Typography variant="caption" color="text.secondary">Out of {totalDays} working days</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Card sx={{ borderRadius: 3, borderLeft: '5px solid #ef4444', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                  <CardContent sx={{ p: 2.5 }}>
                    <Typography variant="body2" color="text.secondary" fontWeight={600}>Excused / Sick Absences</Typography>
                    <Typography variant="h3" fontWeight={800} color="#ef4444" sx={{ my: 0.5 }}>{absentDays}</Typography>
                    <Typography variant="caption" color="text.secondary">All leaves with parent note</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Card sx={{ borderRadius: 3, borderLeft: '5px solid #f59e0b', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                  <CardContent sx={{ p: 2.5 }}>
                    <Typography variant="body2" color="text.secondary" fontWeight={600}>Late Arrivals</Typography>
                    <Typography variant="h3" fontWeight={800} color="#f59e0b" sx={{ my: 0.5 }}>{lateDays}</Typography>
                    <Typography variant="caption" color="text.secondary">Arrived after 08:30 AM bell</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Card sx={{ borderRadius: 3, borderLeft: '5px solid #3b82f6', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                  <CardContent sx={{ p: 2.5 }}>
                    <Typography variant="body2" color="text.secondary" fontWeight={600}>Overall Attendance Rate</Typography>
                    <Typography variant="h3" fontWeight={800} color="primary.main" sx={{ my: 0.5 }}>{attendanceRate}%</Typography>
                    <Typography variant="caption" color="success.main" fontWeight={700}>Complies with 75% rule</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Attendance Progress & Monthly Breakdown */}
            <Card sx={{ borderRadius: 3, boxShadow: '0 4px 15px rgba(0,0,0,0.06)' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={700} gutterBottom>Monthly Attendance Trajectory</Typography>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  {[
                    { month: 'June', rate: 96 },
                    { month: 'July', rate: 95 },
                    { month: 'August', rate: 92 },
                    { month: 'September', rate: 98 },
                    { month: 'October', rate: 94 }
                  ].map(m => (
                    <Grid item xs={12} sm={2.4} key={m.month}>
                      <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0', textAlign: 'center' }}>
                        <Typography variant="caption" color="text.secondary" fontWeight={600}>{m.month}</Typography>
                        <Typography variant="h5" fontWeight={800} color="primary.main" sx={{ my: 0.5 }}>{m.rate}%</Typography>
                        <LinearProgress variant="determinate" value={m.rate} sx={{ height: 6, borderRadius: 3 }} />
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Box>
        )}

        {/* ================= TAB 3: EXAMS & MARKS TRANSCRIPT ================= */}
        {activeTab === 3 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Grade Card Summary Banner */}
            <Card sx={{ borderRadius: 3, background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)', color: 'white', boxShadow: '0 6px 20px rgba(59,130,246,0.25)' }}>
              <CardContent sx={{ p: 3.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                <Box>
                  <Typography variant="overline" sx={{ letterSpacing: 1.5, opacity: 0.8 }}>TERM 1 COMPREHENSIVE EVALUATION</Typography>
                  <Typography variant="h4" fontWeight={800}>Academic Grade Card & Rank</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
                    Overall Percentage: <strong>{overallPercentage}%</strong> • GPA: <strong>3.88 / 4.0</strong>
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Box sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.15)', borderRadius: 2, textAlign: 'center', minWidth: 100 }}>
                    <Typography variant="caption">Total Marks</Typography>
                    <Typography variant="h5" fontWeight={800}>{totalScored} / {totalMax}</Typography>
                  </Box>
                  <Box sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.15)', borderRadius: 2, textAlign: 'center', minWidth: 100 }}>
                    <Typography variant="caption">Class Standing</Typography>
                    <Typography variant="h5" fontWeight={800}>Rank #3</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* Subject Marks Table */}
            <Card sx={{ borderRadius: 3, boxShadow: '0 4px 15px rgba(0,0,0,0.06)' }}>
              <Box sx={{ p: 2.5, borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" fontWeight={700}>Subject-wise Scores & Faculty Remarks</Typography>
                <Chip label="Distinction Honors" color="success" sx={{ fontWeight: 700 }} />
              </Box>
              <CardContent sx={{ p: 0 }}>
                <Table>
                  <TableHead sx={{ bgcolor: '#f8fafc' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Subject</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Max Marks</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Passing</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Marks Scored</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Grade</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Teacher Remarks</TableCell>
                      <TableCell sx={{ fontWeight: 700 }} align="right">Result</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {examSubjects.map((es, idx) => (
                      <TableRow key={idx} hover>
                        <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>{es.subject}</TableCell>
                        <TableCell>{es.max}</TableCell>
                        <TableCell>{es.pass}</TableCell>
                        <TableCell sx={{ fontWeight: 800, fontSize: '1rem' }}>{es.scored}</TableCell>
                        <TableCell>
                          <Chip label={es.grade} size="small" color={es.grade === 'A1' ? 'success' : 'primary'} sx={{ fontWeight: 700 }} />
                        </TableCell>
                        <TableCell sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>{es.remarks}</TableCell>
                        <TableCell align="right">
                          <Chip label="PASS" size="small" color="success" variant="outlined" sx={{ fontWeight: 700 }} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </Box>
        )}

        {/* ================= TAB 4: WEEKLY TIMETABLE ================= */}
        {activeTab === 4 && (
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 15px rgba(0,0,0,0.06)' }}>
            <Box sx={{ p: 2.5, borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h6" fontWeight={700}>Weekly Class Schedule Grid</Typography>
                <Typography variant="caption" color="text.secondary">
                  Class {student.currentClass || '10'} - Section {student.currentSection || 'A'} • Academic Year 2026-27
                </Typography>
              </Box>
              <Button size="small" variant="outlined" startIcon={<PrintIcon />} onClick={() => window.print()}>
                Print Timetable
              </Button>
            </Box>
            <CardContent sx={{ p: 0, overflowX: 'auto' }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: '#f8fafc' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, minWidth: 100 }}>Day / Period</TableCell>
                    {periods.map(pr => (
                      <TableCell key={pr.p} sx={{ fontWeight: 700, minWidth: 130, textAlign: 'center' }}>
                        {pr.p}
                        <Typography variant="caption" display="block" color="text.secondary">{pr.time}</Typography>
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.entries(timetableSchedule).map(([day, slots]) => (
                    <TableRow key={day} hover>
                      <TableCell sx={{ fontWeight: 800, bgcolor: '#f8fafc' }}>{day}</TableCell>
                      {slots.map((subject, idx) => (
                        <TableCell key={idx} sx={{ textAlign: 'center', p: 1.5 }}>
                          <Box sx={{ p: 1, bgcolor: subject.includes('Lab') ? '#f0fdf4' : subject.includes('PE') ? '#fef3c7' : '#eff6ff', borderRadius: 2, border: '1px solid rgba(0,0,0,0.05)' }}>
                            <Typography variant="body2" fontWeight={700} sx={{ color: subject.includes('Lab') ? '#15803d' : subject.includes('PE') ? '#b45309' : '#1d4ed8' }}>
                              {subject}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" display="block">
                              {subject.includes('Lab') ? 'Specialist Lab' : 'Room 204'}
                            </Typography>
                          </Box>
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* ================= TAB 5: TOP PERFORMANCE & HONORS ================= */}
        {activeTab === 5 && (
          <Grid container spacing={3}>
            {achievements.map((ach, idx) => (
              <Grid item xs={12} sm={6} key={idx}>
                <Card sx={{ borderRadius: 3, borderLeft: '5px solid #eab308', boxShadow: '0 4px 15px rgba(0,0,0,0.06)' }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Chip label={ach.category} size="small" color="warning" sx={{ fontWeight: 700 }} />
                      <Chip label={ach.year} size="small" variant="outlined" />
                    </Box>
                    <Typography variant="h6" fontWeight={800} sx={{ my: 1, color: '#1e293b' }}>
                      <StarIcon sx={{ color: '#eab308', verticalAlign: 'middle', mr: 0.5 }} />
                      {ach.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Conferred by: <strong>{ach.issuer}</strong>
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* ================= TAB 6: FEES & DOCUMENTS ================= */}
        {activeTab === 6 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={7}>
              <Card sx={{ borderRadius: 3, boxShadow: '0 4px 15px rgba(0,0,0,0.06)' }}>
                <Box sx={{ p: 2.5, borderBottom: '1px solid #e2e8f0' }}>
                  <Typography variant="h6" fontWeight={700}>Fee Ledger & Invoices</Typography>
                </Box>
                <CardContent sx={{ p: 0 }}>
                  <Table size="small">
                    <TableHead sx={{ bgcolor: '#f8fafc' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700 }}>Fee Head</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Term</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Amount</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {[
                        { head: 'Tuition Fee', term: 'Term 1', amount: '₹35,000', status: 'PAID' },
                        { head: 'Laboratory & Tech Fee', term: 'Term 1', amount: '₹8,500', status: 'PAID' },
                        { head: 'Transport Facility Fee', term: 'Term 1', amount: '₹12,000', status: 'PAID' },
                        { head: 'Tuition Fee', term: 'Term 2', amount: '₹35,000', status: 'UPCOMING' }
                      ].map((fee, idx) => (
                        <TableRow key={idx}>
                          <TableCell sx={{ fontWeight: 600 }}>{fee.head}</TableCell>
                          <TableCell>{fee.term}</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>{fee.amount}</TableCell>
                          <TableCell>
                            <Chip label={fee.status} size="small" color={fee.status === 'PAID' ? 'success' : 'default'} sx={{ fontWeight: 700 }} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={5}>
              <Card sx={{ borderRadius: 3, boxShadow: '0 4px 15px rgba(0,0,0,0.06)' }}>
                <Box sx={{ p: 2.5, borderBottom: '1px solid #e2e8f0' }}>
                  <Typography variant="h6" fontWeight={700}>Verified Documentation</Typography>
                </Box>
                <CardContent sx={{ p: 2.5 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {[
                      { doc: 'Birth Certificate', verified: true },
                      { doc: 'Transfer Certificate (TC)', verified: true },
                      { doc: 'Previous Academic Marks Card', verified: true },
                      { doc: 'Immunization & Health Record', verified: true }
                    ].map((d, i) => (
                      <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1.5, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                        <Typography variant="body2" fontWeight={600}>{d.doc}</Typography>
                        <Chip label="Verified" size="small" color="success" icon={<CheckCircleIcon />} />
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </Box>

      {/* Edit Modal */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Edit Student Profile</DialogTitle>
        <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <TextField label="First Name" fullWidth value={editData.firstName || ''} onChange={e => setEditData({...editData, firstName: e.target.value})} />
          <TextField label="Last Name" fullWidth value={editData.lastName || ''} onChange={e => setEditData({...editData, lastName: e.target.value})} />
          <TextField label="Blood Group" fullWidth value={editData.bloodGroup || ''} onChange={e => setEditData({...editData, bloodGroup: e.target.value})} />
          <TextField label="Nationality" fullWidth value={editData.nationality || ''} onChange={e => setEditData({...editData, nationality: e.target.value})} />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleEditSave}>Save Changes</Button>
        </DialogActions>
      </Dialog>

      {/* Deactivate Confirmation */}
      <ConfirmDialog 
        open={confirmDeactivateOpen}
        title="Deactivate Student Profile?"
        message="This will mark the student as inactive while archiving all historical records, marks, and attendance."
        confirmLabel="Deactivate"
        onConfirm={handleDeactivate}
        onCancel={() => setConfirmDeactivateOpen(false)}
        isDestructive={true}
      />
    </Box>
  );
};

export default StudentProfileShell;
