import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableHead, TableRow,
  Chip, TextField, MenuItem, Stack, Alert, CircularProgress, Button
} from '@mui/material';
import GetAppIcon from '@mui/icons-material/GetApp';
import axios from 'axios';

const transactionColors: Record<string, any> = {
  RECEIPT: 'success', ISSUE: 'error', RETURN: 'info',
  TRANSFER: 'warning', ADJUSTMENT: 'secondary', OPENING: 'primary'
};

const StockLedger: React.FC = () => {
  const [movements, setMovements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [typeFilter, setTypeFilter] = useState('');

  const fetchMovements = () => {
    setLoading(true);
    axios.get('/api/v1/inventory/stock-movements')
      .then(res => setMovements(res.data.data))
      .catch(() => setError('Failed to load stock ledger.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchMovements(); }, []);

  const filteredMovements = typeFilter ? movements.filter(m => m.transactionType === typeFilter) : movements;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>Stock Ledger</Typography>
        <Button variant="outlined" startIcon={<GetAppIcon />}>Export CSV</Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <TextField select label="Transaction Type" value={typeFilter} onChange={e => setTypeFilter(e.target.value)} size="small" sx={{ minWidth: 200 }}>
          <MenuItem value="">All Transactions</MenuItem>
          {['OPENING', 'RECEIPT', 'ISSUE', 'RETURN', 'TRANSFER', 'ADJUSTMENT'].map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
        </TextField>
      </Stack>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}><CircularProgress /></Box>
      ) : (
        <Paper>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Item SKU</TableCell>
                <TableCell>Warehouse</TableCell>
                <TableCell>Type</TableCell>
                <TableCell align="right">Qty</TableCell>
                <TableCell>Reference</TableCell>
                <TableCell>Performed By</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredMovements.length === 0 ? (
                <TableRow><TableCell colSpan={7} align="center">No transactions found.</TableCell></TableRow>
              ) : filteredMovements.map((m: any) => (
                <TableRow key={m._id} hover>
                  <TableCell>{new Date(m.createdAt).toLocaleString()}</TableCell>
                  <TableCell><code>{m.itemId?.sku || 'Unknown'}</code></TableCell>
                  <TableCell>{m.warehouseId?.name || 'Main Store'}</TableCell>
                  <TableCell><Chip label={m.transactionType} size="small" color={transactionColors[m.transactionType]} /></TableCell>
                  <TableCell align="right">
                    <Typography sx={{ fontWeight: 600 }} color={m.quantity > 0 ? 'success.main' : 'error.main'}>
                      {m.quantity > 0 ? `+${m.quantity}` : m.quantity}
                    </Typography>
                  </TableCell>
                  <TableCell>{m.referenceDocumentType || 'Manual'}</TableCell>
                  <TableCell>{m.performedBy?.firstName || 'System'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}
    </Box>
  );
};

export default StockLedger;
