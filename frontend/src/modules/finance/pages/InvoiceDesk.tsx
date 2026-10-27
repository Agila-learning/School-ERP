import React, { useState, useEffect } from 'react';
import { getStudentInvoices, initiateOfflinePayment, generateInvoices, addFine } from '../api/finance.api';
import type { Invoice } from '../api/finance.api';
import { getStudents, type StudentSummary } from '../../students/api/student.api';
import { getAcademicYears, getClasses, getBranches } from '../../academic/api/academic.api';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Button, TextField, IconButton, CardContent, Dialog, DialogTitle, DialogContent, DialogActions, Autocomplete, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import Layout from '../../../core/components/Layout';
import PaymentIcon from '@mui/icons-material/Payment';

const InvoiceDesk: React.FC = () => {
  const [selectedStudent, setSelectedStudent] = useState<StudentSummary | null>(null);
  const [students, setStudents] = useState<StudentSummary[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Bulk Gen State
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkData, setBulkData] = useState({ academicYearId: '', branchId: '', classId: '', dueDate: '' });
  const [generating, setGenerating] = useState(false);
  
  // Lookups
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);

  useEffect(() => {
    // Initial fetches
    getStudents().then(setStudents);
    getAcademicYears().then(res => setAcademicYears(res || []));
    getBranches().then(res => setBranches(res || []));
    getClasses().then(res => setClasses(res || []));
  }, []);

  const handleSearch = async () => {
    if (!selectedStudent) return;
    setLoading(true);
    try {
      const data = await getStudentInvoices(selectedStudent.id);
      setInvoices(data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handlePay = async (invoiceId: string, balanceDue: number) => {
    if (balanceDue <= 0) {
      alert("Invoice already paid in full.");
      return;
    }
    const amtStr = prompt(`Enter amount to pay (Balance: ${balanceDue}):`, balanceDue.toString());
    if (!amtStr) return;
    const amount = parseFloat(amtStr);
    if (isNaN(amount) || amount <= 0) return;
    
    try {
      await initiateOfflinePayment(invoiceId, amount, 'CASH', 'CASH-' + Date.now());
      alert('Offline payment initiated successfully!');
      handleSearch();
    } catch (err: any) {
      alert('Error initiating payment: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleAddFine = async (invoiceId: string) => {
    const amtStr = prompt('Enter late fine amount to add:');
    if (!amtStr) return;
    const amount = parseFloat(amtStr);
    if (isNaN(amount) || amount <= 0) return;
    
    const reason = prompt('Enter reason for fine:', 'Late Payment Fee');
    if (!reason) return;
    
    try {
      await addFine(invoiceId, amount, reason);
      alert('Fine added successfully!');
      handleSearch();
    } catch (err: any) {
      alert('Error adding fine: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleBulkGenerate = async () => {
    if (!bulkData.academicYearId || !bulkData.branchId || !bulkData.classId || !bulkData.dueDate) {
      alert("Please fill all fields.");
      return;
    }
    setGenerating(true);
    try {
      await generateInvoices(bulkData.academicYearId, bulkData.branchId, bulkData.classId, bulkData.dueDate);
      alert("Invoices generated successfully.");
      setBulkOpen(false);
    } catch (err: any) {
      alert("Error generating invoices: " + (err.response?.data?.message || err.message));
    }
    setGenerating(false);
  };

  return (
    <Layout>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
            Invoice Desk
          </Typography>
          <Button variant="contained" color="secondary" onClick={() => setBulkOpen(true)}>
            Generate Bulk Invoices
          </Button>
        </Box>

        <Paper elevation={0} sx={{ p: 2, mb: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
          <CardContent>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
              <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 60%' } }}>
                <Autocomplete
                  options={students}
                  getOptionLabel={(option) => `${option.firstName} ${option.lastName} (${option.studentIdNumber})`}
                  value={selectedStudent}
                  onChange={(_, newValue) => setSelectedStudent(newValue)}
                  renderInput={(params) => <TextField {...params} label="Search Student" size="small" />}
                />
              </Box>
              <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 20%' } }}>
                <Button variant="contained" fullWidth onClick={handleSearch} disabled={loading || !selectedStudent}>{loading ? 'Searching...' : 'Search'}</Button>
              </Box>
            </Box>
          </CardContent>
        </Paper>

        <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Invoice #</TableCell>
                  <TableCell>Student ID</TableCell>
                  <TableCell>Total Amount</TableCell>
                  <TableCell>Paid</TableCell>
                  <TableCell>Balance Due</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Due Date</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {invoices.map((inv) => (
                  <TableRow key={inv._id}>
                    <TableCell>{inv.invoiceNumber}</TableCell>
                    <TableCell>{inv.studentId}</TableCell>
                    <TableCell>₹{inv.grandTotal}</TableCell>
                    <TableCell>₹{inv.amountPaid}</TableCell>
                    <TableCell>₹{inv.balanceDue}</TableCell>
                    <TableCell><Chip label={inv.status} color={inv.status === 'PAID' ? 'success' : (inv.status === 'OVERDUE' ? 'error' : 'warning')} size="small" /></TableCell>
                    <TableCell>{new Date(inv.dueDate).toLocaleDateString()}</TableCell>
                    <TableCell align="right">
                      <Button size="small" variant="outlined" color="error" sx={{ mr: 1 }} onClick={() => handleAddFine(inv._id)}>Fine</Button>
                      <IconButton size="small" color="success" title="Collect Payment" onClick={() => handlePay(inv._id, inv.balanceDue)}><PaymentIcon /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {invoices.length === 0 && (
                  <TableRow><TableCell colSpan={8} align="center">No invoices found for selected student.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        <Dialog open={bulkOpen} onClose={() => setBulkOpen(false)}>
          <DialogTitle>Generate Bulk Invoices for Class</DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2, minWidth: 400 }}>
            <FormControl size="small">
              <InputLabel>Academic Year</InputLabel>
              <Select label="Academic Year" value={bulkData.academicYearId} onChange={e => setBulkData({ ...bulkData, academicYearId: e.target.value })}>
                {academicYears.map(y => <MenuItem key={y._id} value={y._id}>{y.name}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl size="small">
              <InputLabel>Branch</InputLabel>
              <Select label="Branch" value={bulkData.branchId} onChange={e => setBulkData({ ...bulkData, branchId: e.target.value })}>
                {branches.map(b => <MenuItem key={b._id} value={b._id}>{b.name}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl size="small">
              <InputLabel>Class</InputLabel>
              <Select label="Class" value={bulkData.classId} onChange={e => setBulkData({ ...bulkData, classId: e.target.value })}>
                {classes.map(c => <MenuItem key={c._id} value={c._id}>{c.name}</MenuItem>)}
              </Select>
            </FormControl>
            <TextField label="Due Date" type="date" slotProps={{ inputLabel: { shrink: true } }} size="small" value={bulkData.dueDate} onChange={(e) => setBulkData({...bulkData, dueDate: e.target.value})} />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setBulkOpen(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleBulkGenerate} disabled={generating}>{generating ? 'Generating...' : 'Generate'}</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Layout>
  );
};

export default InvoiceDesk;
