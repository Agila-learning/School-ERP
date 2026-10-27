import React, { useState, useEffect, useMemo } from 'react';
import {
  QrCodeScanner as QrScannerIcon,
  MenuBook as BookIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Person as PersonIcon,
  School as StudentIcon,
  Work as StaffIcon,
  Home as HomeIcon,
  TableRestaurant as TableIcon,
  QrCode2 as QrCodeIcon,
  FileDownload as DownloadIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Close as CloseIcon,
  CameraAlt as CameraIcon,
  FlashOn as FlashIcon,
  Print as PrintIcon
} from '@mui/icons-material';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  TextField, Tabs, Tab, Chip, Alert
} from '@mui/material';
import { publishNotification } from '../../../core/services/realtimeNotificationBus';

export type PatronType = 'STUDENT' | 'STAFF';
export type IssueMode = 'TAKEN_HOME' | 'READING_ROOM';

export interface CirculationRecord {
  id: string;
  patronType: PatronType;
  patronName: string;
  patronId: string;       // Roll No or Employee ID
  departmentOrGrade: string;
  bookTitle: string;
  subjectCode: string;
  accessionNumber: string;
  issueMode: IssueMode;
  readingTableNo?: string;
  issueDate: string;
  dueDate: string;
  status: 'ACTIVE' | 'RETURNED' | 'OVERDUE';
  fineAmount: number;
}

export interface PatronOption {
  id: string;
  type: PatronType;
  name: string;
  identifier: string; // Roll or Emp ID
  departmentOrGrade: string;
  booksHeld: number;
  maxBooksAllowed: number;
  outstandingFine: number;
}

const DEMO_PATRONS: PatronOption[] = [
  { id: 'PAT-S1', type: 'STUDENT', name: 'Rohit Sharma', identifier: 'SCH-2024-0024', departmentOrGrade: 'Class 11 - Computer Science', booksHeld: 1, maxBooksAllowed: 3, outstandingFine: 0 },
  { id: 'PAT-S2', type: 'STUDENT', name: 'Ananya Sen', identifier: 'SCH-2024-0042', departmentOrGrade: 'Class 10 - Section B', booksHeld: 0, maxBooksAllowed: 3, outstandingFine: 15 },
  { id: 'PAT-S3', type: 'STUDENT', name: 'Kavya Nair', identifier: 'SCH-2024-0089', departmentOrGrade: 'Class 8 - Section A', booksHeld: 2, maxBooksAllowed: 3, outstandingFine: 0 },
  { id: 'PAT-T1', type: 'STAFF', name: 'Dr. Anita Verma', identifier: 'FAC-PHY-01', departmentOrGrade: 'Physics Department Head', booksHeld: 3, maxBooksAllowed: 6, outstandingFine: 0 },
  { id: 'PAT-T2', type: 'STAFF', name: 'Prof. R. Mukherjee', identifier: 'FAC-MAT-04', departmentOrGrade: 'Senior Secondary Mathematics', booksHeld: 1, maxBooksAllowed: 6, outstandingFine: 0 },
  { id: 'PAT-T3', type: 'STAFF', name: 'Mrs. Kavita Rao', identifier: 'FAC-ENG-08', departmentOrGrade: 'Literature Faculty', booksHeld: 0, maxBooksAllowed: 6, outstandingFine: 0 }
];

const INITIAL_CIRCULATION: CirculationRecord[] = [
  {
    id: 'ISS-2026-081',
    patronType: 'STUDENT',
    patronName: 'Rohit Sharma',
    patronId: 'SCH-2024-0024',
    departmentOrGrade: 'Class 11 - Computer Science',
    bookTitle: 'Computer Networks: Systems Approach',
    subjectCode: 'CS-101',
    accessionNumber: 'LIB-CS-004',
    issueMode: 'TAKEN_HOME',
    issueDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toLocaleDateString(),
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 9).toLocaleDateString(),
    status: 'ACTIVE',
    fineAmount: 0
  },
  {
    id: 'ISS-2026-082',
    patronType: 'STAFF',
    patronName: 'Dr. Anita Verma',
    patronId: 'FAC-PHY-01',
    departmentOrGrade: 'Physics Department Head',
    bookTitle: 'Concepts of Physics (Vol 1)',
    subjectCode: 'PHY-302',
    accessionNumber: 'LIB-PHY-012',
    issueMode: 'READING_ROOM',
    readingTableNo: 'Table 4B (Faculty Desk)',
    issueDate: new Date().toLocaleDateString(),
    dueDate: 'Today by 5:30 PM (Library Closing)',
    status: 'ACTIVE',
    fineAmount: 0
  },
  {
    id: 'ISS-2026-079',
    patronType: 'STUDENT',
    patronName: 'Dev Patel',
    patronId: 'SCH-2024-0015',
    departmentOrGrade: 'Class 12 - Commerce',
    bookTitle: 'Double Entry Book Keeping',
    subjectCode: 'COMM-104',
    accessionNumber: 'LIB-COM-002',
    issueMode: 'TAKEN_HOME',
    issueDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 18).toLocaleDateString(),
    dueDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toLocaleDateString(),
    status: 'OVERDUE',
    fineAmount: 20
  }
];

const STORAGE_CIRCULATION_KEY = 'erp_library_circulation_records_v1';

const CirculationDesk: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'checkout' | 'checkin' | 'register'>('checkout');
  
  const [circulationList, setCirculationList] = useState<CirculationRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_CIRCULATION_KEY);
      return saved ? JSON.parse(saved) : INITIAL_CIRCULATION;
    } catch {
      return INITIAL_CIRCULATION;
    }
  });

  // Check-Out Form State
  const [selectedPatronType, setSelectedPatronType] = useState<PatronType>('STUDENT');
  const [selectedPatron, setSelectedPatron] = useState<PatronOption | null>(DEMO_PATRONS[0]);
  const [patronSearch, setPatronSearch] = useState('');
  
  const [scannedBarcode, setScannedBarcode] = useState('');
  const [bookTitle, setBookTitle] = useState('Computer Networks: Systems Approach');
  const [subjectCode, setSubjectCode] = useState('CS-101');
  
  const [issueMode, setIssueMode] = useState<IssueMode>('TAKEN_HOME');
  const [readingTableNo, setReadingTableNo] = useState('Table 4B (Window Bay)');
  
  // Camera / QR Scanner Viewfinder Simulation State
  const [isCameraActive, setIsCameraActive] = useState(true);
  const [scannerStatus, setScannerStatus] = useState<'IDLE' | 'SCANNING' | 'DETECTED'>('SCANNING');

  // Slip Dialog State
  const [generatedSlip, setGeneratedSlip] = useState<CirculationRecord | null>(null);

  // Check-In (Return) Desk State
  const [returnBarcodeQuery, setReturnBarcodeQuery] = useState('');
  const [foundRecordForReturn, setFoundRecordForReturn] = useState<CirculationRecord | null>(null);
  const [returnCondition, setReturnCondition] = useState<'GOOD' | 'MINOR_WEAR' | 'DAMAGED' | 'LOST'>('GOOD');
  const [returnMessage, setReturnMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Register Filter
  const [registerFilter, setRegisterFilter] = useState<'ALL' | 'TAKEN_HOME' | 'READING_ROOM' | 'OVERDUE'>('ALL');

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_CIRCULATION_KEY, JSON.stringify(circulationList));
    } catch (err) {
      console.error(err);
    }
  }, [circulationList]);

  // When patron type toggle changes, adjust default patron
  useEffect(() => {
    const defaultForType = DEMO_PATRONS.find(p => p.type === selectedPatronType);
    if (defaultForType) {
      setSelectedPatron(defaultForType);
    }
  }, [selectedPatronType]);

  // Filter patrons list
  const filteredPatrons = useMemo(() => {
    return DEMO_PATRONS.filter(p => {
      const matchType = p.type === selectedPatronType;
      const q = patronSearch.toLowerCase();
      const matchSearch = p.name.toLowerCase().includes(q) || p.identifier.toLowerCase().includes(q) || p.departmentOrGrade.toLowerCase().includes(q);
      return matchType && matchSearch;
    });
  }, [selectedPatronType, patronSearch]);

  // Handle Quick Barcode Select
  const handleQuickSelectBarcode = (code: string, titleStr: string, subj: string) => {
    setScannedBarcode(code);
    setBookTitle(titleStr);
    setSubjectCode(subj);
    setScannerStatus('DETECTED');
    setTimeout(() => setScannerStatus('SCANNING'), 1500);
  };

  // Perform Issue / Check-Out
  const handleIssueBook = () => {
    if (!selectedPatron) {
      alert('Please select a Student or Staff patron.');
      return;
    }
    if (!scannedBarcode.trim()) {
      alert('Please scan or enter a book barcode / accession number.');
      return;
    }

    const newRecordId = `ISS-2026-${Math.floor(100 + Math.random() * 900)}`;
    const dueStr = issueMode === 'TAKEN_HOME'
      ? new Date(Date.now() + 1000 * 60 * 60 * 24 * (selectedPatron.type === 'STAFF' ? 30 : 14)).toLocaleDateString()
      : 'Today by 5:30 PM (Library Closing)';

    const newRecord: CirculationRecord = {
      id: newRecordId,
      patronType: selectedPatron.type,
      patronName: selectedPatron.name,
      patronId: selectedPatron.identifier,
      departmentOrGrade: selectedPatron.departmentOrGrade,
      bookTitle,
      subjectCode,
      accessionNumber: scannedBarcode.toUpperCase(),
      issueMode,
      readingTableNo: issueMode === 'READING_ROOM' ? readingTableNo : undefined,
      issueDate: new Date().toLocaleDateString(),
      dueDate: dueStr,
      status: 'ACTIVE',
      fineAmount: 0
    };

    const updated = [newRecord, ...circulationList];
    setCirculationList(updated);
    setGeneratedSlip(newRecord);

    // Real-Time Notification
    publishNotification({
      title: `Library Book Check-Out: ${newRecord.accessionNumber}`,
      message: `${newRecord.bookTitle} (${newRecord.subjectCode}) issued to ${newRecord.patronName} [${newRecord.patronType}] - ${newRecord.issueMode === 'TAKEN_HOME' ? 'Taken Home' : `Reading Room (${newRecord.readingTableNo})`}.`,
      category: 'LIBRARY',
      severity: 'success',
      link: '/library/issue'
    });

    setScannedBarcode('');
  };

  // Search for Check-In (Return) Record
  const handleSearchForReturn = () => {
    setReturnMessage(null);
    const q = returnBarcodeQuery.trim().toLowerCase();
    if (!q) return;

    const found = circulationList.find(c => 
      c.status !== 'RETURNED' && 
      (c.accessionNumber.toLowerCase() === q || c.patronId.toLowerCase() === q || c.id.toLowerCase() === q)
    );

    if (found) {
      setFoundRecordForReturn(found);
    } else {
      setFoundRecordForReturn(null);
      setReturnMessage({ text: `No active issue found for query "${returnBarcodeQuery}".`, type: 'error' });
    }
  };

  // Perform Check-In (Return)
  const handleConfirmReturn = () => {
    if (!foundRecordForReturn) return;

    let fine = foundRecordForReturn.fineAmount;
    if (returnCondition === 'DAMAGED') fine += 150;
    if (returnCondition === 'LOST') fine += 500;

    const updated = circulationList.map(item => {
      if (item.id !== foundRecordForReturn.id) return item;
      return {
        ...item,
        status: 'RETURNED' as const,
        fineAmount: fine
      };
    });

    setCirculationList(updated);
    setReturnMessage({
      text: `Book "${foundRecordForReturn.bookTitle}" successfully returned! Condition: ${returnCondition}. Fine applied: ₹${fine}.`,
      type: 'success'
    });

    // Real-time Notification
    publishNotification({
      title: `Library Book Returned: ${foundRecordForReturn.accessionNumber}`,
      message: `${foundRecordForReturn.bookTitle} returned by ${foundRecordForReturn.patronName} (${foundRecordForReturn.patronType}). Released back to shelf stock.`,
      category: 'LIBRARY',
      severity: 'info',
      link: '/library/issue'
    });

    setFoundRecordForReturn(null);
    setReturnBarcodeQuery('');
  };

  // Filtered Register
  const filteredRegister = useMemo(() => {
    return circulationList.filter(item => {
      if (registerFilter === 'TAKEN_HOME') return item.issueMode === 'TAKEN_HOME' && item.status !== 'RETURNED';
      if (registerFilter === 'READING_ROOM') return item.issueMode === 'READING_ROOM' && item.status !== 'RETURNED';
      if (registerFilter === 'OVERDUE') return item.status === 'OVERDUE';
      return true;
    });
  }, [circulationList, registerFilter]);

  const handleExportRegisterCSV = () => {
    const headers = ['Issue ID', 'Patron Type', 'Patron Name', 'ID / Roll', 'Department/Class', 'Book Title', 'Subject Code', 'Accession No', 'Issue Mode', 'Desk/Table', 'Issue Date', 'Due Date', 'Status', 'Fine (INR)'];
    const rows = filteredRegister.map(r => [
      r.id,
      r.patronType,
      `"${r.patronName}"`,
      r.patronId,
      `"${r.departmentOrGrade}"`,
      `"${r.bookTitle}"`,
      r.subjectCode,
      r.accessionNumber,
      r.issueMode,
      r.readingTableNo || 'N/A',
      r.issueDate,
      `"${r.dueDate}"`,
      r.status,
      r.fineAmount
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Circulation_Lending_Register_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6 space-y-6">
      
      {/* Top Header */}
      <div className="bg-gradient-to-r from-indigo-900 via-blue-900 to-indigo-950 rounded-3xl p-6 md:p-8 text-white shadow-xl flex justify-between items-start flex-wrap gap-4 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-4 z-10">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-lg">
            <QrScannerIcon style={{ fontSize: 36 }} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Library Circulation & QR Desk</h1>
              <span className="px-3 py-1 rounded-full bg-emerald-500/30 text-emerald-200 text-xs font-black uppercase tracking-wider border border-emerald-400/40">
                Live Scanner Active
              </span>
            </div>
            <p className="text-indigo-200 text-sm mt-1 max-w-xl">
              Check-In and Check-Out with mobile QR scanning, distinguish Student vs Staff patrons, and track Taken Home vs Reading Room Only passes.
            </p>
          </div>
        </div>

        {/* Tab Switcher Pills */}
        <div className="flex items-center bg-white/10 p-1.5 rounded-2xl border border-white/20 z-10">
          {[
            { id: 'checkout', label: 'Check-Out (Issue)' },
            { id: 'checkin', label: 'Check-In (Return)' },
            { id: 'register', label: 'Active Register' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-white text-indigo-950 shadow-md scale-105'
                  : 'text-indigo-100 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: CHECK-OUT (ISSUE DESK) */}
      {activeTab === 'checkout' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Patron Selector (Student vs Staff) */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-5">
            <div>
              <h2 className="font-extrabold text-gray-900 text-base mb-1 flex items-center gap-2">
                <PersonIcon className="text-indigo-600" /> 1. Select Patron (Student or Staff)
              </h2>
              <p className="text-xs text-gray-500">Specify whether the book is being issued to a scholar or faculty member.</p>
            </div>

            {/* Student vs Staff Toggle Buttons */}
            <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1.5 rounded-2xl">
              <button
                onClick={() => setSelectedPatronType('STUDENT')}
                className={`py-2.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  selectedPatronType === 'STUDENT'
                    ? 'bg-white text-indigo-700 shadow-md'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <StudentIcon style={{ fontSize: 18 }} /> Student Scholar
              </button>
              <button
                onClick={() => setSelectedPatronType('STAFF')}
                className={`py-2.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  selectedPatronType === 'STAFF'
                    ? 'bg-white text-indigo-700 shadow-md'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <StaffIcon style={{ fontSize: 18 }} /> Staff / Faculty
              </button>
            </div>

            {/* Patron Search Input */}
            <div className="relative">
              <SearchIcon className="absolute left-3 top-2.5 text-gray-400" style={{ fontSize: 18 }} />
              <input
                type="text"
                value={patronSearch}
                onChange={(e) => setPatronSearch(e.target.value)}
                placeholder={`Search ${selectedPatronType.toLowerCase()} by name or ID...`}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            {/* Patron Options List */}
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {filteredPatrons.map(p => {
                const isSelected = selectedPatron?.id === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => setSelectedPatron(p)}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/70 shadow-sm ring-2 ring-indigo-500/20'
                        : 'border-gray-200 bg-white hover:border-indigo-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="font-extrabold text-xs text-gray-900">{p.name}</div>
                      <span className="text-[10px] font-mono font-bold text-indigo-700">{p.identifier}</span>
                    </div>
                    <p className="text-[11px] text-gray-500 mt-0.5">{p.departmentOrGrade}</p>
                    <div className="flex justify-between items-center text-[10px] mt-2 pt-1 border-t border-gray-100 font-bold">
                      <span className="text-gray-500">Books Held: {p.booksHeld}/{p.maxBooksAllowed}</span>
                      {p.outstandingFine > 0 ? (
                        <span className="text-red-600">Dues: ₹{p.outstandingFine}</span>
                      ) : (
                        <span className="text-emerald-600">No Dues</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Selected Patron Summary Card */}
            {selectedPatron && (
              <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-200 text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-black text-indigo-900 text-sm">{selectedPatron.name}</span>
                  <span className="px-2 py-0.5 rounded-full bg-indigo-200 text-indigo-900 font-bold text-[10px]">
                    {selectedPatron.type}
                  </span>
                </div>
                <p className="text-gray-600 font-mono text-[11px]">{selectedPatron.identifier}</p>
                <p className="text-gray-700 mt-1">{selectedPatron.departmentOrGrade}</p>
              </div>
            )}
          </div>

          {/* Middle & Right: Scanner & Checkout Configuration */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Camera / Barcode Viewfinder Card */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-5">
              <div className="flex justify-between items-center flex-wrap gap-2">
                <div>
                  <h2 className="font-extrabold text-gray-900 text-base flex items-center gap-2">
                    <CameraIcon className="text-indigo-600" /> 2. Mobile QR & Barcode Scanner Viewfinder
                  </h2>
                  <p className="text-xs text-gray-500">Scan book QR code with mobile camera or type accession number manually.</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                    scannerStatus === 'DETECTED' ? 'bg-emerald-100 text-emerald-800 animate-pulse' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {scannerStatus === 'DETECTED' ? 'QR Code Detected' : 'Scanner Live'}
                  </span>
                </div>
              </div>

              {/* Viewfinder Screen Simulation */}
              <div className="relative h-48 bg-slate-950 rounded-2xl border-2 border-indigo-500/50 overflow-hidden flex flex-col items-center justify-center text-white select-none">
                {/* Viewfinder Target Reticle */}
                <div className="relative w-48 h-32 border-2 border-dashed border-indigo-400/80 rounded-xl flex items-center justify-center">
                  {/* Corner Targets */}
                  <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-indigo-300" />
                  <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-indigo-300" />
                  <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-indigo-300" />
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-indigo-300" />

                  {/* Animated Laser Scanning Line */}
                  <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_#34d399] animate-[scan_2s_ease-in-out_infinite]" />

                  <style>{`
                    @keyframes scan {
                      0%, 100% { top: 10%; }
                      50% { top: 90%; }
                    }
                  `}</style>

                  <div className="text-center">
                    <QrScannerIcon style={{ fontSize: 28 }} className="text-indigo-300/80" />
                    <p className="text-[10px] text-indigo-200 mt-1 font-mono">Align QR or Barcode</p>
                  </div>
                </div>

                <div className="absolute bottom-2 inset-x-0 text-center">
                  <span className="text-[10px] text-slate-400 font-mono">
                    Optical recognition active · 30 FPS · Auto-focus enabled
                  </span>
                </div>
              </div>

              {/* Quick Mock Code Chips for Testing */}
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Quick-Select Demo Barcodes for Testing:
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { code: 'LIB-CS-004', title: 'Computer Networks: Systems Approach', subj: 'CS-101' },
                    { code: 'LIB-PHY-012', title: 'Concepts of Physics (Vol 1)', subj: 'PHY-302' },
                    { code: 'LIB-MAT-008', title: 'Senior Secondary Mathematics', subj: 'MAT-201' },
                    { code: 'LIB-COM-002', title: 'Double Entry Book Keeping', subj: 'COMM-104' },
                    { code: 'LIB-BIO-005', title: 'Campbell Biology (Global)', subj: 'BIO-205' },
                  ].map(b => (
                    <button
                      key={b.code}
                      onClick={() => handleQuickSelectBarcode(b.code, b.title, b.subj)}
                      className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-gray-700 text-xs font-mono font-bold border border-slate-200 transition-colors cursor-pointer"
                    >
                      {b.code} ({b.subj})
                    </button>
                  ))}
                </div>
              </div>

              {/* Manual Barcode & Book Details Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 border-t border-gray-100">
                <div>
                  <label className="text-xs font-bold text-gray-600 block mb-1">Accession / Barcode *</label>
                  <input
                    type="text"
                    value={scannedBarcode}
                    onChange={(e) => setScannedBarcode(e.target.value.toUpperCase())}
                    placeholder="e.g. LIB-CS-004"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-gray-600 block mb-1">Book Title</label>
                  <input
                    type="text"
                    value={bookTitle}
                    onChange={(e) => setBookTitle(e.target.value)}
                    placeholder="Book Title"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>
            </div>

            {/* Circulation Mode Configuration (Taken Home vs Reading Room) */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-4">
              <div>
                <h2 className="font-extrabold text-gray-900 text-base mb-1 flex items-center gap-2">
                  <BookIcon className="text-indigo-600" /> 3. Circulation Purpose (Taken Home vs Reading Room)
                </h2>
                <p className="text-xs text-gray-500">Record whether the book is borrowed for home study or utilized in-library only.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Taken Home Option */}
                <div
                  onClick={() => setIssueMode('TAKEN_HOME')}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                    issueMode === 'TAKEN_HOME'
                      ? 'border-indigo-600 bg-indigo-50/60 shadow-md ring-2 ring-indigo-500/10'
                      : 'border-gray-200 bg-white hover:border-indigo-200'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                      <HomeIcon />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-gray-900">Taken Home (Standard Loan)</h4>
                      <p className="text-[11px] text-gray-500">Borrow book outside library premises</p>
                    </div>
                  </div>
                  <div className="mt-3 text-xs text-gray-600 space-y-1 bg-white p-2.5 rounded-xl border border-indigo-100">
                    <p>• Due Period: <strong>{selectedPatronType === 'STAFF' ? '30 Days' : '14 Days'}</strong></p>
                    <p>• Overdue Fine: <strong>₹5 / day</strong> after due date</p>
                  </div>
                </div>

                {/* Reading Room Option */}
                <div
                  onClick={() => setIssueMode('READING_ROOM')}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                    issueMode === 'READING_ROOM'
                      ? 'border-purple-600 bg-purple-50/60 shadow-md ring-2 ring-purple-500/10'
                      : 'border-gray-200 bg-white hover:border-purple-200'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                      <TableIcon />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-gray-900">In-Library Reading Only</h4>
                      <p className="text-[11px] text-gray-500">Must not leave library reading hall</p>
                    </div>
                  </div>
                  <div className="mt-2">
                    <label className="text-[11px] font-bold text-gray-600 block mb-1">Assigned Reading Table / Bay:</label>
                    <input
                      type="text"
                      value={readingTableNo}
                      onChange={(e) => setReadingTableNo(e.target.value)}
                      placeholder="e.g. Table 4B, Cubicle C-12"
                      className="w-full p-2 bg-white border border-purple-200 rounded-xl text-xs font-bold text-gray-800"
                    />
                    <p className="text-[10px] text-purple-700 mt-1 font-medium">• Return mandatory before 5:30 PM</p>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-3 border-t border-gray-100 flex justify-end">
                <button
                  onClick={handleIssueBook}
                  className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm shadow-lg shadow-indigo-500/30 transition-all cursor-pointer flex items-center gap-2"
                >
                  <CheckCircleIcon /> Confirm Check-Out & Generate Mobile QR Slip
                </button>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* TAB 2: CHECK-IN (RETURN DESK) */}
      {activeTab === 'checkin' && (
        <div className="max-w-3xl mx-auto bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8 space-y-6">
          <div>
            <h2 className="font-extrabold text-gray-900 text-xl flex items-center gap-2">
              <BookIcon className="text-indigo-600" /> Book Check-In & Return Desk
            </h2>
            <p className="text-xs text-gray-500 mt-1">Scan or type accession barcode, calculate overdue dues, record return condition, and restore available stock.</p>
          </div>

          {/* Return Search Bar */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3.5 top-3 text-gray-400" />
              <input
                type="text"
                value={returnBarcodeQuery}
                onChange={(e) => setReturnBarcodeQuery(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === 'Enter' && handleSearchForReturn()}
                placeholder="Scan QR Barcode (e.g. LIB-CS-004) or Scholar ID (SCH-2024-0024)..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-mono font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <button
              onClick={handleSearchForReturn}
              className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors cursor-pointer"
            >
              Lookup Issue
            </button>
          </div>

          {/* Quick barcode suggestions for return */}
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="text-[11px] font-bold text-gray-400">Quick Test Lookups:</span>
            {circulationList.filter(c => c.status !== 'RETURNED').slice(0, 3).map(c => (
              <button
                key={c.id}
                onClick={() => {
                  setReturnBarcodeQuery(c.accessionNumber);
                  setFoundRecordForReturn(c);
                }}
                className="px-2.5 py-0.5 rounded-lg bg-slate-100 hover:bg-indigo-50 text-indigo-700 font-mono text-[11px] font-bold border border-slate-200"
              >
                {c.accessionNumber} ({c.patronName})
              </button>
            ))}
          </div>

          {/* Return Message Banner */}
          {returnMessage && (
            <Alert severity={returnMessage.type} sx={{ borderRadius: '16px' }}>
              {returnMessage.text}
            </Alert>
          )}

          {/* Found Record Inspection Box */}
          {foundRecordForReturn && (
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <span className="px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-800 font-bold text-xs">
                    {foundRecordForReturn.id} · {foundRecordForReturn.accessionNumber}
                  </span>
                  <h3 className="font-extrabold text-base text-gray-900 mt-2">{foundRecordForReturn.bookTitle}</h3>
                  <p className="text-xs text-gray-500 font-mono">Subject: {foundRecordForReturn.subjectCode}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                  foundRecordForReturn.status === 'OVERDUE' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                }`}>
                  {foundRecordForReturn.status}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-white p-3.5 rounded-xl border border-slate-200 text-xs">
                <div>
                  <span className="text-[10px] text-gray-400 uppercase font-bold block">Patron</span>
                  <span className="font-bold text-gray-900">{foundRecordForReturn.patronName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 uppercase font-bold block">Type</span>
                  <span className="font-bold text-indigo-700">{foundRecordForReturn.patronType}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 uppercase font-bold block">Mode</span>
                  <span className="font-bold text-purple-700">
                    {foundRecordForReturn.issueMode === 'TAKEN_HOME' ? 'Taken Home' : 'Reading Room'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 uppercase font-bold block">Due Date</span>
                  <span className={`font-bold ${foundRecordForReturn.status === 'OVERDUE' ? 'text-red-600' : 'text-gray-900'}`}>
                    {foundRecordForReturn.dueDate}
                  </span>
                </div>
              </div>

              {/* Physical Condition Selector */}
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1.5">
                  Book Condition Upon Return:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'GOOD', label: 'Good / Crisp', fee: '₹0' },
                    { id: 'MINOR_WEAR', label: 'Minor Wear', fee: '₹0' },
                    { id: 'DAMAGED', label: 'Damaged Pages', fee: '+₹150 Fine' },
                    { id: 'LOST', label: 'Reported Lost', fee: '+₹500 Fee' }
                  ].map(cond => (
                    <button
                      key={cond.id}
                      onClick={() => setReturnCondition(cond.id as any)}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        returnCondition === cond.id
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-800 shadow-sm'
                          : 'border-slate-200 bg-white text-gray-600 hover:bg-slate-100'
                      }`}
                    >
                      <div>{cond.label}</div>
                      <div className="text-[10px] text-gray-400">{cond.fee}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <div>
                  <span className="text-xs text-gray-500 font-medium">Fine Calculation:</span>
                  <span className="text-sm font-black text-red-600 ml-2">
                    ₹{foundRecordForReturn.fineAmount + (returnCondition === 'DAMAGED' ? 150 : returnCondition === 'LOST' ? 500 : 0)}
                  </span>
                </div>
                <button
                  onClick={handleConfirmReturn}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer flex items-center gap-2"
                >
                  <CheckCircleIcon style={{ fontSize: 18 }} /> Complete Return & Release Stock
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: ACTIVE REGISTER & READING ROOM DESK */}
      {activeTab === 'register' && (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
            <div>
              <h2 className="font-extrabold text-gray-900 text-lg">Active Circulation & Lending Register</h2>
              <p className="text-xs text-gray-500">Live roster of books currently in circulation and active scholars in the reading hall.</p>
            </div>
            
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold">
                {[
                  { id: 'ALL', label: 'All Records' },
                  { id: 'TAKEN_HOME', label: 'Taken Home' },
                  { id: 'READING_ROOM', label: 'Reading Room' },
                  { id: 'OVERDUE', label: 'Overdue Dues' }
                ].map(f => (
                  <button
                    key={f.id}
                    onClick={() => setRegisterFilter(f.id as any)}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      registerFilter === f.id ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-600'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <button
                onClick={handleExportRegisterCSV}
                className="px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <DownloadIcon style={{ fontSize: 16 }} /> Export (.CSV)
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-gray-200 text-[11px] font-black uppercase tracking-wider text-gray-500">
                  <th className="p-3.5">Issue Ref</th>
                  <th className="p-3.5">Patron</th>
                  <th className="p-3.5">Book & Subject Code</th>
                  <th className="p-3.5">Accession No</th>
                  <th className="p-3.5">Circulation Mode</th>
                  <th className="p-3.5">Issue Date</th>
                  <th className="p-3.5">Due Date</th>
                  <th className="p-3.5 text-center">Status</th>
                  <th className="p-3.5 text-right">Quick Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {filteredRegister.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-gray-400">
                      No active circulation records match this filter.
                    </td>
                  </tr>
                ) : (
                  filteredRegister.map(rec => (
                    <tr key={rec.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-gray-700">{rec.id}</td>
                      <td className="p-3.5">
                        <div className="font-bold text-gray-900">{rec.patronName}</div>
                        <div className="flex items-center gap-1 text-[10px] text-gray-500 mt-0.5">
                          <span className={`px-1.5 py-0.2 rounded font-bold ${rec.patronType === 'STAFF' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                            {rec.patronType}
                          </span>
                          <span>{rec.patronId}</span>
                        </div>
                      </td>
                      <td className="p-3.5">
                        <div className="font-semibold text-gray-800">{rec.bookTitle}</div>
                        <span className="font-mono text-[11px] text-indigo-700 font-bold">{rec.subjectCode}</span>
                      </td>
                      <td className="p-3.5 font-mono text-gray-700 font-bold">{rec.accessionNumber}</td>
                      <td className="p-3.5">
                        {rec.issueMode === 'TAKEN_HOME' ? (
                          <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold text-[11px] flex items-center gap-1 w-fit">
                            <HomeIcon style={{ fontSize: 13 }} /> Taken Home
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 font-bold text-[11px] flex items-center gap-1 w-fit">
                            <TableIcon style={{ fontSize: 13 }} /> {rec.readingTableNo || 'Reading Room'}
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-gray-500">{rec.issueDate}</td>
                      <td className="p-3.5 font-medium text-gray-800">{rec.dueDate}</td>
                      <td className="p-3.5 text-center">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                          rec.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' :
                          rec.status === 'OVERDUE' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {rec.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        {rec.status !== 'RETURNED' ? (
                          <button
                            onClick={() => {
                              setReturnBarcodeQuery(rec.accessionNumber);
                              setFoundRecordForReturn(rec);
                              setActiveTab('checkin');
                            }}
                            className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-[11px] font-bold cursor-pointer transition-colors"
                          >
                            Return Now
                          </button>
                        ) : (
                          <span className="text-gray-400 text-[11px]">Archived</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Generated Mobile QR Circulation Slip Modal */}
      {generatedSlip && (
        <Dialog
          open={Boolean(generatedSlip)}
          onClose={() => setGeneratedSlip(null)}
          maxWidth="xs"
          fullWidth
          slotProps={{ paper: { sx: { borderRadius: '24px', p: 2, textAlign: 'center' } } }}
        >
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Circulation QR Pass Generated
            </span>
            <button onClick={() => setGeneratedSlip(null)} className="text-gray-400 hover:text-gray-600">
              <CloseIcon style={{ fontSize: 18 }} />
            </button>
          </div>

          <div className="p-5 bg-gradient-to-b from-slate-50 to-white rounded-2xl border-2 border-dashed border-indigo-200 my-2 text-center">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">ST. XAVIER'S LIBRARY DESK</p>
            <h3 className="font-black text-gray-900 text-base mt-1">{generatedSlip.bookTitle}</h3>
            <p className="text-xs font-mono font-bold text-indigo-700">{generatedSlip.accessionNumber} · {generatedSlip.subjectCode}</p>

            {/* SVG QR Code */}
            <div className="my-4 inline-block p-2 bg-white rounded-xl border border-gray-200 shadow-sm">
              <svg width="130" height="130" viewBox="0 0 100 100">
                <rect width="100" height="100" fill="white" />
                <rect x="5" y="5" width="25" height="25" fill="#1e293b" />
                <rect x="9" y="9" width="17" height="17" fill="white" />
                <rect x="13" y="13" width="9" height="9" fill="#1e293b" />

                <rect x="70" y="5" width="25" height="25" fill="#1e293b" />
                <rect x="74" y="9" width="17" height="17" fill="white" />
                <rect x="78" y="13" width="9" height="9" fill="#1e293b" />

                <rect x="5" y="70" width="25" height="25" fill="#1e293b" />
                <rect x="9" y="74" width="17" height="17" fill="white" />
                <rect x="13" y="78" width="9" height="9" fill="#1e293b" />

                <rect x="35" y="10" width="10" height="8" fill="#4f46e5" />
                <rect x="50" y="10" width="8" height="6" fill="#1e293b" />
                <rect x="38" y="30" width="12" height="6" fill="#1e293b" />
                <rect x="15" y="45" width="20" height="6" fill="#4f46e5" />
                <rect x="45" y="45" width="15" height="8" fill="#1e293b" />
                <rect x="70" y="45" width="20" height="6" fill="#1e293b" />
                <rect x="40" y="60" width="18" height="8" fill="#4f46e5" />
                <rect x="65" y="60" width="15" height="6" fill="#1e293b" />
                <rect x="35" y="75" width="15" height="10" fill="#1e293b" />
                <rect x="58" y="75" width="12" height="8" fill="#4f46e5" />
                <rect x="78" y="75" width="10" height="10" fill="#1e293b" />
              </svg>
            </div>

            <div className="space-y-1 text-xs text-left bg-slate-100/70 p-3 rounded-xl border border-slate-200">
              <div className="flex justify-between">
                <span className="text-gray-500">Patron:</span>
                <span className="font-bold text-gray-900">{generatedSlip.patronName} ({generatedSlip.patronType})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Circulation Mode:</span>
                <span className="font-bold text-purple-700">
                  {generatedSlip.issueMode === 'TAKEN_HOME' ? 'Taken Home' : `Reading Room (${generatedSlip.readingTableNo})`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Return Due:</span>
                <span className="font-bold text-indigo-700">{generatedSlip.dueDate}</span>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-gray-500 mb-3">
            Patron can scan this receipt in their mobile device for gate exit verification.
          </div>

          <Button
            onClick={() => setGeneratedSlip(null)}
            variant="contained"
            fullWidth
            sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '12px', bgcolor: '#4f46e5' }}
          >
            Done & Print Pass
          </Button>
        </Dialog>
      )}

    </div>
  );
};

export default CirculationDesk;
