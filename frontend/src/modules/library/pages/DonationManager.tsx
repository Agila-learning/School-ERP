import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Button, TextField, Chip, Dialog, DialogTitle,
  DialogContent, DialogActions, MenuItem, Select, FormControl, InputLabel,
  Grid, Alert, Divider, Accordion, AccordionSummary, AccordionDetails
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import api from '../../../core/api/axios';
import { format } from 'date-fns';

interface Donation {
  _id: string;
  donorName: string;
  donorContact?: string;
  donorEmail?: string;
  donationDate: string;
  books: any[];
  totalBooks: number;
  status: string;
  notes?: string;
  acknowledgedAt?: string;
}

const statusColors: any = { RECEIVED: 'default', UNDER_REVIEW: 'warning', ACCEPTED: 'success', PARTIALLY_ACCEPTED: 'info', REJECTED: 'error' };

const DonationManager: React.FC = () => {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [createDialog, setCreateDialog] = useState(false);
  const [form, setForm] = useState<any>({ books: [{ title: '', author: '', quantity: 1, condition: 'GOOD' }] });
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const fetchDonations = async () => {
    try {
      const res = await api.get('/library/donations');
      setDonations(res.data.data || []);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchDonations(); }, []);

  const addBook = () => setForm({ ...form, books: [...form.books, { title: '', quantity: 1, condition: 'GOOD' }] });
  const updateBook = (index: number, field: string, value: any) => {
    const books = [...form.books];
    books[index] = { ...books[index], [field]: value };
    setForm({ ...form, books });
  };
  const removeBook = (index: number) => setForm({ ...form, books: form.books.filter((_: any, i: number) => i !== index) });

  const handleCreate = async () => {
    setLoading(true);
    try {
      const totalBooks = form.books.reduce((a: number, b: any) => a + (Number(b.quantity) || 0), 0);
      await api.post('/library/donations', { ...form, totalBooks, donationDate: form.donationDate || new Date() });
      setAlert({ type: 'success', msg: 'Donation recorded successfully' });
      fetchDonations();
      setCreateDialog(false);
    } catch (e: any) {
      setAlert({ type: 'error', msg: e.response?.data?.message || 'Failed to record donation' });
    } finally { setLoading(false); }
  };

  const fmt = (d?: string) => { if (!d) return '—'; try { return format(new Date(d), 'dd MMM yyyy'); } catch { return d; } };

  const filtered = statusFilter ? donations.filter(d => d.status === statusFilter) : donations;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>Book Donations</Typography>
          <Typography variant="body2" color="text.secondary">Record and manage donated books</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => {
          setForm({ books: [{ title: '', quantity: 1, condition: 'GOOD' }], donationDate: format(new Date(), 'yyyy-MM-dd') });
          setCreateDialog(true);
        }}>
          Record Donation
        </Button>
      </Box>

      {alert && <Alert severity={alert.type} onClose={() => setAlert(null)} sx={{ mb: 2 }}>{alert.msg}</Alert>}

      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Status</InputLabel>
          <Select label="Status" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <MenuItem value="">All</MenuItem>
            {['RECEIVED', 'UNDER_REVIEW', 'ACCEPTED', 'PARTIALLY_ACCEPTED', 'REJECTED'].map(s => (
              <MenuItem key={s} value={s}>{s.replace('_', ' ')}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {filtered.map(d => (
        <Accordion key={d._id} variant="outlined" sx={{ mb: 1 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
              <VolunteerActivismIcon color="success" />
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontWeight: 'medium' }}>{d.donorName}</Typography>
                <Typography variant="caption" color="text.secondary">{fmt(d.donationDate)} • {d.totalBooks} book{d.totalBooks !== 1 ? 's' : ''}</Typography>
              </Box>
              <Chip label={d.status.replace('_', ' ')} size="small" color={statusColors[d.status] || 'default'} />
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" color="text.secondary">Contact: {d.donorContact || '—'}</Typography>
                <Typography variant="body2" color="text.secondary">Email: {d.donorEmail || '—'}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                {d.acknowledgedAt && <Typography variant="body2" color="success.main">✓ Acknowledged on {fmt(d.acknowledgedAt)}</Typography>}
                {d.notes && <Typography variant="body2" color="text.secondary">Notes: {d.notes}</Typography>}
              </Grid>
            </Grid>
            <Box sx={{ mt: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>Donated Books</Typography>
              {d.books.map((b, i) => (
                <Box key={i} sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 0.5 }}>
                  <Typography variant="body2" sx={{ flex: 2 }}>{b.title}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>{b.author || '—'}</Typography>
                  <Chip label={`Qty: ${b.quantity}`} size="small" />
                  <Chip label={b.condition} size="small" color={b.condition === 'NEW' ? 'success' : b.condition === 'DAMAGED' ? 'error' : 'default'} />
                </Box>
              ))}
            </Box>
          </AccordionDetails>
        </Accordion>
      ))}
      {filtered.length === 0 && (
        <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
          <VolunteerActivismIcon sx={{ fontSize: 48, color: 'text.disabled' }} />
          <Typography color="text.secondary" sx={{ mt: 1 }}>No donations found</Typography>
        </Paper>
      )}

      <Dialog open={createDialog} onClose={() => setCreateDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Record Book Donation</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Donor Information</Typography>
            <TextField label="Donor Name" value={form.donorName || ''} onChange={e => setForm({ ...form, donorName: e.target.value })} required fullWidth />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField label="Contact" value={form.donorContact || ''} onChange={e => setForm({ ...form, donorContact: e.target.value })} fullWidth />
              <TextField label="Email" value={form.donorEmail || ''} onChange={e => setForm({ ...form, donorEmail: e.target.value })} fullWidth />
            </Box>
            <TextField type="date" label="Donation Date" value={form.donationDate || ''} onChange={e => setForm({ ...form, donationDate: e.target.value })} fullWidth required slotProps={{ inputLabel: { shrink: true } }} />
            <TextField label="Library ID" value={form.libraryId || ''} onChange={e => setForm({ ...form, libraryId: e.target.value })} fullWidth helperText="Optional: associate with a specific library" />

            <Divider />
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Donated Books</Typography>
              <Button size="small" startIcon={<AddIcon />} onClick={addBook}>Add Book</Button>
            </Box>
            {form.books?.map((book: any, i: number) => (
              <Box key={i} sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                <TextField label="Title" value={book.title} onChange={e => updateBook(i, 'title', e.target.value)} required sx={{ flex: 2 }} />
                <TextField label="Author" value={book.author || ''} onChange={e => updateBook(i, 'author', e.target.value)} sx={{ flex: 1 }} />
                <TextField type="number" label="Qty" value={book.quantity} onChange={e => updateBook(i, 'quantity', Number(e.target.value))} sx={{ width: 80 }} slotProps={{ htmlInput: { min: 1 } }} />
                <FormControl sx={{ minWidth: 100 }}>
                  <InputLabel>Condition</InputLabel>
                  <Select label="Condition" value={book.condition || 'GOOD'} onChange={e => updateBook(i, 'condition', e.target.value)}>
                    {['NEW', 'GOOD', 'FAIR', 'DAMAGED'].map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                  </Select>
                </FormControl>
                {form.books.length > 1 && (
                  <Button size="small" color="error" onClick={() => removeBook(i)} sx={{ minWidth: 0, p: 1 }}>✕</Button>
                )}
              </Box>
            ))}
            <TextField label="Notes" value={form.notes || ''} onChange={e => setForm({ ...form, notes: e.target.value })} multiline rows={2} fullWidth />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate} disabled={loading}>Record Donation</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DonationManager;
