import React, { useState, useEffect } from 'react';
import axios from '../../../core/api/axios';
import type { Invoice } from '../api/finance.api';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Button, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, Grid, Divider } from '@mui/material';
import Layout from '../../../core/components/Layout';
import PaymentIcon from '@mui/icons-material/Payment';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';

const StudentFeeDashboard: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const [rzpOpen, setRzpOpen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<any>(null);

  const fetchFees = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/finance/portal/my-fees');
      // Some APIs return inside `data.data.invoices` or just `data.data` depending on the route.
      // The controller for getMyFees calls getStudentInvoices which returns `{ invoices: [...] }` or array directly depending on logic
      const list = res.data.data.invoices || res.data.data || [];
      setInvoices(list);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchFees();
  }, []);

  const handlePayOnline = async (invoiceId: string, amount: number) => {
    try {
      const res = await axios.post('/finance/payments/initiate', { invoiceId, amount });
      const { razorpayOrderId } = res.data.data;
      setCurrentOrder({ invoiceId, amount, razorpayOrderId });
      setRzpOpen(true);
    } catch (err: any) {
      alert("Error initiating payment: " + (err.response?.data?.message || err.message));
    }
  };

  const simulateRazorpaySuccess = async () => {
    if (!currentOrder) return;
    try {
      // In a real application, Razorpay SDK would handle the checkout.
      // Since this is a testing/dev environment, we simulate the webhook/verify response.
      const payload = {
        razorpayOrderId: currentOrder.razorpayOrderId,
        razorpayPaymentId: 'pay_test_' + Date.now(),
        signature: 'mock_signature_for_testing' // Backend expects this specific string in dev mode
      };
      await axios.post('/finance/payments/verify', payload);
      alert('Payment Successful!');
      setRzpOpen(false);
      fetchFees();
    } catch (err: any) {
      alert("Verification Failed: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <Layout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'text.primary', mb: 3 }}>
          My Fee Dashboard
        </Typography>

        {loading ? (
          <CircularProgress />
        ) : (
          <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Invoice #</TableCell>
                    <TableCell>Due Date</TableCell>
                    <TableCell>Total Amount</TableCell>
                    <TableCell>Paid</TableCell>
                    <TableCell>Balance Due</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {invoices.map((inv) => (
                    <TableRow key={inv._id}>
                      <TableCell>{inv.invoiceNumber}</TableCell>
                      <TableCell>{new Date(inv.dueDate).toLocaleDateString()}</TableCell>
                      <TableCell>₹{inv.grandTotal}</TableCell>
                      <TableCell>₹{inv.amountPaid}</TableCell>
                      <TableCell>₹{inv.balanceDue}</TableCell>
                      <TableCell>
                        <Chip label={inv.status} color={inv.status === 'PAID' ? 'success' : (inv.status === 'OVERDUE' ? 'error' : 'warning')} size="small" />
                      </TableCell>
                      <TableCell align="right">
                        <Button
                          variant="outlined"
                          size="small"
                          sx={{ mr: 1 }}
                          startIcon={<ReceiptLongIcon />}
                          onClick={() => { setSelectedInvoice(inv); setDetailsOpen(true); }}
                        >
                          Details
                        </Button>
                        {inv.balanceDue > 0 && (
                          <Button 
                            variant="contained" 
                            color="primary" 
                            size="small" 
                            startIcon={<PaymentIcon />}
                            onClick={() => handlePayOnline(inv._id, inv.balanceDue)}
                          >
                            Pay
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {invoices.length === 0 && (
                    <TableRow><TableCell colSpan={7} align="center">No fees assigned.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}

        {/* Invoice Details Dialog */}
        <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Invoice Details: {selectedInvoice?.invoiceNumber}</DialogTitle>
          <DialogContent>
            {selectedInvoice && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Fee Breakdown</Typography>
                <Table size="small" sx={{ mb: 2 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell>Item</TableCell>
                      <TableCell align="right">Amount</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedInvoice.items?.map((item: any, i) => (
                      <TableRow key={i}>
                        <TableCell>{item.feeHeadId?.name || 'Fee Head'}</TableCell>
                        <TableCell align="right">₹{item.netAmount}</TableCell>
                      </TableRow>
                    ))}
                    {(!selectedInvoice.items || selectedInvoice.items.length === 0) && (
                      <TableRow><TableCell colSpan={2}>Itemized details unavailable</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
                
                <Divider sx={{ my: 2 }} />
                
                <Grid container spacing={2}>
                  <Grid size={{ xs: 6 }}><Typography color="textSecondary">Subtotal</Typography></Grid>
                  <Grid size={{ xs: 6 }} sx={{ textAlign: 'right' }}><Typography>₹{selectedInvoice.subTotal || 0}</Typography></Grid>

                  <Grid size={{ xs: 6 }}><Typography color="textSecondary">Discounts</Typography></Grid>
                  <Grid size={{ xs: 6 }} sx={{ textAlign: 'right' }}><Typography color="success.main">- ₹{selectedInvoice.totalDiscount || 0}</Typography></Grid>

                  <Grid size={{ xs: 6 }}><Typography color="textSecondary">Late Fines</Typography></Grid>
                  <Grid size={{ xs: 6 }} sx={{ textAlign: 'right' }}><Typography color="error.main">+ ₹{selectedInvoice.totalLateFee || 0}</Typography></Grid>

                  <Grid size={{ xs: 6 }}><Typography sx={{ fontWeight: 'bold' }}>Grand Total</Typography></Grid>
                  <Grid size={{ xs: 6 }} sx={{ textAlign: 'right' }}><Typography sx={{ fontWeight: 'bold' }}>₹{selectedInvoice.grandTotal}</Typography></Grid>
                  
                  <Grid size={{ xs: 6 }}><Typography sx={{ fontWeight: 'bold' }}>Amount Paid</Typography></Grid>
                  <Grid size={{ xs: 6 }} sx={{ textAlign: 'right' }}><Typography sx={{ fontWeight: 'bold', color: 'success.main' }}>₹{selectedInvoice.amountPaid}</Typography></Grid>

                  <Grid size={{ xs: 6 }}><Typography sx={{ fontWeight: 'bold', color: 'error.main' }}>Balance Due</Typography></Grid>
                  <Grid size={{ xs: 12 }} sx={{ textAlign: 'center', mt: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: 'error.main' }}>₹{selectedInvoice.balanceDue}</Typography></Grid>
                </Grid>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDetailsOpen(false)}>Close</Button>
            {selectedInvoice?.balanceDue! > 0 && (
              <Button variant="contained" onClick={() => { setDetailsOpen(false); handlePayOnline(selectedInvoice!._id, selectedInvoice!.balanceDue); }}>
                Pay Now
              </Button>
            )}
          </DialogActions>
        </Dialog>

        {/* Razorpay Mock Checkout Dialog */}
        <Dialog open={rzpOpen} onClose={() => setRzpOpen(false)}>
          <DialogTitle>Razorpay Checkout (Dev Test)</DialogTitle>
          <DialogContent sx={{ minWidth: 300, mt: 1 }}>
            <Typography gutterBottom>You are initiating a payment for <strong>₹{currentOrder?.amount}</strong>.</Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              Order ID: {currentOrder?.razorpayOrderId}
            </Typography>
            <Typography variant="caption" color="warning.main">
              * This is a simulated checkout available only in development environments. In production, the Razorpay UI will open here.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setRzpOpen(false)} color="inherit">Cancel Payment</Button>
            <Button onClick={simulateRazorpaySuccess} variant="contained" color="primary">
              Simulate Success
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Layout>
  );
};

export default StudentFeeDashboard;
