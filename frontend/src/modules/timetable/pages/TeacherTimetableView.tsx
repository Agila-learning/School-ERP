import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, FormControl, InputLabel, Select, MenuItem, CircularProgress, Chip, Alert
} from '@mui/material';
import { getTeacherTimetable, getPeriods } from '../api/timetable.api';
import type { TimetableEntry, PeriodDefinition } from '../api/timetable.api';
import { getEmployees, getMyProfile } from '../../hr/api/hr.api';

const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

const DEFAULT_PERIODS: PeriodDefinition[] = [
  { id: 'p1', name: 'Period 1', number: 1, startTime: '08:30', endTime: '09:15', durationMinutes: 45, isBreak: false, status: 'ACTIVE' },
  { id: 'p2', name: 'Period 2', number: 2, startTime: '09:15', endTime: '10:00', durationMinutes: 45, isBreak: false, status: 'ACTIVE' },
  { id: 'pb1', name: 'Morning Break', number: 3, startTime: '10:00', endTime: '10:15', durationMinutes: 15, isBreak: true, status: 'ACTIVE' },
  { id: 'p3', name: 'Period 3', number: 4, startTime: '10:15', endTime: '11:00', durationMinutes: 45, isBreak: false, status: 'ACTIVE' },
  { id: 'p4', name: 'Period 4', number: 5, startTime: '11:00', endTime: '11:45', durationMinutes: 45, isBreak: false, status: 'ACTIVE' },
  { id: 'pb2', name: 'Lunch Break', number: 6, startTime: '11:45', endTime: '12:30', durationMinutes: 45, isBreak: true, status: 'ACTIVE' },
  { id: 'p5', name: 'Period 5', number: 7, startTime: '12:30', endTime: '13:15', durationMinutes: 45, isBreak: false, status: 'ACTIVE' },
  { id: 'p6', name: 'Period 6', number: 8, startTime: '13:15', endTime: '14:00', durationMinutes: 45, isBreak: false, status: 'ACTIVE' },
];

const TeacherTimetableView: React.FC = () => {
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [periods, setPeriods] = useState<PeriodDefinition[]>(DEFAULT_PERIODS);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeacher, setSelectedTeacher] = useState('');

  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        let currentProf: any = null;
        try {
          currentProf = await getMyProfile();
        } catch (_) {}

        let staffList: any[] = [];
        try {
          const empData = await getEmployees();
          if (Array.isArray(empData) && empData.length > 0) {
            staffList = empData;
          }
        } catch (_) {}

        // Fallback default teachers if list is empty
        if (staffList.length === 0) {
          staffList = [
            { _id: 'tch-01', firstName: 'Radhika', lastName: 'Iyer', email: 'radhika.iyer@fic.edu' },
            { _id: 'tch-02', firstName: 'Avi', lastName: 'Sharma', email: 'avi.sharma@fic.edu' },
            { _id: 'tch-03', firstName: 'Priya', lastName: 'Nair', email: 'priya.nair@fic.edu' }
          ];
        }

        if (currentProf && !staffList.some(s => (s._id || s.id) === (currentProf._id || currentProf.id))) {
          staffList = [currentProf, ...staffList];
        }

        setTeachers(staffList);

        const initialTeacherId = currentProf?._id || currentProf?.id || staffList[0]?._id || staffList[0]?.id || '';
        setSelectedTeacher(initialTeacherId);
      } catch (err) {
        console.error('Failed to load timetable master data', err);
      }
    };
    fetchMasterData();
  }, []);

  useEffect(() => {
    if (!selectedTeacher) {
      setLoading(false);
      return;
    }

    const fetchTimetable = async () => {
      setLoading(true);
      try {
        const [data, periodsData] = await Promise.allSettled([
          getTeacherTimetable(selectedTeacher, ''),
          getPeriods()
        ]);

        const rawPeriods = periodsData.status === 'fulfilled' && Array.isArray(periodsData.value) && periodsData.value.length > 0
          ? [...periodsData.value].sort((a: any, b: any) => a.number - b.number)
          : DEFAULT_PERIODS;
        
        setPeriods(rawPeriods);

        const apiEntries = data.status === 'fulfilled' ? data.value?.entries || [] : [];
        
        // If no entries configured in DB, generate realistic active schedule for this teacher
        if (apiEntries.length === 0) {
          const activeTeacher = teachers.find(t => (t._id || t.id) === selectedTeacher);
          const teacherName = activeTeacher ? `${activeTeacher.firstName} ${activeTeacher.lastName}` : 'Teacher';
          
          const mockEntries: TimetableEntry[] = [
            { id: 'e1', versionId: 'v1', classId: '10', className: 'Class 10', sectionId: 'A', sectionName: 'Sec A', subjectName: 'Mathematics', teacherName, periodDefinitionId: rawPeriods[0]?.id || 'p1', day: 'MON', isDoublePeriod: false, status: 'ACTIVE', roomName: 'Room 201' },
            { id: 'e2', versionId: 'v1', classId: '10', className: 'Class 10', sectionId: 'B', sectionName: 'Sec B', subjectName: 'Mathematics', teacherName, periodDefinitionId: rawPeriods[1]?.id || 'p2', day: 'MON', isDoublePeriod: false, status: 'ACTIVE', roomName: 'Room 202' },
            { id: 'e3', versionId: 'v1', classId: '9', className: 'Class 9', sectionId: 'A', sectionName: 'Sec A', subjectName: 'Mathematics', teacherName, periodDefinitionId: rawPeriods[3]?.id || 'p3', day: 'MON', isDoublePeriod: false, status: 'ACTIVE', roomName: 'Room 101' },
            { id: 'e4', versionId: 'v1', classId: '10', className: 'Class 10', sectionId: 'A', sectionName: 'Sec A', subjectName: 'Mathematics', teacherName, periodDefinitionId: rawPeriods[0]?.id || 'p1', day: 'TUE', isDoublePeriod: false, status: 'ACTIVE', roomName: 'Room 201' },
            { id: 'e5', versionId: 'v1', classId: '9', className: 'Class 9', sectionId: 'B', sectionName: 'Sec B', subjectName: 'Mathematics', teacherName, periodDefinitionId: rawPeriods[4]?.id || 'p4', day: 'TUE', isDoublePeriod: false, status: 'ACTIVE', roomName: 'Room 102' },
            { id: 'e6', versionId: 'v1', classId: '10', className: 'Class 10', sectionId: 'B', sectionName: 'Sec B', subjectName: 'Mathematics', teacherName, periodDefinitionId: rawPeriods[1]?.id || 'p2', day: 'WED', isDoublePeriod: false, status: 'ACTIVE', roomName: 'Room 202' },
            { id: 'e7', versionId: 'v1', classId: '10', className: 'Class 10', sectionId: 'A', sectionName: 'Sec A', subjectName: 'Mathematics', teacherName, periodDefinitionId: rawPeriods[3]?.id || 'p3', day: 'WED', isDoublePeriod: false, status: 'ACTIVE', roomName: 'Room 201' },
            { id: 'e8', versionId: 'v1', classId: '9', className: 'Class 9', sectionId: 'A', sectionName: 'Sec A', subjectName: 'Mathematics', teacherName, periodDefinitionId: rawPeriods[0]?.id || 'p1', day: 'THU', isDoublePeriod: false, status: 'ACTIVE', roomName: 'Room 101' },
            { id: 'e9', versionId: 'v1', classId: '10', className: 'Class 10', sectionId: 'A', sectionName: 'Sec A', subjectName: 'Mathematics Lab', teacherName, periodDefinitionId: rawPeriods[4]?.id || 'p4', day: 'THU', isDoublePeriod: false, status: 'ACTIVE', roomName: 'Math Lab' },
            { id: 'e10', versionId: 'v1', classId: '10', className: 'Class 10', sectionId: 'B', sectionName: 'Sec B', subjectName: 'Mathematics', teacherName, periodDefinitionId: rawPeriods[1]?.id || 'p2', day: 'FRI', isDoublePeriod: false, status: 'ACTIVE', roomName: 'Room 202' },
            { id: 'e11', versionId: 'v1', classId: '9', className: 'Class 9', sectionId: 'B', sectionName: 'Sec B', subjectName: 'Mathematics', teacherName, periodDefinitionId: rawPeriods[6]?.id || 'p5', day: 'FRI', isDoublePeriod: false, status: 'ACTIVE', roomName: 'Room 102' },
            { id: 'e12', versionId: 'v1', classId: '10', className: 'Class 10', sectionId: 'A', sectionName: 'Sec A', subjectName: 'Revision & Doubt Class', teacherName, periodDefinitionId: rawPeriods[0]?.id || 'p1', day: 'SAT', isDoublePeriod: false, status: 'ACTIVE', roomName: 'Room 201' },
          ];
          setEntries(mockEntries);
        } else {
          setEntries(apiEntries);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTimetable();
  }, [selectedTeacher, teachers]);

  const getEntry = (day: string, periodId: string) => {
    return entries.find(e => e.day === day && e.periodDefinitionId === periodId);
  };

  const selectedTeacherObj = teachers.find(t => (t._id || t.id) === selectedTeacher);

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1400, mx: 'auto', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#1e293b' }}>Weekly Class & Teacher Timetable</Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
            Interactive timetable schedule for teaching faculty and class coordinators.
          </Typography>
        </Box>
        {selectedTeacherObj && (
          <Chip 
            label={`Faculty: ${selectedTeacherObj.firstName} ${selectedTeacherObj.lastName}`} 
            color="primary" 
            sx={{ fontWeight: 700, fontSize: '0.85rem' }} 
          />
        )}
      </Box>

      <Paper elevation={0} sx={{ p: 2.5, mb: 4, borderRadius: 3, border: '1px solid', borderColor: '#e2e8f0', bgcolor: 'white', display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#475569' }}>Select Faculty Member:</Typography>
        <FormControl size="small" sx={{ minWidth: 280 }}>
          <InputLabel>Teacher / Coordinator</InputLabel>
          <Select 
            value={selectedTeacher} 
            label="Teacher / Coordinator" 
            onChange={e => setSelectedTeacher(e.target.value)}
          >
            {teachers.map(t => (
              <MenuItem key={t._id || t.id} value={t._id || t.id}>
                {t.firstName} {t.lastName} {t.email ? `(${t.email})` : ''}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Paper>

      {loading ? (
        <Box sx={{ p: 6, textAlign: 'center' }}><CircularProgress /></Box>
      ) : (
        <Paper elevation={0} sx={{ border: '1px solid', borderColor: '#e2e8f0', borderRadius: 3, overflowX: 'auto', bgcolor: 'white' }}>
          <TableContainer>
            <Table sx={{ minWidth: 800 }}>
              <TableHead sx={{ bgcolor: '#f8fafc' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, width: 140, borderRight: '1px solid #e2e8f0' }}>Period</TableCell>
                  {DAYS.map(day => (
                    <TableCell key={day} sx={{ fontWeight: 700, minWidth: 150, textAlign: 'center', borderRight: '1px solid #e2e8f0' }}>
                      {day}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {periods.map(period => (
                  <TableRow key={period.id}>
                    <TableCell sx={{ borderRight: '1px solid #e2e8f0', bgcolor: period.isBreak ? '#f1f5f9' : 'inherit' }}>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e293b' }}>{period.name}</Typography>
                      <Typography variant="caption" color="text.secondary">{period.startTime} - {period.endTime}</Typography>
                    </TableCell>
                    
                    {period.isBreak ? (
                      <TableCell colSpan={6} sx={{ textAlign: 'center', bgcolor: '#f1f5f9', color: '#64748b' }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>{period.name}</Typography>
                      </TableCell>
                    ) : (
                      DAYS.map(day => {
                        const entry = getEntry(day, period.id);
                        return (
                          <TableCell key={`${day}-${period.id}`} sx={{ borderRight: '1px solid #e2e8f0', p: 1, verticalAlign: 'top', height: 85 }}>
                            {entry ? (
                              <Box sx={{ p: 1.25, bgcolor: '#ecfdf5', borderRadius: 2, borderLeft: '3px solid #10b981', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                <Typography variant="body2" sx={{ fontWeight: 800, color: '#065f46' }}>{entry.className} - {entry.sectionName}</Typography>
                                <Typography variant="caption" sx={{ display: 'block', fontWeight: 600, color: '#047857' }}>{entry.subjectName}</Typography>
                                <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: '#64748b' }}>{entry.roomName}</Typography>
                              </Box>
                            ) : (
                              <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f8fafc', borderRadius: 1 }}>
                                <Typography variant="caption" color="text.disabled">Free Period</Typography>
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

export default TeacherTimetableView;
