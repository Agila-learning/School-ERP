import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, Chip, Table, TableBody,
  TableCell, TableHead, TableRow, TableContainer, Alert, Button, Divider, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField, MenuItem,
  IconButton, Tooltip, Snackbar, InputAdornment, Paper, Avatar, useTheme, useMediaQuery
} from '@mui/material';
import {
  WorkspacePremium as CertificateIcon,
  Search as SearchIcon,
  AddCircle as AddIcon,
  Print as PrintIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FileDownload as ExcelIcon,
  School as SchoolIcon,
  Person as PersonIcon,
  Close as CloseIcon,
  CheckCircle as CheckIcon,
  HistoryEdu as HistoryEduIcon,
  VerifiedUser as VerifiedIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  ArrowBack as BackIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

// ─── Interfaces ───

export interface BonafideCertificate {
  id: string;
  certificateNumber: string; // e.g. "BC-2026-0481"
  studentName: string;
  admissionNumber: string;
  rollNumber?: string;
  classGrade: string;
  section: string;
  academicYear: string;
  fatherName: string;
  motherName: string;
  dateOfBirth: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  conduct: 'EXEMPLARY' | 'VERY_GOOD' | 'GOOD' | 'SATISFACTORY';
  purpose: string;
  customPurpose?: string;
  issueDate: string;
  signatory: string;
  status: 'ISSUED' | 'PENDING_APPROVAL' | 'REVOKED';
  remarks?: string;
  createdAt: string;
}

export interface StudentReference {
  admissionNumber: string;
  name: string;
  classGrade: string;
  section: string;
  academicYear: string;
  fatherName: string;
  motherName: string;
  dateOfBirth: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  rollNumber: string;
}

// ─── Sample Students for Quick Auto-Fill ───

export const SAMPLE_STUDENTS: StudentReference[] = [];

export const CERTIFICATE_PURPOSES = [
  'Passport / Visa Application',
  'Bank Account Opening (Minor / Student)',
  'Scholarship / Government Financial Assistance',
  'Income Tax Exemption / Parent Employer Allowance',
  'State Transport / Metro Bus Pass Concession',
  'Aadhaar Card / National ID Proof Verification',
  'National / State Level Sports Meet Participation',
  'Inter-School Olympiad & Talent Search Registration',
  'Higher Secondary / Coaching Institute Admission',
  'Other / Custom Specific Purpose'
];

const INITIAL_CERTIFICATES: BonafideCertificate[] = [];

// Helper to export CSV formatted for Microsoft Excel
export const exportBonafideToExcel = (filename: string, headers: string[], rows: (string | number)[][]) => {
  const escapeCsv = (val: string | number | undefined | null) => {
    if (val === undefined || val === null) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const csvRows = [
    headers.map(escapeCsv).join(','),
    ...rows.map(row => row.map(escapeCsv).join(','))
  ];

  const csvContent = '\uFEFF' + csvRows.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const BonafideCertificateDesk: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // ─── State: Certificates List ───
  const [certificates, setCertificates] = useState<BonafideCertificate[]>(() => {
    const saved = localStorage.getItem('erp_office_bonafide_certificates');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return INITIAL_CERTIFICATES;
  });

  useEffect(() => {
    localStorage.setItem('erp_office_bonafide_certificates', JSON.stringify(certificates));
  }, [certificates]);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [classFilter, setClassFilter] = useState('ALL');
  const [purposeFilter, setPurposeFilter] = useState('ALL');

  // Modals
  const [generateModalOpen, setGenerateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedCert, setSelectedCert] = useState<BonafideCertificate | null>(null);
  const [viewCertificateModalOpen, setViewCertificateModalOpen] = useState(false);
  const [certToView, setCertToView] = useState<BonafideCertificate | null>(null);

  // Form State
  const [form, setForm] = useState({
    studentSelection: '', // Admission number if selected
    studentName: '',
    admissionNumber: '',
    rollNumber: '',
    classGrade: '10',
    section: 'A',
    academicYear: '2025-2026',
    fatherName: '',
    motherName: '',
    dateOfBirth: '',
    gender: 'MALE' as 'MALE' | 'FEMALE' | 'OTHER',
    conduct: 'EXEMPLARY' as 'EXEMPLARY' | 'VERY_GOOD' | 'GOOD' | 'SATISFACTORY',
    purpose: CERTIFICATE_PURPOSES[0],
    customPurpose: '',
    issueDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    signatory: 'Dr. R. K. Saxena (Principal)',
    remarks: ''
  });

  // Toast
  const [toast, setToast] = useState<{ open: boolean; message: string; severity: 'success' | 'info' | 'warning' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  });

  // ─── Auto-Fill Student Handler ───
  const handleSelectStudentReference = (admNo: string) => {
    const student = SAMPLE_STUDENTS.find(s => s.admissionNumber === admNo);
    if (student) {
      setForm(prev => ({
        ...prev,
        studentSelection: admNo,
        studentName: student.name,
        admissionNumber: student.admissionNumber,
        rollNumber: student.rollNumber,
        classGrade: student.classGrade,
        section: student.section,
        academicYear: student.academicYear,
        fatherName: student.fatherName,
        motherName: student.motherName,
        dateOfBirth: student.dateOfBirth,
        gender: student.gender
      }));
    } else {
      setForm(prev => ({ ...prev, studentSelection: '' }));
    }
  };

  // ─── Handlers ───

  const handleGenerateCertificate = () => {
    if (!form.studentName.trim()) {
      setToast({ open: true, message: 'Please enter student full name', severity: 'warning' });
      return;
    }
    if (!form.admissionNumber.trim()) {
      setToast({ open: true, message: 'Please enter student admission number', severity: 'warning' });
      return;
    }

    const nextNumber = 480 + certificates.length + 1;
    const certificateNumber = `BC-2026-${nextNumber.toString().padStart(4, '0')}`;

    const newCert: BonafideCertificate = {
      id: `cert-${Date.now()}`,
      certificateNumber,
      studentName: form.studentName.trim(),
      admissionNumber: form.admissionNumber.trim(),
      rollNumber: form.rollNumber.trim(),
      classGrade: form.classGrade,
      section: form.section,
      academicYear: form.academicYear,
      fatherName: form.fatherName.trim() || 'Parent/Guardian',
      motherName: form.motherName.trim() || 'Parent/Guardian',
      dateOfBirth: form.dateOfBirth || 'As per school record',
      gender: form.gender,
      conduct: form.conduct,
      purpose: form.purpose === 'Other / Custom Specific Purpose' && form.customPurpose ? form.customPurpose : form.purpose,
      customPurpose: form.customPurpose,
      issueDate: form.issueDate,
      signatory: form.signatory,
      status: 'ISSUED',
      remarks: form.remarks,
      createdAt: new Date().toISOString()
    };

    setCertificates(prev => [newCert, ...prev]);
    setGenerateModalOpen(false);

    // Auto-view the generated certificate
    setCertToView(newCert);
    setViewCertificateModalOpen(true);

    setToast({
      open: true,
      message: `Bonafide Certificate #${certificateNumber} issued successfully for ${newCert.studentName}!`,
      severity: 'success'
    });

    // Reset Form
    setForm({
      studentSelection: '',
      studentName: '',
      admissionNumber: '',
      rollNumber: '',
      classGrade: '10',
      section: 'A',
      academicYear: '2025-2026',
      fatherName: '',
      motherName: '',
      dateOfBirth: '',
      gender: 'MALE',
      conduct: 'EXEMPLARY',
      purpose: CERTIFICATE_PURPOSES[0],
      customPurpose: '',
      issueDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      signatory: 'Dr. R. K. Saxena (Principal)',
      remarks: ''
    });
  };

  const handleUpdateCertificate = () => {
    if (!selectedCert) return;
    setCertificates(prev => prev.map(c => (c.id === selectedCert.id ? selectedCert : c)));
    setEditModalOpen(false);
    setToast({ open: true, message: 'Certificate details updated successfully.', severity: 'success' });
  };

  const handleDeleteCertificate = (certId: string) => {
    if (window.confirm('Are you sure you want to revoke / delete this bonafide certificate?')) {
      setCertificates(prev => prev.filter(c => c.id !== certId));
      setToast({ open: true, message: 'Bonafide certificate revoked / removed.', severity: 'info' });
    }
  };

  const handleExportExcel = () => {
    const headers = [
      'Certificate No',
      'Student Name',
      'Admission No',
      'Roll No',
      'Class',
      'Section',
      'Academic Year',
      'Father Name',
      'Mother Name',
      'Date of Birth',
      'Gender',
      'Conduct',
      'Purpose of Certificate',
      'Issue Date',
      'Signatory Authority',
      'Status',
      'Remarks'
    ];

    const rows = filteredCertificates.map(c => [
      c.certificateNumber,
      c.studentName,
      c.admissionNumber,
      c.rollNumber || 'N/A',
      c.classGrade,
      c.section,
      c.academicYear,
      c.fatherName,
      c.motherName,
      c.dateOfBirth,
      c.gender,
      c.conduct,
      c.purpose,
      c.issueDate,
      c.signatory,
      c.status,
      c.remarks || ''
    ]);

    exportBonafideToExcel('Office_Admin_Bonafide_Certificates', headers, rows);
    setToast({ open: true, message: 'Bonafide certificates exported to Excel (.csv) successfully!', severity: 'success' });
  };

  // ─── Filtered Certificates ───
  const filteredCertificates = useMemo(() => {
    return certificates.filter(c => {
      const matchSearch =
        c.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.admissionNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.certificateNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.purpose.toLowerCase().includes(searchQuery.toLowerCase());

      const matchClass = classFilter === 'ALL' || c.classGrade === classFilter;
      const matchPurpose = purposeFilter === 'ALL' || c.purpose.includes(purposeFilter);

      return matchSearch && matchClass && matchPurpose;
    });
  }, [certificates, searchQuery, classFilter, purposeFilter]);

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, bgcolor: '#f8fafc', minHeight: '100vh' }}>
      
      {/* ─── Top Header ─── */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)',
          borderRadius: 4,
          p: { xs: 2.5, sm: 3.5, md: 4 },
          color: '#ffffff',
          mb: 3,
          boxShadow: '0 12px 30px rgba(49, 46, 129, 0.25)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: 3,
                bgcolor: 'rgba(255,255,255,0.12)',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(255,255,255,0.2)'
              }}
            >
              <CertificateIcon sx={{ fontSize: 32, color: '#a5b4fc' }} />
            </Box>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: '-0.02em', fontSize: { xs: '1.5rem', sm: '1.85rem', md: '2.2rem' } }}>
                  Bonafide Certificate Generating Desk
                </Typography>
                <Chip
                  label="OFFICE ADMIN PORTAL"
                  size="small"
                  sx={{ bgcolor: '#4f46e5', color: '#fff', fontWeight: 800, fontSize: '0.7rem' }}
                />
              </Box>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mt: 0.5, fontWeight: 500 }}>
                Instant generation, institutional preview, A4 print, and official registry of student bonafide certificates.
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              onClick={() => setGenerateModalOpen(true)}
              startIcon={<AddIcon />}
              sx={{
                bgcolor: '#818cf8',
                color: '#0f172a',
                fontWeight: 800,
                borderRadius: 2.5,
                px: 2.5,
                py: 1,
                boxShadow: '0 4px 15px rgba(129, 140, 248, 0.4)',
                '&:hover': { bgcolor: '#a5b4fc' }
              }}
            >
              + Generate Certificate
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate('/office/dashboard')}
              startIcon={<BackIcon />}
              sx={{
                borderColor: 'rgba(255,255,255,0.3)',
                color: '#ffffff',
                bgcolor: 'rgba(255,255,255,0.08)',
                fontWeight: 700,
                borderRadius: 2.5
              }}
            >
              Office Dashboard
            </Button>
          </Box>
        </Box>
      </Box>

      {/* ─── Metric KPI Cards ─── */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Card sx={{ borderRadius: 3, p: 2.5, bgcolor: '#ffffff', boxShadow: '0 2px 10px rgba(0,0,0,0.04)', borderLeft: '5px solid #4f46e5' }}>
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
              Total Certificates Issued
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 900, color: '#1e1b4b', my: 0.5 }}>
              {certificates.length}
            </Typography>
            <Typography variant="caption" sx={{ color: '#4f46e5', fontWeight: 600 }}>
              Authorized student bona fide documents
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card sx={{ borderRadius: 3, p: 2.5, bgcolor: '#ffffff', boxShadow: '0 2px 10px rgba(0,0,0,0.04)', borderLeft: '5px solid #059669' }}>
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
              Issued This Academic Year
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 900, color: '#059669', my: 0.5 }}>
              {certificates.filter(c => c.academicYear === '2025-2026').length}
            </Typography>
            <Typography variant="caption" sx={{ color: '#059669', fontWeight: 600 }}>
              Year 2025 - 2026 official records
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card sx={{ borderRadius: 3, p: 2.5, bgcolor: '#ffffff', boxShadow: '0 2px 10px rgba(0,0,0,0.04)', borderLeft: '5px solid #d97706' }}>
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
              Passport & Visa Inquiries
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 900, color: '#d97706', my: 0.5 }}>
              {certificates.filter(c => c.purpose.includes('Passport')).length}
            </Typography>
            <Typography variant="caption" sx={{ color: '#b45309', fontWeight: 600 }}>
              International travel & identification
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* ─── Search & Actions Filter Bar ─── */}
      <Card sx={{ borderRadius: 3, p: 2.5, mb: 3, boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4} md={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search by student name, admission no, certificate no..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
                endAdornment: searchQuery ? (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearchQuery('')}>
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ) : null
              }}
            />
          </Grid>

          <Grid item xs={6} sm={2.5} md={2.5}>
            <TextField
              select
              fullWidth
              size="small"
              label="Class Filter"
              value={classFilter}
              onChange={e => setClassFilter(e.target.value)}
            >
              <MenuItem value="ALL">All Classes</MenuItem>
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'].map(c => (
                <MenuItem key={c} value={c}>Grade {c}</MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={6} sm={2.5} md={2.5}>
            <TextField
              select
              fullWidth
              size="small"
              label="Purpose"
              value={purposeFilter}
              onChange={e => setPurposeFilter(e.target.value)}
            >
              <MenuItem value="ALL">All Purposes</MenuItem>
              <MenuItem value="Passport">Passport / Visa</MenuItem>
              <MenuItem value="Bank">Bank Account</MenuItem>
              <MenuItem value="Income Tax">Income Tax / Allowance</MenuItem>
              <MenuItem value="Scholarship">Scholarship</MenuItem>
              <MenuItem value="Transport">Bus / Train Concession</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} sm={3} md={3} sx={{ display: 'flex', gap: 1, justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
            <Button
              variant="outlined"
              color="success"
              startIcon={<ExcelIcon />}
              onClick={handleExportExcel}
              sx={{ borderRadius: 2, fontWeight: 700, textTransform: 'none' }}
            >
              Export Excel (.csv)
            </Button>
          </Grid>
        </Grid>
      </Card>

      {/* ─── Bonafide Certificate Registry Table ─── */}
      <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 600 }}>
          <Table stickyHeader size={isMobile ? 'small' : 'medium'}>
            <TableHead>
              <TableRow sx={{ '& th': { bgcolor: '#f1f5f9', fontWeight: 800, color: '#1e293b' } }}>
                <TableCell>Certificate No</TableCell>
                <TableCell>Student Details</TableCell>
                <TableCell>Class & Academic Year</TableCell>
                <TableCell>Parents (Father & Mother)</TableCell>
                <TableCell>Purpose of Certificate</TableCell>
                <TableCell>Date of Issue</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCertificates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                    <CertificateIcon sx={{ fontSize: 48, color: '#94a3b8', mb: 1 }} />
                    <Typography variant="body1" sx={{ fontWeight: 700, color: '#475569' }}>
                      No bonafide certificates found
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Click "+ Generate Certificate" to issue an official bonafide document.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredCertificates.map(cert => (
                  <TableRow key={cert.id} hover>
                    {/* Certificate No */}
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconButton
                          size="small"
                          onClick={() => {
                            setCertToView(cert);
                            setViewCertificateModalOpen(true);
                          }}
                          sx={{ bgcolor: '#e0e7ff', color: '#4338ca' }}
                          title="View Official Certificate"
                        >
                          <CertificateIcon fontSize="small" />
                        </IconButton>
                        <Box>
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 800,
                              fontFamily: 'monospace',
                              color: '#4338ca',
                              cursor: 'pointer'
                            }}
                            onClick={() => {
                              setCertToView(cert);
                              setViewCertificateModalOpen(true);
                            }}
                          >
                            {cert.certificateNumber}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Ref #{cert.admissionNumber}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>

                    {/* Student Name */}
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 800, color: '#0f172a' }}>
                        {cert.studentName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        DOB: {cert.dateOfBirth} • {cert.gender}
                      </Typography>
                    </TableCell>

                    {/* Class & Year */}
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        Grade {cert.classGrade} - {cert.section}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        AY {cert.academicYear}
                      </Typography>
                    </TableCell>

                    {/* Parents */}
                    <TableCell sx={{ maxWidth: 200 }}>
                      <Typography variant="caption" sx={{ display: 'block', fontWeight: 600 }}>
                        F: {cert.fatherName}
                      </Typography>
                      <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>
                        M: {cert.motherName}
                      </Typography>
                    </TableCell>

                    {/* Purpose */}
                    <TableCell sx={{ maxWidth: 220 }}>
                      <Chip
                        size="small"
                        label={cert.purpose}
                        sx={{
                          fontWeight: 700,
                          fontSize: '0.72rem',
                          bgcolor: '#f1f5f9',
                          color: '#334155'
                        }}
                      />
                      {cert.remarks && (
                        <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mt: 0.5, fontStyle: 'italic' }}>
                          Note: {cert.remarks}
                        </Typography>
                      )}
                    </TableCell>

                    {/* Issue Date */}
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {cert.issueDate}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Signed: Principal
                      </Typography>
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <Chip
                        size="small"
                        label="ISSUED & VERIFIED"
                        sx={{
                          bgcolor: '#dcfce7',
                          color: '#15803d',
                          fontWeight: 800,
                          fontSize: '0.68rem'
                        }}
                      />
                    </TableCell>

                    {/* Actions */}
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => {
                            setCertToView(cert);
                            setViewCertificateModalOpen(true);
                          }}
                          startIcon={<PrintIcon />}
                          sx={{
                            borderRadius: 2,
                            fontWeight: 800,
                            fontSize: '0.75rem',
                            bgcolor: '#4338ca',
                            py: 0.5
                          }}
                        >
                          Print
                        </Button>

                        <Tooltip title="Edit Details">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedCert(cert);
                              setEditModalOpen(true);
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Revoke Certificate">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteCertificate(cert.id)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* ══════════════════════════════════════════════════════════════════════════ */}
      {/* MODAL 1: GENERATE NEW BONAFIDE CERTIFICATE                               */}
      {/* ══════════════════════════════════════════════════════════════════════════ */}
      <Dialog
        open={generateModalOpen}
        onClose={() => setGenerateModalOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3.5, p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 900, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CertificateIcon sx={{ color: '#4f46e5' }} />
            <span>Generate Official Bonafide Certificate</span>
          </Box>
          <IconButton size="small" onClick={() => setGenerateModalOpen(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 2.5 }}>
          <Grid container spacing={2}>
            {/* Quick Select Student */}
            <Grid item xs={12}>
              <Paper sx={{ p: 2, bgcolor: '#f0f4ff', borderRadius: 2.5, border: '1px solid #c7d2fe' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#312e81', mb: 1 }}>
                  ⚡ Quick Select Student (Auto-populate records)
                </Typography>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Choose Registered Student"
                  value={form.studentSelection}
                  onChange={e => handleSelectStudentReference(e.target.value)}
                >
                  <MenuItem value="">-- Enter Details Manually or Select Student --</MenuItem>
                  {SAMPLE_STUDENTS.map(s => (
                    <MenuItem key={s.admissionNumber} value={s.admissionNumber}>
                      {s.name} ({s.admissionNumber}) — Grade {s.classGrade}-{s.section}
                    </MenuItem>
                  ))}
                </TextField>
              </Paper>
            </Grid>

            {/* Student Full Name */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Student Full Name"
                placeholder="e.g. Aarav Sharma"
                value={form.studentName}
                onChange={e => setForm({ ...form, studentName: e.target.value })}
              />
            </Grid>

            {/* Admission No */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Admission / Scholar Number"
                placeholder="e.g. ADM-2024-101"
                value={form.admissionNumber}
                onChange={e => setForm({ ...form, admissionNumber: e.target.value })}
              />
            </Grid>

            {/* Class Grade */}
            <Grid item xs={12} sm={4}>
              <TextField
                select
                fullWidth
                required
                label="Class / Grade"
                value={form.classGrade}
                onChange={e => setForm({ ...form, classGrade: e.target.value })}
              >
                {['KG-1', 'KG-2', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'].map(c => (
                  <MenuItem key={c} value={c}>Class {c}</MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Section / Stream */}
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Section / Stream"
                placeholder="e.g. A or Maths Computer"
                value={form.section}
                onChange={e => setForm({ ...form, section: e.target.value })}
              />
            </Grid>

            {/* Academic Year */}
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Academic Year"
                value={form.academicYear}
                onChange={e => setForm({ ...form, academicYear: e.target.value })}
              />
            </Grid>

            {/* Father's Name */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Father's / Guardian's Full Name"
                placeholder="e.g. Shri. Rajesh Sharma"
                value={form.fatherName}
                onChange={e => setForm({ ...form, fatherName: e.target.value })}
              />
            </Grid>

            {/* Mother's Name */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Mother's Full Name"
                placeholder="e.g. Smt. Sunita Sharma"
                value={form.motherName}
                onChange={e => setForm({ ...form, motherName: e.target.value })}
              />
            </Grid>

            {/* Date of Birth */}
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Date of Birth"
                placeholder="DD-MM-YYYY or YYYY-MM-DD"
                value={form.dateOfBirth}
                onChange={e => setForm({ ...form, dateOfBirth: e.target.value })}
              />
            </Grid>

            {/* Gender */}
            <Grid item xs={12} sm={4}>
              <TextField
                select
                fullWidth
                label="Gender"
                value={form.gender}
                onChange={e => setForm({ ...form, gender: e.target.value as any })}
              >
                <MenuItem value="MALE">Male (Master)</MenuItem>
                <MenuItem value="FEMALE">Female (Kumari)</MenuItem>
                <MenuItem value="OTHER">Other</MenuItem>
              </TextField>
            </Grid>

            {/* Conduct */}
            <Grid item xs={12} sm={4}>
              <TextField
                select
                fullWidth
                label="Moral Conduct"
                value={form.conduct}
                onChange={e => setForm({ ...form, conduct: e.target.value as any })}
              >
                <MenuItem value="EXEMPLARY">Exemplary</MenuItem>
                <MenuItem value="VERY_GOOD">Very Good</MenuItem>
                <MenuItem value="GOOD">Good</MenuItem>
                <MenuItem value="SATISFACTORY">Satisfactory</MenuItem>
              </TextField>
            </Grid>

            {/* Purpose */}
            <Grid item xs={12} sm={8}>
              <TextField
                select
                fullWidth
                required
                label="Purpose of Certificate"
                value={form.purpose}
                onChange={e => setForm({ ...form, purpose: e.target.value })}
              >
                {CERTIFICATE_PURPOSES.map(p => (
                  <MenuItem key={p} value={p}>{p}</MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Issue Date */}
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Date of Issue"
                value={form.issueDate}
                onChange={e => setForm({ ...form, issueDate: e.target.value })}
              />
            </Grid>

            {/* Custom Purpose if needed */}
            {form.purpose === 'Other / Custom Specific Purpose' && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  label="Specify Custom Purpose"
                  placeholder="Detail the exact purpose for certificate issuance..."
                  value={form.customPurpose}
                  onChange={e => setForm({ ...form, customPurpose: e.target.value })}
                />
              </Grid>
            )}

            {/* Signatory Authority */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Authorized Signatory Authority"
                value={form.signatory}
                onChange={e => setForm({ ...form, signatory: e.target.value })}
              />
            </Grid>

            {/* Remarks */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Office Remarks / Reference Notes"
                placeholder="e.g. Parent application dated 19-Oct received"
                value={form.remarks}
                onChange={e => setForm({ ...form, remarks: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setGenerateModalOpen(false)} sx={{ fontWeight: 700 }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleGenerateCertificate}
            startIcon={<CertificateIcon />}
            sx={{
              borderRadius: 2.5,
              fontWeight: 800,
              bgcolor: '#4338ca',
              px: 3,
              boxShadow: '0 4px 15px rgba(67, 56, 202, 0.3)'
            }}
          >
            Issue Certificate & Preview
          </Button>
        </DialogActions>
      </Dialog>

      {/* ══════════════════════════════════════════════════════════════════════════ */}
      {/* MODAL 2: OFFICIAL BONAFIDE CERTIFICATE DOCUMENT PREVIEW & PRINT          */}
      {/* ══════════════════════════════════════════════════════════════════════════ */}
      <Dialog
        open={viewCertificateModalOpen}
        onClose={() => setViewCertificateModalOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            p: 0,
            overflow: 'hidden',
            bgcolor: '#ffffff'
          }
        }}
      >
        {certToView && (
          <Box>
            {/* Top Bar for Screen */}
            <Box sx={{ p: 2, bgcolor: '#1e1b4b', color: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CertificateIcon sx={{ color: '#a5b4fc' }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  Official Bonafide Document Preview
                </Typography>
                <Chip size="small" label={certToView.certificateNumber} sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: '#fff', fontWeight: 800 }} />
              </Box>
              <IconButton size="small" onClick={() => setViewCertificateModalOpen(false)} sx={{ color: '#fff' }}>
                <CloseIcon />
              </IconButton>
            </Box>

            {/* Printable A4 Certificate Container */}
            <Box
              id="printable-bonafide-document"
              sx={{
                p: { xs: 3, sm: 5, md: 6 },
                bgcolor: '#ffffff',
                color: '#0f172a',
                fontFamily: 'serif',
                position: 'relative',
                m: { xs: 1, sm: 2 },
                border: '8px double #1e1b4b',
                boxShadow: 'inset 0 0 0 2px #d4af37' // Golden inner lining
              }}
            >
              {/* Background Watermark */}
              <Box
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  opacity: 0.04,
                  pointerEvents: 'none',
                  textAlign: 'center'
                }}
              >
                <SchoolIcon sx={{ fontSize: 320, color: '#1e1b4b' }} />
              </Box>

              {/* Institution Header */}
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Typography
                  variant="h4"
                  sx={{
                    fontFamily: 'Georgia, serif',
                    fontWeight: 900,
                    letterSpacing: '0.04em',
                    color: '#1e1b4b',
                    fontSize: { xs: '1.4rem', sm: '1.8rem', md: '2.1rem' }
                  }}
                >
                  ST. XAVIER'S SENIOR SECONDARY SCHOOL
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: 'sans-serif', fontWeight: 600, color: '#475569', mt: 0.5 }}>
                  (Affiliated to CBSE, New Delhi — Affiliation No: 1930482 | School Code: 55219)
                </Typography>
                <Typography variant="caption" sx={{ fontFamily: 'sans-serif', color: '#64748b', display: 'block', mt: 0.2 }}>
                  Campus Road, Sector 14, Institutional Area • Phone: +91 (022) 2894-0011 • Email: office@stxaviers-school.edu.in
                </Typography>

                <Divider sx={{ my: 2, borderColor: '#d4af37', borderWidth: '1px' }} />
              </Box>

              {/* Ref Number & Date */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, fontFamily: 'sans-serif' }}>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#334155' }}>
                  Ref No: <span style={{ fontFamily: 'monospace', fontWeight: 800, color: '#1e1b4b' }}>{certToView.certificateNumber}</span>
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#334155' }}>
                  Date of Issue: <strong>{certToView.issueDate}</strong>
                </Typography>
              </Box>

              {/* Certificate Title Banner */}
              <Box sx={{ textAlign: 'center', my: 3 }}>
                <Typography
                  variant="h5"
                  sx={{
                    fontFamily: 'Georgia, serif',
                    fontWeight: 900,
                    letterSpacing: '0.12em',
                    color: '#1e1b4b',
                    display: 'inline-block',
                    borderBottom: '2px solid #1e1b4b',
                    pb: 0.5,
                    px: 3,
                    textTransform: 'uppercase'
                  }}
                >
                  BONAFIDE CERTIFICATE
                </Typography>
              </Box>

              {/* Formal Wording */}
              <Box sx={{ my: 4, lineHeight: 2.2, fontSize: { xs: '1rem', sm: '1.15rem' }, color: '#1e293b' }}>
                <Typography component="p" sx={{ fontSize: 'inherit', lineHeight: 'inherit', textAlign: 'justify' }}>
                  This is to certify that {certToView.gender === 'FEMALE' ? 'Kumari' : 'Master'}{' '}
                  <strong style={{ color: '#1e1b4b', textDecoration: 'underline' }}>{certToView.studentName}</strong>,{' '}
                  {certToView.gender === 'FEMALE' ? 'Daughter' : 'Son'} of{' '}
                  <strong>{certToView.fatherName}</strong> and{' '}
                  <strong>{certToView.motherName}</strong>, bearing Admission Number{' '}
                  <strong style={{ fontFamily: 'monospace' }}>{certToView.admissionNumber}</strong>
                  {certToView.rollNumber ? ` (Roll No: ${certToView.rollNumber})` : ''}, is a bonafide student of this institution, 
                  currently studying in <strong>Class {certToView.classGrade} - Section {certToView.section}</strong> during the 
                  Academic Year <strong>{certToView.academicYear}</strong>.
                </Typography>

                <Typography component="p" sx={{ fontSize: 'inherit', lineHeight: 'inherit', mt: 2, textAlign: 'justify' }}>
                  As per official institutional records, his/her Date of Birth is recorded as{' '}
                  <strong>{certToView.dateOfBirth}</strong>.
                </Typography>

                <Typography component="p" sx={{ fontSize: 'inherit', lineHeight: 'inherit', mt: 2, textAlign: 'justify' }}>
                  During his/her tenure in the school, his/her moral character and general conduct have been observed to be{' '}
                  <strong>{certToView.conduct.replace('_', ' ')}</strong>.
                </Typography>

                <Typography component="p" sx={{ fontSize: 'inherit', lineHeight: 'inherit', mt: 2, textAlign: 'justify' }}>
                  This bonafide certificate is issued upon the formal request of the parent/guardian for the specific purpose of{' '}
                  <strong style={{ color: '#1e1b4b' }}>{certToView.purpose}</strong>.
                </Typography>
              </Box>

              {/* Institutional Signatures & Official Stamp */}
              <Box sx={{ mt: 7, pt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', fontFamily: 'sans-serif' }}>
                {/* Prepared By */}
                <Box sx={{ textAlign: 'center', width: 160 }}>
                  <Typography variant="body2" sx={{ fontWeight: 800, borderTop: '1px solid #64748b', pt: 1 }}>
                    Office In-Charge
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Prepared & Verified
                  </Typography>
                </Box>

                {/* Institutional Stamp Placeholder */}
                <Box
                  sx={{
                    width: 110,
                    height: 110,
                    borderRadius: '50%',
                    border: '2px dashed #94a3b8',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#94a3b8',
                    textAlign: 'center',
                    p: 1
                  }}
                >
                  <VerifiedIcon sx={{ fontSize: 24, mb: 0.5, opacity: 0.6 }} />
                  <Typography variant="caption" sx={{ fontWeight: 800, fontSize: '0.62rem', textTransform: 'uppercase' }}>
                    Institutional Seal / Stamp
                  </Typography>
                </Box>

                {/* Principal Signatory */}
                <Box sx={{ textAlign: 'center', width: 200 }}>
                  <Typography variant="body2" sx={{ fontWeight: 900, color: '#1e1b4b', borderTop: '1px solid #1e1b4b', pt: 1 }}>
                    {certToView.signatory}
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569' }}>
                    Head of Institution
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Modal Bottom Actions */}
            <Box sx={{ p: 2.5, bgcolor: '#f1f5f9', display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
              <Button onClick={() => setViewCertificateModalOpen(false)} sx={{ fontWeight: 700 }}>
                Close
              </Button>
              <Button
                variant="contained"
                onClick={() => window.print()}
                startIcon={<PrintIcon />}
                sx={{
                  bgcolor: '#1e1b4b',
                  color: '#ffffff',
                  fontWeight: 800,
                  borderRadius: 2.5,
                  px: 3,
                  '&:hover': { bgcolor: '#312e81' }
                }}
              >
                Print Certificate (A4)
              </Button>
            </Box>
          </Box>
        )}
      </Dialog>

      {/* ══════════════════════════════════════════════════════════════════════════ */}
      {/* MODAL 3: EDIT CERTIFICATE DETAILS                                        */}
      {/* ══════════════════════════════════════════════════════════════════════════ */}
      <Dialog
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3.5, p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 900 }}>Edit Bonafide Certificate Details</DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 2 }}>
          {selectedCert && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Student Name"
                  value={selectedCert.studentName}
                  onChange={e => setSelectedCert({ ...selectedCert, studentName: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Admission No"
                  value={selectedCert.admissionNumber}
                  onChange={e => setSelectedCert({ ...selectedCert, admissionNumber: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Father Name"
                  value={selectedCert.fatherName}
                  onChange={e => setSelectedCert({ ...selectedCert, fatherName: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Mother Name"
                  value={selectedCert.motherName}
                  onChange={e => setSelectedCert({ ...selectedCert, motherName: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Purpose of Certificate"
                  value={selectedCert.purpose}
                  onChange={e => setSelectedCert({ ...selectedCert, purpose: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Remarks"
                  value={selectedCert.remarks || ''}
                  onChange={e => setSelectedCert({ ...selectedCert, remarks: e.target.value })}
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setEditModalOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleUpdateCertificate} sx={{ borderRadius: 2, fontWeight: 800 }}>
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* ─── Toast Feedback Snackbar ─── */}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast({ ...toast, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          severity={toast.severity}
          variant="filled"
          onClose={() => setToast({ ...toast, open: false })}
          sx={{ borderRadius: 2.5, fontWeight: 700 }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default BonafideCertificateDesk;
