import React, { useState } from 'react';
import { Box, Typography, Paper, Grid, TextField, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Divider } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';

export const JournalEntryDesk: React.FC = () => {
  const [lines, setLines] = useState([
    { id: 1, account: '', debit: 0, credit: 0, description: '' },
    { id: 2, account: '', debit: 0, credit: 0, description: '' },
  ]);

  const totalDebit = lines.reduce((acc, line) => acc + Number(line.debit || 0), 0);
  const totalCredit = lines.reduce((acc, line) => acc + Number(line.credit || 0), 0);
  const isBalanced = totalDebit === totalCredit && totalDebit > 0;

  const addLine = () => setLines([...lines, { id: Date.now(), account: '', debit: 0, credit: 0, description: '' }]);
  
  const removeLine = (id: number) => {
    if (lines.length > 2) {
      setLines(lines.filter(l => l.id !== id));
    }
  };

  const updateLine = (id: number, field: string, value: string | number) => {
    setLines(lines.map(l => l.id === id ? { ...l, [field]: value } : l));
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>Journal Entry</Typography>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
        Create manual double-entry accounting journals
      </Typography>

      <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField fullWidth label="Journal Number" defaultValue="JE-MAN-001" disabled size="small" />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField fullWidth type="date" label="Date" defaultValue="2026-08-08" slotProps={{ inputLabel: { shrink: true } }} size="small" />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField fullWidth label="Reference" placeholder="e.g. Inv#123" size="small" />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField fullWidth label="Description" placeholder="Journal entry description..." size="small" />
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        <TableContainer sx={{ mb: 3 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell width="30%"><strong>Account</strong></TableCell>
                <TableCell width="30%"><strong>Description</strong></TableCell>
                <TableCell width="15%" align="right"><strong>Debit (₹)</strong></TableCell>
                <TableCell width="15%" align="right"><strong>Credit (₹)</strong></TableCell>
                <TableCell width="10%"></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {lines.map((line) => (
                <TableRow key={line.id}>
                  <TableCell>
                    <TextField fullWidth size="small" placeholder="Select Account" value={line.account} onChange={(e) => updateLine(line.id, 'account', e.target.value)} />
                  </TableCell>
                  <TableCell>
                    <TextField fullWidth size="small" placeholder="Line description" value={line.description} onChange={(e) => updateLine(line.id, 'description', e.target.value)} />
                  </TableCell>
                  <TableCell align="right">
                    <TextField type="number" size="small" value={line.debit} onChange={(e) => updateLine(line.id, 'debit', e.target.value)} />
                  </TableCell>
                  <TableCell align="right">
                    <TextField type="number" size="small" value={line.credit} onChange={(e) => updateLine(line.id, 'credit', e.target.value)} />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton color="error" onClick={() => removeLine(line.id)} disabled={lines.length <= 2}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {/* Totals Row */}
              <TableRow>
                <TableCell colSpan={2} align="right"><strong>Total</strong></TableCell>
                <TableCell align="right">
                      <Typography sx={{ fontWeight: 'bold', color: isBalanced ? 'success.main' : 'error.main' }}>
                        ₹{totalDebit}
                      </Typography>
                </TableCell>
                <TableCell align="right">
                      <Typography sx={{ fontWeight: 'bold', color: isBalanced ? 'success.main' : 'error.main' }}>
                        ₹{totalCredit}
                      </Typography>
                </TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button startIcon={<AddIcon />} onClick={addLine}>Add Line</Button>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            {!isBalanced && (
              <Typography color="error.main" variant="body2">Journal is out of balance by ₹{Math.abs(totalDebit - totalCredit)}</Typography>
            )}
            <Button variant="contained" color="primary" startIcon={<SaveIcon />} disabled={!isBalanced}>
              Post Journal
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default JournalEntryDesk;
