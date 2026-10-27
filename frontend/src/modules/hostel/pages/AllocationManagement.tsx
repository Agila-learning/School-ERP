import React, { useState, useEffect, useMemo } from 'react';
import {
  Box, Typography, Paper, Tabs, Tab, Button, Stack, Table, TableBody, TableCell, TableHead, TableRow, TableContainer,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Alert, Chip, IconButton, Tooltip,
  Grid, Card, CardContent, Avatar, InputAdornment, LinearProgress, Divider, Badge, ToggleButton,
  ToggleButtonGroup, Menu, ListItemIcon, ListItemText, FormControl, InputLabel, Select
} from '@mui/material';
import HotelIcon from '@mui/icons-material/Hotel';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import PersonIcon from '@mui/icons-material/Person';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import PrintIcon from '@mui/icons-material/Print';
import PhoneIcon from '@mui/icons-material/Phone';
import RefreshIcon from '@mui/icons-material/Refresh';
import GridViewIcon from '@mui/icons-material/GridView';
import ViewListIcon from '@mui/icons-material/ViewList';
import SchoolIcon from '@mui/icons-material/School';
import AssignmentIcon from '@mui/icons-material/Assignment';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import KeyIcon from '@mui/icons-material/VpnKey';

import { 
  getApplications, getAllocations, getHostels, getBeds, getRooms, 
  allocateBed, checkInStudent, checkOutStudent, transferRoom, 
  createApplication, getStudents 
} from '../api/hostel.api';
import { publishNotification } from '../../../core/services/realtimeNotificationBus';

interface TabPanelProps { children?: React.ReactNode; value: number; index: number; }
const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div hidden={value !== index}>{value === index && <Box sx={{ pt: 2.5 }}>{children}</Box>}</div>
);

const AllocationManagement: React.FC = () => {
  const [tab, setTab] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Core Data
  const [applications, setApplications] = useState<any[]>([]);
  const [allocations, setAllocations] = useState<any[]>([]);
  const [hostels, setHostels] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [beds, setBeds] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHostelFilter, setSelectedHostelFilter] = useState('ALL');
  const [selectedRoomTypeFilter, setSelectedRoomTypeFilter] = useState('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL');

  // Modals
  const [openApplyModal, setOpenApplyModal] = useState(false);
  const [openAllocModal, setOpenAllocModal] = useState(false);
  const [openCheckInModal, setOpenCheckInModal] = useState(false);
  const [openVacateModal, setOpenVacateModal] = useState(false);
  const [openTransferModal, setOpenTransferModal] = useState(false);
  const [openPassModal, setOpenPassModal] = useState(false);
  const [selectedItemForAction, setSelectedItemForAction] = useState<any>(null);

  // Forms
  const [applyForm, setApplyForm] = useState({ studentId: '', preferredHostelId: '', reason: '' });
  const [allocForm, setAllocForm] = useState({ studentId: '', bedId: '', roomId: '', hostelId: '' });
  const [checkInForm, setCheckInForm] = useState({ allocationId: '', condition: 'GOOD', keyHanded: true, remarks: '' });
  const [vacateForm, setVacateForm] = useState({ allocationId: '', roomCondition: 'GOOD', keyReturned: true, duesCleared: true, reason: 'Course Completion' });
  const [transferForm, setTransferForm] = useState({ transferId: '', targetRoomId: '', targetBedId: '', reason: 'Personal Preference' });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [apps, allocs, hs, rm, bd, st] = await Promise.all([
        getApplications(),
        getAllocations(),
        getHostels(),
        getRooms(),
        getBeds(),
        getStudents()
      ]);
      setApplications(Array.isArray(apps) ? apps : []);
      setAllocations(Array.isArray(allocs) ? allocs : []);
      setHostels(Array.isArray(hs) ? hs : []);
      setRooms(Array.isArray(rm) ? rm : []);
      setBeds(Array.isArray(bd) ? bd : []);
      setStudents(Array.isArray(st) ? st : []);
    } catch (e: any) {
      console.error(e);
      setError(e.response?.data?.message || 'Failed to fetch hostel allocation data');
    } finally {
      setLoading(false);
    }
  };

  // KPI Calculations
  const stats = useMemo(() => {
    const totalBeds = beds.length;
    const occupiedBeds = beds.filter(b => b.status === 'OCCUPIED').length;
    const availableBeds = beds.filter(b => b.status === 'AVAILABLE').length;
    const maintenanceBeds = beds.filter(b => b.status === 'MAINTENANCE' || b.status === 'RESERVED').length;
    const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;
    const pendingApps = applications.filter(a => a.status === 'SUBMITTED' || a.status === 'PENDING').length;
    const checkedInCount = allocations.filter(a => a.status === 'CHECKED_IN').length;

    return {
      totalBeds,
      occupiedBeds,
      availableBeds,
      maintenanceBeds,
      occupancyRate,
      pendingApps,
      checkedInCount
    };
  }, [beds, applications, allocations]);

  // Filtered Beds
  const filteredBeds = useMemo(() => {
    return beds.filter(b => {
      const roomNum = b.roomId?.roomNumber || '';
      const occupantName = b.currentAllocationId?.studentId ? `${b.currentAllocationId.studentId.firstName} ${b.currentAllocationId.studentId.lastName}` : '';
      const admissionNum = b.currentAllocationId?.studentId?.admissionNumber || '';
      const bedNum = b.bedNumber || '';

      const matchesSearch = !searchQuery || 
        roomNum.toLowerCase().includes(searchQuery.toLowerCase()) ||
        occupantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        admissionNum.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bedNum.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesHostel = selectedHostelFilter === 'ALL' || b.roomId?.hostelId === selectedHostelFilter || b.roomId?.hostelId?._id === selectedHostelFilter;
      const matchesType = selectedRoomTypeFilter === 'ALL' || b.roomId?.roomType === selectedRoomTypeFilter;
      const matchesStatus = selectedStatusFilter === 'ALL' || b.status === selectedStatusFilter;

      return matchesSearch && matchesHostel && matchesType && matchesStatus;
    });
  }, [beds, searchQuery, selectedHostelFilter, selectedRoomTypeFilter, selectedStatusFilter]);

  // Grouped Rooms with their beds for Grid View
  const groupedRooms = useMemo(() => {
    const roomMap = new Map<string, { room: any; beds: any[] }>();

    // Seed with all matching rooms
    rooms.forEach(r => {
      const matchesHostel = selectedHostelFilter === 'ALL' || r.hostelId === selectedHostelFilter || r.hostelId?._id === selectedHostelFilter;
      const matchesType = selectedRoomTypeFilter === 'ALL' || r.roomType === selectedRoomTypeFilter;
      if (matchesHostel && matchesType) {
        roomMap.set(r._id, { room: r, beds: [] });
      }
    });

    // Populate with filtered beds
    beds.forEach(b => {
      const rId = b.roomId?._id || b.roomId;
      if (rId && roomMap.has(rId)) {
        roomMap.get(rId)!.beds.push(b);
      }
    });

    // Filter by search query if present
    let result = Array.from(roomMap.values());
    if (searchQuery.trim()) {
      result = result.filter(item => {
        const rNum = item.room.roomNumber.toLowerCase();
        const hasMatchingBed = item.beds.some(b => {
          const occ = b.currentAllocationId?.studentId ? `${b.currentAllocationId.studentId.firstName} ${b.currentAllocationId.studentId.lastName}`.toLowerCase() : '';
          const adm = (b.currentAllocationId?.studentId?.admissionNumber || '').toLowerCase();
          return occ.includes(searchQuery.toLowerCase()) || adm.includes(searchQuery.toLowerCase()) || b.bedNumber.toLowerCase().includes(searchQuery.toLowerCase());
        });
        return rNum.includes(searchQuery.toLowerCase()) || hasMatchingBed;
      });
    }

    if (selectedStatusFilter !== 'ALL') {
      result = result.filter(item => item.beds.some(b => b.status === selectedStatusFilter));
    }

    return result;
  }, [rooms, beds, selectedHostelFilter, selectedRoomTypeFilter, selectedStatusFilter, searchQuery]);

  // Filtered Allocations
  const filteredAllocations = useMemo(() => {
    return allocations.filter(a => {
      const studentName = a.studentId ? `${a.studentId.firstName} ${a.studentId.lastName}` : '';
      const adm = a.studentId?.admissionNumber || '';
      const rNum = a.roomId?.roomNumber || '';
      const bNum = a.bedId?.bedNumber || '';

      const matchesSearch = !searchQuery ||
        studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        adm.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rNum.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bNum.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesSearch;
    });
  }, [allocations, searchQuery]);

  // Form Handlers
  const handleApply = async () => {
    if (!applyForm.studentId || !applyForm.preferredHostelId) {
      setError('Please select both a student and preferred hostel.');
      return;
    }
    try {
      await createApplication(applyForm);
      setSuccess('Hostel application submitted successfully');
      setOpenApplyModal(false);
      setApplyForm({ studentId: '', preferredHostelId: '', reason: '' });
      fetchAllData();
      publishNotification({
        id: `noti-${Date.now()}`,
        title: 'New Hostel Application',
        message: 'A student hostel residency application was submitted',
        type: 'HOSTEL_RESIDENT',
        priority: 'MEDIUM',
        targetRole: 'HOSTEL_WARDEN',
        timestamp: new Date().toISOString()
      });
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to submit application');
    }
  };

  const handleAllocate = async () => {
    if (!allocForm.studentId || !allocForm.bedId) {
      setError('Student and Bed must be selected');
      return;
    }
    try {
      await allocateBed({
        studentId: allocForm.studentId,
        bedId: allocForm.bedId,
        academicYearId: '60d5ecb8b392d7001f3e3a41'
      });
      setSuccess('Bed successfully allocated to student');
      setOpenAllocModal(false);
      setAllocForm({ studentId: '', bedId: '', roomId: '', hostelId: '' });
      fetchAllData();
      publishNotification({
        id: `noti-${Date.now()}`,
        title: 'Hostel Bed Allocated',
        message: 'Student assigned to room bed successfully',
        type: 'HOSTEL_RESIDENT',
        priority: 'HIGH',
        targetRole: 'HOSTEL_WARDEN',
        timestamp: new Date().toISOString()
      });
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to allocate bed');
    }
  };

  const handleCheckIn = async () => {
    if (!checkInForm.allocationId) {
      setError('Please select an allocation');
      return;
    }
    try {
      await checkInStudent(checkInForm);
      setSuccess('Student physically checked in to hostel room');
      setOpenCheckInModal(false);
      fetchAllData();
      publishNotification({
        id: `noti-${Date.now()}`,
        title: 'Student Checked In',
        message: 'Resident student checked in and room keys verified',
        type: 'HOSTEL_RESIDENT',
        priority: 'LOW',
        targetRole: 'HOSTEL_WARDEN',
        timestamp: new Date().toISOString()
      });
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to check in student');
    }
  };

  const handleVacate = async () => {
    if (!vacateForm.allocationId) {
      setError('Please select an allocation');
      return;
    }
    try {
      await checkOutStudent(vacateForm);
      setSuccess('Student room vacated and bed released successfully');
      setOpenVacateModal(false);
      fetchAllData();
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to vacate room');
    }
  };

  const handleTransfer = async () => {
    if (!transferForm.transferId || !transferForm.targetBedId) {
      setError('Target Room and Bed are required');
      return;
    }
    try {
      await transferRoom({
        transferId: transferForm.transferId,
        targetBedId: transferForm.targetBedId
      });
      setSuccess('Room and bed transferred successfully');
      setOpenTransferModal(false);
      fetchAllData();
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to transfer room');
    }
  };

  // Open Direct Allocation prefilled with a bed
  const openDirectAllocationForBed = (bed: any) => {
    const rId = bed.roomId?._id || bed.roomId;
    const room = rooms.find(r => r._id === rId);
    setAllocForm({
      studentId: '',
      hostelId: room?.hostelId?._id || room?.hostelId || '',
      roomId: rId || '',
      bedId: bed._id
    });
    setOpenAllocModal(true);
  };

  // Available beds for selected room in Allocate modal
  const availableBedsForModal = useMemo(() => {
    if (!allocForm.roomId) return [];
    return beds.filter(b => {
      const bRoomId = b.roomId?._id || b.roomId;
      return bRoomId === allocForm.roomId && b.status === 'AVAILABLE';
    });
  }, [beds, allocForm.roomId]);

  // Available beds for transfer modal
  const availableBedsForTransfer = useMemo(() => {
    if (!transferForm.targetRoomId) return [];
    return beds.filter(b => {
      const bRoomId = b.roomId?._id || b.roomId;
      return bRoomId === transferForm.targetRoomId && b.status === 'AVAILABLE';
    });
  }, [beds, transferForm.targetRoomId]);

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      
      {/* Top Banner / Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar sx={{ bgcolor: '#7c3aed', width: 44, height: 44, boxShadow: '0 4px 12px rgba(124, 58, 237, 0.25)' }}>
              <HotelIcon sx={{ fontSize: 26, color: '#ffffff' }} />
            </Avatar>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
                Bed Allocation & Resident Room Management
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b' }}>
                Real-time room occupancy, live bed assignments, student check-ins, transfers and room releases
              </Typography>
            </Box>
          </Stack>
        </Box>
        
        <Stack direction="row" spacing={1.5} flexWrap="wrap">
          <Button 
            variant="outlined" 
            startIcon={<RefreshIcon />} 
            onClick={fetchAllData}
            disabled={loading}
            sx={{ fontWeight: 600, borderColor: '#cbd5e1', color: '#475569', '&:hover': { borderColor: '#94a3b8', bgcolor: '#f1f5f9' } }}
          >
            Refresh
          </Button>
          <Button 
            variant="outlined" 
            startIcon={<AddIcon />} 
            onClick={() => setOpenApplyModal(true)} 
            sx={{ fontWeight: 600, borderColor: '#7c3aed', color: '#7c3aed', '&:hover': { bgcolor: '#f5f3ff', borderColor: '#6d28d9' } }}
          >
            New Application
          </Button>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />} 
            onClick={() => {
              setAllocForm({ studentId: '', bedId: '', roomId: '', hostelId: '' });
              setOpenAllocModal(true);
            }} 
            sx={{ 
              fontWeight: 700, 
              background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
              boxShadow: '0 4px 14px rgba(124, 58, 237, 0.35)',
              '&:hover': { background: 'linear-gradient(135deg, #6d28d9 0%, #4338ca 100%)' }
            }}
          >
            Direct Bed Allocation
          </Button>
        </Stack>
      </Box>

      {/* Alerts */}
      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      {/* KPI Stats Overview Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Total Capacity
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a', mt: 0.5 }}>
                    {stats.totalBeds}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748b' }}>
                    Configured Beds
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: '#e0e7ff', color: '#4338ca', width: 44, height: 44 }}>
                  <HotelIcon />
                </Avatar>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Occupied Beds
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: '#7c3aed', mt: 0.5 }}>
                    {stats.occupiedBeds}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#7c3aed', fontWeight: 600 }}>
                    {stats.occupancyRate}% Occupancy Rate
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: '#ede9fe', color: '#7c3aed', width: 44, height: 44 }}>
                  <PersonIcon />
                </Avatar>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Available Beds
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: '#16a34a', mt: 0.5 }}>
                    {stats.availableBeds}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#16a34a', fontWeight: 600 }}>
                    Ready for Allotment
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: '#dcfce7', color: '#16a34a', width: 44, height: 44 }}>
                  <CheckCircleIcon />
                </Avatar>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Active Check-Ins
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: '#0284c7', mt: 0.5 }}>
                    {stats.checkedInCount}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#0284c7', fontWeight: 600 }}>
                    In Residence
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: '#e0f2fe', color: '#0284c7', width: 44, height: 44 }}>
                  <LoginIcon />
                </Avatar>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Applications
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: '#ea580c', mt: 0.5 }}>
                    {stats.pendingApps}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#ea580c', fontWeight: 600 }}>
                    Awaiting Allotment
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: '#ffedd5', color: '#ea580c', width: 44, height: 44 }}>
                  <AssignmentIcon />
                </Avatar>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filter and Search Bar */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 3, border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search by student, admission #, room #, bed #..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#94a3b8' }} />
                  </InputAdornment>
                ),
              }}
              sx={{ bgcolor: '#ffffff' }}
            />
          </Grid>

          <Grid item xs={6} md={2.5}>
            <FormControl fullWidth size="small">
              <InputLabel id="hostel-filter-label">Hostel</InputLabel>
              <Select
                labelId="hostel-filter-label"
                label="Hostel"
                value={selectedHostelFilter}
                onChange={e => setSelectedHostelFilter(e.target.value)}
                sx={{ bgcolor: '#ffffff' }}
              >
                <MenuItem value="ALL">All Hostels ({hostels.length})</MenuItem>
                {hostels.map(h => (
                  <MenuItem key={h._id} value={h._id}>{h.name} ({h.hostelType})</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel id="type-filter-label">Room Type</InputLabel>
              <Select
                labelId="type-filter-label"
                label="Room Type"
                value={selectedRoomTypeFilter}
                onChange={e => setSelectedRoomTypeFilter(e.target.value)}
                sx={{ bgcolor: '#ffffff' }}
              >
                <MenuItem value="ALL">All Room Types</MenuItem>
                <MenuItem value="SINGLE">Single</MenuItem>
                <MenuItem value="DOUBLE">Double</MenuItem>
                <MenuItem value="TRIPLE">Triple</MenuItem>
                <MenuItem value="DORMITORY">Dormitory</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel id="status-filter-label">Bed Status</InputLabel>
              <Select
                labelId="status-filter-label"
                label="Bed Status"
                value={selectedStatusFilter}
                onChange={e => setSelectedStatusFilter(e.target.value)}
                sx={{ bgcolor: '#ffffff' }}
              >
                <MenuItem value="ALL">All Statuses</MenuItem>
                <MenuItem value="AVAILABLE">Available Only</MenuItem>
                <MenuItem value="OCCUPIED">Occupied Only</MenuItem>
                <MenuItem value="MAINTENANCE">Maintenance</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={6} md={1.5} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <ToggleButtonGroup
              size="small"
              value={viewMode}
              exclusive
              onChange={(_, next) => next && setViewMode(next)}
              aria-label="view mode"
              sx={{ bgcolor: '#ffffff' }}
            >
              <ToggleButton value="grid" aria-label="grid view">
                <Tooltip title="Visual Room Grid">
                  <GridViewIcon fontSize="small" />
                </Tooltip>
              </ToggleButton>
              <ToggleButton value="table" aria-label="table view">
                <Tooltip title="Data Table">
                  <ViewListIcon fontSize="small" />
                </Tooltip>
              </ToggleButton>
            </ToggleButtonGroup>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabs Navigation */}
      <Paper sx={{ mb: 3, borderRadius: 3, border: '1px solid #e2e8f0', boxShadow: 'none' }}>
        <Tabs 
          value={tab} 
          onChange={(_, v) => setTab(v)} 
          sx={{ 
            px: 2, 
            borderBottom: 1, 
            borderColor: '#e2e8f0',
            '& .MuiTab-root': { fontWeight: 700, textTransform: 'none', fontSize: '0.95rem', py: 2 }
          }}
        >
          <Tab 
            label={
              <Stack direction="row" spacing={1} alignItems="center">
                <span>Bed Matrix & Rooms</span>
                <Chip size="small" label={stats.totalBeds} sx={{ fontWeight: 700, bgcolor: '#f1f5f9' }} />
              </Stack>
            } 
          />
          <Tab 
            label={
              <Stack direction="row" spacing={1} alignItems="center">
                <span>Active Allocations & Residents</span>
                <Chip size="small" label={allocations.length} color="primary" sx={{ fontWeight: 700 }} />
              </Stack>
            } 
          />
          <Tab 
            label={
              <Stack direction="row" spacing={1} alignItems="center">
                <span>Hostel Applications</span>
                <Chip size="small" label={applications.length} color={applications.length > 0 ? "warning" : "default"} sx={{ fontWeight: 700 }} />
              </Stack>
            } 
          />
        </Tabs>

        {/* TAB 0: BED MATRIX */}
        <TabPanel value={tab} index={0}>
          <Box sx={{ p: 2.5 }}>
            {viewMode === 'grid' ? (
              // GRID VIEW: Visual Room Cards with Bed chips
              <Grid container spacing={2.5}>
                {groupedRooms.map(({ room, beds: roomBeds }) => {
                  const roomOccupied = roomBeds.filter(b => b.status === 'OCCUPIED').length;
                  const roomCapacity = room.capacity || roomBeds.length || 1;
                  const percent = Math.round((roomOccupied / roomCapacity) * 100);

                  return (
                    <Grid item xs={12} sm={6} lg={4} key={room._id}>
                      <Card sx={{ 
                        borderRadius: 3, 
                        border: '1px solid #e2e8f0', 
                        boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
                        transition: 'all 0.2s',
                        '&:hover': { boxShadow: '0 8px 24px rgba(0,0,0,0.07)', borderColor: '#cbd5e1' }
                      }}>
                        <Box sx={{ p: 2, bgcolor: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Stack direction="row" spacing={1.5} alignItems="center">
                            <Avatar sx={{ bgcolor: '#7c3aed', width: 34, height: 34, fontSize: '0.875rem', fontWeight: 800 }}>
                              {room.roomNumber}
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>
                                Room {room.roomNumber}
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#64748b' }}>
                                {room.roomType} • Floor {room.floorId?.floorNumber || '1'}
                              </Typography>
                            </Box>
                          </Stack>

                          <Chip 
                            size="small" 
                            label={`${roomOccupied} / ${roomCapacity} Occupied`}
                            color={roomOccupied === roomCapacity ? 'error' : roomOccupied > 0 ? 'warning' : 'success'}
                            sx={{ fontWeight: 700, fontSize: '0.75rem' }}
                          />
                        </Box>

                        <CardContent sx={{ p: 2 }}>
                          {/* Occupancy progress */}
                          <Box sx={{ mb: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                              <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>Capacity Load</Typography>
                              <Typography variant="caption" sx={{ color: '#334155', fontWeight: 700 }}>{percent}%</Typography>
                            </Box>
                            <LinearProgress 
                              variant="determinate" 
                              value={percent} 
                              sx={{ 
                                height: 6, 
                                borderRadius: 3, 
                                bgcolor: '#e2e8f0',
                                '& .MuiLinearProgress-bar': {
                                  bgcolor: percent >= 100 ? '#ef4444' : percent > 0 ? '#f59e0b' : '#22c55e',
                                  borderRadius: 3
                                }
                              }} 
                            />
                          </Box>

                          {/* Individual Bed items */}
                          <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', mb: 1 }}>
                            Beds In Room ({roomBeds.length})
                          </Typography>

                          <Stack spacing={1.5}>
                            {roomBeds.map(b => {
                              const isOccupied = b.status === 'OCCUPIED';
                              const occupant = b.currentAllocationId?.studentId;

                              return (
                                <Paper 
                                  key={b._id} 
                                  elevation={0}
                                  sx={{ 
                                    p: 1.5, 
                                    borderRadius: 2, 
                                    border: `1px solid ${isOccupied ? '#c7d2fe' : '#bbf7d0'}`,
                                    bgcolor: isOccupied ? '#f5f3ff' : '#f0fdf4',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                  }}
                                >
                                  <Stack direction="row" spacing={1.5} alignItems="center">
                                    <Avatar sx={{ 
                                      bgcolor: isOccupied ? '#7c3aed' : '#16a34a', 
                                      width: 32, 
                                      height: 32,
                                      fontSize: '0.8rem',
                                      fontWeight: 700 
                                    }}>
                                      {b.bedNumber}
                                    </Avatar>
                                    <Box>
                                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e293b' }}>
                                        Bed {b.bedNumber}
                                      </Typography>
                                      {isOccupied && occupant ? (
                                        <Typography variant="caption" sx={{ color: '#4338ca', display: 'block', fontWeight: 600 }}>
                                          {occupant.firstName} {occupant.lastName} • {occupant.admissionNumber || occupant.studentId || 'ID N/A'}
                                        </Typography>
                                      ) : (
                                        <Typography variant="caption" sx={{ color: '#15803d', fontWeight: 600 }}>
                                          Vacant • Available
                                        </Typography>
                                      )}
                                    </Box>
                                  </Stack>

                                  <Box>
                                    {isOccupied ? (
                                      <Stack direction="row" spacing={0.5}>
                                        <Tooltip title="View Student Allotment Pass">
                                          <IconButton 
                                            size="small" 
                                            onClick={() => {
                                              setSelectedItemForAction({
                                                student: occupant,
                                                room,
                                                bed: b,
                                                allocation: b.currentAllocationId
                                              });
                                              setOpenPassModal(true);
                                            }}
                                            sx={{ color: '#6366f1' }}
                                          >
                                            <PrintIcon fontSize="small" />
                                          </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Transfer Room">
                                          <IconButton 
                                            size="small" 
                                            onClick={() => {
                                              setTransferForm({
                                                transferId: b.currentAllocationId?._id || '',
                                                targetRoomId: '',
                                                targetBedId: '',
                                                reason: 'Room Reallocation'
                                              });
                                              setSelectedItemForAction({
                                                student: occupant,
                                                currentRoom: room,
                                                currentBed: b,
                                                allocationId: b.currentAllocationId?._id
                                              });
                                              setOpenTransferModal(true);
                                            }}
                                            sx={{ color: '#8b5cf6' }}
                                          >
                                            <SwapHorizIcon fontSize="small" />
                                          </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Vacate / Check Out">
                                          <IconButton 
                                            size="small" 
                                            onClick={() => {
                                              setVacateForm({
                                                allocationId: b.currentAllocationId?._id || '',
                                                roomCondition: 'GOOD',
                                                keyReturned: true,
                                                duesCleared: true,
                                                reason: 'Course End'
                                              });
                                              setSelectedItemForAction({
                                                student: occupant,
                                                room,
                                                bed: b
                                              });
                                              setOpenVacateModal(true);
                                            }}
                                            sx={{ color: '#ef4444' }}
                                          >
                                            <LogoutIcon fontSize="small" />
                                          </IconButton>
                                        </Tooltip>
                                      </Stack>
                                    ) : (
                                      <Button 
                                        size="small" 
                                        variant="contained" 
                                        color="success" 
                                        startIcon={<AddIcon />}
                                        onClick={() => openDirectAllocationForBed(b)}
                                        sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2, fontSize: '0.75rem', py: 0.5 }}
                                      >
                                        Assign
                                      </Button>
                                    )}
                                  </Box>
                                </Paper>
                              );
                            })}

                            {roomBeds.length === 0 && (
                              <Typography variant="caption" sx={{ color: '#94a3b8', fontStyle: 'italic', textAlign: 'center', py: 1 }}>
                                No beds added to this room yet
                              </Typography>
                            )}
                          </Stack>
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}

                {groupedRooms.length === 0 && (
                  <Grid item xs={12}>
                    <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3, border: '1px dashed #cbd5e1' }}>
                      <HotelIcon sx={{ fontSize: 48, color: '#94a3b8', mb: 1 }} />
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#334155' }}>No Rooms Match Selected Filters</Typography>
                      <Typography variant="body2" sx={{ color: '#64748b' }}>Try clearing the search or reset the hostel filter.</Typography>
                    </Paper>
                  </Grid>
                )}
              </Grid>
            ) : (
              // TABLE VIEW: High-Density Table
              <Paper sx={{ borderRadius: 3, overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                <TableContainer>
                  <Table>
                    <TableHead sx={{ backgroundColor: '#f8fafc' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Bed & Room</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Floor & Hostel</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Room Type</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Current Resident</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700, color: '#475569' }}>Quick Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredBeds.map(b => {
                        const occupant = b.currentAllocationId?.studentId;
                        const room = b.roomId;

                        return (
                          <TableRow key={b._id} hover>
                            <TableCell>
                              <Stack direction="row" spacing={1.5} alignItems="center">
                                <Avatar sx={{ bgcolor: b.status === 'OCCUPIED' ? '#7c3aed' : '#16a34a', width: 34, height: 34, fontWeight: 700 }}>
                                  {b.bedNumber}
                                </Avatar>
                                <Box>
                                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                                    Bed {b.bedNumber}
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: '#64748b' }}>
                                    Room {room?.roomNumber || 'N/A'}
                                  </Typography>
                                </Box>
                              </Stack>
                            </TableCell>

                            <TableCell>
                              <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155' }}>
                                Floor {room?.floorId?.floorNumber || '1'}
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#64748b' }}>
                                {room?.hostelId?.name || 'Main Residency'}
                              </Typography>
                            </TableCell>

                            <TableCell>
                              <Chip 
                                size="small" 
                                label={room?.roomType || 'STANDARD'} 
                                sx={{ fontWeight: 600, bgcolor: '#f1f5f9', color: '#475569' }} 
                              />
                            </TableCell>

                            <TableCell>
                              <Chip 
                                size="small" 
                                label={b.status} 
                                color={b.status === 'AVAILABLE' ? 'success' : b.status === 'OCCUPIED' ? 'secondary' : 'warning'}
                                sx={{ fontWeight: 700 }}
                              />
                            </TableCell>

                            <TableCell>
                              {occupant ? (
                                <Box>
                                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                                    {occupant.firstName} {occupant.lastName}
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: '#64748b' }}>
                                    Roll: {occupant.admissionNumber || occupant.studentId || 'N/A'} {occupant.phone ? `• ${occupant.phone}` : ''}
                                  </Typography>
                                </Box>
                              ) : (
                                <Typography variant="body2" sx={{ color: '#16a34a', fontWeight: 600 }}>
                                  Vacant / Available
                                </Typography>
                              )}
                            </TableCell>

                            <TableCell align="right">
                              {b.status === 'OCCUPIED' ? (
                                <Stack direction="row" spacing={1} justifyContent="flex-end">
                                  <Button 
                                    size="small" 
                                    variant="outlined" 
                                    startIcon={<SwapHorizIcon />}
                                    onClick={() => {
                                      setTransferForm({
                                        transferId: b.currentAllocationId?._id || '',
                                        targetRoomId: '',
                                        targetBedId: '',
                                        reason: 'Room Reallocation'
                                      });
                                      setSelectedItemForAction({
                                        student: occupant,
                                        currentRoom: room,
                                        currentBed: b,
                                        allocationId: b.currentAllocationId?._id
                                      });
                                      setOpenTransferModal(true);
                                    }}
                                    sx={{ textTransform: 'none', fontWeight: 600 }}
                                  >
                                    Transfer
                                  </Button>
                                  <Button 
                                    size="small" 
                                    variant="outlined" 
                                    color="error" 
                                    startIcon={<LogoutIcon />}
                                    onClick={() => {
                                      setVacateForm({
                                        allocationId: b.currentAllocationId?._id || '',
                                        roomCondition: 'GOOD',
                                        keyReturned: true,
                                        duesCleared: true,
                                        reason: 'Course End'
                                      });
                                      setSelectedItemForAction({
                                        student: occupant,
                                        room,
                                        bed: b
                                      });
                                      setOpenVacateModal(true);
                                    }}
                                    sx={{ textTransform: 'none', fontWeight: 600 }}
                                  >
                                    Vacate
                                  </Button>
                                </Stack>
                              ) : (
                                <Button 
                                  size="small" 
                                  variant="contained" 
                                  color="success" 
                                  startIcon={<AddIcon />}
                                  onClick={() => openDirectAllocationForBed(b)}
                                  sx={{ textTransform: 'none', fontWeight: 700 }}
                                >
                                  Assign Student
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}

                      {filteredBeds.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} sx={{ textAlign: 'center', py: 6, color: '#64748b' }}>
                            No beds match your filter query.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            )}
          </Box>
        </TabPanel>

        {/* TAB 1: ACTIVE ALLOCATIONS */}
        <TabPanel value={tab} index={1}>
          <Box sx={{ p: 2.5 }}>
            <Paper sx={{ borderRadius: 3, overflow: 'hidden', border: '1px solid #e2e8f0' }}>
              <TableContainer>
                <Table>
                  <TableHead sx={{ backgroundColor: '#f8fafc' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Student Resident</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Hostel & Wing</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Room & Bed</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Allotment Date</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Status</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, color: '#475569' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredAllocations.map(a => {
                      const student = a.studentId;
                      const room = a.roomId;
                      const bed = a.bedId;

                      return (
                        <TableRow key={a._id} hover>
                          <TableCell>
                            <Stack direction="row" spacing={1.5} alignItems="center">
                              <Avatar sx={{ bgcolor: '#7c3aed', width: 36, height: 36, fontWeight: 700 }}>
                                {student?.firstName?.[0] || 'S'}
                              </Avatar>
                              <Box>
                                <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                                  {student?.firstName} {student?.lastName}
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#64748b' }}>
                                  Roll: {student?.admissionNumber || student?.studentId || 'N/A'} {student?.phone ? `• ${student.phone}` : ''}
                                </Typography>
                              </Box>
                            </Stack>
                          </TableCell>

                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155' }}>
                              {a.hostelId?.name || 'Main Campus Residency'}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#64748b' }}>
                              {a.hostelId?.hostelType || 'RESIDENTIAL'}
                            </Typography>
                          </TableCell>

                          <TableCell>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Chip 
                                size="small" 
                                icon={<MeetingRoomIcon sx={{ fontSize: 14 }} />} 
                                label={`Room ${room?.roomNumber || 'N/A'}`} 
                                sx={{ fontWeight: 700, bgcolor: '#f1f5f9' }} 
                              />
                              <Chip 
                                size="small" 
                                icon={<HotelIcon sx={{ fontSize: 14 }} />} 
                                label={`Bed ${bed?.bedNumber || 'N/A'}`} 
                                sx={{ fontWeight: 700, bgcolor: '#ede9fe', color: '#7c3aed' }} 
                              />
                            </Stack>
                          </TableCell>

                          <TableCell>
                            <Typography variant="body2" sx={{ color: '#334155' }}>
                              {a.startDate ? new Date(a.startDate).toLocaleDateString() : 'Active Term'}
                            </Typography>
                          </TableCell>

                          <TableCell>
                            <Chip 
                              size="small" 
                              label={a.status} 
                              color={a.status === 'CHECKED_IN' ? 'success' : a.status === 'ALLOCATED' ? 'primary' : 'default'}
                              sx={{ fontWeight: 700 }}
                            />
                          </TableCell>

                          <TableCell align="right">
                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                              {a.status === 'ALLOCATED' && (
                                <Button 
                                  size="small" 
                                  variant="contained" 
                                  color="success" 
                                  startIcon={<LoginIcon />}
                                  onClick={() => {
                                    setCheckInForm({
                                      allocationId: a._id,
                                      condition: 'GOOD',
                                      keyHanded: true,
                                      remarks: 'Keys issued at warden desk'
                                    });
                                    setSelectedItemForAction({ student, room, bed, allocation: a });
                                    setOpenCheckInModal(true);
                                  }}
                                  sx={{ textTransform: 'none', fontWeight: 600 }}
                                >
                                  Check In
                                </Button>
                              )}
                              
                              <Tooltip title="Print Allotment Pass">
                                <IconButton 
                                  size="small" 
                                  onClick={() => {
                                    setSelectedItemForAction({ student, room, bed, allocation: a });
                                    setOpenPassModal(true);
                                  }}
                                  sx={{ color: '#6366f1' }}
                                >
                                  <PrintIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>

                              <Tooltip title="Transfer Room">
                                <IconButton 
                                  size="small" 
                                  onClick={() => {
                                    setTransferForm({
                                      transferId: a._id,
                                      targetRoomId: '',
                                      targetBedId: '',
                                      reason: 'Room Reallocation'
                                    });
                                    setSelectedItemForAction({
                                      student,
                                      currentRoom: room,
                                      currentBed: bed,
                                      allocationId: a._id
                                    });
                                    setOpenTransferModal(true);
                                  }}
                                  sx={{ color: '#8b5cf6' }}
                                >
                                  <SwapHorizIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>

                              <Tooltip title="Vacate / Check Out">
                                <IconButton 
                                  size="small" 
                                  color="error" 
                                  onClick={() => {
                                    setVacateForm({
                                      allocationId: a._id,
                                      roomCondition: 'GOOD',
                                      keyReturned: true,
                                      duesCleared: true,
                                      reason: 'Term Completion'
                                    });
                                    setSelectedItemForAction({ student, room, bed, allocation: a });
                                    setOpenVacateModal(true);
                                  }}
                                >
                                  <LogoutIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      );
                    })}

                    {filteredAllocations.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} sx={{ textAlign: 'center', py: 6, color: '#64748b' }}>
                          No active student allocations found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Box>
        </TabPanel>

        {/* TAB 2: APPLICATIONS */}
        <TabPanel value={tab} index={2}>
          <Box sx={{ p: 2.5 }}>
            <Paper sx={{ borderRadius: 3, overflow: 'hidden', border: '1px solid #e2e8f0' }}>
              <TableContainer>
                <Table>
                  <TableHead sx={{ backgroundColor: '#f8fafc' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Student Applicant</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Preferred Hostel</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Reason / Accommodation Request</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Submission Date</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Status</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, color: '#475569' }}>Warden Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {applications.map(app => (
                      <TableRow key={app._id} hover>
                        <TableCell>
                          <Stack direction="row" spacing={1.5} alignItems="center">
                            <Avatar sx={{ bgcolor: '#0284c7', width: 36, height: 36, fontWeight: 700 }}>
                              {app.studentId?.firstName?.[0] || 'A'}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                                {app.studentId?.firstName} {app.studentId?.lastName}
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#64748b' }}>
                                Admission ID: {app.studentId?.admissionNumber || app.studentId?.studentId || 'N/A'}
                              </Typography>
                            </Box>
                          </Stack>
                        </TableCell>

                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155' }}>
                            {app.preferredHostelId?.name || 'Any Available Hostel'}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#64748b' }}>
                            {app.preferredHostelId?.hostelType || 'RESIDENTIAL'}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Typography variant="body2" sx={{ color: '#334155' }}>
                            {app.reason || 'Standard hostel accommodation request'}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Typography variant="body2" sx={{ color: '#64748b' }}>
                            {app.createdAt ? new Date(app.createdAt).toLocaleDateString() : 'Recent'}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Chip 
                            size="small" 
                            label={app.status || 'SUBMITTED'} 
                            color={app.status === 'APPROVED' ? 'success' : app.status === 'REJECTED' ? 'error' : 'warning'}
                            sx={{ fontWeight: 700 }}
                          />
                        </TableCell>

                        <TableCell align="right">
                          <Button 
                            size="small" 
                            variant="contained" 
                            startIcon={<CheckCircleIcon />}
                            onClick={() => {
                              setAllocForm({
                                studentId: app.studentId?._id || app.studentId,
                                hostelId: app.preferredHostelId?._id || '',
                                roomId: '',
                                bedId: ''
                              });
                              setOpenAllocModal(true);
                            }}
                            sx={{ 
                              textTransform: 'none', 
                              fontWeight: 700, 
                              background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
                              borderRadius: 2
                            }}
                          >
                            Approve & Assign Bed
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}

                    {applications.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} sx={{ textAlign: 'center', py: 6, color: '#64748b' }}>
                          No pending applications in queue. Click "+ New Application" to register a hosteller.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Box>
        </TabPanel>
      </Paper>

      {/* --- MODAL 1: DIRECT BED ALLOCATION --- */}
      <Dialog open={openAllocModal} onClose={() => setOpenAllocModal(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 800, color: '#0f172a', borderBottom: '1px solid #e2e8f0' }}>
          Assign Student to Hostel Bed
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Stack spacing={2.5}>
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              Select student and bed. The system will lock the bed and mark it as occupied in real time.
            </Alert>

            <FormControl fullWidth size="small">
              <InputLabel id="alloc-student-label">Student Resident *</InputLabel>
              <Select
                labelId="alloc-student-label"
                label="Student Resident *"
                value={allocForm.studentId}
                onChange={e => setAllocForm({ ...allocForm, studentId: e.target.value })}
              >
                {students.map(s => (
                  <MenuItem key={s._id} value={s._id}>
                    {s.firstName} {s.lastName} ({s.admissionNumber || s.studentId || 'No ID'})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth size="small">
              <InputLabel id="alloc-hostel-label">Hostel Residency *</InputLabel>
              <Select
                labelId="alloc-hostel-label"
                label="Hostel Residency *"
                value={allocForm.hostelId}
                onChange={e => setAllocForm({ ...allocForm, hostelId: e.target.value, roomId: '', bedId: '' })}
              >
                {hostels.map(h => (
                  <MenuItem key={h._id} value={h._id}>
                    {h.name} ({h.hostelType})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth size="small" disabled={!allocForm.hostelId}>
              <InputLabel id="alloc-room-label">Room Number *</InputLabel>
              <Select
                labelId="alloc-room-label"
                label="Room Number *"
                value={allocForm.roomId}
                onChange={e => setAllocForm({ ...allocForm, roomId: e.target.value, bedId: '' })}
              >
                {rooms
                  .filter(r => (r.hostelId?._id || r.hostelId) === allocForm.hostelId)
                  .map(r => (
                    <MenuItem key={r._id} value={r._id}>
                      Room {r.roomNumber} ({r.roomType} • Capacity {r.capacity})
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>

            <FormControl fullWidth size="small" disabled={!allocForm.roomId}>
              <InputLabel id="alloc-bed-label">Available Bed *</InputLabel>
              <Select
                labelId="alloc-bed-label"
                label="Available Bed *"
                value={allocForm.bedId}
                onChange={e => setAllocForm({ ...allocForm, bedId: e.target.value })}
              >
                {availableBedsForModal.map(b => (
                  <MenuItem key={b._id} value={b._id}>
                    Bed {b.bedNumber} (Vacant)
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, borderTop: '1px solid #e2e8f0' }}>
          <Button onClick={() => setOpenAllocModal(false)} sx={{ fontWeight: 600, color: '#64748b' }}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleAllocate} 
            disabled={!allocForm.studentId || !allocForm.bedId}
            sx={{ 
              fontWeight: 700, 
              background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
              borderRadius: 2
            }}
          >
            Confirm Bed Allocation
          </Button>
        </DialogActions>
      </Dialog>

      {/* --- MODAL 2: NEW APPLICATION --- */}
      <Dialog open={openApplyModal} onClose={() => setOpenApplyModal(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 800, color: '#0f172a', borderBottom: '1px solid #e2e8f0' }}>
          New Hostel Residency Application
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Stack spacing={2.5}>
            <FormControl fullWidth size="small">
              <InputLabel id="apply-student-label">Select Student *</InputLabel>
              <Select
                labelId="apply-student-label"
                label="Select Student *"
                value={applyForm.studentId}
                onChange={e => setApplyForm({ ...applyForm, studentId: e.target.value })}
              >
                {students.map(s => (
                  <MenuItem key={s._id} value={s._id}>
                    {s.firstName} {s.lastName} ({s.admissionNumber || 'Student'})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth size="small">
              <InputLabel id="apply-hostel-label">Preferred Hostel *</InputLabel>
              <Select
                labelId="apply-hostel-label"
                label="Preferred Hostel *"
                value={applyForm.preferredHostelId}
                onChange={e => setApplyForm({ ...applyForm, preferredHostelId: e.target.value })}
              >
                {hostels.map(h => (
                  <MenuItem key={h._id} value={h._id}>
                    {h.name} ({h.hostelType})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField 
              label="Reason / Boarding Requirements"
              value={applyForm.reason}
              onChange={e => setApplyForm({ ...applyForm, reason: e.target.value })}
              fullWidth
              multiline
              rows={3}
              size="small"
              placeholder="e.g. Distance from institution, athletic training, academic study wing..."
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, borderTop: '1px solid #e2e8f0' }}>
          <Button onClick={() => setOpenApplyModal(false)} sx={{ fontWeight: 600, color: '#64748b' }}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleApply} 
            sx={{ fontWeight: 700, borderRadius: 2 }}
          >
            Submit Application
          </Button>
        </DialogActions>
      </Dialog>

      {/* --- MODAL 3: CHECK IN STUDENT --- */}
      <Dialog open={openCheckInModal} onClose={() => setOpenCheckInModal(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 800, color: '#0f172a', borderBottom: '1px solid #e2e8f0' }}>
          Physical Check-In & Key Handover
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Stack spacing={2}>
            <Alert severity="success" icon={<KeyIcon fontSize="inherit" />} sx={{ borderRadius: 2 }}>
              Confirm student physical arrival, room inspection, and room keys handover.
            </Alert>

            <FormControl fullWidth size="small">
              <InputLabel id="condition-label">Room Condition *</InputLabel>
              <Select
                labelId="condition-label"
                label="Room Condition *"
                value={checkInForm.condition}
                onChange={e => setCheckInForm({ ...checkInForm, condition: e.target.value })}
              >
                <MenuItem value="EXCELLENT">Excellent - Ready</MenuItem>
                <MenuItem value="GOOD">Good - Cleaned</MenuItem>
                <MenuItem value="FAIR">Fair</MenuItem>
              </Select>
            </FormControl>

            <TextField 
              label="Warden Inspection Remarks"
              value={checkInForm.remarks}
              onChange={e => setCheckInForm({ ...checkInForm, remarks: e.target.value })}
              fullWidth
              multiline
              rows={2}
              size="small"
              placeholder="Key tagged and signed by hosteller..."
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, borderTop: '1px solid #e2e8f0' }}>
          <Button onClick={() => setOpenCheckInModal(false)} sx={{ fontWeight: 600 }}>Cancel</Button>
          <Button variant="contained" color="success" onClick={handleCheckIn} sx={{ fontWeight: 700, borderRadius: 2 }}>
            Confirm Check-In
          </Button>
        </DialogActions>
      </Dialog>

      {/* --- MODAL 4: VACATE ROOM --- */}
      <Dialog open={openVacateModal} onClose={() => setOpenVacateModal(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 800, color: '#dc2626', borderBottom: '1px solid #e2e8f0' }}>
          Vacate Room & Release Bed
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Stack spacing={2}>
            <Alert severity="warning" sx={{ borderRadius: 2 }}>
              Vacating this student will release the bed back to Available status for other applicants.
            </Alert>

            <FormControl fullWidth size="small">
              <InputLabel id="vacate-reason-label">Reason for Vacating *</InputLabel>
              <Select
                labelId="vacate-reason-label"
                label="Reason for Vacating *"
                value={vacateForm.reason}
                onChange={e => setVacateForm({ ...vacateForm, reason: e.target.value })}
              >
                <MenuItem value="End of Term">End of Academic Term</MenuItem>
                <MenuItem value="Graduation">Course Graduation</MenuItem>
                <MenuItem value="Day Scholar Transition">Transfer to Day Scholar</MenuItem>
                <MenuItem value="Withdrawal">Student Withdrawal</MenuItem>
                <MenuItem value="Disciplinary">Disciplinary Action</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth size="small">
              <InputLabel id="vacate-condition-label">Room Condition On Exit</InputLabel>
              <Select
                labelId="vacate-condition-label"
                label="Room Condition On Exit"
                value={vacateForm.roomCondition}
                onChange={e => setVacateForm({ ...vacateForm, roomCondition: e.target.value })}
              >
                <MenuItem value="GOOD">Good - No Damage</MenuItem>
                <MenuItem value="MINOR_REPAIRS">Minor Wear & Tear</MenuItem>
                <MenuItem value="DAMAGES_REPORTED">Damages Reported (Dues Deducted)</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, borderTop: '1px solid #e2e8f0' }}>
          <Button onClick={() => setOpenVacateModal(false)} sx={{ fontWeight: 600 }}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleVacate} sx={{ fontWeight: 700, borderRadius: 2 }}>
            Confirm & Release Bed
          </Button>
        </DialogActions>
      </Dialog>

      {/* --- MODAL 5: ROOM TRANSFER --- */}
      <Dialog open={openTransferModal} onClose={() => setOpenTransferModal(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 800, color: '#0f172a', borderBottom: '1px solid #e2e8f0' }}>
          Transfer Resident to New Room
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Stack spacing={2.5}>
            {selectedItemForAction && (
              <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e293b' }}>
                  Current: {selectedItemForAction.student?.firstName} {selectedItemForAction.student?.lastName}
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748b' }}>
                  Room {selectedItemForAction.currentRoom?.roomNumber || 'N/A'} • Bed {selectedItemForAction.currentBed?.bedNumber || 'N/A'}
                </Typography>
              </Box>
            )}

            <FormControl fullWidth size="small">
              <InputLabel id="target-room-label">Target Room *</InputLabel>
              <Select
                labelId="target-room-label"
                label="Target Room *"
                value={transferForm.targetRoomId}
                onChange={e => setTransferForm({ ...transferForm, targetRoomId: e.target.value, targetBedId: '' })}
              >
                {rooms.map(r => (
                  <MenuItem key={r._id} value={r._id}>
                    Room {r.roomNumber} ({r.roomType} • Floor {r.floorId?.floorNumber || '1'})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth size="small" disabled={!transferForm.targetRoomId}>
              <InputLabel id="target-bed-label">Target Vacant Bed *</InputLabel>
              <Select
                labelId="target-bed-label"
                label="Target Vacant Bed *"
                value={transferForm.targetBedId}
                onChange={e => setTransferForm({ ...transferForm, targetBedId: e.target.value })}
              >
                {availableBedsForTransfer.map(b => (
                  <MenuItem key={b._id} value={b._id}>
                    Bed {b.bedNumber} (Vacant)
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField 
              label="Reason for Transfer"
              value={transferForm.reason}
              onChange={e => setTransferForm({ ...transferForm, reason: e.target.value })}
              fullWidth
              size="small"
              placeholder="e.g. Mutual swap, study room request, health accommodation..."
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, borderTop: '1px solid #e2e8f0' }}>
          <Button onClick={() => setOpenTransferModal(false)} sx={{ fontWeight: 600 }}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleTransfer} 
            disabled={!transferForm.targetBedId}
            sx={{ fontWeight: 700, borderRadius: 2 }}
          >
            Execute Transfer
          </Button>
        </DialogActions>
      </Dialog>

      {/* --- MODAL 6: PRINTABLE ALLOTMENT PASS --- */}
      <Dialog open={openPassModal} onClose={() => setOpenPassModal(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogContent sx={{ p: 4 }}>
          {selectedItemForAction && (
            <Box id="printable-allotment-pass" sx={{ p: 3, border: '2px solid #7c3aed', borderRadius: 3, bgcolor: '#ffffff' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 2, mb: 2, borderBottom: '2px solid #f1f5f9' }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 900, color: '#7c3aed' }}>
                    EDUCORE ACADEMY RESIDENTIAL HALLS
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                    Official Resident Allotment Pass & Gate Identity Card
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: '#7c3aed', width: 44, height: 44 }}>
                  <SchoolIcon />
                </Avatar>
              </Box>

              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={8}>
                  <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700 }}>RESIDENT STUDENT</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
                    {selectedItemForAction.student?.firstName} {selectedItemForAction.student?.lastName}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#475569' }}>
                    Admission ID: {selectedItemForAction.student?.admissionNumber || selectedItemForAction.student?.studentId || 'N/A'}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#475569' }}>
                    Contact: {selectedItemForAction.student?.phone || 'On Record'}
                  </Typography>
                </Grid>
                <Grid item xs={4} sx={{ textAlign: 'right' }}>
                  <Box sx={{ p: 1.5, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                    <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700 }}>ROOM / BED</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 900, color: '#7c3aed' }}>
                      {selectedItemForAction.room?.roomNumber || 'Room N/A'}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#16a34a' }}>
                      Bed {selectedItemForAction.bed?.bedNumber || 'B1'}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ mb: 3, p: 2, bgcolor: '#f5f3ff', borderRadius: 2 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#7c3aed', display: 'block', mb: 0.5 }}>
                  HOSTEL RESIDENCE RULES & CURFEW
                </Typography>
                <Typography variant="caption" sx={{ color: '#4b5563', display: 'block' }}>
                  • Night Curfew Roll Call at 8:30 PM is mandatory for all students.
                </Typography>
                <Typography variant="caption" sx={{ color: '#4b5563', display: 'block' }}>
                  • Digital Gate Pass required for leaving campus premises.
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', pt: 2 }}>
                <Box>
                  <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block' }}>Issued on: {new Date().toLocaleDateString()}</Typography>
                  <Typography variant="caption" sx={{ color: '#16a34a', fontWeight: 700 }}>STATUS: VERIFIED RESIDENT</Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Box sx={{ width: 120, borderBottom: '1px solid #334155', mb: 0.5 }} />
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#334155' }}>Chief Warden Signature</Typography>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2.5, borderTop: '1px solid #e2e8f0' }}>
          <Button onClick={() => setOpenPassModal(false)} sx={{ fontWeight: 600 }}>Close</Button>
          <Button 
            variant="contained" 
            startIcon={<PrintIcon />}
            onClick={() => window.print()}
            sx={{ fontWeight: 700, borderRadius: 2 }}
          >
            Print Allotment Pass
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
};

export default AllocationManagement;
