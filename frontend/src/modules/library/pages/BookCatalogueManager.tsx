import React, { useState, useEffect, useMemo } from 'react';
import {
  AddCircleOutlined as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  InventoryOutlined as CopyIcon,
  LocalLibrary as BookIcon,
  CheckCircle as AvailIcon,
  Warning as WarningIcon,
  FilterList as FilterIcon,
  Close as CloseIcon,
  QrCode2 as QrCodeIcon,
  FileDownload as DownloadIcon,
  ViewModule as GridViewIcon,
  ViewList as TableViewIcon,
  LocationOn as LocationIcon,
  MenuBook as SubjectIcon,
  Business as PublisherIcon,
  Person as AuthorIcon,
  Class as CategoryIcon,
  LocalOffer as PriceIcon
} from '@mui/icons-material';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  TextField, FormControl, InputLabel, Select, MenuItem, Chip, Grid
} from '@mui/material';
import { publishNotification } from '../../../core/services/realtimeNotificationBus';

export interface BookInventoryItem {
  id: string;
  title: string;
  isbn: string;
  subjectCode: string;
  category: string;
  author: string;
  publisher: string;
  edition: string;
  publicationYear: number;
  rackLocation: string;
  totalCopies: number;
  availableCopies: number;
  issuedCopies: number;       // Taken home
  readingRoomCopies: number;  // In-library reading
  unitPrice: number;
  accessionRange: string;
  status: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
}

const initialInventory: BookInventoryItem[] = [
  {
    id: 'BK-101',
    title: 'Computer Networks: Systems Approach & Protocols',
    isbn: '978-0132126953',
    subjectCode: 'CS-101',
    category: 'Computer Science',
    author: 'Andrew S. Tanenbaum',
    publisher: 'Pearson Education',
    edition: '5th Edition',
    publicationYear: 2023,
    rackLocation: 'Rack A-3, Shelf 2',
    totalCopies: 25,
    availableCopies: 14,
    issuedCopies: 8,
    readingRoomCopies: 3,
    unitPrice: 850,
    accessionRange: 'LIB-CS-001 to 025',
    status: 'IN_STOCK'
  },
  {
    id: 'BK-102',
    title: 'Concepts of Physics (Vol 1 & 2)',
    isbn: '978-8177091878',
    subjectCode: 'PHY-302',
    category: 'Physics & Science',
    author: 'Dr. H.C. Verma',
    publisher: 'Bharati Bhawan',
    edition: 'Revised Edition',
    publicationYear: 2024,
    rackLocation: 'Rack B-1, Shelf 4',
    totalCopies: 40,
    availableCopies: 8,
    issuedCopies: 26,
    readingRoomCopies: 6,
    unitPrice: 520,
    accessionRange: 'LIB-PHY-001 to 040',
    status: 'LOW_STOCK'
  },
  {
    id: 'BK-103',
    title: 'Higher Secondary Senior Secondary Mathematics',
    isbn: '978-9352530188',
    subjectCode: 'MAT-201',
    category: 'Mathematics',
    author: 'R.S. Aggarwal',
    publisher: 'S. Chand Publishing',
    edition: '12th Edition',
    publicationYear: 2023,
    rackLocation: 'Rack M-2, Shelf 1',
    totalCopies: 35,
    availableCopies: 22,
    issuedCopies: 10,
    readingRoomCopies: 3,
    unitPrice: 690,
    accessionRange: 'LIB-MAT-001 to 035',
    status: 'IN_STOCK'
  },
  {
    id: 'BK-104',
    title: 'Double Entry Book Keeping & Financial Accounting',
    isbn: '978-9389146124',
    subjectCode: 'COMM-104',
    category: 'Commerce & Accountancy',
    author: 'T.S. Grewal & S.C. Gupta',
    publisher: 'Sultan Chand & Sons',
    edition: '2024 Edition',
    publicationYear: 2024,
    rackLocation: 'Rack C-4, Shelf 3',
    totalCopies: 20,
    availableCopies: 0,
    issuedCopies: 16,
    readingRoomCopies: 4,
    unitPrice: 610,
    accessionRange: 'LIB-COM-001 to 020',
    status: 'OUT_OF_STOCK'
  },
  {
    id: 'BK-105',
    title: 'Campbell Biology: Global Edition',
    isbn: '978-1292170435',
    subjectCode: 'BIO-205',
    category: 'Biological Sciences',
    author: 'Lisa A. Urry, Michael L. Cain',
    publisher: 'Pearson Education',
    edition: '11th Edition',
    publicationYear: 2022,
    rackLocation: 'Rack B-3, Shelf 2',
    totalCopies: 15,
    availableCopies: 9,
    issuedCopies: 4,
    readingRoomCopies: 2,
    unitPrice: 2400,
    accessionRange: 'LIB-BIO-001 to 015',
    status: 'IN_STOCK'
  },
  {
    id: 'BK-106',
    title: 'Oxford Advanced Learner\'s English Literature & Grammar',
    isbn: '978-0194798792',
    subjectCode: 'ENG-101',
    category: 'World Literature',
    author: 'A.S. Hornby & Joanna Turnbull',
    publisher: 'Oxford University Press',
    edition: '10th Edition',
    publicationYear: 2023,
    rackLocation: 'Rack L-1, Shelf 3',
    totalCopies: 30,
    availableCopies: 19,
    issuedCopies: 7,
    readingRoomCopies: 4,
    unitPrice: 780,
    accessionRange: 'LIB-ENG-001 to 030',
    status: 'IN_STOCK'
  },
  {
    id: 'BK-107',
    title: 'Modern Indian History: From Plassey to Partition',
    isbn: '978-8125025962',
    subjectCode: 'HIST-102',
    category: 'History & Civics',
    author: 'Sekhar Bandyopadhyay',
    publisher: 'Orient BlackSwan',
    edition: '2nd Edition',
    publicationYear: 2021,
    rackLocation: 'Rack H-2, Shelf 2',
    totalCopies: 18,
    availableCopies: 11,
    issuedCopies: 5,
    readingRoomCopies: 2,
    unitPrice: 475,
    accessionRange: 'LIB-HIS-001 to 018',
    status: 'IN_STOCK'
  }
];

const STORAGE_INVENTORY_KEY = 'erp_library_stock_inventory_v1';

const BookCatalogueManager: React.FC = () => {
  const [inventory, setInventory] = useState<BookInventoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_INVENTORY_KEY);
      return saved ? JSON.parse(saved) : initialInventory;
    } catch {
      return initialInventory;
    }
  });

  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedPublisher, setSelectedPublisher] = useState<string>('ALL');
  const [selectedSubjectCode, setSelectedSubjectCode] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Add / Edit Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<BookInventoryItem | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [isbn, setIsbn] = useState('');
  const [subjectCode, setSubjectCode] = useState('');
  const [category, setCategory] = useState('Computer Science');
  const [author, setAuthor] = useState('');
  const [publisher, setPublisher] = useState('Pearson Education');
  const [edition, setEdition] = useState('1st Edition');
  const [publicationYear, setPublicationYear] = useState<number>(2024);
  const [rackLocation, setRackLocation] = useState('Rack A-1, Shelf 1');
  const [totalCopies, setTotalCopies] = useState<number>(10);
  const [unitPrice, setUnitPrice] = useState<number>(450);

  // QR Modal State
  const [qrModalBook, setQrModalBook] = useState<BookInventoryItem | null>(null);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_INVENTORY_KEY, JSON.stringify(inventory));
    } catch (err) {
      console.error(err);
    }
  }, [inventory]);

  // Unique dropdown option sets
  const categoriesList = useMemo(() => Array.from(new Set(inventory.map(b => b.category))), [inventory]);
  const publishersList = useMemo(() => Array.from(new Set(inventory.map(b => b.publisher))), [inventory]);
  const subjectCodesList = useMemo(() => Array.from(new Set(inventory.map(b => b.subjectCode))), [inventory]);

  // Filtered inventory
  const filteredBooks = useMemo(() => {
    return inventory.filter(b => {
      const q = searchQuery.toLowerCase();
      const matchSearch = 
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        b.isbn.toLowerCase().includes(q) ||
        b.subjectCode.toLowerCase().includes(q) ||
        b.rackLocation.toLowerCase().includes(q);

      const matchCategory = selectedCategory === 'ALL' || b.category === selectedCategory;
      const matchPublisher = selectedPublisher === 'ALL' || b.publisher === selectedPublisher;
      const matchSubjectCode = selectedSubjectCode === 'ALL' || b.subjectCode === selectedSubjectCode;
      const matchStatus = selectedStatus === 'ALL' || b.status === selectedStatus;

      return matchSearch && matchCategory && matchPublisher && matchSubjectCode && matchStatus;
    });
  }, [inventory, searchQuery, selectedCategory, selectedPublisher, selectedSubjectCode, selectedStatus]);

  // Stock inventory metrics
  const totalPhysicalCopies = useMemo(() => inventory.reduce((acc, b) => acc + b.totalCopies, 0), [inventory]);
  const totalAvailableCopies = useMemo(() => inventory.reduce((acc, b) => acc + b.availableCopies, 0), [inventory]);
  const totalIssuedCopies = useMemo(() => inventory.reduce((acc, b) => acc + b.issuedCopies, 0), [inventory]);
  const totalReadingRoomCopies = useMemo(() => inventory.reduce((acc, b) => acc + b.readingRoomCopies, 0), [inventory]);
  const totalValuation = useMemo(() => inventory.reduce((acc, b) => acc + (b.totalCopies * b.unitPrice), 0), [inventory]);

  const handleOpenAddModal = () => {
    setEditingBook(null);
    setTitle('');
    setIsbn(`978-81${Math.floor(1000000 + Math.random() * 9000000)}`);
    setSubjectCode('CS-201');
    setCategory('Computer Science');
    setAuthor('');
    setPublisher('Pearson Education');
    setEdition('1st Edition');
    setPublicationYear(2024);
    setRackLocation('Rack A-2, Shelf 3');
    setTotalCopies(10);
    setUnitPrice(500);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (b: BookInventoryItem) => {
    setEditingBook(b);
    setTitle(b.title);
    setIsbn(b.isbn);
    setSubjectCode(b.subjectCode);
    setCategory(b.category);
    setAuthor(b.author);
    setPublisher(b.publisher);
    setEdition(b.edition);
    setPublicationYear(b.publicationYear);
    setRackLocation(b.rackLocation);
    setTotalCopies(b.totalCopies);
    setUnitPrice(b.unitPrice);
    setIsModalOpen(true);
  };

  const handleSaveBook = () => {
    if (!title.trim() || !author.trim() || !subjectCode.trim()) return;

    if (editingBook) {
      // Update
      const updatedList = inventory.map(b => {
        if (b.id !== editingBook.id) return b;
        const diffCopies = totalCopies - b.totalCopies;
        const newAvailable = Math.max(0, b.availableCopies + diffCopies);
        const newStatus: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK' = 
          newAvailable === 0 ? 'OUT_OF_STOCK' : newAvailable <= 5 ? 'LOW_STOCK' : 'IN_STOCK';

        return {
          ...b,
          title,
          isbn,
          subjectCode,
          category,
          author,
          publisher,
          edition,
          publicationYear,
          rackLocation,
          totalCopies,
          availableCopies: newAvailable,
          unitPrice,
          status: newStatus
        };
      });

      setInventory(updatedList);
      publishNotification({
        title: 'Library Stock Updated',
        message: `${title} (${subjectCode}) updated. Total stock: ${totalCopies} copies.`,
        category: 'LIBRARY',
        severity: 'info',
        link: '/library/catalog'
      });
    } else {
      // Create new book
      const prefix = subjectCode.replace(/[^A-Za-z]/g, '').toUpperCase();
      const newBook: BookInventoryItem = {
        id: `BK-${Date.now().toString().slice(-4)}`,
        title,
        isbn,
        subjectCode,
        category,
        author,
        publisher,
        edition,
        publicationYear,
        rackLocation,
        totalCopies,
        availableCopies: totalCopies,
        issuedCopies: 0,
        readingRoomCopies: 0,
        unitPrice,
        accessionRange: `LIB-${prefix}-001 to ${String(totalCopies).padStart(3, '0')}`,
        status: totalCopies <= 5 ? 'LOW_STOCK' : 'IN_STOCK'
      };

      setInventory([newBook, ...inventory]);
      publishNotification({
        title: 'New Library Book Accessioned',
        message: `${totalCopies} copies of ${title} (${subjectCode}) added to ${rackLocation}.`,
        category: 'LIBRARY',
        severity: 'success',
        link: '/library/catalog'
      });
    }

    setIsModalOpen(false);
  };

  const handleExportCSV = () => {
    const headers = ['Book ID', 'Title', 'Subject Code', 'Category', 'Author', 'Publisher', 'Edition', 'Rack Location', 'Total Stock', 'Taken Home', 'Reading Room', 'Available Stock', 'Unit Price (INR)', 'Status'];
    const rows = filteredBooks.map(b => [
      b.id,
      `"${b.title.replace(/"/g, '""')}"`,
      b.subjectCode,
      `"${b.category}"`,
      `"${b.author}"`,
      `"${b.publisher}"`,
      `"${b.edition}"`,
      `"${b.rackLocation}"`,
      b.totalCopies,
      b.issuedCopies,
      b.readingRoomCopies,
      b.availableCopies,
      b.unitPrice,
      b.status
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Library_Stock_Inventory_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6 space-y-6">
      
      {/* Premium Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-violet-900 via-indigo-800 to-blue-800 rounded-3xl p-6 md:p-8 text-white shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full translate-x-16 -translate-y-24 blur-3xl" />
        
        <div className="relative flex items-start justify-between flex-wrap gap-4 z-10">
          <div className="flex gap-4 items-center">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-lg">
              <BookIcon style={{ fontSize: 34 }} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Library Stock & Inventory Management</h1>
                <span className="px-3 py-1 rounded-full bg-emerald-500/30 text-emerald-100 text-xs font-black uppercase tracking-wider border border-emerald-400/40">
                  Live Stock Ledger
                </span>
              </div>
              <p className="text-indigo-100 text-sm mt-1 max-w-xl">
                Classify books by Category, Publication, Author, and Subject Code. Monitor physical stock, reading room allocations, and generate accession QR codes.
              </p>
            </div>
          </div>
          
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={handleExportCSV}
              className="px-4 py-2.5 rounded-2xl bg-white/15 hover:bg-white/25 border border-white/30 text-white font-bold text-xs flex items-center gap-2 backdrop-blur-md transition-all cursor-pointer"
            >
              <DownloadIcon style={{ fontSize: 18 }} /> Export Inventory (.CSV)
            </button>
            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/30 transition-all cursor-pointer"
            >
              <AddIcon style={{ fontSize: 18 }} /> Accession New Book
            </button>
          </div>
        </div>
      </div>

      {/* Stock Inventory Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Total Titles', value: inventory.length, color: 'text-violet-600', bg: 'bg-violet-50 border-violet-100', sub: 'In System' },
          { label: 'Physical Copies', value: totalPhysicalCopies, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-100', sub: 'Total Stock' },
          { label: 'Taken Home', value: totalIssuedCopies, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-100', sub: 'Borrowed' },
          { label: 'Reading Room', value: totalReadingRoomCopies, color: 'text-purple-600', bg: 'bg-purple-50 border-purple-100', sub: 'In-Library Only' },
          { label: 'Available on Shelf', value: totalAvailableCopies, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100', sub: 'Ready to Issue' },
          { label: 'Stock Valuation', value: `₹${(totalValuation / 1000).toFixed(1)}k`, color: 'text-slate-800', bg: 'bg-slate-100 border-slate-200', sub: 'Inventory Worth' },
        ].map(card => (
          <div key={card.label} className={`p-4 rounded-2xl border ${card.bg} shadow-sm`}>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{card.label}</p>
            <p className={`text-2xl font-black mt-1 ${card.color}`}>{card.value}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 space-y-4">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          
          {/* Search Field */}
          <div className="relative w-full lg:w-96">
            <SearchIcon className="absolute left-3.5 top-3 text-gray-400" style={{ fontSize: 20 }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Title, Author, ISBN, Subject Code, or Rack..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          {/* View Toggles */}
          <div className="flex items-center gap-2 self-end lg:self-auto">
            <span className="text-xs text-gray-500 font-medium">
              Showing <strong>{filteredBooks.length}</strong> of {inventory.length} Titles
            </span>
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${viewMode === 'table' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500'}`}
                title="Table View"
              >
                <TableViewIcon fontSize="small" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${viewMode === 'grid' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500'}`}
                title="Card Grid View"
              >
                <GridViewIcon fontSize="small" />
              </button>
            </div>
          </div>
        </div>

        {/* Dropdown Multi-Attribute Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-gray-100">
          
          {/* Category Filter */}
          <div>
            <label className="text-[11px] font-bold text-gray-500 uppercase block mb-1 flex items-center gap-1">
              <CategoryIcon style={{ fontSize: 14 }} className="text-indigo-600" /> Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="ALL">All Categories ({categoriesList.length})</option>
              {categoriesList.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Publisher Filter */}
          <div>
            <label className="text-[11px] font-bold text-gray-500 uppercase block mb-1 flex items-center gap-1">
              <PublisherIcon style={{ fontSize: 14 }} className="text-blue-600" /> Publication
            </label>
            <select
              value={selectedPublisher}
              onChange={(e) => setSelectedPublisher(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="ALL">All Publishers ({publishersList.length})</option>
              {publishersList.map(pub => (
                <option key={pub} value={pub}>{pub}</option>
              ))}
            </select>
          </div>

          {/* Subject Code Filter */}
          <div>
            <label className="text-[11px] font-bold text-gray-500 uppercase block mb-1 flex items-center gap-1">
              <SubjectIcon style={{ fontSize: 14 }} className="text-purple-600" /> Subject Code
            </label>
            <select
              value={selectedSubjectCode}
              onChange={(e) => setSelectedSubjectCode(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="ALL">All Subject Codes ({subjectCodesList.length})</option>
              {subjectCodesList.map(code => (
                <option key={code} value={code}>{code}</option>
              ))}
            </select>
          </div>

          {/* Stock Status Filter */}
          <div>
            <label className="text-[11px] font-bold text-gray-500 uppercase block mb-1 flex items-center gap-1">
              <FilterIcon style={{ fontSize: 14 }} className="text-emerald-600" /> Stock Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="ALL">All Stock Statuses</option>
              <option value="IN_STOCK">In Stock (Available on Shelf)</option>
              <option value="LOW_STOCK">Low Stock (≤ 5 copies)</option>
              <option value="OUT_OF_STOCK">All Issued / Out of Stock</option>
            </select>
          </div>

        </div>
      </div>

      {/* Main Stock Inventory Display */}
      {viewMode === 'table' ? (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-gray-200 text-[11px] font-black uppercase tracking-wider text-gray-500">
                  <th className="p-4">Book Title & Accession</th>
                  <th className="p-4">Subject Code & Category</th>
                  <th className="p-4">Author & Publisher</th>
                  <th className="p-4">Rack Location</th>
                  <th className="p-4 text-center">Total Stock</th>
                  <th className="p-4 text-center">Taken Home</th>
                  <th className="p-4 text-center">Reading Room</th>
                  <th className="p-4 text-center">Available Copies</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {filteredBooks.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="p-8 text-center text-gray-400">
                      No books found matching the selected inventory filters.
                    </td>
                  </tr>
                ) : (
                  filteredBooks.map(book => (
                    <tr key={book.id} className="hover:bg-indigo-50/40 transition-colors group">
                      {/* Title & Accession */}
                      <td className="p-4">
                        <div className="font-extrabold text-gray-900 group-hover:text-indigo-700 transition-colors">
                          {book.title}
                        </div>
                        <div className="text-[11px] text-gray-400 font-mono mt-0.5">
                          ISBN: {book.isbn} · {book.accessionRange}
                        </div>
                      </td>

                      {/* Subject Code & Category */}
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded-lg bg-indigo-100 text-indigo-800 font-bold font-mono text-[11px]">
                          {book.subjectCode}
                        </span>
                        <div className="text-[11px] text-gray-500 mt-1">{book.category}</div>
                      </td>

                      {/* Author & Publisher */}
                      <td className="p-4">
                        <div className="font-semibold text-gray-800">{book.author}</div>
                        <div className="text-[11px] text-gray-400">{book.publisher} ({book.edition})</div>
                      </td>

                      {/* Rack Location */}
                      <td className="p-4">
                        <div className="flex items-center gap-1 font-medium text-gray-700">
                          <LocationIcon style={{ fontSize: 14 }} className="text-rose-500" />
                          <span>{book.rackLocation}</span>
                        </div>
                      </td>

                      {/* Total Stock */}
                      <td className="p-4 text-center font-black text-gray-900">
                        {book.totalCopies}
                      </td>

                      {/* Taken Home */}
                      <td className="p-4 text-center">
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[11px]">
                          {book.issuedCopies}
                        </span>
                      </td>

                      {/* Reading Room */}
                      <td className="p-4 text-center">
                        <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 font-bold text-[11px]">
                          {book.readingRoomCopies}
                        </span>
                      </td>

                      {/* Available Copies */}
                      <td className="p-4 text-center">
                        <span className={`px-2.5 py-1 rounded-full font-black text-xs ${
                          book.availableCopies > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {book.availableCopies} Copies
                        </span>
                      </td>

                      {/* Status */}
                      <td className="p-4 text-center">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                          book.status === 'IN_STOCK' ? 'bg-emerald-100 text-emerald-700' :
                          book.status === 'LOW_STOCK' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
                        }`}>
                          {book.status.replace('_', ' ')}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setQrModalBook(book)}
                            className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors cursor-pointer"
                            title="Generate & View QR Code for Mobile Scanning"
                          >
                            <QrCodeIcon style={{ fontSize: 16 }} />
                          </button>
                          <button
                            onClick={() => handleOpenEditModal(book)}
                            className="p-1.5 rounded-lg bg-slate-100 text-gray-700 hover:bg-slate-200 transition-colors cursor-pointer"
                            title="Edit Stock Record"
                          >
                            <EditIcon style={{ fontSize: 16 }} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Grid Card View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredBooks.map(book => (
            <div key={book.id} className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-3">
                  <span className="px-2.5 py-1 rounded-xl bg-indigo-100 text-indigo-800 font-mono font-bold text-xs">
                    {book.subjectCode}
                  </span>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                    book.status === 'IN_STOCK' ? 'bg-emerald-100 text-emerald-700' :
                    book.status === 'LOW_STOCK' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
                  }`}>
                    {book.status.replace('_', ' ')}
                  </span>
                </div>

                <h3 className="font-extrabold text-gray-900 text-base leading-snug mb-1">
                  {book.title}
                </h3>
                <p className="text-xs text-gray-500 font-mono mb-3">ISBN: {book.isbn}</p>

                <div className="space-y-1 text-xs text-gray-600 mb-4 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <p><strong className="text-gray-800">Author:</strong> {book.author}</p>
                  <p><strong className="text-gray-800">Publisher:</strong> {book.publisher} ({book.edition})</p>
                  <p><strong className="text-gray-800">Category:</strong> {book.category}</p>
                  <p className="text-rose-600 font-semibold"><LocationIcon style={{ fontSize: 14 }} /> {book.rackLocation}</p>
                </div>

                {/* Stock Distribution */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs mb-4">
                  <div className="p-2 rounded-xl bg-blue-50 border border-blue-100">
                    <span className="text-[10px] text-gray-400 uppercase font-bold block">Total</span>
                    <span className="font-black text-blue-700">{book.totalCopies}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-amber-50 border border-amber-100">
                    <span className="text-[10px] text-gray-400 uppercase font-bold block">Borrowed</span>
                    <span className="font-black text-amber-700">{book.issuedCopies}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-100">
                    <span className="text-[10px] text-gray-400 uppercase font-bold block">Available</span>
                    <span className="font-black text-emerald-700">{book.availableCopies}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs font-bold text-gray-600">₹{book.unitPrice} / copy</span>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => setQrModalBook(book)}
                    className="px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <QrCodeIcon style={{ fontSize: 15 }} /> QR Code
                  </button>
                  <button
                    onClick={() => handleOpenEditModal(book)}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 text-gray-700 hover:bg-slate-200 text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <EditIcon style={{ fontSize: 15 }} /> Edit
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Book Modal */}
      <Dialog 
        open={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        maxWidth="md"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: '24px', p: 1 } } }}
      >
        <DialogTitle sx={{ fontWeight: 800, fontSize: '1.25rem', borderBottom: '1px solid #f1f5f9' }}>
          {editingBook ? 'Edit Book Stock Record' : 'Accession New Book to Library Catalog'}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
            
            <div className="md:col-span-2">
              <label className="text-xs font-bold text-gray-600 block mb-1">Book Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Modern Operating Systems & Distributed Computing"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-600 block mb-1">Subject Code *</label>
              <input
                type="text"
                value={subjectCode}
                onChange={(e) => setSubjectCode(e.target.value.toUpperCase())}
                placeholder="e.g. CS-101, PHY-302, MAT-201"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-600 block mb-1">ISBN-10 / ISBN-13</label>
              <input
                type="text"
                value={isbn}
                onChange={(e) => setIsbn(e.target.value)}
                placeholder="e.g. 978-0132126953"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-600 block mb-1">Category / Domain *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="Computer Science">Computer Science</option>
                <option value="Physics & Science">Physics & Science</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Commerce & Accountancy">Commerce & Accountancy</option>
                <option value="Biological Sciences">Biological Sciences</option>
                <option value="World Literature">World Literature</option>
                <option value="History & Civics">History & Civics</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-600 block mb-1">Author Name *</label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="e.g. Andrew S. Tanenbaum, Dr. H.C. Verma"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-600 block mb-1">Publisher / Publication *</label>
              <input
                type="text"
                value={publisher}
                onChange={(e) => setPublisher(e.target.value)}
                placeholder="e.g. Pearson, Oxford University Press, S. Chand"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-600 block mb-1">Edition & Year</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={edition}
                  onChange={(e) => setEdition(e.target.value)}
                  placeholder="5th Edition"
                  className="w-1/2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-gray-800"
                />
                <input
                  type="number"
                  value={publicationYear}
                  onChange={(e) => setPublicationYear(Number(e.target.value))}
                  placeholder="2024"
                  className="w-1/2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-gray-800"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-600 block mb-1">Physical Rack & Shelf Location *</label>
              <input
                type="text"
                value={rackLocation}
                onChange={(e) => setRackLocation(e.target.value)}
                placeholder="e.g. Rack A-3, Shelf 2"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-600 block mb-1">Total Physical Copies *</label>
              <input
                type="number"
                value={totalCopies}
                onChange={(e) => setTotalCopies(Math.max(1, Number(e.target.value)))}
                min="1"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-gray-800 font-bold"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-600 block mb-1">Unit Price (₹)</label>
              <input
                type="number"
                value={unitPrice}
                onChange={(e) => setUnitPrice(Math.max(0, Number(e.target.value)))}
                min="0"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-gray-800"
              />
            </div>

          </div>
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: '1px solid #f1f5f9' }}>
          <Button onClick={() => setIsModalOpen(false)} sx={{ textTransform: 'none', fontWeight: 600, color: '#64748b' }}>
            Cancel
          </Button>
          <Button 
            onClick={handleSaveBook} 
            variant="contained" 
            sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '12px', bgcolor: '#4f46e5', '&:hover': { bgcolor: '#4338ca' } }}
          >
            {editingBook ? 'Save Stock Changes' : 'Accession Copies'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* QR Code Inspection Modal */}
      {qrModalBook && (
        <Dialog 
          open={Boolean(qrModalBook)} 
          onClose={() => setQrModalBook(null)}
          maxWidth="xs"
          fullWidth
          slotProps={{ paper: { sx: { borderRadius: '24px', p: 2, textAlign: 'center' } } }}
        >
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full uppercase">
              Book Barcode & QR Slip
            </span>
            <button onClick={() => setQrModalBook(null)} className="text-gray-400 hover:text-gray-600">
              <CloseIcon style={{ fontSize: 18 }} />
            </button>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 my-2 flex flex-col items-center">
            {/* SVG QR Code Simulation */}
            <div className="p-3 bg-white rounded-2xl border-2 border-slate-800 shadow-md">
              <svg width="140" height="140" viewBox="0 0 100 100" className="shape-rendering-crispEdges">
                <rect width="100" height="100" fill="white" />
                {/* 3 Position Corners */}
                <rect x="5" y="5" width="25" height="25" fill="#1e293b" />
                <rect x="9" y="9" width="17" height="17" fill="white" />
                <rect x="13" y="13" width="9" height="9" fill="#1e293b" />

                <rect x="70" y="5" width="25" height="25" fill="#1e293b" />
                <rect x="74" y="9" width="17" height="17" fill="white" />
                <rect x="78" y="13" width="9" height="9" fill="#1e293b" />

                <rect x="5" y="70" width="25" height="25" fill="#1e293b" />
                <rect x="9" y="74" width="17" height="17" fill="white" />
                <rect x="13" y="78" width="9" height="9" fill="#1e293b" />

                {/* Simulated Data Matrix Bits */}
                <rect x="35" y="10" width="8" height="8" fill="#4f46e5" />
                <rect x="50" y="10" width="10" height="6" fill="#1e293b" />
                <rect x="38" y="25" width="12" height="6" fill="#1e293b" />
                <rect x="15" y="40" width="20" height="6" fill="#4f46e5" />
                <rect x="45" y="40" width="15" height="8" fill="#1e293b" />
                <rect x="70" y="40" width="20" height="6" fill="#1e293b" />
                <rect x="40" y="55" width="18" height="8" fill="#4f46e5" />
                <rect x="65" y="55" width="15" height="6" fill="#1e293b" />
                <rect x="35" y="75" width="15" height="10" fill="#1e293b" />
                <rect x="58" y="75" width="12" height="8" fill="#4f46e5" />
                <rect x="78" y="75" width="10" height="10" fill="#1e293b" />
              </svg>
            </div>

            <div className="mt-3 text-center">
              <h4 className="font-extrabold text-sm text-gray-900 leading-snug">{qrModalBook.title}</h4>
              <p className="text-xs font-mono font-bold text-indigo-700 mt-1">
                CODE: {qrModalBook.subjectCode} · {qrModalBook.accessionRange}
              </p>
              <p className="text-[11px] text-gray-500 mt-0.5">Location: {qrModalBook.rackLocation}</p>
            </div>
          </div>

          <div className="p-2.5 bg-blue-50 rounded-xl text-[11px] text-blue-800 font-medium mb-3">
            Scan this QR code with mobile camera at the Circulation Desk for instant Check-In or Check-Out.
          </div>

          <Button 
            onClick={() => setQrModalBook(null)}
            variant="contained" 
            fullWidth 
            sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '12px', bgcolor: '#4f46e5' }}
          >
            Done
          </Button>
        </Dialog>
      )}

    </div>
  );
};

export default BookCatalogueManager;
