import React, { useEffect, useState } from 'react';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, CircularProgress, Button, Chip
} from '@mui/material';
import { getGradeSystems } from '../api/examination.api';
import type { GradeSystem } from '../api/examination.api';

const GradeSystemManager: React.FC = () => {
  const [systems, setSystems] = useState<GradeSystem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getGradeSystems().then(data => {
      setSystems(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress /></Box>;

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1000, mx: 'auto' }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>Grade Systems</Typography>
          <Typography variant="body1" color="text.secondary">
            Configure the grading rules, bounds, and grade points for report cards.
          </Typography>
        </Box>
        <Button variant="outlined">Create New Scale</Button>
      </Box>

      {systems.map(sys => (
        <Paper key={sys.id} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, mb: 4, overflow: 'hidden' }}>
          <Box sx={{ p: 2, bgcolor: 'grey.50', borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>{sys.name}</Typography>
            <Button size="small">Edit</Button>
          </Box>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Grade</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Percentage Range</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Grade Point</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Pass/Fail</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sys.rules.map((rule, idx) => (
                  <TableRow key={idx}>
                    <TableCell><Typography variant="body2" sx={{ fontWeight: 800 }}>{rule.name}</Typography></TableCell>
                    <TableCell>{rule.minPercentage}% – {rule.maxPercentage}%</TableCell>
                    <TableCell>{rule.gradePoint.toFixed(1)}</TableCell>
                    <TableCell>
                      <Chip 
                        label={rule.isPassing ? 'PASS' : 'FAIL'} 
                        size="small" 
                        color={rule.isPassing ? 'success' : 'error'} 
                        variant="outlined"
                        sx={{ height: 20, fontSize: '0.7rem' }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      ))}
    </Box>
  );
};

export default GradeSystemManager;
