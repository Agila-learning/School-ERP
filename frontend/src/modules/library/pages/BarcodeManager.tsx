import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Button, TextField, Chip, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Dialog, DialogTitle,
  DialogContent, DialogActions, MenuItem, Select, FormControl, InputLabel,
  Card, CardContent, Grid, Alert, CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import SearchIcon from '@mui/icons-material/Search';
import api from '../../../core/api/axios';

interface BookCopy {
  _id: string;
  bookId: any;
  accessionNumber: string;
  barcode?: string;
  qrCode?: string;
  status: string;
  condition: string;
  sectionId?: any;
  purchaseDate?: string;
  purchasePrice?: number;
}

const statusColors: any = { AVAILABLE: 'success', ISSUED: 'primary', RESERVED: 'warning', LOST: 'error', DAMAGED: 'error', UNDER_REPAIR: 'warning', REFERENCE_ONLY: 'info' };

const BarcodeManager: React.FC = () => {
  const [copies, setCopies] = useState<BookCopy[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedCopy, setSelectedCopy] = useState<BookCopy | null>(null);
  const [viewDialog, setViewDialog] = useState(false);
  const [addDialog, setAddDialog] = useState(false);
  const [form, setForm] = useState<any>({ condition: 'NEW', status: 'AVAILABLE' });
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const fetchCopies = async () => {
    try {
      const res = await api.get('/library/copies');
      setCopies(res.data.data || []);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchCopies(); }, []);

  const handleAdd = async () => {
    setLoading(true);
    try {
      await api.post('/library/copies', form);
      setAlert({ type: 'success', msg: 'Book copy added' });
      fetchCopies();
      setAddDialog(false);
    } catch (e: any) {
      setAlert({ type: 'error', msg: e.response?.data?.message || 'Failed to add copy' });
    } finally { setLoading(false); }
  };

  const filteredCopies = copies.filter(c => {
    const matchSearch = !search || c.accessionNumber.toLowerCase().includes(search.toLowerCase()) ||
      (c.barcode || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.bookId?.title || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const copiesWithQR = copies.filter(c => c.qrCode).length;
  const copiesWithBarcode = copies.filter(c => c.barcode).length;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>Barcode Manager</Typography>
          <Typography variant="body2" color="text.secondary">Manage accession numbers, barcodes, and QR codes for book copies</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setForm({ condition: 'NEW', status: 'AVAILABLE' }); setAddDialog(true); }}>
          Add Book Copy
        </Button>
      </Box>

      {alert && <Alert severity={alert.type} onClose={() => setAlert(null)} sx={{ mb: 2 }}>{alert.msg}</Alert>}

      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card variant="outlined"><CardContent>
            <Typography variant="body2" color="text.secondary">Total Copies</Typography>
            <Typography variant="h3" sx={{ fontWeight: 'bold' }}>{copies.length}</Typography>
          </CardContent></Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card variant="outlined"><CardContent>
            <Typography variant="body2" color="text.secondary">With QR Code</Typography>
            <Typography variant="h3" color="primary.main" sx={{ fontWeight: 'bold' }}>{copiesWithQR}</Typography>
          </CardContent></Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card variant="outlined"><CardContent>
            <Typography variant="body2" color="text.secondary">With Barcode</Typography>
            <Typography variant="h3" color="success.main" sx={{ fontWeight: 'bold' }}>{copiesWithBarcode}</Typography>
          </CardContent></Card>
        </Grid>
      </Grid>

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField size="small" placeholder="Search title or barcode..." value={search} onChange={e => setSearch(e.target.value)} slotProps={{ input: { startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} /> } }} sx={{ flex: 1 }} />
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Status</InputLabel>
          <Select label="Status" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <MenuItem value="">All</MenuItem>
            {['AVAILABLE', 'ISSUED', 'RESERVED', 'LOST', 'DAMAGED', 'UNDER_REPAIR', 'REFERENCE_ONLY'].map(s => (
              <MenuItem key={s} value={s}>{s.replace('_', ' ')}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: 'grey.50' }}>
              <TableCell>Accession #</TableCell><TableCell>Book Title</TableCell><TableCell>Barcode</TableCell>
              <TableCell>QR</TableCell><TableCell>Condition</TableCell><TableCell>Status</TableCell><TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredCopies.map(copy => (
              <TableRow key={copy._id} hover>
                <TableCell><Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 'medium' }}>{copy.accessionNumber}</Typography></TableCell>
                <TableCell><Typography variant="body2">{copy.bookId?.title || '—'}</Typography></TableCell>
                <TableCell><Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'monospace', fontSize: 11 }}>{copy.barcode || '—'}</Typography></TableCell>
                <TableCell>{copy.qrCode ? <QrCode2Icon color="primary" fontSize="small" /> : <Typography variant="caption" color="text.disabled">—</Typography>}</TableCell>
                <TableCell><Chip label={copy.condition} size="small" variant="outlined" /></TableCell>
                <TableCell><Chip label={copy.status} size="small" color={statusColors[copy.status] || 'default'} /></TableCell>
                <TableCell>
                  {copy.qrCode && (
                    <Button size="small" startIcon={<QrCode2Icon />}
                      onClick={() => { setSelectedCopy(copy); setViewDialog(true); }}>
                      View QR
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {filteredCopies.length === 0 && !loading && <TableRow><TableCell colSpan={7}><Typography color="text.secondary" variant="body2" align="center" sx={{ py: 4 }}>No copies found.</Typography></TableCell></TableRow>}
          </TableBody>
        </Table>
      </TableContainer>

      {/* View QR Dialog */}
      <Dialog open={viewDialog} onClose={() => setViewDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>QR Code — {selectedCopy?.accessionNumber}</DialogTitle>
        <DialogContent>
          {loading ? <Box sx={{ textAlign: 'center', py: 4 }}><CircularProgress /></Box> : (
          <Box sx={{ textAlign: 'center', py: 2 }}>
            {selectedCopy?.qrCode && (
              <img src={selectedCopy.qrCode} alt={`QR for ${selectedCopy.accessionNumber}`} style={{ maxWidth: 200, maxHeight: 200 }} />
            )}
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>{selectedCopy?.accessionNumber}</Typography>
            <Typography variant="caption" color="text.secondary">{selectedCopy?.bookId?.title}</Typography>
          </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Add Copy Dialog */}
      <Dialog open={addDialog} onClose={() => setAddDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Book Copy</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField label="Book Title ID" value={form.bookId || ''} onChange={e => setForm({ ...form, bookId: e.target.value })} required fullWidth helperText="The _id of the book catalogue entry" />
            <TextField label="Accession Number" value={form.accessionNumber || ''} onChange={e => setForm({ ...form, accessionNumber: e.target.value })} required fullWidth helperText="Auto-generates QR code and barcode" />
            <TextField label="Library ID" value={form.libraryId || ''} onChange={e => setForm({ ...form, libraryId: e.target.value })} fullWidth />
            <TextField label="Section ID (optional)" value={form.sectionId || ''} onChange={e => setForm({ ...form, sectionId: e.target.value })} fullWidth />
            <TextField type="number" label="Purchase Price" value={form.purchasePrice || ''} onChange={e => setForm({ ...form, purchasePrice: Number(e.target.value) })} fullWidth />
            <FormControl fullWidth>
              <InputLabel>Condition</InputLabel>
              <Select label="Condition" value={form.condition || 'NEW'} onChange={e => setForm({ ...form, condition: e.target.value })}>
                {['NEW', 'GOOD', 'FAIR', 'DAMAGED'].map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAdd} disabled={loading}>Add Copy</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BarcodeManager;
