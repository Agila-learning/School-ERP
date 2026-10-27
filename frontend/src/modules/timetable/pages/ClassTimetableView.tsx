import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, FormControl, InputLabel, Select, MenuItem, CircularProgress
} from '@mui/material';
import { getClassTimetable, getPeriods } from '../api/timetable.api';
import type { TimetableEntry, PeriodDefinition } from '../api/timetable.api';
import { getClasses, getSections } from '../../academic/api/academic.api';

const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

const ClassTimetableView: React.FC = () => {
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [periods, setPeriods] = useState<PeriodDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');

  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        const clsData = await getClasses();
        setClasses(clsData || []);
        if (clsData?.length > 0) setSelectedClass(clsData[0].id);
      } catch (err) {
        console.error(err);
      }
    };
    fetchMasterData();
  }, []);

  useEffect(() => {
    if (!selectedClass) return;
    const fetchClassDependencies = async () => {
      try {
        const secData = await getSections(selectedClass);
        setSections(secData || []);
        if (secData?.length > 0) setSelectedSection(secData[0].id);
        else setSelectedSection('');
      } catch (err) {
        console.error(err);
      }
    };
    fetchClassDependencies();
  }, [selectedClass]);

  useEffect(() => {
    if (!selectedSection) {
      setEntries([]);
      setPeriods([]);
      setLoading(false);
      return;
    }
    const fetchTimetable = async () => {
      setLoading(true);
      try {
        const [entriesData, periodsData] = await Promise.all([
          getClassTimetable(selectedSection, ''), // Optional academicYearId
          getPeriods()
        ]);
        setEntries(entriesData || []);
        setPeriods([...periodsData].sort((a, b) => a.number - b.number));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTimetable();
  }, [selectedSection]);

  const getEntry = (day: string, periodId: string) => {
    return entries.find(e => e.day === day && e.periodDefinitionId === periodId);
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1400, mx: 'auto' }}>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>Class Timetable</Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        View the published schedule for a specific class and section.
      </Typography>

      <Paper elevation={0} sx={{ p: 3, mb: 4, borderRadius: 3, border: '1px solid', borderColor: 'divider', display: 'flex', gap: 2 }}>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Class</InputLabel>
          <Select value={selectedClass} label="Class" onChange={e => setSelectedClass(e.target.value)}>
            {classes.map(c => (
              <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 200 }} disabled={!selectedClass}>
          <InputLabel>Section</InputLabel>
          <Select value={selectedSection} label="Section" onChange={e => setSelectedSection(e.target.value)}>
            {sections.map(s => (
              <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Paper>

      {loading ? (
        <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress /></Box>
      ) : (
        <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, overflowX: 'auto' }}>
          <TableContainer>
            <Table sx={{ minWidth: 800 }}>
              <TableHead sx={{ bgcolor: 'grey.50' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, width: 120, borderRight: '1px solid #eee' }}>Period</TableCell>
                  {DAYS.map(day => (
                    <TableCell key={day} sx={{ fontWeight: 700, minWidth: 150, textAlign: 'center', borderRight: '1px solid #eee' }}>
                      {day}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {periods.map(period => (
                  <TableRow key={period.id}>
                    <TableCell sx={{ borderRight: '1px solid #eee', bgcolor: period.isBreak ? 'grey.50' : 'inherit' }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{period.name}</Typography>
                      <Typography variant="caption" color="text.secondary">{period.startTime} - {period.endTime}</Typography>
                    </TableCell>
                    
                    {period.isBreak ? (
                      <TableCell colSpan={6} sx={{ textAlign: 'center', bgcolor: 'grey.50', color: 'text.secondary' }}>
                        <Typography variant="overline">{period.name}</Typography>
                      </TableCell>
                    ) : (
                      DAYS.map(day => {
                        const entry = getEntry(day, period.id);
                        return (
                          <TableCell key={`${day}-${period.id}`} sx={{ borderRight: '1px solid #eee', p: 1, verticalAlign: 'top', height: 80 }}>
                            {entry ? (
                              <Box sx={{ p: 1, bgcolor: 'primary.50', borderRadius: 1, borderLeft: '3px solid', borderColor: 'primary.main', height: '100%' }}>
                                <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.900' }}>{entry.subjectName}</Typography>
                                <Typography variant="caption" sx={{ display: 'block' }} color="text.secondary">{entry.teacherName}</Typography>
                                <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }} color="text.secondary">{entry.roomName}</Typography>
                              </Box>
                            ) : (
                              <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Typography variant="caption" color="text.disabled">-</Typography>
                              </Box>
                            )}
                          </TableCell>
                        );
                      })
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
    </Box>
  );
};

export default ClassTimetableView;
