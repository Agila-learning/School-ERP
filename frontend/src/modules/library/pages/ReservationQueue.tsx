import React, { useState, useEffect } from 'react';
import { 
  getReservations, cancelReservation, reserveBook, 
  getBooks, getLibraryMembers 
} from '../api/library.api';
import type { Book, LibraryMember } from '../api/library.api';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Alert, CircularProgress, Chip,
  FormControl, InputLabel, Select, MenuItem, InputAdornment
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import BookmarkAddIcon from '@mui/icons-material/BookmarkAdd';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import CancelIcon from '@mui/icons-material/Cancel';
import PersonIcon from '@mui/icons-material/Person';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined';

interface QueueGroup {
  bookId: string;
  bookTitle: string;
  isbn: string;
  availableCopies: number;
  reservations: {
    _id: string;
    member: string;
    memberId?: string;
    date: string;
    position: number;
    status: string;
  }[];
}

const ReservationQueue: React.FC = () => {
  const [queues, setQueues] = useState<QueueGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ACTIVE');
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  // Search & Reserve Modal State
  const [openModal, setOpenModal] = useState(false);
  const [bookCatalog, setBookCatalog] = useState<Book[]>([]);
  const [members, setMembers] = useState<LibraryMember[]>([]);
  const [catalogSearch, setCatalogSearch] = useState('');
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [reservingBookId, setReservingBookId] = useState<string | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (statusFilter !== 'ALL') params.status = statusFilter;
      const data = await getReservations(params);
      const list = Array.isArray(data) ? data : (data?.data || []);
      
      // Group by bookId
      const grouped: { [key: string]: QueueGroup } = {};
      list.forEach((r: any) => {
        const bookId = r.bookId?._id || r.bookId;
        if (!bookId) return;
        
        const bIdStr = typeof bookId === 'string' ? bookId : bookId.toString();
        if (!grouped[bIdStr]) {
          grouped[bIdStr] = {
            bookId: bIdStr,
            bookTitle: r.bookId?.title || 'Unknown Book Title',
            isbn: r.bookId?.isbn13 || r.bookId?.isbn || 'N/A',
            availableCopies: r.bookId?.availableCopies ?? 0,
            reservations: []
          };
        }
        
        const memberName = r.userId 
          ? `${r.userId.firstName || ''} ${r.userId.lastName || ''}`.trim() || r.userId.email || 'Library Member'
          : 'Unknown Member';

        grouped[bIdStr].reservations.push({
          _id: r._id,
          member: memberName,
          memberId: r.userId?._id,
          date: r.requestedDate ? new Date(r.requestedDate).toLocaleDateString() : 'N/A',
          position: r.queuePosition || 1,
          status: r.status || 'ACTIVE'
        });
      });

      // Sort reservations within each book by position
      Object.values(grouped).forEach(g => {
        g.reservations.sort((a, b) => a.position - b.position);
      });

      setQueues(Object.values(grouped));
    } catch (e: any) {
      console.error('Failed to load reservations', e);
      setAlert({ type: 'error', msg: 'Failed to load reservation queues' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, [statusFilter]);

  const handleOpenReserveModal = async () => {
    setOpenModal(true);
    setModalLoading(true);
    try {
      const [booksRes, membersRes] = await Promise.all([
        getBooks(),
        getLibraryMembers()
      ]);
      setBookCatalog(Array.isArray(booksRes) ? booksRes : []);
      const memberList = Array.isArray(membersRes) ? membersRes : [];
      setMembers(memberList);

      // Default to current user if available in localStorage
      try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          const matched = memberList.find(m => (m.userId?._id || m.userId) === user.id || (m.userId?._id || m.userId) === user._id);
          if (matched) {
            setSelectedMemberId(matched.userId?._id || matched.userId);
          } else if (memberList.length > 0) {
            setSelectedMemberId(memberList[0].userId?._id || memberList[0].userId || user.id || user._id);
          } else {
            setSelectedMemberId(user.id || user._id);
          }
        } else if (memberList.length > 0) {
          setSelectedMemberId(memberList[0].userId?._id || memberList[0].userId);
        }
      } catch (err) {
        console.error(err);
      }
    } catch (e: any) {
      console.error('Failed to load catalog or members', e);
    } finally {
      setModalLoading(false);
    }
  };

  const handleReserve = async (bookId: string, title: string) => {
    setReservingBookId(bookId);
    try {
      await reserveBook({
        bookId,
        userId: selectedMemberId || undefined
      });
      setAlert({ type: 'success', msg: `Successfully placed reservation for "${title}"!` });
      setOpenModal(false);
      fetchReservations();
    } catch (e: any) {
      setAlert({ type: 'error', msg: e.response?.data?.message || e.message || 'Failed to place reservation' });
    } finally {
      setReservingBookId(null);
    }
  };

  const handleCancel = async (id: string, memberName: string) => {
    if (!window.confirm(`Are you sure you want to cancel the reservation for ${memberName}?`)) return;
    try {
      await cancelReservation(id);
      setAlert({ type: 'success', msg: 'Reservation cancelled successfully.' });
      fetchReservations();
    } catch (e: any) {
      console.error(e);
      setAlert({ type: 'error', msg: e.response?.data?.message || 'Failed to cancel reservation' });
    }
  };

  // Filter queues by book title or member name
  const filteredQueues = queues.filter(q => {
    const matchesSearch = !searchTerm || 
      q.bookTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.isbn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.reservations.some(r => r.member.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  // Filtered books in catalog modal
  const filteredCatalog = bookCatalog.filter(b => {
    if (!catalogSearch) return true;
    const term = catalogSearch.toLowerCase();
    const titleMatch = b.title?.toLowerCase().includes(term);
    const isbnMatch = (b.isbn || (b as any).isbn13)?.toLowerCase().includes(term);
    const authorMatch = b.authorIds?.some((a: any) => (a.name || a)?.toLowerCase().includes(term));
    return titleMatch || isbnMatch || authorMatch;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BookmarkAddIcon className="text-indigo-600" /> Reservation & Waitlist Queue
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage book reservations, queue rankings, and place requests on behalf of students & staff
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="contained"
            color="primary"
            startIcon={<BookmarkAddIcon />}
            onClick={handleOpenReserveModal}
            sx={{ 
              borderRadius: 2, 
              textTransform: 'none', 
              fontWeight: 700, 
              bgcolor: '#4f46e5',
              '&:hover': { bgcolor: '#4338ca' },
              px: 3, 
              py: 1 
            }}
          >
            + Search & Reserve
          </Button>
        </div>
      </div>

      {alert && (
        <Alert severity={alert.type} onClose={() => setAlert(null)} sx={{ borderRadius: 2 }}>
          {alert.msg}
        </Alert>
      )}

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 w-full">
          <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by book title, ISBN, or member name..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition"
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            <option value="ACTIVE">Active Reservations Only</option>
            <option value="ALL">All Statuses (History)</option>
          </select>
        </div>
      </div>

      {/* Queues List */}
      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center gap-3 bg-white rounded-2xl border border-gray-100">
          <CircularProgress size={36} sx={{ color: '#4f46e5' }} />
          <p className="text-sm text-gray-500">Loading reservation queues...</p>
        </div>
      ) : filteredQueues.length > 0 ? (
        <div className="space-y-6">
          {filteredQueues.map((q) => (
            <div key={q.bookId} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex flex-wrap justify-between items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 text-indigo-700 rounded-xl flex items-center justify-center font-bold">
                    <MenuBookIcon fontSize="small" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-base">{q.bookTitle}</h3>
                    <p className="text-xs text-gray-500 font-mono">ISBN: {q.isbn}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Waitlist Depth</p>
                    <p className="text-lg font-bold text-indigo-600">{q.reservations.length} Member(s)</p>
                  </div>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-white text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-3.5 text-left font-semibold">Queue #</th>
                      <th className="px-6 py-3.5 text-left font-semibold">Member</th>
                      <th className="px-6 py-3.5 text-left font-semibold">Requested On</th>
                      <th className="px-6 py-3.5 text-left font-semibold">Status</th>
                      <th className="px-6 py-3.5 text-right font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {q.reservations.map(res => (
                      <tr key={res._id} className="hover:bg-gray-50/70 transition-colors">
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full ${
                            res.position === 1 
                              ? 'bg-amber-100 text-amber-800 font-bold border border-amber-300' 
                              : 'bg-gray-100 text-gray-700 font-medium'
                          } text-xs`}>
                            #{res.position}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-semibold text-gray-900 flex items-center gap-2">
                          <PersonIcon className="text-gray-400" fontSize="small" /> {res.member}
                        </td>
                        <td className="px-6 py-4 text-gray-500">{res.date}</td>
                        <td className="px-6 py-4">
                          <Chip 
                            size="small" 
                            label={res.status} 
                            color={res.status === 'ACTIVE' ? 'primary' : 'default'} 
                            variant="outlined" 
                          />
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => handleCancel(res._id, res.member)} 
                            className="inline-flex items-center gap-1 text-red-600 hover:text-red-800 text-xs font-semibold px-2.5 py-1 rounded-md hover:bg-red-50 transition"
                          >
                            <CancelIcon fontSize="inherit" /> Cancel Request
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center">
          <MenuBookIcon className="text-gray-300 mx-auto mb-3" sx={{ fontSize: 56 }} />
          <h3 className="text-lg font-bold text-gray-800">You have no active reservations.</h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto mt-1 mb-5">
            No active member requests in the queue. Search books in the catalogue to place a new reservation.
          </p>
          <Button
            variant="contained"
            color="primary"
            startIcon={<BookmarkAddIcon />}
            onClick={handleOpenReserveModal}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
          >
            + Search & Reserve
          </Button>
        </div>
      )}

      {/* SEARCH & RESERVE DIALOG */}
      <Dialog 
        open={openModal} 
        onClose={() => setOpenModal(false)} 
        maxWidth="md" 
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, pb: 1, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <BookmarkAddIcon className="text-indigo-600" /> Search & Reserve Library Books
        </DialogTitle>
        <DialogContent dividers sx={{ p: 3 }}>
          {modalLoading ? (
            <div className="py-12 flex justify-center"><CircularProgress size={32} /></div>
          ) : (
            <div className="space-y-4">
              {/* Member Selection */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Select Member (Borrower)
                </label>
                <select
                  value={selectedMemberId}
                  onChange={e => setSelectedMemberId(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  {members.map(m => {
                    const uId = m.userId?._id || m.userId;
                    const uName = m.userId?.firstName 
                      ? `${m.userId.firstName} ${m.userId.lastName || ''} (${m.memberType})` 
                      : (m.userId?.email || `Member ${m._id}`);
                    return (
                      <option key={m._id} value={uId}>
                        {uName}
                      </option>
                    );
                  })}
                  {members.length === 0 && (
                    <option value={selectedMemberId || 'current-user'}>Current User (Default)</option>
                  )}
                </select>
              </div>

              {/* Book Search Bar */}
              <div className="relative">
                <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search book catalog by title, author, or ISBN..."
                  value={catalogSearch}
                  onChange={e => setCatalogSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition"
                  autoFocus
                />
              </div>

              {/* Catalog Results */}
              <div className="max-h-[360px] overflow-y-auto space-y-2.5 pr-1">
                {filteredCatalog.map(b => (
                  <div 
                    key={b._id} 
                    className="p-4 border border-gray-200 rounded-xl flex items-center justify-between hover:border-indigo-300 hover:bg-indigo-50/20 transition"
                  >
                    <div className="flex gap-3.5 items-center">
                      <div className="w-10 h-12 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center font-bold">
                        <MenuBookIcon fontSize="small" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm">{b.title}</h4>
                        <p className="text-xs text-gray-500">
                          {b.authorIds && b.authorIds.length > 0 
                            ? b.authorIds.map((a: any) => a.name || a).join(', ') 
                            : 'Author not specified'}
                          {b.edition ? ` · ${b.edition}` : ''}
                        </p>
                        <p className="text-xs font-mono text-gray-400">ISBN: {(b as any).isbn13 || b.isbn || 'N/A'}</p>
                      </div>
                    </div>
                    <div>
                      <Button
                        variant="contained"
                        size="small"
                        disabled={reservingBookId === b._id}
                        onClick={() => handleReserve(b._id, b.title)}
                        sx={{ 
                          textTransform: 'none', 
                          fontWeight: 700, 
                          bgcolor: '#4f46e5',
                          '&:hover': { bgcolor: '#4338ca' } 
                        }}
                      >
                        {reservingBookId === b._id ? 'Reserving...' : 'Reserve Book'}
                      </Button>
                    </div>
                  </div>
                ))}

                {filteredCatalog.length === 0 && (
                  <div className="text-center py-10 text-gray-400">
                    <p className="text-sm">No books found in catalog. Try a different search query.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenModal(false)} sx={{ fontWeight: 600 }}>Close</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ReservationQueue;
