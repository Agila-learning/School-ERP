import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, MenuItem, Select, FormControl, InputLabel, CircularProgress } from '@mui/material';
import { format, addDays, startOfWeek } from 'date-fns';
import { getExams, getExamSchedules } from '../api/examination.api';

const ExamCalendar: React.FC = () => {
  const [exams, setExams] = useState<any[]>([]);
  const [selectedExam, setSelectedExam] = useState<string>('');
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const ex = await getExams();
        setExams(ex);
        if (ex.length > 0) setSelectedExam(ex[0].id);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (!selectedExam) {
      setSchedules([]);
      return;
    }
    const loadSchedules = async () => {
      try {
        const sch = await getExamSchedules(selectedExam);
        setSchedules(sch);
      } catch (err) {
        console.error(err);
      }
    };
    loadSchedules();
  }, [selectedExam]);

  const today = new Date();
  const start = startOfWeek(today, { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }).map((_, i) => addDays(start, i));

  const getSchedulesForDay = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return schedules.filter(s => {
      if (!s.examDate) return false;
      return format(new Date(s.examDate), 'yyyy-MM-dd') === dateStr;
    });
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1400, mx: 'auto' }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>Exam Calendar</Typography>
          <Typography variant="body2" color="text.secondary">Weekly overview of scheduled exams</Typography>
        </Box>
        <Typography variant="h6">{format(today, 'MMMM yyyy')}</Typography>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
      ) : (
        <>
          <Paper elevation={0} sx={{ p: 2, mb: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <FormControl size="small" sx={{ minWidth: 300 }}>
              <InputLabel>Select Examination</InputLabel>
              <Select value={selectedExam} label="Select Examination" onChange={e => setSelectedExam(e.target.value)}>
                {exams.map(e => <MenuItem key={e.id} value={e.id}>{e.name}</MenuItem>)}
              </Select>
            </FormControl>
          </Paper>

          <Paper variant="outlined" sx={{ overflow: 'hidden', borderRadius: 2 }}>
            <Grid container sx={{ borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'grey.50' }}>
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
                <Grid size="grow" key={day} sx={{ p: 2, textAlign: 'center', borderRight: i < 6 ? '1px solid' : 'none', borderColor: 'divider' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>{day}</Typography>
                </Grid>
              ))}
            </Grid>
            <Grid container sx={{ minHeight: 400 }}>
              {days.map((date, i) => {
                const isToday = format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
                const dayExams = getSchedulesForDay(date);
                
                return (
                  <Grid size="grow" key={i} sx={{ borderRight: i < 6 ? '1px solid' : 'none', borderBottom: '1px solid', borderColor: 'divider', p: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                      <Box sx={{ 
                        width: 30, height: 30, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        bgcolor: isToday ? 'primary.main' : 'transparent', color: isToday ? 'white' : 'inherit'
                      }}>
                        {format(date, 'd')}
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      {dayExams.map((e: any) => (
                        <Box key={e._id} sx={{ p: 1, bgcolor: 'primary.50', borderLeft: '3px solid', borderColor: 'primary.main', borderRadius: 1 }}>
                          <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block' }}>{e.subjectId?.name || 'Subject'}</Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>{e.startTime} - {e.endTime}</Typography>
                          <Typography variant="caption" color="text.secondary">{e.classId?.name || ''} {e.sectionId?.name || ''}</Typography>
                        </Box>
                      ))}
                    </Box>
                  </Grid>
                );
              })}
            </Grid>
          </Paper>
        </>
      )}
    </Box>
  );
};

export default ExamCalendar;
