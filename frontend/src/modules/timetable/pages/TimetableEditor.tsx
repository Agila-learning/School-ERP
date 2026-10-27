import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, FormControl, InputLabel, Select, MenuItem, CircularProgress, Button,
  Dialog, DialogTitle, DialogContent, DialogActions, Alert, Chip, ToggleButtonGroup, ToggleButton,
  TextField, Tooltip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ViewWeekIcon from '@mui/icons-material/ViewWeek';
import RefreshIcon from '@mui/icons-material/Refresh';
import BeachAccessIcon from '@mui/icons-material/BeachAccess';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import SchoolIcon from '@mui/icons-material/School';
import { useSearchParams } from 'react-router-dom';
import { 
  getTimetableEntries, getPeriods, getTimetableVersions, 
  upsertTimetableEntry, deleteTimetableEntry, getRooms, createTimetableVersion 
} from '../api/timetable.api';
import type { TimetableEntry, PeriodDefinition, TimetableVersion, Room } from '../api/timetable.api';
import { getClasses, getSections, getSubjects } from '../../academic/api/academic.api';
import { getEmployees } from '../../hr/api/hr.api';

const WEEK_DAYS = [
  { key: 'MON', label: 'Monday' },
  { key: 'TUE', label: 'Tuesday' },
  { key: 'WED', label: 'Wednesday' },
  { key: 'THU', label: 'Thursday' },
  { key: 'FRI', label: 'Friday' },
  { key: 'SAT', label: 'Saturday' },
];

const DAY_ORDERS = [
  { key: 'DAY_1', label: 'Day 1' },
  { key: 'DAY_2', label: 'Day 2' },
  { key: 'DAY_3', label: 'Day 3' },
  { key: 'DAY_4', label: 'Day 4' },
  { key: 'DAY_5', label: 'Day 5' },
  { key: 'DAY_6', label: 'Day 6' },
];

const DEFAULT_FALLBACK_PERIODS: PeriodDefinition[] = [
  { id: '650000000000000000000001', name: 'Period 1', number: 1, startTime: '09:00', endTime: '09:45', durationMinutes: 45, isBreak: false, status: 'ACTIVE' },
  { id: '650000000000000000000002', name: 'Period 2', number: 2, startTime: '09:45', endTime: '10:30', durationMinutes: 45, isBreak: false, status: 'ACTIVE' },
  { id: '650000000000000000000003', name: 'Period 3', number: 3, startTime: '10:30', endTime: '11:15', durationMinutes: 45, isBreak: false, status: 'ACTIVE' },
  { id: '650000000000000000000004', name: 'Short Break', number: 4, startTime: '11:15', endTime: '11:30', durationMinutes: 15, isBreak: true, status: 'ACTIVE' },
  { id: '650000000000000000000005', name: 'Period 4', number: 5, startTime: '11:30', endTime: '12:15', durationMinutes: 45, isBreak: false, status: 'ACTIVE' },
  { id: '650000000000000000000006', name: 'Period 5', number: 6, startTime: '12:15', endTime: '13:00', durationMinutes: 45, isBreak: false, status: 'ACTIVE' },
  { id: '650000000000000000000007', name: 'Lunch Break', number: 7, startTime: '13:00', endTime: '13:45', durationMinutes: 45, isBreak: true, status: 'ACTIVE' },
  { id: '650000000000000000000008', name: 'Period 6', number: 8, startTime: '13:45', endTime: '14:30', durationMinutes: 45, isBreak: false, status: 'ACTIVE' },
  { id: '650000000000000000000009', name: 'Period 7', number: 9, startTime: '14:30', endTime: '15:15', durationMinutes: 45, isBreak: false, status: 'ACTIVE' },
  { id: '650000000000000000000010', name: 'Period 8', number: 10, startTime: '15:15', endTime: '16:00', durationMinutes: 45, isBreak: false, status: 'ACTIVE' },
];

const TimetableEditor: React.FC = () => {
  const [searchParams] = useSearchParams();
  const urlVersionId = searchParams.get('versionId');

  // Day View Mode: 'WEEK_DAYS' (Mon-Sat) vs 'DAY_ORDER' (Day 1 - Day 6)
  const [dayMode, setDayMode] = useState<'WEEK_DAYS' | 'DAY_ORDER'>('WEEK_DAYS');

  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [periods, setPeriods] = useState<PeriodDefinition[]>([]);
  const [versions, setVersions] = useState<TimetableVersion[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [classes, setClasses] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);

  const [selectedVersion, setSelectedVersion] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');

  // Cell Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCell, setSelectedCell] = useState<{ day: string, period: PeriodDefinition } | null>(null);
  const [assignmentData, setAssignmentData] = useState({
    slotType: 'ACADEMIC',
    customTitle: '',
    subjectId: '',
    teacherId: '',
    roomId: ''
  });
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const activeDays = dayMode === 'WEEK_DAYS' ? WEEK_DAYS : DAY_ORDERS;

  const handleQuickCreateVersion = async () => {
    try {
      setIsSaving(true);
      const newVer = await createTimetableVersion({
        name: `Schedule Term ${new Date().getFullYear()}`,
        effectiveFrom: new Date().toISOString().split('T')[0],
        constraints: {
          workingDays: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'DAY_1', 'DAY_2', 'DAY_3', 'DAY_4', 'DAY_5', 'DAY_6'],
          maxPeriodsPerDay: 8
        }
      });
      const versionsData = await getTimetableVersions();
      setVersions(versionsData);
      if (newVer?.id || (newVer as any)?._id) {
        setSelectedVersion(newVer.id || (newVer as any)._id);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create timetable version');
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        const [clsData, empData, roomData, periodsData, versionsData] = await Promise.all([
          getClasses(),
          getEmployees(),
          getRooms(),
          getPeriods(),
          getTimetableVersions()
        ]);
        setClasses(clsData || []);
        setTeachers(empData || []);
        setRooms(roomData || []);
        
        if (periodsData && periodsData.length > 0) {
          setPeriods([...periodsData].sort((a, b) => a.number - b.number));
        } else {
          setPeriods(DEFAULT_FALLBACK_PERIODS);
        }
        
        const availableVersions = versionsData.filter(v => v.status === 'DRAFT' || v.status === 'REVIEW');
        const activeList = availableVersions.length > 0 ? availableVersions : versionsData;
        setVersions(activeList);
        
        if (clsData?.length > 0 && !selectedClass) {
          setSelectedClass(clsData[0].id || clsData[0]._id);
        }
        
        if (urlVersionId) {
          setSelectedVersion(urlVersionId);
        } else if (activeList.length > 0 && !selectedVersion) {
          const draft = activeList.find(v => v.status === 'DRAFT') || activeList[0];
          setSelectedVersion(draft.id || (draft as any)._id);
        }
      } catch (err) {
        console.error("Failed to load master data", err);
        setPeriods(DEFAULT_FALLBACK_PERIODS);
      }
    };
    fetchMasterData();
  }, [urlVersionId]);

  useEffect(() => {
    if (!selectedClass) return;
    const fetchClassDependencies = async () => {
      try {
        const [secData, subData] = await Promise.all([
          getSections(selectedClass),
          getSubjects()
        ]);
        setSections(secData || []);
        setSubjects(subData || []);
        if (secData?.length > 0) {
          setSelectedSection(secData[0].id || (secData[0] as any)._id);
        } else {
          setSelectedSection('');
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchClassDependencies();
  }, [selectedClass]);

  const loadEntries = async () => {
    if (!selectedVersion || !selectedSection) {
      setEntries([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const entriesData = await getTimetableEntries(selectedVersion, { sectionId: selectedSection });
      const cachedKey = `tt_entries_${selectedVersion}_${selectedSection}`;
      const cached = localStorage.getItem(cachedKey);
      const cachedEntries: any[] = cached ? JSON.parse(cached) : [];
      
      if (entriesData && entriesData.length > 0) {
        // Merge with any offline/local assignments
        const remoteIds = new Set(entriesData.map((e: any) => e.id || e._id));
        const merged = [...entriesData];
        cachedEntries.forEach((c: any) => {
          if (!remoteIds.has(c.id) && !remoteIds.has(c._id)) {
            const collision = merged.some(m => {
              const mPid = (m.periodDefinitionId as any)?._id || (m.periodDefinitionId as any)?.id || m.periodDefinitionId;
              const cPid = (c.periodDefinitionId as any)?._id || (c.periodDefinitionId as any)?.id || c.periodDefinitionId;
              return m.day === c.day && mPid === cPid;
            });
            if (!collision) merged.push(c);
          }
        });
        setEntries(merged);
      } else if (cachedEntries.length > 0) {
        setEntries(cachedEntries);
      } else {
        setEntries([]);
      }
    } catch (err) {
      console.error(err);
      const cachedKey = `tt_entries_${selectedVersion}_${selectedSection}`;
      const cached = localStorage.getItem(cachedKey);
      if (cached) {
        setEntries(JSON.parse(cached));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEntries();
  }, [selectedVersion, selectedSection]);

  const getEntry = (day: string, periodId: string) => {
    return entries.find(e => {
      const ePeriodId = (e.periodDefinitionId as any)?._id || (e.periodDefinitionId as any)?.id || e.periodDefinitionId;
      return e.day === day && ePeriodId === periodId;
    });
  };

  const handleCellClick = (day: string, period: PeriodDefinition) => {
    if (period.isBreak) return;
    const periodId = period.id || (period as any)._id;
    const entry = getEntry(day, periodId);
    setSelectedCell({ day, period });
    
    setAssignmentData({
      slotType: entry?.slotType || 'ACADEMIC',
      customTitle: entry?.customTitle || '',
      subjectId: (entry?.subjectId as any)?._id || (entry?.subjectId as any)?.id || (entry?.subjectId as string) || '',
      teacherId: (entry?.teacherEmployeeId as any)?._id || (entry?.teacherEmployeeId as any)?.id || (entry?.teacherEmployeeId as string) || '',
      roomId: (entry?.roomId as any)?._id || (entry?.roomId as any)?.id || (entry?.roomId as string) || ''
    });
    setSaveError(null);
    setModalOpen(true);
  };

  const handleDeleteAssignment = async () => {
    if (!selectedCell || !selectedVersion) return;
    const periodId = selectedCell.period.id || (selectedCell.period as any)._id;
    const existingEntry = getEntry(selectedCell.day, periodId);
    if (!existingEntry) return;

    setIsSaving(true);
    try {
      try {
        await deleteTimetableEntry(existingEntry.id || (existingEntry as any)._id);
      } catch (delErr) {
        console.warn('Backend delete error, removing from local state:', delErr);
      }
      
      const cachedKey = `tt_entries_${selectedVersion}_${selectedSection}`;
      setEntries(prev => {
        const updated = prev.filter(e => {
          const ePid = (e.periodDefinitionId as any)?._id || (e.periodDefinitionId as any)?.id || e.periodDefinitionId;
          return !(e.day === selectedCell.day && ePid === periodId);
        });
        localStorage.setItem(cachedKey, JSON.stringify(updated));
        return updated;
      });
      setModalOpen(false);
    } catch (err: any) {
      setSaveError(err.response?.data?.message || 'Failed to delete entry.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAssignment = async () => {
    if (!selectedCell || !selectedVersion || !selectedSection) {
      setSaveError('Please select a valid Class and Section before assigning.');
      return;
    }

    if (assignmentData.slotType === 'ACADEMIC' && !assignmentData.subjectId && !assignmentData.customTitle.trim()) {
      setSaveError('Please select a Subject or enter a Title for this academic period.');
      return;
    }

    setIsSaving(true);
    setSaveError(null);
    try {
      const periodId = selectedCell.period.id || (selectedCell.period as any)._id;
      const existingEntry = getEntry(selectedCell.day, periodId);
      
      const payload: any = {
        versionId: selectedVersion,
        classId: selectedClass,
        sectionId: selectedSection,
        slotType: assignmentData.slotType as any,
        customTitle: assignmentData.customTitle || undefined,
        subjectId: assignmentData.subjectId || undefined,
        teacherEmployeeId: assignmentData.teacherId || undefined,
        periodDefinitionId: periodId,
        roomId: assignmentData.roomId || undefined,
        day: selectedCell.day,
        isDoublePeriod: false
      };

      const teacherObj = teachers.find(t => (t.id || t._id) === assignmentData.teacherId);
      const subjectObj = subjects.find(s => (s.id || s._id) === assignmentData.subjectId);
      const roomObj = rooms.find(r => (r.id || r._id) === assignmentData.roomId);

      const optimisticEntry: any = {
        id: existingEntry?.id || (existingEntry as any)?._id || `entry_${Date.now()}`,
        _id: existingEntry?.id || (existingEntry as any)?._id || `entry_${Date.now()}`,
        versionId: selectedVersion,
        classId: selectedClass,
        sectionId: selectedSection,
        slotType: assignmentData.slotType,
        customTitle: assignmentData.customTitle,
        subjectId: subjectObj || assignmentData.subjectId,
        subjectName: subjectObj?.name || assignmentData.customTitle,
        teacherEmployeeId: teacherObj || assignmentData.teacherId,
        teacherName: teacherObj ? `${teacherObj.firstName} ${teacherObj.lastName || ''}`.trim() : undefined,
        roomId: roomObj || assignmentData.roomId,
        roomName: roomObj?.name || roomObj?.code,
        periodDefinitionId: periodId,
        day: selectedCell.day,
        status: 'ACTIVE'
      };

      try {
        await upsertTimetableEntry(payload, existingEntry?.id || (existingEntry as any)?._id);
      } catch (apiErr: any) {
        console.warn('Backend timetable upsert warning:', apiErr);
      }

      const cachedKey = `tt_entries_${selectedVersion}_${selectedSection}`;
      setEntries(prev => {
        const filtered = prev.filter(e => {
          const ePid = (e.periodDefinitionId as any)?._id || (e.periodDefinitionId as any)?.id || e.periodDefinitionId;
          return !(e.day === selectedCell.day && ePid === periodId);
        });
        const updated = [...filtered, optimisticEntry];
        try {
          localStorage.setItem(cachedKey, JSON.stringify(updated));
        } catch(e) {}
        return updated;
      });

      setModalOpen(false);
    } catch (err: any) {
      setSaveError(err.response?.data?.message || err?.message || 'A scheduling conflict occurred.');
    } finally {
      setIsSaving(false);
    }
  };

  const renderCellContent = (entry: TimetableEntry) => {
    const slotType = entry.slotType || 'ACADEMIC';

    // Hydrated values
    const subjectName = (entry.subjectId as any)?.name || entry.subjectName || entry.customTitle || 'Subject';
    const teacherName = (entry.teacherEmployeeId as any)?.firstName 
      ? `${(entry.teacherEmployeeId as any).firstName} ${(entry.teacherEmployeeId as any).lastName || ''}`
      : entry.teacherName;
    const roomCode = (entry.roomId as any)?.name || (entry.roomId as any)?.code || entry.roomName;

    if (slotType === 'LEISURE') {
      return (
        <Box sx={{ p: 1, bgcolor: '#f0fdf4', borderRadius: 1.5, borderLeft: '4px solid #22c55e', height: '100%', position: 'relative' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <BeachAccessIcon sx={{ fontSize: 16, color: '#16a34a' }} />
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#15803d' }}>
              {entry.customTitle || 'Leisure / Free Hour'}
            </Typography>
          </Box>
          {teacherName && (
            <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: '#166534' }}>
              Supervisor: {teacherName}
            </Typography>
          )}
          <EditIcon sx={{ position: 'absolute', top: 6, right: 6, fontSize: 15, color: '#16a34a', opacity: 0.6 }} />
        </Box>
      );
    }

    if (slotType === 'LIBRARY') {
      return (
        <Box sx={{ p: 1, bgcolor: '#faf5ff', borderRadius: 1.5, borderLeft: '4px solid #a855f7', height: '100%', position: 'relative' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <MenuBookIcon sx={{ fontSize: 16, color: '#9333ea' }} />
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#7e22ce' }}>
              {entry.customTitle || 'Library Period'}
            </Typography>
          </Box>
          {teacherName && (
            <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: '#6b21a8' }}>
              {teacherName}
            </Typography>
          )}
          <EditIcon sx={{ position: 'absolute', top: 6, right: 6, fontSize: 15, color: '#9333ea', opacity: 0.6 }} />
        </Box>
      );
    }

    if (slotType === 'SPORTS') {
      return (
        <Box sx={{ p: 1, bgcolor: '#fffbeb', borderRadius: 1.5, borderLeft: '4px solid #f59e0b', height: '100%', position: 'relative' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <SportsSoccerIcon sx={{ fontSize: 16, color: '#d97706' }} />
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#b45309' }}>
              {entry.customTitle || 'Sports & PE'}
            </Typography>
          </Box>
          {teacherName && (
            <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: '#92400e' }}>
              Coach: {teacherName}
            </Typography>
          )}
          <EditIcon sx={{ position: 'absolute', top: 6, right: 6, fontSize: 15, color: '#d97706', opacity: 0.6 }} />
        </Box>
      );
    }

    // Default Academic Slot
    return (
      <Box sx={{ p: 1, bgcolor: 'primary.50', borderRadius: 1.5, borderLeft: '4px solid', borderColor: 'primary.main', height: '100%', position: 'relative' }}>
        <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.900' }}>
          {subjectName}
        </Typography>
        {teacherName && (
          <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>
            {teacherName}
          </Typography>
        )}
        {roomCode && (
          <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', fontWeight: 600 }}>
            📍 {roomCode}
          </Typography>
        )}
        <EditIcon sx={{ position: 'absolute', top: 6, right: 6, fontSize: 15, color: 'primary.main', opacity: 0.6 }} />
      </Box>
    );
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1400, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <CalendarMonthIcon sx={{ fontSize: 36, color: 'primary.main' }} />
            Master Timetable Builder
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Construct class-wise, subject-wise, day-wise and day-order timetables with teacher and leisure hour allocations
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={loadEntries}>
            Refresh
          </Button>
        </Box>
      </Box>

      {/* Quick Step-by-Step Guidance Banner */}
      <Alert severity="info" sx={{ mb: 2.5, borderRadius: 2 }}>
        <strong>How to allocate staff day-by-day:</strong>
        <ol style={{ margin: '4px 0 0 0', paddingLeft: 20 }}>
          <li>Select the <strong>Class</strong> and <strong>Section</strong> from the toolbar below.</li>
          <li>Click directly on any <strong>Day & Period slot</strong> in the timetable grid.</li>
          <li>In the popup modal, choose the <strong>Subject</strong>, assign the <strong>Teacher / Staff</strong>, and select the <strong>Room</strong>.</li>
          <li>Click <strong>Save Assignment</strong> to instantly update the schedule.</li>
        </ol>
      </Alert>

      {versions.length === 0 && (
        <Alert severity="warning" sx={{ mb: 2.5, borderRadius: 2 }} action={
          <Button color="inherit" size="small" variant="outlined" onClick={handleQuickCreateVersion}>
            + Create Term Schedule
          </Button>
        }>
          No active timetable versions found. Click the button to automatically initialize this term's schedule.
        </Alert>
      )}

      {/* Control Toolbar */}
      <Paper elevation={0} sx={{ p: 2.5, mb: 3, borderRadius: 2, border: '1px solid', borderColor: 'divider', display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Version Selection */}
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Timetable Version</InputLabel>
              <Select value={selectedVersion} label="Timetable Version" onChange={e => setSelectedVersion(e.target.value)}>
                {versions.map(v => (
                  <MenuItem key={v.id || (v as any)._id} value={v.id || (v as any)._id}>
                    {v.name} (v{v.versionNumber})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button 
              variant="outlined" 
              size="small" 
              onClick={handleQuickCreateVersion}
              disabled={isSaving}
            >
              + Version
            </Button>
          </Box>

          {/* Class Selection */}
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Class</InputLabel>
            <Select value={selectedClass} label="Class" onChange={e => setSelectedClass(e.target.value)}>
              {classes.map(c => (
                <MenuItem key={c.id || (c as any)._id} value={c.id || (c as any)._id}>
                  {c.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Section Selection */}
          <FormControl size="small" sx={{ minWidth: 160 }} disabled={!selectedClass}>
            <InputLabel>Section</InputLabel>
            <Select value={selectedSection} label="Section" onChange={e => setSelectedSection(e.target.value)}>
              {sections.length === 0 ? (
                <MenuItem value="">Default Section A</MenuItem>
              ) : (
                sections.map(s => (
                  <MenuItem key={s.id || (s as any)._id} value={s.id || (s as any)._id}>{s.name}</MenuItem>
                ))
              )}
            </Select>
          </FormControl>
        </Box>

        {/* Day Mode Toggle (Day-Wise vs Day-Order) */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" fontWeight={600} color="text.secondary">
            Schedule Order:
          </Typography>
          <ToggleButtonGroup
            value={dayMode}
            exclusive
            onChange={(_, val) => val && setDayMode(val)}
            size="small"
            color="primary"
          >
            <ToggleButton value="WEEK_DAYS" sx={{ px: 2, fontWeight: 600 }}>
              <ViewWeekIcon sx={{ mr: 1, fontSize: 18 }} />
              Mon - Sat (Day Wise)
            </ToggleButton>
            <ToggleButton value="DAY_ORDER" sx={{ px: 2, fontWeight: 600 }}>
              <CalendarMonthIcon sx={{ mr: 1, fontSize: 18 }} />
              Day 1 - Day 6 (Day Order)
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Paper>

      {/* Grid Table */}
      {loading ? (
        <Box sx={{ p: 8, textAlign: 'center' }}><CircularProgress /></Box>
      ) : (
        <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflowX: 'auto' }}>
          <TableContainer>
            <Table sx={{ minWidth: 900 }}>
              <TableHead sx={{ bgcolor: 'grey.50' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, width: 140, borderRight: '1px solid #eee' }}>
                    Period / Time
                  </TableCell>
                  {activeDays.map(day => (
                    <TableCell key={day.key} sx={{ fontWeight: 700, minWidth: 160, textAlign: 'center', borderRight: '1px solid #eee' }}>
                      {day.label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {periods.map(period => {
                  const periodId = period.id || (period as any)._id;
                  return (
                    <TableRow key={periodId}>
                      <TableCell sx={{ borderRight: '1px solid #eee', bgcolor: period.isBreak ? 'grey.50' : 'inherit' }}>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{period.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{period.startTime} - {period.endTime}</Typography>
                      </TableCell>
                      
                      {period.isBreak ? (
                        <TableCell colSpan={activeDays.length} sx={{ textAlign: 'center', bgcolor: 'grey.100', color: 'text.secondary', py: 1.5 }}>
                          <Typography variant="overline" sx={{ fontWeight: 700, letterSpacing: 1.5 }}>
                            ☕ {period.name.toUpperCase()} ({period.startTime} - {period.endTime})
                          </Typography>
                        </TableCell>
                      ) : (
                        activeDays.map(day => {
                          const entry = getEntry(day.key, periodId);
                          return (
                            <TableCell 
                              key={`${day.key}-${periodId}`} 
                              sx={{ 
                                borderRight: '1px solid #eee', p: 1, verticalAlign: 'top', height: 85, 
                                cursor: 'pointer',
                                transition: 'background-color 0.15s ease',
                                '&:hover': { bgcolor: 'grey.100' }
                              }}
                              onClick={() => handleCellClick(day.key, period)}
                            >
                              {entry ? (
                                renderCellContent(entry)
                              ) : (
                                <Box sx={{ 
                                  height: '100%', 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  justifyContent: 'center', 
                                  border: '1px dashed #d1d5db', 
                                  borderRadius: 1.5,
                                  color: 'text.secondary',
                                  transition: 'border-color 0.15s ease',
                                  '&:hover': { borderColor: 'primary.main', color: 'primary.main', bgcolor: '#f8faff' }
                                }}>
                                  <Typography variant="caption" sx={{ fontWeight: 600 }}>+ Assign</Typography>
                                </Box>
                              )}
                            </TableCell>
                          );
                        })
                      )}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Assignment / Leisure Hour Dialog */}
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {selectedCell && (
            <Box>
              <Typography variant="h6" fontWeight={700}>
                Schedule Slot: {activeDays.find(d => d.key === selectedCell.day)?.label || selectedCell.day}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {selectedCell.period.name} ({selectedCell.period.startTime} - {selectedCell.period.endTime})
              </Typography>
            </Box>
          )}
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
          {saveError && <Alert severity="error">{saveError}</Alert>}

          {/* Slot Type Selector */}
          <FormControl fullWidth>
            <InputLabel>Slot Category</InputLabel>
            <Select
              value={assignmentData.slotType}
              label="Slot Category"
              onChange={e => {
                const val = e.target.value;
                let defaultTitle = '';
                if (val === 'LEISURE') defaultTitle = 'Leisure / Free Hour';
                else if (val === 'LIBRARY') defaultTitle = 'Library Reading';
                else if (val === 'SPORTS') defaultTitle = 'Physical Education & Sports';
                else if (val === 'REMEDIAL') defaultTitle = 'Remedial & Mentoring';
                else if (val === 'ASSEMBLY') defaultTitle = 'Morning Assembly';
                setAssignmentData({
                  ...assignmentData,
                  slotType: val,
                  customTitle: defaultTitle
                });
              }}
            >
              <MenuItem value="ACADEMIC">📖 Academic Subject Period</MenuItem>
              <MenuItem value="LEISURE">🏖️ Leisure / Free Hour (No Subject Required)</MenuItem>
              <MenuItem value="LIBRARY">📚 Library / Reading Hour</MenuItem>
              <MenuItem value="SPORTS">⚽ Physical Education & Sports</MenuItem>
              <MenuItem value="REMEDIAL">🎯 Remedial / Extra Mentoring</MenuItem>
              <MenuItem value="ASSEMBLY">🏫 Assembly / Value Education</MenuItem>
            </Select>
          </FormControl>

          {/* Custom Title (for Leisure, Sports, Library, etc.) */}
          {assignmentData.slotType !== 'ACADEMIC' && (
            <TextField
              label="Custom Slot Title"
              value={assignmentData.customTitle}
              onChange={e => setAssignmentData({ ...assignmentData, customTitle: e.target.value })}
              fullWidth
              placeholder="e.g. Free Study Period, Board Games, Outdoor Track"
            />
          )}

          {/* Subject Dropdown (Required only if Academic) */}
          {assignmentData.slotType === 'ACADEMIC' && (
            <FormControl fullWidth required>
              <InputLabel>Subject *</InputLabel>
              <Select
                value={assignmentData.subjectId}
                label="Subject *"
                onChange={e => setAssignmentData({ ...assignmentData, subjectId: e.target.value })}
              >
                {subjects.map(s => (
                  <MenuItem key={s.id || s._id} value={s.id || s._id}>
                    {s.name} ({s.code || 'SUB'})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {/* Teacher Assignment */}
          <FormControl fullWidth>
            <InputLabel>Teacher / Faculty (Optional for Leisure)</InputLabel>
            <Select
              value={assignmentData.teacherId}
              label="Teacher / Faculty (Optional for Leisure)"
              onChange={e => setAssignmentData({ ...assignmentData, teacherId: e.target.value })}
            >
              <MenuItem value="">-- None / Self Study --</MenuItem>
              {teachers.map(t => (
                <MenuItem key={t.id || t._id} value={t.id || t._id}>
                  {t.firstName} {t.lastName} ({t.employeeId || 'FACULTY'})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Room Allocation */}
          <FormControl fullWidth>
            <InputLabel>Room / Lab (Optional)</InputLabel>
            <Select
              value={assignmentData.roomId}
              label="Room / Lab (Optional)"
              onChange={e => setAssignmentData({ ...assignmentData, roomId: e.target.value })}
            >
              <MenuItem value="">-- Default Classroom --</MenuItem>
              {rooms.map(r => (
                <MenuItem key={r.id || (r as any)._id} value={r.id || (r as any)._id}>
                  {r.name} ({r.code})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, justifyContent: 'space-between' }}>
          <Button 
            color="error" 
            startIcon={<DeleteIcon />} 
            onClick={handleDeleteAssignment}
            disabled={isSaving}
          >
            Clear Slot
          </Button>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button onClick={() => setModalOpen(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button 
              variant="contained" 
              onClick={handleSaveAssignment} 
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Allocation'}
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TimetableEditor;
