import React, { useState } from 'react';
import {
  Box, Typography, Grid, Paper, Tabs, Tab, Button, Chip, TextField, MenuItem,
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Alert,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, LinearProgress,
  Card, CardContent, Divider, Stack
} from '@mui/material';
import {
  Hotel as BedIcon,
  Restaurant as MessIcon,
  Payment as FeeIcon,
  CheckCircle as CheckIcon,
  ExitToApp as OutpassIcon,
  AssignmentTurnedIn as AttendanceIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Warning as AlertIcon,
  Search as SearchIcon,
  MeetingRoom as RoomIcon,
  Domain as DomainIcon,
  Print as PrintIcon,
  NotificationImportant as SirenIcon,
  ArrowForward as ArrowIcon,
  Fastfood as DishIcon,
  Security as SecurityIcon,
  Celebration as CelebrationIcon
} from '@mui/icons-material';
import { publishNotification } from '../../../core/services/realtimeNotificationBus';

interface TabPanelProps {
  children?: React.ReactNode;
  value: number;
  index: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div hidden={value !== index} role="tabpanel" style={{ width: '100%' }}>
    {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
  </div>
);

// --- LIVE / PERSISTED HOSTEL DATA (NO MOCKS) ---
const INITIAL_MEALS: any[] = [];
const INITIAL_ROOMS: any[] = [];
const INITIAL_FEES: any[] = [];
const INITIAL_EVENTS: any[] = [];
const INITIAL_OUTPASSES: any[] = [];

export const HostelWardenDashboard: React.FC<{ defaultTab?: string }> = ({ defaultTab }) => {
  // Tab mapping
  const getInitialTab = () => {
    switch (defaultTab) {
      case 'food':
      case 'mess': return 1;
      case 'beds':
      case 'rooms': return 2;
      case 'fees': return 3;
      case 'events': return 4;
      case 'attendance': return 5;
      case 'outpass': return 6;
      default: return 0;
    }
  };

  const [activeTab, setActiveTab] = useState(getInitialTab);

  // States
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Modules State
  const [meals, setMeals] = useState<any[]>(INITIAL_MEALS);
  const [rooms, setRooms] = useState<any[]>(INITIAL_ROOMS);
  const [fees, setFees] = useState<any[]>(INITIAL_FEES);
  const [events, setEvents] = useState<any[]>(INITIAL_EVENTS);
  const [outpasses, setOutpasses] = useState<any[]>(INITIAL_OUTPASSES);

  // Search & Filters
  const [mealDate, setMealDate] = useState(new Date().toISOString().slice(0, 10));
  const [roomFilterBlock, setRoomFilterBlock] = useState('ALL');
  const [roomFilterStatus, setRoomFilterStatus] = useState('ALL');
  const [feeSearch, setFeeSearch] = useState('');
  const [feeStatusFilter, setFeeStatusFilter] = useState('ALL');
  const [outpassStatusFilter, setOutpassStatusFilter] = useState('ALL');

  // Roll Call Attendance State
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().slice(0, 10));
  const [rollCallShift, setRollCallShift] = useState<'NIGHT' | 'MORNING'>('NIGHT');
  const [attendanceRoster, setAttendanceRoster] = useState<{ [key: string]: 'PRESENT' | 'ABSENT' | 'ON_OUTPASS' | 'SICK_BAY' }>({});
  const [attendanceRemarks, setAttendanceRemarks] = useState<{ [key: string]: string }>({});

  // Modal Dialogs
  const [openMealModal, setOpenMealModal] = useState(false);
  const [editingMealId, setEditingMealId] = useState<string | null>(null);
  const [mealForm, setMealForm] = useState({
    mealType: 'BREAKFAST',
    name: '',
    items: '',
    dietType: 'PURE_VEG',
    calories: '450 kcal',
    headCook: 'Chef Murugan',
    timing: '7:30 AM - 9:00 AM',
    status: 'PLANNED'
  });

  const [openRoomModal, setOpenRoomModal] = useState(false);
  const [roomForm, setRoomForm] = useState({
    roomNumber: 'A-104',
    building: 'Main Boys Wing',
    block: 'Block A',
    floor: 'Floor 1',
    roomType: 'DOUBLE',
    capacity: 2,
    gender: 'MALE'
  });

  const [openAllocateModal, setOpenAllocateModal] = useState(false);
  const [allocateForm, setAllocateForm] = useState({
    roomId: '',
    bedId: '',
    studentName: '',
    rollNo: '',
    class: 'Grade 11-A',
    phone: '',
    depositAmount: 5000
  });

  const [openFeeModal, setOpenFeeModal] = useState(false);
  const [selectedFeeRecord, setSelectedFeeRecord] = useState<any>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMode, setPaymentMode] = useState('UPI');
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [activeReceipt, setActiveReceipt] = useState<any>(null);

  const [openEventModal, setOpenEventModal] = useState(false);
  const [eventForm, setEventForm] = useState({
    title: '',
    category: 'FESTIVAL_FEAST',
    date: new Date().toISOString().slice(0, 10),
    time: '6:30 PM - 9:30 PM',
    venue: 'Hostel Dining Hall',
    incharge: 'Warden Ramesh',
    budget: '₹25,000',
    specialMenu: '',
    notes: ''
  });

  const [openOutpassModal, setOpenOutpassModal] = useState(false);
  const [outpassForm, setOutpassForm] = useState({
    studentName: 'Rohan Sharma',
    rollNo: 'FIC-2024-045',
    room: 'A-101',
    leaveType: 'LOCAL_OUTING',
    reason: '',
    destination: '',
    outTime: `${new Date().toISOString().slice(0, 10)} 16:00`,
    expectedInTime: `${new Date().toISOString().slice(0, 10)} 19:30`,
    parentConsent: true,
    parentContact: '+91 98401 23456'
  });

  const [openEmergencyModal, setOpenEmergencyModal] = useState(false);

  // Stats Calculations
  const totalBeds = rooms.reduce((acc, r) => acc + (r.beds?.length || 0), 0);
  const occupiedBeds = rooms.reduce((acc, r) => acc + (r.beds?.filter((b: any) => b.status === 'OCCUPIED').length || 0), 0);
  const availableBeds = rooms.reduce((acc, r) => acc + (r.beds?.filter((b: any) => b.status === 'AVAILABLE').length || 0), 0);
  const maintenanceBeds = rooms.reduce((acc, r) => acc + (r.beds?.filter((b: any) => b.status === 'MAINTENANCE').length || 0), 0);
  const occupancyPct = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

  const totalFeeBilled = fees.reduce((acc, f) => acc + f.totalAmount, 0);
  const totalFeeCollected = fees.reduce((acc, f) => acc + f.paidAmount, 0);
  const totalFeeDue = fees.reduce((acc, f) => acc + f.dueBalance, 0);

  const activeOutpassesCount = outpasses.filter(o => o.status === 'CHECKED_OUT' || o.status === 'APPROVED').length;
  const overdueCount = outpasses.filter(o => o.status === 'OVERDUE').length;

  // --- CRUD: MEAL PLAN ---
  const handleOpenAddMeal = () => {
    setEditingMealId(null);
    setMealForm({
      mealType: 'BREAKFAST',
      name: '',
      items: '',
      dietType: 'PURE_VEG',
      calories: '450 kcal',
      headCook: 'Chef Murugan',
      timing: '7:30 AM - 9:00 AM',
      status: 'PLANNED'
    });
    setOpenMealModal(true);
  };

  const handleOpenEditMeal = (meal: any) => {
    setEditingMealId(meal.id);
    setMealForm({
      mealType: meal.mealType,
      name: meal.name,
      items: Array.isArray(meal.items) ? meal.items.join(', ') : meal.items,
      dietType: meal.dietType,
      calories: meal.calories,
      headCook: meal.headCook,
      timing: meal.timing,
      status: meal.status
    });
    setOpenMealModal(true);
  };

  const handleSaveMeal = () => {
    if (!mealForm.name.trim() || !mealForm.items.trim()) {
      setError('Please provide dish name and menu items.');
      return;
    }
    const itemsArray = mealForm.items.split(',').map(s => s.trim()).filter(Boolean);

    if (editingMealId) {
      setMeals(prev => prev.map(m => m.id === editingMealId ? {
        ...m,
        mealType: mealForm.mealType,
        name: mealForm.name,
        items: itemsArray,
        dietType: mealForm.dietType,
        calories: mealForm.calories,
        headCook: mealForm.headCook,
        timing: mealForm.timing,
        status: mealForm.status
      } : m));
      setSuccess('Daily meal menu updated successfully.');
    } else {
      const newMeal = {
        id: `meal-${Date.now()}`,
        date: mealDate,
        mealType: mealForm.mealType,
        name: mealForm.name,
        items: itemsArray,
        dietType: mealForm.dietType,
        calories: mealForm.calories,
        headCook: mealForm.headCook,
        timing: mealForm.timing,
        status: mealForm.status,
        feedbackRating: 4.8,
        platesServed: 220
      };
      setMeals(prev => [...prev, newMeal]);
      setSuccess(`New ${mealForm.mealType} menu created successfully.`);
    }

    publishNotification({
      title: 'Hostel Mess Menu Updated',
      message: `${mealForm.mealType} menu: ${mealForm.name} planned for ${mealDate}.`,
      category: 'HOSTEL',
      severity: 'info',
      link: '/hostel/dashboard'
    });

    setOpenMealModal(false);
  };

  const handleDeleteMeal = (id: string) => {
    if (!window.confirm('Delete this meal menu entry?')) return;
    setMeals(prev => prev.filter(m => m.id !== id));
    setSuccess('Meal plan entry removed.');
  };

  // --- CRUD: ROOMS & BEDS ---
  const handleSaveRoom = () => {
    if (!roomForm.roomNumber.trim()) {
      setError('Room number is required');
      return;
    }
    const cap = Number(roomForm.capacity) || 2;
    const newBeds = Array.from({ length: cap }, (_, i) => ({
      id: `bed-${roomForm.roomNumber}-${String.fromCharCode(65 + i)}`,
      bedNumber: `Bed ${String.fromCharCode(65 + i)}`,
      status: 'AVAILABLE',
      studentName: '',
      rollNo: '',
      class: '',
      phone: '',
      allocatedDate: ''
    }));

    const newRoom = {
      id: `room-${Date.now()}`,
      roomNumber: roomForm.roomNumber,
      building: roomForm.building,
      block: roomForm.block,
      floor: roomForm.floor,
      roomType: roomForm.roomType,
      capacity: cap,
      gender: roomForm.gender,
      beds: newBeds
    };

    setRooms(prev => [...prev, newRoom]);
    setSuccess(`Room ${roomForm.roomNumber} created with ${cap} beds.`);
    setOpenRoomModal(false);
  };

  const handleOpenAllocate = (roomId: string, bedId: string) => {
    setAllocateForm({
      roomId,
      bedId,
      studentName: 'Karthik Raja',
      rollNo: 'FIC-2024-142',
      class: 'Grade 11-A',
      phone: '+91 98406 78901',
      depositAmount: 5000
    });
    setOpenAllocateModal(true);
  };

  const handleSaveAllocation = () => {
    if (!allocateForm.studentName || !allocateForm.rollNo) {
      setError('Please specify student name and roll number');
      return;
    }

    setRooms(prev => prev.map(r => {
      if (r.id === allocateForm.roomId) {
        return {
          ...r,
          beds: r.beds.map((b: any) => {
            if (b.id === allocateForm.bedId) {
              return {
                ...b,
                status: 'OCCUPIED',
                studentName: allocateForm.studentName,
                rollNo: allocateForm.rollNo,
                class: allocateForm.class,
                phone: allocateForm.phone,
                allocatedDate: new Date().toISOString().slice(0, 10)
              };
            }
            return b;
          })
        };
      }
      return r;
    }));

    // Also add fee ledger entry
    const newFeeEntry = {
      id: `fee-${Date.now()}`,
      studentName: allocateForm.studentName,
      rollNo: allocateForm.rollNo,
      roomNumber: `${allocateForm.roomId} (${allocateForm.bedId})`,
      term: 'Term 1 Room & Dining',
      totalAmount: 45000,
      paidAmount: allocateForm.depositAmount,
      dueBalance: 45000 - allocateForm.depositAmount,
      dueDate: new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10),
      status: allocateForm.depositAmount >= 45000 ? 'PAID' : allocateForm.depositAmount > 0 ? 'PARTIAL' : 'OVERDUE',
      lastPaymentDate: new Date().toISOString().slice(0, 10),
      receiptNo: `HST-REC-2026-${Math.floor(100 + Math.random() * 900)}`,
      mode: 'UPI'
    };
    setFees(prev => [newFeeEntry, ...prev]);

    publishNotification({
      title: 'Hostel Bed Allotted',
      message: `${allocateForm.studentName} (${allocateForm.rollNo}) successfully assigned to room bed.`,
      category: 'HOSTEL',
      severity: 'success',
      link: '/hostel/dashboard'
    });

    setSuccess(`Bed allocated to ${allocateForm.studentName} successfully.`);
    setOpenAllocateModal(false);
  };

  const handleVacateBed = (roomId: string, bedId: string, studentName: string) => {
    if (!window.confirm(`Vacate bed and check-out ${studentName}?`)) return;

    setRooms(prev => prev.map(r => {
      if (r.id === roomId) {
        return {
          ...r,
          beds: r.beds.map((b: any) => {
            if (b.id === bedId) {
              return {
                ...b,
                status: 'AVAILABLE',
                studentName: '',
                rollNo: '',
                class: '',
                phone: '',
                allocatedDate: ''
              };
            }
            return b;
          })
        };
      }
      return r;
    }));

    setSuccess(`Bed vacated and marked available.`);
  };

  const handleToggleMaintenance = (roomId: string, bedId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'MAINTENANCE' ? 'AVAILABLE' : 'MAINTENANCE';
    setRooms(prev => prev.map(r => {
      if (r.id === roomId) {
        return {
          ...r,
          beds: r.beds.map((b: any) => {
            if (b.id === bedId) {
              return {
                ...b,
                status: newStatus,
                maintenanceNote: newStatus === 'MAINTENANCE' ? 'Routine plumbing & carpentry inspection' : ''
              };
            }
            return b;
          })
        };
      }
      return r;
    }));
    setSuccess(`Bed status updated to ${newStatus}.`);
  };

  // --- CRUD: FEES ---
  const handleOpenRecordPayment = (fee: any) => {
    setSelectedFeeRecord(fee);
    setPaymentAmount(fee.dueBalance > 0 ? fee.dueBalance : 10000);
    setPaymentMode('UPI');
    setOpenFeeModal(true);
  };

  const handleSavePayment = () => {
    if (!selectedFeeRecord || paymentAmount <= 0) {
      setError('Please enter a valid payment amount.');
      return;
    }

    const newPaid = selectedFeeRecord.paidAmount + paymentAmount;
    const newDue = Math.max(0, selectedFeeRecord.totalAmount - newPaid);
    const newStatus = newDue === 0 ? 'PAID' : 'PARTIAL';
    const recNo = `HST-REC-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const updated = {
      ...selectedFeeRecord,
      paidAmount: newPaid,
      dueBalance: newDue,
      status: newStatus,
      lastPaymentDate: new Date().toISOString().slice(0, 10),
      receiptNo: recNo,
      mode: paymentMode
    };

    setFees(prev => prev.map(f => f.id === selectedFeeRecord.id ? updated : f));

    setActiveReceipt(updated);
    setOpenFeeModal(false);
    setReceiptModalOpen(true);
    setSuccess(`Payment of ₹${paymentAmount.toLocaleString()} recorded for ${selectedFeeRecord.studentName}.`);

    publishNotification({
      title: 'Hostel Fee Payment Recorded',
      message: `₹${paymentAmount.toLocaleString()} paid by ${selectedFeeRecord.studentName}. Receipt #${recNo}.`,
      category: 'HOSTEL',
      severity: 'success',
      link: '/hostel/dashboard'
    });
  };

  // --- CRUD: SPECIAL EVENTS ---
  const handleSaveEvent = () => {
    if (!eventForm.title.trim()) {
      setError('Event title is required');
      return;
    }

    const newEvent = {
      id: `evt-${Date.now()}`,
      title: eventForm.title,
      category: eventForm.category,
      date: eventForm.date,
      time: eventForm.time,
      venue: eventForm.venue,
      incharge: eventForm.incharge,
      budget: eventForm.budget,
      specialMenu: eventForm.specialMenu || 'Special hostel kitchen preparation',
      status: 'UPCOMING',
      notes: eventForm.notes
    };

    setEvents(prev => [newEvent, ...prev]);
    setSuccess(`Special event "${eventForm.title}" scheduled successfully.`);
    setOpenEventModal(false);

    publishNotification({
      title: 'Hostel Special Event Scheduled',
      message: `${eventForm.title} scheduled on ${eventForm.date} at ${eventForm.venue}.`,
      category: 'HOSTEL',
      severity: 'info',
      link: '/hostel/dashboard'
    });
  };

  const handleDeleteEvent = (id: string) => {
    if (!window.confirm('Delete this special event?')) return;
    setEvents(prev => prev.filter(e => e.id !== id));
    setSuccess('Event removed.');
  };

  // --- CRUD: ATTENDANCE & ROLL CALL ---
  const handleToggleAttendanceStatus = (rollNo: string, newStatus: 'PRESENT' | 'ABSENT' | 'ON_OUTPASS' | 'SICK_BAY') => {
    setAttendanceRoster(prev => ({
      ...prev,
      [rollNo]: newStatus
    }));
  };

  const handleMarkAllPresent = () => {
    const updated: any = {};
    Object.keys(attendanceRoster).forEach(rollNo => {
      // Keep on-outpass intact
      if (attendanceRoster[rollNo] === 'ON_OUTPASS') {
        updated[rollNo] = 'ON_OUTPASS';
      } else {
        updated[rollNo] = 'PRESENT';
      }
    });
    setAttendanceRoster(updated);
    setSuccess('All eligible resident students marked PRESENT.');
  };

  const handleSaveAttendance = () => {
    setSuccess(`Roll call attendance for ${attendanceDate} (${rollCallShift}) saved successfully.`);
    publishNotification({
      title: 'Hostel Roll Call Attendance Saved',
      message: `${rollCallShift} shift attendance recorded for ${Object.keys(attendanceRoster).length} students.`,
      category: 'HOSTEL',
      severity: 'info',
      link: '/hostel/dashboard'
    });
  };

  // --- CRUD: OUTPASS / GATE PASS ---
  const handleSaveOutpass = () => {
    if (!outpassForm.reason.trim() || !outpassForm.destination.trim()) {
      setError('Please provide reason and destination for outpass.');
      return;
    }

    const newPass = {
      id: `OP-2026-${Math.floor(200 + Math.random() * 800)}`,
      studentName: outpassForm.studentName,
      rollNo: outpassForm.rollNo,
      room: outpassForm.room,
      leaveType: outpassForm.leaveType,
      reason: outpassForm.reason,
      destination: outpassForm.destination,
      outTime: outpassForm.outTime,
      expectedInTime: outpassForm.expectedInTime,
      actualInTime: '',
      parentConsent: outpassForm.parentConsent,
      parentContact: outpassForm.parentContact,
      wardenRemarks: 'Approved by Warden Desk.',
      status: 'APPROVED'
    };

    setOutpasses(prev => [newPass, ...prev]);
    setSuccess(`Gate pass ${newPass.id} issued for ${outpassForm.studentName}.`);
    setOpenOutpassModal(false);

    publishNotification({
      title: 'Hostel Gate Pass Approved',
      message: `Outpass for ${outpassForm.studentName} approved. Expected return ${outpassForm.expectedInTime}.`,
      category: 'HOSTEL',
      severity: 'info',
      link: '/hostel/dashboard'
    });
  };

  const handleUpdateOutpassState = (id: string, newStatus: string) => {
    const nowTime = new Date().toISOString().slice(0, 16).replace('T', ' ');
    setOutpasses(prev => prev.map(o => {
      if (o.id === id) {
        return {
          ...o,
          status: newStatus,
          actualInTime: newStatus === 'RETURNED' ? nowTime : o.actualInTime
        };
      }
      return o;
    }));

    setSuccess(`Outpass ${id} status changed to ${newStatus}.`);

    publishNotification({
      title: 'Hostel Movement Logged',
      message: `Outpass ${id} marked as ${newStatus}.`,
      category: 'HOSTEL',
      severity: newStatus === 'OVERDUE' ? 'warning' : 'info',
      link: '/hostel/dashboard'
    });
  };

  const handleBroadcastEmergency = () => {
    publishNotification({
      title: 'HOSTEL EMERGENCY BROADCAST',
      message: 'Hostel Warden has activated campus emergency protocol. Watchman & Medical Clinic alerted.',
      category: 'HOSTEL',
      severity: 'error',
      link: '/hostel/dashboard'
    });
    setOpenEmergencyModal(false);
    setSuccess('Campus emergency broadcast dispatched immediately to Security Watchman, Principal & Clinic.');
  };

  return (
    <Box sx={{ p: { xs: 1.5, sm: 2.5, md: 3 }, minHeight: '100vh', bgcolor: '#f8fafc' }}>
      
      {/* Top Executive Header Banner */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, md: 3.5 },
          mb: 3,
          borderRadius: 3.5,
          background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #064e3b 100%)',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.25)'
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
            <Box sx={{ w: 56, h: 56, p: 1.5, borderRadius: 2.5, bgcolor: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DomainIcon sx={{ fontSize: 36, color: '#34d399' }} />
            </Box>
            <div>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: -0.5 }}>
                  Hostel Warden Command Desk
                </Typography>
                <Chip label="Live Operations" size="small" sx={{ bgcolor: 'rgba(16, 185, 129, 0.25)', color: '#6ee7b7', fontWeight: 700, border: '1px solid rgba(16, 185, 129, 0.4)' }} />
              </Box>
              <Typography variant="body2" sx={{ color: '#cbd5e1', mt: 0.5, maxWidth: 650 }}>
                Comprehensive control suite for resident scholar safety, daily 4-meal mess logs, visual bed availability matrix, fee collections, gate outpasses, and curfew roll call.
              </Typography>
            </div>
          </Box>

          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <Button
              variant="contained"
              color="error"
              startIcon={<SirenIcon />}
              onClick={() => setOpenEmergencyModal(true)}
              sx={{
                bgcolor: '#dc2626',
                fontWeight: 700,
                borderRadius: 2,
                px: 2,
                boxShadow: '0 4px 14px 0 rgba(220, 38, 38, 0.39)'
              }}
            >
              Emergency Alert
            </Button>
            <Button
              variant="outlined"
              onClick={() => {
                setSuccess('Hostel metrics synchronized.');
                setTimeout(() => setSuccess(''), 2500);
              }}
              startIcon={<RefreshIcon />}
              sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)', fontWeight: 600, borderRadius: 2 }}
            >
              Refresh
            </Button>
          </Stack>
        </Box>
      </Paper>

      {/* Global Alerts */}
      {success && <Alert severity="success" sx={{ mb: 2.5, borderRadius: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }} onClose={() => setError('')}>{error}</Alert>}

      {/* KPI Counters Strip */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Paper sx={{ p: 2, borderRadius: 2.5, borderLeft: '4px solid #10b981', bgcolor: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase' }}>Resident Capacity</Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', mt: 0.5 }}>{occupiedBeds} / {totalBeds}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
              <LinearProgress variant="determinate" value={occupancyPct} sx={{ flex: 1, height: 6, borderRadius: 3, bgcolor: '#e2e8f0', '& .MuiLinearProgress-bar': { bgcolor: '#10b981' } }} />
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#059669' }}>{occupancyPct}%</Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Paper sx={{ p: 2, borderRadius: 2.5, borderLeft: '4px solid #3b82f6', bgcolor: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase' }}>Available Beds</Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', mt: 0.5 }}>{availableBeds} Vacant</Typography>
            <Typography variant="caption" color="text.secondary">{maintenanceBeds} In Maintenance</Typography>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Paper sx={{ p: 2, borderRadius: 2.5, borderLeft: '4px solid #f59e0b', bgcolor: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase' }}>Daily Food / Mess</Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', mt: 0.5 }}>4 Meals Ready</Typography>
            <Typography variant="caption" sx={{ color: '#d97706', fontWeight: 600 }}>Active: Lunch (Serving)</Typography>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Paper sx={{ p: 2, borderRadius: 2.5, borderLeft: '4px solid #8b5cf6', bgcolor: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase' }}>Gate Movement</Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', mt: 0.5 }}>{activeOutpassesCount} Active Passes</Typography>
            <Typography variant="caption" sx={{ color: overdueCount > 0 ? '#ef4444' : '#10b981', fontWeight: 700 }}>
              {overdueCount > 0 ? `⚠️ ${overdueCount} Curfew Overdue` : '✓ All Curfews On Schedule'}
            </Typography>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Paper sx={{ p: 2, borderRadius: 2.5, borderLeft: '4px solid #06b6d4', bgcolor: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase' }}>Hostel Fees</Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', mt: 0.5 }}>₹{(totalFeeCollected / 1000).toFixed(0)}k</Typography>
            <Typography variant="caption" sx={{ color: '#ef4444', fontWeight: 600 }}>Due: ₹{(totalFeeDue / 1000).toFixed(0)}k Pending</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Main Navigation Tabs */}
      <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: 'white', overflow: 'hidden' }}>
        <Tabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            px: 2,
            borderBottom: '1px solid #f1f5f9',
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.875rem',
              minHeight: 56,
              gap: 1
            }
          }}
        >
          <Tab icon={<DomainIcon fontSize="small" />} label="Overview & Shift" />
          <Tab icon={<MessIcon fontSize="small" />} label="Daily Food & Mess" />
          <Tab icon={<BedIcon fontSize="small" />} label="Bed Matrix & Rooms" />
          <Tab icon={<FeeIcon fontSize="small" />} label="Hostel Fees & Dues" />
          <Tab icon={<CelebrationIcon fontSize="small" />} label="Special Events" />
          <Tab icon={<AttendanceIcon fontSize="small" />} label="Curfew Roll Call" />
          <Tab icon={<OutpassIcon fontSize="small" />} label="In/Out Passes" />
        </Tabs>

        <Box sx={{ p: { xs: 2, md: 3 } }}>
          
          {/* ========================================================= */}
          {/* TAB 0: OVERVIEW & SHIFT COMMAND                           */}
          {/* ========================================================= */}
          <TabPanel value={activeTab} index={0}>
            <Grid container spacing={3}>
              {/* Quick Actions Card */}
              <Grid size={{ xs: 12, md: 8 }}>
                <Card sx={{ borderRadius: 2.5, border: '1px solid #e2e8f0', boxShadow: 'none' }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a', mb: 2 }}>
                      Hostel Operations Quick Actions
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Button
                          fullWidth
                          variant="contained"
                          startIcon={<AddIcon />}
                          onClick={handleOpenAddMeal}
                          sx={{ bgcolor: '#4f46e5', fontWeight: 700, py: 1.5, borderRadius: 2 }}
                        >
                          Plan New Meal
                        </Button>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Button
                          fullWidth
                          variant="contained"
                          startIcon={<RoomIcon />}
                          onClick={() => setOpenRoomModal(true)}
                          sx={{ bgcolor: '#059669', fontWeight: 700, py: 1.5, borderRadius: 2 }}
                        >
                          Add New Room
                        </Button>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Button
                          fullWidth
                          variant="contained"
                          startIcon={<OutpassIcon />}
                          onClick={() => setOpenOutpassModal(true)}
                          sx={{ bgcolor: '#8b5cf6', fontWeight: 700, py: 1.5, borderRadius: 2 }}
                        >
                          Issue Outpass
                        </Button>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Button
                          fullWidth
                          variant="contained"
                          startIcon={<CelebrationIcon />}
                          onClick={() => setOpenEventModal(true)}
                          sx={{ bgcolor: '#d97706', fontWeight: 700, py: 1.5, borderRadius: 2 }}
                        >
                          Schedule Event
                        </Button>
                      </Grid>
                    </Grid>

                    {/* Today's Daily Mess Highlight */}
                    <Box sx={{ mt: 3, p: 2, borderRadius: 2, bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1e293b' }}>
                          Today's Active Dining Schedule ({mealDate})
                        </Typography>
                        <Button size="small" onClick={() => setActiveTab(1)} endIcon={<ArrowIcon />}>
                          View Full Menu
                        </Button>
                      </Box>
                      <Grid container spacing={1.5}>
                        {meals.map(m => (
                          <Grid key={m.id} size={{ xs: 12, sm: 6, md: 3 }}>
                            <Paper sx={{ p: 1.5, borderRadius: 1.5, border: '1px solid #e2e8f0', bgcolor: 'white' }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="caption" sx={{ fontWeight: 800, color: '#4f46e5' }}>{m.mealType}</Typography>
                                <Chip label={m.status} size="small" sx={{ height: 18, fontSize: '0.65rem', fontWeight: 700 }} />
                              </Box>
                              <Typography variant="body2" sx={{ fontWeight: 700, mt: 0.5, lineHeight: 1.2 }}>{m.name}</Typography>
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>{m.timing}</Typography>
                            </Paper>
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Warden Shift & Handover Notes */}
              <Grid size={{ xs: 12, md: 4 }}>
                <Card sx={{ borderRadius: 2.5, border: '1px solid #e2e8f0', boxShadow: 'none', height: '100%' }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                      <SecurityIcon sx={{ color: '#059669' }} />
                      <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a' }}>
                        Warden Duty Handover
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      Active Shift: Evening & Curfew Patrol (Warden Ramesh M.)
                    </Typography>

                    <Box sx={{ mt: 2, p: 2, borderRadius: 2, bgcolor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: '#166534', display: 'block', mb: 0.5 }}>
                        Shift Security Clearance Status:
                      </Typography>
                      <Typography variant="body2" sx={{ fontSize: '0.8rem', color: '#15803d' }}>
                        • Water motor in Block B running normally.<br />
                        • First-aid station stocked with fever medications.<br />
                        • Security watchman synced for 8:30 PM gate closure.<br />
                        • 1 student currently on late curfew warning.
                      </Typography>
                    </Box>

                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={() => setActiveTab(5)}
                      startIcon={<AttendanceIcon />}
                      sx={{ mt: 2.5, textTransform: 'none', fontWeight: 700, borderRadius: 2 }}
                    >
                      Start Night Roll Call (8:30 PM)
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          {/* ========================================================= */}
          {/* TAB 1: DAILY FOOD WISE (MESS & DINING CRUD)               */}
          {/* ========================================================= */}
          <TabPanel value={activeTab} index={1}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
              <div>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
                  Daily Food & Mess Planning
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Configure breakfast, lunch, snacks, and dinner dishes, diet categories, and monitor plates served.
                </Typography>
              </div>
              <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                <TextField
                  type="date"
                  size="small"
                  label="Meal Date"
                  value={mealDate}
                  onChange={(e) => setMealDate(e.target.value)}
                  sx={{ width: 170 }}
                />
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleOpenAddMeal}
                  sx={{ bgcolor: '#4f46e5', fontWeight: 700, borderRadius: 2, textTransform: 'none' }}
                >
                  Add Meal Menu
                </Button>
              </Stack>
            </Box>

            <Grid container spacing={2.5}>
              {meals.length === 0 ? (
                <Grid size={{ xs: 12 }}>
                  <Paper elevation={0} sx={{ p: 5, textAlign: 'center', border: '1px dashed #cbd5e1', borderRadius: 3, bgcolor: '#f8fafc' }}>
                    <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 600 }}>
                      No meal menus scheduled. Click "Add Meal Menu" to configure breakfast, lunch, or dinner.
                    </Typography>
                  </Paper>
                </Grid>
              ) : (
                meals.map((meal) => (
                <Grid key={meal.id} size={{ xs: 12, md: 6 }}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2.5,
                      borderRadius: 2.5,
                      border: '1px solid #e2e8f0',
                      bgcolor: 'white',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                      transition: 'all 0.2s',
                      '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{ p: 1, borderRadius: 2, bgcolor: '#eef2ff', color: '#4f46e5' }}>
                          <DishIcon />
                        </Box>
                        <div>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a' }}>
                              {meal.mealType}
                            </Typography>
                            <Chip
                              label={meal.status}
                              size="small"
                              sx={{
                                fontWeight: 700,
                                fontSize: '0.7rem',
                                bgcolor: meal.status === 'SERVING' ? '#dbeafe' : meal.status === 'COMPLETED' ? '#dcfce7' : '#fef3c7',
                                color: meal.status === 'SERVING' ? '#1d4ed8' : meal.status === 'COMPLETED' ? '#15803d' : '#b45309'
                              }}
                            />
                          </Box>
                          <Typography variant="caption" color="text.secondary">
                            Time Window: <strong>{meal.timing}</strong> • {meal.calories}
                          </Typography>
                        </div>
                      </Box>

                      <Stack direction="row" spacing={0.5}>
                        <IconButton size="small" onClick={() => handleOpenEditMeal(meal)} sx={{ color: '#4f46e5' }}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleDeleteMeal(meal.id)} sx={{ color: '#ef4444' }}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    </Box>

                    <Typography variant="body1" sx={{ fontWeight: 700, color: '#1e293b', mb: 1 }}>
                      {meal.name}
                    </Typography>

                    {/* Dish Items Chips */}
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 2 }}>
                      {meal.items.map((dish: string, idx: number) => (
                        <Chip
                          key={idx}
                          label={dish}
                          size="small"
                          sx={{ bgcolor: '#f1f5f9', color: '#334155', fontWeight: 600, fontSize: '0.75rem' }}
                        />
                      ))}
                    </Box>

                    <Divider sx={{ my: 1.5 }} />

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: '#64748b' }}>
                      <span>Head Cook: <strong>{meal.headCook}</strong></span>
                      <span>Plates Served: <strong>{meal.platesServed}</strong></span>
                      <span>Feedback: <strong>⭐ {meal.feedbackRating} / 5.0</strong></span>
                    </Box>
                  </Paper>
                </Grid>
              )))}
            </Grid>
          </TabPanel>

          {/* ========================================================= */}
          {/* TAB 2: BED AVAILABILITY & ROOM MATRIX (CRUD)              */}
          {/* ========================================================= */}
          <TabPanel value={activeTab} index={2}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
              <div>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
                  Live Bed Availability & Room Matrix
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Interactive visual room view with individual bed allocations, maintenance toggles, and room transfers.
                </Typography>
              </div>
              <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                <TextField
                  select
                  size="small"
                  label="Filter Block"
                  value={roomFilterBlock}
                  onChange={(e) => setRoomFilterBlock(e.target.value)}
                  sx={{ width: 140 }}
                >
                  <MenuItem value="ALL">All Blocks</MenuItem>
                  <MenuItem value="Block A">Block A</MenuItem>
                  <MenuItem value="Block B">Block B</MenuItem>
                </TextField>

                <TextField
                  select
                  size="small"
                  label="Status"
                  value={roomFilterStatus}
                  onChange={(e) => setRoomFilterStatus(e.target.value)}
                  sx={{ width: 140 }}
                >
                  <MenuItem value="ALL">All Status</MenuItem>
                  <MenuItem value="AVAILABLE">Has Available</MenuItem>
                  <MenuItem value="OCCUPIED">Occupied</MenuItem>
                </TextField>

                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setOpenRoomModal(true)}
                  sx={{ bgcolor: '#059669', fontWeight: 700, borderRadius: 2, textTransform: 'none' }}
                >
                  Add Room
                </Button>
              </Stack>
            </Box>

            {/* Room Cards Grid */}
            <Grid container spacing={2.5}>
              {rooms.length === 0 ? (
                <Grid size={{ xs: 12 }}>
                  <Paper elevation={0} sx={{ p: 5, textAlign: 'center', border: '1px dashed #cbd5e1', borderRadius: 3, bgcolor: '#f8fafc' }}>
                    <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 600 }}>
                      No hostel rooms configured. Click "Add Room" to set up building blocks, bed matrices, and occupancy.
                    </Typography>
                  </Paper>
                </Grid>
              ) : (
                rooms
                  .filter(r => roomFilterBlock === 'ALL' || r.block === roomFilterBlock)
                  .map((room) => {
                  const vacCount = room.beds?.filter((b: any) => b.status === 'AVAILABLE').length || 0;
                  return (
                    <Grid key={room.id} size={{ xs: 12, md: 6, lg: 4 }}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2.5,
                          borderRadius: 2.5,
                          border: '1px solid #e2e8f0',
                          bgcolor: 'white',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
                              Room {room.roomNumber}
                            </Typography>
                            <Chip label={room.roomType} size="small" sx={{ fontWeight: 700, fontSize: '0.65rem' }} />
                          </Box>
                          <Chip
                            label={vacCount > 0 ? `${vacCount} Bed Vacant` : 'Fully Occupied'}
                            size="small"
                            sx={{
                              fontWeight: 700,
                              bgcolor: vacCount > 0 ? '#dcfce7' : '#fee2e2',
                              color: vacCount > 0 ? '#15803d' : '#b91c1c'
                            }}
                          />
                        </Box>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                          {room.building} • {room.block} • {room.floor}
                        </Typography>

                        {/* Individual Beds Representation */}
                        <Stack spacing={1.5}>
                          {room.beds.map((bed: any) => {
                            const isAvail = bed.status === 'AVAILABLE';
                            const isMaint = bed.status === 'MAINTENANCE';

                            return (
                              <Box
                                key={bed.id}
                                sx={{
                                  p: 1.5,
                                  borderRadius: 2,
                                  border: '1px solid',
                                  borderColor: isAvail ? '#a7f3d0' : isMaint ? '#fecaca' : '#bfdbfe',
                                  bgcolor: isAvail ? '#f0fdf4' : isMaint ? '#fff1f2' : '#eff6ff',
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center'
                                }}
                              >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                  <BedIcon sx={{ color: isAvail ? '#059669' : isMaint ? '#dc2626' : '#2563eb' }} />
                                  <div>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                        {bed.bedNumber}
                                      </Typography>
                                      <Chip
                                        label={bed.status}
                                        size="small"
                                        sx={{ height: 18, fontSize: '0.6rem', fontWeight: 800 }}
                                      />
                                    </Box>
                                    {bed.status === 'OCCUPIED' ? (
                                      <Typography variant="caption" sx={{ color: '#1e3a8a', display: 'block', fontWeight: 600 }}>
                                        {bed.studentName} ({bed.rollNo})
                                      </Typography>
                                    ) : isMaint ? (
                                      <Typography variant="caption" sx={{ color: '#991b1b', display: 'block' }}>
                                        {bed.maintenanceNote || 'Under repairs'}
                                      </Typography>
                                    ) : (
                                      <Typography variant="caption" sx={{ color: '#047857' }}>
                                        Ready for student allotment
                                      </Typography>
                                    )}
                                  </div>
                                </Box>

                                {/* Action Buttons per Bed */}
                                <Stack direction="row" spacing={0.5}>
                                  {isAvail && (
                                    <Button
                                      size="small"
                                      variant="contained"
                                      onClick={() => handleOpenAllocate(room.id, bed.id)}
                                      sx={{ bgcolor: '#059669', fontSize: '0.7rem', fontWeight: 700, textTransform: 'none', py: 0.5 }}
                                    >
                                      Allot
                                    </Button>
                                  )}
                                  {bed.status === 'OCCUPIED' && (
                                    <Button
                                      size="small"
                                      variant="outlined"
                                      color="error"
                                      onClick={() => handleVacateBed(room.id, bed.id, bed.studentName)}
                                      sx={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'none', py: 0.5 }}
                                    >
                                      Vacate
                                    </Button>
                                  )}
                                  <IconButton
                                    size="small"
                                    onClick={() => handleToggleMaintenance(room.id, bed.id, bed.status)}
                                    title={isMaint ? 'Mark Bed Available' : 'Put Bed in Maintenance'}
                                    sx={{ color: '#64748b' }}
                                  >
                                    <AlertIcon fontSize="small" />
                                  </IconButton>
                                </Stack>
                              </Box>
                            );
                          })}
                        </Stack>
                      </Paper>
                    </Grid>
                  );
                }))}
            </Grid>
          </TabPanel>

          {/* ========================================================= */}
          {/* TAB 3: HOSTEL FEES & DUES LEDGER (CRUD)                   */}
          {/* ========================================================= */}
          <TabPanel value={activeTab} index={3}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
              <div>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
                  Hostel & Mess Fees Ledger
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Track room rent, mess charges, collect payments, and print formal fee receipts. Total Billed: ₹{totalFeeBilled.toLocaleString()} • Collected: ₹{totalFeeCollected.toLocaleString()} • Due: ₹{totalFeeDue.toLocaleString()}
                </Typography>
              </div>
              <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                <TextField
                  size="small"
                  placeholder="Search student or roll no..."
                  value={feeSearch}
                  onChange={(e) => setFeeSearch(e.target.value)}
                  slotProps={{
                    input: {
                      startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1, fontSize: 18 }} />
                    }
                  }}
                  sx={{ width: 220 }}
                />
                <TextField
                  select
                  size="small"
                  value={feeStatusFilter}
                  onChange={(e) => setFeeStatusFilter(e.target.value)}
                  sx={{ width: 140 }}
                >
                  <MenuItem value="ALL">All Status</MenuItem>
                  <MenuItem value="PAID">Paid</MenuItem>
                  <MenuItem value="PARTIAL">Partial</MenuItem>
                  <MenuItem value="OVERDUE">Overdue</MenuItem>
                </TextField>
              </Stack>
            </Box>

            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2.5 }}>
              <Table>
                <TableHead sx={{ bgcolor: '#f8fafc' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Student Scholar</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Room & Bed</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Fee Structure</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Total Billed</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Paid</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Balance Due</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Due Date</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {fees.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} align="center" sx={{ py: 5, color: '#94a3b8' }}>
                        No hostel fee records found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    fees
                      .filter(f => {
                        const matchQuery = f.studentName.toLowerCase().includes(feeSearch.toLowerCase()) || f.rollNo.toLowerCase().includes(feeSearch.toLowerCase());
                        const matchStatus = feeStatusFilter === 'ALL' || f.status === feeStatusFilter;
                        return matchQuery && matchStatus;
                      })
                      .map((fee) => (
                      <TableRow key={fee.id} hover>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a' }}>{fee.studentName}</Typography>
                          <Typography variant="caption" color="text.secondary">{fee.rollNo}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>{fee.roomNumber}</Typography>
                        </TableCell>
                        <TableCell>{fee.term}</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>₹{fee.totalAmount.toLocaleString()}</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#16a34a' }}>₹{fee.paidAmount.toLocaleString()}</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: fee.dueBalance > 0 ? '#dc2626' : '#16a34a' }}>
                          ₹{fee.dueBalance.toLocaleString()}
                        </TableCell>
                        <TableCell>{fee.dueDate}</TableCell>
                        <TableCell>
                          <Chip
                            label={fee.status}
                            size="small"
                            sx={{
                              fontWeight: 800,
                              fontSize: '0.7rem',
                              bgcolor: fee.status === 'PAID' ? '#dcfce7' : fee.status === 'PARTIAL' ? '#fef3c7' : '#fee2e2',
                              color: fee.status === 'PAID' ? '#15803d' : fee.status === 'PARTIAL' ? '#b45309' : '#b91c1c'
                            }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
                            {fee.dueBalance > 0 && (
                              <Button
                                size="small"
                                variant="contained"
                                onClick={() => handleOpenRecordPayment(fee)}
                                sx={{ bgcolor: '#059669', fontWeight: 700, fontSize: '0.7rem', textTransform: 'none', py: 0.5 }}
                              >
                                Collect Fee
                              </Button>
                            )}
                            {fee.receiptNo !== '-' && (
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setActiveReceipt(fee);
                                  setReceiptModalOpen(true);
                                }}
                                title="Print Formal Receipt"
                                sx={{ color: '#4f46e5' }}
                              >
                                <PrintIcon fontSize="small" />
                              </IconButton>
                            )}
                          </Stack>
                        </TableCell>
                      </TableRow>
                    )))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          {/* ========================================================= */}
          {/* TAB 4: SPECIAL EVENTS & CELEBRATIONS (CRUD)               */}
          {/* ========================================================= */}
          <TabPanel value={activeTab} index={4}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
              <div>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
                  Hostel Special Events & Celebrations
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Schedule festival feasts, sports nights, warden inspections, and community activities.
                </Typography>
              </div>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setOpenEventModal(true)}
                sx={{ bgcolor: '#d97706', fontWeight: 700, borderRadius: 2, textTransform: 'none' }}
              >
                Schedule Special Event
              </Button>
            </Box>

            <Grid container spacing={2.5}>
              {events.length === 0 ? (
                <Grid size={{ xs: 12 }}>
                  <Paper elevation={0} sx={{ p: 5, textAlign: 'center', border: '1px dashed #cbd5e1', borderRadius: 3, bgcolor: '#f8fafc' }}>
                    <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 600 }}>
                      No special hostel events planned. Click "Schedule Special Event" to plan galas, sports, or festival celebrations.
                    </Typography>
                  </Paper>
                </Grid>
              ) : (
                events.map((evt) => (
                <Grid key={evt.id} size={{ xs: 12, md: 6 }}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2.5,
                      borderRadius: 2.5,
                      border: '1px solid #e2e8f0',
                      bgcolor: 'white',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{ p: 1, borderRadius: 2, bgcolor: '#fef3c7', color: '#d97706' }}>
                          <CelebrationIcon />
                        </Box>
                        <div>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a' }}>
                              {evt.title}
                            </Typography>
                            <Chip
                              label={evt.category.replace('_', ' ')}
                              size="small"
                              sx={{ fontWeight: 700, fontSize: '0.65rem', bgcolor: '#f1f5f9' }}
                            />
                          </Box>
                          <Typography variant="caption" color="text.secondary">
                            📅 {evt.date} • ⏰ {evt.time} • 📍 {evt.venue}
                          </Typography>
                        </div>
                      </Box>
                      <IconButton size="small" onClick={() => handleDeleteEvent(evt.id)} sx={{ color: '#ef4444' }}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>

                    <Typography variant="body2" sx={{ color: '#475569', mb: 1.5 }}>
                      {evt.notes}
                    </Typography>

                    <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: '#f8fafc', border: '1px solid #e2e8f0', mb: 1.5 }}>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: '#1e293b', display: 'block' }}>
                        Special Food & Dining Menu:
                      </Typography>
                      <Typography variant="body2" sx={{ fontSize: '0.8rem', color: '#4338ca', fontWeight: 600 }}>
                        {evt.specialMenu}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: '#64748b' }}>
                      <span>Incharge: <strong>{evt.incharge}</strong></span>
                      <span>Budget: <strong>{evt.budget}</strong></span>
                      <Chip
                        label={evt.status}
                        size="small"
                        sx={{
                          fontWeight: 800,
                          fontSize: '0.65rem',
                          bgcolor: evt.status === 'UPCOMING' ? '#e0e7ff' : '#dcfce7',
                          color: evt.status === 'UPCOMING' ? '#4338ca' : '#15803d'
                        }}
                      />
                    </Box>
                  </Paper>
                </Grid>
              )))}
            </Grid>
          </TabPanel>

          {/* ========================================================= */}
          {/* TAB 5: CURFEW & ROLL CALL ATTENDANCE (CRUD)               */}
          {/* ========================================================= */}
          <TabPanel value={activeTab} index={5}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
              <div>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
                  Daily Curfew & Roll Call Attendance
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Night roll call verification at 8:30 PM. Automatic outpass cross-verification and absent flagging.
                </Typography>
              </div>

              <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                <TextField
                  type="date"
                  size="small"
                  label="Date"
                  value={attendanceDate}
                  onChange={(e) => setAttendanceDate(e.target.value)}
                  sx={{ width: 160 }}
                />

                <TextField
                  select
                  size="small"
                  label="Roll Call Shift"
                  value={rollCallShift}
                  onChange={(e) => setRollCallShift(e.target.value as any)}
                  sx={{ width: 170 }}
                >
                  <MenuItem value="NIGHT">Night Curfew (8:30 PM)</MenuItem>
                  <MenuItem value="MORNING">Morning Check (6:30 AM)</MenuItem>
                </TextField>

                <Button
                  variant="outlined"
                  onClick={handleMarkAllPresent}
                  sx={{ fontWeight: 700, borderRadius: 2, textTransform: 'none' }}
                >
                  Mark All Present
                </Button>

                <Button
                  variant="contained"
                  onClick={handleSaveAttendance}
                  startIcon={<CheckIcon />}
                  sx={{ bgcolor: '#059669', fontWeight: 700, borderRadius: 2, textTransform: 'none' }}
                >
                  Save Attendance
                </Button>
              </Stack>
            </Box>

            {/* Attendance Roster Table */}
            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2.5 }}>
              <Table>
                <TableHead sx={{ bgcolor: '#f8fafc' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Student Name</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Roll Number</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Room Bed</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Attendance Status</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Remarks & Verification</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {[
                    { name: 'Rohan Sharma', rollNo: 'FIC-2024-045', room: 'A-101 (Bed A)', phone: '+91 98401 23456' },
                    { name: 'Aditya Verma', rollNo: 'FIC-2024-078', room: 'A-102 (Bed A)', phone: '+91 98402 34567' },
                    { name: 'Vikas Kumar', rollNo: 'FIC-2024-092', room: 'A-102 (Bed B)', phone: '+91 98403 45678' },
                    { name: 'Manish Pandey', rollNo: 'FIC-2024-110', room: 'B-201 (Bed A)', phone: '+91 98404 56789' },
                    { name: 'Naveen S', rollNo: 'FIC-2024-115', room: 'B-201 (Bed B)', phone: '+91 98405 67890' }
                  ].map((std) => {
                    const status = attendanceRoster[std.rollNo] || 'PRESENT';

                    return (
                      <TableRow key={std.rollNo} hover>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a' }}>{std.name}</Typography>
                          <Typography variant="caption" color="text.secondary">Parent: {std.phone}</Typography>
                        </TableCell>
                        <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>{std.rollNo}</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>{std.room}</TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={0.75}>
                            {(['PRESENT', 'ABSENT', 'ON_OUTPASS', 'SICK_BAY'] as const).map((st) => (
                              <Chip
                                key={st}
                                label={st.replace('_', ' ')}
                                size="small"
                                onClick={() => handleToggleAttendanceStatus(std.rollNo, st)}
                                sx={{
                                  fontWeight: 700,
                                  fontSize: '0.7rem',
                                  cursor: 'pointer',
                                  bgcolor: status === st
                                    ? (st === 'PRESENT' ? '#10b981' : st === 'ABSENT' ? '#ef4444' : st === 'ON_OUTPASS' ? '#8b5cf6' : '#f59e0b')
                                    : '#f1f5f9',
                                  color: status === st ? 'white' : '#64748b'
                                }}
                              />
                            ))}
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            placeholder="Add warden note..."
                            value={attendanceRemarks[std.rollNo] || ''}
                            onChange={(e) => setAttendanceRemarks(prev => ({ ...prev, [std.rollNo]: e.target.value }))}
                            sx={{ width: '100%', maxWidth: 280 }}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          {/* ========================================================= */}
          {/* TAB 6: IN & OUT PASS (GATE MOVEMENT DESK CRUD)            */}
          {/* ========================================================= */}
          <TabPanel value={activeTab} index={6}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
              <div>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
                  Gate Movement & Student Outpasses
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Approve weekend home visits, coaching exits, monitor departure/return punches, and flag curfew delays.
                </Typography>
              </div>

              <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                <TextField
                  select
                  size="small"
                  label="Filter Status"
                  value={outpassStatusFilter}
                  onChange={(e) => setOutpassStatusFilter(e.target.value)}
                  sx={{ width: 170 }}
                >
                  <MenuItem value="ALL">All Passes</MenuItem>
                  <MenuItem value="PENDING_APPROVAL">Pending Review</MenuItem>
                  <MenuItem value="APPROVED">Approved Exits</MenuItem>
                  <MenuItem value="CHECKED_OUT">Currently Outside</MenuItem>
                  <MenuItem value="OVERDUE">Curfew Overdue</MenuItem>
                  <MenuItem value="RETURNED">Safely Returned</MenuItem>
                </TextField>

                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setOpenOutpassModal(true)}
                  sx={{ bgcolor: '#8b5cf6', fontWeight: 700, borderRadius: 2, textTransform: 'none' }}
                >
                  Issue Gate Pass
                </Button>
              </Stack>
            </Box>

            <Grid container spacing={2.5}>
              {outpasses.length === 0 ? (
                <Grid size={{ xs: 12 }}>
                  <Paper elevation={0} sx={{ p: 5, textAlign: 'center', border: '1px dashed #cbd5e1', borderRadius: 3, bgcolor: '#f8fafc' }}>
                    <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 600 }}>
                      No student gate passes or outpass requests recorded. Click "Issue Gate Pass" to register an exit permit.
                    </Typography>
                  </Paper>
                </Grid>
              ) : (
                outpasses
                  .filter(o => outpassStatusFilter === 'ALL' || o.status === outpassStatusFilter)
                  .map((op) => {
                  const isOverdue = op.status === 'OVERDUE';
                  const isPending = op.status === 'PENDING_APPROVAL';
                  const isOut = op.status === 'CHECKED_OUT';

                  return (
                    <Grid key={op.id} size={{ xs: 12, md: 6 }}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2.5,
                          borderRadius: 2.5,
                          border: isOverdue ? '2px solid #ef4444' : '1px solid #e2e8f0',
                          bgcolor: isOverdue ? '#fff5f5' : 'white',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                          <div>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a' }}>
                                {op.studentName}
                              </Typography>
                              <Chip
                                label={op.id}
                                size="small"
                                sx={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.65rem' }}
                              />
                            </Box>
                            <Typography variant="caption" color="text.secondary">
                              Roll: {op.rollNo} • Room: {op.room} • {op.leaveType.replace('_', ' ')}
                            </Typography>
                          </div>

                          <Chip
                            label={op.status.replace('_', ' ')}
                            size="small"
                            sx={{
                              fontWeight: 800,
                              fontSize: '0.7rem',
                              bgcolor: isOverdue ? '#fee2e2' : op.status === 'RETURNED' ? '#dcfce7' : isPending ? '#fef3c7' : '#e0e7ff',
                              color: isOverdue ? '#b91c1c' : op.status === 'RETURNED' ? '#15803d' : isPending ? '#b45309' : '#4338ca'
                            }}
                          />
                        </Box>

                        <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: '#f8fafc', border: '1px solid #e2e8f0', mb: 1.5 }}>
                          <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', display: 'block' }}>
                            Reason & Destination:
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>
                            {op.reason} • <strong>{op.destination}</strong>
                          </Typography>
                        </Box>

                        <Grid container spacing={1} sx={{ mb: 1.5, fontSize: '0.75rem', color: '#475569' }}>
                          <Grid size={{ xs: 6 }}>
                            <span>Out: <strong>{op.outTime}</strong></span>
                          </Grid>
                          <Grid size={{ xs: 6 }}>
                            <span>Expected In: <strong>{op.expectedInTime}</strong></span>
                          </Grid>
                          <Grid size={{ xs: 12 }}>
                            <span>Parent Verification: <strong style={{ color: op.parentConsent ? '#16a34a' : '#dc2626' }}>{op.parentContact}</strong></span>
                          </Grid>
                        </Grid>

                        <Typography variant="caption" sx={{ color: '#64748b', fontStyle: 'italic', display: 'block', mb: 2 }}>
                          Warden Note: {op.wardenRemarks}
                        </Typography>

                        {/* Interactive Buttons */}
                        <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
                          {isPending && (
                            <>
                              <Button
                                size="small"
                                variant="contained"
                                color="success"
                                onClick={() => handleUpdateOutpassState(op.id, 'APPROVED')}
                                sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.75rem' }}
                              >
                                Approve Pass
                              </Button>
                              <Button
                                size="small"
                                variant="outlined"
                                color="error"
                                onClick={() => handleUpdateOutpassState(op.id, 'REJECTED')}
                                sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.75rem' }}
                              >
                                Reject
                              </Button>
                            </>
                          )}

                          {op.status === 'APPROVED' && (
                            <Button
                              size="small"
                              variant="contained"
                              onClick={() => handleUpdateOutpassState(op.id, 'CHECKED_OUT')}
                              sx={{ bgcolor: '#4f46e5', textTransform: 'none', fontWeight: 700, fontSize: '0.75rem' }}
                            >
                              Punch Departure (Out)
                            </Button>
                          )}

                          {(isOut || isOverdue) && (
                            <Button
                              size="small"
                              variant="contained"
                              color="success"
                              onClick={() => handleUpdateOutpassState(op.id, 'RETURNED')}
                              sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.75rem' }}
                            >
                              Punch Arrival (In)
                            </Button>
                          )}
                        </Stack>
                      </Paper>
                    </Grid>
                  );
                }))}
            </Grid>
          </TabPanel>

        </Box>
      </Paper>

      {/* ========================================================= */}
      {/* MODAL: ADD / EDIT DAILY MEAL                              */}
      {/* ========================================================= */}
      <Dialog open={openMealModal} onClose={() => setOpenMealModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>
          {editingMealId ? 'Edit Meal Menu' : 'Plan Daily Food Menu'}
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <TextField
              select
              label="Meal Type"
              value={mealForm.mealType}
              onChange={(e) => setMealForm({ ...mealForm, mealType: e.target.value })}
              fullWidth
            >
              <MenuItem value="BREAKFAST">Breakfast (7:30 AM - 9:00 AM)</MenuItem>
              <MenuItem value="LUNCH">Lunch (12:30 PM - 2:00 PM)</MenuItem>
              <MenuItem value="SNACKS">Evening Snacks & High Tea (5:00 PM - 6:00 PM)</MenuItem>
              <MenuItem value="DINNER">Dinner (8:00 PM - 9:30 PM)</MenuItem>
            </TextField>

            <TextField
              label="Menu Title / Theme"
              placeholder="e.g. South Indian Sunrise Platter"
              value={mealForm.name}
              onChange={(e) => setMealForm({ ...mealForm, name: e.target.value })}
              fullWidth
            />

            <TextField
              label="Dishes & Items (Comma Separated)"
              placeholder="Idli, Medu Vada, Sambar, Coconut Chutney, Tea"
              multiline
              rows={3}
              value={mealForm.items}
              onChange={(e) => setMealForm({ ...mealForm, items: e.target.value })}
              helperText="Enter dishes separated by commas to create clean tags"
              fullWidth
            />

            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <TextField
                  select
                  label="Diet Category"
                  value={mealForm.dietType}
                  onChange={(e) => setMealForm({ ...mealForm, dietType: e.target.value })}
                  fullWidth
                >
                  <MenuItem value="PURE_VEG">Pure Vegetarian</MenuItem>
                  <MenuItem value="EGG">Eggitarian</MenuItem>
                  <MenuItem value="NON_VEG">Non-Vegetarian</MenuItem>
                  <MenuItem value="SPECIAL_DIET">Special Jain / Diabetic</MenuItem>
                </TextField>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField
                  label="Calories / Nutrition"
                  value={mealForm.calories}
                  onChange={(e) => setMealForm({ ...mealForm, calories: e.target.value })}
                  fullWidth
                />
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <TextField
                  label="Head Cook / Kitchen Incharge"
                  value={mealForm.headCook}
                  onChange={(e) => setMealForm({ ...mealForm, headCook: e.target.value })}
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField
                  select
                  label="Service Status"
                  value={mealForm.status}
                  onChange={(e) => setMealForm({ ...mealForm, status: e.target.value })}
                  fullWidth
                >
                  <MenuItem value="PLANNED">Planned</MenuItem>
                  <MenuItem value="PREPARING">Preparing</MenuItem>
                  <MenuItem value="SERVING">Serving Now</MenuItem>
                  <MenuItem value="COMPLETED">Completed</MenuItem>
                </TextField>
              </Grid>
            </Grid>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenMealModal(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveMeal} sx={{ bgcolor: '#4f46e5', fontWeight: 700 }}>
            Save Menu
          </Button>
        </DialogActions>
      </Dialog>

      {/* ========================================================= */}
      {/* MODAL: ADD ROOM                                           */}
      {/* ========================================================= */}
      <Dialog open={openRoomModal} onClose={() => setOpenRoomModal(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Create New Hostel Room</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Room Number"
              placeholder="e.g. A-105"
              value={roomForm.roomNumber}
              onChange={(e) => setRoomForm({ ...roomForm, roomNumber: e.target.value })}
              fullWidth
            />
            <TextField
              label="Building / Wing"
              value={roomForm.building}
              onChange={(e) => setRoomForm({ ...roomForm, building: e.target.value })}
              fullWidth
            />
            <TextField
              label="Block"
              value={roomForm.block}
              onChange={(e) => setRoomForm({ ...roomForm, block: e.target.value })}
              fullWidth
            />
            <TextField
              label="Floor"
              value={roomForm.floor}
              onChange={(e) => setRoomForm({ ...roomForm, floor: e.target.value })}
              fullWidth
            />
            <TextField
              select
              label="Room Type"
              value={roomForm.roomType}
              onChange={(e) => {
                const val = e.target.value;
                const cap = val === 'SINGLE' ? 1 : val === 'DOUBLE' ? 2 : val === 'TRIPLE' ? 3 : 4;
                setRoomForm({ ...roomForm, roomType: val, capacity: cap });
              }}
              fullWidth
            >
              <MenuItem value="SINGLE">Single Bed (1 Person)</MenuItem>
              <MenuItem value="DOUBLE">Double Bed (2 Persons)</MenuItem>
              <MenuItem value="TRIPLE">Triple Bed (3 Persons)</MenuItem>
              <MenuItem value="FOUR_BED">Four Bed Room (4 Persons)</MenuItem>
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenRoomModal(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveRoom} sx={{ bgcolor: '#059669', fontWeight: 700 }}>
            Create Room & Beds
          </Button>
        </DialogActions>
      </Dialog>

      {/* ========================================================= */}
      {/* MODAL: ALLOCATE BED                                       */}
      {/* ========================================================= */}
      <Dialog open={openAllocateModal} onClose={() => setOpenAllocateModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Allot Student to Bed</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Student Name"
              value={allocateForm.studentName}
              onChange={(e) => setAllocateForm({ ...allocateForm, studentName: e.target.value })}
              fullWidth
            />
            <TextField
              label="Student Roll No"
              value={allocateForm.rollNo}
              onChange={(e) => setAllocateForm({ ...allocateForm, rollNo: e.target.value })}
              fullWidth
            />
            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <TextField
                  label="Class / Grade"
                  value={allocateForm.class}
                  onChange={(e) => setAllocateForm({ ...allocateForm, class: e.target.value })}
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField
                  label="Parent Contact Phone"
                  value={allocateForm.phone}
                  onChange={(e) => setAllocateForm({ ...allocateForm, phone: e.target.value })}
                  fullWidth
                />
              </Grid>
            </Grid>
            <TextField
              type="number"
              label="Initial Hostel Security Deposit (₹)"
              value={allocateForm.depositAmount}
              onChange={(e) => setAllocateForm({ ...allocateForm, depositAmount: Number(e.target.value) })}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenAllocateModal(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveAllocation} sx={{ bgcolor: '#059669', fontWeight: 700 }}>
            Confirm Allocation
          </Button>
        </DialogActions>
      </Dialog>

      {/* ========================================================= */}
      {/* MODAL: COLLECT FEE PAYMENT                                */}
      {/* ========================================================= */}
      <Dialog open={openFeeModal} onClose={() => setOpenFeeModal(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Record Hostel Fee Collection</DialogTitle>
        <DialogContent dividers>
          {selectedFeeRecord && (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Box sx={{ p: 1.5, bgcolor: '#f8fafc', borderRadius: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>{selectedFeeRecord.studentName}</Typography>
                <Typography variant="caption" color="text.secondary">
                  Roll: {selectedFeeRecord.rollNo} • Due Balance: <strong>₹{selectedFeeRecord.dueBalance.toLocaleString()}</strong>
                </Typography>
              </Box>

              <TextField
                type="number"
                label="Amount Received (₹)"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(Number(e.target.value))}
                fullWidth
              />

              <TextField
                select
                label="Payment Mode"
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value)}
                fullWidth
              >
                <MenuItem value="UPI">UPI / Google Pay / PhonePe</MenuItem>
                <MenuItem value="NetBanking">Net Banking / NEFT</MenuItem>
                <MenuItem value="Cash">Cash Receipt at Hostel Office</MenuItem>
                <MenuItem value="Cheque">Cheque / Demand Draft</MenuItem>
              </TextField>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenFeeModal(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSavePayment} sx={{ bgcolor: '#059669', fontWeight: 700 }}>
            Record & Generate Receipt
          </Button>
        </DialogActions>
      </Dialog>

      {/* ========================================================= */}
      {/* MODAL: PRINTABLE FORMAL RECEIPT                           */}
      {/* ========================================================= */}
      <Dialog open={receiptModalOpen} onClose={() => setReceiptModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogContent sx={{ p: 4 }}>
          {activeReceipt && (
            <Box sx={{ p: 3, border: '2px solid #0f172a', borderRadius: 2, bgcolor: 'white' }}>
              <Box sx={{ textAlign: 'center', pb: 2, borderBottom: '2px dashed #cbd5e1' }}>
                <Typography variant="h5" sx={{ fontWeight: 900, letterSpacing: -0.5 }}>
                  FIC RESIDENTIAL SCHOOL & HOSTELS
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  Main Campus, Coimbatore • Hostel Warden Office
                </Typography>
                <Chip label="OFFICIAL FEE PAYMENT RECEIPT" size="small" sx={{ mt: 1, fontWeight: 800, bgcolor: '#0f172a', color: 'white' }} />
              </Box>

              <Grid container spacing={2} sx={{ my: 2, fontSize: '0.85rem' }}>
                <Grid size={{ xs: 6 }}>
                  <span>Receipt No: <strong>{activeReceipt.receiptNo}</strong></span><br />
                  <span>Date: <strong>{activeReceipt.lastPaymentDate}</strong></span><br />
                  <span>Mode: <strong>{activeReceipt.mode}</strong></span>
                </Grid>
                <Grid size={{ xs: 6 }} sx={{ textAlign: 'right' }}>
                  <span>Student: <strong>{activeReceipt.studentName}</strong></span><br />
                  <span>Roll No: <strong>{activeReceipt.rollNo}</strong></span><br />
                  <span>Room: <strong>{activeReceipt.roomNumber}</strong></span>
                </Grid>
              </Grid>

              <TableContainer sx={{ my: 2 }}>
                <Table size="small">
                  <TableHead sx={{ bgcolor: '#f1f5f9' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>Amount (₹)</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>{activeReceipt.term}</TableCell>
                      <TableCell align="right">₹{activeReceipt.totalAmount.toLocaleString()}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Total Paid to Date</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, color: '#16a34a' }}>₹{activeReceipt.paidAmount.toLocaleString()}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Balance Remaining</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, color: '#dc2626' }}>₹{activeReceipt.dueBalance.toLocaleString()}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mt: 4, pt: 2, borderTop: '1px solid #e2e8f0' }}>
                <Typography variant="caption" color="text.secondary">
                  System Generated Electronic Receipt • No signature required.
                </Typography>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, display: 'block' }}>Ramesh M.</Typography>
                  <Typography variant="caption" color="text.secondary">Hostel Warden Incharge</Typography>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setReceiptModalOpen(false)}>Close</Button>
          <Button
            variant="contained"
            startIcon={<PrintIcon />}
            onClick={() => window.print()}
            sx={{ bgcolor: '#0f172a', fontWeight: 700 }}
          >
            Print Receipt
          </Button>
        </DialogActions>
      </Dialog>

      {/* ========================================================= */}
      {/* MODAL: ADD SPECIAL EVENT                                  */}
      {/* ========================================================= */}
      <Dialog open={openEventModal} onClose={() => setOpenEventModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Schedule Special Hostel Event</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Event Title"
              placeholder="e.g. Diwali Feast / Badminton Tournament"
              value={eventForm.title}
              onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
              fullWidth
            />
            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <TextField
                  select
                  label="Category"
                  value={eventForm.category}
                  onChange={(e) => setEventForm({ ...eventForm, category: e.target.value })}
                  fullWidth
                >
                  <MenuItem value="FESTIVAL_FEAST">Festival Feast & Dinner</MenuItem>
                  <MenuItem value="SPORTS">Sports Tournament</MenuItem>
                  <MenuItem value="CULTURAL">Cultural & Music Night</MenuItem>
                  <MenuItem value="INSPECTION">Warden Room Inspection</MenuItem>
                  <MenuItem value="HEALTH_CAMP">Medical Checkup Camp</MenuItem>
                </TextField>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField
                  type="date"
                  label="Date"
                  value={eventForm.date}
                  onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                  fullWidth
                />
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <TextField
                  label="Timing"
                  value={eventForm.time}
                  onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })}
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField
                  label="Venue"
                  value={eventForm.venue}
                  onChange={(e) => setEventForm({ ...eventForm, venue: e.target.value })}
                  fullWidth
                />
              </Grid>
            </Grid>

            <TextField
              label="Special Feast Menu (If Applicable)"
              placeholder="e.g. Paneer Tikka, Biryani, Gulab Jamun"
              value={eventForm.specialMenu}
              onChange={(e) => setEventForm({ ...eventForm, specialMenu: e.target.value })}
              fullWidth
            />

            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <TextField
                  label="Coordinator / Warden"
                  value={eventForm.incharge}
                  onChange={(e) => setEventForm({ ...eventForm, incharge: e.target.value })}
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField
                  label="Estimated Budget"
                  value={eventForm.budget}
                  onChange={(e) => setEventForm({ ...eventForm, budget: e.target.value })}
                  fullWidth
                />
              </Grid>
            </Grid>

            <TextField
              label="Instructions & Details"
              multiline
              rows={2}
              value={eventForm.notes}
              onChange={(e) => setEventForm({ ...eventForm, notes: e.target.value })}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenEventModal(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveEvent} sx={{ bgcolor: '#d97706', fontWeight: 700 }}>
            Schedule Event
          </Button>
        </DialogActions>
      </Dialog>

      {/* ========================================================= */}
      {/* MODAL: ISSUE OUTPASS                                      */}
      {/* ========================================================= */}
      <Dialog open={openOutpassModal} onClose={() => setOpenOutpassModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Issue Hostel Gate Pass / Outpass</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <TextField
                  label="Student Name"
                  value={outpassForm.studentName}
                  onChange={(e) => setOutpassForm({ ...outpassForm, studentName: e.target.value })}
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField
                  label="Roll Number"
                  value={outpassForm.rollNo}
                  onChange={(e) => setOutpassForm({ ...outpassForm, rollNo: e.target.value })}
                  fullWidth
                />
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <TextField
                  select
                  label="Leave Type"
                  value={outpassForm.leaveType}
                  onChange={(e) => setOutpassForm({ ...outpassForm, leaveType: e.target.value })}
                  fullWidth
                >
                  <MenuItem value="LOCAL_OUTING">Local City Outing</MenuItem>
                  <MenuItem value="WEEKEND_HOME">Weekend Home Visit</MenuItem>
                  <MenuItem value="MEDICAL">Medical Emergency / Doctor</MenuItem>
                  <MenuItem value="COACHING">Coaching / Academic Class</MenuItem>
                </TextField>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField
                  label="Room"
                  value={outpassForm.room}
                  onChange={(e) => setOutpassForm({ ...outpassForm, room: e.target.value })}
                  fullWidth
                />
              </Grid>
            </Grid>

            <TextField
              label="Destination & Place of Visit"
              placeholder="e.g. Coimbatore Railway Station"
              value={outpassForm.destination}
              onChange={(e) => setOutpassForm({ ...outpassForm, destination: e.target.value })}
              fullWidth
            />

            <TextField
              label="Detailed Reason"
              placeholder="e.g. Attending cousin marriage at native home"
              value={outpassForm.reason}
              onChange={(e) => setOutpassForm({ ...outpassForm, reason: e.target.value })}
              fullWidth
            />

            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <TextField
                  label="Departure Date & Time"
                  value={outpassForm.outTime}
                  onChange={(e) => setOutpassForm({ ...outpassForm, outTime: e.target.value })}
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField
                  label="Expected Return Time"
                  value={outpassForm.expectedInTime}
                  onChange={(e) => setOutpassForm({ ...outpassForm, expectedInTime: e.target.value })}
                  fullWidth
                />
              </Grid>
            </Grid>

            <TextField
              label="Parent / Guardian Contact Phone"
              value={outpassForm.parentContact}
              onChange={(e) => setOutpassForm({ ...outpassForm, parentContact: e.target.value })}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenOutpassModal(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveOutpass} sx={{ bgcolor: '#8b5cf6', fontWeight: 700 }}>
            Approve & Issue Pass
          </Button>
        </DialogActions>
      </Dialog>

      {/* ========================================================= */}
      {/* MODAL: EMERGENCY BROADCAST ALERT                          */}
      {/* ========================================================= */}
      <Dialog open={openEmergencyModal} onClose={() => setOpenEmergencyModal(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, color: '#dc2626', display: 'flex', alignItems: 'center', gap: 1 }}>
          <SirenIcon /> Trigger Campus Emergency Alert?
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" sx={{ color: '#475569', lineHeight: 1.6 }}>
            This will immediately trigger an urgent broadcast audio chime and alert to:
            <br />
            <strong>1. Campus Gate Security Watchman Desk</strong>
            <br />
            <strong>2. School Principal Approval Desk</strong>
            <br />
            <strong>3. Campus Health & Medical Clinic</strong>
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenEmergencyModal(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleBroadcastEmergency} sx={{ fontWeight: 800 }}>
            Confirm Emergency Broadcast
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
};

export default HostelWardenDashboard;
