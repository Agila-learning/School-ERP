import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Grid, TextField, Button, MenuItem, 
  FormControlLabel, Checkbox, CircularProgress, Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { getLeaveTypes, saveLeaveRequest } from '../api/leave.api';
import type { LeaveType } from '../api/leave.api';

const LeaveApplicationForm: React.FC = () => {
  const navigate = useNavigate();
  const [types, setTypes] = useState<LeaveType[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    leaveTypeId: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    isHalfDay: false,
    reason: ''
  });

  useEffect(() => {
    getLeaveTypes().then(data => {
      const filtered = Array.isArray(data) ? data.filter(t => t.domain === 'EMPLOYEE' || t.domain === 'BOTH') : [];
      if (filtered.length > 0) {
        setTypes(filtered);
        setFormData(prev => ({ ...prev, leaveTypeId: filtered[0].id || (filtered[0] as any)._id }));
      } else {
        const defaultTypes: any[] = [
          { id: 'casual', _id: 'casual', name: 'Casual Leave', code: 'CL', domain: 'EMPLOYEE', allowHalfDay: true },
          { id: 'sick', _id: 'sick', name: 'Sick Leave', code: 'SL', domain: 'EMPLOYEE', allowHalfDay: true, requiresDocument: true },
          { id: 'earned', _id: 'earned', name: 'Earned Leave', code: 'EL', domain: 'EMPLOYEE', allowHalfDay: false }
        ];
        setTypes(defaultTypes);
        setFormData(prev => ({ ...prev, leaveTypeId: defaultTypes[0].id }));
      }
      setLoading(false);
    }).catch(() => {
      const defaultTypes: any[] = [
        { id: 'casual', _id: 'casual', name: 'Casual Leave', code: 'CL', domain: 'EMPLOYEE', allowHalfDay: true },
        { id: 'sick', _id: 'sick', name: 'Sick Leave', code: 'SL', domain: 'EMPLOYEE', allowHalfDay: true, requiresDocument: true }
      ];
      setTypes(defaultTypes);
      setFormData(prev => ({ ...prev, leaveTypeId: defaultTypes[0].id }));
      setLoading(false);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      let days = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 3600 * 24)) + 1);
      if (formData.isHalfDay) days = 0.5;

      await saveLeaveRequest({
        ...formData,
        domain: 'EMPLOYEE',
        totalDays: days
      });
      
      navigate('/leave/my-leave');
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to submit leave request. Please check inputs.');
      setSubmitting(false);
    }
  };

  if (loading) return <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress /></Box>;

  const selectedType = types.find(t => t.id === formData.leaveTypeId || (t as any)._id === formData.leaveTypeId);

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>Apply for Leave</Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Submit a new absence request for managerial approval.
      </Typography>

      <Paper elevation={0} sx={{ p: 4, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <TextField
                select
                label="Leave Type"
                fullWidth
                required
                value={formData.leaveTypeId}
                onChange={e => setFormData({ ...formData, leaveTypeId: e.target.value })}
              >
                {types.map(t => (
                  <MenuItem key={t.id || (t as any)._id} value={t.id || (t as any)._id}>{t.name}</MenuItem>
                ))}
              </TextField>
            </Grid>

            {selectedType?.requiresDocument && (
              <Grid size={{ xs: 12 }}>
                <Alert severity="info" sx={{ borderRadius: 2 }}>
                  This leave type typically requires a supporting document (e.g., Medical Certificate) for absences exceeding policy limits.
                </Alert>
              </Grid>
            )}

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Start Date"
                type="date"
                fullWidth
                required
                slotProps={{ inputLabel: { shrink: true } }}
                value={formData.startDate}
                onChange={e => setFormData({ ...formData, startDate: e.target.value })}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="End Date"
                type="date"
                fullWidth
                required
                slotProps={{ inputLabel: { shrink: true } }}
                value={formData.endDate}
                onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                disabled={formData.isHalfDay}
              />
            </Grid>

            {selectedType?.allowHalfDay && (
              <Grid size={{ xs: 12 }}>
                <FormControlLabel
                  control={<Checkbox checked={formData.isHalfDay} onChange={e => setFormData({ ...formData, isHalfDay: e.target.checked, endDate: formData.startDate })} />}
                  label="This is a Half-Day Leave"
                />
              </Grid>
            )}

            <Grid size={{ xs: 12 }}>
              <TextField
                label="Reason / Remarks"
                multiline
                rows={4}
                fullWidth
                required
                placeholder="Please provide a brief reason for your leave request..."
                value={formData.reason}
                onChange={e => setFormData({ ...formData, reason: e.target.value })}
              />
            </Grid>

            <Grid size={{ xs: 12 }} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
              <Button variant="text" onClick={() => navigate('/leave/my-leave')} disabled={submitting}>Cancel</Button>
              <Button type="submit" variant="contained" disableElevation disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Request'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default LeaveApplicationForm;
