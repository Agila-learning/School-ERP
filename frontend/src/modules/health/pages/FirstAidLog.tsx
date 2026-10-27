import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  IconButton,
  Alert
} from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';
import { healthApi } from '../api/health.api';
import type { MedicalVisit } from '../api/health.api';

const FirstAidLog: React.FC = () => {
  const [logs, setLogs] = useState<MedicalVisit[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modal
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    studentName: '',
    reason: '',
    firstAidGiven: '',
    instructions: ''
  });

  const loadLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await healthApi.getVisits({ visitType: 'FIRST_AID' });
      setLogs(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to fetch first aid logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const handleOpenModal = () => {
    setFormData({
      studentName: '',
      reason: '',
      firstAidGiven: '',
      instructions: ''
    });
    setOpenModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.studentName.trim() || !formData.reason.trim()) {
      alert('Please provide student/staff name and injury description.');
      return;
    }
    try {
      setSaving(true);
      await healthApi.createVisit({
        studentName: formData.studentName,
        visitType: 'FIRST_AID',
        reason: formData.reason,
        firstAidGiven: formData.firstAidGiven,
        instructions: formData.instructions,
        disposition: 'RETURNED_TO_CLASS',
        status: 'COMPLETED',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        date: new Date().toISOString()
      });
      setOpenModal(false);
      await loadLogs();
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || 'Failed to save first aid entry');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this log?')) return;
    try {
      await healthApi.deleteVisit(id);
      await loadLogs();
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || 'Failed to delete record');
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <AssignmentIcon color="primary" sx={{ fontSize: 36 }} />
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>First Aid & Incident Log</Typography>
            <Typography variant="body2" color="text.secondary">Real-time first aid interventions, dressings, and medical supplies administration</Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={loadLogs}>
            Refresh
          </Button>
          <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleOpenModal}>
            Record First Aid
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Card sx={{ borderRadius: 2 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>First Aid Records</Typography>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress />
            </Box>
          ) : logs.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
              No first aid logs found. Click "Record First Aid" to add a new record.
            </Box>
          ) : (
            <TableContainer component={Paper} elevation={0}>
              <Table>
                <TableHead sx={{ bgcolor: 'grey.50' }}>
                  <TableRow>
                    <TableCell>Log #</TableCell>
                    <TableCell>Date & Time</TableCell>
                    <TableCell>Student / Staff</TableCell>
                    <TableCell>Type of Injury / Complaint</TableCell>
                    <TableCell>First Aid Provided / Supplies</TableCell>
                    <TableCell>Follow-up Notes</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log._id} hover>
                      <TableCell sx={{ fontWeight: 600 }}>{log.visitNumber}</TableCell>
                      <TableCell>{new Date(log.date).toLocaleDateString()} {log.time}</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{log.studentName || 'Individual'}</TableCell>
                      <TableCell>{log.reason}</TableCell>
                      <TableCell>{log.firstAidGiven || 'Standard Bandage & Antiseptic'}</TableCell>
                      <TableCell>{log.instructions || 'N/A'}</TableCell>
                      <TableCell>
                        <Chip label={log.status} color="success" size="small" />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton size="small" color="error" onClick={() => handleDelete(log._id)}>
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Record Modal */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Record First Aid Intervention</DialogTitle>
        <form onSubmit={handleSave}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Student / Staff Member Name *"
              value={formData.studentName}
              onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
              fullWidth
              required
              placeholder="e.g. Mark Johnson (Grade 6A)"
            />
            <TextField
              label="Injury / Condition *"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              fullWidth
              required
              placeholder="e.g. Scraped knee, minor cut on index finger, mild sprain..."
            />
            <TextField
              label="First Aid Provided & Supplies Used"
              value={formData.firstAidGiven}
              onChange={(e) => setFormData({ ...formData, firstAidGiven: e.target.value })}
              fullWidth
              multiline
              rows={2}
              placeholder="e.g. Cleansed with antiseptic wipe, applied sterile gauze bandage and ice pack"
            />
            <TextField
              label="Follow-up Instructions / Notes"
              value={formData.instructions}
              onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
              fullWidth
              multiline
              rows={2}
              placeholder="e.g. Change bandage tomorrow; send home if swelling increases."
            />
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => setOpenModal(false)} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={saving}>
              {saving ? 'Saving...' : 'Save First Aid Log'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default FirstAidLog;
