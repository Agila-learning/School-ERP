import React, { useState } from 'react';
import {
  Box, Typography, Paper, Grid, Card, CardContent, Button,
  Tabs, Tab, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, MenuItem, Alert, Tooltip, IconButton, Divider
} from '@mui/material';
import ShareIcon from '@mui/icons-material/Share';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import SecurityIcon from '@mui/icons-material/Security';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import WorkIcon from '@mui/icons-material/Work';
import SchoolIcon from '@mui/icons-material/School';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import LocalPoliceIcon from '@mui/icons-material/LocalPolice';
import ScienceIcon from '@mui/icons-material/Science';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PaidIcon from '@mui/icons-material/Paid';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/hooks/useAuth';

export interface OutSchoolReferral {
  id: string;
  category: 'INSURANCE' | 'BANK_ACCOUNT' | 'CREDIT_CARD' | 'JOB_EXTERNAL';
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  schoolName: string;
  referredByRole: string;
  referredByName: string;
  planOrRoleName: string;
  city: string;
  status: 'LEAD_SUBMITTED' | 'CONTACTED' | 'CONVERTED' | 'INCENTIVE_PAID';
  incentiveAmount: number;
  submittedAt: string;
}

export interface InSchoolReferral {
  id: string;
  category: 'TEACHING_FACULTY' | 'BUS_DRIVER' | 'WATCHMAN' | 'LAB_ASSISTANT';
  candidateName: string;
  candidatePhone: string;
  experienceYears: number;
  qualification: string;
  schoolCampus: string;
  referredByRole: string;
  referredByName: string;
  status: 'SUBMITTED' | 'INTERVIEW_SCHEDULED' | 'HIRED' | 'INCENTIVE_APPROVED' | 'REJECTED';
  principalIncentive: number;
  principalRemarks?: string;
  submittedAt: string;
}

const DEFAULT_OUT_REFERRALS: OutSchoolReferral[] = [
  {
    id: 'out_001',
    category: 'INSURANCE',
    clientName: 'Suresh Kumar',
    clientPhone: '+91 98451 22345',
    schoolName: 'Main Campus',
    referredByRole: 'Teacher',
    referredByName: 'Mrs. Ananya Sharma',
    planOrRoleName: 'Family Comprehensive Health Plan (₹10L)',
    city: 'Chennai',
    status: 'CONVERTED',
    incentiveAmount: 1500,
    submittedAt: new Date(Date.now() - 3600000 * 48).toISOString()
  },
  {
    id: 'out_002',
    category: 'CREDIT_CARD',
    clientName: 'Karthik Raja',
    clientPhone: '+91 97890 12345',
    schoolName: 'West Wing Campus',
    referredByRole: 'Driver',
    referredByName: 'Murugan (Bus Driver)',
    planOrRoleName: 'Lifetime Free Fuel & Cashback Card',
    city: 'Coimbatore',
    status: 'INCENTIVE_PAID',
    incentiveAmount: 1200,
    submittedAt: new Date(Date.now() - 3600000 * 96).toISOString()
  },
  {
    id: 'out_003',
    category: 'BANK_ACCOUNT',
    clientName: 'Deepa Narayanan',
    clientPhone: '+91 91234 56789',
    schoolName: 'Main Campus',
    referredByRole: 'Parent',
    referredByName: 'R. Narayanan (Grade 8 Parent)',
    planOrRoleName: 'Zero Balance Premium Savings Account',
    city: 'Madurai',
    status: 'LEAD_SUBMITTED',
    incentiveAmount: 800,
    submittedAt: new Date(Date.now() - 3600000 * 12).toISOString()
  }
];

const DEFAULT_IN_REFERRALS: InSchoolReferral[] = [
  {
    id: 'in_001',
    category: 'BUS_DRIVER',
    candidateName: 'R. Velu',
    candidatePhone: '+91 94441 55667',
    experienceYears: 8,
    qualification: 'Heavy Commercial Vehicle License (HCV)',
    schoolCampus: 'Main Campus',
    referredByRole: 'Staff',
    referredByName: 'Ramesh (Transport Incharge)',
    status: 'HIRED',
    principalIncentive: 1500,
    principalRemarks: 'Verified clean driving record & police check. Welcome aboard.',
    submittedAt: new Date(Date.now() - 3600000 * 72).toISOString()
  },
  {
    id: 'in_002',
    category: 'WATCHMAN',
    candidateName: 'K. Mariappan',
    candidatePhone: '+91 99401 22334',
    experienceYears: 5,
    qualification: 'Ex-Servicemen Security Trained',
    schoolCampus: 'Main Campus',
    referredByRole: 'Teacher',
    referredByName: 'Dr. Vikram Rajan',
    status: 'SUBMITTED',
    principalIncentive: 1000,
    submittedAt: new Date(Date.now() - 3600000 * 20).toISOString()
  }
];

export const ReferralHub: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const userRole = (user?.role || 'STAFF').toUpperCase();
  const isSuperAdmin = userRole === 'SUPER_ADMIN';
  const isPrincipal = userRole === 'PRINCIPAL' || userRole === 'SUPER_ADMIN';

  const [activeTab, setActiveTab] = useState(0); // 0: Out-School, 1: In-School

  const [outReferrals, setOutReferrals] = useState<OutSchoolReferral[]>(() => {
    const cached = localStorage.getItem('fic_out_school_referrals');
    return cached ? JSON.parse(cached) : DEFAULT_OUT_REFERRALS;
  });

  const [inReferrals, setInReferrals] = useState<InSchoolReferral[]>(() => {
    const cached = localStorage.getItem('fic_in_school_referrals');
    return cached ? JSON.parse(cached) : DEFAULT_IN_REFERRALS;
  });

  // Modal States
  const [openOutModal, setOpenOutModal] = useState(false);
  const [openInModal, setOpenInModal] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Out-School Form
  const [outForm, setOutForm] = useState({
    category: 'INSURANCE' as const,
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    planOrRoleName: 'Health Insurance Plan (Family)',
    city: 'Chennai'
  });

  // In-School Form
  const [inForm, setInForm] = useState({
    category: 'TEACHING_FACULTY' as const,
    candidateName: '',
    candidatePhone: '',
    experienceYears: 3,
    qualification: 'B.Ed / M.Sc'
  });

  const saveOutReferrals = (data: OutSchoolReferral[]) => {
    setOutReferrals(data);
    localStorage.setItem('fic_out_school_referrals', JSON.stringify(data));
  };

  const saveInReferrals = (data: InSchoolReferral[]) => {
    setInReferrals(data);
    localStorage.setItem('fic_in_school_referrals', JSON.stringify(data));
  };

  const handleCreateOutReferral = (e: React.FormEvent) => {
    e.preventDefault();
    const incentiveMap: Record<string, number> = {
      INSURANCE: 1500,
      BANK_ACCOUNT: 800,
      CREDIT_CARD: 1200,
      JOB_EXTERNAL: 3000
    };

    const newRef: OutSchoolReferral = {
      id: `out_${Date.now()}`,
      category: outForm.category,
      clientName: outForm.clientName,
      clientPhone: outForm.clientPhone,
      clientEmail: outForm.clientEmail || undefined,
      schoolName: user?.tenantId ? 'Main Campus' : 'FIC Central School',
      referredByRole: userRole.replace('_', ' '),
      referredByName: `${user?.firstName || 'Community'} ${user?.lastName || 'Member'}`.trim(),
      planOrRoleName: outForm.planOrRoleName,
      city: outForm.city,
      status: 'LEAD_SUBMITTED',
      incentiveAmount: incentiveMap[outForm.category] || 1000,
      submittedAt: new Date().toISOString()
    };

    const updated = [newRef, ...outReferrals];
    saveOutReferrals(updated);
    setOpenOutModal(false);
    setSuccessToast(`Out-School Referral for ${outForm.clientName} submitted! Super Admin will review conversions.`);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const handleCreateInReferral = (e: React.FormEvent) => {
    e.preventDefault();
    const incentiveMap: Record<string, number> = {
      TEACHING_FACULTY: 2500,
      BUS_DRIVER: 1500,
      WATCHMAN: 1000,
      LAB_ASSISTANT: 1200
    };

    const newRef: InSchoolReferral = {
      id: `in_${Date.now()}`,
      category: inForm.category,
      candidateName: inForm.candidateName,
      candidatePhone: inForm.candidatePhone,
      experienceYears: Number(inForm.experienceYears) || 1,
      qualification: inForm.qualification,
      schoolCampus: 'Main Campus',
      referredByRole: userRole.replace('_', ' '),
      referredByName: `${user?.firstName || 'Staff'} ${user?.lastName || 'Member'}`.trim(),
      status: 'SUBMITTED',
      principalIncentive: incentiveMap[inForm.category] || 1000,
      submittedAt: new Date().toISOString()
    };

    const updated = [newRef, ...inReferrals];
    saveInReferrals(updated);
    setOpenInModal(false);
    setSuccessToast(`In-School candidate referral submitted for Principal evaluation!`);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  // Super Admin: Pay Out-School Incentive
  const handleSuperAdminPayout = (id: string) => {
    const updated = outReferrals.map(r => {
      if (r.id === id) {
        return { ...r, status: 'INCENTIVE_PAID' as const };
      }
      return r;
    });
    saveOutReferrals(updated);
    setSuccessToast('Super Admin: Incentive marked as paid and disbursed to referrer!');
    setTimeout(() => setSuccessToast(null), 4000);
  };

  // Principal: Approve In-School Incentive
  const handlePrincipalIncentiveApproval = (id: string) => {
    const bonus = window.prompt('Enter Principal Approved Incentive Amount (₹):', '2000');
    if (bonus === null) return;

    const updated = inReferrals.map(r => {
      if (r.id === id) {
        return {
          ...r,
          status: 'INCENTIVE_APPROVED' as const,
          principalIncentive: Number(bonus) || r.principalIncentive,
          principalRemarks: 'Candidate onboarded. Campus referral incentive approved by Principal.'
        };
      }
      return r;
    });
    saveInReferrals(updated);
    setSuccessToast('Principal: Campus hiring incentive authorized successfully!');
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const totalEarnedIncentive = outReferrals
    .filter(r => r.status === 'INCENTIVE_PAID')
    .reduce((acc, curr) => acc + curr.incentiveAmount, 0);

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1350, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            variant="outlined"
            onClick={() => window.history.length > 1 ? navigate(-1) : navigate('/')}
            sx={{ textTransform: 'none', borderRadius: 2 }}
          >
            Back
          </Button>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              Career & Referral Rewards Hub
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Refer external services or internal school staff & earn verified performance incentives.
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddCircleIcon />}
            onClick={() => activeTab === 0 ? setOpenOutModal(true) : setOpenInModal(true)}
            sx={{ fontWeight: 700, borderRadius: 2 }}
          >
            {activeTab === 0 ? 'New Out-School Referral' : 'New In-School Referral'}
          </Button>
        </Box>
      </Box>

      {successToast && <Alert severity="success" sx={{ mb: 3 }}>{successToast}</Alert>}

      {/* Overview Stat Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 3, p: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>Total Out-School Leads</Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#3b82f6', my: 0.5 }}>{outReferrals.length}</Typography>
            <Typography variant="caption" color="text.secondary">Insurance, Accounts, Cards, Jobs</Typography>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 3, p: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>Internal Staff Referrals</Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#10b981', my: 0.5 }}>{inReferrals.length}</Typography>
            <Typography variant="caption" color="text.secondary">Teachers, Drivers, Watchmen</Typography>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 3, p: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>Total Disbursed Incentives</Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#8b5cf6', my: 0.5 }}>₹{totalEarnedIncentive.toLocaleString()}</Typography>
            <Typography variant="caption" color="text.secondary">Paid via Super Admin / Principal</Typography>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 3, p: 2, bgcolor: '#f8fafc' }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>My Referral Code</Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', my: 0.5 }}>FIC-REF-{user?.id?.slice(-4) || '7821'}</Typography>
            <Typography variant="caption" color="primary" sx={{ cursor: 'pointer', fontWeight: 600 }}>
              Click to Copy Shareable Link
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper elevation={0} sx={{ mb: 3, borderBottom: '1px solid #e2e8f0', borderRadius: 2 }}>
        <Tabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val)}
          indicatorColor="primary"
          textColor="primary"
          sx={{ px: 2 }}
        >
          <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PaidIcon fontSize="small" />
                <span>Out-School Referrals (Super Admin Calculated)</span>
              </Box>
            }
            sx={{ fontWeight: 700, textTransform: 'none' }}
          />
          <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <SchoolIcon fontSize="small" />
                <span>In-School Staff Requirement (Principal Calculated)</span>
              </Box>
            }
            sx={{ fontWeight: 700, textTransform: 'none' }}
          />
        </Tabs>
      </Paper>

      {/* TAB 0: OUT-SCHOOL REFERRALS */}
      {activeTab === 0 && (
        <Box>
          {/* Category Cards Showcase */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {[
              { title: 'Insurance Referral', icon: <SecurityIcon />, color: '#0284c7', incentive: '₹1,500 - ₹3,000', desc: 'Health, Life, Motor & Education policies' },
              { title: 'Account Opening', icon: <AccountBalanceIcon />, color: '#16a34a', incentive: '₹800 per A/C', desc: 'Zero balance savings & premium salary accounts' },
              { title: 'Credit Card Referral', icon: <CreditCardIcon />, color: '#7c3aed', incentive: '₹1,200 per card', desc: 'Lifetime free cashback and travel cards' },
              { title: 'Job Referral (External)', icon: <WorkIcon />, color: '#ea580c', incentive: '₹3,000 - ₹10,000', desc: 'Corporate & MNC openings for graduates' },
            ].map(cat => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={cat.title}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: 2.5,
                    border: '1px solid #e2e8f0',
                    cursor: 'pointer',
                    '&:hover': { bgcolor: '#f8fafc', borderColor: cat.color }
                  }}
                  onClick={() => {
                    setOutForm(prev => ({ ...prev, category: cat.title.includes('Insurance') ? 'INSURANCE' : cat.title.includes('Account') ? 'BANK_ACCOUNT' : cat.title.includes('Credit') ? 'CREDIT_CARD' : 'JOB_EXTERNAL' }));
                    setOpenOutModal(true);
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1, color: cat.color }}>
                    {cat.icon}
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{cat.title}</Typography>
                  </Box>
                  <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 1 }}>{cat.desc}</Typography>
                  <Chip size="small" label={`Earn ${cat.incentive}`} sx={{ bgcolor: `${cat.color}15`, color: cat.color, fontWeight: 700 }} />
                </Paper>
              </Grid>
            ))}
          </Grid>

          {/* Super Admin Notice */}
          <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
            <strong>Super Admin Oversight:</strong> Super Admin has visibility over all participating schools. Once a lead is verified and converted by the service partner, Super Admin calculates and disburses the incentive directly.
          </Alert>

          {/* Out-School Table */}
          <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <TableContainer sx={{ overflowX: 'auto' }}>
              <Table sx={{ minWidth: 950 }}>
                <TableHead sx={{ bgcolor: '#f8fafc' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Referred Client</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Product / Plan</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Referred By</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>School Campus</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Est. Incentive</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700, textAlign: 'right' }}>Super Admin Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {outReferrals.map(item => (
                    <TableRow key={item.id} hover>
                      <TableCell>
                        <Chip
                          size="small"
                          label={item.category.replace('_', ' ')}
                          color={item.category === 'INSURANCE' ? 'primary' : item.category === 'BANK_ACCOUNT' ? 'success' : item.category === 'CREDIT_CARD' ? 'secondary' : 'warning'}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{item.clientName}</Typography>
                        <Typography variant="caption" color="text.secondary">{item.clientPhone} • {item.city}</Typography>
                      </TableCell>
                      <TableCell>{item.planOrRoleName}</TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{item.referredByName}</Typography>
                        <Typography variant="caption" color="text.secondary">{item.referredByRole}</Typography>
                      </TableCell>
                      <TableCell>{item.schoolName}</TableCell>
                      <TableCell>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#16a34a' }}>
                          ₹{item.incentiveAmount}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {item.status === 'LEAD_SUBMITTED' && <Chip size="small" label="Lead Received" />}
                        {item.status === 'CONVERTED' && <Chip size="small" label="Converted" color="info" />}
                        {item.status === 'INCENTIVE_PAID' && <Chip size="small" label="Incentive Paid" color="success" icon={<CheckCircleIcon />} />}
                      </TableCell>
                      <TableCell align="right">
                        {item.status !== 'INCENTIVE_PAID' ? (
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            onClick={() => handleSuperAdminPayout(item.id)}
                            sx={{ textTransform: 'none', borderRadius: 1.5, fontWeight: 700 }}
                          >
                            Disburse Incentive
                          </Button>
                        ) : (
                          <Typography variant="caption" color="text.secondary">Disbursed</Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>
      )}

      {/* TAB 1: IN-SCHOOL REFERRALS */}
      {activeTab === 1 && (
        <Box>
          <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
            <strong>In-School Campus Staff Requirements:</strong> Staff, Drivers, Teachers & Parents can refer candidates for inside school posts (Teaching, Bus Driver, Watchman, Lab Tech). The <strong>Principal</strong> calculates and sanctions internal referral bonuses upon onboarding.
          </Alert>

          {/* In-School Roles Showcase */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {[
              { title: 'Teaching Faculty', icon: <SchoolIcon />, role: 'TEACHING_FACULTY', incentive: '₹2,500', desc: 'Subject Teachers, Primary & High School' },
              { title: 'School Bus Driver', icon: <DirectionsBusIcon />, role: 'BUS_DRIVER', incentive: '₹1,500', desc: 'Experienced commercial driver with heavy license' },
              { title: 'Campus Watchman', icon: <LocalPoliceIcon />, role: 'WATCHMAN', incentive: '₹1,000', desc: 'Day/Night security gatekeeper' },
              { title: 'Lab Assistant', icon: <ScienceIcon />, role: 'LAB_ASSISTANT', incentive: '₹1,200', desc: 'Physics/Chemistry/Bio lab technician' },
            ].map(r => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={r.title}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: 2.5,
                    border: '1px solid #e2e8f0',
                    cursor: 'pointer',
                    '&:hover': { bgcolor: '#f8fafc', borderColor: '#3b82f6' }
                  }}
                  onClick={() => {
                    setInForm(prev => ({ ...prev, category: r.role as any }));
                    setOpenInModal(true);
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1, color: '#3b82f6' }}>
                    {r.icon}
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{r.title}</Typography>
                  </Box>
                  <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 1 }}>{r.desc}</Typography>
                  <Chip size="small" label={`Principal Incentive: ${r.incentive}`} sx={{ bgcolor: '#eff6ff', color: '#1d4ed8', fontWeight: 700 }} />
                </Paper>
              </Grid>
            ))}
          </Grid>

          {/* In-School Table */}
          <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <TableContainer sx={{ overflowX: 'auto' }}>
              <Table sx={{ minWidth: 950 }}>
                <TableHead sx={{ bgcolor: '#f8fafc' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Applied Post</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Candidate Name</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Experience / Qual.</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Referred By</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Principal Incentive</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700, textAlign: 'right' }}>Principal Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {inReferrals.map(item => (
                    <TableRow key={item.id} hover>
                      <TableCell>
                        <Chip
                          size="small"
                          label={item.category.replace('_', ' ')}
                          color={item.category === 'TEACHING_FACULTY' ? 'primary' : item.category === 'BUS_DRIVER' ? 'warning' : 'default'}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{item.candidateName}</Typography>
                        <Typography variant="caption" color="text.secondary">{item.candidatePhone}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{item.qualification}</Typography>
                        <Typography variant="caption" color="text.secondary">{item.experienceYears} Years Experience</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{item.referredByName}</Typography>
                        <Typography variant="caption" color="text.secondary">{item.referredByRole}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#2563eb' }}>
                          ₹{item.principalIncentive}
                        </Typography>
                        {item.principalRemarks && (
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                            {item.principalRemarks}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        {item.status === 'SUBMITTED' && <Chip size="small" label="Pending Review" />}
                        {item.status === 'HIRED' && <Chip size="small" label="Hired" color="info" />}
                        {item.status === 'INCENTIVE_APPROVED' && <Chip size="small" label="Incentive Approved" color="success" icon={<CheckCircleIcon />} />}
                      </TableCell>
                      <TableCell align="right">
                        {item.status !== 'INCENTIVE_APPROVED' ? (
                          <Button
                            size="small"
                            variant="contained"
                            color="primary"
                            onClick={() => handlePrincipalIncentiveApproval(item.id)}
                            sx={{ textTransform: 'none', borderRadius: 1.5, fontWeight: 700 }}
                          >
                            Approve Campus Bonus
                          </Button>
                        ) : (
                          <Typography variant="caption" color="text.secondary">Authorized</Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>
      )}

      {/* Out-School Referral Modal */}
      <Dialog open={openOutModal} onClose={() => setOpenOutModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>New Out-School Referral</DialogTitle>
        <form onSubmit={handleCreateOutReferral}>
          <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField
              select
              fullWidth
              size="small"
              label="Referral Category *"
              value={outForm.category}
              onChange={e => setOutForm({ ...outForm, category: e.target.value as any })}
            >
              <MenuItem value="INSURANCE">Insurance (Health / Term / Motor)</MenuItem>
              <MenuItem value="BANK_ACCOUNT">Bank Account Opening</MenuItem>
              <MenuItem value="CREDIT_CARD">Credit Card Referral</MenuItem>
              <MenuItem value="JOB_EXTERNAL">External Job Opportunity</MenuItem>
            </TextField>

            <TextField
              fullWidth
              size="small"
              label="Client / Prospect Full Name *"
              value={outForm.clientName}
              onChange={e => setOutForm({ ...outForm, clientName: e.target.value })}
              required
            />

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Contact Phone Number *"
                  value={outForm.clientPhone}
                  onChange={e => setOutForm({ ...outForm, clientPhone: e.target.value })}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Client City"
                  value={outForm.city}
                  onChange={e => setOutForm({ ...outForm, city: e.target.value })}
                />
              </Grid>
            </Grid>

            <TextField
              fullWidth
              size="small"
              label="Selected Plan / Service / Role"
              value={outForm.planOrRoleName}
              onChange={e => setOutForm({ ...outForm, planOrRoleName: e.target.value })}
            />
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => setOpenOutModal(false)}>Cancel</Button>
            <Button type="submit" variant="contained" sx={{ borderRadius: 2, fontWeight: 700 }}>
              Submit Lead
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* In-School Candidate Referral Modal */}
      <Dialog open={openInModal} onClose={() => setOpenInModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>New In-School Staff Referral</DialogTitle>
        <form onSubmit={handleCreateInReferral}>
          <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField
              select
              fullWidth
              size="small"
              label="Requirement Role *"
              value={inForm.category}
              onChange={e => setInForm({ ...inForm, category: e.target.value as any })}
            >
              <MenuItem value="TEACHING_FACULTY">Teaching Faculty</MenuItem>
              <MenuItem value="BUS_DRIVER">School Bus Driver</MenuItem>
              <MenuItem value="WATCHMAN">Campus Security Watchman</MenuItem>
              <MenuItem value="LAB_ASSISTANT">Lab Assistant / Maintenance</MenuItem>
            </TextField>

            <TextField
              fullWidth
              size="small"
              label="Candidate Full Name *"
              value={inForm.candidateName}
              onChange={e => setInForm({ ...inForm, candidateName: e.target.value })}
              required
            />

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Candidate Phone *"
                  value={inForm.candidatePhone}
                  onChange={e => setInForm({ ...inForm, candidatePhone: e.target.value })}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  type="number"
                  size="small"
                  label="Years of Experience"
                  value={inForm.experienceYears}
                  onChange={e => setInForm({ ...inForm, experienceYears: Number(e.target.value) })}
                />
              </Grid>
            </Grid>

            <TextField
              fullWidth
              size="small"
              label="Qualification / License Details"
              value={inForm.qualification}
              onChange={e => setInForm({ ...inForm, qualification: e.target.value })}
            />
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => setOpenInModal(false)}>Cancel</Button>
            <Button type="submit" variant="contained" sx={{ borderRadius: 2, fontWeight: 700 }}>
              Submit Candidate to Principal
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default ReferralHub;
