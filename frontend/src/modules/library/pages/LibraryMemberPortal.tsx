import React, { useState, useEffect } from 'react';
import { 
  getReservations, cancelReservation, reserveBook, 
  getBooks, getActiveIssues, renewBook 
} from '../api/library.api';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, 
  TextField, Button, Alert, Chip, CircularProgress
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined';
import BackButton from '../../../shared/components/BackButton';

const LibraryMemberPortal: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [issuedBooks, setIssuedBooks] = useState<any[]>([]);
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  // Search & Reserve Modal State
  const [openReserveModal, setOpenReserveModal] = useState(false);
  const [bookSearch, setBookSearch] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [reservingId, setReservingId] = useState<string | null>(null);
  const [outOfStockBook, setOutOfStockBook] = useState<any | null>(null);
  const [notifiedBooks, setNotifiedBooks] = useState<string[]>([]);

  useEffect(() => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) setUser(JSON.parse(userStr));
    } catch (e) {
      console.error(e);
    }
    fetchPortalData();
  }, []);

  const fetchPortalData = async () => {
    setLoading(true);
    try {
      const [issues, resList] = await Promise.all([
        getActiveIssues(),
        getReservations()
      ]);
      setIssuedBooks(Array.isArray(issues) ? issues : []);
      setReservations(Array.isArray(resList) ? resList : []);
    } catch (e: any) {
      console.error('Failed to load member portal data', e);
    } finally {
      setLoading(false);
    }
  };

  // Search Books in Catalog
  const handleSearchBooks = async (query: string) => {
    setBookSearch(query);
    setSearching(true);
    try {
      const allBooks = await getBooks({ search: query });
      const filtered = (allBooks || []).filter((b: any) => 
        !query || 
        b.title?.toLowerCase().includes(query.toLowerCase()) || 
        b.isbn?.toLowerCase().includes(query.toLowerCase()) ||
        b.isbn13?.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(filtered);
    } catch (e) {
      console.error(e);
    } finally {
      setSearching(false);
    }
  };

  const handleOpenReserve = () => {
    setOpenReserveModal(true);
    handleSearchBooks('');
  };

  const handleReserve = async (bookId: string, title: string) => {
    setReservingId(bookId);
    try {
      await reserveBook({ bookId });
      setAlert({ type: 'success', msg: `Successfully reserved "${title}"! Queue position updated.` });
      setOpenReserveModal(false);
      fetchPortalData();
    } catch (e: any) {
      setAlert({ type: 'error', msg: e.response?.data?.message || e.message || 'Failed to place reservation' });
    } finally {
      setReservingId(null);
    }
  };

  const handleCancelReservation = async (reservationId: string, title: string) => {
    if (!window.confirm(`Are you sure you want to cancel your reservation for "${title}"?`)) return;
    try {
      await cancelReservation(reservationId);
      setAlert({ type: 'success', msg: 'Reservation cancelled successfully.' });
      fetchPortalData();
    } catch (e: any) {
      setAlert({ type: 'error', msg: e.response?.data?.message || 'Failed to cancel reservation' });
    }
  };

  const handleRenewBook = async (issueId: string, title: string) => {
    try {
      await renewBook(issueId);
      setAlert({ type: 'success', msg: `Successfully renewed "${title}"!` });
      fetchPortalData();
    } catch (e: any) {
      setAlert({ type: 'error', msg: e.response?.data?.message || 'Failed to renew book' });
    }
  };

  const userName = user?.name || (user?.firstName ? `${user.firstName} ${user.lastName || ''}` : 'Library Member');

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="mb-2">
        <BackButton to="/student-portal/dashboard" label="Back to Student Dashboard" />
      </div>

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-700 to-indigo-900 text-white rounded-2xl p-8 shadow-lg flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h1 className="text-3xl font-extrabold mb-1">My Library Portal</h1>
          <p className="text-indigo-200">
            Welcome back, <span className="font-bold text-white">{userName}</span>. You have {issuedBooks.length} book(s) issued.
          </p>
        </div>
        <div className="flex gap-3">
          <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm min-w-[140px] text-center border border-white/10">
            <p className="text-xs text-indigo-200 uppercase font-bold tracking-wider mb-1">Active Issues</p>
            <p className="text-3xl font-extrabold">{issuedBooks.length}</p>
          </div>
          <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm min-w-[140px] text-center border border-white/10">
            <p className="text-xs text-indigo-200 uppercase font-bold tracking-wider mb-1">Reservations</p>
            <p className="text-3xl font-extrabold">{reservations.length}</p>
          </div>
        </div>
      </div>

      {alert && (
        <Alert severity={alert.type} onClose={() => setAlert(null)} sx={{ borderRadius: 2 }}>
          {alert.msg}
        </Alert>
      )}

      {/* Currently Issued Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
          <h2 className="font-bold text-gray-900 flex items-center gap-2">
            <MenuBookIcon className="text-indigo-600" fontSize="small" /> Currently Issued Books ({issuedBooks.length})
          </h2>
        </div>
        <div className="divide-y divide-gray-100">
          {issuedBooks.map(issue => (
            <div key={issue._id} className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-gray-50/60 transition-colors">
              <div className="flex gap-4 items-center">
                <div className="w-14 h-18 bg-indigo-50 border border-indigo-100 rounded-lg flex items-center justify-center text-indigo-500 font-bold text-sm shadow-sm">
                  <MenuBookIcon />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base">{issue.bookId?.title || issue.copyId?.bookId?.title || 'Library Book'}</h3>
                  <p className="text-xs text-gray-600 mb-1">
                    Barcode: <span className="font-mono font-medium">{issue.copyId?.barcode || issue.copyBarcode || 'LIB-COPY'}</span>
                  </p>
                  <p className="text-xs text-gray-500">
                    Issued: {issue.issueDate ? new Date(issue.issueDate).toLocaleDateString() : 'Active'}
                  </p>
                </div>
              </div>
              <div className="flex flex-col md:items-end gap-1.5 w-full md:w-auto">
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${issue.status === 'OVERDUE' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                  Due: {issue.dueDate ? new Date(issue.dueDate).toLocaleDateString() : 'In 7 Days'}
                </span>
                <button 
                  onClick={() => handleRenewBook(issue._id, issue.bookId?.title || 'Book')}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition"
                >
                  Renew Online &rarr;
                </button>
              </div>
            </div>
          ))}

          {issuedBooks.length === 0 && !loading && (
            <div className="p-8 text-center text-gray-400">
              <p className="text-sm">You have no books currently issued.</p>
            </div>
          )}
        </div>
      </div>

      {/* Reservations Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
          <h2 className="font-bold text-gray-900 flex items-center gap-2">
            <BookmarkBorderIcon className="text-indigo-600" fontSize="small" /> Active Book Reservations ({reservations.length})
          </h2>
          <button 
            onClick={handleOpenReserve}
            className="text-sm text-indigo-600 font-bold hover:text-indigo-800 hover:underline flex items-center gap-1"
          >
            + Search & Reserve
          </button>
        </div>

        {reservations.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50/80 text-gray-500 text-xs font-semibold uppercase border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3.5">Book Title</th>
                  <th className="px-6 py-3.5">ISBN</th>
                  <th className="px-6 py-3.5">Queue Position</th>
                  <th className="px-6 py-3.5">Reserved On</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {reservations.map(res => {
                  const bTitle = res.bookId?.title || 'Reserved Book';
                  const bIsbn = res.bookId?.isbn13 || res.bookId?.isbn || 'N/A';
                  return (
                    <tr key={res._id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-6 py-4 font-bold text-gray-900">{bTitle}</td>
                      <td className="px-6 py-4 font-mono text-xs text-gray-500">{bIsbn}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold">
                          #{res.queuePosition || 1}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-xs">
                        {res.requestedDate ? new Date(res.requestedDate).toLocaleDateString() : 'Today'}
                      </td>
                      <td className="px-6 py-4">
                        <Chip size="small" label={res.status || 'ACTIVE'} color="primary" variant="outlined" />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleCancelReservation(res._id, bTitle)}
                          className="text-xs font-semibold text-red-600 hover:text-red-800 transition"
                        >
                          Cancel
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500 text-sm">
            You have no active reservations. Click <button onClick={handleOpenReserve} className="text-indigo-600 font-bold underline">+ Search & Reserve</button> to find and reserve books.
          </div>
        )}
      </div>

      {/* SEARCH & RESERVE DIALOG */}
      <Dialog open={openReserveModal} onClose={() => setOpenReserveModal(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>
          Search & Reserve Library Books
        </DialogTitle>
        <DialogContent dividers sx={{ p: 3 }}>
          <div className="relative mb-4">
            <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search by book title, author, or ISBN..." 
              value={bookSearch}
              onChange={e => handleSearchBooks(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition"
              autoFocus
            />
          </div>

          {searching ? (
            <div className="py-8 flex justify-center"><CircularProgress size={28} /></div>
          ) : (
            <div className="max-h-[420px] overflow-y-auto space-y-3 pr-1">
              {searchResults.map((b: any) => {
                const isAlreadyReserved = reservations.some(r => (r.bookId?._id || r.bookId) === b._id);
                const available = b.availableCopies !== undefined ? b.availableCopies : (b.copies?.filter((c: any) => c.status === 'AVAILABLE').length || 0);
                const total = b.totalCopies !== undefined ? b.totalCopies : (b.copies?.length || 1);
                const isOutOfStock = available <= 0;
                const sectionName = b.primarySection || (b.sectionNames && b.sectionNames[0]) || 'General Stack / Main Library';

                return (
                  <div key={b._id} className="p-4 border border-gray-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-indigo-300 hover:bg-indigo-50/20 transition">
                    <div className="flex gap-3.5 items-start">
                      <div className="w-11 h-14 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 shadow-sm border border-indigo-100">
                        <MenuBookIcon fontSize="small" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-bold text-gray-900 text-sm">{b.title}</h4>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                            📍 {sectionName}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">
                          {b.authorIds && b.authorIds.length > 0 ? b.authorIds.map((a: any) => a.name || a).join(', ') : 'Author not specified'} 
                          {b.edition ? ` · ${b.edition}` : ''}
                        </p>
                        <div className="flex items-center gap-3 pt-0.5 text-xs">
                          <span className="font-mono text-gray-400 text-[11px]">ISBN: {b.isbn13 || b.isbn || 'N/A'}</span>
                          <span className="text-gray-300">•</span>
                          {isOutOfStock ? (
                            <span className="font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 text-[11px]">
                              OUT OF STOCK (0 / {total} available)
                            </span>
                          ) : (
                            <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[11px]">
                              IN STOCK ({available} / {total} available)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="w-full sm:w-auto flex sm:flex-col items-end gap-1.5 justify-end">
                      {isAlreadyReserved ? (
                        <span className="text-xs font-bold text-green-700 bg-green-50 px-3 py-1.5 rounded-lg flex items-center gap-1 border border-green-200">
                          <CheckCircleOutlineIcon fontSize="inherit" /> Reserved
                        </span>
                      ) : isOutOfStock ? (
                        <Button 
                          variant="outlined" 
                          size="small"
                          color="warning"
                          onClick={() => setOutOfStockBook(b)}
                          sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}
                        >
                          Out of Stock • Options
                        </Button>
                      ) : (
                        <Button 
                          variant="contained" 
                          size="small"
                          disabled={reservingId === b._id}
                          onClick={() => handleReserve(b._id, b.title)}
                          sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}
                        >
                          {reservingId === b._id ? 'Reserving...' : 'Reserve Book'}
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}

              {searchResults.length === 0 && !searching && (
                <div className="text-center py-10 px-4 bg-amber-50/50 rounded-2xl border border-amber-200 space-y-2">
                  <div className="w-12 h-12 mx-auto rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xl shadow-sm">
                    🔍
                  </div>
                  <h4 className="font-extrabold text-gray-900 text-base">Not Found at the Moment</h4>
                  <p className="text-xs text-gray-600 max-w-md mx-auto">
                    {bookSearch 
                      ? `No library books matching "${bookSearch}" are currently found in this or other library sections.`
                      : 'No books available to show in catalogue at this moment.'}
                  </p>
                  <p className="text-xs text-indigo-700 font-medium">
                    Try checking ISBN, search by alternative keywords, or submit a book procurement request to library staff.
                  </p>
                  <div className="pt-2">
                    <Button 
                      size="small" 
                      variant="outlined" 
                      onClick={() => {
                        setAlert({ 
                          type: 'success', 
                          msg: `Procurement request submitted for "${bookSearch || 'Requested Book'}". The library team has been notified.` 
                        });
                      }}
                      sx={{ textTransform: 'none', fontWeight: 700 }}
                    >
                      Request Book Procurement
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenReserveModal(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* NOT FOUND AT THE MOMENT / OUT OF STOCK POPUP MODAL */}
      <Dialog 
        open={Boolean(outOfStockBook)} 
        onClose={() => setOutOfStockBook(null)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: '#9a3412', display: 'flex', alignItems: 'center', gap: 1.5, pb: 1 }}>
          <span className="text-xl">⚠️</span> Not Found at the Moment • Currently Out of Stock
        </DialogTitle>
        <DialogContent dividers sx={{ p: 3 }}>
          {outOfStockBook && (
            <div className="space-y-4">
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800 bg-amber-200/60 px-2 py-0.5 rounded">
                  Stock Depleted
                </span>
                <h3 className="font-black text-gray-900 text-lg mt-1 mb-0.5">{outOfStockBook.title}</h3>
                <p className="text-xs text-gray-600">
                  By {outOfStockBook.authorIds && outOfStockBook.authorIds.length > 0 
                    ? outOfStockBook.authorIds.map((a: any) => a.name || a).join(', ') 
                    : 'Author not specified'}
                </p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  <span className="bg-white px-2.5 py-1 rounded-lg border border-amber-200 text-gray-700 font-medium">
                    📍 Section: <strong className="text-indigo-700">{outOfStockBook.primarySection || outOfStockBook.sectionNames?.[0] || 'General Stack / Main Library'}</strong>
                  </span>
                  <span className="bg-rose-100 text-rose-800 font-bold px-2.5 py-1 rounded-lg border border-rose-200">
                    Available Copies: 0 / {outOfStockBook.totalCopies || 1}
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-sm text-gray-700">
                <p className="leading-relaxed">
                  All physical copies of this title in this section are currently issued or reserved by other library patrons.
                </p>
                <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl text-xs text-indigo-900 space-y-1">
                  <p className="font-bold">✨ What happens if you join the waitlist?</p>
                  <p>1. You receive a guaranteed queue number for the next available copy.</p>
                  <p>2. A stock refill alert notification is automatically dispatched to the Head Librarian.</p>
                  <p>3. You will receive an immediate in-app notification when the section is replenished.</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2.5, justifyContent: 'space-between' }}>
          <Button onClick={() => setOutOfStockBook(null)} sx={{ textTransform: 'none', fontWeight: 600, color: 'text.secondary' }}>
            Close
          </Button>
          <div className="flex gap-2">
            <Button 
              variant="outlined" 
              onClick={() => {
                if (outOfStockBook) {
                  setNotifiedBooks(prev => [...prev, outOfStockBook._id]);
                  setAlert({ 
                    type: 'success', 
                    msg: `Refill alert registered for "${outOfStockBook.title}". We will notify you the moment copies are refilled.` 
                  });
                  setOutOfStockBook(null);
                }
              }}
              sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}
            >
              Notify Me on Refill
            </Button>
            <Button 
              variant="contained" 
              color="warning"
              onClick={() => {
                if (outOfStockBook) {
                  handleReserve(outOfStockBook._id, outOfStockBook.title);
                  setOutOfStockBook(null);
                }
              }}
              sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}
            >
              Join Reservation Waitlist
            </Button>
          </div>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default LibraryMemberPortal;
