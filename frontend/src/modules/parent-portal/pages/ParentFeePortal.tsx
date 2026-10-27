import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Table, TableHead, TableRow, TableCell, 
  TableBody, Chip, CircularProgress, Button, Avatar, Grid, Card, CardContent,
  Tab, Tabs, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  RadioGroup, FormControlLabel, Radio, FormControl, FormLabel, Alert,
  LinearProgress, Divider, IconButton
} from '@mui/material';
import PaymentIcon from '@mui/icons-material/Payment';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import HistoryIcon from '@mui/icons-material/History';
import CategoryIcon from '@mui/icons-material/Category';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PrintIcon from '@mui/icons-material/Print';
import CloseIcon from '@mui/icons-material/Close';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import BackButton from '../../../shared/components/BackButton';
import api from '../../../core/api/axios';
import { useParentContext } from '../context/ParentContext';

const ParentFeePortal: React.FC = () => {
  const { selectedChild, isLoading: isContextLoading } = useParentContext();
  const [feeData, setFeeData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  // Pay Modal State
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<string>('UPI');
  const [paying, setPaying] = useState(false);
  const [paySuccessMsg, setPaySuccessMsg] = useState('');

  // Receipt Modal State
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [activeReceipt, setActiveReceipt] = useState<any>(null);

  const fetchFees = () => {
    if (!selectedChild) return;
    setLoading(true);
    const sId = selectedChild.studentId || selectedChild._id;
    api.get(`/parent-portal/children/${sId}/fees`)
      .then(res => setFeeData(res.data?.data || null))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchFees();
  }, [selectedChild]);

  const handleOpenPay = (inv: any) => {
    setSelectedInvoice(inv);
    const due = inv.balanceDue !== undefined ? inv.balanceDue : ((inv.grandTotal || inv.amount || 0) - (inv.amountPaid || 0));
    setPaymentAmount(due > 0 ? due : (inv.grandTotal || inv.amount || 5000));
    setPayModalOpen(true);
    setPaySuccessMsg('');
  };

  const handleProcessPayment = async () => {
    if (!selectedInvoice || !selectedChild) return;
    setPaying(true);
    const sId = selectedChild.studentId || selectedChild._id;
    try {
      const res = await api.post(`/parent-portal/children/${sId}/pay`, {
        invoiceId: selectedInvoice._id || selectedInvoice.id,
        amount: Number(paymentAmount),
        paymentMethod
      });
      if (res.data?.data) {
        setPaySuccessMsg(`Payment of ₹${paymentAmount} successful! Receipt ${res.data.data.receiptNumber || 'generated'}.`);
        setTimeout(() => {
          setPayModalOpen(false);
          fetchFees();
        }, 1500);
      }
    } catch (err) {
      console.error('Payment failed', err);
      alert('Payment processing failed. Please try again.');
    } finally {
      setPaying(false);
    }
  };

  const handleViewReceipt = (item: any) => {
    setActiveReceipt(item);
    setReceiptModalOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'PAID': return 'success';
      case 'PARTIALLY_PAID': return 'warning';
      case 'PARTIAL': return 'warning';
      case 'UNPAID': return 'error';
      case 'OVERDUE': return 'error';
      default: return 'primary';
    }
  };

  if (isContextLoading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}><CircularProgress /></Box>;
  }

  if (!selectedChild) {
    return (
      <Box sx={{ p: { xs: 2, md: 4 }, backgroundColor: '#f8fafc', minHeight: '100vh' }}>
        <BackButton to="/parent-portal" />
        <Paper elevation={0} sx={{ p: 6, textAlign: 'center', borderRadius: 3, border: '1px solid #e2e8f0', color: 'text.secondary' }}>
          No student selected or linked to your profile.
        </Paper>
      </Box>
    );
  }

  const invoices = feeData?.invoices || [];
  const outstandingInvoices = feeData?.outstandingInvoices || invoices.filter((i: any) => i.status !== 'PAID');
  const paidInvoices = feeData?.paidInvoices || invoices.filter((i: any) => i.status === 'PAID' || (i.amountPaid && i.amountPaid > 0));
  const categoryBreakdown = feeData?.categoryBreakdown || [];
  const paymentHistory = feeData?.paymentHistory || [];
  const totalDue = feeData?.totalDue ?? outstandingInvoices.reduce((acc: number, i: any) => acc + (i.balanceDue ?? (i.grandTotal - (i.amountPaid || 0))), 0);
  const totalPaid = feeData?.totalPaid ?? invoices.reduce((acc: number, i: any) => acc + (i.amountPaid || 0), 0);

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <BackButton to="/parent-portal" />
      
      {/* Top Header */}
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <PaymentIcon sx={{ fontSize: 36, color: '#0284c7' }} />
            <Typography variant="h4" sx={{ fontWeight: 800 }}>Fee Payments & Financials</Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Manage outstanding dues, download official paid receipts, and review category breakdowns for {selectedChild.firstName}.
          </Typography>
        </Box>
        <Chip 
          avatar={<Avatar>{selectedChild.firstName?.charAt(0)}</Avatar>} 
          label={`${selectedChild.firstName} ${selectedChild.lastName} (${selectedChild.class || 'Class 10'} - ${selectedChild.section || 'A'})`} 
          sx={{ ml: 'auto', fontWeight: 600, bgcolor: 'white', border: '1px solid #e2e8f0' }} 
        />
      </Box>

      {/* KPI Overview Cards */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined" sx={{ borderRadius: 3, bgcolor: '#ffffff', borderColor: '#e2e8f0' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Total Outstanding Dues</Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, color: totalDue > 0 ? '#e11d48' : '#16a34a', mt: 0.5 }}>
                ₹{totalDue.toLocaleString()}
              </Typography>
              <Typography variant="caption" color="text.secondary">{totalDue > 0 ? 'Pending payment' : 'All clear!'}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined" sx={{ borderRadius: 3, bgcolor: '#ffffff', borderColor: '#e2e8f0' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Total Fees Paid (To Date)</Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#10b981', mt: 0.5 }}>
                ₹{totalPaid.toLocaleString()}
              </Typography>
              <Typography variant="caption" color="text.secondary">Verified & settled</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined" sx={{ borderRadius: 3, bgcolor: '#ffffff', borderColor: '#e2e8f0' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Paid Invoices</Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#0284c7', mt: 0.5 }}>
                {paidInvoices.length} Invoices
              </Typography>
              <Typography variant="caption" color="text.secondary">Receipts available</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined" sx={{ borderRadius: 3, bgcolor: '#ffffff', borderColor: '#e2e8f0' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Payment Clearance</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#4f46e5' }}>
                  {totalPaid + totalDue > 0 ? Math.round((totalPaid / (totalPaid + totalDue)) * 100) : 100}%
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={totalPaid + totalDue > 0 ? Math.round((totalPaid / (totalPaid + totalDue)) * 100) : 100} 
                sx={{ mt: 1, height: 6, borderRadius: 3 }}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs Layout */}
      <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <Tabs 
          value={activeTab} 
          onChange={(_, val) => setActiveTab(val)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: '1px solid #e2e8f0', px: 2, bgcolor: '#ffffff' }}
        >
          <Tab icon={<PaymentIcon fontSize="small" />} iconPosition="start" label={`Outstanding Dues (${outstandingInvoices.length})`} sx={{ textTransform: 'none', fontWeight: 700 }} />
          <Tab icon={<ReceiptLongIcon fontSize="small" />} iconPosition="start" label={`Paid Invoices & Receipts (${paidInvoices.length})`} sx={{ textTransform: 'none', fontWeight: 700 }} />
          <Tab icon={<CategoryIcon fontSize="small" />} iconPosition="start" label="Category-wise Breakdown" sx={{ textTransform: 'none', fontWeight: 700 }} />
          <Tab icon={<HistoryIcon fontSize="small" />} iconPosition="start" label={`Payment History (${paymentHistory.length})`} sx={{ textTransform: 'none', fontWeight: 700 }} />
        </Tabs>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}><CircularProgress /></Box>
        ) : (
          <Box sx={{ p: { xs: 2, md: 3 } }}>
            {/* TAB 0: OUTSTANDING DUES */}
            {activeTab === 0 && (
              <Box>
                {outstandingInvoices.length === 0 ? (
                  <Box sx={{ p: 6, textAlign: 'center' }}>
                    <CheckCircleIcon sx={{ fontSize: 56, color: '#10b981', mb: 1.5 }} />
                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#1e293b' }}>All Dues are Cleared!</Typography>
                    <Typography variant="body2" color="text.secondary">No pending invoices found for {selectedChild.firstName}.</Typography>
                  </Box>
                ) : (
                  <Box sx={{ overflowX: 'auto' }}>
                    <Table>
                      <TableHead sx={{ bgcolor: '#f8fafc' }}>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 700 }}>Invoice / Particulars</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Due Date</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Total (₹)</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Paid (₹)</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Balance Due (₹)</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                          <TableCell sx={{ fontWeight: 700 }} align="right">Action</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {outstandingInvoices.map((fee: any) => {
                          const total = fee.grandTotal ?? fee.amount ?? fee.subTotal ?? 0;
                          const paid = fee.amountPaid ?? fee.paidAmount ?? 0;
                          const balance = fee.balanceDue !== undefined ? fee.balanceDue : (total - paid);
                          const isOverdue = new Date(fee.dueDate) < new Date();
                          return (
                            <TableRow key={fee.id || fee._id} hover>
                              <TableCell>
                                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1e293b' }}>
                                  {fee.description || fee.feeStructureId?.feeHeadId?.name || 'Academic Fee'}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                                  {fee.invoiceNumber || 'INV-PENDING'}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Chip 
                                  size="small" 
                                  label={fee.category || fee.items?.[0]?.feeHeadId?.category || 'ACADEMIC'} 
                                  sx={{ fontWeight: 600, bgcolor: '#f1f5f9' }} 
                                />
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" sx={{ color: isOverdue ? 'error.main' : 'text.primary', fontWeight: isOverdue ? 700 : 500 }}>
                                  {new Date(fee.dueDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                </Typography>
                                {isOverdue && <Typography variant="caption" color="error.main" sx={{ fontWeight: 700, display: 'block' }}>OVERDUE</Typography>}
                              </TableCell>
                              <TableCell><Typography variant="body2" sx={{ fontWeight: 700 }}>₹{total.toLocaleString()}</Typography></TableCell>
                              <TableCell><Typography variant="body2" color="success.main" sx={{ fontWeight: 600 }}>₹{paid.toLocaleString()}</Typography></TableCell>
                              <TableCell><Typography variant="body2" sx={{ fontWeight: 800, color: '#e11d48' }}>₹{balance.toLocaleString()}</Typography></TableCell>
                              <TableCell><Chip size="small" label={fee.status} color={getStatusColor(fee.status)} sx={{ fontWeight: 700 }} /></TableCell>
                              <TableCell align="right">
                                <Button 
                                  variant="contained" 
                                  size="small" 
                                  color="primary" 
                                  sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, px: 2 }}
                                  onClick={() => handleOpenPay(fee)}
                                >
                                  Pay Now
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </Box>
                )}
              </Box>
            )}

            {/* TAB 1: PAID INVOICES & RECEIPTS */}
            {activeTab === 1 && (
              <Box>
                {paidInvoices.length === 0 ? (
                  <Box sx={{ p: 6, textAlign: 'center', color: 'text.secondary' }}>
                    <Typography variant="body1">No paid invoices found yet.</Typography>
                  </Box>
                ) : (
                  <Box sx={{ overflowX: 'auto' }}>
                    <Table>
                      <TableHead sx={{ bgcolor: '#f8fafc' }}>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 700 }}>Invoice Number</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Fee Title / Purpose</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Paid Amount (₹)</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                          <TableCell sx={{ fontWeight: 700 }} align="right">Receipt</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {paidInvoices.map((inv: any) => (
                          <TableRow key={inv.id || inv._id} hover>
                            <TableCell sx={{ fontFamily: 'monospace', fontWeight: 700, color: '#0284c7' }}>
                              {inv.invoiceNumber || 'INV-2026-0042'}
                            </TableCell>
                            <TableCell>
                              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                                {inv.description || inv.items?.[0]?.feeHeadId?.name || 'School Term Fee'}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Category: {inv.category || inv.items?.[0]?.feeHeadId?.category || 'ACADEMIC'}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" sx={{ fontWeight: 800, color: '#10b981' }}>
                                ₹{(inv.amountPaid || inv.grandTotal || inv.amount).toLocaleString()}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {new Date(inv.dueDate || Date.now()).toLocaleDateString()}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip size="small" label="PAID" color="success" sx={{ fontWeight: 700 }} />
                            </TableCell>
                            <TableCell align="right">
                              <Button 
                                variant="outlined" 
                                size="small" 
                                color="success" 
                                startIcon={<ReceiptLongIcon />}
                                sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
                                onClick={() => handleViewReceipt(inv)}
                              >
                                View Receipt
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Box>
                )}
              </Box>
            )}

            {/* TAB 2: CATEGORY-WISE BREAKDOWN */}
            {activeTab === 2 && (
              <Box>
                <Grid container spacing={3}>
                  {categoryBreakdown.map((cat: any) => {
                    const pct = cat.totalAmount > 0 ? Math.round((cat.paidAmount / cat.totalAmount) * 100) : 100;
                    return (
                      <Grid item xs={12} md={6} key={cat.category}>
                        <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: '#ffffff' }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Box>
                              <Typography variant="h6" sx={{ fontWeight: 800, color: '#1e293b' }}>{cat.category}</Typography>
                              <Typography variant="caption" color="text.secondary">{cat.count} Associated Invoices</Typography>
                            </Box>
                            <Chip 
                              label={`${pct}% Paid`} 
                              color={pct === 100 ? 'success' : pct > 0 ? 'warning' : 'error'} 
                              size="small" 
                              sx={{ fontWeight: 700 }} 
                            />
                          </Box>

                          <Box sx={{ my: 2 }}>
                            <LinearProgress 
                              variant="determinate" 
                              value={pct} 
                              color={pct === 100 ? 'success' : 'primary'}
                              sx={{ height: 8, borderRadius: 4 }} 
                            />
                          </Box>

                          <Grid container spacing={2} sx={{ mt: 1, bgcolor: '#f8fafc', p: 1.5, borderRadius: 2 }}>
                            <Grid item xs={4}>
                              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>Total Billed</Typography>
                              <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>₹{cat.totalAmount.toLocaleString()}</Typography>
                            </Grid>
                            <Grid item xs={4}>
                              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>Total Paid</Typography>
                              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#10b981' }}>₹{cat.paidAmount.toLocaleString()}</Typography>
                            </Grid>
                            <Grid item xs={4}>
                              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>Pending Due</Typography>
                              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: cat.dueAmount > 0 ? '#e11d48' : '#64748b' }}>
                                ₹{cat.dueAmount.toLocaleString()}
                              </Typography>
                            </Grid>
                          </Grid>
                        </Paper>
                      </Grid>
                    );
                  })}
                </Grid>
              </Box>
            )}

            {/* TAB 3: PAYMENT HISTORY */}
            {activeTab === 3 && (
              <Box>
                {paymentHistory.length === 0 ? (
                  <Box sx={{ p: 6, textAlign: 'center', color: 'text.secondary' }}>
                    <Typography variant="body1">No payment transactions recorded yet.</Typography>
                  </Box>
                ) : (
                  <Box sx={{ overflowX: 'auto' }}>
                    <Table>
                      <TableHead sx={{ bgcolor: '#f8fafc' }}>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 700 }}>Reference / UTR ID</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Payment Method</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Date & Time</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Amount Paid (₹)</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                          <TableCell sx={{ fontWeight: 700 }} align="right">Receipt</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {paymentHistory.map((pay: any) => (
                          <TableRow key={pay._id} hover>
                            <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                              {pay.referenceNumber || pay.transactionId || 'UPI/2026/099182'}
                            </TableCell>
                            <TableCell>
                              <Chip 
                                size="small" 
                                icon={pay.method === 'UPI' ? <QrCode2Icon /> : pay.method === 'RAZORPAY' ? <CreditCardIcon /> : <AccountBalanceIcon />} 
                                label={pay.method || 'UPI'} 
                                sx={{ fontWeight: 600, bgcolor: '#f1f5f9' }} 
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {new Date(pay.paymentDate || pay.createdAt || Date.now()).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" sx={{ fontWeight: 800, color: '#10b981' }}>
                                ₹{pay.amount?.toLocaleString()}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip size="small" label={pay.status || 'SUCCESS'} color="success" sx={{ fontWeight: 700 }} />
                            </TableCell>
                            <TableCell align="right">
                              <Button 
                                size="small" 
                                variant="text" 
                                startIcon={<ReceiptLongIcon />} 
                                sx={{ textTransform: 'none', fontWeight: 600 }}
                                onClick={() => handleViewReceipt(pay)}
                              >
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Box>
                )}
              </Box>
            )}
          </Box>
        )}
      </Paper>

      {/* PAY NOW DIALOG */}
      <Dialog open={payModalOpen} onClose={() => !paying && setPayModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>Online Fee Payment</Typography>
          {!paying && (
            <IconButton onClick={() => setPayModalOpen(false)} size="small">
              <CloseIcon />
            </IconButton>
          )}
        </DialogTitle>
        <DialogContent dividers>
          {paySuccessMsg ? (
            <Alert severity="success" sx={{ mb: 2, fontWeight: 600 }}>
              {paySuccessMsg}
            </Alert>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, py: 1 }}>
              <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                <Typography variant="caption" color="text.secondary">Paying for</Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  {selectedInvoice?.description || 'Term Fee'} ({selectedInvoice?.invoiceNumber})
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Student: <strong>{selectedChild.firstName} {selectedChild.lastName}</strong>
                </Typography>
              </Box>

              <TextField 
                label="Amount to Pay (₹)"
                type="number"
                fullWidth
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(Number(e.target.value))}
                helperText="You may pay the full balance or partial amount."
              />

              <FormControl component="fieldset">
                <FormLabel component="legend" sx={{ fontWeight: 700, mb: 1 }}>Choose Payment Mode</FormLabel>
                <RadioGroup value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                  <FormControlLabel value="UPI" control={<Radio />} label="UPI (Google Pay / PhonePe / Paytm)" />
                  <FormControlLabel value="RAZORPAY" control={<Radio />} label="Credit / Debit Card (Instant Gateway)" />
                  <FormControlLabel value="BANK_TRANSFER" control={<Radio />} label="Net Banking / NEFT" />
                </RadioGroup>
              </FormControl>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setPayModalOpen(false)} disabled={paying}>Cancel</Button>
          <Button 
            variant="contained" 
            color="primary" 
            disabled={paying || paymentAmount <= 0 || !!paySuccessMsg}
            onClick={handleProcessPayment}
            sx={{ fontWeight: 700, px: 3, borderRadius: 2 }}
          >
            {paying ? 'Processing...' : `Confirm & Pay ₹${paymentAmount.toLocaleString()}`}
          </Button>
        </DialogActions>
      </Dialog>

      {/* PRINTABLE RECEIPT MODAL */}
      <Dialog open={receiptModalOpen} onClose={() => setReceiptModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>Fee Payment Receipt</Typography>
          <IconButton onClick={() => setReceiptModalOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {activeReceipt && (
            <Paper elevation={0} sx={{ p: 3, border: '2px dashed #cbd5e1', borderRadius: 3, bgcolor: '#ffffff' }}>
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 900, color: '#1e293b' }}>SCHOTA INTERNATIONAL SCHOOL</Typography>
                <Typography variant="caption" color="text.secondary">Main Campus, Affiliation No. 2026-FIC • Tel: +91 98765 43210</Typography>
                <Divider sx={{ my: 1.5 }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0284c7' }}>OFFICIAL FEE RECEIPT</Typography>
              </Box>

              <Grid container spacing={1.5} sx={{ mb: 2 }}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Receipt Number</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: 'monospace' }}>
                    {activeReceipt.receiptNumber || 'REC-2026-0042'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Date</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {new Date(activeReceipt.paymentDate || activeReceipt.dueDate || Date.now()).toLocaleDateString()}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Student Name</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>{selectedChild.firstName} {selectedChild.lastName}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Class / Section</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>{selectedChild.class || 'Class 10'} - {selectedChild.section || 'A'}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">Fee Particulars</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {activeReceipt.description || activeReceipt.invoiceNumber || 'Tuition & Academic Term Fee'}
                  </Typography>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#f0fdf4', p: 2, borderRadius: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#166534' }}>Amount Received</Typography>
                <Typography variant="h5" sx={{ fontWeight: 900, color: '#15803d' }}>
                  ₹{(activeReceipt.amountPaid || activeReceipt.amount || activeReceipt.grandTotal || 0).toLocaleString()}
                </Typography>
              </Box>

              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="caption" color="text.secondary">
                  Mode: <strong>{activeReceipt.method || activeReceipt.paymentMethod || 'Online Gateway'}</strong>
                </Typography>
                <Chip label="PAID & VERIFIED" color="success" size="small" sx={{ fontWeight: 800 }} />
              </Box>
            </Paper>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button startIcon={<PrintIcon />} variant="contained" onClick={() => window.print()}>
            Print Receipt
          </Button>
          <Button onClick={() => setReceiptModalOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ParentFeePortal;