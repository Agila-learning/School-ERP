import React, { useState } from 'react';
import {
  Box, Typography, Paper, Grid, TextField, MenuItem, Button,
  Chip, IconButton, Tooltip, Dialog, DialogTitle,
  DialogContent, DialogActions, Card, CardContent, Divider,
  InputAdornment, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Tabs, Tab, Avatar
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import SearchIcon from '@mui/icons-material/Search';
import PrintIcon from '@mui/icons-material/Print';
import BadgeIcon from '@mui/icons-material/Badge';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ScienceIcon from '@mui/icons-material/Science';
import ComputerIcon from '@mui/icons-material/Computer';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import HistoryEduIcon from '@mui/icons-material/HistoryEdu';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';

import { useNavigate } from 'react-router-dom';
import Layout from '../../../core/components/Layout';

export interface PublicExamGroup {
  id: string;
  code: string;
  name: string;
  subjects: { code: string; name: string; examDate: string; session: string; maxMarks: string; isPractical: boolean }[];
  description: string;
}

export const PublicExamGroup = {};

export const HIGHER_SECONDARY_GROUPS: PublicExamGroup[] = [
  {
    id: 'grp-101',
    code: 'GROUP 101',
    name: 'Mathematics & Biology (PCMB)',
    description: 'Physics, Chemistry, Mathematics, Biology - Medical & Engineering Aspirants',
    subjects: [
      { code: '001', name: 'Language I (Tamil / Hindi / French)', examDate: '2027-03-02', session: 'FN (10:00 AM - 01:15 PM)', maxMarks: '100', isPractical: false },
      { code: '002', name: 'English Core', examDate: '2027-03-05', session: 'FN (10:00 AM - 01:15 PM)', maxMarks: '100', isPractical: false },
      { code: '041', name: 'Mathematics', examDate: '2027-03-10', session: 'FN (10:00 AM - 01:15 PM)', maxMarks: '100 (90 Th + 10 Int)', isPractical: false },
      { code: '042', name: 'Physics', examDate: '2027-03-14', session: 'FN (10:00 AM - 01:15 PM)', maxMarks: '100 (70 Th + 30 Pr)', isPractical: true },
      { code: '043', name: 'Chemistry', examDate: '2027-03-18', session: 'FN (10:00 AM - 01:15 PM)', maxMarks: '100 (70 Th + 30 Pr)', isPractical: true },
      { code: '044', name: 'Biology', examDate: '2027-03-24', session: 'FN (10:00 AM - 01:15 PM)', maxMarks: '100 (70 Th + 30 Pr)', isPractical: true }
    ]
  },
  {
    id: 'grp-102',
    code: 'GROUP 102',
    name: 'Mathematics & Computer Science (PCMC)',
    description: 'Physics, Chemistry, Mathematics, Computer Science - Engineering & Tech Stream',
    subjects: [
      { code: '001', name: 'Language I (Tamil / Hindi / French)', examDate: '2027-03-02', session: 'FN (10:00 AM - 01:15 PM)', maxMarks: '100', isPractical: false },
      { code: '002', name: 'English Core', examDate: '2027-03-05', session: 'FN (10:00 AM - 01:15 PM)', maxMarks: '100', isPractical: false },
      { code: '041', name: 'Mathematics', examDate: '2027-03-10', session: 'FN (10:00 AM - 01:15 PM)', maxMarks: '100 (90 Th + 10 Int)', isPractical: false },
      { code: '042', name: 'Physics', examDate: '2027-03-14', session: 'FN (10:00 AM - 01:15 PM)', maxMarks: '100 (70 Th + 30 Pr)', isPractical: true },
      { code: '043', name: 'Chemistry', examDate: '2027-03-18', session: 'FN (10:00 AM - 01:15 PM)', maxMarks: '100 (70 Th + 30 Pr)', isPractical: true },
      { code: '083', name: 'Computer Science', examDate: '2027-03-22', session: 'FN (10:00 AM - 01:15 PM)', maxMarks: '100 (70 Th + 30 Pr)', isPractical: true }
    ]
  },
  {
    id: 'grp-103',
    code: 'GROUP 103',
    name: 'Pure Science / Microbiology',
    description: 'Physics, Chemistry, Biology, Microbiology / Botany & Zoology',
    subjects: [
      { code: '001', name: 'Language I (Tamil / Hindi / French)', examDate: '2027-03-02', session: 'FN (10:00 AM - 01:15 PM)', maxMarks: '100', isPractical: false },
      { code: '002', name: 'English Core', examDate: '2027-03-05', session: 'FN (10:00 AM - 01:15 PM)', maxMarks: '100', isPractical: false },
      { code: '042', name: 'Physics', examDate: '2027-03-14', session: 'FN (10:00 AM - 01:15 PM)', maxMarks: '100 (70 Th + 30 Pr)', isPractical: true },
      { code: '043', name: 'Chemistry', examDate: '2027-03-18', session: 'FN (10:00 AM - 01:15 PM)', maxMarks: '100 (70 Th + 30 Pr)', isPractical: true },
      { code: '044', name: 'Biology', examDate: '2027-03-24', session: 'FN (10:00 AM - 01:15 PM)', maxMarks: '100 (70 Th + 30 Pr)', isPractical: true },
      { code: '088', name: 'Microbiology & Biotechnology', examDate: '2027-03-28', session: 'FN (10:00 AM - 01:15 PM)', maxMarks: '100 (70 Th + 30 Pr)', isPractical: true }
    ]
  },
  {
    id: 'grp-104',
    code: 'GROUP 104',
    name: 'Commerce & Computer Applications',
    description: 'Accountancy, Commerce, Economics, Computer Applications',
    subjects: [
      { code: '001', name: 'Language I (Tamil / Hindi / French)', examDate: '2027-03-02', session: 'FN (10:00 AM - 01:15 PM)', maxMarks: '100', isPractical: false },
      { code: '002', name: 'English Core', examDate: '2027-03-05', session: 'FN (10:00 AM - 01:15 PM)', maxMarks: '100', isPractical: false },
      { code: '055', name: 'Accountancy', examDate: '2027-03-09', session: 'FN (10:00 AM - 01:15 PM)', maxMarks: '100 (80 Th + 20 Pr)', isPractical: true },
      { code: '054', name: 'Commerce & Business Studies', examDate: '2027-03-12', session: 'FN (10:00 AM - 01:15 PM)', maxMarks: '100 (90 Th + 10 Int)', isPractical: false },
      { code: '030', name: 'Economics', examDate: '2027-03-16', session: 'FN (10:00 AM - 01:15 PM)', maxMarks: '100 (90 Th + 10 Int)', isPractical: false },
      { code: '165', name: 'Computer Applications', examDate: '2027-03-20', session: 'FN (10:00 AM - 01:15 PM)', maxMarks: '100 (70 Th + 30 Pr)', isPractical: true }
    ]
  },
  {
    id: 'grp-105',
    code: 'GROUP 105',
    name: 'Commerce & Business Mathematics',
    description: 'Accountancy, Commerce, Economics, Business Mathematics & Statistics',
    subjects: [
      { code: '001', name: 'Language I (Tamil / Hindi / French)', examDate: '2027-03-02', session: 'FN (10:00 AM - 01:15 PM)', maxMarks: '100', isPractical: false },
      { code: '002', name: 'English Core', examDate: '2027-03-05', session: 'FN (10:00 AM - 01:15 PM)', maxMarks: '100', isPractical: false },
      { code: '055', name: 'Accountancy', examDate: '2027-03-09', session: 'FN (10:00 AM - 01:15 PM)', maxMarks: '100 (80 Th + 20 Pr)', isPractical: true },
      { code: '054', name: 'Commerce & Business Studies', examDate: '2027-03-12', session: 'FN (10:00 AM - 01:15 PM)', maxMarks: '100 (90 Th + 10 Int)', isPractical: false },
      { code: '030', name: 'Economics', examDate: '2027-03-16', session: 'FN (10:00 AM - 01:15 PM)', maxMarks: '100 (90 Th + 10 Int)', isPractical: false },
      { code: '049', name: 'Business Mathematics & Statistics', examDate: '2027-03-21', session: 'FN (10:00 AM - 01:15 PM)', maxMarks: '100 (90 Th + 10 Int)', isPractical: false }
    ]
  },
  {
    id: 'grp-106',
    code: 'GROUP 106',
    name: 'Humanities & Arts / History',
    description: 'History, Political Science, Economics, Geography / Sociology',
    subjects: [
      { code: '001', name: 'Language I (Tamil / Hindi / French)', examDate: '2027-03-02', session: 'FN (10:00 AM - 01:15 PM)', maxMarks: '100', isPractical: false },
      { code: '002', name: 'English Core', examDate: '2027-03-05', session: 'FN (10:00 AM - 01:15 PM)', maxMarks: '100', isPractical: false },
      { code: '027', name: 'History', examDate: '2027-03-08', session: 'FN (10:00 AM - 01:15 PM)', maxMarks: '100 (80 Th + 20 Pr)', isPractical: true },
      { code: '028', name: 'Political Science', examDate: '2027-03-13', session: 'FN (10:00 AM - 01:15 PM)', maxMarks: '100 (80 Th + 20 Pr)', isPractical: true },
      { code: '030', name: 'Economics', examDate: '2027-03-16', session: 'FN (10:00 AM - 01:15 PM)', maxMarks: '100 (90 Th + 10 Int)', isPractical: false },
      { code: '029', name: 'Sociology & Geography', examDate: '2027-03-23', session: 'FN (10:00 AM - 01:15 PM)', maxMarks: '100 (80 Th + 20 Pr)', isPractical: true }
    ]
  }
];

export interface PublicExamCandidate {
  id: string;
  boardRollNo: string;
  permanentRegNo: string;
  name: string;
  className: string;
  streamGroupId: string;
  streamGroupName: string;
  examCenter: string;
  centerCode: string;
  gender: string;
  dob: string;
  motherName: string;
  fatherName: string;
  hallTicketStatus: 'GENERATED' | 'DISPATCHED';
}

const DEFAULT_CANDIDATES: PublicExamCandidate[] = [
  {
    id: 'cand-01',
    boardRollNo: '2027-HSC-94101',
    permanentRegNo: 'TN-2027-FIC-001',
    name: 'Aarav Patel',
    className: 'Grade 12',
    streamGroupId: 'grp-102',
    streamGroupName: 'GROUP 102: Maths - Computer Science',
    examCenter: 'Govt Model Higher Secondary Center, Tech Zone 4',
    centerCode: 'C-412',
    gender: 'Male',
    dob: '2009-04-12',
    motherName: 'Sunita Patel',
    fatherName: 'Rajesh Patel',
    hallTicketStatus: 'GENERATED'
  },
  {
    id: 'cand-02',
    boardRollNo: '2027-HSC-94102',
    permanentRegNo: 'TN-2027-FIC-002',
    name: 'Priya Sundaram',
    className: 'Grade 12',
    streamGroupId: 'grp-101',
    streamGroupName: 'GROUP 101: Maths - Biology',
    examCenter: 'Govt Model Higher Secondary Center, Tech Zone 4',
    centerCode: 'C-412',
    gender: 'Female',
    dob: '2009-08-20',
    motherName: 'Radha Sundaram',
    fatherName: 'K. Sundaram',
    hallTicketStatus: 'GENERATED'
  },
  {
    id: 'cand-03',
    boardRollNo: '2027-HSC-94103',
    permanentRegNo: 'TN-2027-FIC-003',
    name: 'Kavita Menon',
    className: 'Grade 12',
    streamGroupId: 'grp-103',
    streamGroupName: 'GROUP 103: Pure Science / Microbiology',
    examCenter: 'St. Xavier Girls Higher Secondary School',
    centerCode: 'C-380',
    gender: 'Female',
    dob: '2009-11-05',
    motherName: 'Malini Menon',
    fatherName: 'Gopinath Menon',
    hallTicketStatus: 'GENERATED'
  },
  {
    id: 'cand-04',
    boardRollNo: '2027-HSC-94104',
    permanentRegNo: 'TN-2027-FIC-004',
    name: 'Mohammed Tariq',
    className: 'Grade 12',
    streamGroupId: 'grp-104',
    streamGroupName: 'GROUP 104: Commerce - Computer Applications',
    examCenter: 'Govt Boys Higher Secondary School, West Circle',
    centerCode: 'C-405',
    gender: 'Male',
    dob: '2009-02-18',
    motherName: 'Fatima Tariq',
    fatherName: 'Abdul Tariq',
    hallTicketStatus: 'GENERATED'
  },
  {
    id: 'cand-05',
    boardRollNo: '2027-HSC-94105',
    permanentRegNo: 'TN-2027-FIC-005',
    name: 'Sneha Chander',
    className: 'Grade 12',
    streamGroupId: 'grp-105',
    streamGroupName: 'GROUP 105: Commerce - Business Maths',
    examCenter: 'Govt Model Higher Secondary Center, Tech Zone 4',
    centerCode: 'C-412',
    gender: 'Female',
    dob: '2009-06-30',
    motherName: 'Lakshmi Chander',
    fatherName: 'K. Chander',
    hallTicketStatus: 'GENERATED'
  },
  {
    id: 'cand-06',
    boardRollNo: '2027-HSC-94106',
    permanentRegNo: 'TN-2027-FIC-006',
    name: 'Vikramaditya Sharma',
    className: 'Grade 12',
    streamGroupId: 'grp-106',
    streamGroupName: 'GROUP 106: Humanities & Arts / History',
    examCenter: 'National Higher Secondary School',
    centerCode: 'C-395',
    gender: 'Male',
    dob: '2009-09-14',
    motherName: 'Anuradha Sharma',
    fatherName: 'Pradeep Sharma',
    hallTicketStatus: 'GENERATED'
  }
];

const PublicExamDesk: React.FC = () => {
  const navigate = useNavigate();
  const [tabIndex, setTabIndex] = useState(0);
  const [candidates, setCandidates] = useState<PublicExamCandidate[]>(DEFAULT_CANDIDATES);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroupFilter, setSelectedGroupFilter] = useState('ALL');

  // Hall ticket preview
  const [activeCandidate, setActiveCandidate] = useState<PublicExamCandidate | null>(null);
  const [hallTicketOpen, setHallTicketOpen] = useState(false);

  // Group Details Modal
  const [selectedGroupModal, setSelectedGroupModal] = useState<PublicExamGroup | null>(null);

  const filteredCandidates = candidates.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.boardRollNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.permanentRegNo.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGroup = selectedGroupFilter === 'ALL' ? true : c.streamGroupId === selectedGroupFilter;
    return matchesSearch && matchesGroup;
  });

  const getCandidateGroup = (groupId: string): PublicExamGroup => {
    return HIGHER_SECONDARY_GROUPS.find(g => g.id === groupId) || HIGHER_SECONDARY_GROUPS[0];
  };

  return (
    <Layout>
      <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1400, mx: 'auto', pb: 20 }}>
        
        {/* Navigation & Header */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
            <Button 
              startIcon={<ArrowBackIcon />} 
              onClick={() => {
                if (window.history.length > 1) {
                  navigate(-1);
                } else {
                  navigate('/student-portal/dashboard');
                }
              }}
              variant="outlined"
              size="small"
              sx={{ textTransform: 'none', color: '#334155', fontWeight: 700, borderRadius: 2, borderColor: '#cbd5e1', bgcolor: '#ffffff', '&:hover': { bgcolor: '#f8fafc' } }}
            >
              ← Back
            </Button>
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
              Higher Secondary Examination Hub / Admit Card Portal
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { sm: 'center' }, gap: 2 }}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <SchoolIcon sx={{ fontSize: 36, color: '#0284c7' }} />
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a' }}>
                  Higher Secondary Public Examination Command Center
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Manage Class 11 & 12 Board candidates across distinct academic streams: Maths-Bio, Maths-CS, Microbiology, Commerce, and Humanities.
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Stream Groups Ribbon */}
        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#475569', textTransform: 'uppercase', mb: 1.5, letterSpacing: 1 }}>
          Higher Secondary Board Stream Groups
        </Typography>
        <Grid container spacing={2} sx={{ mb: 3.5 }}>
          {HIGHER_SECONDARY_GROUPS.map(grp => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={grp.id}>
              <Paper
                elevation={0}
                onClick={() => setSelectedGroupModal(grp)}
                sx={{
                  p: 2,
                  borderRadius: 2.5,
                  border: '1px solid #e2e8f0',
                  bgcolor: '#ffffff',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: '#0284c7',
                    boxShadow: '0 6px 16px -4px rgba(2, 132, 199, 0.2)',
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Chip label={grp.code} size="small" sx={{ fontWeight: 800, bgcolor: '#e0f2fe', color: '#0369a1' }} />
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b' }}>
                    {grp.subjects.length} Board Papers
                  </Typography>
                </Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', mb: 0.5 }}>
                  {grp.name}
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 1.5 }}>
                  {grp.description}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', pt: 1 }}>
                  <Typography variant="caption" sx={{ color: '#0284c7', fontWeight: 700 }}>
                    View Subject Timetable →
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                    {grp.subjects.filter(s => s.isPractical).length} Practicals Included
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Main Tabs */}
        <Paper elevation={0} sx={{ borderBottom: '1px solid #e2e8f0', bgcolor: 'transparent', mb: 3 }}>
          <Tabs value={tabIndex} onChange={(_, val) => setTabIndex(val)} textColor="primary" indicatorColor="primary">
            <Tab label="Board Candidate Register & Hall Tickets" sx={{ textTransform: 'none', fontWeight: 700 }} />
            <Tab label="Consolidated Public Exam Schedule" sx={{ textTransform: 'none', fontWeight: 700 }} />
          </Tabs>
        </Paper>

        {/* TAB 0: Candidate Register */}
        {tabIndex === 0 && (
          <>
            {/* Filter Toolbar */}
            <Paper elevation={0} sx={{ p: 2.5, mb: 3, borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: '#ffffff' }}>
              <Grid container spacing={2} alignItems="center">
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Search candidate by name, board roll number, or PRN..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon fontSize="small" sx={{ color: '#94a3b8' }} />
                          </InputAdornment>
                        ),
                      }
                    }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5, bgcolor: '#f8fafc' } }}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label="Filter By Stream Group"
                    value={selectedGroupFilter}
                    onChange={e => setSelectedGroupFilter(e.target.value)}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }}
                  >
                    <MenuItem value="ALL">All Stream Groups</MenuItem>
                    {HIGHER_SECONDARY_GROUPS.map(g => (
                      <MenuItem key={g.id} value={g.id}>{g.code}: {g.name}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
              </Grid>
            </Paper>

            {/* Candidates Table with Responsive Horizontal Scroll */}
            <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3, border: '1px solid #e2e8f0', overflowX: 'auto', width: '100%', mb: 4 }}>
              <Table sx={{ minWidth: 1080 }}>
                <TableHead sx={{ bgcolor: '#f8fafc' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 800, minWidth: 160 }}>Board Roll No</TableCell>
                    <TableCell sx={{ fontWeight: 800, minWidth: 230 }}>Candidate Name</TableCell>
                    <TableCell sx={{ fontWeight: 800, minWidth: 260 }}>Stream / Group</TableCell>
                    <TableCell sx={{ fontWeight: 800, minWidth: 230 }}>Allocated Exam Center</TableCell>
                    <TableCell sx={{ fontWeight: 800, minWidth: 140 }}>Admit Status</TableCell>
                    <TableCell sx={{ fontWeight: 800, minWidth: 200, textAlign: 'right' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredCandidates.map(c => (
                    <TableRow key={c.id} hover>
                      <TableCell sx={{ fontWeight: 800, color: '#0284c7' }}>
                        {c.boardRollNo}
                        <Typography variant="caption" sx={{ display: 'block', color: '#64748b' }}>
                          PRN: {c.permanentRegNo}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar sx={{ width: 36, height: 36, bgcolor: '#0284c7', fontSize: '0.85rem', fontWeight: 800 }}>
                            {c.name.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                              {c.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {c.gender} • DOB: {c.dob}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={c.streamGroupName}
                          size="small"
                          sx={{ fontWeight: 700, bgcolor: '#f1f5f9', color: '#1e293b' }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155' }}>
                          {c.examCenter}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748b' }}>
                          Center Code: {c.centerCode}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label="Admit Card Ready"
                          size="small"
                          color="success"
                          sx={{ fontWeight: 700, borderRadius: 1.5 }}
                        />
                      </TableCell>
                      <TableCell sx={{ textAlign: 'right' }}>
                        <Button
                          size="small"
                          variant="contained"
                          startIcon={<PrintIcon />}
                          onClick={() => {
                            setActiveCandidate(c);
                            setHallTicketOpen(true);
                          }}
                          sx={{
                            borderRadius: 2,
                            bgcolor: '#0284c7',
                            fontWeight: 700,
                            textTransform: 'none',
                            '&:hover': { bgcolor: '#0369a1' }
                          }}
                        >
                          Generate Hall Ticket
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}

        {/* TAB 1: Consolidated Timetable */}
        {tabIndex === 1 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {HIGHER_SECONDARY_GROUPS.map(grp => (
              <Paper key={grp.id} elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: '#ffffff' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
                      {grp.code} — {grp.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {grp.description}
                    </Typography>
                  </Box>
                  <Chip label="HSC Board March 2027" color="primary" sx={{ fontWeight: 800 }} />
                </Box>

                <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #f1f5f9', borderRadius: 2, overflowX: 'auto', width: '100%' }}>
                  <Table size="small" sx={{ minWidth: 950 }}>
                    <TableHead sx={{ bgcolor: '#f8fafc' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700, minWidth: 120 }}>Paper Code</TableCell>
                        <TableCell sx={{ fontWeight: 700, minWidth: 220 }}>Subject Name</TableCell>
                        <TableCell sx={{ fontWeight: 700, minWidth: 180 }}>Date of Examination</TableCell>
                        <TableCell sx={{ fontWeight: 700, minWidth: 180 }}>Session & Timings</TableCell>
                        <TableCell sx={{ fontWeight: 700, minWidth: 150 }}>Max Marks Schema</TableCell>
                        <TableCell sx={{ fontWeight: 700, minWidth: 160 }}>Practical Component</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {grp.subjects.map((sub, i) => (
                        <TableRow key={i}>
                          <TableCell sx={{ fontWeight: 700, color: '#0284c7' }}>{sub.code}</TableCell>
                          <TableCell sx={{ fontWeight: 700, color: '#1e293b' }}>{sub.name}</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>{sub.examDate}</TableCell>
                          <TableCell sx={{ color: '#475569' }}>{sub.session}</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>{sub.maxMarks}</TableCell>
                          <TableCell>
                            {sub.isPractical ? (
                              <Chip label="Lab Practical Included" size="small" color="secondary" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 800 }} />
                            ) : (
                              <Chip label="Theory Only" size="small" sx={{ height: 20, fontSize: '0.65rem' }} />
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            ))}
          </Box>
        )}

        {/* GROUP DETAIL MODAL */}
        <Dialog
          open={Boolean(selectedGroupModal)}
          onClose={() => setSelectedGroupModal(null)}
          maxWidth="md"
          fullWidth
          PaperProps={{ sx: { borderRadius: 3 } }}
        >
          {selectedGroupModal && (
            <>
              <DialogTitle sx={{ fontWeight: 800, borderBottom: '1px solid #e2e8f0' }}>
                {selectedGroupModal.code} • {selectedGroupModal.name}
              </DialogTitle>
              <DialogContent sx={{ p: 3 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
                  {selectedGroupModal.description}
                </Typography>

                <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2 }}>
                  <Table size="small">
                    <TableHead sx={{ bgcolor: '#f8fafc' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700 }}>Code</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Subject</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Exam Date</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Marks Split</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedGroupModal.subjects.map((s, idx) => (
                        <TableRow key={idx}>
                          <TableCell sx={{ fontWeight: 800, color: '#0284c7' }}>{s.code}</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>{s.name}</TableCell>
                          <TableCell>{s.examDate}</TableCell>
                          <TableCell>{s.maxMarks}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </DialogContent>
              <DialogActions sx={{ p: 2, bgcolor: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
                <Button onClick={() => setSelectedGroupModal(null)} variant="contained" sx={{ bgcolor: '#0f172a' }}>
                  Close
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>

        {/* OFFICIAL PUBLIC EXAMINATION HALL TICKET / ADMIT CARD MODAL */}
        <Dialog
          open={hallTicketOpen}
          onClose={() => setHallTicketOpen(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{ sx: { borderRadius: 3.5, overflow: 'hidden' } }}
        >
          {activeCandidate && (() => {
            const grp = getCandidateGroup(activeCandidate.streamGroupId);

            return (
              <>
                <Box sx={{ p: 2, bgcolor: '#0f172a', color: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                    Official Board Examination Hall Ticket • {activeCandidate.boardRollNo}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<PrintIcon />}
                      onClick={() => window.print()}
                      sx={{ bgcolor: '#0284c7', textTransform: 'none', fontWeight: 700 }}
                    >
                      Print Hall Ticket
                    </Button>
                    <Button
                      size="small"
                      onClick={() => setHallTicketOpen(false)}
                      sx={{ color: '#ffffff', textTransform: 'none' }}
                    >
                      Close
                    </Button>
                  </Box>
                </Box>

                <DialogContent sx={{ p: { xs: 3, md: 5 }, bgcolor: '#ffffff' }}>
                  {/* Hall Ticket Card Frame */}
                  <Box sx={{ border: '3px solid #0f172a', p: 3, borderRadius: 2, position: 'relative' }}>
                    
                    {/* Header */}
                    <Box sx={{ textAlign: 'center', borderBottom: '2px solid #0f172a', pb: 2, mb: 3 }}>
                      <Typography variant="overline" sx={{ letterSpacing: 2.5, fontWeight: 800, color: '#0284c7' }}>
                        STATE BOARD OF HIGHER SECONDARY EXAMINATION • TAMIL NADU
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 900, color: '#0f172a', mt: 0.5 }}>
                        HIGHER SECONDARY COURSE CERTIFICATE (HSC) EXAMINATION — MARCH 2027
                      </Typography>
                      <Box sx={{ display: 'inline-block', bgcolor: '#0f172a', color: '#ffffff', px: 2, py: 0.5, borderRadius: 1, mt: 1, fontWeight: 800, fontSize: '0.8rem', letterSpacing: 1.5 }}>
                        OFFICIAL ADMIT CARD / HALL TICKET
                      </Box>
                    </Box>

                    {/* Bio Data & Candidate Photo Row */}
                    <Grid container spacing={2.5} sx={{ mb: 3 }}>
                      <Grid size={{ xs: 12, sm: 8.5 }}>
                        <Table size="small">
                          <TableBody>
                            <TableRow>
                              <TableCell sx={{ fontWeight: 800, width: '35%', color: '#334155' }}>Candidate Roll No</TableCell>
                              <TableCell sx={{ fontWeight: 900, color: '#0284c7', fontSize: '1rem' }}>{activeCandidate.boardRollNo}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell sx={{ fontWeight: 800, color: '#334155' }}>Permanent Reg No</TableCell>
                              <TableCell sx={{ fontWeight: 700 }}>{activeCandidate.permanentRegNo}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell sx={{ fontWeight: 800, color: '#334155' }}>Candidate Name</TableCell>
                              <TableCell sx={{ fontWeight: 800 }}>{activeCandidate.name.toUpperCase()}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell sx={{ fontWeight: 800, color: '#334155' }}>Parents / Guardians</TableCell>
                              <TableCell sx={{ color: '#475569' }}>{activeCandidate.motherName} & {activeCandidate.fatherName}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell sx={{ fontWeight: 800, color: '#334155' }}>Stream Group</TableCell>
                              <TableCell sx={{ fontWeight: 800, color: '#4338ca' }}>{grp.code} — {grp.name}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell sx={{ fontWeight: 800, color: '#334155' }}>Examination Center</TableCell>
                              <TableCell sx={{ fontWeight: 700 }}>{activeCandidate.examCenter} ({activeCandidate.centerCode})</TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </Grid>

                      {/* Photo Box */}
                      <Grid size={{ xs: 12, sm: 3.5 }} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <Box sx={{ width: 120, height: 140, border: '2px solid #0f172a', borderRadius: 1.5, p: 0.5, textAlign: 'center', bgcolor: '#f8fafc', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                          <Avatar sx={{ width: 68, height: 68, bgcolor: '#0284c7', mb: 1, fontWeight: 900, fontSize: '1.5rem' }}>
                            {activeCandidate.name.charAt(0)}
                          </Avatar>
                          <Typography variant="caption" sx={{ fontSize: '0.65rem', fontWeight: 800, color: '#475569' }}>
                            OFFICIAL PHOTO
                          </Typography>
                        </Box>
                        <Box sx={{ width: 120, height: 35, border: '1px dashed #64748b', mt: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Typography variant="caption" sx={{ fontSize: '0.6rem', color: '#94a3b8' }}>
                            Candidate Signature
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>

                    {/* Examination Schedule Matrix */}
                    <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#0f172a', mb: 1, textTransform: 'uppercase' }}>
                      Timetable & Subject Center Verification Matrix
                    </Typography>
                    <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #0f172a', mb: 3, borderRadius: 1 }}>
                      <Table size="small">
                        <TableHead sx={{ bgcolor: '#f1f5f9' }}>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 800, fontSize: '0.75rem' }}>Code</TableCell>
                            <TableCell sx={{ fontWeight: 800, fontSize: '0.75rem' }}>Subject Name</TableCell>
                            <TableCell sx={{ fontWeight: 800, fontSize: '0.75rem' }}>Exam Date</TableCell>
                            <TableCell sx={{ fontWeight: 800, fontSize: '0.75rem' }}>Session</TableCell>
                            <TableCell sx={{ fontWeight: 800, fontSize: '0.75rem' }}>Invigilator Sign</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {grp.subjects.map((sub, i) => (
                            <TableRow key={i}>
                              <TableCell sx={{ fontWeight: 800, fontSize: '0.75rem' }}>{sub.code}</TableCell>
                              <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>{sub.name}</TableCell>
                              <TableCell sx={{ fontSize: '0.75rem', fontWeight: 600 }}>{sub.examDate}</TableCell>
                              <TableCell sx={{ fontSize: '0.75rem', color: '#475569' }}>{sub.session}</TableCell>
                              <TableCell sx={{ fontSize: '0.75rem', color: '#cbd5e1' }}>[ _____________ ]</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>

                    {/* Candidate Guidelines */}
                    <Box sx={{ bgcolor: '#f8fafc', p: 1.5, borderRadius: 1.5, border: '1px solid #e2e8f0', mb: 3 }}>
                      <Typography variant="caption" sx={{ fontWeight: 800, color: '#0f172a', display: 'block', mb: 0.5 }}>
                        CRITICAL EXAMINATION GUIDELINES:
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#475569', display: 'block', lineHeight: 1.5 }}>
                        1. Candidates must occupy their allotted seats 15 minutes prior to the commencement of examination. Reading time 10:00 AM to 10:15 AM.<br />
                        2. Electronic devices, smartwatches, and programmable calculators are strictly prohibited inside the hall.<br />
                        3. Practical examination marks & observation sheets must be verified before external board inspection.
                      </Typography>
                    </Box>

                    {/* Signatures & Seal */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', pt: 2, borderTop: '1px solid #cbd5e1' }}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', mb: 4 }}>
                          [ QR / Barcode Verification ]
                        </Typography>
                        <Typography variant="caption" sx={{ fontSize: '0.7rem', fontWeight: 700, color: '#334155' }}>
                          Verified Candidate Record
                        </Typography>
                      </Box>

                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="body2" sx={{ fontWeight: 800, color: '#0f172a', fontFamily: 'cursive', fontSize: '1.1rem', mb: 0.5 }}>
                          Dr. Revathi Raman
                        </Typography>
                        <Typography variant="caption" sx={{ fontWeight: 800, color: '#0f172a', display: 'block' }}>
                          Chief Center Superintendent
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Board of Public Examinations
                        </Typography>
                      </Box>
                    </Box>

                  </Box>
                </DialogContent>
              </>
            );
          })()}
        </Dialog>

      </Box>
    </Layout>
  );
};

export default PublicExamDesk;
