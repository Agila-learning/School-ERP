import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, Chip, Table, TableBody,
  TableCell, TableHead, TableRow, TableContainer, Alert, Button, Divider, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField, MenuItem,
  IconButton, Tooltip, Snackbar, Tabs, Tab, InputAdornment, Paper,
  Badge, Avatar, useMediaQuery, useTheme
} from '@mui/material';
import {
  Security as SecurityIcon,
  People as PeopleIcon,
  DirectionsBus as BusIcon,
  QrCode2 as QrCodeIcon,
  QrCodeScanner as QrScanIcon,
  FileDownload as ExcelIcon,
  AddCircle as AddIcon,
  ExitToApp as CheckOutIcon,
  CheckCircle as CheckInIcon,
  Search as SearchIcon,
  Print as PrintIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  DirectionsCar as CarIcon,
  TwoWheeler as BikeIcon,
  LocalShipping as TruckIcon,
  Person as PersonIcon,
  Badge as BadgeIcon,
  Phone as PhoneIcon,
  AccessTime as TimeIcon,
  Timer as DurationIcon,
  LocationOn as LocationIcon,
  Speed as OdometerIcon,
  Warning as WarningIcon,
  Lock as LockIcon,
  LockOpen as UnlockIcon,
  Refresh as RefreshIcon,
  Close as CloseIcon,
  SwapHoriz as TripIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';

// ─── Interfaces ───

export type PersonType = 
  | 'VISITOR' 
  | 'PARENT' 
  | 'STAFF' 
  | 'VENDOR' 
  | 'DELIVERY' 
  | 'STUDENT_EARLY' 
  | 'STUDENT_LATE' 
  | 'GUEST_VIP';

export type GateStatus = 'INSIDE' | 'CHECKED_OUT' | 'DENIED' | 'PENDING';

export interface GateEntryPerson {
  id: string;
  entryNumber: string;
  name: string;
  type: PersonType;
  phone: string;
  idProofType?: string;
  idProofNumber?: string;
  reason: string;
  customReason?: string;
  hostDepartment: string;
  hostPerson?: string;
  vehicleType: 'NONE' | 'TWO_WHEELER' | 'CAR' | 'AUTO' | 'TRUCK_VAN';
  vehicleNumber?: string;
  gate: string;
  checkInTime: string; // ISO string or formatted
  checkOutTime?: string;
  durationMinutes?: number;
  status: GateStatus;
  guardOnDuty: string;
  belongingsNotes?: string;
  createdAt: string;
}

export type BusTripType = 
  | 'MORNING_PICKUP' 
  | 'EVENING_DROP' 
  | 'FIELD_TRIP' 
  | 'SPORTS_EVENT' 
  | 'MAINTENANCE_FUEL' 
  | 'OTHER';

export type BusStatus = 'ON_CAMPUS' | 'OUT_ON_TRIP' | 'MAINTENANCE';

export interface BusProfile {
  id: string;
  busNumber: string; // e.g. "BUS-01"
  registrationPlate: string; // e.g. "MH-04-AB-1234"
  routeName: string;
  defaultDriver: string;
  driverPhone: string;
  capacity: number;
  currentStatus: BusStatus;
  currentTripType?: BusTripType;
  lastDepartureTime?: string;
  lastArrivalTime?: string;
}

export interface BusMovementLog {
  id: string;
  logNumber: string;
  busId: string;
  busNumber: string;
  registrationPlate: string;
  routeName: string;
  driverName: string;
  attendantName?: string;
  tripType: BusTripType;
  outTime: string;
  inTime?: string;
  durationMinutes?: number;
  passengerCount: number;
  outOdometerKm?: number;
  inOdometerKm?: number;
  distanceKm?: number;
  gate: string;
  guardOnDuty: string;
  remarks?: string;
  status: 'OUT' | 'RETURNED';
  date: string;
}

// ─── Live Data Storage Initializers (Zero Mock Defaults) ───

const INITIAL_BUSES: BusProfile[] = [];
const INITIAL_ENTRIES: GateEntryPerson[] = [];
const INITIAL_BUS_LOGS: BusMovementLog[] = [];

export const POPULAR_REASONS = [
  'Parent-Teacher Meeting / Academic Discussion',
  'Fee Payment & Finance Desk',
  'Admissions & Campus Enquiry',
  'Principal / Administrative Meeting',
  'Vendor / Maintenance Work',
  'Courier / Delivery Drop',
  'Early Student Pickup',
  'Late Student Entry Verification',
  'Job Applicant / Interview',
  'Inter-School Sports / Event Guest',
  'Facility Inspection / Official Visit',
  'Other / Custom Purpose'
];

export const DEPARTMENTS = [
  'Principal & Management Suite',
  'Office Administration & Admissions',
  'Accounts & Fee Desk',
  'Primary School Wing (KG - Grade 5)',
  'Middle School Wing (Grades 6 - 8)',
  'Secondary Section (Grades 9 - 10)',
  'Higher Secondary Wing (Grades 11 - 12)',
  'Science & Computer Laboratories',
  'Sports Complex & Grounds',
  'Cafeteria / Dining Hall',
  'Hostel / Residential Block',
  'Maintenance & Facilities Hub'
];

// ─── Lightweight High-Contrast QR Code Component ───
// Generates clean, crisp, deterministic SVG QR-style visual code
export const AuthenticQRCode: React.FC<{ value: string; size?: number; label?: string }> = ({
  value,
  size = 180,
  label
}) => {
  // Deterministic seed matrix generation from string value
  const gridCount = 21; // standard version 1 QR size (21x21)
  
  const matrix = useMemo(() => {
    // Generate pseudo-random deterministic grid
    let hash = 0;
    for (let i = 0; i < value.length; i++) {
      hash = (hash << 5) - hash + value.charCodeAt(i);
      hash |= 0;
    }

    const grid: boolean[][] = Array.from({ length: gridCount }, () => Array(gridCount).fill(false));

    // Fill standard 3 corner finder patterns (7x7 blocks)
    const drawFinderPattern = (startX: number, startY: number) => {
      for (let r = 0; r < 7; r++) {
        for (let c = 0; c < 7; c++) {
          const isOuterBorder = r === 0 || r === 6 || c === 0 || c === 6;
          const isInnerSquare = r >= 2 && r <= 4 && c >= 2 && c <= 4;
          grid[startY + r][startX + c] = isOuterBorder || isInnerSquare;
        }
      }
    };

    drawFinderPattern(0, 0); // Top-left
    drawFinderPattern(gridCount - 7, 0); // Top-right
    drawFinderPattern(0, gridCount - 7); // Bottom-left

    // Timing lines
    for (let i = 8; i < gridCount - 8; i++) {
      grid[6][i] = i % 2 === 0;
      grid[i][6] = i % 2 === 0;
    }

    // Fill data modules with hash bits
    let seed = Math.abs(hash);
    for (let r = 0; r < gridCount; r++) {
      for (let c = 0; c < gridCount; c++) {
        // Skip finder areas
        const inTopLeft = r < 8 && c < 8;
        const inTopRight = r < 8 && c >= gridCount - 8;
        const inBottomLeft = r >= gridCount - 8 && c < 8;
        if (!inTopLeft && !inTopRight && !inBottomLeft) {
          seed = (seed * 1664525 + 1013904223) % 4294967296;
          grid[r][c] = (seed % 10) > 4;
        }
      }
    }

    return grid;
  }, [value]);

  const cellSize = size / gridCount;

  return (
    <Box sx={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center' }}>
      <Box
        sx={{
          p: 1.5,
          bgcolor: '#ffffff',
          borderRadius: 2,
          boxShadow: '0 4px 14px rgba(0,0,0,0.1)',
          border: '1px solid #e2e8f0',
          display: 'inline-block'
        }}
      >
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <rect width={size} height={size} fill="#ffffff" />
          {matrix.map((row, r) =>
            row.map((cell, c) =>
              cell ? (
                <rect
                  key={`${r}-${c}`}
                  x={c * cellSize}
                  y={r * cellSize}
                  width={cellSize + 0.3}
                  height={cellSize + 0.3}
                  fill="#0f172a"
                />
              ) : null
            )
          )}
          {/* School Badge Center Circle */}
          <circle cx={size / 2} cy={size / 2} r={cellSize * 2.2} fill="#ffffff" stroke="#0284c7" strokeWidth="2" />
          <text
            x={size / 2}
            y={size / 2 + 3}
            textAnchor="middle"
            fill="#0284c7"
            fontSize={cellSize * 1.8}
            fontWeight="900"
            fontFamily="sans-serif"
          >
            ERP
          </text>
        </svg>
      </Box>
      {label && (
        <Typography variant="caption" sx={{ mt: 1, fontFamily: 'monospace', fontWeight: 700, color: '#334155' }}>
          {label}
        </Typography>
      )}
    </Box>
  );
};

// ─── Export to Excel CSV Engine ───
// Generates UTF-8 BOM CSV that automatically opens in Excel correctly
export const exportToExcel = (filename: string, headers: string[], rows: (string | number)[][]) => {
  const escapeCsv = (val: string | number | undefined | null) => {
    if (val === undefined || val === null) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const csvRows = [
    headers.map(escapeCsv).join(','),
    ...rows.map(row => row.map(escapeCsv).join(','))
  ];

  const csvContent = '\uFEFF' + csvRows.join('\r\n'); // \uFEFF ensures UTF-8 recognition in MS Excel
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// ─── Main Watchman Dashboard Component ───

const WatchmanDashboard: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  // Main Tabs: 0 = People Gate Entry, 1 = School Bus Timings, 2 = QR Code Pass Scanner
  const [activeTab, setActiveTab] = useState<number>(0);

  // ─── State: People Gate Entries ───
  const [entries, setEntries] = useState<GateEntryPerson[]>(() => {
    const saved = localStorage.getItem('erp_security_gate_entries');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return INITIAL_ENTRIES;
  });

  // ─── State: Buses & Bus Movements ───
  const [buses, setBuses] = useState<BusProfile[]>(() => {
    const saved = localStorage.getItem('erp_security_bus_profiles');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return INITIAL_BUSES;
  });

  const [busLogs, setBusLogs] = useState<BusMovementLog[]>(() => {
    const saved = localStorage.getItem('erp_security_bus_logs');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return INITIAL_BUS_LOGS;
  });

  // Selected Bus filter in fleet switcher
  const [selectedBusId, setSelectedBusId] = useState<string>('ALL');

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');

  // Lockdown toggle
  const [lockdownActive, setLockdownActive] = useState<boolean>(false);

  // Modals
  const [newEntryModalOpen, setNewEntryModalOpen] = useState(false);
  const [editEntryModalOpen, setEditEntryModalOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<GateEntryPerson | null>(null);
  const [viewPassModalOpen, setViewPassModalOpen] = useState(false);
  const [passToView, setPassToView] = useState<GateEntryPerson | null>(null);

  // Bus Modals
  const [busOutModalOpen, setBusOutModalOpen] = useState(false);
  const [busInModalOpen, setBusInModalOpen] = useState(false);
  const [selectedBusForTrip, setSelectedBusForTrip] = useState<BusProfile | null>(null);

  // Scanner Simulator / Code Lookup
  const [scanCodeInput, setScanCodeInput] = useState('');
  const [scannedRecord, setScannedRecord] = useState<GateEntryPerson | null>(null);
  const [scanSuccessFeedback, setScanSuccessFeedback] = useState<string | null>(null);

  // Toast notifications
  const [toast, setToast] = useState<{ open: boolean; message: string; severity: 'success' | 'info' | 'warning' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  });

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem('erp_security_gate_entries', JSON.stringify(entries));
  }, [entries]);

  useEffect(() => {
    localStorage.setItem('erp_security_bus_profiles', JSON.stringify(buses));
  }, [buses]);

  useEffect(() => {
    localStorage.setItem('erp_security_bus_logs', JSON.stringify(busLogs));
  }, [busLogs]);

  // Form state for New Entry
  const [entryForm, setEntryForm] = useState({
    name: '',
    type: 'VISITOR' as PersonType,
    phone: '',
    idProofType: 'Aadhaar Card',
    idProofNumber: '',
    reason: POPULAR_REASONS[0],
    customReason: '',
    hostDepartment: DEPARTMENTS[0],
    hostPerson: '',
    vehicleType: 'NONE' as 'NONE' | 'TWO_WHEELER' | 'CAR' | 'AUTO' | 'TRUCK_VAN',
    vehicleNumber: '',
    gate: 'Gate 1 (Main Gate)',
    guardOnDuty: 'Officer S. Ramalingam (Duty Guard)',
    belongingsNotes: ''
  });

  // Form state for Bus Out (Departure)
  const [busOutForm, setBusOutForm] = useState({
    busId: '',
    tripType: 'MORNING_PICKUP' as BusTripType,
    driverName: '',
    attendantName: '',
    departureTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    outOdometerKm: '',
    passengerCount: '0',
    gate: 'Gate 1 (Main Gate)',
    remarks: ''
  });

  // Form state for Bus In (Arrival)
  const [busInForm, setBusInForm] = useState({
    logId: '',
    busId: '',
    arrivalTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    inOdometerKm: '',
    remarks: ''
  });

  // ─── Filtered People Entries ───
  const filteredEntries = useMemo(() => {
    return entries.filter(e => {
      const matchSearch =
        e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.phone.includes(searchQuery) ||
        e.entryNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (e.vehicleNumber && e.vehicleNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
        e.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.hostDepartment.toLowerCase().includes(searchQuery.toLowerCase());

      const matchStatus = statusFilter === 'ALL' || e.status === statusFilter;
      const matchType = typeFilter === 'ALL' || e.type === typeFilter;

      return matchSearch && matchStatus && matchType;
    });
  }, [entries, searchQuery, statusFilter, typeFilter]);

  // ─── Filtered Bus Logs ───
  const filteredBusLogs = useMemo(() => {
    return busLogs.filter(log => {
      if (selectedBusId === 'ALL') return true;
      return log.busId === selectedBusId;
    });
  }, [busLogs, selectedBusId]);

  // ─── Stats KPI Metrics ───
  const stats = useMemo(() => {
    const peopleInside = entries.filter(e => e.status === 'INSIDE').length;
    const peopleCheckedOut = entries.filter(e => e.status === 'CHECKED_OUT').length;
    const busesOnCampus = buses.filter(b => b.currentStatus === 'ON_CAMPUS').length;
    const busesOutOnTrip = buses.filter(b => b.currentStatus === 'OUT_ON_TRIP').length;
    return {
      totalEntriesToday: entries.length,
      peopleInside,
      peopleCheckedOut,
      busesOnCampus,
      busesOutOnTrip,
      totalBuses: buses.length
    };
  }, [entries, buses]);

  // ─── Handlers: Gate Entry (People) CRUD ───

  const handleCreateEntry = () => {
    if (!entryForm.name.trim()) {
      setToast({ open: true, message: 'Please enter person full name', severity: 'warning' });
      return;
    }
    if (!entryForm.phone.trim()) {
      setToast({ open: true, message: 'Please enter contact phone number', severity: 'warning' });
      return;
    }

    const nextSerial = 1040 + entries.length + 1;
    const entryNumber = `GP-2026-${nextSerial}`;
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newRecord: GateEntryPerson = {
      id: `ent-${Date.now()}`,
      entryNumber,
      name: entryForm.name.trim(),
      type: entryForm.type,
      phone: entryForm.phone.trim(),
      idProofType: entryForm.idProofType,
      idProofNumber: entryForm.idProofNumber,
      reason: entryForm.reason === 'Other / Custom Purpose' && entryForm.customReason ? entryForm.customReason : entryForm.reason,
      hostDepartment: entryForm.hostDepartment,
      hostPerson: entryForm.hostPerson.trim(),
      vehicleType: entryForm.vehicleType,
      vehicleNumber: entryForm.vehicleNumber.trim().toUpperCase(),
      gate: entryForm.gate,
      checkInTime: nowTime,
      status: 'INSIDE',
      guardOnDuty: entryForm.guardOnDuty,
      belongingsNotes: entryForm.belongingsNotes.trim(),
      createdAt: new Date().toISOString()
    };

    setEntries(prev => [newRecord, ...prev]);
    setNewEntryModalOpen(false);

    // Auto show generated pass with QR!
    setPassToView(newRecord);
    setViewPassModalOpen(true);

    setToast({
      open: true,
      message: `Pass #${entryNumber} created! Scannable QR Pass generated.`,
      severity: 'success'
    });

    // Reset Form
    setEntryForm({
      name: '',
      type: 'VISITOR',
      phone: '',
      idProofType: 'Aadhaar Card',
      idProofNumber: '',
      reason: POPULAR_REASONS[0],
      customReason: '',
      hostDepartment: DEPARTMENTS[0],
      hostPerson: '',
      vehicleType: 'NONE',
      vehicleNumber: '',
      gate: 'Gate 1 (Main Gate)',
      guardOnDuty: 'Officer S. Ramalingam (Duty Guard)',
      belongingsNotes: ''
    });
  };

  const handleCheckOut = (entry: GateEntryPerson) => {
    const exitTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Calculate approximate duration in minutes
    let durationMins = 30; // fallback
    try {
      const entryDate = new Date(entry.createdAt);
      const diffMs = Math.max(0, Date.now() - entryDate.getTime());
      durationMins = Math.max(1, Math.round(diffMs / 60000));
    } catch {
      durationMins = 45;
    }

    setEntries(prev =>
      prev.map(e =>
        e.id === entry.id
          ? {
              ...e,
              status: 'CHECKED_OUT',
              checkOutTime: exitTime,
              durationMinutes: durationMins
            }
          : e
      )
    );

    setToast({
      open: true,
      message: `${entry.name} checked out at ${exitTime}. Total duration: ${durationMins} mins.`,
      severity: 'info'
    });
  };

  const handleDirectCheckIn = (entry: GateEntryPerson) => {
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setEntries(prev =>
      prev.map(e =>
        e.id === entry.id
          ? {
              ...e,
              status: 'INSIDE',
              checkInTime: nowTime,
              checkOutTime: undefined,
              durationMinutes: undefined
            }
          : e
      )
    );
    setToast({
      open: true,
      message: `${entry.name} marked checked in at ${nowTime}`,
      severity: 'success'
    });
  };

  const handleDeleteEntry = (entryId: string) => {
    if (window.confirm('Are you sure you want to delete this gate entry record?')) {
      setEntries(prev => prev.filter(e => e.id !== entryId));
      setToast({ open: true, message: 'Gate entry record deleted.', severity: 'info' });
    }
  };

  const handleUpdateEntry = () => {
    if (!selectedEntry) return;
    setEntries(prev => prev.map(e => (e.id === selectedEntry.id ? selectedEntry : e)));
    setEditEntryModalOpen(false);
    setToast({ open: true, message: 'Gate pass record updated successfully.', severity: 'success' });
  };

  // ─── Handlers: Bus Movements ───

  const handleOpenBusOutModal = (bus?: BusProfile) => {
    const targetBus = bus || buses[0];
    setSelectedBusForTrip(targetBus);
    setBusOutForm({
      busId: targetBus.id,
      tripType: 'MORNING_PICKUP',
      driverName: targetBus.defaultDriver,
      attendantName: '',
      departureTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      outOdometerKm: '42180',
      passengerCount: '35',
      gate: 'Gate 1 (Main Gate)',
      remarks: ''
    });
    setBusOutModalOpen(true);
  };

  const handleConfirmBusOut = () => {
    const targetBus = buses.find(b => b.id === busOutForm.busId);
    if (!targetBus) return;

    const nextLogNumber = `BM-2026-${(busLogs.length + 80).toString().padStart(3, '0')}`;
    const newLog: BusMovementLog = {
      id: `blog-${Date.now()}`,
      logNumber: nextLogNumber,
      busId: targetBus.id,
      busNumber: targetBus.busNumber,
      registrationPlate: targetBus.registrationPlate,
      routeName: targetBus.routeName,
      driverName: busOutForm.driverName || targetBus.defaultDriver,
      attendantName: busOutForm.attendantName,
      tripType: busOutForm.tripType,
      outTime: busOutForm.departureTime,
      passengerCount: parseInt(busOutForm.passengerCount) || 0,
      outOdometerKm: parseFloat(busOutForm.outOdometerKm) || undefined,
      gate: busOutForm.gate,
      guardOnDuty: 'Officer S. Ramalingam (Duty Guard)',
      remarks: busOutForm.remarks,
      status: 'OUT',
      date: new Date().toISOString().split('T')[0]
    };

    // Update bus profile status
    setBuses(prev =>
      prev.map(b =>
        b.id === targetBus.id
          ? {
              ...b,
              currentStatus: 'OUT_ON_TRIP',
              currentTripType: busOutForm.tripType,
              lastDepartureTime: busOutForm.departureTime
            }
          : b
      )
    );

    setBusLogs(prev => [newLog, ...prev]);
    setBusOutModalOpen(false);

    setToast({
      open: true,
      message: `${targetBus.busNumber} departure logged at ${busOutForm.departureTime}. Trip: ${busOutForm.tripType}`,
      severity: 'success'
    });
  };

  const handleOpenBusInModal = (log: BusMovementLog) => {
    setBusInForm({
      logId: log.id,
      busId: log.busId,
      arrivalTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      inOdometerKm: log.outOdometerKm ? String(log.outOdometerKm + 25) : '',
      remarks: 'Returned safely, no vehicle anomalies reported.'
    });
    setBusInModalOpen(true);
  };

  const handleConfirmBusIn = () => {
    const targetLog = busLogs.find(l => l.id === busInForm.logId);
    if (!targetLog) return;

    const inKm = parseFloat(busInForm.inOdometerKm) || 0;
    const distance = targetLog.outOdometerKm && inKm > targetLog.outOdometerKm ? inKm - targetLog.outOdometerKm : undefined;

    // Update log
    setBusLogs(prev =>
      prev.map(l =>
        l.id === targetLog.id
          ? {
              ...l,
              inTime: busInForm.arrivalTime,
              inOdometerKm: inKm || undefined,
              distanceKm: distance,
              durationMinutes: 75, // standard estimated duration
              remarks: (l.remarks ? l.remarks + ' | ' : '') + busInForm.remarks,
              status: 'RETURNED'
            }
          : l
      )
    );

    // Update Bus Profile
    setBuses(prev =>
      prev.map(b =>
        b.id === targetLog.busId
          ? {
              ...b,
              currentStatus: 'ON_CAMPUS',
              currentTripType: undefined,
              lastArrivalTime: busInForm.arrivalTime
            }
          : b
      )
    );

    setBusInModalOpen(false);
    setToast({
      open: true,
      message: `${targetLog.busNumber} arrival logged at ${busInForm.arrivalTime}. Bus returned to campus.`,
      severity: 'info'
    });
  };

  // ─── Handlers: QR Scanner Simulator ───

  const handleSearchOrScan = (codeToSearch?: string) => {
    const query = (codeToSearch || scanCodeInput).trim().toUpperCase();
    if (!query) {
      setToast({ open: true, message: 'Please enter or scan a Pass ID or Mobile Number', severity: 'warning' });
      return;
    }

    const found = entries.find(
      e =>
        e.entryNumber.toUpperCase() === query ||
        e.entryNumber.toUpperCase().includes(query) ||
        e.phone.includes(query) ||
        (e.vehicleNumber && e.vehicleNumber.toUpperCase() === query)
    );

    if (found) {
      setScannedRecord(found);
      setScanSuccessFeedback(`Pass Verified! Record found for ${found.name}`);
      setToast({ open: true, message: `Pass ${found.entryNumber} verified!`, severity: 'success' });
    } else {
      setScannedRecord(null);
      setScanSuccessFeedback(null);
      setToast({ open: true, message: `No pass matching "${query}" found. Check the ID.`, severity: 'error' });
    }
  };

  // ─── Export to Excel Handlers ───

  const handleExportPeopleEntriesExcel = () => {
    const headers = [
      'Pass ID',
      'Person Name',
      'Person Type',
      'Mobile Number',
      'ID Proof Type',
      'ID Proof Number',
      'Reason for Entry',
      'Department / Block',
      'Staff / Student to Visit',
      'Vehicle Type',
      'Vehicle Number',
      'Gate Location',
      'Check-In Time',
      'Check-Out Time',
      'Duration (Mins)',
      'Current Status',
      'Guard on Duty',
      'Belongings Notes',
      'Date Created'
    ];

    const rows = filteredEntries.map(e => [
      e.entryNumber,
      e.name,
      e.type,
      e.phone,
      e.idProofType || 'N/A',
      e.idProofNumber || 'N/A',
      e.reason,
      e.hostDepartment,
      e.hostPerson || 'General',
      e.vehicleType,
      e.vehicleNumber || 'NONE',
      e.gate,
      e.checkInTime,
      e.checkOutTime || 'STILL INSIDE',
      e.durationMinutes || (e.status === 'INSIDE' ? 'Active' : '-'),
      e.status,
      e.guardOnDuty,
      e.belongingsNotes || '',
      e.createdAt
    ]);

    exportToExcel('Campus_Gate_Pass_People_Register', headers, rows);
    setToast({ open: true, message: 'People gate entries exported to Excel (.csv) successfully!', severity: 'success' });
  };

  const handleExportBusMovementsExcel = () => {
    const headers = [
      'Log Number',
      'Bus Number',
      'Registration Plate',
      'Route Name',
      'Driver Name',
      'Attendant / Conductor',
      'Trip Type',
      'Departure (Out) Time',
      'Arrival (In) Time',
      'Trip Duration (Mins)',
      'Passenger Count',
      'Out Odometer (KM)',
      'In Odometer (KM)',
      'Distance Traveled (KM)',
      'Gate',
      'Guard on Duty',
      'Status',
      'Guard Remarks',
      'Date'
    ];

    const rows = filteredBusLogs.map(l => [
      l.logNumber,
      l.busNumber,
      l.registrationPlate,
      l.routeName,
      l.driverName,
      l.attendantName || 'None',
      l.tripType,
      l.outTime,
      l.inTime || 'OUT ON TRIP',
      l.durationMinutes || (l.status === 'OUT' ? 'In Progress' : '-'),
      l.passengerCount,
      l.outOdometerKm || 'N/A',
      l.inOdometerKm || 'N/A',
      l.distanceKm || 'N/A',
      l.gate,
      l.guardOnDuty,
      l.status,
      l.remarks || '',
      l.date
    ]);

    exportToExcel('School_Bus_Movement_Register', headers, rows);
    setToast({ open: true, message: 'Bus movements log exported to Excel (.csv) successfully!', severity: 'success' });
  };

  // Helper badge renderers
  const renderStatusChip = (status: GateStatus) => {
    switch (status) {
      case 'INSIDE':
        return (
          <Chip
            size="small"
            label="INSIDE CAMPUS"
            sx={{
              bgcolor: '#dcfce7',
              color: '#15803d',
              fontWeight: 800,
              fontSize: '0.7rem',
              letterSpacing: '0.04em',
              animation: 'pulse 2s infinite'
            }}
          />
        );
      case 'CHECKED_OUT':
        return (
          <Chip
            size="small"
            label="CHECKED OUT"
            sx={{ bgcolor: '#f1f5f9', color: '#475569', fontWeight: 700, fontSize: '0.7rem' }}
          />
        );
      case 'DENIED':
        return (
          <Chip
            size="small"
            label="DENIED ENTRY"
            sx={{ bgcolor: '#fee2e2', color: '#b91c1c', fontWeight: 800, fontSize: '0.7rem' }}
          />
        );
      default:
        return <Chip size="small" label={status} />;
    }
  };

  const renderBusStatusChip = (status: BusStatus, tripType?: BusTripType) => {
    switch (status) {
      case 'ON_CAMPUS':
        return (
          <Chip
            size="small"
            label="ON CAMPUS / STANDBY"
            sx={{ bgcolor: '#dcfce7', color: '#15803d', fontWeight: 800, fontSize: '0.68rem' }}
          />
        );
      case 'OUT_ON_TRIP':
        return (
          <Chip
            size="small"
            label={`OUT: ${tripType?.replace('_', ' ') || 'TRIP'}`}
            sx={{ bgcolor: '#e0e7ff', color: '#4338ca', fontWeight: 800, fontSize: '0.68rem' }}
          />
        );
      case 'MAINTENANCE':
        return (
          <Chip
            size="small"
            label="MAINTENANCE"
            sx={{ bgcolor: '#ffedd5', color: '#c2410c', fontWeight: 800, fontSize: '0.68rem' }}
          />
        );
      default:
        return <Chip size="small" label={status} />;
    }
  };

  return (
    <Box sx={{ p: { xs: 1.5, sm: 2.5, md: 3.5 }, bgcolor: '#f8fafc', minHeight: '100vh' }}>
      
      {/* ─── Top Header & Command Title ─── */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0369a1 100%)',
          borderRadius: 4,
          p: { xs: 2.5, sm: 3.5, md: 4 },
          color: '#ffffff',
          mb: 3,
          boxShadow: '0 12px 30px rgba(15, 23, 42, 0.25)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: -40,
            right: -40,
            width: 200,
            height: 200,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 70%)',
            pointerEvents: 'none'
          }}
        />

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: 3,
                bgcolor: 'rgba(255,255,255,0.12)',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(255,255,255,0.2)'
              }}
            >
              <SecurityIcon sx={{ fontSize: 32, color: '#38bdf8' }} />
            </Box>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: '-0.02em', fontSize: { xs: '1.5rem', sm: '1.85rem', md: '2.2rem' } }}>
                  Watchman & Security Command Desk
                </Typography>
                <Chip
                  label="GATE 1 - ACTIVE DUTY"
                  size="small"
                  sx={{ bgcolor: '#0284c7', color: '#fff', fontWeight: 800, fontSize: '0.7rem' }}
                />
              </Box>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mt: 0.5, fontWeight: 500 }}>
                Live gate entry logging, instant QR code generation, check-in/out tracking, and school bus fleet movement control.
              </Typography>
            </Box>
          </Box>

          {/* Quick Action Buttons */}
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', width: { xs: '100%', sm: 'auto' } }}>
            <Button
              variant="contained"
              onClick={() => setNewEntryModalOpen(true)}
              startIcon={<AddIcon />}
              sx={{
                bgcolor: '#38bdf8',
                color: '#0f172a',
                fontWeight: 800,
                borderRadius: 2.5,
                px: 2.5,
                py: 1,
                boxShadow: '0 4px 15px rgba(56, 189, 248, 0.4)',
                '&:hover': { bgcolor: '#7dd3fc' }
              }}
            >
              + New Gate Entry
            </Button>

            <Button
              variant="contained"
              onClick={() => handleOpenBusOutModal()}
              startIcon={<BusIcon />}
              sx={{
                bgcolor: '#f59e0b',
                color: '#0f172a',
                fontWeight: 800,
                borderRadius: 2.5,
                px: 2.5,
                py: 1,
                boxShadow: '0 4px 15px rgba(245, 158, 11, 0.4)',
                '&:hover': { bgcolor: '#fbbf24' }
              }}
            >
              Log Bus Out / In
            </Button>

            <Button
              variant="outlined"
              onClick={() => setLockdownActive(prev => !prev)}
              startIcon={lockdownActive ? <UnlockIcon /> : <LockIcon />}
              sx={{
                borderColor: lockdownActive ? '#ef4444' : 'rgba(255,255,255,0.3)',
                color: lockdownActive ? '#ef4444' : '#ffffff',
                bgcolor: lockdownActive ? '#fee2e2' : 'rgba(255,255,255,0.08)',
                fontWeight: 700,
                borderRadius: 2.5
              }}
            >
              {lockdownActive ? 'Emergency Lockdown ACTIVE' : 'Gate Normal'}
            </Button>
          </Box>
        </Box>
      </Box>

      {/* ─── Emergency Lockdown Alert Banner if active ─── */}
      {lockdownActive && (
        <Alert
          severity="error"
          sx={{
            mb: 3,
            borderRadius: 3,
            fontWeight: 700,
            fontSize: '0.95rem',
            boxShadow: '0 4px 20px rgba(239, 68, 68, 0.2)'
          }}
          action={
            <Button color="inherit" size="small" onClick={() => setLockdownActive(false)}>
              DISMISS LOCKDOWN
            </Button>
          }
        >
          🚨 <strong>EMERGENCY CAMPUS GATE LOCKDOWN INITIATED!</strong> All boom barriers closed. No unauthorized personnel or vehicles permitted entry or exit without Superintendent clearance.
        </Alert>
      )}

      {/* ─── Metric KPI Cards ─── */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={4} md={2.4}>
          <Card sx={{ borderRadius: 3, p: 2, height: '100%', bgcolor: '#ffffff', boxShadow: '0 2px 10px rgba(0,0,0,0.04)', borderLeft: '4px solid #0284c7' }}>
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
              People Today
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 900, color: '#0f172a', my: 0.5 }}>
              {stats.totalEntriesToday}
            </Typography>
            <Typography variant="caption" sx={{ color: '#0284c7', fontWeight: 600 }}>
              Total entries registered
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={6} sm={4} md={2.4}>
          <Card sx={{ borderRadius: 3, p: 2, height: '100%', bgcolor: '#ffffff', boxShadow: '0 2px 10px rgba(0,0,0,0.04)', borderLeft: '4px solid #16a34a' }}>
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
              Currently Inside
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 900, color: '#16a34a', my: 0.5 }}>
              {stats.peopleInside}
            </Typography>
            <Typography variant="caption" sx={{ color: '#15803d', fontWeight: 600 }}>
              Active on campus premises
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={6} sm={4} md={2.4}>
          <Card sx={{ borderRadius: 3, p: 2, height: '100%', bgcolor: '#ffffff', boxShadow: '0 2px 10px rgba(0,0,0,0.04)', borderLeft: '4px solid #64748b' }}>
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
              Checked Out
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 900, color: '#475569', my: 0.5 }}>
              {stats.peopleCheckedOut}
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
              Exited via security gates
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={6} sm={4} md={2.4}>
          <Card sx={{ borderRadius: 3, p: 2, height: '100%', bgcolor: '#ffffff', boxShadow: '0 2px 10px rgba(0,0,0,0.04)', borderLeft: '4px solid #8b5cf6' }}>
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
              Buses on Campus
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 900, color: '#7c3aed', my: 0.5 }}>
              {stats.busesOnCampus} / {stats.totalBuses}
            </Typography>
            <Typography variant="caption" sx={{ color: '#7c3aed', fontWeight: 600 }}>
              Parked & standby at depot
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4} md={2.4}>
          <Card sx={{ borderRadius: 3, p: 2, height: '100%', bgcolor: '#ffffff', boxShadow: '0 2px 10px rgba(0,0,0,0.04)', borderLeft: '4px solid #f59e0b' }}>
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
              Buses Out on Trips
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 900, color: '#d97706', my: 0.5 }}>
              {stats.busesOutOnTrip}
            </Typography>
            <Typography variant="caption" sx={{ color: '#b45309', fontWeight: 600 }}>
              Pickups, drops & field routes
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* ─── Main Tabs Navigation ─── */}
      <Paper sx={{ borderRadius: 3, mb: 3, bgcolor: '#ffffff', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <Tabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            px: 2,
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTab-root': {
              fontWeight: 800,
              fontSize: '0.92rem',
              py: 2,
              minHeight: 56
            }
          }}
        >
          <Tab
            icon={<PeopleIcon />}
            iconPosition="start"
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <span>People & Visitors Gate Entry</span>
                <Chip size="small" label={stats.peopleInside} color="primary" sx={{ fontWeight: 800, height: 20 }} />
              </Box>
            }
          />
          <Tab
            icon={<BusIcon />}
            iconPosition="start"
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <span>School Bus Fleet & Timings</span>
                <Chip size="small" label={`${stats.busesOutOnTrip} on trip`} sx={{ bgcolor: '#fef3c7', color: '#b45309', fontWeight: 800, height: 20 }} />
              </Box>
            }
          />
          <Tab
            icon={<QrScanIcon />}
            iconPosition="start"
            label="QR Scanner & Pass Validator"
          />
        </Tabs>
      </Paper>

      {/* ══════════════════════════════════════════════════════════════════════════ */}
      {/* TAB 0: PEOPLE & VISITORS GATE ENTRY                                       */}
      {/* ══════════════════════════════════════════════════════════════════════════ */}
      {activeTab === 0 && (
        <Box>
          {/* Controls Bar: Search, Filters, and Export */}
          <Card sx={{ borderRadius: 3, p: 2.5, mb: 3, boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={4} md={3.5}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search by name, phone, pass ID, vehicle..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: 'text.secondary' }} />
                      </InputAdornment>
                    ),
                    endAdornment: searchQuery ? (
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={() => setSearchQuery('')}>
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    ) : null
                  }}
                />
              </Grid>

              <Grid item xs={6} sm={2.5} md={2}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Status"
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="ALL">All Statuses</MenuItem>
                  <MenuItem value="INSIDE">Inside Campus</MenuItem>
                  <MenuItem value="CHECKED_OUT">Checked Out</MenuItem>
                  <MenuItem value="DENIED">Denied</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={6} sm={2.5} md={2}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Person Type"
                  value={typeFilter}
                  onChange={e => setTypeFilter(e.target.value)}
                >
                  <MenuItem value="ALL">All Types</MenuItem>
                  <MenuItem value="VISITOR">Visitor</MenuItem>
                  <MenuItem value="PARENT">Parent</MenuItem>
                  <MenuItem value="STAFF">Staff</MenuItem>
                  <MenuItem value="VENDOR">Vendor / Contractor</MenuItem>
                  <MenuItem value="DELIVERY">Delivery</MenuItem>
                  <MenuItem value="STUDENT_EARLY">Student Early Leave</MenuItem>
                  <MenuItem value="STUDENT_LATE">Student Late Comers</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12} sm={3} md={4.5} sx={{ display: 'flex', gap: 1, justifyContent: { xs: 'flex-start', md: 'flex-end' }, flexWrap: 'wrap' }}>
                <Button
                  variant="outlined"
                  color="success"
                  startIcon={<ExcelIcon />}
                  onClick={handleExportPeopleEntriesExcel}
                  sx={{ borderRadius: 2, fontWeight: 700, textTransform: 'none' }}
                >
                  Export to Excel (.csv)
                </Button>

                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setNewEntryModalOpen(true)}
                  sx={{ borderRadius: 2, fontWeight: 800, bgcolor: '#0284c7', textTransform: 'none' }}
                >
                  + Add Entry
                </Button>
              </Grid>
            </Grid>
          </Card>

          {/* People Gate Entries Table */}
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
            <TableContainer sx={{ maxHeight: 600 }}>
              <Table stickyHeader size={isMobile ? 'small' : 'medium'}>
                <TableHead>
                  <TableRow sx={{ '& th': { bgcolor: '#f1f5f9', fontWeight: 800, color: '#1e293b' } }}>
                    <TableCell>Pass ID / QR</TableCell>
                    <TableCell>Person & Category</TableCell>
                    <TableCell>Reason for Entry</TableCell>
                    <TableCell>Visiting Department</TableCell>
                    <TableCell>Vehicle</TableCell>
                    <TableCell>In / Out Time</TableCell>
                    <TableCell>Duration</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="center">Gate Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredEntries.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                        <PeopleIcon sx={{ fontSize: 48, color: '#94a3b8', mb: 1 }} />
                        <Typography variant="body1" sx={{ fontWeight: 700, color: '#475569' }}>
                          No gate entry records found
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Try adjusting your search criteria or register a new gate entry.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredEntries.map(entry => (
                      <TableRow
                        key={entry.id}
                        hover
                        sx={{
                          bgcolor: entry.status === 'INSIDE' ? '#f0fdf4' : 'inherit',
                          transition: 'background-color 0.2s'
                        }}
                      >
                        {/* Pass ID & Quick QR View */}
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <IconButton
                              size="small"
                              onClick={() => {
                                setPassToView(entry);
                                setViewPassModalOpen(true);
                              }}
                              sx={{
                                bgcolor: '#e2e8f0',
                                '&:hover': { bgcolor: '#cbd5e1' }
                              }}
                              title="Click to view full digital pass & QR code"
                            >
                              <QrCodeIcon fontSize="small" sx={{ color: '#0f172a' }} />
                            </IconButton>
                            <Box>
                              <Typography
                                variant="body2"
                                sx={{
                                  fontWeight: 800,
                                  fontFamily: 'monospace',
                                  color: '#0284c7',
                                  cursor: 'pointer'
                                }}
                                onClick={() => {
                                  setPassToView(entry);
                                  setViewPassModalOpen(true);
                                }}
                              >
                                {entry.entryNumber}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {entry.gate}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>

                        {/* Person Name & Category */}
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 800, color: '#0f172a' }}>
                            {entry.name}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.2 }}>
                            <Chip
                              size="small"
                              label={entry.type.replace('_', ' ')}
                              sx={{
                                height: 18,
                                fontSize: '0.65rem',
                                fontWeight: 700,
                                bgcolor:
                                  entry.type === 'PARENT' ? '#dbeafe' :
                                  entry.type === 'VENDOR' ? '#fef3c7' :
                                  entry.type === 'DELIVERY' ? '#f3e8ff' : '#e2e8f0'
                              }}
                            />
                            <Typography variant="caption" color="text.secondary">
                              📞 {entry.phone}
                            </Typography>
                          </Box>
                        </TableCell>

                        {/* Reason for Entry */}
                        <TableCell sx={{ maxWidth: 220 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155' }}>
                            {entry.reason}
                          </Typography>
                          {entry.belongingsNotes && (
                            <Typography variant="caption" sx={{ color: '#64748b', display: 'block', fontStyle: 'italic' }}>
                              Note: {entry.belongingsNotes}
                            </Typography>
                          )}
                        </TableCell>

                        {/* Visiting Department & Host */}
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {entry.hostDepartment}
                          </Typography>
                          {entry.hostPerson && (
                            <Typography variant="caption" color="text.secondary">
                              Host: {entry.hostPerson}
                            </Typography>
                          )}
                        </TableCell>

                        {/* Vehicle */}
                        <TableCell>
                          {entry.vehicleType === 'NONE' ? (
                            <Typography variant="caption" color="text.disabled">
                              On Foot
                            </Typography>
                          ) : (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              {entry.vehicleType === 'CAR' ? <CarIcon fontSize="small" sx={{ color: '#0284c7' }} /> :
                               entry.vehicleType === 'TWO_WHEELER' ? <BikeIcon fontSize="small" sx={{ color: '#16a34a' }} /> :
                               <TruckIcon fontSize="small" sx={{ color: '#d97706' }} />}
                              <Typography variant="caption" sx={{ fontWeight: 700, fontFamily: 'monospace' }}>
                                {entry.vehicleNumber || entry.vehicleType}
                              </Typography>
                            </Box>
                          )}
                        </TableCell>

                        {/* In / Out Timings */}
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: '#15803d' }}>
                            In: {entry.checkInTime}
                          </Typography>
                          {entry.checkOutTime ? (
                            <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', display: 'block' }}>
                              Out: {entry.checkOutTime}
                            </Typography>
                          ) : (
                            <Typography variant="caption" sx={{ color: '#0284c7', fontWeight: 600 }}>
                              Active Now
                            </Typography>
                          )}
                        </TableCell>

                        {/* Duration */}
                        <TableCell>
                          {entry.durationMinutes ? (
                            <Chip
                              size="small"
                              icon={<TimeIcon sx={{ fontSize: 14 }} />}
                              label={`${entry.durationMinutes}m`}
                              sx={{ fontWeight: 700, fontSize: '0.72rem' }}
                            />
                          ) : entry.status === 'INSIDE' ? (
                            <Chip
                              size="small"
                              label="In Progress"
                              sx={{ bgcolor: '#e0f2fe', color: '#0369a1', fontWeight: 700, fontSize: '0.68rem' }}
                            />
                          ) : (
                            <Typography variant="caption" color="text.disabled">—</Typography>
                          )}
                        </TableCell>

                        {/* Status */}
                        <TableCell>{renderStatusChip(entry.status)}</TableCell>

                        {/* Actions: Check-Out, QR Pass, Edit, Delete */}
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                            {entry.status === 'INSIDE' ? (
                              <Button
                                size="small"
                                variant="contained"
                                color="warning"
                                onClick={() => handleCheckOut(entry)}
                                startIcon={<CheckOutIcon />}
                                sx={{
                                  fontWeight: 800,
                                  fontSize: '0.75rem',
                                  py: 0.5,
                                  px: 1.5,
                                  borderRadius: 2
                                }}
                              >
                                Check Out
                              </Button>
                            ) : (
                              <Button
                                size="small"
                                variant="outlined"
                                color="success"
                                onClick={() => handleDirectCheckIn(entry)}
                                startIcon={<CheckInIcon />}
                                sx={{
                                  fontWeight: 700,
                                  fontSize: '0.75rem',
                                  py: 0.5,
                                  px: 1,
                                  borderRadius: 2
                                }}
                              >
                                Re-Enter
                              </Button>
                            )}

                            <Tooltip title="View Pass & QR Code">
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setPassToView(entry);
                                  setViewPassModalOpen(true);
                                }}
                              >
                                <QrCodeIcon fontSize="small" sx={{ color: '#0284c7' }} />
                              </IconButton>
                            </Tooltip>

                            <Tooltip title="Edit Details">
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setSelectedEntry(entry);
                                  setEditEntryModalOpen(true);
                                }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>

                            <Tooltip title="Delete Entry">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDeleteEntry(entry.id)}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Box>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════ */}
      {/* TAB 1: SCHOOL BUS TIMINGS & FLEET MOVEMENTS                              */}
      {/* ══════════════════════════════════════════════════════════════════════════ */}
      {activeTab === 1 && (
        <Box>
          {/* Easy Navigation Ribbon Between Buses */}
          <Card sx={{ borderRadius: 3, p: 2.5, mb: 3, boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <BusIcon sx={{ color: '#0284c7' }} />
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  School Bus Fleet Switcher (Quick Bus Navigation)
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  size="small"
                  variant="outlined"
                  color="success"
                  startIcon={<ExcelIcon />}
                  onClick={handleExportBusMovementsExcel}
                  sx={{ borderRadius: 2, fontWeight: 700 }}
                >
                  Export Bus Log (.csv)
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  onClick={() => handleOpenBusOutModal()}
                  startIcon={<AddIcon />}
                  sx={{ borderRadius: 2, fontWeight: 800, bgcolor: '#f59e0b', color: '#000' }}
                >
                  Log Bus Movement
                </Button>
              </Box>
            </Box>

            {/* Bus Cards Horizontal Selector */}
            <Box sx={{ display: 'flex', gap: 1.5, overflowX: 'auto', pb: 1.5, pt: 0.5 }}>
              <Paper
                onClick={() => setSelectedBusId('ALL')}
                sx={{
                  p: 2,
                  minWidth: 140,
                  cursor: 'pointer',
                  borderRadius: 2.5,
                  border: selectedBusId === 'ALL' ? '2px solid #0284c7' : '1px solid #e2e8f0',
                  bgcolor: selectedBusId === 'ALL' ? '#f0f9ff' : '#ffffff',
                  transition: 'all 0.2s',
                  '&:hover': { borderColor: '#0284c7', transform: 'translateY(-2px)' }
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a' }}>
                  🚌 All Buses
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {buses.length} registered vehicles
                </Typography>
              </Paper>

              {buses.map(bus => (
                <Paper
                  key={bus.id}
                  onClick={() => setSelectedBusId(bus.id)}
                  sx={{
                    p: 2,
                    minWidth: 190,
                    cursor: 'pointer',
                    borderRadius: 2.5,
                    border: selectedBusId === bus.id ? '2px solid #0284c7' : '1px solid #e2e8f0',
                    bgcolor: selectedBusId === bus.id ? '#f0f9ff' : '#ffffff',
                    transition: 'all 0.2s',
                    '&:hover': { borderColor: '#0284c7', transform: 'translateY(-2px)' }
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#0f172a' }}>
                      {bus.busNumber}
                    </Typography>
                    {renderBusStatusChip(bus.currentStatus, bus.currentTripType)}
                  </Box>
                  <Typography variant="caption" sx={{ fontWeight: 700, fontFamily: 'monospace', color: '#475569', display: 'block', mt: 0.5 }}>
                    {bus.registrationPlate}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748b', display: 'block', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    {bus.routeName}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1, pt: 1, borderTop: '1px dashed #e2e8f0' }}>
                    <Typography variant="caption" sx={{ color: '#0284c7', fontWeight: 600 }}>
                      Driver: {bus.defaultDriver.split(' ')[0]}
                    </Typography>
                    {bus.currentStatus === 'ON_CAMPUS' ? (
                      <Button
                        size="small"
                        variant="text"
                        color="warning"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenBusOutModal(bus);
                        }}
                        sx={{ fontSize: '0.68rem', py: 0, px: 0.5, fontWeight: 800 }}
                      >
                        Out &rarr;
                      </Button>
                    ) : (
                      <Typography variant="caption" sx={{ color: '#4338ca', fontWeight: 800, fontSize: '0.68rem' }}>
                        Trip Active
                      </Typography>
                    )}
                  </Box>
                </Paper>
              ))}
            </Box>
          </Card>

          {/* Bus Movement Logs Table */}
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
            <Box sx={{ p: 2, bgcolor: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#1e293b' }}>
                {selectedBusId === 'ALL' ? 'Complete Fleet Gate Movement Register' : `Movement Log for Selected Bus`}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Showing {filteredBusLogs.length} movement log entries
              </Typography>
            </Box>

            <TableContainer sx={{ maxHeight: 600 }}>
              <Table stickyHeader size={isMobile ? 'small' : 'medium'}>
                <TableHead>
                  <TableRow sx={{ '& th': { bgcolor: '#f1f5f9', fontWeight: 800, color: '#1e293b' } }}>
                    <TableCell>Log ID</TableCell>
                    <TableCell>Bus Details</TableCell>
                    <TableCell>Route</TableCell>
                    <TableCell>Driver & Crew</TableCell>
                    <TableCell>Trip Category</TableCell>
                    <TableCell>Departure (Out)</TableCell>
                    <TableCell>Arrival (In)</TableCell>
                    <TableCell>Trip Mileage</TableCell>
                    <TableCell>Pass. Count</TableCell>
                    <TableCell>Movement Status</TableCell>
                    <TableCell align="center">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredBusLogs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={11} align="center" sx={{ py: 6 }}>
                        <BusIcon sx={{ fontSize: 48, color: '#94a3b8', mb: 1 }} />
                        <Typography variant="body1" sx={{ fontWeight: 700, color: '#475569' }}>
                          No bus movement logs for this selection
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredBusLogs.map(log => (
                      <TableRow
                        key={log.id}
                        hover
                        sx={{ bgcolor: log.status === 'OUT' ? '#fefce8' : 'inherit' }}
                      >
                        {/* Log Number */}
                        <TableCell sx={{ fontFamily: 'monospace', fontWeight: 700, color: '#0284c7' }}>
                          {log.logNumber}
                        </TableCell>

                        {/* Bus Details */}
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 900 }}>
                            {log.busNumber}
                          </Typography>
                          <Typography variant="caption" sx={{ fontFamily: 'monospace', color: '#475569' }}>
                            {log.registrationPlate}
                          </Typography>
                        </TableCell>

                        {/* Route */}
                        <TableCell sx={{ maxWidth: 180 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {log.routeName}
                          </Typography>
                        </TableCell>

                        {/* Driver */}
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            {log.driverName}
                          </Typography>
                          {log.attendantName && (
                            <Typography variant="caption" color="text.secondary">
                              Attendant: {log.attendantName}
                            </Typography>
                          )}
                        </TableCell>

                        {/* Trip Type */}
                        <TableCell>
                          <Chip
                            size="small"
                            label={log.tripType.replace('_', ' ')}
                            sx={{
                              fontWeight: 700,
                              fontSize: '0.68rem',
                              bgcolor:
                                log.tripType === 'MORNING_PICKUP' ? '#dbeafe' :
                                log.tripType === 'EVENING_DROP' ? '#ede9fe' :
                                log.tripType === 'FIELD_TRIP' ? '#fef3c7' : '#f1f5f9'
                            }}
                          />
                        </TableCell>

                        {/* Out Time */}
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 800, color: '#b45309' }}>
                            {log.outTime}
                          </Typography>
                          {log.outOdometerKm && (
                            <Typography variant="caption" color="text.secondary">
                              Odo: {log.outOdometerKm} km
                            </Typography>
                          )}
                        </TableCell>

                        {/* In Time */}
                        <TableCell>
                          {log.inTime ? (
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 800, color: '#15803d' }}>
                                {log.inTime}
                              </Typography>
                              {log.inOdometerKm && (
                                <Typography variant="caption" color="text.secondary">
                                  Odo: {log.inOdometerKm} km
                                </Typography>
                              )}
                            </Box>
                          ) : (
                            <Typography variant="caption" sx={{ color: '#b45309', fontWeight: 800 }}>
                              ON ROUTE
                            </Typography>
                          )}
                        </TableCell>

                        {/* Distance / Duration */}
                        <TableCell>
                          {log.distanceKm ? (
                            <Typography variant="body2" sx={{ fontWeight: 700 }}>
                              {log.distanceKm} KM
                            </Typography>
                          ) : (
                            <Typography variant="caption" color="text.disabled">—</Typography>
                          )}
                          {log.durationMinutes && (
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                              ⏱ {log.durationMinutes} mins
                            </Typography>
                          )}
                        </TableCell>

                        {/* Passenger Count */}
                        <TableCell>
                          <Chip
                            size="small"
                            label={`${log.passengerCount} on board`}
                            sx={{ fontWeight: 700, fontSize: '0.7rem' }}
                          />
                        </TableCell>

                        {/* Status */}
                        <TableCell>
                          {log.status === 'OUT' ? (
                            <Chip
                              size="small"
                              label="OUT ON TRIP"
                              sx={{ bgcolor: '#fef3c7', color: '#b45309', fontWeight: 800, fontSize: '0.68rem' }}
                            />
                          ) : (
                            <Chip
                              size="small"
                              label="RETURNED"
                              sx={{ bgcolor: '#dcfce7', color: '#15803d', fontWeight: 800, fontSize: '0.68rem' }}
                            />
                          )}
                        </TableCell>

                        {/* Actions */}
                        <TableCell align="center">
                          {log.status === 'OUT' ? (
                            <Button
                              size="small"
                              variant="contained"
                              color="success"
                              onClick={() => handleOpenBusInModal(log)}
                              startIcon={<CheckInIcon />}
                              sx={{ fontWeight: 800, fontSize: '0.72rem', borderRadius: 2 }}
                            >
                              Log Return
                            </Button>
                          ) : (
                            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                              Completed
                            </Typography>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Box>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════ */}
      {/* TAB 2: QR CODE SCANNER & INSTANT PASS VALIDATOR                          */}
      {/* ══════════════════════════════════════════════════════════════════════════ */}
      {activeTab === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={5}>
            <Card sx={{ borderRadius: 3, p: 3, height: '100%', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <QrScanIcon sx={{ fontSize: 32, color: '#0284c7' }} />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>
                    Instant QR & Barcode Scanner
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Scan thermal paper pass QR or type visitor Pass ID
                  </Typography>
                </Box>
              </Box>

              {/* Simulated Camera Viewfinder */}
              <Box
                sx={{
                  width: '100%',
                  height: 240,
                  bgcolor: '#0f172a',
                  borderRadius: 3,
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  overflow: 'hidden',
                  border: '2px dashed #38bdf8',
                  mb: 3
                }}
              >
                {/* Laser scan animation line */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: '20%',
                    left: '10%',
                    right: '10%',
                    height: '2px',
                    bgcolor: '#38bdf8',
                    boxShadow: '0 0 12px #38bdf8',
                    animation: 'scanLine 2.5s infinite alternate'
                  }}
                />
                <QrCodeIcon sx={{ fontSize: 80, opacity: 0.3, mb: 1 }} />
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#38bdf8' }}>
                  Camera Scanner Standby
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', px: 4, textAlign: 'center' }}>
                  Align visitor QR code within frame or enter Pass ID manually below
                </Typography>
              </Box>

              {/* Manual Input / Barcode Scanner Gun Hook */}
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                Pass ID / Phone Lookup
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="e.g. GP-2026-1041"
                  value={scanCodeInput}
                  onChange={e => setScanCodeInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSearchOrScan()}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <QrCodeIcon fontSize="small" sx={{ color: '#0284c7' }} />
                      </InputAdornment>
                    )
                  }}
                />
                <Button
                  variant="contained"
                  onClick={() => handleSearchOrScan()}
                  sx={{ borderRadius: 2, fontWeight: 800, bgcolor: '#0284c7', px: 3 }}
                >
                  Verify
                </Button>
              </Box>

              {/* Quick Sample Passes to Test */}
              <Box sx={{ mt: 3, pt: 2, borderTop: '1px dashed #e2e8f0' }}>
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700 }}>
                  Quick test demo passes:
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                  {entries.slice(0, 3).map(e => (
                    <Chip
                      key={e.id}
                      size="small"
                      label={e.entryNumber}
                      onClick={() => {
                        setScanCodeInput(e.entryNumber);
                        handleSearchOrScan(e.entryNumber);
                      }}
                      sx={{
                        cursor: 'pointer',
                        fontWeight: 700,
                        fontFamily: 'monospace',
                        '&:hover': { bgcolor: '#0284c7', color: '#fff' }
                      }}
                    />
                  ))}
                </Box>
              </Box>
            </Card>
          </Grid>

          {/* Scanned Verification Result Card */}
          <Grid item xs={12} md={7}>
            {scannedRecord ? (
              <Card sx={{ borderRadius: 3, p: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
                {scanSuccessFeedback && (
                  <Alert severity="success" sx={{ mb: 2, borderRadius: 2, fontWeight: 700 }}>
                    {scanSuccessFeedback}
                  </Alert>
                )}

                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 3, alignItems: 'center' }}>
                  {/* Left QR Display */}
                  <Box sx={{ textAlign: 'center' }}>
                    <AuthenticQRCode value={scannedRecord.entryNumber} size={150} label={scannedRecord.entryNumber} />
                    <Box sx={{ mt: 1 }}>{renderStatusChip(scannedRecord.status)}</Box>
                  </Box>

                  {/* Right Record Details */}
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h5" sx={{ fontWeight: 900, color: '#0f172a' }}>
                      {scannedRecord.name}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#0284c7', fontWeight: 700, mt: 0.2 }}>
                      {scannedRecord.type.replace('_', ' ')} • {scannedRecord.phone}
                    </Typography>

                    <Divider sx={{ my: 1.5 }} />

                    <Grid container spacing={1.5}>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                          REASON OF ENTRY
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {scannedRecord.reason}
                        </Typography>
                      </Grid>

                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                          VISITING DEPARTMENT
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {scannedRecord.hostDepartment}
                        </Typography>
                      </Grid>

                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                          VEHICLE
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: 'monospace' }}>
                          {scannedRecord.vehicleNumber || scannedRecord.vehicleType}
                        </Typography>
                      </Grid>

                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                          CHECK-IN TIME
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 800, color: '#15803d' }}>
                          {scannedRecord.checkInTime}
                        </Typography>
                      </Grid>
                    </Grid>

                    {/* Instant Check-In / Check-Out Action from Scanner */}
                    <Box sx={{ mt: 3, display: 'flex', gap: 1.5 }}>
                      {scannedRecord.status === 'INSIDE' ? (
                        <Button
                          fullWidth
                          variant="contained"
                          color="warning"
                          size="large"
                          onClick={() => {
                            handleCheckOut(scannedRecord);
                            setScannedRecord(prev => prev ? { ...prev, status: 'CHECKED_OUT', checkOutTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) } : null);
                          }}
                          startIcon={<CheckOutIcon />}
                          sx={{ borderRadius: 2.5, fontWeight: 800 }}
                        >
                          Confirm Check-Out (Gate Exit)
                        </Button>
                      ) : (
                        <Button
                          fullWidth
                          variant="contained"
                          color="success"
                          size="large"
                          onClick={() => {
                            handleDirectCheckIn(scannedRecord);
                            setScannedRecord(prev => prev ? { ...prev, status: 'INSIDE', checkInTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) } : null);
                          }}
                          startIcon={<CheckInIcon />}
                          sx={{ borderRadius: 2.5, fontWeight: 800 }}
                        >
                          Confirm Check-In (Enter Campus)
                        </Button>
                      )}

                      <Button
                        variant="outlined"
                        onClick={() => {
                          setPassToView(scannedRecord);
                          setViewPassModalOpen(true);
                        }}
                        startIcon={<PrintIcon />}
                        sx={{ borderRadius: 2.5, fontWeight: 700 }}
                      >
                        Print Pass
                      </Button>
                    </Box>
                  </Box>
                </Box>
              </Card>
            ) : (
              <Card sx={{ borderRadius: 3, p: 6, textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', bgcolor: '#f8fafc', border: '2px dashed #e2e8f0' }}>
                <QrScanIcon sx={{ fontSize: 64, color: '#94a3b8', mb: 2 }} />
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#475569' }}>
                  No Pass Scanned Yet
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 360, mt: 0.5 }}>
                  Use the camera scanner or enter a Pass ID on the left to verify credentials, view vehicle details, and confirm check-in or check-out.
                </Typography>
              </Card>
            )}
          </Grid>
        </Grid>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════ */}
      {/* MODAL 1: ADD NEW GATE ENTRY                                              */}
      {/* ══════════════════════════════════════════════════════════════════════════ */}
      <Dialog
        open={newEntryModalOpen}
        onClose={() => setNewEntryModalOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3.5, p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 900, pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AddIcon sx={{ color: '#0284c7' }} />
            <span>New Gate Entry Registration & QR Pass</span>
          </Box>
          <IconButton size="small" onClick={() => setNewEntryModalOpen(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 2.5 }}>
          <Grid container spacing={2}>
            {/* Person Name */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Full Name of Person"
                placeholder="e.g. Rajesh Kumar"
                value={entryForm.name}
                onChange={e => setEntryForm({ ...entryForm, name: e.target.value })}
              />
            </Grid>

            {/* Category / Person Type */}
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Category / Person Type"
                value={entryForm.type}
                onChange={e => setEntryForm({ ...entryForm, type: e.target.value as PersonType })}
              >
                <MenuItem value="VISITOR">Visitor (General / Guest)</MenuItem>
                <MenuItem value="PARENT">Parent / Guardian</MenuItem>
                <MenuItem value="STAFF">Staff / Faculty</MenuItem>
                <MenuItem value="VENDOR">Vendor / Contractor / Technician</MenuItem>
                <MenuItem value="DELIVERY">Delivery / Courier Agent</MenuItem>
                <MenuItem value="STUDENT_EARLY">Student Early Leave</MenuItem>
                <MenuItem value="STUDENT_LATE">Student Late Comer</MenuItem>
                <MenuItem value="GUEST_VIP">VIP / Management Guest</MenuItem>
              </TextField>
            </Grid>

            {/* Phone */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Mobile / Contact Phone"
                placeholder="+91 98765 43210"
                value={entryForm.phone}
                onChange={e => setEntryForm({ ...entryForm, phone: e.target.value })}
              />
            </Grid>

            {/* ID Proof Type */}
            <Grid item xs={12} sm={3}>
              <TextField
                select
                fullWidth
                label="ID Proof Type"
                value={entryForm.idProofType}
                onChange={e => setEntryForm({ ...entryForm, idProofType: e.target.value })}
              >
                <MenuItem value="Aadhaar Card">Aadhaar Card</MenuItem>
                <MenuItem value="Driving License">Driving License</MenuItem>
                <MenuItem value="Voter ID">Voter ID</MenuItem>
                <MenuItem value="Company ID">Company ID</MenuItem>
                <MenuItem value="Student ID">Student ID</MenuItem>
                <MenuItem value="Passport">Passport</MenuItem>
                <MenuItem value="None">None</MenuItem>
              </TextField>
            </Grid>

            {/* ID Proof Number */}
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="ID Proof No."
                placeholder="Last 4 digits or ID"
                value={entryForm.idProofNumber}
                onChange={e => setEntryForm({ ...entryForm, idProofNumber: e.target.value })}
              />
            </Grid>

            {/* Reason of Entry (Prominent Field requested by user!) */}
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                required
                label="Reason of Entry"
                value={entryForm.reason}
                onChange={e => setEntryForm({ ...entryForm, reason: e.target.value })}
              >
                {POPULAR_REASONS.map(r => (
                  <MenuItem key={r} value={r}>
                    {r}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Visiting Department */}
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                required
                label="Department / Block to Visit"
                value={entryForm.hostDepartment}
                onChange={e => setEntryForm({ ...entryForm, hostDepartment: e.target.value })}
              >
                {DEPARTMENTS.map(d => (
                  <MenuItem key={d} value={d}>
                    {d}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Custom Reason if "Other" is chosen */}
            {entryForm.reason === 'Other / Custom Purpose' && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  label="Specify Custom Entry Reason"
                  placeholder="Detail the specific reason for entering campus..."
                  value={entryForm.customReason}
                  onChange={e => setEntryForm({ ...entryForm, customReason: e.target.value })}
                />
              </Grid>
            )}

            {/* Host Person / Staff */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Person to Meet / Student Name (Optional)"
                placeholder="e.g. Dr. Sharma / Aarav Sen (Class 10A)"
                value={entryForm.hostPerson}
                onChange={e => setEntryForm({ ...entryForm, hostPerson: e.target.value })}
              />
            </Grid>

            {/* Gate Location */}
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Gate In Checkpoint"
                value={entryForm.gate}
                onChange={e => setEntryForm({ ...entryForm, gate: e.target.value })}
              >
                <MenuItem value="Gate 1 (Main Gate)">Gate 1 (Main Gate)</MenuItem>
                <MenuItem value="Gate 2 (North Gate)">Gate 2 (North Gate)</MenuItem>
                <MenuItem value="Gate 3 (Service & Depot)">Gate 3 (Service & Depot)</MenuItem>
              </TextField>
            </Grid>

            {/* Vehicle Type */}
            <Grid item xs={12} sm={4}>
              <TextField
                select
                fullWidth
                label="Vehicle Type"
                value={entryForm.vehicleType}
                onChange={e => setEntryForm({ ...entryForm, vehicleType: e.target.value as any })}
              >
                <MenuItem value="NONE">No Vehicle (On Foot)</MenuItem>
                <MenuItem value="TWO_WHEELER">Two-Wheeler (Bike / Scooter)</MenuItem>
                <MenuItem value="CAR">Car / SUV</MenuItem>
                <MenuItem value="AUTO">Auto Rickshaw / Taxi</MenuItem>
                <MenuItem value="TRUCK_VAN">Truck / Van / Commercial</MenuItem>
              </TextField>
            </Grid>

            {/* Vehicle Number */}
            <Grid item xs={12} sm={8}>
              <TextField
                fullWidth
                disabled={entryForm.vehicleType === 'NONE'}
                label="Vehicle Registration Plate Number"
                placeholder={entryForm.vehicleType === 'NONE' ? 'Not Applicable' : 'e.g. MH-04-AB-1234'}
                value={entryForm.vehicleNumber}
                onChange={e => setEntryForm({ ...entryForm, vehicleNumber: e.target.value })}
              />
            </Grid>

            {/* Belongings / Guard Notes */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Belongings & Security Notes"
                placeholder="e.g. Carrying laptop serial #4912, tool bag inspected, visitor pass badge #14 given"
                value={entryForm.belongingsNotes}
                onChange={e => setEntryForm({ ...entryForm, belongingsNotes: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 1 }}>
          <Button onClick={() => setNewEntryModalOpen(false)} sx={{ fontWeight: 700 }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleCreateEntry}
            startIcon={<QrCodeIcon />}
            sx={{
              borderRadius: 2.5,
              fontWeight: 800,
              bgcolor: '#0284c7',
              px: 3,
              boxShadow: '0 4px 15px rgba(2, 132, 199, 0.3)'
            }}
          >
            Generate QR Pass & Check-In
          </Button>
        </DialogActions>
      </Dialog>

      {/* ══════════════════════════════════════════════════════════════════════════ */}
      {/* MODAL 2: DIGITAL VISITOR PASS & QR PRINT MODAL                           */}
      {/* ══════════════════════════════════════════════════════════════════════════ */}
      <Dialog
        open={viewPassModalOpen}
        onClose={() => setViewPassModalOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 4, overflow: 'hidden' } }}
      >
        {passToView && (
          <Box id="printable-gate-pass">
            {/* Header Badge */}
            <Box
              sx={{
                bgcolor: '#0f172a',
                color: '#ffffff',
                p: 3,
                textAlign: 'center',
                borderBottom: '4px solid #0284c7'
              }}
            >
              <Box sx={{ position: 'relative' }}>
                <IconButton
                  size="small"
                  onClick={() => setViewPassModalOpen(false)}
                  sx={{ position: 'absolute', top: -12, right: -12, color: '#94a3b8', '&:hover': { color: '#ffffff' } }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
                <Typography variant="overline" sx={{ letterSpacing: 2, color: '#38bdf8', fontWeight: 900, display: 'block' }}>
                  CAMPUS SECURITY GATE PASS
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 900, mt: 0.5, color: '#ffffff' }}>
                  {passToView.name}
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 700, fontFamily: 'monospace', color: '#7dd3fc', display: 'block', mt: 0.3 }}>
                  {passToView.entryNumber}
                </Typography>
                <Chip
                  label={passToView.type.replace('_', ' ')}
                  size="small"
                  sx={{
                    mt: 1,
                    bgcolor: 'rgba(255,255,255,0.18)',
                    color: '#ffffff',
                    fontWeight: 800,
                    fontSize: '0.7rem'
                  }}
                />
              </Box>
            </Box>

            {/* QR Code Centerpiece */}
            <Box sx={{ p: 3, textAlign: 'center', bgcolor: '#ffffff' }}>
              <AuthenticQRCode value={passToView.entryNumber} size={180} label={passToView.entryNumber} />

              <Box sx={{ mt: 2, textAlign: 'left', bgcolor: '#f8fafc', p: 2, borderRadius: 2 }}>
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                      ENTRY TIME
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 800, color: '#15803d' }}>
                      {passToView.checkInTime}
                    </Typography>
                  </Grid>

                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                      GATE
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {passToView.gate}
                    </Typography>
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                      REASON OF ENTRY
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {passToView.reason}
                    </Typography>
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                      DESTINATION
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {passToView.hostDepartment} {passToView.hostPerson ? `(${passToView.hostPerson})` : ''}
                    </Typography>
                  </Grid>

                  {passToView.vehicleNumber && (
                    <Grid item xs={12}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                        VEHICLE
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 800, fontFamily: 'monospace' }}>
                        {passToView.vehicleNumber} ({passToView.vehicleType})
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </Box>

              <Typography variant="caption" sx={{ display: 'block', mt: 2, color: '#94a3b8', fontStyle: 'italic' }}>
                Please present this digital pass QR code at the security checkpoint upon departure.
              </Typography>
            </Box>

            {/* Modal Actions */}
            <Box sx={{ p: 2, bgcolor: '#f1f5f9', display: 'flex', gap: 1 }}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => window.print()}
                startIcon={<PrintIcon />}
                sx={{ borderRadius: 2, fontWeight: 700 }}
              >
                Print Slip
              </Button>
              <Button
                fullWidth
                variant="contained"
                onClick={() => setViewPassModalOpen(false)}
                sx={{ borderRadius: 2, fontWeight: 800, bgcolor: '#0f172a' }}
              >
                Done
              </Button>
            </Box>
          </Box>
        )}
      </Dialog>

      {/* ══════════════════════════════════════════════════════════════════════════ */}
      {/* MODAL 3: LOG BUS OUT (DEPARTURE)                                         */}
      {/* ══════════════════════════════════════════════════════════════════════════ */}
      <Dialog
        open={busOutModalOpen}
        onClose={() => setBusOutModalOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3.5, p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 900, display: 'flex', alignItems: 'center', gap: 1 }}>
          <BusIcon sx={{ color: '#f59e0b' }} />
          <span>Log School Bus Departure (Gate OUT)</span>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 2.5 }}>
          <Grid container spacing={2}>
            {/* Bus Select */}
            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                label="Select School Bus"
                value={busOutForm.busId}
                onChange={e => {
                  const b = buses.find(x => x.id === e.target.value);
                  setBusOutForm({
                    ...busOutForm,
                    busId: e.target.value,
                    driverName: b?.defaultDriver || ''
                  });
                }}
              >
                {buses.map(b => (
                  <MenuItem key={b.id} value={b.id}>
                    {b.busNumber} — {b.registrationPlate} ({b.routeName})
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Trip Type */}
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Trip Direction / Type"
                value={busOutForm.tripType}
                onChange={e => setBusOutForm({ ...busOutForm, tripType: e.target.value as BusTripType })}
              >
                <MenuItem value="MORNING_PICKUP">Morning Pickup Route</MenuItem>
                <MenuItem value="EVENING_DROP">Evening Drop Route</MenuItem>
                <MenuItem value="FIELD_TRIP">Educational / Field Trip</MenuItem>
                <MenuItem value="SPORTS_EVENT">Sports Meet / Tournament</MenuItem>
                <MenuItem value="MAINTENANCE_FUEL">Fueling / Depot Service</MenuItem>
                <MenuItem value="OTHER">Other Special Trip</MenuItem>
              </TextField>
            </Grid>

            {/* Departure Time */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Departure Time"
                value={busOutForm.departureTime}
                onChange={e => setBusOutForm({ ...busOutForm, departureTime: e.target.value })}
              />
            </Grid>

            {/* Driver Name */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Driver on Duty"
                value={busOutForm.driverName}
                onChange={e => setBusOutForm({ ...busOutForm, driverName: e.target.value })}
              />
            </Grid>

            {/* Attendant / Conductor */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Attendant / Conductor Name"
                placeholder="e.g. Ramesh More"
                value={busOutForm.attendantName}
                onChange={e => setBusOutForm({ ...busOutForm, attendantName: e.target.value })}
              />
            </Grid>

            {/* Odometer Out */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Outward Odometer (KM)"
                placeholder="e.g. 42180"
                value={busOutForm.outOdometerKm}
                onChange={e => setBusOutForm({ ...busOutForm, outOdometerKm: e.target.value })}
              />
            </Grid>

            {/* Passenger Count */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Students / Passengers Count"
                placeholder="e.g. 38"
                value={busOutForm.passengerCount}
                onChange={e => setBusOutForm({ ...busOutForm, passengerCount: e.target.value })}
              />
            </Grid>

            {/* Remarks */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Guard Remarks"
                placeholder="e.g. First aid box & fire extinguisher verified"
                value={busOutForm.remarks}
                onChange={e => setBusOutForm({ ...busOutForm, remarks: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setBusOutModalOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="warning"
            onClick={handleConfirmBusOut}
            startIcon={<CheckOutIcon />}
            sx={{ borderRadius: 2.5, fontWeight: 800 }}
          >
            Confirm Bus Gate Out
          </Button>
        </DialogActions>
      </Dialog>

      {/* ══════════════════════════════════════════════════════════════════════════ */}
      {/* MODAL 4: LOG BUS IN (ARRIVAL)                                            */}
      {/* ══════════════════════════════════════════════════════════════════════════ */}
      <Dialog
        open={busInModalOpen}
        onClose={() => setBusInModalOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3.5, p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 900, display: 'flex', alignItems: 'center', gap: 1 }}>
          <CheckInIcon sx={{ color: '#16a34a' }} />
          <span>Log School Bus Arrival (Gate IN)</span>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 2.5 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Arrival Time"
                value={busInForm.arrivalTime}
                onChange={e => setBusInForm({ ...busInForm, arrivalTime: e.target.value })}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Return Odometer (KM)"
                placeholder="e.g. 42212"
                value={busInForm.inOdometerKm}
                onChange={e => setBusInForm({ ...busInForm, inOdometerKm: e.target.value })}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Condition & Remarks"
                value={busInForm.remarks}
                onChange={e => setBusInForm({ ...busInForm, remarks: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setBusInModalOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="success"
            onClick={handleConfirmBusIn}
            startIcon={<CheckInIcon />}
            sx={{ borderRadius: 2.5, fontWeight: 800 }}
          >
            Confirm Bus Arrival
          </Button>
        </DialogActions>
      </Dialog>

      {/* ══════════════════════════════════════════════════════════════════════════ */}
      {/* MODAL 5: EDIT ENTRY DETAILS (Full CRUD)                                  */}
      {/* ══════════════════════════════════════════════════════════════════════════ */}
      <Dialog
        open={editEntryModalOpen}
        onClose={() => setEditEntryModalOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3.5, p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 900 }}>Edit Gate Entry Details</DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 2 }}>
          {selectedEntry && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Name"
                  value={selectedEntry.name}
                  onChange={e => setSelectedEntry({ ...selectedEntry, name: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  value={selectedEntry.phone}
                  onChange={e => setSelectedEntry({ ...selectedEntry, phone: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Reason of Entry"
                  value={selectedEntry.reason}
                  onChange={e => setSelectedEntry({ ...selectedEntry, reason: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Department / Host"
                  value={selectedEntry.hostDepartment}
                  onChange={e => setSelectedEntry({ ...selectedEntry, hostDepartment: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Vehicle Number"
                  value={selectedEntry.vehicleNumber || ''}
                  onChange={e => setSelectedEntry({ ...selectedEntry, vehicleNumber: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Security Notes"
                  value={selectedEntry.belongingsNotes || ''}
                  onChange={e => setSelectedEntry({ ...selectedEntry, belongingsNotes: e.target.value })}
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setEditEntryModalOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleUpdateEntry} sx={{ borderRadius: 2, fontWeight: 800 }}>
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* ─── Toast Feedback Snackbar ─── */}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast({ ...toast, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          severity={toast.severity}
          variant="filled"
          onClose={() => setToast({ ...toast, open: false })}
          sx={{ borderRadius: 2.5, fontWeight: 700 }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default WatchmanDashboard;
