import React, { useState } from 'react';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Button, Chip, Dialog, DialogTitle, DialogContent, 
  DialogActions, TextField 
} from '@mui/material';

const ResultApproval: React.FC = () => {
  const [open, setOpen] = useState(false);

  const [results, setResults] = useState<any[]>([]);

  React.useEffect(() => {
    // In full implementation, fetch results requiring approval
    setResults([]);
  }, []);

  return (
    <Box sx={{ p: 3, maxWidth: 1000, mx: 'auto' }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>Pending Result Approvals</Typography>
        <Typography variant="body2" color="text.secondary">Review and approve processed results before publishing</Typography>
      </Box>

      <Paper variant="outlined">
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: 'grey.50' }}>
              <TableRow>
                <TableCell>Class & Section</TableCell>
                <TableCell>Exam</TableCell>
                <TableCell>Students</TableCell>
                <TableCell>Pass / Fail</TableCell>
                <TableCell>Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {results.map((r, i) => (
                <TableRow key={i} hover>
                  <TableCell sx={{ fontWeight: 'medium' }}>{r.class}</TableCell>
                  <TableCell>{r.exam}</TableCell>
                  <TableCell>{r.students}</TableCell>
                  <TableCell>
                    <Typography component="span" color="success.main" sx={{ fontWeight: 'bold' }}>{r.pass}</Typography> / <Typography component="span" color="error.main" sx={{ fontWeight: 'bold' }}>{r.fail}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={r.status} size="small" color={r.status === 'APPROVED' ? 'success' : 'warning'} />
                  </TableCell>
                  <TableCell align="right">
                    <Button size="small" color="primary" onClick={() => setOpen(true)} disabled={r.status === 'APPROVED'}>Review</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Approve Results: Grade 10 - Section A</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>Are you sure you want to approve these results?</Typography>
          <TextField label="Approval Remarks" multiline rows={3} fullWidth />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" color="success">Approve Results</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ResultApproval;
