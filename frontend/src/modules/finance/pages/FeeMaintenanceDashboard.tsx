import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Grid, Card, CardContent, LinearProgress, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Chip, Button, Tabs, Tab, Dialog, DialogTitle, DialogContent, 
  DialogActions, TextField, FormControl, InputLabel, Select, MenuItem, 
  IconButton, Checkbox, FormControlLabel, CircularProgress, Alert
} from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CategoryIcon from '@mui/icons-material/Category';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import DiscountIcon from '@mui/icons-material/Discount';

import { 
  getFeeHeads, getFeeStructures, getDiscounts, 
  createFeeHead, updateFeeHead, deactivateFeeHead,
  createFeeStructure, updateFeeStructure, deactivateFeeStructure,
  createDiscount, updateDiscount, deactivateDiscount,
  getFinanceDashboardStats
} from '../api/finance.api';
import type { FeeHead, FeeStructure, ScholarshipDiscount } from '../api/finance.api';
import { getAcademicYears, getClasses } from '../../academic/api/academic.api';
import api from '../../../core/api/axios';

export default function FeeMaintenanceDashboard() {
  const [currentTab, setCurrentTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    todaysCollection: 0,
    totalOutstanding: 0,
    onlineCollectionsMTD: 0
  });

  // Data states
  const [heads, setHeads] = useState<FeeHead[]>([]);
  const [structures, setStructures] = useState<FeeStructure[]>([]);
  const [discounts, setDiscounts] = useState<ScholarshipDiscount[]>([]);
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [defaulters, setDefaulters] = useState<any[]>([]);

  // Modals
  const [headModalOpen, setHeadModalOpen] = useState(false);
  const [editingHead, setEditingHead] = useState<FeeHead | null>(null);
  const [headForm, setHeadForm] = useState({
    name: '',
    code: '',
    category: 'ACADEMIC' as 'ACADEMIC' | 'TRANSPORT' | 'HOSTEL' | 'MISCELLANEOUS',
    isTaxable: false,
    isRefundable: false,
    description: ''
  });

  const [structModalOpen, setStructModalOpen] = useState(false);
  const [editingStruct, setEditingStruct] = useState<FeeStructure | null>(null);
  const [structForm, setStructForm] = useState({
    academicYearId: '',
    classId: '',
    feeHeadId: '',
    totalAmount: 15000,
    frequency: 'QUARTERLY' as 'ONE_TIME' | 'MONTHLY' | 'QUARTERLY' | 'HALF_YEARLY' | 'ANNUAL' | 'CUSTOM',
    effectiveDate: new Date().toISOString().split('T')[0]
  });

  const [discountModalOpen, setDiscountModalOpen] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<ScholarshipDiscount | null>(null);
  const [discountForm, setDiscountForm] = useState({
    name: '',
    type: 'PERCENTAGE' as 'PERCENTAGE' | 'FIXED_AMOUNT',
    value: 20,
    reason: ''
  });

  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [headsData, structsData, discountsData, statsData, yearsData, classesData, invoicesRes] = await Promise.all([
        getFeeHeads().catch(() => []),
        getFeeStructures().catch(() => []),
        getDiscounts().catch(() => []),
        getFinanceDashboardStats().catch(() => null),
        getAcademicYears().catch(() => []),
        getClasses().catch(() => []),
        api.get('/finance/invoices?status=OVERDUE').then(res => res.data?.data).catch(() => [])
      ]);
      setHeads(headsData);
      setStructures(structsData);
      setDiscounts(discountsData);
      if (statsData) setStats(statsData as any);
      setAcademicYears(yearsData || []);
      setClasses(classesData || []);
      if (Array.isArray(invoicesRes)) {
        setDefaulters(invoicesRes.map((inv: any) => ({
          id: inv.invoiceNumber || inv._id,
          name: inv.studentName || 'Student',
          class: inv.className || 'General',
          pendingAmount: inv.balanceDue || inv.totalAmount || 0,
          dueDate: inv.dueDate ? new Date(inv.dueDate).toISOString().split('T')[0] : 'Overdue'
        })));
      } else {
        setDefaulters([]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Fee Head Handlers
  const handleOpenHeadCreate = () => {
    setEditingHead(null);
    setHeadForm({
      name: '',
      code: '',
      category: 'ACADEMIC',
      isTaxable: false,
      isRefundable: false,
      description: ''
    });
    setHeadModalOpen(true);
  };

  const handleOpenHeadEdit = (head: FeeHead) => {
    setEditingHead(head);
    setHeadForm({
      name: head.name,
      code: head.code,
      category: head.category,
      isTaxable: head.isTaxable,
      isRefundable: head.isRefundable,
      description: head.description || ''
    });
    setHeadModalOpen(true);
  };

  const handleSaveHead = async () => {
    if (!headForm.name || !headForm.code) {
      alert('Fee Head name and code are required');
      return;
    }
    try {
      setSaving(true);
      if (editingHead) {
        await updateFeeHead(editingHead._id || (editingHead as any).id, headForm);
      } else {
        await createFeeHead(headForm);
      }
      setHeadModalOpen(false);
      const updated = await getFeeHeads();
      setHeads(updated);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save fee head');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteHead = async (id: string) => {
    if (!window.confirm('Are you sure you want to deactivate this fee head?')) return;
    try {
      await deactivateFeeHead(id);
      const updated = await getFeeHeads();
      setHeads(updated);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to deactivate fee head');
    }
  };

  // Fee Structure Handlers
  const handleOpenStructCreate = () => {
    setEditingStruct(null);
    setStructForm({
      academicYearId: academicYears[0]?.id || academicYears[0]?._id || '',
      classId: classes[0]?.id || classes[0]?._id || '',
      feeHeadId: heads[0]?._id || (heads[0] as any)?.id || '',
      totalAmount: 15000,
      frequency: 'QUARTERLY',
      effectiveDate: new Date().toISOString().split('T')[0]
    });
    setStructModalOpen(true);
  };

  const handleOpenStructEdit = (st: FeeStructure) => {
    setEditingStruct(st);
    setStructForm({
      academicYearId: typeof (st as any).academicYearId === 'object' ? (st as any).academicYearId?._id : (st.academicYearId || ''),
      classId: typeof st.classId === 'object' ? (st.classId as any)?._id : (st.classId || ''),
      feeHeadId: typeof st.feeHeadId === 'object' ? st.feeHeadId?._id : st.feeHeadId,
      totalAmount: st.totalAmount || 0,
      frequency: st.frequency || 'QUARTERLY',
      effectiveDate: st.effectiveDate ? new Date(st.effectiveDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
    });
    setStructModalOpen(true);
  };

  const handleSaveStruct = async () => {
    if (!structForm.feeHeadId || !structForm.totalAmount) {
      alert('Fee Head and Total Amount are required');
      return;
    }
    try {
      setSaving(true);
      const payload: any = { ...structForm };
      if (!payload.classId) delete payload.classId;
      if (editingStruct) {
        await updateFeeStructure(editingStruct._id || (editingStruct as any).id, payload);
      } else {
        await createFeeStructure(payload);
      }
      setStructModalOpen(false);
      const updated = await getFeeStructures();
      setStructures(updated);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save fee structure');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteStruct = async (id: string) => {
    if (!window.confirm('Are you sure you want to deactivate this fee structure?')) return;
    try {
      await deactivateFeeStructure(id);
      const updated = await getFeeStructures();
      setStructures(updated);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to deactivate fee structure');
    }
  };

  // Discount Handlers
  const handleOpenDiscountCreate = () => {
    setEditingDiscount(null);
    setDiscountForm({
      name: '',
      type: 'PERCENTAGE',
      value: 15,
      reason: ''
    });
    setDiscountModalOpen(true);
  };

  const handleOpenDiscountEdit = (d: ScholarshipDiscount) => {
    setEditingDiscount(d);
    setDiscountForm({
      name: d.name,
      type: d.type,
      value: d.value,
      reason: d.reason || ''
    });
    setDiscountModalOpen(true);
  };

  const handleSaveDiscount = async () => {
    if (!discountForm.name) {
      alert('Discount name is required');
      return;
    }
    try {
      setSaving(true);
      if (editingDiscount) {
        await updateDiscount(editingDiscount._id || (editingDiscount as any).id, discountForm);
      } else {
        await createDiscount(discountForm);
      }
      setDiscountModalOpen(false);
      const updated = await getDiscounts();
      setDiscounts(updated);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save discount');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteDiscount = async (id: string) => {
    if (!window.confirm('Are you sure you want to deactivate this discount?')) return;
    try {
      await deactivateDiscount(id);
      const updated = await getDiscounts();
      setDiscounts(updated);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to deactivate discount');
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1400, mx: 'auto' }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#1e293b' }}>
            Fee Maintenance Workspace
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage fee heads, student fee structures, scholarship discounts, and collections.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button variant="outlined" startIcon={<CategoryIcon />} onClick={handleOpenHeadCreate}>
            + Fee Head
          </Button>
          <Button variant="contained" startIcon={<AccountTreeIcon />} onClick={handleOpenStructCreate}>
            + Fee Structure
          </Button>
        </Box>
      </Box>

      {/* Tabs */}
      <Paper elevation={0} sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
        <Tabs value={currentTab} onChange={(_, val) => setCurrentTab(val)}>
          <Tab label="Overview & Defaulters" />
          <Tab label={`Fee Heads (${heads.length})`} />
          <Tab label={`Fee Structures (${structures.length})`} />
          <Tab label={`Discounts & Waivers (${discounts.length})`} />
        </Tabs>
      </Paper>

      {/* Tab 0: Overview & Defaulters */}
      {currentTab === 0 && (
        <Box>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ borderRadius: 3, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <AccountBalanceWalletIcon sx={{ color: '#3b82f6', fontSize: 28, mr: 1 }} />
                    <Typography variant="subtitle2" sx={{ color: '#1e3a8a', fontWeight: 700 }}>Today's Collection</Typography>
                  </Box>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: '#1e40af' }}>
                    ${Number(stats.todaysCollection || 0).toLocaleString()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ borderRadius: 3, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <RequestQuoteIcon sx={{ color: '#22c55e', fontSize: 28, mr: 1 }} />
                    <Typography variant="subtitle2" sx={{ color: '#14532d', fontWeight: 700 }}>Online MTD</Typography>
                  </Box>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: '#166534' }}>
                    ${Number(stats.onlineCollectionsMTD || 0).toLocaleString()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ borderRadius: 3, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <WarningAmberIcon sx={{ color: '#ef4444', fontSize: 28, mr: 1 }} />
                    <Typography variant="subtitle2" sx={{ color: '#7f1d1d', fontWeight: 700 }}>Total Outstanding</Typography>
                  </Box>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: '#991b1b' }}>
                    ${Number(stats.totalOutstanding || 0).toLocaleString()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ borderRadius: 3, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                <CardContent>
                  <Typography variant="subtitle2" sx={{ color: '#64748b', fontWeight: 700, mb: 1 }}>
                    Active Fee Configs
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: '#334155' }}>
                    {structures.length} Structures
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {heads.length} Heads · {discounts.length} Waivers
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
            <Box sx={{ p: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#f8fafc', borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Fee Defaulters & Overdue Demands</Typography>
              <Button variant="outlined" color="error" size="small" onClick={() => alert('Payment reminder notifications dispatched.')}>
                Send Reminders to All
              </Button>
            </Box>
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: 'grey.50' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Student</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Class</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Pending Amount</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Due Date</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {defaulters.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>No outstanding fee defaulters found</Typography>
                        <Typography variant="caption" color="text.secondary">All student invoices are settled or within their active payment window.</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    defaulters.map((row) => (
                      <TableRow key={row.id} hover>
                        <TableCell>
                          <Typography sx={{ fontWeight: 700 }}>{row.name}</Typography>
                          <Typography variant="caption" color="text.secondary">{row.id}</Typography>
                        </TableCell>
                        <TableCell>{row.class}</TableCell>
                        <TableCell>
                          <Typography sx={{ fontWeight: 800, color: '#ef4444' }}>${row.pendingAmount.toLocaleString()}</Typography>
                        </TableCell>
                        <TableCell>
                          <Chip label={row.dueDate} size="small" color="error" variant="outlined" />
                        </TableCell>
                        <TableCell align="right">
                          <Button size="small" variant="outlined" color="warning" onClick={() => alert(`Payment reminder notice logged for ${row.name}`)}>
                            Send SMS
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>
      )}

      {/* Tab 1: Fee Heads CRUD */}
      {currentTab === 1 && (
        <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, overflow: 'hidden' }}>
          <Box sx={{ p: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#f8fafc', borderBottom: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Fee Components (Heads)</Typography>
            <Button variant="contained" startIcon={<AddIcon />} size="small" onClick={handleOpenHeadCreate}>
              New Fee Head
            </Button>
          </Box>
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: 'grey.50' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Head Name</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Code</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Taxable</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Refundable</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {heads.map((head) => (
                  <TableRow key={head._id || (head as any).id} hover>
                    <TableCell sx={{ fontWeight: 700 }}>{head.name}</TableCell>
                    <TableCell><Chip label={head.code} size="small" variant="outlined" /></TableCell>
                    <TableCell><Chip label={head.category} size="small" color="primary" variant="outlined" /></TableCell>
                    <TableCell>{head.isTaxable ? 'Yes' : 'No'}</TableCell>
                    <TableCell>{head.isRefundable ? 'Yes' : 'No'}</TableCell>
                    <TableCell align="right">
                      <IconButton size="small" color="primary" onClick={() => handleOpenHeadEdit(head)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDeleteHead(head._id || (head as any).id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {heads.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>No fee heads created yet. Click "+ New Fee Head" to create one.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Tab 2: Fee Structures CRUD */}
      {currentTab === 2 && (
        <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, overflow: 'hidden' }}>
          <Box sx={{ p: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#f8fafc', borderBottom: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Grade & Academic Fee Structures</Typography>
            <Button variant="contained" startIcon={<AddIcon />} size="small" onClick={handleOpenStructCreate}>
              New Fee Structure
            </Button>
          </Box>
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: 'grey.50' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Fee Component / Head</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Frequency</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Amount</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {structures.map((st) => {
                  const headName = typeof st.feeHeadId === 'object' ? st.feeHeadId?.name : (heads.find(h => h._id === st.feeHeadId || (h as any).id === st.feeHeadId)?.name || 'Tuition Fee');
                  return (
                    <TableRow key={st._id || (st as any).id} hover>
                      <TableCell sx={{ fontWeight: 700 }}>{headName}</TableCell>
                      <TableCell><Chip label={st.frequency} size="small" color="info" /></TableCell>
                      <TableCell sx={{ fontWeight: 800, color: 'primary.main' }}>${Number(st.totalAmount).toLocaleString()}</TableCell>
                      <TableCell><Chip label={st.isActive !== false ? 'ACTIVE' : 'INACTIVE'} size="small" color="success" /></TableCell>
                      <TableCell align="right">
                        <IconButton size="small" color="primary" onClick={() => handleOpenStructEdit(st)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" color="error" onClick={() => handleDeleteStruct(st._id || (st as any).id)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {structures.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>No fee structures configured. Click "+ New Fee Structure" to build one.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Tab 3: Discounts CRUD */}
      {currentTab === 3 && (
        <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, overflow: 'hidden' }}>
          <Box sx={{ p: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#f8fafc', borderBottom: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Scholarships, Concessions & Waivers</Typography>
            <Button variant="contained" startIcon={<AddIcon />} size="small" onClick={handleOpenDiscountCreate}>
              New Discount
            </Button>
          </Box>
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: 'grey.50' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Discount Name</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Value</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Reason</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {discounts.map((d) => (
                  <TableRow key={d._id || (d as any).id} hover>
                    <TableCell sx={{ fontWeight: 700 }}>{d.name}</TableCell>
                    <TableCell><Chip label={d.type} size="small" color="secondary" variant="outlined" /></TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>{d.type === 'PERCENTAGE' ? `${d.value}%` : `$${d.value}`}</TableCell>
                    <TableCell color="text.secondary">{d.reason || 'General Merit Waiver'}</TableCell>
                    <TableCell align="right">
                      <IconButton size="small" color="primary" onClick={() => handleOpenDiscountEdit(d)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDeleteDiscount(d._id || (d as any).id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {discounts.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>No scholarship or discount policies added yet.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Head Modal */}
      <Dialog open={headModalOpen} onClose={() => setHeadModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>
          {editingHead ? 'Edit Fee Head' : 'Create New Fee Head'}
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
            <TextField 
              label="Fee Head Name" 
              fullWidth 
              required 
              value={headForm.name} 
              onChange={e => setHeadForm({ ...headForm, name: e.target.value })} 
              placeholder="e.g. Tuition Fee, Sports Fee, Lab Charges"
            />
            <TextField 
              label="Head Code" 
              fullWidth 
              required 
              value={headForm.code} 
              onChange={e => setHeadForm({ ...headForm, code: e.target.value.toUpperCase() })} 
              placeholder="e.g. TUITION, LAB, SPORTS"
            />
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select 
                label="Category" 
                value={headForm.category} 
                onChange={e => setHeadForm({ ...headForm, category: e.target.value as any })}
              >
                <MenuItem value="ACADEMIC">Academic</MenuItem>
                <MenuItem value="TRANSPORT">Transport</MenuItem>
                <MenuItem value="HOSTEL">Hostel</MenuItem>
                <MenuItem value="MISCELLANEOUS">Miscellaneous</MenuItem>
              </Select>
            </FormControl>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControlLabel
                control={<Checkbox checked={headForm.isTaxable} onChange={e => setHeadForm({ ...headForm, isTaxable: e.target.checked })} />}
                label="Subject to Tax (GST)"
              />
              <FormControlLabel
                control={<Checkbox checked={headForm.isRefundable} onChange={e => setHeadForm({ ...headForm, isRefundable: e.target.checked })} />}
                label="Refundable Component"
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHeadModalOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveHead} disabled={saving}>
            {saving ? 'Saving...' : (editingHead ? 'Update Fee Head' : 'Create Fee Head')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Structure Modal */}
      <Dialog open={structModalOpen} onClose={() => setStructModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>
          {editingStruct ? 'Edit Fee Structure' : 'Create Fee Structure'}
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
            <FormControl fullWidth required>
              <InputLabel>Fee Head</InputLabel>
              <Select 
                label="Fee Head" 
                value={structForm.feeHeadId} 
                onChange={e => setStructForm({ ...structForm, feeHeadId: e.target.value })}
              >
                {heads.map(h => (
                  <MenuItem key={h._id || (h as any).id} value={h._id || (h as any).id}>
                    {h.name} ({h.code})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField 
                  label="Total Amount ($)" 
                  type="number" 
                  fullWidth 
                  required 
                  value={structForm.totalAmount} 
                  onChange={e => setStructForm({ ...structForm, totalAmount: Number(e.target.value) })} 
                />
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Billing Frequency</InputLabel>
                  <Select 
                    label="Billing Frequency" 
                    value={structForm.frequency} 
                    onChange={e => setStructForm({ ...structForm, frequency: e.target.value as any })}
                  >
                    <MenuItem value="ONE_TIME">One Time (Admission)</MenuItem>
                    <MenuItem value="MONTHLY">Monthly</MenuItem>
                    <MenuItem value="QUARTERLY">Quarterly</MenuItem>
                    <MenuItem value="HALF_YEARLY">Half Yearly</MenuItem>
                    <MenuItem value="ANNUAL">Annual</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Academic Year</InputLabel>
                  <Select 
                    label="Academic Year" 
                    value={structForm.academicYearId} 
                    onChange={e => setStructForm({ ...structForm, academicYearId: e.target.value })}
                  >
                    {academicYears.map(y => (
                      <MenuItem key={y.id || y._id} value={y.id || y._id}>{y.name}</MenuItem>
                    ))}
                    {academicYears.length === 0 && <MenuItem value="">Default Academic Year</MenuItem>}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Class / Grade</InputLabel>
                  <Select 
                    label="Class / Grade" 
                    value={structForm.classId} 
                    onChange={e => setStructForm({ ...structForm, classId: e.target.value })}
                  >
                    <MenuItem value="">All Classes (School-wide)</MenuItem>
                    {classes.map(c => (
                      <MenuItem key={c.id || c._id} value={c.id || c._id}>{c.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStructModalOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveStruct} disabled={saving}>
            {saving ? 'Saving...' : (editingStruct ? 'Update Structure' : 'Create Structure')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Discount Modal */}
      <Dialog open={discountModalOpen} onClose={() => setDiscountModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>
          {editingDiscount ? 'Edit Concession / Discount' : 'Create Concession / Discount'}
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
            <TextField 
              label="Discount / Waiver Name" 
              fullWidth 
              required 
              value={discountForm.name} 
              onChange={e => setDiscountForm({ ...discountForm, name: e.target.value })} 
              placeholder="e.g. Sibling Discount, Merit Scholarship"
            />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Type</InputLabel>
                  <Select 
                    label="Type" 
                    value={discountForm.type} 
                    onChange={e => setDiscountForm({ ...discountForm, type: e.target.value as any })}
                  >
                    <MenuItem value="PERCENTAGE">Percentage (%)</MenuItem>
                    <MenuItem value="FIXED_AMOUNT">Fixed Amount ($)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <TextField 
                  label="Value" 
                  type="number" 
                  fullWidth 
                  required 
                  value={discountForm.value} 
                  onChange={e => setDiscountForm({ ...discountForm, value: Number(e.target.value) })} 
                />
              </Grid>
            </Grid>
            <TextField 
              label="Policy Reason / Eligibility Criteria" 
              fullWidth 
              multiline 
              rows={2}
              value={discountForm.reason} 
              onChange={e => setDiscountForm({ ...discountForm, reason: e.target.value })} 
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDiscountModalOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveDiscount} disabled={saving}>
            {saving ? 'Saving...' : (editingDiscount ? 'Update Discount' : 'Create Discount')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
