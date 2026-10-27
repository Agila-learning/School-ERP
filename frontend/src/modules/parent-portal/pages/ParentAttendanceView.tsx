import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, CircularProgress, Avatar, Chip, Alert, Grid } from '@mui/material';
import BackButton from '../../../shared/components/BackButton';
import { useParentContext } from '../context/ParentContext';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import { getChildAttendanceInfo } from '../api/parent.api';

const ParentAttendanceView: React.FC = () => {
  const { selectedChild, isLoading: isContextLoading } = useParentContext();
  const [attendance, setAttendance] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedChild) {
      setLoading(true);
      setError(null);
      getChildAttendanceInfo(selectedChild.studentId)
        .then(res => setAttendance(res))
        .catch(err => {
          console.error(err);
          setError('Failed to load attendance record. Please try again later.');
        })
        .finally(() => setLoading(false));
    }
  }, [selectedChild]);

  if (isContextLoading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}><CircularProgress /></Box>;
  }

  if (!selectedChild) {
    return (
      <Box sx={{ p: { xs: 2, md: 4 }, backgroundColor: '#f8fafc', minHeight: '100vh' }}>
        <BackButton to="/parent-portal" />
        <Paper elevation={0} sx={{ p: 6, textAlign: 'center', borderRadius: 3, border: '1px solid #e2e8f0', color: 'text.secondary' }}>
          No student selected or linked to your profile.
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <BackButton to="/parent-portal" />
      
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>Attendance Record</Typography>
          <Typography variant="body2" color="text.secondary">View attendance history for {selectedChild.firstName}.</Typography>
        </Box>
        <Chip 
          avatar={<Avatar>{selectedChild.firstName?.charAt(0)}</Avatar>} 
          label={`${selectedChild.firstName} ${selectedChild.lastName}`} 
          sx={{ ml: 'auto', fontWeight: 600, bgcolor: 'white', border: '1px solid #e2e8f0' }} 
        />
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}><CircularProgress /></Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 4, borderRadius: 2 }}>{error}</Alert>
      ) : (
        <Box>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={4}>
              <Paper elevation={0} sx={{ p: 3, textAlign: 'center', borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: '#f0fdf4' }}>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#166534' }}>{attendance?.percentage || 0}%</Typography>
                <Typography variant="body2" color="text.secondary">Attendance Rate</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Paper elevation={0} sx={{ p: 3, textAlign: 'center', borderRadius: 3, border: '1px solid #e2e8f0' }}>
                <Typography variant="h4" sx={{ fontWeight: 800 }}>{attendance?.presentDays || 0}</Typography>
                <Typography variant="body2" color="text.secondary">Days Present</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Paper elevation={0} sx={{ p: 3, textAlign: 'center', borderRadius: 3, border: '1px solid #e2e8f0' }}>
                <Typography variant="h4" sx={{ fontWeight: 800 }}>{attendance?.totalDays || 0}</Typography>
                <Typography variant="body2" color="text.secondary">Total Working Days</Typography>
              </Paper>
            </Grid>
          </Grid>
          
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Recent Records</Typography>
          <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            {attendance?.recentRecords && attendance.recentRecords.length > 0 ? (
              <Box sx={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead style={{ backgroundColor: '#f8fafc' }}>
                    <tr>
                      <th style={{ padding: '12px 16px', fontWeight: 600, borderBottom: '1px solid #e2e8f0' }}>Date</th>
                      <th style={{ padding: '12px 16px', fontWeight: 600, borderBottom: '1px solid #e2e8f0' }}>Status</th>
                      <th style={{ padding: '12px 16px', fontWeight: 600, borderBottom: '1px solid #e2e8f0' }}>Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendance.recentRecords.map((record: any, idx: number) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '12px 16px' }}>{new Date(record.date).toLocaleDateString()}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <Chip 
                            size="small" 
                            label={record.status} 
                            color={record.status === 'PRESENT' ? 'success' : record.status === 'ABSENT' ? 'error' : 'warning'} 
                            sx={{ fontWeight: 600 }} 
                          />
                        </td>
                        <td style={{ padding: '12px 16px' }}>{record.remarks || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Box>
            ) : (
              <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>No recent attendance records found.</Box>
            )}
          </Paper>
        </Box>
      )}
    </Box>
  );
};

export default ParentAttendanceView;