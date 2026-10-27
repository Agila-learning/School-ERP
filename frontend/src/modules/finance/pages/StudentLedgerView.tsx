import React, { useState, useEffect } from 'react';
import { getStudentLedger } from '../api/finance.api';
import { getStudents, type StudentSummary } from '../../students/api/student.api';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Button, TextField, CardContent, Autocomplete } from '@mui/material';
import Layout from '../../../core/components/Layout';

const StudentLedgerView: React.FC = () => {
  const [selectedStudent, setSelectedStudent] = useState<StudentSummary | null>(null);
  const [students, setStudents] = useState<StudentSummary[]>([]);
  const [ledger, setLedger] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getStudents().then(setStudents);
  }, []);

  const handleSearch = async () => {
    if (!selectedStudent) return;
    setLoading(true);
    try {
      const data = await getStudentLedger(selectedStudent.id);
      setLedger(data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <Layout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'text.primary', mb: 3 }}>
          Student Ledger
        </Typography>

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
                <Button variant="contained" fullWidth onClick={handleSearch} disabled={loading || !selectedStudent}>{loading ? 'Searching...' : 'View Ledger'}</Button>
              </Box>
            </Box>
          </CardContent>
        </Paper>

        <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Reference</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell align="right">Charge (Debit)</TableCell>
                  <TableCell align="right">Payment (Credit)</TableCell>
                  <TableCell align="right">Balance</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {ledger.map((t, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{new Date(t.date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Chip label={t.type} size="small" color={t.type === 'PAYMENT' ? 'success' : (t.type === 'CHARGE' ? 'error' : 'warning')} />
                    </TableCell>
                    <TableCell>{t.reference}</TableCell>
                    <TableCell>{t.description}</TableCell>
                    <TableCell align="right">₹{t.debit > 0 ? t.debit : '-'}</TableCell>
                    <TableCell align="right">₹{t.credit > 0 ? t.credit : '-'}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>₹{t.balance}</TableCell>
                  </TableRow>
                ))}
                {ledger.length === 0 && (
                  <TableRow><TableCell colSpan={7} align="center">No transactions found for this student.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>
    </Layout>
  );
};

export default StudentLedgerView;
