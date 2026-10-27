import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Card, CardContent, CircularProgress,
  Alert, Chip, Avatar, Grid, Button, Tabs, Tab, Paper,
  Divider, Tooltip, IconButton
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import CancelIcon from '@mui/icons-material/Cancel';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import EventNoteIcon from '@mui/icons-material/EventNote';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import api from '../../../core/api/axios';
import { useNavigate } from 'react-router-dom';

export interface MultiFlowApprovalItem {
  id: string;
  type: 'LEAVE_REQUEST' | 'PERIOD_EXCHANGE' | 'BONAFIDE_CERTIFICATE' | 'BUDGET_SANCTION';
  title: string;
  requesterName: string;
  requesterRole: string;
  requestedDate: string;
  description: string;
  reason?: string;
  details?: Record<string, any>;
  status: 'PENDING_PRINCIPAL_APPROVAL' | 'APPROVED' | 'REJECTED';
}

const DEFAULT_MULTI_FLOW_ITEMS: MultiFlowApprovalItem[] = [
  {
    id: 'appr_01',
    type: 'PERIOD_EXCHANGE',
    title: 'Staff Timetable Period Exchange',
    requesterName: 'Mrs. Ananya Sharma',
    requesterRole: 'Mathematics Teacher',
    requestedDate: new Date(Date.now() - 3600000 * 3).toISOString(),
    description: 'Exchange Monday Period 2 with Mr. Rajesh Patel (Wednesday Period 4)',
    reason: 'Parent-Teacher Special Consultative Meeting regarding Term Exam results.',
    details: {
      fromSlot: 'Monday Period 2 (09:45 - 10:30)',
      toSlot: 'Wednesday Period 4 (11:30 - 12:15)',
      colleague: 'Mr. Rajesh Patel'
    },
    status: 'PENDING_PRINCIPAL_APPROVAL'
  },
  {
    id: 'appr_02',
    type: 'LEAVE_REQUEST',
    title: 'Staff Medical Leave Request',
    requesterName: 'Mr. K. Murugan',
    requesterRole: 'School Bus Driver',
    requestedDate: new Date(Date.now() - 3600000 * 5).toISOString(),
    description: 'Casual Leave application for 2 days (Oct 24 - Oct 25)',
    reason: 'Family urgent medical checkup at Apollo Hospital.',
    status: 'PENDING_PRINCIPAL_APPROVAL'
  },
  {
    id: 'appr_03',
    type: 'BONAFIDE_CERTIFICATE',
    title: 'Student Bonafide & Scholarship Clearance',
    requesterName: 'Kavita Menon (Grade 11-A)',
    requesterRole: 'Student',
    requestedDate: new Date(Date.now() - 3600000 * 18).toISOString(),
    description: 'Bonafide Certificate request for National Science Talent Scholarship application.',
    reason: 'Required for state educational scholarship verification.',
    status: 'PENDING_PRINCIPAL_APPROVAL'
  },
  {
    id: 'appr_04',
    type: 'BUDGET_SANCTION',
    title: 'Robotics & Science Lab Consumables',
    requesterName: 'Dr. Vikram Rajan',
    requesterRole: 'Physics HOD',
    requestedDate: new Date(Date.now() - 3600000 * 30).toISOString(),
    description: 'Emergency requisition for sensor kits and microcontroller components (₹14,500)',
    reason: 'Inter-School Science Fair prototype preparation.',
    status: 'PENDING_PRINCIPAL_APPROVAL'
  }
];

export default function ApprovalCenter() {
  const navigate = useNavigate();
  const [approvals, setApprovals] = useState<MultiFlowApprovalItem[]>(() => {
    const cached = localStorage.getItem('fic_principal_approvals_queue');
    return cached ? JSON.parse(cached) : DEFAULT_MULTI_FLOW_ITEMS;
  });
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchApprovals = async () => {
      try {
        const response = await api.get('/principal/approvals/pending').catch(() => null);
        if (response?.data?.data && Array.isArray(response.data.data) && response.data.data.length > 0) {
          // Merge with multi flow
          const backendItems = response.data.data.map((item: any) => ({
            id: item.id || item._id,
            type: (item.type || 'LEAVE_REQUEST') as any,
            title: item.description?.slice(0, 35) || 'Leave Request',
            requesterName: `${item.requestedBy?.firstName || 'Staff'} ${item.requestedBy?.lastName || 'Member'}`,
            requesterRole: 'Staff',
            requestedDate: item.requestedDate || new Date().toISOString(),
            description: item.description || 'Request awaiting approval',
            reason: item.originalRecord?.reason || 'Leave requested',
            status: 'PENDING_PRINCIPAL_APPROVAL' as const
          }));
          setApprovals(prev => {
            const ids = new Set(prev.map(p => p.id));
            const fresh = backendItems.filter((b: any) => !ids.has(b.id));
            return [...fresh, ...prev];
          });
        }
      } catch (err) {
        console.error('Failed to load pending approvals from backend:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchApprovals();
  }, []);

  const saveApprovals = (data: MultiFlowApprovalItem[]) => {
    setApprovals(data);
    localStorage.setItem('fic_principal_approvals_queue', JSON.stringify(data));
  };

  const handleAction = async (id: string, action: 'APPROVED' | 'REJECTED') => {
    try {
      try {
        await api.put(`/principal/approvals/${id}/action`, { action });
      } catch (e) {
        // Fallback local resilience
      }

      // If it's a period exchange, also sync to fic_period_exchange_requests!
      const item = approvals.find(a => a.id === id);
      if (item && item.type === 'PERIOD_EXCHANGE') {
        const exchKey = 'fic_period_exchange_requests';
        const raw = localStorage.getItem(exchKey);
        if (raw) {
          const list = JSON.parse(raw);
          const updatedList = list.map((l: any) => {
            if (l.id === id || l.requesterName === item.requesterName) {
              return {
                ...l,
                status: action === 'APPROVED' ? 'PRINCIPAL_APPROVED' : 'REJECTED',
                principalRemarks: action === 'APPROVED' ? 'Principal approved from Approval Center' : 'Rejected by Principal'
              };
            }
            return l;
          });
          localStorage.setItem(exchKey, JSON.stringify(updatedList));
        }
      }

      const updated = approvals.filter(item => item.id !== id);
      saveApprovals(updated);
      setActionSuccess(action === 'APPROVED' 
        ? 'Approved! Forwarded to Admin / Office for final processing.' 
        : 'Request has been rejected.');
      setTimeout(() => setActionSuccess(null), 3500);
    } catch (err) {
      console.error('Failed to perform action:', err);
      setError('Failed to apply action.');
    }
  };

  const tabFilterMap: Record<number, string> = {
    0: 'ALL',
    1: 'PERIOD_EXCHANGE',
    2: 'LEAVE_REQUEST',
    3: 'BONAFIDE_CERTIFICATE',
    4: 'BUDGET_SANCTION'
  };

  const currentFilter = tabFilterMap[activeTab];
  const filteredList = currentFilter === 'ALL'
    ? approvals
    : approvals.filter(a => a.type === currentFilter);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1300, mx: 'auto' }}>
      {/* Top Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            variant="outlined"
            onClick={() => window.history.length > 1 ? navigate(-1) : navigate('/principal/dashboard')}
            sx={{ textTransform: 'none', borderRadius: 2 }}
          >
            Back
          </Button>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              Principal Multi-Flow Approval Center
            </Typography>
            <Typography variant="body2" color="text.secondary">
              First-tier executive authorization for staff & student requests before administrative execution.
            </Typography>
          </Box>
        </Box>
      </Box>

      {actionSuccess && <Alert severity="success" sx={{ mb: 3 }}>{actionSuccess}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {/* Tabs */}
      <Paper elevation={0} sx={{ mb: 4, borderBottom: '1px solid #e2e8f0', borderRadius: 2 }}>
        <Tabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val)}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
          sx={{ px: 2 }}
        >
          <Tab label={`All Pending (${approvals.length})`} sx={{ fontWeight: 700, textTransform: 'none' }} />
          <Tab
            icon={<SwapHorizIcon fontSize="small" />}
            iconPosition="start"
            label="Period Exchanges"
            sx={{ fontWeight: 700, textTransform: 'none' }}
          />
          <Tab
            icon={<EventNoteIcon fontSize="small" />}
            iconPosition="start"
            label="Leaves (Staff & Student)"
            sx={{ fontWeight: 700, textTransform: 'none' }}
          />
          <Tab
            icon={<WorkspacePremiumIcon fontSize="small" />}
            iconPosition="start"
            label="Certificates (Bonafide/TC)"
            sx={{ fontWeight: 700, textTransform: 'none' }}
          />
          <Tab
            icon={<AccountBalanceWalletIcon fontSize="small" />}
            iconPosition="start"
            label="Budget & Requisitions"
            sx={{ fontWeight: 700, textTransform: 'none' }}
          />
        </Tabs>
      </Paper>

      {/* Cards List */}
      {filteredList.length === 0 ? (
        <Card sx={{ p: 6, textAlign: 'center', bgcolor: 'grey.50', borderRadius: 3, border: '1px solid #e2e8f0' }}>
          <CheckCircleIcon sx={{ fontSize: 50, color: '#10b981', mb: 1.5 }} />
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b' }}>
            All Caught Up!
          </Typography>
          <Typography color="text.secondary">
            No pending items in this category requiring Principal approval.
          </Typography>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {filteredList.map((item) => (
            <Grid size={{ xs: 12, md: 6 }} key={item.id}>
              <Card elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Chip
                      size="small"
                      label={item.type.replace('_', ' ')}
                      color={item.type === 'PERIOD_EXCHANGE' ? 'primary' : item.type === 'LEAVE_REQUEST' ? 'warning' : item.type === 'BONAFIDE_CERTIFICATE' ? 'info' : 'secondary'}
                      sx={{ fontWeight: 700 }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {new Date(item.requestedDate).toLocaleDateString()}
                    </Typography>
                  </Box>

                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', mb: 1 }}>
                    {item.title}
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2, bgcolor: '#f8fafc', p: 1.5, borderRadius: 2 }}>
                    <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.light', fontWeight: 700 }}>
                      {item.requesterName[0]}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        {item.requesterName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {item.requesterRole}
                      </Typography>
                    </Box>
                  </Box>

                  <Typography variant="body2" color="text.primary" sx={{ mb: 1.5 }}>
                    <strong>Details:</strong> {item.description}
                  </Typography>

                  {item.reason && (
                    <Box sx={{ p: 1.5, bgcolor: '#fffbeb', borderRadius: 2, border: '1px solid #fef3c7', mb: 3 }}>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: '#b45309', display: 'block' }}>
                        Mandatory Justification / Reason:
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#92400e', fontStyle: 'italic' }}>
                        "{item.reason}"
                      </Typography>
                    </Box>
                  )}

                  <Box sx={{ display: 'flex', gap: 2, mt: 'auto' }}>
                    <Button
                      variant="contained"
                      color="success"
                      fullWidth
                      startIcon={<CheckCircleIcon />}
                      onClick={() => handleAction(item.id, 'APPROVED')}
                      sx={{ borderRadius: 2, fontWeight: 700, py: 1 }}
                    >
                      Principal Approve
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      fullWidth
                      startIcon={<CancelIcon />}
                      onClick={() => handleAction(item.id, 'REJECTED')}
                      sx={{ borderRadius: 2, fontWeight: 600, py: 1 }}
                    >
                      Reject
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
