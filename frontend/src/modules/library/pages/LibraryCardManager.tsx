import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Button, TextField, Chip, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Dialog, DialogTitle,
  DialogContent, DialogActions, MenuItem, Select, FormControl, InputLabel,
  IconButton, Tooltip, Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import BlockIcon from '@mui/icons-material/Block';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import api from '../../../core/api/axios';
import { format } from 'date-fns';


interface LibraryCard {
  _id: string;
  cardNumber: string;
  userId: any;
  membershipId: any;
  memberType: string;
  validFrom: string;
  validUntil: string;
  issuedDate: string;
  status: string;
  blockedReason?: string;
}

const statusColors: any = {
  ACTIVE: 'success', EXPIRED: 'default', BLOCKED: 'error', LOST: 'warning', REPLACED: 'info', CANCELLED: 'default'
};

const LibraryCardManager: React.FC = () => {
  const [cards, setCards] = useState<LibraryCard[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [issueDialog, setIssueDialog] = useState(false);
  const [blockDialog, setBlockDialog] = useState<{ open: boolean; card: LibraryCard | null }>({ open: false, card: null });
  const [replaceDialog, setReplaceDialog] = useState<{ open: boolean; card: LibraryCard | null }>({ open: false, card: null });
  const [form, setForm] = useState<any>({});
  const [blockReason, setBlockReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const fetchCards = async () => {
    try {
      const params: any = {};
      if (statusFilter) params.status = statusFilter;
      const res = await api.get('/library/cards', { params });
      setCards(res.data.data || []);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchCards(); }, [statusFilter]);

  const handleIssue = async () => {
    setLoading(true);
    try {
      await api.post('/library/cards', { ...form, validFrom: new Date(), validUntil: new Date(Date.now() + 365 * 86400000) });
      setAlert({ type: 'success', msg: 'Library card issued successfully' });
      fetchCards();
      setIssueDialog(false);
    } catch (e: any) {
      setAlert({ type: 'error', msg: e.response?.data?.message || 'Failed to issue card' });
    } finally { setLoading(false); }
  };

  const handleBlock = async () => {
    if (!blockDialog.card) return;
    setLoading(true);
    try {
      await api.patch(`/library/cards/${blockDialog.card._id}/block`, { reason: blockReason });
      setAlert({ type: 'success', msg: 'Card blocked successfully' });
      fetchCards();
      setBlockDialog({ open: false, card: null });
    } catch (e) { setAlert({ type: 'error', msg: 'Failed to block card' }); }
    finally { setLoading(false); }
  };

  const handleReplace = async () => {
    if (!replaceDialog.card) return;
    setLoading(true);
    try {
      await api.patch(`/library/cards/${replaceDialog.card._id}/replace`, form);
      setAlert({ type: 'success', msg: 'Card replaced successfully' });
      fetchCards();
      setReplaceDialog({ open: false, card: null });
    } catch (e) { setAlert({ type: 'error', msg: 'Failed to replace card' }); }
    finally { setLoading(false); }
  };

  const filteredCards = cards.filter(c => {
    const name = `${c.userId?.firstName || ''} ${c.userId?.lastName || ''} ${c.cardNumber}`.toLowerCase();
    return name.includes(search.toLowerCase());
  });

  const fmt = (d: string) => { try { return format(new Date(d), 'dd MMM yyyy'); } catch { return d; } };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>Library Card Manager</Typography>
          <Typography variant="body2" color="text.secondary">Issue, block, and replace library membership cards</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setForm({}); setIssueDialog(true); }}>
          Issue New Card
        </Button>
      </Box>

      {alert && <Alert severity={alert.type} onClose={() => setAlert(null)} sx={{ mb: 2 }}>{alert.msg}</Alert>}

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField size="small" placeholder="Search by name or card number..." value={search}
          onChange={e => setSearch(e.target.value)} sx={{ flex: 1 }} />
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Status</InputLabel>
          <Select label="Status" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <MenuItem value="">All</MenuItem>
            {['ACTIVE', 'EXPIRED', 'BLOCKED', 'LOST', 'REPLACED', 'CANCELLED'].map(s => (
              <MenuItem key={s} value={s}>{s}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'grey.50' }}>
              <TableCell>Card Number</TableCell>
              <TableCell>Member</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Valid Until</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredCards.map(card => (
              <TableRow key={card._id} hover>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <QrCodeScannerIcon fontSize="small" color="action" />
                    <Typography variant="body2" sx={{ fontWeight: 'bold', fontFamily: 'monospace' }}>{card.cardNumber}</Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{card.userId?.firstName} {card.userId?.lastName}</Typography>
                </TableCell>
                <TableCell><Chip label={card.memberType} size="small" variant="outlined" /></TableCell>
                <TableCell>
                  <Typography variant="body2" color={new Date(card.validUntil) < new Date() ? 'error' : 'text.primary'}>
                    {fmt(card.validUntil)}
                  </Typography>
                </TableCell>
                <TableCell><Chip label={card.status} size="small" color={statusColors[card.status] || 'default'} /></TableCell>
                <TableCell align="right">
                  {card.status === 'ACTIVE' && <>
                    <Tooltip title="Block Card">
                      <IconButton size="small" color="error" onClick={() => { setBlockReason(''); setBlockDialog({ open: true, card }); }}>
                        <BlockIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Replace Card">
                      <IconButton size="small" onClick={() => { setForm({}); setReplaceDialog({ open: true, card }); }}>
                        <SwapHorizIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </>}
                </TableCell>
              </TableRow>
            ))}
            {filteredCards.length === 0 && <TableRow><TableCell colSpan={6}><Typography variant="body2" color="text.secondary" align="center" sx={{ py: 3 }}>No library cards found.</Typography></TableCell></TableRow>}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Issue Dialog */}
      <Dialog open={issueDialog} onClose={() => setIssueDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Issue Library Card</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField label="User ID / Student / Staff ID" value={form.userId || ''} onChange={e => setForm({ ...form, userId: e.target.value })} required fullWidth helperText="Enter user or member ID" />
            <TextField label="Membership ID (Optional)" value={form.membershipId || ''} onChange={e => setForm({ ...form, membershipId: e.target.value })} fullWidth helperText="Leave blank to auto-create membership" />
            <FormControl fullWidth required>
              <InputLabel>Member Type</InputLabel>
              <Select label="Member Type" value={form.memberType || 'STUDENT'} onChange={e => setForm({ ...form, memberType: e.target.value })}>
                {['STUDENT', 'TEACHER', 'STAFF', 'ADMINISTRATOR', 'OTHER'].map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
              </Select>
            </FormControl>
            <TextField label="Library ID (Optional)" value={form.libraryId || ''} onChange={e => setForm({ ...form, libraryId: e.target.value })} fullWidth helperText="Leave blank for main library" />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIssueDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleIssue} disabled={loading}>Issue Card</Button>
        </DialogActions>
      </Dialog>

      {/* Block Dialog */}
      <Dialog open={blockDialog.open} onClose={() => setBlockDialog({ open: false, card: null })} maxWidth="sm" fullWidth>
        <DialogTitle>Block Library Card</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>Blocking this card will prevent the member from borrowing books until the card is reinstated.</Alert>
          <TextField fullWidth label="Reason for Blocking" value={blockReason} onChange={e => setBlockReason(e.target.value)} multiline rows={2} required />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBlockDialog({ open: false, card: null })}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleBlock} disabled={loading || !blockReason}>Block Card</Button>
        </DialogActions>
      </Dialog>

      {/* Replace Dialog */}
      <Dialog open={replaceDialog.open} onClose={() => setReplaceDialog({ open: false, card: null })} maxWidth="sm" fullWidth>
        <DialogTitle>Replace Library Card</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>The current card will be marked as REPLACED and a new card will be issued.</Alert>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField label="Reason for Replacement" value={form.reason || ''} onChange={e => setForm({ ...form, reason: e.target.value })} fullWidth />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReplaceDialog({ open: false, card: null })}>Cancel</Button>
          <Button variant="contained" onClick={handleReplace} disabled={loading}>Replace Card</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LibraryCardManager;
