import React, { useEffect, useState } from 'react';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Chip, CircularProgress, Button
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PublicIcon from '@mui/icons-material/Public';
import { getStudentResults } from '../api/examination.api';
import type { StudentResult } from '../api/examination.api';

const ResultVerificationBoard: React.FC = () => {
  const [results, setResults] = useState<StudentResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Show results that need review or are published
    getStudentResults({}).then(data => {
      setResults(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress /></Box>;

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1400, mx: 'auto' }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>Result Verification & Publishing</Typography>
          <Typography variant="body1" color="text.secondary">
            Review calculated student results, apply locking rules, and publish to the student portal.
          </Typography>
        </Box>
        <Button variant="contained" color="success" startIcon={<PublicIcon />} disableElevation>
          Publish All Reviewed
        </Button>
      </Box>

      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: 'grey.50' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Student</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Class & Section</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Marks</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>% / Grade</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {results.map(res => (
                <TableRow key={res.id} hover>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{res.studentName}</Typography>
                    <Typography variant="caption" color="text.secondary">{res.studentId}</Typography>
                  </TableCell>
                  <TableCell>{res.className} - {res.sectionName}</TableCell>
                  <TableCell>{res.totalObtained} / {res.totalMaxMarks}</TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{res.percentage.toFixed(1)}%</Typography>
                    <Typography variant="caption" color="text.secondary">Grade {res.overallGrade}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={res.status} 
                      size="small" 
                      color={res.status === 'PUBLISHED' ? 'success' : res.status === 'REVIEWED' ? 'primary' : 'warning'}
                      variant="outlined" 
                    />
                  </TableCell>
                  <TableCell align="right">
                    {res.status !== 'PUBLISHED' && (
                      <Button size="small" variant="text" color="primary" startIcon={<CheckCircleIcon />}>Review</Button>
                    )}
                    <Button size="small" variant="text">Details</Button>
                  </TableCell>
                </TableRow>
              ))}
              {results.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 3 }}>No results available for verification.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default ResultVerificationBoard;
