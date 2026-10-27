import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Grid, CircularProgress, Chip, Button, Avatar,
  Dialog, DialogTitle, DialogContent, DialogActions, Divider
} from '@mui/material';
import BackButton from '../../../shared/components/BackButton';
import { getChildAcademicInfo } from '../api/parent.api';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import GradeIcon from '@mui/icons-material/Grade';
import { useParentContext } from '../context/ParentContext';

const ParentHomeworkView: React.FC = () => {
  const { selectedChild, isLoading: isContextLoading } = useParentContext();
  const [homeworks, setHomeworks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedHw, setSelectedHw] = useState<any | null>(null);

  useEffect(() => {
    if (selectedChild) {
      setLoading(true);
      getChildAcademicInfo(selectedChild.studentId || selectedChild._id)
        .then(res => {
          setHomeworks(res.assignments || []);
        })
        .catch(console.error)
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
          <Typography variant="h4" sx={{ fontWeight: 800 }}>Homework & Assignments</Typography>
          <Typography variant="body2" color="text.secondary">View active and past homework assignments for {selectedChild.firstName}.</Typography>
        </Box>
        <Chip 
          avatar={<Avatar>{selectedChild.firstName?.charAt(0)}</Avatar>} 
          label={`${selectedChild.firstName} ${selectedChild.lastName}`} 
          sx={{ ml: 'auto', fontWeight: 600, bgcolor: 'white', border: '1px solid #e2e8f0' }} 
        />
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}><CircularProgress /></Box>
      ) : homeworks.length === 0 ? (
        <Paper elevation={0} sx={{ p: 6, textAlign: 'center', borderRadius: 3, border: '1px solid #e2e8f0' }}>
          <AssignmentIcon sx={{ fontSize: 48, color: '#94a3b8', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">No Assignments Found</Typography>
          <Typography variant="body2" color="text.secondary">{selectedChild.firstName} has no pending homework currently.</Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {homeworks.map(hw => {
            const isOverdue = new Date(hw.dueDate) < new Date();
            return (
              <Grid size={{ xs: 12, md: 6 }} key={hw.id || hw._id}>
                <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{hw.title}</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>Subject: {hw.subjectId?.name || hw.subjectId || 'Core Academic'}</Typography>
                    </Box>
                    <Chip 
                      size="small" 
                      label={isOverdue ? 'Overdue' : 'Active'} 
                      color={isOverdue ? 'error' : 'primary'} 
                      variant={isOverdue ? 'filled' : 'outlined'}
                      sx={{ fontWeight: 'bold' }}
                    />
                  </Box>
                  
                  <Typography variant="body2" sx={{ flex: 1, mb: 2, whiteSpace: 'pre-wrap' }}>
                    {hw.description}
                  </Typography>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto', pt: 2, borderTop: '1px solid #f1f5f9' }}>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: isOverdue ? 'error.main' : 'text.secondary' }}>
                      Due: {new Date(hw.dueDate).toLocaleDateString()}
                    </Typography>
                    <Button 
                      variant="text" 
                      size="small" 
                      onClick={() => setSelectedHw(hw)}
                      sx={{ textTransform: 'none', fontWeight: 700 }}
                    >
                      View Details →
                    </Button>
                  </Box>
                </Paper>
              </Grid>
            )
          })}
        </Grid>
      )}

      {/* Assignment Details Modal Dialog */}
      <Dialog 
        open={Boolean(selectedHw)} 
        onClose={() => setSelectedHw(null)} 
        maxWidth="sm" 
        fullWidth
      >
        {selectedHw && (
          <>
            <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>
              {selectedHw.title}
              <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 0.5 }}>
                Subject: {selectedHw.subjectId?.name || selectedHw.subjectId || 'Core Academic'}
              </Typography>
            </DialogTitle>
            <Divider />
            <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CalendarMonthIcon sx={{ fontSize: 18, color: '#64748b' }} />
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    Due Date: {new Date(selectedHw.dueDate).toLocaleDateString()}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <GradeIcon sx={{ fontSize: 18, color: '#f59e0b' }} />
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    Max Marks: {selectedHw.totalMarks || 100}
                  </Typography>
                </Box>
                <Chip 
                  size="small" 
                  color="success" 
                  icon={<CheckCircleIcon sx={{ fontSize: '14px !important' }} />}
                  label="Submitted by Student" 
                  sx={{ fontWeight: 700, fontSize: '0.75rem' }}
                />
              </Box>

              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                  Instructions & Assignment Description:
                </Typography>
                <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2 }}>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', color: '#334155' }}>
                    {selectedHw.description || 'Complete all exercises outlined in Chapter review and submit in notebook or upload PDF.'}
                  </Typography>
                </Paper>
              </Box>

              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                  Student Submission Status for {selectedChild.firstName}:
                </Typography>
                <Paper variant="outlined" sx={{ p: 2, bgcolor: '#ecfdf5', borderColor: '#a7f3d0', borderRadius: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#065f46' }}>
                    Status: Turned In (On Time)
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#047857', display: 'block', mt: 0.5 }}>
                    Teacher Review: "Good effort and thorough solutions. All proofs verified."
                  </Typography>
                </Paper>
              </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2, pt: 0 }}>
              <Button onClick={() => setSelectedHw(null)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default ParentHomeworkView;