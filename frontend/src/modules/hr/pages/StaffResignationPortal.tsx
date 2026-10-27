import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  TextField,
  MenuItem,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Alert,
  IconButton,
  Tooltip,
  Paper,
  Divider,
  FormControlLabel,
  Checkbox,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import PersonIcon from '@mui/icons-material/Person';
import BusinessIcon from '@mui/icons-material/Business';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import DescriptionIcon from '@mui/icons-material/Description';
import PrintIcon from '@mui/icons-material/Print';
import DownloadIcon from '@mui/icons-material/Download';
import SendIcon from '@mui/icons-material/Send';
import InfoIcon from '@mui/icons-material/Info';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import ScienceIcon from '@mui/icons-material/Science';
import SchoolIcon from '@mui/icons-material/School';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useAuth } from '../../auth/hooks/useAuth';
import { 
  getResignations, 
  submitResignation, 
  updateResignationStatus, 
  getExitClearances, 
  updateExitClearance 
} from '../api/hr.api';

// Pre-seeded sample staff roles for interactive testing
interface StaffPersona {
  id: string;
  name: string;
  employeeIdNumber: string;
  role: string;
  department: string;
  designation: string;
  doj: string;
  noticePeriodDays: number;
}

const SAMPLE_STAFF_PERSONAS: StaffPersona[] = [
  {
    id: 'EMP-1002',
    name: 'Priya Raghavan',
    employeeIdNumber: 'EMP-1002',
    role: 'LAB_INCHARGE',
    department: 'Computer Science & AI Labs',
    designation: 'Lab Incharge & AI Lecturer',
    doj: '2021-06-15',
    noticePeriodDays: 30
  },
  {
    id: 'EMP-1005',
    name: 'Anita Sharma',
    employeeIdNumber: 'EMP-1005',
    role: 'TEACHER',
    department: 'Mathematics & STEM',
    designation: 'Senior Faculty & HOD',
    doj: '2019-07-01',
    noticePeriodDays: 60
  },
  {
    id: 'EMP-1009',
    name: 'Karthik Subramanian',
    employeeIdNumber: 'EMP-1009',
    role: 'CLASS_COORDINATOR',
    department: 'Secondary School Academic Wing',
    designation: 'Grade 10 Academic Coordinator',
    doj: '2020-04-10',
    noticePeriodDays: 60
  },
  {
    id: 'EMP-1014',
    name: 'Suresh Kumar',
    employeeIdNumber: 'EMP-1014',
    role: 'LAB_TECHNICIAN',
    department: 'Physics & Chemistry Labs',
    designation: 'Senior Science Lab Technician',
    doj: '2022-01-18',
    noticePeriodDays: 30
  },
  {
    id: 'EMP-1007',
    name: 'Lakshmi Narayanan',
    employeeIdNumber: 'EMP-1007',
    role: 'OFFICE_STAFF',
    department: 'General Administration',
    designation: 'Office Registrar & Front Desk',
    doj: '2018-09-01',
    noticePeriodDays: 30
  },
  {
    id: 'EMP-1022',
    name: 'Murugan Selvam',
    employeeIdNumber: 'EMP-1022',
    role: 'DRIVER',
    department: 'Transport Department',
    designation: 'Senior Bus Pilot (Route 4)',
    doj: '2021-11-05',
    noticePeriodDays: 30
  },
  {
    id: 'EMP-1001',
    name: 'Dr. Ramesh Sundaram',
    employeeIdNumber: 'EMP-1001',
    role: 'PRINCIPAL',
    department: 'Executive Leadership',
    designation: 'School Principal & Academic Director',
    doj: '2015-05-01',
    noticePeriodDays: 90
  }
];

const REASON_CATEGORIES = [
  { value: 'CAREER_GROWTH', label: 'Career Growth / Higher Opportunity' },
  { value: 'RELOCATION', label: 'Relocation / Family Relocation' },
  { value: 'HIGHER_STUDIES', label: 'Higher Studies & Research Fellowships' },
  { value: 'PERSONAL_HEALTH', label: 'Personal Health & Medical Grounds' },
  { value: 'WORK_LIFE_BALANCE', label: 'Work-Life Balance & Personal Grounds' },
  { value: 'COMPENSATION', label: 'Compensation / Financial Considerations' },
  { value: 'RETIREMENT', label: 'Superannuation / Voluntary Retirement' },
  { value: 'OTHER', label: 'Other Special Circumstances' }
];

export const StaffResignationPortal: React.FC = () => {
  const { user } = useAuth();

  // Selected persona for testing / self-service simulation
  const [selectedPersona, setSelectedPersona] = useState<StaffPersona>(SAMPLE_STAFF_PERSONAS[0]);
  
  // Resignation Record State
  const [activeResignation, setActiveResignation] = useState<any>(null);
  const [clearances, setClearances] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');

  // Apply Form State
  const [isApplyOpen, setIsApplyOpen] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    reasonCategory: 'CAREER_GROWTH',
    reason: '',
    noticePeriodRequiredDays: 30,
    proposedLastWorkingDate: '',
    handoverNotes: '',
    successorNominee: '',
    assetDeclarationConfirmed: false,
    declaredAssets: ['Staff ID Card', 'Class Attendance Register', 'Curriculum Master Key'],
    letterContent: '',
    digitalSignature: ''
  });

  // Approver Action Dialog State (Principal, HR, Admin)
  const [approvalDialog, setApprovalDialog] = useState<{
    open: boolean;
    tier: 'PRINCIPAL' | 'HR' | 'ADMIN';
    decision: 'APPROVE' | 'REJECT';
    comments: string;
    approvedLWD: string;
  }>({
    open: false,
    tier: 'PRINCIPAL',
    decision: 'APPROVE',
    comments: '',
    approvedLWD: ''
  });

  // Relieving Letter Certificate Dialog
  const [certificateOpen, setCertificateOpen] = useState<boolean>(false);

  // Sync notice period when persona changes
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      noticePeriodRequiredDays: selectedPersona.noticePeriodDays,
      proposedLastWorkingDate: calculateDefaultLWD(selectedPersona.noticePeriodDays)
    }));
    loadEmployeeResignation(selectedPersona.id);
  }, [selectedPersona]);

  const calculateDefaultLWD = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  };

  const loadEmployeeResignation = async (empId: string) => {
    setLoading(true);
    setErrorMsg('');
    try {
      // 1. Try local storage cache for simulated / offline resilience
      const localStoreKey = `erp_resignation_${empId}`;
      const savedLocal = localStorage.getItem(localStoreKey);
      
      let resData: any = null;
      try {
        const resList = await getResignations(empId);
        if (Array.isArray(resList) && resList.length > 0) {
          resData = resList.find((r: any) => 
            r.employeeId?._id === empId || 
            r.employeeId === empId || 
            r.employeeId?.employeeIdNumber === empId
          ) || resList[0];
        }
      } catch (err) {
        console.warn('Backend fetch failed, falling back to local simulation store');
      }

      if (!resData && savedLocal) {
        resData = JSON.parse(savedLocal);
      }

      // Default mock if none exists for first persona
      if (!resData && empId === 'EMP-1002') {
        resData = {
          _id: 'RES-EMP-1002-01',
          employeeId: selectedPersona,
          resignationDate: '2026-10-01',
          noticePeriodRequiredDays: 30,
          proposedLastWorkingDate: '2026-10-31',
          approvedLastWorkingDate: '2026-10-31',
          reasonCategory: 'CAREER_GROWTH',
          reason: 'Accepted Assistant Professorship position in Artificial Intelligence with university research tenure.',
          handoverNotes: 'Syllabus, CS practical schedule, and AI lab equipment custody transferred to Mr. Arvind.',
          successorNominee: 'Mr. Arvind Sharma (Lecturer)',
          status: 'PENDING_PRINCIPAL',
          principalApproval: { status: 'PENDING', comments: '' },
          hrApproval: { status: 'PENDING', comments: '' },
          adminApproval: { status: 'PENDING', comments: '' }
        };
        localStorage.setItem(localStoreKey, JSON.stringify(resData));
      }

      setActiveResignation(resData);

      if (resData) {
        loadClearances(resData._id);
      } else {
        setClearances([]);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Failed to load resignation records');
    } finally {
      setLoading(false);
    }
  };

  const loadClearances = async (resignationId: string) => {
    try {
      const localClearancesKey = `erp_clearances_${resignationId}`;
      const saved = localStorage.getItem(localClearancesKey);
      if (saved) {
        setClearances(JSON.parse(saved));
        return;
      }

      let data: any[] = [];
      try {
        data = await getExitClearances(resignationId);
      } catch (e) {
        // Fallback default departments
      }

      if (!data || data.length === 0) {
        data = [
          { _id: 'clr-1', department: 'HR', label: 'HR & Personnel Records', cleared: false, remarks: 'Service book & leave ledger verification', pendingDeductions: 0 },
          { _id: 'clr-2', department: 'FINANCE', label: 'Finance & Accounts', cleared: false, remarks: 'Salary advance check, mess/travel settlement', pendingDeductions: 0 },
          { _id: 'clr-3', department: 'IT', label: 'IT & Lab Equipment', cleared: false, remarks: 'School laptop, lab access badge & software credentials', pendingDeductions: 0 },
          { _id: 'clr-4', department: 'LIBRARY', label: 'Institutional Library', cleared: false, remarks: 'Catalog books & teacher reference encyclopedias', pendingDeductions: 0 },
          { _id: 'clr-5', department: 'ADMIN', label: 'Admin & Infrastructure', cleared: false, remarks: 'Desk keys, identity badge & parking permit', pendingDeductions: 0 }
        ];
      }

      setClearances(data);
      localStorage.setItem(localClearancesKey, JSON.stringify(data));
    } catch (err) {
      console.error('Failed to load clearances', err);
    }
  };

  const handleOpenApply = () => {
    const today = new Date().toISOString().split('T')[0];
    const proposedLWD = calculateDefaultLWD(selectedPersona.noticePeriodDays);
    const formalLetter = `Date: ${today}

To,
The Principal / Governing Management,
FIC Global Academy & Senior Secondary School

Subject: Formal Resignation from the position of ${selectedPersona.designation}

Respected Sir / Madam,

Please accept this letter as formal notification that I am resigning from my position as ${selectedPersona.designation} in the Department of ${selectedPersona.department}.

In accordance with my employment contract, my notice period is ${selectedPersona.noticePeriodDays} days. I propose my last working day to be ${proposedLWD}.

I would like to take this opportunity to thank the management, principal, faculty, and administrative staff for the invaluable guidance, support, and professional camaraderie extended to me during my tenure since ${selectedPersona.doj}.

I assure you of my complete cooperation in handing over all pedagogical materials, classroom gradebooks, lab equipment custody, and institutional assets to my nominated successor prior to my departure.

Yours sincerely,
${selectedPersona.name}
Employee ID: ${selectedPersona.employeeIdNumber}
${selectedPersona.department}`;

    setFormData({
      reasonCategory: 'CAREER_GROWTH',
      reason: 'Accepted a senior role for professional career advancement.',
      noticePeriodRequiredDays: selectedPersona.noticePeriodDays,
      proposedLastWorkingDate: proposedLWD,
      handoverNotes: 'Will compile lesson plans, question banks, and return keys to HOD.',
      successorNominee: 'Nominated Department Colleague',
      assetDeclarationConfirmed: true,
      declaredAssets: ['Staff ID Card', 'Class Register', 'Room/Lab Keys', 'Institutional Library Books'],
      letterContent: formalLetter,
      digitalSignature: selectedPersona.name
    });
    setIsApplyOpen(true);
  };

  const handleSubmitResignation = async () => {
    if (!formData.reason.trim()) {
      setErrorMsg('Please specify the reason for resignation');
      return;
    }
    if (!formData.digitalSignature.trim()) {
      setErrorMsg('Please provide your digital signature to confirm');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      const payload = {
        employeeId: selectedPersona.id,
        resignationDate: new Date().toISOString().split('T')[0],
        noticePeriodRequiredDays: formData.noticePeriodRequiredDays,
        proposedLastWorkingDate: formData.proposedLastWorkingDate,
        reasonCategory: formData.reasonCategory,
        reason: formData.reason,
        handoverNotes: `${formData.handoverNotes} | Successor: ${formData.successorNominee} | Assets Declared: ${formData.declaredAssets.join(', ')}`,
        status: 'PENDING_PRINCIPAL'
      };

      let createdRes: any = null;
      try {
        createdRes = await submitResignation(payload);
      } catch (err) {
        console.warn('Backend call failed, creating in local state');
      }

      if (!createdRes) {
        createdRes = {
          _id: `RES-${selectedPersona.id}-${Date.now().toString().slice(-4)}`,
          ...payload,
          employeeId: selectedPersona,
          principalApproval: { status: 'PENDING', comments: '' },
          hrApproval: { status: 'PENDING', comments: '' },
          adminApproval: { status: 'PENDING', comments: '' }
        };
      }

      // Persist locally
      const localStoreKey = `erp_resignation_${selectedPersona.id}`;
      localStorage.setItem(localStoreKey, JSON.stringify(createdRes));

      // Reset clearances
      const defaultClearances = [
        { _id: 'clr-1', department: 'HR', label: 'HR & Personnel Records', cleared: false, remarks: 'Service book & leave ledger', pendingDeductions: 0 },
        { _id: 'clr-2', department: 'FINANCE', label: 'Finance & Accounts', cleared: false, remarks: 'Salary advance check & final tally', pendingDeductions: 0 },
        { _id: 'clr-3', department: 'IT', label: 'IT & Lab Equipment', cleared: false, remarks: 'Laptop, lab keys & software credentials', pendingDeductions: 0 },
        { _id: 'clr-4', department: 'LIBRARY', label: 'Institutional Library', cleared: false, remarks: 'Reference books & borrowing log', pendingDeductions: 0 },
        { _id: 'clr-5', department: 'ADMIN', label: 'Admin & Infrastructure', cleared: false, remarks: 'Identity badge & parking pass', pendingDeductions: 0 }
      ];
      localStorage.setItem(`erp_clearances_${createdRes._id}`, JSON.stringify(defaultClearances));

      setActiveResignation(createdRes);
      setClearances(defaultClearances);
      setIsApplyOpen(false);
      setSuccessMsg('Resignation submitted successfully! Initial review forwarded to Reporting Manager / Principal.');
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Failed to submit resignation. Please check inputs.');
    } finally {
      setLoading(false);
    }
  };

  // 3-Tier Workflow Approval Simulator
  const handleOpenApprovalDialog = (tier: 'PRINCIPAL' | 'HR' | 'ADMIN', decision: 'APPROVE' | 'REJECT') => {
    setApprovalDialog({
      open: true,
      tier,
      decision,
      comments: tier === 'PRINCIPAL' 
        ? 'Handover schedule verified with department head. Approved to proceed to HR clearance.'
        : tier === 'HR'
        ? 'All 5 departmental exit clearances verified with zero financial dues. Recommended for final acceptance.'
        : 'Final resignation accepted by School Board. Relieving certificate generated and exit finalized.',
      approvedLWD: activeResignation?.proposedLastWorkingDate || calculateDefaultLWD(30)
    });
  };

  const handleExecuteApproval = async () => {
    if (!activeResignation) return;
    setLoading(true);

    try {
      let nextStatus = '';
      const updated = { ...activeResignation };

      if (approvalDialog.tier === 'PRINCIPAL') {
        if (approvalDialog.decision === 'APPROVE') {
          nextStatus = 'PRINCIPAL_APPROVED';
          updated.status = 'PRINCIPAL_APPROVED';
          updated.approvedLastWorkingDate = approvalDialog.approvedLWD;
          updated.principalApproval = {
            status: 'APPROVED',
            approvedAt: new Date().toISOString(),
            approvedLWD: approvalDialog.approvedLWD,
            comments: approvalDialog.comments,
            approvedBy: 'Dr. Ramesh Sundaram (Principal)'
          };
        } else {
          nextStatus = 'REJECTED';
          updated.status = 'REJECTED';
          updated.principalApproval = {
            status: 'REJECTED',
            comments: approvalDialog.comments
          };
        }
      } else if (approvalDialog.tier === 'HR') {
        if (approvalDialog.decision === 'APPROVE') {
          nextStatus = 'HR_APPROVED';
          updated.status = 'HR_APPROVED';
          updated.hrApproval = {
            status: 'APPROVED',
            approvedAt: new Date().toISOString(),
            comments: approvalDialog.comments,
            approvedBy: 'HR Offboarding Director'
          };
          // Mark all clearances cleared
          const updatedClrs = clearances.map(c => ({ ...c, cleared: true }));
          setClearances(updatedClrs);
          localStorage.setItem(`erp_clearances_${activeResignation._id}`, JSON.stringify(updatedClrs));
        } else {
          nextStatus = 'REJECTED';
          updated.status = 'REJECTED';
          updated.hrApproval = {
            status: 'REJECTED',
            comments: approvalDialog.comments
          };
        }
      } else if (approvalDialog.tier === 'ADMIN') {
        if (approvalDialog.decision === 'APPROVE') {
          nextStatus = 'ACCEPTED';
          updated.status = 'ACCEPTED';
          updated.adminApproval = {
            status: 'APPROVED',
            approvedAt: new Date().toISOString(),
            comments: approvalDialog.comments,
            approvedBy: 'School Management Board'
          };
        } else {
          nextStatus = 'REJECTED';
          updated.status = 'REJECTED';
          updated.adminApproval = {
            status: 'REJECTED',
            comments: approvalDialog.comments
          };
        }
      }

      // Call API if possible
      try {
        await updateResignationStatus(
          activeResignation._id,
          nextStatus,
          approvalDialog.approvedLWD,
          approvalDialog.comments
        );
      } catch (e) {
        console.warn('Backend update failed, applying local state update');
      }

      // Save locally
      localStorage.setItem(`erp_resignation_${selectedPersona.id}`, JSON.stringify(updated));
      setActiveResignation(updated);
      setApprovalDialog(prev => ({ ...prev, open: false }));
      setSuccessMsg(`Resignation successfully updated at ${approvalDialog.tier} level to ${nextStatus}!`);
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Failed to process approval step');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleClearance = (clrId: string) => {
    const updated = clearances.map(c => {
      if (c._id === clrId) {
        return { ...c, cleared: !c.cleared, clearedDate: !c.cleared ? new Date().toISOString().split('T')[0] : null };
      }
      return c;
    });
    setClearances(updated);
    if (activeResignation) {
      localStorage.setItem(`erp_clearances_${activeResignation._id}`, JSON.stringify(updated));
    }
  };

  // Stepper Active Step Calculation
  const getWorkflowStep = () => {
    if (!activeResignation) return 0;
    const st = activeResignation.status;
    if (st === 'SUBMITTED' || st === 'PENDING_PRINCIPAL') return 1;
    if (st === 'PRINCIPAL_APPROVED' || st === 'PENDING_HR') return 2;
    if (st === 'HR_APPROVED' || st === 'PENDING_ADMIN') return 3;
    if (st === 'ACCEPTED' || st === 'FINAL_APPROVED') return 4;
    return 1;
  };

  const currentStep = getWorkflowStep();

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1400, margin: '0 auto' }}>
      {/* Header Banner */}
      <Box sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <AssignmentTurnedInIcon sx={{ fontSize: 36, color: 'primary.main' }} />
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary' }}>
                Staff Resignation & Exit Desk
              </Typography>
              <Typography variant="body2" color="text.secondary">
                End-to-End Resignation Lifecycle • Manager / Principal Approval • HR Clearances • Admin Sign-Off
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Persona Switcher for pair testing all roles */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, background: '#f8fafc', p: 1.5, borderRadius: 2, border: '1px solid #e2e8f0' }}>
          <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>
            Acting As:
          </Typography>
          <TextField
            select
            size="small"
            value={selectedPersona.id}
            onChange={(e) => {
              const p = SAMPLE_STAFF_PERSONAS.find(x => x.id === e.target.value);
              if (p) setSelectedPersona(p);
            }}
            sx={{ minWidth: 260, bgcolor: 'background.paper' }}
          >
            {SAMPLE_STAFF_PERSONAS.map(p => (
              <MenuItem key={p.id} value={p.id}>
                {p.name} ({p.designation.split('&')[0].trim()})
              </MenuItem>
            ))}
          </TextField>
        </Box>
      </Box>

      {/* Notifications */}
      {errorMsg && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setErrorMsg('')}>{errorMsg}</Alert>}
      {successMsg && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMsg('')}>{successMsg}</Alert>}
      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {/* Staff Info Strip */}
      <Paper elevation={0} sx={{ p: 2, mb: 3, bgcolor: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={3}>
            <Typography variant="caption" color="text.secondary">EMPLOYEE NAME & ID</Typography>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              {selectedPersona.name} ({selectedPersona.employeeIdNumber})
            </Typography>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Typography variant="caption" color="text.secondary">DEPARTMENT & ROLE</Typography>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              {selectedPersona.department}
            </Typography>
            <Chip size="small" label={selectedPersona.designation} sx={{ mt: 0.5, fontWeight: 600, bgcolor: '#e0e7ff', color: '#3730a3' }} />
          </Grid>
          <Grid item xs={12} sm={3}>
            <Typography variant="caption" color="text.secondary">DATE OF JOINING & TENURE</Typography>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              {selectedPersona.doj} ({(new Date().getFullYear() - new Date(selectedPersona.doj).getFullYear())} Yrs Active)
            </Typography>
          </Grid>
          <Grid item xs={12} sm={3} sx={{ textAlign: { sm: 'right' } }}>
            <Typography variant="caption" color="text.secondary">CONTRACTUAL NOTICE PERIOD</Typography>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'primary.main' }}>
              {selectedPersona.noticePeriodDays} Days Required
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Main Content: If active resignation exists vs None */}
      {!activeResignation ? (
        <Card sx={{ p: 4, textAlign: 'center', border: '2px dashed #cbd5e1', borderRadius: 3 }}>
          <Box sx={{ maxWidth: 600, mx: 'auto' }}>
            <DescriptionIcon sx={{ fontSize: 60, color: '#94a3b8', mb: 2 }} />
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
              No Active Resignation on Record
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              You are currently an active employee in good standing. If you intend to resign or initiate career relocation, please submit your formal application below adhering to the contractual notice period.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              size="large"
              startIcon={<SendIcon />}
              onClick={handleOpenApply}
              sx={{ px: 4, py: 1.2, fontWeight: 700, borderRadius: 2 }}
            >
              Submit Resignation Application
            </Button>
          </Box>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {/* Left Column: 4-Step Approval Tracker & Details */}
          <Grid item xs={12} lg={8}>
            {/* Workflow Progress Banner */}
            <Card sx={{ mb: 3, border: '1px solid #e2e8f0', borderRadius: 2 }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      Exit Workflow Hierarchy
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Multi-tier approval pipeline (Employee → Principal/Manager → HR Clearances → Admin Relieving)
                    </Typography>
                  </Box>
                  <Chip 
                    label={activeResignation.status} 
                    color={
                      activeResignation.status === 'ACCEPTED' ? 'success' :
                      activeResignation.status === 'REJECTED' ? 'error' : 'warning'
                    }
                    sx={{ fontWeight: 700, px: 1 }}
                  />
                </Box>

                <Stepper activeStep={currentStep} orientation="vertical" sx={{ mt: 2 }}>
                  {/* Step 1: Employee Submission */}
                  <Step active={currentStep >= 1} completed={currentStep > 1}>
                    <StepLabel StepIconComponent={() => (
                      <Box sx={{ width: 32, height: 32, borderRadius: '50%', bgcolor: currentStep >= 1 ? '#10b981' : '#cbd5e1', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                        1
                      </Box>
                    )}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                          Step 1: Resignation Submitted by Employee
                        </Typography>
                        <Chip size="small" label="COMPLETED" color="success" sx={{ fontSize: '0.65rem' }} />
                      </Box>
                    </StepLabel>
                    <StepContent>
                      <Paper elevation={0} sx={{ p: 2, bgcolor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 1.5, my: 1 }}>
                        <Grid container spacing={1}>
                          <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary">Submission Date</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{activeResignation.resignationDate}</Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary">Reason Category</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{activeResignation.reasonCategory}</Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary">Notice Period</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{activeResignation.noticePeriodRequiredDays} Days</Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary">Proposed Last Working Day</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>
                              {activeResignation.proposedLastWorkingDate}
                            </Typography>
                          </Grid>
                          <Grid item xs={12}>
                            <Typography variant="caption" color="text.secondary">Handover / Transition Plan</Typography>
                            <Typography variant="body2" sx={{ fontStyle: 'italic' }}>"{activeResignation.handoverNotes}"</Typography>
                          </Grid>
                        </Grid>
                      </Paper>
                    </StepContent>
                  </Step>

                  {/* Step 2: Reporting Manager / Principal Review */}
                  <Step active={currentStep >= 2} completed={currentStep > 2}>
                    <StepLabel StepIconComponent={() => (
                      <Box sx={{ width: 32, height: 32, borderRadius: '50%', bgcolor: currentStep >= 2 ? (activeResignation.status === 'REJECTED' ? '#ef4444' : '#10b981') : '#cbd5e1', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                        2
                      </Box>
                    )}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                          Step 2: Reporting Manager / Principal Review
                        </Typography>
                        {activeResignation.principalApproval?.status === 'APPROVED' ? (
                          <Chip size="small" label="PRINCIPAL APPROVED" color="success" sx={{ fontSize: '0.65rem' }} />
                        ) : activeResignation.status === 'REJECTED' ? (
                          <Chip size="small" label="REJECTED" color="error" sx={{ fontSize: '0.65rem' }} />
                        ) : (
                          <Chip size="small" label="AWAITING REVIEW" color="warning" sx={{ fontSize: '0.65rem' }} />
                        )}
                      </Box>
                    </StepLabel>
                    <StepContent>
                      <Paper elevation={0} sx={{ p: 2, bgcolor: activeResignation.principalApproval?.status === 'APPROVED' ? '#f0fdf4' : '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 1.5, my: 1 }}>
                        {activeResignation.principalApproval?.status === 'APPROVED' ? (
                          <Box>
                            <Typography variant="caption" color="text.secondary">Principal Decision & Endorsement</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#166534', mt: 0.5 }}>
                              {activeResignation.principalApproval.comments || 'Handover verified and accepted.'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                              Approved LWD: <b>{activeResignation.approvedLastWorkingDate || activeResignation.proposedLastWorkingDate}</b> • Signed by: {activeResignation.principalApproval.approvedBy || 'Principal'}
                            </Typography>
                          </Box>
                        ) : (
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              The School Principal / Reporting Manager conducts an exit interview, validates academic/lab handover, and approves the final Last Working Day.
                            </Typography>
                            {/* Simulator button */}
                            <Box sx={{ mt: 1.5, display: 'flex', gap: 1 }}>
                              <Button
                                size="small"
                                variant="contained"
                                color="success"
                                startIcon={<CheckCircleIcon />}
                                onClick={() => handleOpenApprovalDialog('PRINCIPAL', 'APPROVE')}
                              >
                                Approve as Principal
                              </Button>
                              <Button
                                size="small"
                                variant="outlined"
                                color="error"
                                onClick={() => handleOpenApprovalDialog('PRINCIPAL', 'REJECT')}
                              >
                                Request Reconsideration
                              </Button>
                            </Box>
                          </Box>
                        )}
                      </Paper>
                    </StepContent>
                  </Step>

                  {/* Step 3: HR & Departmental Clearances */}
                  <Step active={currentStep >= 3} completed={currentStep > 3}>
                    <StepLabel StepIconComponent={() => (
                      <Box sx={{ width: 32, height: 32, borderRadius: '50%', bgcolor: currentStep >= 3 ? '#10b981' : '#cbd5e1', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                        3
                      </Box>
                    )}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                          Step 3: HR & Departmental Clearances
                        </Typography>
                        {activeResignation.hrApproval?.status === 'APPROVED' ? (
                          <Chip size="small" label="HR CLEARED" color="success" sx={{ fontSize: '0.65rem' }} />
                        ) : currentStep >= 2 ? (
                          <Chip size="small" label="IN PROGRESS" color="warning" sx={{ fontSize: '0.65rem' }} />
                        ) : (
                          <Chip size="small" label="PENDING STEP 2" sx={{ fontSize: '0.65rem' }} />
                        )}
                      </Box>
                    </StepLabel>
                    <StepContent>
                      <Paper elevation={0} sx={{ p: 2, bgcolor: activeResignation.hrApproval?.status === 'APPROVED' ? '#f0fdf4' : '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 1.5, my: 1 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                          MANDATORY INTER-DEPARTMENTAL SIGN-OFFS:
                        </Typography>
                        <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                          {clearances.map((c) => (
                            <Box key={c._id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid #e2e8f0' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Checkbox 
                                  size="small" 
                                  checked={Boolean(c.cleared)} 
                                  onChange={() => handleToggleClearance(c._id)} 
                                />
                                <Box>
                                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{c.label || c.department}</Typography>
                                  <Typography variant="caption" color="text.secondary">{c.remarks}</Typography>
                                </Box>
                              </Box>
                              <Chip 
                                size="small" 
                                label={c.cleared ? 'CLEARED' : 'PENDING'} 
                                color={c.cleared ? 'success' : 'default'} 
                                sx={{ fontSize: '0.65rem', fontWeight: 700 }}
                              />
                            </Box>
                          ))}
                        </Box>

                        {currentStep >= 2 && activeResignation.hrApproval?.status !== 'APPROVED' && (
                          <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                            <Button
                              size="small"
                              variant="contained"
                              color="primary"
                              startIcon={<CheckCircleIcon />}
                              onClick={() => handleOpenApprovalDialog('HR', 'APPROVE')}
                            >
                              Finalize HR Clearances & Forward to Admin
                            </Button>
                          </Box>
                        )}
                      </Paper>
                    </StepContent>
                  </Step>

                  {/* Step 4: Admin Final Acceptance & Relieving */}
                  <Step active={currentStep >= 4} completed={activeResignation.status === 'ACCEPTED'}>
                    <StepLabel StepIconComponent={() => (
                      <Box sx={{ width: 32, height: 32, borderRadius: '50%', bgcolor: activeResignation.status === 'ACCEPTED' ? '#10b981' : '#cbd5e1', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                        4
                      </Box>
                    )}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                          Step 4: Admin Final Acceptance & Relieving Letter
                        </Typography>
                        {activeResignation.status === 'ACCEPTED' ? (
                          <Chip size="small" label="OFFICIALLY RELIEVED" color="success" sx={{ fontSize: '0.65rem' }} />
                        ) : (
                          <Chip size="small" label="AWAITING ADMIN SIGN-OFF" color="default" sx={{ fontSize: '0.65rem' }} />
                        )}
                      </Box>
                    </StepLabel>
                    <StepContent>
                      <Paper elevation={0} sx={{ p: 2, bgcolor: activeResignation.status === 'ACCEPTED' ? '#f0fdf4' : '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 1.5, my: 1 }}>
                        {activeResignation.status === 'ACCEPTED' ? (
                          <Box>
                            <Alert severity="success" sx={{ mb: 2 }}>
                              Resignation has been formally accepted by School Board Administration. The employee is officially relieved on <b>{activeResignation.approvedLastWorkingDate || activeResignation.proposedLastWorkingDate}</b>.
                            </Alert>
                            <Button
                              variant="contained"
                              color="success"
                              startIcon={<PrintIcon />}
                              onClick={() => setCertificateOpen(true)}
                              sx={{ fontWeight: 700 }}
                            >
                              View & Download Relieving & Experience Certificate
                            </Button>
                          </Box>
                        ) : (
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Once HR clearances are verified, the School Admin / Board issues final acceptance, deactivates institutional accounts, and issues the official Relieving Letter.
                            </Typography>
                            {currentStep >= 3 && (
                              <Box sx={{ mt: 1.5 }}>
                                <Button
                                  size="small"
                                  variant="contained"
                                  color="success"
                                  startIcon={<AdminPanelSettingsIcon />}
                                  onClick={() => handleOpenApprovalDialog('ADMIN', 'APPROVE')}
                                >
                                  Admin Sign-off & Issue Relieving Certificate
                                </Button>
                              </Box>
                            )}
                          </Box>
                        )}
                      </Paper>
                    </StepContent>
                  </Step>
                </Stepper>
              </CardContent>
            </Card>
          </Grid>

          {/* Right Column: Quick Status & Relieving Actions */}
          <Grid item xs={12} lg={4}>
            <Card sx={{ mb: 3, border: '1px solid #e2e8f0', borderRadius: 2 }}>
              <CardContent sx={{ p: 2.5 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1.5 }}>
                  Resignation Snapshot
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Box sx={{ p: 1.5, bgcolor: '#f8fafc', borderRadius: 1.5 }}>
                    <Typography variant="caption" color="text.secondary">CURRENT STATUS</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                      <Chip 
                        size="small" 
                        label={activeResignation.status} 
                        color={activeResignation.status === 'ACCEPTED' ? 'success' : 'warning'} 
                        sx={{ fontWeight: 700 }}
                      />
                    </Box>
                  </Box>

                  <Box sx={{ p: 1.5, bgcolor: '#f8fafc', borderRadius: 1.5 }}>
                    <Typography variant="caption" color="text.secondary">EFFECTIVE RELIEVING DATE</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 800, color: 'primary.main', mt: 0.2 }}>
                      {activeResignation.approvedLastWorkingDate || activeResignation.proposedLastWorkingDate}
                    </Typography>
                  </Box>

                  <Box sx={{ p: 1.5, bgcolor: '#f8fafc', borderRadius: 1.5 }}>
                    <Typography variant="caption" color="text.secondary">DEPARTMENT CLEARANCES CLEARED</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, mt: 0.2 }}>
                      {clearances.filter(c => c.cleared).length} of {clearances.length} Cleared
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={clearances.length ? (clearances.filter(c => c.cleared).length / clearances.length) * 100 : 0} 
                      sx={{ mt: 1, height: 6, borderRadius: 3 }}
                    />
                  </Box>

                  {/* Relieving Letter Download Card */}
                  <Button
                    variant="outlined"
                    color="primary"
                    fullWidth
                    disabled={activeResignation.status !== 'ACCEPTED'}
                    startIcon={<PrintIcon />}
                    onClick={() => setCertificateOpen(true)}
                    sx={{ mt: 1, py: 1.2, fontWeight: 700 }}
                  >
                    {activeResignation.status === 'ACCEPTED' 
                      ? 'Download Relieving Certificate' 
                      : 'Relieving Certificate (Pending Admin Approval)'}
                  </Button>

                  <Divider sx={{ my: 1 }} />

                  {/* Quick Simulation Help */}
                  <Alert severity="info" sx={{ fontSize: '0.75rem', p: 1 }}>
                    <b>Simulation Mode:</b> You can advance through each stage (Principal → HR → Admin) using the action buttons in the workflow steps to test the entire lifecycle!
                  </Alert>

                  <Button
                    size="small"
                    color="secondary"
                    variant="text"
                    onClick={() => {
                      localStorage.removeItem(`erp_resignation_${selectedPersona.id}`);
                      setActiveResignation(null);
                      setClearances([]);
                      setSuccessMsg('Reset resignation state for test persona.');
                    }}
                  >
                    Reset Application State
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Resignation Application Dialog */}
      <Dialog open={isApplyOpen} onClose={() => setIsApplyOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>
          Apply for Resignation & Exit Clearance
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
            Official declaration form for {selectedPersona.name} ({selectedPersona.designation})
          </Typography>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Primary Reason for Resignation"
                value={formData.reasonCategory}
                onChange={(e) => setFormData({ ...formData, reasonCategory: e.target.value })}
              >
                {REASON_CATEGORIES.map(r => (
                  <MenuItem key={r.value} value={r.value}>{r.label}</MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={3}>
              <TextField
                type="number"
                fullWidth
                label="Contractual Notice (Days)"
                value={formData.noticePeriodRequiredDays}
                onChange={(e) => {
                  const days = parseInt(e.target.value) || 30;
                  setFormData({
                    ...formData,
                    noticePeriodRequiredDays: days,
                    proposedLastWorkingDate: calculateDefaultLWD(days)
                  });
                }}
              />
            </Grid>

            <Grid item xs={12} sm={3}>
              <TextField
                type="date"
                fullWidth
                label="Proposed Last Working Day"
                InputLabelProps={{ shrink: true }}
                value={formData.proposedLastWorkingDate}
                onChange={(e) => setFormData({ ...formData, proposedLastWorkingDate: e.target.value })}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Detailed Justification / Personal Notes"
                placeholder="Briefly describe your decision and future plans..."
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nominated Handover Colleague / Successor"
                value={formData.successorNominee}
                onChange={(e) => setFormData({ ...formData, successorNominee: e.target.value })}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Pedagogy & Equipment Handover Plan"
                value={formData.handoverNotes}
                onChange={(e) => setFormData({ ...formData, handoverNotes: e.target.value })}
              />
            </Grid>

            <Grid item xs={12}>
              <Paper elevation={0} sx={{ p: 2, bgcolor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 1.5 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase' }}>
                  Institutional Assets in Custody Checklist:
                </Typography>
                <Grid container spacing={1} sx={{ mt: 0.5 }}>
                  {formData.declaredAssets.map((asset, idx) => (
                    <Grid item xs={6} sm={3} key={idx}>
                      <Chip size="small" label={asset} sx={{ bgcolor: '#e2e8f0', fontWeight: 600 }} />
                    </Grid>
                  ))}
                </Grid>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.assetDeclarationConfirmed}
                      onChange={(e) => setFormData({ ...formData, assetDeclarationConfirmed: e.target.checked })}
                    />
                  }
                  label="I confirm that all above listed institutional materials and classroom records will be deposited prior to my final day."
                  sx={{ mt: 1 }}
                />
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                FORMAL RESIGNATION LETTER TEMPLATE:
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={6}
                value={formData.letterContent}
                onChange={(e) => setFormData({ ...formData, letterContent: e.target.value })}
                sx={{ mt: 1, fontFamily: 'monospace', fontSize: '0.85rem' }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Digital Signature (Full Legal Name)"
                value={formData.digitalSignature}
                onChange={(e) => setFormData({ ...formData, digitalSignature: e.target.value })}
                helperText="By typing your legal name, you execute this official resignation notice."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setIsApplyOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<SendIcon />}
            onClick={handleSubmitResignation}
            sx={{ fontWeight: 700, px: 3 }}
          >
            Confirm & Submit Resignation
          </Button>
        </DialogActions>
      </Dialog>

      {/* Approval Action Dialog */}
      <Dialog 
        open={approvalDialog.open} 
        onClose={() => setApprovalDialog(prev => ({ ...prev, open: false }))} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 800 }}>
          {approvalDialog.tier === 'PRINCIPAL' && 'Principal / Reporting Manager Review'}
          {approvalDialog.tier === 'HR' && 'HR & Department Clearance Verification'}
          {approvalDialog.tier === 'ADMIN' && 'School Board / Admin Final Sign-Off'}
        </DialogTitle>
        <DialogContent dividers>
          <Alert severity={approvalDialog.decision === 'APPROVE' ? 'info' : 'warning'} sx={{ mb: 2 }}>
            You are executing <b>{approvalDialog.decision}</b> for <b>{selectedPersona.name}</b> at <b>{approvalDialog.tier}</b> stage.
          </Alert>

          {approvalDialog.tier === 'PRINCIPAL' && (
            <TextField
              type="date"
              fullWidth
              label="Confirmed Last Working Date (LWD)"
              InputLabelProps={{ shrink: true }}
              value={approvalDialog.approvedLWD}
              onChange={(e) => setApprovalDialog({ ...approvalDialog, approvedLWD: e.target.value })}
              sx={{ mb: 2 }}
            />
          )}

          <TextField
            fullWidth
            multiline
            rows={3}
            label="Approval Comments / Endorsement Notes"
            value={approvalDialog.comments}
            onChange={(e) => setApprovalDialog({ ...approvalDialog, comments: e.target.value })}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setApprovalDialog(prev => ({ ...prev, open: false }))}>Cancel</Button>
          <Button
            variant="contained"
            color={approvalDialog.decision === 'APPROVE' ? 'success' : 'error'}
            onClick={handleExecuteApproval}
            sx={{ fontWeight: 700, px: 3 }}
          >
            Confirm {approvalDialog.decision}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Official Relieving & Experience Certificate Printable Dialog */}
      <Dialog 
        open={certificateOpen} 
        onClose={() => setCertificateOpen(false)} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>Institutional Relieving Certificate</Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<PrintIcon />}
            onClick={() => window.print()}
            sx={{ fontWeight: 700 }}
          >
            Print / Save PDF
          </Button>
        </DialogTitle>
        <DialogContent dividers>
          {/* Printable Document Sheet */}
          <Paper 
            elevation={3} 
            sx={{ 
              p: { xs: 3, md: 5 }, 
              bgcolor: '#ffffff', 
              border: '2px solid #cbd5e1', 
              borderRadius: 2, 
              minHeight: 650,
              fontFamily: 'Georgia, serif' 
            }}
          >
            {/* Institution Header */}
            <Box sx={{ textAlign: 'center', pb: 3, borderBottom: '2px solid #0f172a' }}>
              <SchoolIcon sx={{ fontSize: 50, color: '#1e293b' }} />
              <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: 1, color: '#0f172a' }}>
                FIC GLOBAL ACADEMY & SENIOR SECONDARY SCHOOL
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Affiliated to Central Board of Secondary Education • School Code: 20419 • Affiliation No: 1930211
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Knowledge Campus, Administrative Block, Anna Nagar Main Road, Chennai - 600040
              </Typography>
            </Box>

            {/* Letter Meta */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3, mb: 3 }}>
              <Typography variant="body2">
                <b>Ref:</b> FIC/OFFICIAL/REL/{new Date().getFullYear()}/{selectedPersona.employeeIdNumber}
              </Typography>
              <Typography variant="body2">
                <b>Date:</b> {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
              </Typography>
            </Box>

            {/* Certificate Title */}
            <Typography variant="h5" sx={{ textAlign: 'center', fontWeight: 800, letterSpacing: 2, textDecoration: 'underline', my: 3 }}>
              RELIEVING & SERVICE EXPERIENCE CERTIFICATE
            </Typography>

            {/* Certificate Body */}
            <Box sx={{ lineHeight: 2, fontSize: '1.05rem', color: '#1e293b', textAlign: 'justify' }}>
              <Typography paragraph sx={{ textIndent: 40, lineHeight: 2 }}>
                This is to officially certify that <b>{selectedPersona.name}</b> (Staff ID: <b>{selectedPersona.employeeIdNumber}</b>) was employed with <b>FIC Global Academy</b> from <b>{selectedPersona.doj}</b> to <b>{activeResignation?.approvedLastWorkingDate || activeResignation?.proposedLastWorkingDate}</b>. During their esteemed tenure, they served with distinction as <b>{selectedPersona.designation}</b> in the Department of <b>{selectedPersona.department}</b>.
              </Typography>

              <Typography paragraph sx={{ textIndent: 40, lineHeight: 2 }}>
                Consequent to their formal resignation tendered on <b>{activeResignation?.resignationDate}</b>, they have fulfilled all contractual notice requirements and successfully handed over all pedagogical course materials, department laboratory responsibilities, and institutional keys.
              </Typography>

              <Typography paragraph sx={{ textIndent: 40, lineHeight: 2 }}>
                All inter-departmental exit clearances including <b>Finance & Accounts, IT Systems, Institutional Library, and Physical Infrastructure</b> have been fully settled with <b>Zero Dues</b>.
              </Typography>

              <Typography paragraph sx={{ textIndent: 40, lineHeight: 2 }}>
                During their tenure with this institution, we found their conduct, teaching pedagogy, classroom management, and professional integrity to be <b>Exemplary</b>. They are hereby officially relieved of their duties at the close of office hours on <b>{activeResignation?.approvedLastWorkingDate || activeResignation?.proposedLastWorkingDate}</b>.
              </Typography>

              <Typography paragraph sx={{ textIndent: 40, lineHeight: 2 }}>
                We express our heartfelt gratitude for their dedicated contribution to our institution and wish them the very best in all their future professional endeavors.
              </Typography>
            </Box>

            {/* Signatures & Seal */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mt: 8, pt: 4 }}>
              <Box sx={{ textAlign: 'center', minWidth: 180 }}>
                <Typography variant="body2" sx={{ fontWeight: 800 }}>Dr. Ramesh Sundaram</Typography>
                <Typography variant="caption" color="text.secondary">School Principal & Director</Typography>
                <Typography variant="caption" sx={{ display: 'block', color: '#64748b' }}>FIC Global Academy</Typography>
              </Box>

              <Box sx={{ textAlign: 'center', border: '2px solid #94a3b8', borderRadius: '50%', width: 90, height: 90, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="caption" sx={{ fontSize: '0.6rem', fontWeight: 800, color: '#475569' }}>OFFICIAL</Typography>
                <Typography variant="caption" sx={{ fontSize: '0.55rem', fontWeight: 700, color: '#475569' }}>INSTITUTION</Typography>
                <Typography variant="caption" sx={{ fontSize: '0.6rem', fontWeight: 800, color: '#475569' }}>SEAL</Typography>
              </Box>

              <Box sx={{ textAlign: 'center', minWidth: 180 }}>
                <Typography variant="body2" sx={{ fontWeight: 800 }}>Governing Trustee</Typography>
                <Typography variant="caption" color="text.secondary">School Management Board</Typography>
                <Typography variant="caption" sx={{ display: 'block', color: '#64748b' }}>FIC Educational Trust</Typography>
              </Box>
            </Box>
          </Paper>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setCertificateOpen(false)}>Close</Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<PrintIcon />}
            onClick={() => window.print()}
          >
            Print Certificate
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StaffResignationPortal;
