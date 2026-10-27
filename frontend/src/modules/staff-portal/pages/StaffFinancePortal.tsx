import React, { useEffect, useState } from 'react';
import { 
  Box, Typography, Grid, Card, CardContent, Button, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip 
} from '@mui/material';
import api from '../../../core/api/axios';

const StaffFinancePortal: React.FC = () => {
  const [payslips, setPayslips] = useState<any[]>([]);
  const [reimbursements, setReimbursements] = useState<any[]>([]);
  const [advances, setAdvances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [psRes, rmRes, adRes] = await Promise.all([
        api.get('/staff-portal/finance/payslips'),
        api.get('/staff-portal/finance/reimbursements'),
        api.get('/staff-portal/finance/advances')
      ]);
      setPayslips(psRes.data?.data || []);
      setReimbursements(rmRes.data?.data || []);
      setAdvances(adRes.data?.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestAdvance = async () => {
    const amt = prompt('Enter advance amount requested:');
    const reason = prompt('Reason for advance:');
    if (amt && reason) {
      try {
        await api.post('/staff-portal/finance/advances', { amount: Number(amt), reason });
        alert('Advance requested successfully!');
        fetchData();
      } catch (err: any) {
        alert('Failed to request advance: ' + err.response?.data?.message);
      }
    }
  };

  const handleClaimReimbursement = async () => {
    const type = prompt('Expense Type (TRAVEL/MEDICAL/MEAL/OFFICE_SUPPLIES/OTHER):', 'TRAVEL');
    const amt = prompt('Amount:');
    const desc = prompt('Description:');
    if (type && amt && desc) {
      try {
        await api.post('/staff-portal/finance/reimbursements', { 
          expenseType: type, amount: Number(amt), description: desc 
        });
        alert('Claim submitted successfully!');
        fetchData();
      } catch (err: any) {
        alert('Failed to submit claim: ' + err.response?.data?.message);
      }
    }
  };

  if (loading) return <Box sx={{ p: 4 }}>Loading finance data...</Box>;

  return (
    <Box sx={{ p: 4, backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>My Finance & Payroll</Typography>

      <Grid container spacing={4}>
        {/* Payslips Section */}
        <Grid size={{ xs: 12 }}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>My Payslips</Typography>
              <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e0e0e0' }}>
                <Table>
                  <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                    <TableRow>
                      <TableCell>Period</TableCell>
                      <TableCell>Payslip Number</TableCell>
                      <TableCell align="right">Gross</TableCell>
                      <TableCell align="right">Deductions</TableCell>
                      <TableCell align="right">Net Salary</TableCell>
                      <TableCell align="center">Status</TableCell>
                      <TableCell align="center">Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {payslips.map(ps => (
                      <TableRow key={ps._id}>
                        <TableCell>{ps.payrollPeriodId?.month}/{ps.payrollPeriodId?.year}</TableCell>
                        <TableCell>{ps.payslipNumber}</TableCell>
                        <TableCell align="right">₹ {ps.totalEarnings}</TableCell>
                        <TableCell align="right" sx={{ color: 'error.main' }}>₹ {ps.totalDeductions}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>₹ {ps.netSalary}</TableCell>
                        <TableCell align="center"><Chip size="small" label={ps.status} color="success" /></TableCell>
                        <TableCell align="center"><Button size="small" variant="outlined">Download</Button></TableCell>
                      </TableRow>
                    ))}
                    {payslips.length === 0 && (
                      <TableRow><TableCell colSpan={7} align="center">No payslips found</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Reimbursements & Advances */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.03)', height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Reimbursement Claims</Typography>
                <Button variant="contained" size="small" onClick={handleClaimReimbursement}>+ New Claim</Button>
              </Box>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {reimbursements.map(rm => (
                      <TableRow key={rm._id}>
                        <TableCell>{new Date(rm.claimDate).toLocaleDateString()}</TableCell>
                        <TableCell>{rm.expenseType}</TableCell>
                        <TableCell>₹ {rm.amount}</TableCell>
                        <TableCell><Chip size="small" label={rm.status} /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.03)', height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Salary Advances</Typography>
                <Button variant="contained" size="small" onClick={handleRequestAdvance}>+ Request Advance</Button>
              </Box>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Requested</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Outstanding</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {advances.map(adv => (
                      <TableRow key={adv._id}>
                        <TableCell>{new Date(adv.requestDate).toLocaleDateString()}</TableCell>
                        <TableCell>₹ {adv.amount}</TableCell>
                        <TableCell sx={{ color: 'error.main' }}>₹ {adv.outstandingBalance}</TableCell>
                        <TableCell><Chip size="small" label={adv.status} /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

      </Grid>
    </Box>
  );
};

export default StaffFinancePortal;
