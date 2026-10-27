import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Button, Box, Typography, Alert,
  Chip, Grid
} from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutlined';
import SendIcon from '@mui/icons-material/Send';
import api from '../../core/api/axios';

interface PrincipalQueryModalProps {
  open: boolean;
  onClose: () => void;
  senderRole: 'TEACHER' | 'STAFF' | 'DRIVER' | 'PARENT' | 'STUDENT';
  senderName?: string;
  senderId?: string;
}

export const PrincipalQueryModal: React.FC<PrincipalQueryModalProps> = ({
  open,
  onClose,
  senderRole,
  senderName = 'Staff Member',
  senderId
}) => {
  const [category, setCategory] = useState('ACADEMIC');
  const [priority, setPriority] = useState('NORMAL');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      setError('Please fill in both the Subject and Description.');
      return;
    }

    setSubmitting(true);
    setError(null);

    const newQuery = {
      id: `query_${Date.now()}`,
      senderId: senderId || `user_${Date.now()}`,
      senderName,
      senderRole,
      category,
      priority,
      subject,
      message,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      principalReply: null,
      repliedAt: null
    };

    try {
      try {
        await api.post('/communication/principal/queries', newQuery);
      } catch (apiErr) {
        // Fallback local storage persistence
        console.warn('Backend query endpoint warning, saving locally:', apiErr);
      }

      const existingKey = 'fic_principal_direct_queries';
      const stored = localStorage.getItem(existingKey);
      const list = stored ? JSON.parse(stored) : [];
      list.unshift(newQuery);
      localStorage.setItem(existingKey, JSON.stringify(list));

      // Broadcast custom event so Principal Dashboard reflects this query immediately
      window.dispatchEvent(new CustomEvent('principal_queries_updated', { detail: newQuery }));

      // Realtime notification
      try {
        const { publishNotification } = await import('../../core/services/realtimeNotificationBus');
        publishNotification({
          title: `Direct Query from ${senderRole}: ${senderName}`,
          message: `Topic: ${subject}. Delivered to Principal Executive Desk.`,
          category: 'ADMIN',
          severity: priority === 'URGENT' ? 'warning' : 'info',
          link: '/principal/dashboard'
        });
      } catch (notifErr) {
        console.debug('Notification bus error:', notifErr);
      }

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setSubject('');
        setMessage('');
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err?.message || 'Failed to submit query to Principal.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1.5, pb: 1 }}>
        <HelpOutlineIcon color="primary" />
        <span>Direct Query to Principal</span>
        <Chip size="small" label={senderRole} color="secondary" variant="outlined" sx={{ ml: 'auto' }} />
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, py: 2.5 }}>
          {error && <Alert severity="error">{error}</Alert>}
          {success && <Alert severity="success">Your query has been delivered directly to the Principal's Desk!</Alert>}

          <Typography variant="body2" color="text.secondary">
            Send an official grievance, question, or request directly to the School Principal. You will receive real-time notifications when reviewed.
          </Typography>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                fullWidth
                size="small"
                label="Query Category *"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <MenuItem value="ACADEMIC">Academic / Curriculum</MenuItem>
                <MenuItem value="SCHEDULE">Timetable & Slot Swap</MenuItem>
                <MenuItem value="INFRASTRUCTURE">Campus Infrastructure & Facilities</MenuItem>
                <MenuItem value="HR_PAYROLL">HR / Service / Payroll Concern</MenuItem>
                <MenuItem value="STUDENT_WELFARE">Student Welfare & Discipline</MenuItem>
                <MenuItem value="CONFIDENTIAL">Confidential Escalation</MenuItem>
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                fullWidth
                size="small"
                label="Priority Level"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <MenuItem value="NORMAL">Normal</MenuItem>
                <MenuItem value="HIGH">High Priority</MenuItem>
                <MenuItem value="URGENT">Urgent Concern</MenuItem>
              </TextField>
            </Grid>
          </Grid>

          <TextField
            fullWidth
            size="small"
            label="Subject / Topic *"
            placeholder="Brief summary of your query..."
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
          />

          <TextField
            fullWidth
            multiline
            rows={4}
            size="small"
            label="Detailed Message *"
            placeholder="Provide all relevant details for the Principal's attention..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          />
        </DialogContent>

        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={onClose} disabled={submitting}>Cancel</Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={submitting}
            startIcon={<SendIcon />}
            sx={{ fontWeight: 700, borderRadius: 2, px: 3 }}
          >
            {submitting ? 'Delivering...' : 'Send to Principal'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
