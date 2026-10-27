import React, { useState, useEffect, useMemo } from 'react';
import {
  Box, Typography, Paper, Grid, TextField, MenuItem, Button,
  Chip, IconButton, Tooltip, Dialog, DialogTitle,
  DialogContent, DialogActions, Card, CardContent, Divider,
  InputAdornment, LinearProgress, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Avatar
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import PrintIcon from '@mui/icons-material/Print';
import SearchIcon from '@mui/icons-material/Search';
import VerifiedIcon from '@mui/icons-material/Verified';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LocalLibraryIcon from '@mui/icons-material/LocalLibrary';
import ScienceIcon from '@mui/icons-material/Science';
import SportsCricketIcon from '@mui/icons-material/SportsCricket';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import SchoolIcon from '@mui/icons-material/School';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import HotelIcon from '@mui/icons-material/Hotel';
import PersonIcon from '@mui/icons-material/Person';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';

import { useNavigate, useLocation } from 'react-router-dom';
import Layout from '../../../core/components/Layout';
import { useAuth } from '../../auth/hooks/useAuth';

export interface DepartmentClearance {
  deptName: string;
  cleared: boolean;
  duesAmount: number;
  remarks: string;
  clearedBy?: string;
  clearanceDate?: string;
}

export interface StudentClearanceRecord {
  id: string;
  studentName: string;
  admissionNo: string;
  rollNo: string;
  className: string;
  streamGroup: string;
  academicYear: string;
  certificateNo?: string;
  certificateIssuedDate?: string;
  status: 'CLEARED' | 'PENDING_DUES' | 'CERTIFICATE_ISSUED';
  departments: {
    library: DepartmentClearance;
    labs: DepartmentClearance;
    sports: DepartmentClearance;
    transportHostel: DepartmentClearance;
    accounts: DepartmentClearance;
  };
}

export const DepartmentClearance = {};
export const StudentClearanceRecord = {};

const DEFAULT_CLEARANCE_RECORDS: StudentClearanceRecord[] = [
  {
    id: 'clr-advik',
    studentName: 'Advik A',
    admissionNo: 'ADM-2026-006',
    rollNo: '10-A-06',
    className: 'Grade 10',
    streamGroup: 'Secondary Standard - Section A',
    academicYear: '2026-27',
    certificateNo: 'NDC/FIC/2026/0061',
    certificateIssuedDate: '2026-10-20',
    status: 'CERTIFICATE_ISSUED',
    departments: {
      library: { deptName: 'Central Library', cleared: true, duesAmount: 0, remarks: 'All textbooks & reference volumes returned. Zero dues.', clearedBy: 'Chief Librarian', clearanceDate: '2026-10-18' },
      labs: { deptName: 'Computer & Science Labs', cleared: true, duesAmount: 0, remarks: 'Workstation & practical equipment verified in order.', clearedBy: 'Senior Lab Technician', clearanceDate: '2026-10-19' },
      sports: { deptName: 'Sports & PE Dept', cleared: true, duesAmount: 0, remarks: 'Athletics gear & locker clearance completed.', clearedBy: 'Sports Director', clearanceDate: '2026-10-19' },
      transportHostel: { deptName: 'Transport / Hostel', cleared: true, duesAmount: 0, remarks: 'Hostel Room 204 (Kaveri Block) cleared and inspected.', clearedBy: 'Hostel Warden', clearanceDate: '2026-10-20' },
      accounts: { deptName: 'Accounts & Tuition', cleared: true, duesAmount: 0, remarks: 'Term 1 & Term 2 tuition & hostel fees settled in full.', clearedBy: 'Accounts Officer', clearanceDate: '2026-10-20' }
    }
  },
  {
    id: 'clr-001',
    studentName: 'Aarav Patel',
    admissionNo: 'ADM-2026-081',
    rollNo: '12-MC-01',
    className: 'Grade 12',
    streamGroup: 'Group 102: Maths - Computer Science',
    academicYear: '2026-27',
    certificateNo: 'NDC/FIC/2026/0812',
    certificateIssuedDate: '2026-10-18',
    status: 'CERTIFICATE_ISSUED',
    departments: {
      library: { deptName: 'Central Library', cleared: true, duesAmount: 0, remarks: 'All 4 books returned. Zero overdue fine.', clearedBy: 'Chief Librarian', clearanceDate: '2026-10-15' },
      labs: { deptName: 'Computer & Physics Labs', cleared: true, duesAmount: 0, remarks: 'Apparatus verified. No breakage recorded.', clearedBy: 'Senior Lab Technician', clearanceDate: '2026-10-16' },
      sports: { deptName: 'Sports & PE Dept', cleared: true, duesAmount: 0, remarks: 'Cricket kit & athletics jersey returned.', clearedBy: 'Sports Director', clearanceDate: '2026-10-16' },
      transportHostel: { deptName: 'Transport / Hostel', cleared: true, duesAmount: 0, remarks: 'Route 12 bus pass submitted.', clearedBy: 'Transport Manager', clearanceDate: '2026-10-17' },
      accounts: { deptName: 'Accounts & Tuition', cleared: true, duesAmount: 0, remarks: 'Term 1 & Term 2 tuition cleared in full.', clearedBy: 'Accounts Officer', clearanceDate: '2026-10-18' }
    }
  },
  {
    id: 'clr-002',
    studentName: 'Priya Sundaram',
    admissionNo: 'ADM-2026-092',
    rollNo: '12-MB-14',
    className: 'Grade 12',
    streamGroup: 'Group 101: Maths - Biology',
    academicYear: '2026-27',
    status: 'PENDING_DUES',
    departments: {
      library: { deptName: 'Central Library', cleared: true, duesAmount: 0, remarks: 'Cleared', clearedBy: 'Chief Librarian', clearanceDate: '2026-10-14' },
      labs: { deptName: 'Chemistry & Biology Labs', cleared: false, duesAmount: 250, remarks: 'Burette 50ml chipped during titration practical.', clearedBy: 'Lab Technician' },
      sports: { deptName: 'Sports & PE Dept', cleared: true, duesAmount: 0, remarks: 'Cleared', clearedBy: 'Sports Director', clearanceDate: '2026-10-15' },
      transportHostel: { deptName: 'Transport / Hostel', cleared: true, duesAmount: 0, remarks: 'Day scholar. Cleared', clearedBy: 'Transport Manager', clearanceDate: '2026-10-15' },
      accounts: { deptName: 'Accounts & Tuition', cleared: true, duesAmount: 0, remarks: 'Tuition cleared in full', clearedBy: 'Accounts Officer', clearanceDate: '2026-10-17' }
    }
  },
  {
    id: 'clr-003',
    studentName: 'Mohammed Tariq',
    admissionNo: 'ADM-2026-105',
    rollNo: '12-CC-08',
    className: 'Grade 12',
    streamGroup: 'Group 104: Commerce - Computer Applications',
    academicYear: '2026-27',
    status: 'CLEARED',
    departments: {
      library: { deptName: 'Central Library', cleared: true, duesAmount: 0, remarks: 'All books returned', clearedBy: 'Chief Librarian', clearanceDate: '2026-10-17' },
      labs: { deptName: 'Computer Lab', cleared: true, duesAmount: 0, remarks: 'Workstation cleared', clearedBy: 'Lab Incharge', clearanceDate: '2026-10-18' },
      sports: { deptName: 'Sports & PE Dept', cleared: true, duesAmount: 0, remarks: 'Volleyball equipment returned', clearedBy: 'Sports Director', clearanceDate: '2026-10-18' },
      transportHostel: { deptName: 'Transport / Hostel', cleared: true, duesAmount: 0, remarks: 'Route 4 clearance confirmed', clearedBy: 'Transport Manager', clearanceDate: '2026-10-19' },
      accounts: { deptName: 'Accounts & Tuition', cleared: true, duesAmount: 0, remarks: 'All fee receipts cleared', clearedBy: 'Accounts Officer', clearanceDate: '2026-10-19' }
    }
  },
  {
    id: 'clr-004',
    studentName: 'Kavita Menon',
    admissionNo: 'ADM-2026-114',
    rollNo: '12-MB-22',
    className: 'Grade 12',
    streamGroup: 'Group 103: Pure Science / Microbiology',
    academicYear: '2026-27',
    status: 'PENDING_DUES',
    departments: {
      library: { deptName: 'Central Library', cleared: false, duesAmount: 120, remarks: 'Overdue fine on Microbiology reference handbook.' },
      labs: { deptName: 'Microbiology & Chemistry Labs', cleared: true, duesAmount: 0, remarks: 'Petri dishes & pipette inventory verified', clearedBy: 'Lab Technician', clearanceDate: '2026-10-18' },
      sports: { deptName: 'Sports & PE Dept', cleared: true, duesAmount: 0, remarks: 'Cleared', clearedBy: 'Sports Director', clearanceDate: '2026-10-18' },
      transportHostel: { deptName: 'Transport / Hostel', cleared: true, duesAmount: 0, remarks: 'Hostel room cleared', clearedBy: 'Hostel Warden', clearanceDate: '2026-10-19' },
      accounts: { deptName: 'Accounts & Tuition', cleared: false, duesAmount: 1800, remarks: 'Term 2 examination fee balance pending' }
    }
  }
];

export const getStoredClearanceRecords = (): StudentClearanceRecord[] => {
  try {
    const raw = localStorage.getItem('erp_student_no_due_records');
    if (raw) {
      const parsed: StudentClearanceRecord[] = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        if (!parsed.some(r => r.id === 'clr-advik' || r.studentName.toLowerCase().includes('advik'))) {
          const merged = [DEFAULT_CLEARANCE_RECORDS[0], ...parsed];
          localStorage.setItem('erp_student_no_due_records', JSON.stringify(merged));
          return merged;
        }
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to parse stored clearance records', e);
  }
  localStorage.setItem('erp_student_no_due_records', JSON.stringify(DEFAULT_CLEARANCE_RECORDS));
  return DEFAULT_CLEARANCE_RECORDS;
};

export const saveStoredClearanceRecords = (records: StudentClearanceRecord[]) => {
  localStorage.setItem('erp_student_no_due_records', JSON.stringify(records));
  window.dispatchEvent(new Event('no_due_updated'));
};

const StudentNoDueDesk: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isStudent } = useAuth();
  const isStudentPortal = location.pathname.startsWith('/student-portal') || isStudent;

  const [records, setRecords] = useState<StudentClearanceRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [streamFilter, setStreamFilter] = useState('ALL');

  // Certificate Modal
  const [selectedStudent, setSelectedStudent] = useState<StudentClearanceRecord | null>(null);
  const [certModalOpen, setCertModalOpen] = useState(false);

  // Clearance Edit Modal
  const [editModalStudent, setEditModalStudent] = useState<StudentClearanceRecord | null>(null);

  useEffect(() => {
    setRecords(getStoredClearanceRecords());
  }, []);

  const currentStudentRecord = useMemo(() => {
    if (!records.length) return DEFAULT_CLEARANCE_RECORDS[0];
    const userFullName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim().toLowerCase();
    const match = records.find(r => 
      (userFullName && r.studentName.toLowerCase().includes(userFullName)) ||
      (user?.studentId && r.admissionNo.toLowerCase() === user?.studentId?.toLowerCase()) ||
      r.id === 'clr-advik' ||
      r.studentName.toLowerCase().includes('advik')
    );
    return match || records[0];
  }, [records, user]);

  const filteredRecords = records.filter(r => {
    const matchesSearch = r.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.admissionNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.rollNo.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' ? true : r.status === statusFilter;
    const matchesStream = streamFilter === 'ALL' ? true : r.streamGroup.includes(streamFilter);
    return matchesSearch && matchesStatus && matchesStream;
  });

  const handleIssueCertificate = (record: StudentClearanceRecord) => {
    const certNumber = `NDC/FIC/2026/0${Math.floor(1000 + Math.random() * 9000)}`;
    const issueDate = new Date().toISOString().split('T')[0];

    const updated = records.map(r => {
      if (r.id === record.id) {
        return {
          ...r,
          status: 'CERTIFICATE_ISSUED' as const,
          certificateNo: r.certificateNo || certNumber,
          certificateIssuedDate: r.certificateIssuedDate || issueDate
        };
      }
      return r;
    });

    setRecords(updated);
    saveStoredClearanceRecords(updated);

    const updatedStudent = updated.find(r => r.id === record.id);
    if (updatedStudent) {
      setSelectedStudent(updatedStudent);
      setCertModalOpen(true);
    }
  };

  const handleClearDepartment = (studentId: string, deptKey: keyof StudentClearanceRecord['departments']) => {
    const updated = records.map(r => {
      if (r.id === studentId) {
        const currentDept = r.departments[deptKey];
        const newCleared = !currentDept.cleared;
        const newDept = {
          ...currentDept,
          cleared: newCleared,
          duesAmount: newCleared ? 0 : currentDept.duesAmount,
          remarks: newCleared ? 'Cleared by Office Admin Desk' : currentDept.remarks,
          clearedBy: newCleared ? 'Office Superintendent' : undefined,
          clearanceDate: newCleared ? new Date().toISOString().split('T')[0] : undefined
        };

        const newDepts = { ...r.departments, [deptKey]: newDept };
        const allDeptsCleared = Object.values(newDepts).every(d => d.cleared);

        return {
          ...r,
          departments: newDepts,
          status: allDeptsCleared 
            ? (r.status === 'CERTIFICATE_ISSUED' ? 'CERTIFICATE_ISSUED' : 'CLEARED')
            : 'PENDING_DUES'
        };
      }
      return r;
    });

    setRecords(updated);
    saveStoredClearanceRecords(updated);
    if (editModalStudent && editModalStudent.id === studentId) {
      const match = updated.find(r => r.id === studentId);
      if (match) setEditModalStudent(match);
    }
  };

  const totalStudents = records.length;
  const issuedCount = records.filter(r => r.status === 'CERTIFICATE_ISSUED').length;
  const readyCount = records.filter(r => r.status === 'CLEARED').length;
  const pendingCount = records.filter(r => r.status === 'PENDING_DUES').length;

  // Single Student Dedicated View (Student Portal)
  if (isStudentPortal) {
    const student = currentStudentRecord;
    const depts = Object.values(student.departments);
    const clearedDeptsCount = depts.filter(d => d.cleared).length;
    const totalDuesAmount = depts.reduce((acc, d) => acc + (d.duesAmount || 0), 0);
    const isAllCleared = clearedDeptsCount === 5;
    const isIssued = student.status === 'CERTIFICATE_ISSUED';

    return (
      <Layout>
        <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: 'auto' }}>
          
          {/* Header */}
          <Box sx={{ mb: 3 }}>
            <Button 
              startIcon={<ArrowBackIcon />} 
              onClick={() => navigate('/student-portal/dashboard')}
              sx={{ textTransform: 'none', color: '#64748b', mb: 1.5, fontWeight: 700 }}
            >
              Back to Student Portal
            </Button>

            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { sm: 'center' }, gap: 2 }}>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <WorkspacePremiumIcon sx={{ fontSize: 36, color: '#059669' }} />
                  <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a' }}>
                    My "No Due" Clearance Report
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  Official institutional departmental clearance record and authenticated clearance certificate.
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', gap: 1.5 }}>
                <Button
                  variant="contained"
                  startIcon={<PrintIcon />}
                  onClick={() => {
                    setSelectedStudent(student);
                    setCertModalOpen(true);
                  }}
                  sx={{
                    bgcolor: '#059669',
                    '&:hover': { bgcolor: '#047857' },
                    textTransform: 'none',
                    fontWeight: 700,
                    borderRadius: 2.5,
                    px: 2.5
                  }}
                >
                  Print Official Certificate
                </Button>
              </Box>
            </Box>
          </Box>

          {/* Student Dossier Summary Card */}
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2.5, md: 3.5 },
              mb: 3.5,
              borderRadius: 3.5,
              border: '1px solid',
              borderColor: isIssued ? '#bbf7d0' : isAllCleared ? '#bae6fd' : '#fde68a',
              background: isIssued
                ? 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)'
                : 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
            }}
          >
            <Grid container spacing={3} alignItems="center">
              <Grid size={{ xs: 12, md: 8 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
                  <Avatar
                    sx={{
                      width: 72,
                      height: 72,
                      bgcolor: '#059669',
                      fontSize: '1.75rem',
                      fontWeight: 800,
                      boxShadow: '0 4px 14px rgba(5, 150, 105, 0.25)'
                    }}
                  >
                    {student.studentName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </Avatar>
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                      <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a' }}>
                        {student.studentName}
                      </Typography>
                      <Chip
                        icon={isIssued || isAllCleared ? <VerifiedIcon /> : <ReportProblemIcon />}
                        label={
                          isIssued
                            ? 'OFFICIAL CERTIFICATE ISSUED'
                            : isAllCleared
                            ? 'ALL DEPARTMENTS CLEARED'
                            : 'ACTION NEEDED • PENDING DUES'
                        }
                        color={isIssued ? 'success' : isAllCleared ? 'info' : 'warning'}
                        sx={{ fontWeight: 800, fontSize: '0.75rem', height: 26 }}
                      />
                    </Box>
                    <Typography variant="body2" sx={{ color: '#475569', mt: 0.5 }}>
                      <strong>Roll No:</strong> <span style={{ fontFamily: 'monospace' }}>{student.rollNo}</span> • <strong>Admission No:</strong> {student.admissionNo} • <strong>Class:</strong> {student.className}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748b' }}>
                      <strong>Stream:</strong> {student.streamGroup} • <strong>Academic Year:</strong> {student.academicYear}
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: 2.5,
                    bgcolor: totalDuesAmount === 0 ? '#ecfdf5' : '#fef2f2',
                    border: '1px solid',
                    borderColor: totalDuesAmount === 0 ? '#a7f3d0' : '#fecaca',
                    textAlign: 'center'
                  }}
                >
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Institutional Dues Status
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 900, color: totalDuesAmount === 0 ? '#059669' : '#dc2626', mt: 0.5 }}>
                    {totalDuesAmount === 0 ? '₹0.00 Outstanding' : `₹${totalDuesAmount} Pending Dues`}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#475569', display: 'block', mt: 0.5, fontWeight: 600 }}>
                    {clearedDeptsCount} of 5 Departments Signed Off (100%)
                  </Typography>
                </Paper>
              </Grid>
            </Grid>

            <Divider sx={{ my: 2.5 }} />

            {/* Department Progress Bar */}
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#334155' }}>
                  Institutional Clearance Progress
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#059669' }}>
                  {clearedDeptsCount} / 5 Departments Complete ({Math.round((clearedDeptsCount / 5) * 100)}%)
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={(clearedDeptsCount / 5) * 100}
                sx={{
                  height: 10,
                  borderRadius: 5,
                  bgcolor: '#e2e8f0',
                  '& .MuiLinearProgress-bar': { bgcolor: isAllCleared ? '#10b981' : '#f59e0b', borderRadius: 5 }
                }}
              />
            </Box>
          </Paper>

          {/* Department Breakdown Grid */}
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', mb: 2 }}>
            Department Clearance Breakdown
          </Typography>

          <Grid container spacing={2.5} sx={{ mb: 4 }}>
            {/* Library */}
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: student.departments.library.cleared ? '#f0fdf4' : '#fff1f2', height: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocalLibraryIcon sx={{ color: '#2563eb' }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a' }}>Central Library</Typography>
                  </Box>
                  <Chip
                    label={student.departments.library.cleared ? 'CLEARED' : `DUE: ₹${student.departments.library.duesAmount}`}
                    color={student.departments.library.cleared ? 'success' : 'error'}
                    size="small"
                    sx={{ fontWeight: 800, height: 22, fontSize: '0.68rem' }}
                  />
                </Box>
                <Typography variant="body2" sx={{ color: '#475569', mb: 1.5, fontSize: '0.85rem' }}>
                  {student.departments.library.remarks}
                </Typography>
                <Divider sx={{ my: 1 }} />
                <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>
                  <strong>Verified by:</strong> {student.departments.library.clearedBy || 'Chief Librarian'}
                </Typography>
                <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                  Date: {student.departments.library.clearanceDate || '2026-10-18'}
                </Typography>
              </Paper>
            </Grid>

            {/* Labs */}
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: student.departments.labs.cleared ? '#f0fdf4' : '#fff1f2', height: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ScienceIcon sx={{ color: '#0d9488' }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a' }}>Computer & Science Labs</Typography>
                  </Box>
                  <Chip
                    label={student.departments.labs.cleared ? 'CLEARED' : `DUE: ₹${student.departments.labs.duesAmount}`}
                    color={student.departments.labs.cleared ? 'success' : 'error'}
                    size="small"
                    sx={{ fontWeight: 800, height: 22, fontSize: '0.68rem' }}
                  />
                </Box>
                <Typography variant="body2" sx={{ color: '#475569', mb: 1.5, fontSize: '0.85rem' }}>
                  {student.departments.labs.remarks}
                </Typography>
                <Divider sx={{ my: 1 }} />
                <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>
                  <strong>Verified by:</strong> {student.departments.labs.clearedBy || 'Lab Incharge'}
                </Typography>
                <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                  Date: {student.departments.labs.clearanceDate || '2026-10-19'}
                </Typography>
              </Paper>
            </Grid>

            {/* Sports */}
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: student.departments.sports.cleared ? '#f0fdf4' : '#fff1f2', height: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SportsCricketIcon sx={{ color: '#16a34a' }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a' }}>Sports & Physical Ed.</Typography>
                  </Box>
                  <Chip
                    label={student.departments.sports.cleared ? 'CLEARED' : `DUE: ₹${student.departments.sports.duesAmount}`}
                    color={student.departments.sports.cleared ? 'success' : 'error'}
                    size="small"
                    sx={{ fontWeight: 800, height: 22, fontSize: '0.68rem' }}
                  />
                </Box>
                <Typography variant="body2" sx={{ color: '#475569', mb: 1.5, fontSize: '0.85rem' }}>
                  {student.departments.sports.remarks}
                </Typography>
                <Divider sx={{ my: 1 }} />
                <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>
                  <strong>Verified by:</strong> {student.departments.sports.clearedBy || 'Sports Director'}
                </Typography>
                <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                  Date: {student.departments.sports.clearanceDate || '2026-10-19'}
                </Typography>
              </Paper>
            </Grid>

            {/* Transport & Hostel */}
            <Grid size={{ xs: 12, sm: 6, md: 6 }}>
              <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: student.departments.transportHostel.cleared ? '#f0fdf4' : '#fff1f2', height: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <HotelIcon sx={{ color: '#eab308' }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a' }}>Hostel & Transport Desk</Typography>
                  </Box>
                  <Chip
                    label={student.departments.transportHostel.cleared ? 'CLEARED' : `DUE: ₹${student.departments.transportHostel.duesAmount}`}
                    color={student.departments.transportHostel.cleared ? 'success' : 'error'}
                    size="small"
                    sx={{ fontWeight: 800, height: 22, fontSize: '0.68rem' }}
                  />
                </Box>
                <Typography variant="body2" sx={{ color: '#475569', mb: 1.5, fontSize: '0.85rem' }}>
                  {student.departments.transportHostel.remarks}
                </Typography>
                <Divider sx={{ my: 1 }} />
                <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>
                  <strong>Verified by:</strong> {student.departments.transportHostel.clearedBy || 'Hostel Warden / Transport Incharge'}
                </Typography>
                <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                  Date: {student.departments.transportHostel.clearanceDate || '2026-10-20'}
                </Typography>
              </Paper>
            </Grid>

            {/* Accounts */}
            <Grid size={{ xs: 12, sm: 6, md: 6 }}>
              <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: student.departments.accounts.cleared ? '#f0fdf4' : '#fff1f2', height: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AccountBalanceIcon sx={{ color: '#8b5cf6' }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a' }}>Accounts & Tuition Desk</Typography>
                  </Box>
                  <Chip
                    label={student.departments.accounts.cleared ? 'CLEARED' : `DUE: ₹${student.departments.accounts.duesAmount}`}
                    color={student.departments.accounts.cleared ? 'success' : 'error'}
                    size="small"
                    sx={{ fontWeight: 800, height: 22, fontSize: '0.68rem' }}
                  />
                </Box>
                <Typography variant="body2" sx={{ color: '#475569', mb: 1.5, fontSize: '0.85rem' }}>
                  {student.departments.accounts.remarks}
                </Typography>
                <Divider sx={{ my: 1 }} />
                <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>
                  <strong>Verified by:</strong> {student.departments.accounts.clearedBy || 'Accounts Officer'}
                </Typography>
                <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                  Date: {student.departments.accounts.clearanceDate || '2026-10-20'}
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          {/* Official Certificate Section */}
          <Paper elevation={0} sx={{ p: { xs: 2.5, md: 4 }, borderRadius: 3.5, border: '2px solid #0f172a', bgcolor: '#ffffff', mb: 4, position: 'relative' }}>
            <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', opacity: 0.03, pointerEvents: 'none' }}>
              <SchoolIcon sx={{ fontSize: 320 }} />
            </Box>

            <Box sx={{ textAlign: 'center', borderBottom: '2px solid #0f172a', pb: 2, mb: 3 }}>
              <Typography variant="overline" sx={{ letterSpacing: 2, fontWeight: 800, color: '#4f46e5' }}>
                CENTRAL BOARD OF SECONDARY EDUCATION • CODE: 55420
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 900, color: '#0f172a', fontFamily: 'serif', mt: 0.5 }}>
                FOUNDATION INTERNATIONAL CENTRAL SCHOOL
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>
                Senior Secondary Campus, Tech Valley Road • Phone: +91 44 2840 9100
              </Typography>
              <Box sx={{ display: 'inline-block', bgcolor: '#0f172a', color: '#ffffff', px: 3, py: 0.5, borderRadius: 1, mt: 1.5, fontWeight: 800, fontSize: '0.9rem', letterSpacing: 1.5 }}>
                INSTITUTIONAL NO DUE / CLEARANCE CERTIFICATE
              </Box>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#334155' }}>
                Certificate Serial: <span style={{ color: '#0f172a' }}>{student.certificateNo || 'NDC/FIC/2026/0061'}</span>
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#334155' }}>
                Date of Issue: <span style={{ color: '#0f172a' }}>{student.certificateIssuedDate || '2026-10-20'}</span>
              </Typography>
            </Box>

            <Typography variant="body1" sx={{ color: '#1e293b', lineHeight: 1.9, textAlign: 'justify', mb: 3 }}>
              This is to officially certify that <strong>{student.studentName}</strong>, bearing Admission Number <strong>{student.admissionNo}</strong> and Board Roll Number <strong>{student.rollNo}</strong>, enrolled in <strong>{student.className} ({student.streamGroup})</strong> for the Academic Session <strong>{student.academicYear}</strong>, has satisfactorily settled all books, laboratory apparatus, physical education equipment, hostel amenities, and tuition fee dues across all departments of this institution.
            </Typography>

            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #cbd5e1', mb: 4, borderRadius: 1.5 }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: '#f1f5f9' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 800, fontSize: '0.75rem' }}>Department Section</TableCell>
                    <TableCell sx={{ fontWeight: 800, fontSize: '0.75rem' }}>Clearance Remark</TableCell>
                    <TableCell sx={{ fontWeight: 800, fontSize: '0.75rem' }}>Dues Status</TableCell>
                    <TableCell sx={{ fontWeight: 800, fontSize: '0.75rem' }}>Authenticated By</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.values(student.departments).map((dept, idx) => (
                    <TableRow key={idx}>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>{dept.deptName}</TableCell>
                      <TableCell sx={{ fontSize: '0.75rem', color: '#475569' }}>{dept.remarks}</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: dept.cleared ? '#16a34a' : '#dc2626' }}>
                        {dept.cleared ? 'NIL / CLEARED' : `DUE ₹${dept.duesAmount}`}
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.75rem', color: '#334155', fontWeight: 600 }}>
                        {dept.clearedBy || 'Department Officer'} ({dept.clearanceDate || student.certificateIssuedDate || '2026-10-20'})
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', pt: 2, borderTop: '2px solid #e2e8f0' }}>
              <Box sx={{ textAlign: 'center', width: 140 }}>
                <Box sx={{ width: 80, height: 80, borderRadius: '50%', border: '2px dashed #059669', mx: 'auto', mb: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', bgcolor: '#f0fdf4' }}>
                  <VerifiedIcon sx={{ color: '#059669', fontSize: 32 }} />
                  <Typography variant="caption" sx={{ fontSize: '0.55rem', fontWeight: 800, color: '#059669' }}>OFFICIALLY VERIFIED</Typography>
                </Box>
                <Typography variant="caption" sx={{ fontSize: '0.65rem', fontWeight: 700, color: '#64748b' }}>
                  REGISTRAR SEAL
                </Typography>
              </Box>

              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" sx={{ fontWeight: 800, color: '#0f172a', fontFamily: 'cursive', fontSize: '1.2rem', mb: 0.5 }}>
                  S. Balasubramanian
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#0f172a', display: 'block' }}>
                  Office Superintendent
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Department of Administration
                </Typography>
              </Box>

              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" sx={{ fontWeight: 800, color: '#0f172a', fontFamily: 'cursive', fontSize: '1.2rem', mb: 0.5 }}>
                  Dr. Revathi Raman
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#0f172a', display: 'block' }}>
                  Principal & Head of School
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  FIC Central School
                </Typography>
              </Box>
            </Box>

            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Button
                variant="contained"
                startIcon={<PrintIcon />}
                onClick={() => {
                  setSelectedStudent(student);
                  setCertModalOpen(true);
                }}
                sx={{ bgcolor: '#059669', '&:hover': { bgcolor: '#047857' }, textTransform: 'none', fontWeight: 800, px: 3, py: 1, borderRadius: 2 }}
              >
                Print / Download Institutional Certificate
              </Button>
            </Box>
          </Paper>

          {/* Printable Dialog Re-use */}
          <Dialog
            open={certModalOpen}
            onClose={() => setCertModalOpen(false)}
            maxWidth="md"
            fullWidth
            PaperProps={{ sx: { borderRadius: 3.5, overflow: 'hidden' } }}
          >
            {selectedStudent && (
              <>
                <Box sx={{ p: 2, bgcolor: '#0f172a', color: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                    Official No Due Clearance Certificate • {selectedStudent.certificateNo}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<PrintIcon />}
                      onClick={() => window.print()}
                      sx={{ bgcolor: '#16a34a', textTransform: 'none', fontWeight: 700 }}
                    >
                      Print Certificate
                    </Button>
                    <Button
                      size="small"
                      onClick={() => setCertModalOpen(false)}
                      sx={{ color: '#ffffff', textTransform: 'none' }}
                    >
                      Close
                    </Button>
                  </Box>
                </Box>
                <DialogContent sx={{ p: { xs: 3, md: 5 }, bgcolor: '#ffffff' }}>
                  <Box sx={{ border: '4px double #0f172a', p: { xs: 2.5, md: 4 }, borderRadius: 2, bgcolor: '#ffffff', position: 'relative' }}>
                    <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', opacity: 0.04, pointerEvents: 'none' }}>
                      <SchoolIcon sx={{ fontSize: 340 }} />
                    </Box>
                    <Box sx={{ textAlign: 'center', borderBottom: '2px solid #0f172a', pb: 2, mb: 3 }}>
                      <Typography variant="overline" sx={{ letterSpacing: 2, fontWeight: 800, color: '#4f46e5' }}>
                        CENTRAL BOARD OF SECONDARY EDUCATION • CODE: 55420
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 900, color: '#0f172a', fontFamily: 'serif', mt: 0.5 }}>
                        FOUNDATION INTERNATIONAL CENTRAL SCHOOL
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>
                        Senior Secondary Campus, Tech Valley Road • Phone: +91 44 2840 9100
                      </Typography>
                      <Box sx={{ display: 'inline-block', bgcolor: '#0f172a', color: '#ffffff', px: 3, py: 0.5, borderRadius: 1, mt: 1.5, fontWeight: 800, fontSize: '0.9rem', letterSpacing: 1.5 }}>
                        INSTITUTIONAL NO DUE / CLEARANCE CERTIFICATE
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#334155' }}>
                        Certificate Serial: <span style={{ color: '#0f172a' }}>{selectedStudent.certificateNo}</span>
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#334155' }}>
                        Date of Issue: <span style={{ color: '#0f172a' }}>{selectedStudent.certificateIssuedDate}</span>
                      </Typography>
                    </Box>
                    <Typography variant="body1" sx={{ color: '#1e293b', lineHeight: 1.9, textAlign: 'justify', mb: 3 }}>
                      This is to officially certify that <strong>{selectedStudent.studentName}</strong>, bearing Admission Number <strong>{selectedStudent.admissionNo}</strong> and Board Roll Number <strong>{selectedStudent.rollNo}</strong>, enrolled in <strong>{selectedStudent.className} ({selectedStudent.streamGroup})</strong> for the Academic Session <strong>{selectedStudent.academicYear}</strong>, has satisfactorily settled all books, apparatus, physical education equipment, transit cards, and tuition fee dues across all departments of this institution.
                    </Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', mb: 1, textTransform: 'uppercase' }}>
                      Department Clearance Verification Matrix
                    </Typography>
                    <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #cbd5e1', mb: 4, borderRadius: 1.5 }}>
                      <Table size="small">
                        <TableHead sx={{ bgcolor: '#f1f5f9' }}>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 800, fontSize: '0.75rem' }}>Department Section</TableCell>
                            <TableCell sx={{ fontWeight: 800, fontSize: '0.75rem' }}>Clearance Remark</TableCell>
                            <TableCell sx={{ fontWeight: 800, fontSize: '0.75rem' }}>Dues Status</TableCell>
                            <TableCell sx={{ fontWeight: 800, fontSize: '0.75rem' }}>Authenticated By</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {Object.values(selectedStudent.departments).map((dept, idx) => (
                            <TableRow key={idx}>
                              <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>{dept.deptName}</TableCell>
                              <TableCell sx={{ fontSize: '0.75rem', color: '#475569' }}>{dept.remarks}</TableCell>
                              <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: '#16a34a' }}>NIL / CLEARED</TableCell>
                              <TableCell sx={{ fontSize: '0.75rem', color: '#334155', fontWeight: 600 }}>{dept.clearedBy || 'Office Admin'} ({dept.clearanceDate || selectedStudent.certificateIssuedDate})</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', pt: 2, borderTop: '2px solid #e2e8f0' }}>
                      <Box sx={{ textAlign: 'center', width: 140 }}>
                        <Box sx={{ width: 80, height: 80, borderRadius: '50%', border: '2px dashed #059669', mx: 'auto', mb: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', bgcolor: '#f0fdf4' }}>
                          <VerifiedIcon sx={{ color: '#059669', fontSize: 32 }} />
                          <Typography variant="caption" sx={{ fontSize: '0.55rem', fontWeight: 800, color: '#059669' }}>OFFICIALLY VERIFIED</Typography>
                        </Box>
                        <Typography variant="caption" sx={{ fontSize: '0.65rem', fontWeight: 700, color: '#64748b' }}>
                          REGISTRAR SEAL
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="body2" sx={{ fontWeight: 800, color: '#0f172a', fontFamily: 'cursive', fontSize: '1.2rem', mb: 0.5 }}>
                          S. Balasubramanian
                        </Typography>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: '#0f172a', display: 'block' }}>
                          Office Superintendent
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Department of Administration
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="body2" sx={{ fontWeight: 800, color: '#0f172a', fontFamily: 'cursive', fontSize: '1.2rem', mb: 0.5 }}>
                          Dr. Revathi Raman
                        </Typography>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: '#0f172a', display: 'block' }}>
                          Principal & Head of School
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          FIC Central School
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </DialogContent>
              </>
            )}
          </Dialog>

        </Box>
      </Layout>
    );
  }

  // Office / Staff Admin Desk View (Renders full cohort)
  return (
    <Layout>
      <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1400, mx: 'auto' }}>
        
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Button 
            startIcon={<ArrowBackIcon />} 
            onClick={() => navigate('/office/dashboard')}
            sx={{ textTransform: 'none', color: '#64748b', mb: 1, fontWeight: 600 }}
          >
            Back to Office Dashboard
          </Button>

          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { sm: 'center' }, gap: 2 }}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <WorkspacePremiumIcon sx={{ fontSize: 36, color: '#059669' }} />
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a' }}>
                  Student "No Due" & Clearance Desk
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Verify multi-department dues (Library, Labs, Sports, Transport, Accounts) and issue stamped institutional clearance certificates.
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Stats Row */}
        <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card elevation={0} sx={{ p: 2.5, borderRadius: 3, border: '1px solid #dcfce7', bgcolor: '#f0fdf4', display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ width: 48, height: 48, borderRadius: 2.5, bgcolor: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <WorkspacePremiumIcon />
              </Box>
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 600, color: '#166534', textTransform: 'uppercase' }}>Certificates Issued</Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#15803d' }}>{issuedCount}</Typography>
              </Box>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card elevation={0} sx={{ p: 2.5, borderRadius: 3, border: '1px solid #e0f2fe', bgcolor: '#f0f9ff', display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ width: 48, height: 48, borderRadius: 2.5, bgcolor: '#e0f2fe', color: '#0369a1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircleIcon />
              </Box>
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 600, color: '#0369a1', textTransform: 'uppercase' }}>Ready for Clearance</Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#0c4a6e' }}>{readyCount}</Typography>
              </Box>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card elevation={0} sx={{ p: 2.5, borderRadius: 3, border: '1px solid #fef3c7', bgcolor: '#fffbeb', display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ width: 48, height: 48, borderRadius: 2.5, bgcolor: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <PendingActionsIcon />
              </Box>
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 600, color: '#b45309', textTransform: 'uppercase' }}>Pending Department Dues</Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#b45309' }}>{pendingCount}</Typography>
              </Box>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card elevation={0} sx={{ p: 2.5, borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: '#ffffff', display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ width: 48, height: 48, borderRadius: 2.5, bgcolor: '#f1f5f9', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <SchoolIcon />
              </Box>
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Total Candidates</Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a' }}>{totalStudents}</Typography>
              </Box>
            </Card>
          </Grid>
        </Grid>

        {/* Filters */}
        <Paper elevation={0} sx={{ p: 2.5, mb: 3.5, borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: '#ffffff' }}>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, md: 5 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search student by name, admission no, or roll number..."
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

            <Grid size={{ xs: 6, sm: 3.5 }}>
              <TextField
                select
                fullWidth
                size="small"
                label="Stream / Group"
                value={streamFilter}
                onChange={e => setStreamFilter(e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }}
              >
                <MenuItem value="ALL">All Higher Secondary Streams</MenuItem>
                <MenuItem value="Maths - Computer">Maths - Computer Science</MenuItem>
                <MenuItem value="Maths - Biology">Maths - Biology</MenuItem>
                <MenuItem value="Microbiology">Pure Science / Microbiology</MenuItem>
                <MenuItem value="Commerce">Commerce & Accounts</MenuItem>
              </TextField>
            </Grid>

            <Grid size={{ xs: 6, sm: 3.5 }}>
              <TextField
                select
                fullWidth
                size="small"
                label="Clearance Status"
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }}
              >
                <MenuItem value="ALL">All Statuses</MenuItem>
                <MenuItem value="CERTIFICATE_ISSUED">Certificate Issued</MenuItem>
                <MenuItem value="CLEARED">All Cleared (Ready to Issue)</MenuItem>
                <MenuItem value="PENDING_DUES">Action Needed (Has Dues)</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </Paper>

        {/* Student Records List */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {filteredRecords.map(student => {
            const depts = Object.values(student.departments);
            const clearedDeptsCount = depts.filter(d => d.cleared).length;
            const totalDuesAmount = depts.reduce((acc, d) => acc + (d.duesAmount || 0), 0);
            const isAllCleared = clearedDeptsCount === 5;
            const isIssued = student.status === 'CERTIFICATE_ISSUED';

            return (
              <Card
                key={student.id}
                elevation={0}
                sx={{
                  borderRadius: 3.5,
                  border: '1px solid',
                  borderColor: isIssued ? '#bbf7d0' : isAllCleared ? '#bae6fd' : '#fde68a',
                  bgcolor: '#ffffff',
                  overflow: 'hidden'
                }}
              >
                <Box sx={{
                  p: 2.5,
                  bgcolor: isIssued ? '#f0fdf4' : isAllCleared ? '#f0f9ff' : '#fffbeb',
                  borderBottom: '1px solid #e2e8f0',
                  display: 'flex',
                  flexDirection: { xs: 'column', md: 'row' },
                  justifyContent: 'space-between',
                  alignItems: { md: 'center' },
                  gap: 2
                }}>
                  <Box>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
                      <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
                        {student.studentName}
                      </Typography>
                      <Chip label={student.rollNo} size="small" sx={{ fontWeight: 700, bgcolor: '#ffffff', border: '1px solid #cbd5e1' }} />
                      <Chip label={student.admissionNo} size="small" sx={{ fontWeight: 700, bgcolor: '#ffffff', border: '1px solid #cbd5e1' }} />
                      <Chip
                        label={student.streamGroup}
                        size="small"
                        sx={{ fontWeight: 700, bgcolor: '#e0e7ff', color: '#4338ca' }}
                      />
                    </Box>
                    <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                      Academic Year {student.academicYear} • Class {student.className}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => setEditModalStudent(student)}
                      sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, borderColor: '#cbd5e1', color: '#334155' }}
                    >
                      Inspect / Update Dues
                    </Button>

                    {isIssued ? (
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<PrintIcon />}
                        onClick={() => {
                          setSelectedStudent(student);
                          setCertModalOpen(true);
                        }}
                        sx={{ borderRadius: 2, bgcolor: '#16a34a', fontWeight: 700, textTransform: 'none', '&:hover': { bgcolor: '#15803d' } }}
                      >
                        View & Print Certificate
                      </Button>
                    ) : (
                      <Button
                        size="small"
                        variant="contained"
                        disabled={!isAllCleared}
                        startIcon={<WorkspacePremiumIcon />}
                        onClick={() => handleIssueCertificate(student)}
                        sx={{ borderRadius: 2, bgcolor: '#0284c7', fontWeight: 700, textTransform: 'none', '&:hover': { bgcolor: '#0369a1' } }}
                      >
                        Issue No Due Certificate
                      </Button>
                    )}
                  </Box>
                </Box>

                {/* 5-Department Clearance Bar */}
                <CardContent sx={{ p: 2.5 }}>
                  <Grid container spacing={2}>
                    {/* Library */}
                    <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                      <Paper elevation={0} sx={{ p: 1.5, borderRadius: 2, border: '1px solid #e2e8f0', bgcolor: student.departments.library.cleared ? '#f0fdf4' : '#fff1f2' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="caption" sx={{ fontWeight: 800, color: '#334155', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <LocalLibraryIcon sx={{ fontSize: 16, color: '#6366f1' }} /> Library
                          </Typography>
                          <Chip 
                            label={student.departments.library.cleared ? "CLEARED" : `DUE: ₹${student.departments.library.duesAmount}`}
                            size="small"
                            color={student.departments.library.cleared ? "success" : "error"}
                            sx={{ height: 18, fontSize: '0.62rem', fontWeight: 800 }}
                          />
                        </Box>
                        <Typography variant="caption" sx={{ color: '#64748b', display: 'block', fontSize: '0.7rem' }}>
                          {student.departments.library.remarks}
                        </Typography>
                      </Paper>
                    </Grid>

                    {/* Labs */}
                    <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                      <Paper elevation={0} sx={{ p: 1.5, borderRadius: 2, border: '1px solid #e2e8f0', bgcolor: student.departments.labs.cleared ? '#f0fdf4' : '#fff1f2' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="caption" sx={{ fontWeight: 800, color: '#334155', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <ScienceIcon sx={{ fontSize: 16, color: '#0ea5e9' }} /> Science/CS Labs
                          </Typography>
                          <Chip 
                            label={student.departments.labs.cleared ? "CLEARED" : `DUE: ₹${student.departments.labs.duesAmount}`}
                            size="small"
                            color={student.departments.labs.cleared ? "success" : "error"}
                            sx={{ height: 18, fontSize: '0.62rem', fontWeight: 800 }}
                          />
                        </Box>
                        <Typography variant="caption" sx={{ color: '#64748b', display: 'block', fontSize: '0.7rem' }}>
                          {student.departments.labs.remarks}
                        </Typography>
                      </Paper>
                    </Grid>

                    {/* Sports */}
                    <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                      <Paper elevation={0} sx={{ p: 1.5, borderRadius: 2, border: '1px solid #e2e8f0', bgcolor: student.departments.sports.cleared ? '#f0fdf4' : '#fff1f2' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="caption" sx={{ fontWeight: 800, color: '#334155', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <SportsCricketIcon sx={{ fontSize: 16, color: '#16a34a' }} /> Sports & PE
                          </Typography>
                          <Chip 
                            label={student.departments.sports.cleared ? "CLEARED" : `DUE: ₹${student.departments.sports.duesAmount}`}
                            size="small"
                            color={student.departments.sports.cleared ? "success" : "error"}
                            sx={{ height: 18, fontSize: '0.62rem', fontWeight: 800 }}
                          />
                        </Box>
                        <Typography variant="caption" sx={{ color: '#64748b', display: 'block', fontSize: '0.7rem' }}>
                          {student.departments.sports.remarks}
                        </Typography>
                      </Paper>
                    </Grid>

                    {/* Transport & Hostel */}
                    <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                      <Paper elevation={0} sx={{ p: 1.5, borderRadius: 2, border: '1px solid #e2e8f0', bgcolor: student.departments.transportHostel.cleared ? '#f0fdf4' : '#fff1f2' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="caption" sx={{ fontWeight: 800, color: '#334155', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <DirectionsBusIcon sx={{ fontSize: 16, color: '#eab308' }} /> Bus / Hostel
                          </Typography>
                          <Chip 
                            label={student.departments.transportHostel.cleared ? "CLEARED" : `DUE: ₹${student.departments.transportHostel.duesAmount}`}
                            size="small"
                            color={student.departments.transportHostel.cleared ? "success" : "error"}
                            sx={{ height: 18, fontSize: '0.62rem', fontWeight: 800 }}
                          />
                        </Box>
                        <Typography variant="caption" sx={{ color: '#64748b', display: 'block', fontSize: '0.7rem' }}>
                          {student.departments.transportHostel.remarks}
                        </Typography>
                      </Paper>
                    </Grid>

                    {/* Accounts */}
                    <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                      <Paper elevation={0} sx={{ p: 1.5, borderRadius: 2, border: '1px solid #e2e8f0', bgcolor: student.departments.accounts.cleared ? '#f0fdf4' : '#fff1f2' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="caption" sx={{ fontWeight: 800, color: '#334155', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <AccountBalanceIcon sx={{ fontSize: 16, color: '#8b5cf6' }} /> Accounts
                          </Typography>
                          <Chip 
                            label={student.departments.accounts.cleared ? "CLEARED" : `DUE: ₹${student.departments.accounts.duesAmount}`}
                            size="small"
                            color={student.departments.accounts.cleared ? "success" : "error"}
                            sx={{ height: 18, fontSize: '0.62rem', fontWeight: 800 }}
                          />
                        </Box>
                        <Typography variant="caption" sx={{ color: '#64748b', display: 'block', fontSize: '0.7rem' }}>
                          {student.departments.accounts.remarks}
                        </Typography>
                      </Paper>
                    </Grid>
                  </Grid>

                  {/* Summary Bar */}
                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#f8fafc', p: 1.5, borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: '#334155' }}>
                        Clearance Progress: {clearedDeptsCount} of 5 Departments Signed Off
                      </Typography>
                    </Box>

                    {totalDuesAmount > 0 && (
                      <Typography variant="caption" sx={{ fontWeight: 800, color: '#dc2626' }}>
                        Total Outstanding Fine / Dues: ₹{totalDuesAmount}
                      </Typography>
                    )}
                  </Box>
                </CardContent>
              </Card>
            );
          })}
        </Box>

        {/* DEPARTMENT DUES INSPECT & TOGGLE MODAL */}
        <Dialog
          open={Boolean(editModalStudent)}
          onClose={() => setEditModalStudent(null)}
          maxWidth="md"
          fullWidth
          PaperProps={{ sx: { borderRadius: 3.5 } }}
        >
          {editModalStudent && (
            <>
              <DialogTitle sx={{ fontWeight: 800, borderBottom: '1px solid #e2e8f0' }}>
                Department Clearance Controls • {editModalStudent.studentName} ({editModalStudent.rollNo})
              </DialogTitle>
              <DialogContent sx={{ p: 3 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Toggle departmental clearance status or settle recorded dues for {editModalStudent.studentName}.
                </Typography>

                <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2.5 }}>
                  <Table>
                    <TableHead sx={{ bgcolor: '#f8fafc' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700 }}>Department</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Recorded Condition / Remarks</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Outstanding Due (₹)</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Current Status</TableCell>
                        <TableCell sx={{ fontWeight: 700, textAlign: 'right' }}>Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {(['library', 'labs', 'sports', 'transportHostel', 'accounts'] as const).map(key => {
                        const d = editModalStudent.departments[key];
                        return (
                          <TableRow key={key}>
                            <TableCell sx={{ fontWeight: 700, color: '#1e293b' }}>{d.deptName}</TableCell>
                            <TableCell sx={{ color: '#64748b' }}>{d.remarks}</TableCell>
                            <TableCell sx={{ fontWeight: 700, color: d.duesAmount > 0 ? '#dc2626' : '#16a34a' }}>
                              ₹{d.duesAmount}
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={d.cleared ? "CLEARED" : "PENDING DUES"}
                                size="small"
                                color={d.cleared ? "success" : "error"}
                                sx={{ fontWeight: 800 }}
                              />
                            </TableCell>
                            <TableCell sx={{ textAlign: 'right' }}>
                              <Button
                                size="small"
                                variant={d.cleared ? "outlined" : "contained"}
                                color={d.cleared ? "warning" : "success"}
                                onClick={() => handleClearDepartment(editModalStudent.id, key)}
                                sx={{ textTransform: 'none', fontWeight: 700 }}
                              >
                                {d.cleared ? "Mark Dues" : "Grant Sign-off"}
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </DialogContent>
              <DialogActions sx={{ p: 2.5, bgcolor: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
                <Button onClick={() => setEditModalStudent(null)} variant="contained" sx={{ bgcolor: '#0f172a', textTransform: 'none', borderRadius: 2 }}>
                  Done
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>

        {/* OFFICIAL INSTITUTIONAL "NO DUE CERTIFICATE" PRINTABLE DIALOG */}
        <Dialog
          open={certModalOpen}
          onClose={() => setCertModalOpen(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{ sx: { borderRadius: 3.5, overflow: 'hidden' } }}
        >
          {selectedStudent && (
            <>
              <Box sx={{ p: 2, bgcolor: '#0f172a', color: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  Official No Due Clearance Certificate • {selectedStudent.certificateNo}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<PrintIcon />}
                    onClick={() => window.print()}
                    sx={{ bgcolor: '#16a34a', textTransform: 'none', fontWeight: 700 }}
                  >
                    Print Certificate
                  </Button>
                  <Button
                    size="small"
                    onClick={() => setCertModalOpen(false)}
                    sx={{ color: '#ffffff', textTransform: 'none' }}
                  >
                    Close
                  </Button>
                </Box>
              </Box>

              <DialogContent sx={{ p: { xs: 3, md: 5 }, bgcolor: '#ffffff' }}>
                {/* Certificate Outer Border Frame */}
                <Box sx={{
                  border: '4px double #0f172a',
                  p: { xs: 2.5, md: 4 },
                  borderRadius: 2,
                  bgcolor: '#ffffff',
                  position: 'relative'
                }}>
                  {/* Watermark Logo */}
                  <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    opacity: 0.04,
                    pointerEvents: 'none'
                  }}>
                    <SchoolIcon sx={{ fontSize: 340 }} />
                  </Box>

                  {/* Header */}
                  <Box sx={{ textAlign: 'center', borderBottom: '2px solid #0f172a', pb: 2, mb: 3 }}>
                    <Typography variant="overline" sx={{ letterSpacing: 2, fontWeight: 800, color: '#4f46e5' }}>
                      CENTRAL BOARD OF SECONDARY EDUCATION • CODE: 55420
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 900, color: '#0f172a', fontFamily: 'serif', mt: 0.5 }}>
                      FOUNDATION INTERNATIONAL CENTRAL SCHOOL
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>
                      Senior Secondary Campus, Tech Valley Road • Phone: +91 44 2840 9100
                    </Typography>
                    <Box sx={{ display: 'inline-block', bgcolor: '#0f172a', color: '#ffffff', px: 3, py: 0.5, borderRadius: 1, mt: 1.5, fontWeight: 800, fontSize: '0.9rem', letterSpacing: 1.5 }}>
                      INSTITUTIONAL NO DUE / CLEARANCE CERTIFICATE
                    </Box>
                  </Box>

                  {/* Certificate Info Row */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#334155' }}>
                      Certificate Serial: <span style={{ color: '#0f172a' }}>{selectedStudent.certificateNo}</span>
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#334155' }}>
                      Date of Issue: <span style={{ color: '#0f172a' }}>{selectedStudent.certificateIssuedDate}</span>
                    </Typography>
                  </Box>

                  {/* Certification Statement */}
                  <Typography variant="body1" sx={{ color: '#1e293b', lineHeight: 1.9, textAlign: 'justify', mb: 3 }}>
                    This is to officially certify that <strong>{selectedStudent.studentName}</strong>, bearing Admission Number <strong>{selectedStudent.admissionNo}</strong> and Board Roll Number <strong>{selectedStudent.rollNo}</strong>, enrolled in <strong>{selectedStudent.className} ({selectedStudent.streamGroup})</strong> for the Academic Session <strong>{selectedStudent.academicYear}</strong>, has satisfactorily settled all books, apparatus, physical education equipment, transit cards, and tuition fee dues across all departments of this institution.
                  </Typography>

                  {/* Department Sign-Off Matrix */}
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', mb: 1, textTransform: 'uppercase' }}>
                    Department Clearance Verification Matrix
                  </Typography>
                  <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #cbd5e1', mb: 4, borderRadius: 1.5 }}>
                    <Table size="small">
                      <TableHead sx={{ bgcolor: '#f1f5f9' }}>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 800, fontSize: '0.75rem' }}>Department Section</TableCell>
                          <TableCell sx={{ fontWeight: 800, fontSize: '0.75rem' }}>Clearance Remark</TableCell>
                          <TableCell sx={{ fontWeight: 800, fontSize: '0.75rem' }}>Dues Status</TableCell>
                          <TableCell sx={{ fontWeight: 800, fontSize: '0.75rem' }}>Authenticated By</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {Object.values(selectedStudent.departments).map((dept, idx) => (
                          <TableRow key={idx}>
                            <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>{dept.deptName}</TableCell>
                            <TableCell sx={{ fontSize: '0.75rem', color: '#475569' }}>{dept.remarks}</TableCell>
                            <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: '#16a34a' }}>NIL / CLEARED</TableCell>
                            <TableCell sx={{ fontSize: '0.75rem', color: '#334155', fontWeight: 600 }}>{dept.clearedBy || 'Office Admin'} ({dept.clearanceDate || selectedStudent.certificateIssuedDate})</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  {/* Seal and Signatures */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', pt: 2, borderTop: '2px solid #e2e8f0' }}>
                    <Box sx={{ textAlign: 'center', width: 140 }}>
                      <Box sx={{ width: 80, height: 80, borderRadius: '50%', border: '2px dashed #059669', mx: 'auto', mb: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', bgcolor: '#f0fdf4' }}>
                        <VerifiedIcon sx={{ color: '#059669', fontSize: 32 }} />
                        <Typography variant="caption" sx={{ fontSize: '0.55rem', fontWeight: 800, color: '#059669' }}>OFFICIALLY VERIFIED</Typography>
                      </Box>
                      <Typography variant="caption" sx={{ fontSize: '0.65rem', fontWeight: 700, color: '#64748b' }}>
                        REGISTRAR SEAL
                      </Typography>
                    </Box>

                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="body2" sx={{ fontWeight: 800, color: '#0f172a', fontFamily: 'cursive', fontSize: '1.2rem', mb: 0.5 }}>
                        S. Balasubramanian
                      </Typography>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: '#0f172a', display: 'block' }}>
                        Office Superintendent
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Department of Administration
                      </Typography>
                    </Box>

                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="body2" sx={{ fontWeight: 800, color: '#0f172a', fontFamily: 'cursive', fontSize: '1.2rem', mb: 0.5 }}>
                        Dr. Revathi Raman
                      </Typography>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: '#0f172a', display: 'block' }}>
                        Principal & Head of School
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        FIC Central School
                      </Typography>
                    </Box>
                  </Box>

                </Box>
              </DialogContent>
            </>
          )}
        </Dialog>

      </Box>
    </Layout>
  );
};

export default StudentNoDueDesk;
