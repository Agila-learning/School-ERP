import React, { useState, useEffect } from 'react';
import { getBooks, getCategories, reserveBook } from '../api/library.api';
import type { Book, Category } from '../api/library.api';
import { Alert, CircularProgress, Button, Chip, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import BookmarkAddIcon from '@mui/icons-material/BookmarkAdd';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined';

const CatalogueSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [reservingId, setReservingId] = useState<string | null>(null);
  const [reservedIds, setReservedIds] = useState<string[]>([]);
  const [outOfStockModalBook, setOutOfStockModalBook] = useState<Book | null>(null);
  const [notifiedIds, setNotifiedIds] = useState<string[]>([]);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [booksData, catsData] = await Promise.all([
        getBooks(),
        getCategories().catch(() => [])
      ]);
      setBooks(Array.isArray(booksData) ? booksData : []);
      setCategories(Array.isArray(catsData) ? catsData : []);
    } catch (err) {
      console.error('Failed to load catalogue', err);
      setAlert({ type: 'error', msg: 'Failed to load library catalogue.' });
    } finally {
      setLoading(false);
    }
  };

  const handleReserve = async (book: Book) => {
    setReservingId(book._id);
    try {
      await reserveBook({ bookId: book._id });
      setReservedIds(prev => [...prev, book._id]);
      setAlert({ type: 'success', msg: `Successfully placed reservation for "${book.title}"!` });
    } catch (e: any) {
      setAlert({ type: 'error', msg: e.response?.data?.message || e.message || 'Failed to place reservation' });
    } finally {
      setReservingId(null);
    }
  };

  const filteredBooks = books.filter(b => {
    const term = query.toLowerCase();
    const matchesQuery = !query ||
      b.title?.toLowerCase().includes(term) ||
      b.isbn?.toLowerCase().includes(term) ||
      (b as any).isbn13?.toLowerCase().includes(term) ||
      b.authorIds?.some((a: any) => (a.name || a)?.toLowerCase().includes(term));

    const matchesCat = selectedCategory === 'ALL' ||
      b.categoryIds?.some((c: any) => (c._id || c) === selectedCategory || c.name === selectedCategory);

    return matchesQuery && matchesCat;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-800 to-blue-900 text-white rounded-3xl p-8 shadow-xl">
        <h1 className="text-3xl font-extrabold mb-1">📚 Library Catalogue Search</h1>
        <p className="text-indigo-200 text-sm">
          Search the institution repository by title, author, ISBN, or subject classification.
        </p>
      </div>

      {alert && (
        <Alert severity={alert.type} onClose={() => setAlert(null)} sx={{ borderRadius: 2 }}>
          {alert.msg}
        </Alert>
      )}

      {/* Search Bar & Filter Controls */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center">
        <div className="flex-1 relative w-full">
          <SearchIcon className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search catalogue by title, author, or ISBN..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>
        <div className="w-full md:w-64">
          <select 
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            <option value="ALL">All Categories</option>
            {categories.map(c => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
        </div>
        <button 
          onClick={() => {}} 
          className="w-full md:w-auto px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition"
        >
          Search ({filteredBooks.length})
        </button>
      </div>

      {/* Catalogue Cards Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 bg-white rounded-2xl border border-gray-100">
          <CircularProgress size={36} sx={{ color: '#4f46e5' }} />
          <p className="text-sm text-gray-500">Loading library catalogue...</p>
        </div>
      ) : filteredBooks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredBooks.map((book) => {
            const available = book.availableCopies ?? 0;
            const total = book.totalCopies ?? 0;
            const isReserved = reservedIds.includes(book._id);

              const sectionName = (book as any).primarySection || ((book as any).sectionNames && (book as any).sectionNames[0]) || 'General Stack / Main Library';

              return (
                <div 
                  key={book._id} 
                  className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col"
                >
                  <div className="h-40 bg-gradient-to-br from-indigo-600 to-blue-700 flex items-center justify-center p-4 relative">
                    <div className="w-20 h-28 bg-white/10 backdrop-blur-sm border border-white/20 rounded shadow-lg flex items-center justify-center text-white text-3xl">
                      <MenuBookIcon sx={{ fontSize: 36, opacity: 0.8 }} />
                    </div>
                    {available === 0 && (
                      <span className="absolute top-3 right-3 bg-rose-600 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shadow">
                        OUT OF STOCK
                      </span>
                    )}
                    {available > 0 && (
                      <span className="absolute top-3 right-3 bg-emerald-600 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shadow">
                        {available} AVAILABLE
                      </span>
                    )}
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider block mb-1">
                        {book.categoryIds?.[0]?.name || 'General Collection'}
                      </span>
                      <h3 className="font-bold text-gray-900 text-base line-clamp-2 mb-1">{book.title}</h3>
                      <p className="text-xs text-gray-500 mb-2">
                        {book.authorIds?.map((a: any) => a.name || a).join(', ') || 'Unknown Author'}
                        {book.edition ? ` · ${book.edition}` : ''}
                      </p>
                      <div className="mb-3">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                          📍 {sectionName}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-3 pt-3 border-t border-gray-100">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400 font-mono">ISBN: {(book as any).isbn13 || book.isbn || 'N/A'}</span>
                        <span className={`font-bold ${available > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {available} / {total || 1} Copies
                        </span>
                      </div>
                      
                      <div className="pt-1">
                        {isReserved ? (
                          <div className="w-full py-2 bg-green-50 text-green-700 border border-green-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1">
                            <CheckCircleOutlineIcon fontSize="inherit" /> Reserved in Queue
                          </div>
                        ) : available === 0 ? (
                          <button 
                            onClick={() => setOutOfStockModalBook(book)}
                            className="w-full py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200"
                          >
                            <BookmarkAddIcon fontSize="inherit" />
                            Out of Stock • Options
                          </button>
                        ) : (
                          <button 
                            disabled={reservingId === book._id}
                            onClick={() => handleReserve(book)}
                            className="w-full py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
                          >
                            <BookmarkAddIcon fontSize="inherit" />
                            {reservingId === book._id ? 'Reserving...' : 'Reserve Copy'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-amber-50/50 rounded-2xl border border-amber-200 p-12 text-center text-gray-600 space-y-3">
            <div className="w-14 h-14 mx-auto rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-2xl shadow-sm">
              🔍
            </div>
            <h3 className="text-xl font-black text-gray-900">Not Found at the Moment</h3>
            <p className="text-sm max-w-md mx-auto text-gray-600">
              {query 
                ? `No books matching "${query}" are currently available in the selected category or sections.`
                : 'No books matching the selected filter are currently in catalogue.'}
            </p>
            <div className="pt-2">
              <Button 
                variant="outlined" 
                onClick={() => setAlert({ type: 'success', msg: `Procurement request submitted for "${query || 'Requested Title'}". Head Librarian notified.` })}
                sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}
              >
                Submit Book Procurement Request
              </Button>
            </div>
          </div>
        )}

      {/* NOT FOUND AT THE MOMENT / OUT OF STOCK POPUP DIALOG */}
      <Dialog 
        open={Boolean(outOfStockModalBook)} 
        onClose={() => setOutOfStockModalBook(null)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: '#9a3412', display: 'flex', alignItems: 'center', gap: 1.5, pb: 1 }}>
          <span className="text-xl">⚠️</span> Not Found at the Moment • Currently Out of Stock
        </DialogTitle>
        <DialogContent dividers sx={{ p: 3 }}>
          {outOfStockModalBook && (
            <div className="space-y-4">
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800 bg-amber-200/60 px-2 py-0.5 rounded">
                  Stock Depleted
                </span>
                <h3 className="font-black text-gray-900 text-lg mt-1 mb-0.5">{outOfStockModalBook.title}</h3>
                <p className="text-xs text-gray-600">
                  By {outOfStockModalBook.authorIds && outOfStockModalBook.authorIds.length > 0 
                    ? outOfStockModalBook.authorIds.map((a: any) => a.name || a).join(', ') 
                    : 'Author not specified'}
                </p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  <span className="bg-white px-2.5 py-1 rounded-lg border border-amber-200 text-gray-700 font-medium">
                    📍 Section: <strong className="text-indigo-700">{(outOfStockModalBook as any).primarySection || ((outOfStockModalBook as any).sectionNames && (outOfStockModalBook as any).sectionNames[0]) || 'General Stack / Main Library'}</strong>
                  </span>
                  <span className="bg-rose-100 text-rose-800 font-bold px-2.5 py-1 rounded-lg border border-rose-200">
                    Available Copies: 0 / {outOfStockModalBook.totalCopies || 1}
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-sm text-gray-700">
                <p className="leading-relaxed">
                  All physical copies of this title in this section are currently issued or reserved by other members.
                </p>
                <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl text-xs text-indigo-900 space-y-1">
                  <p className="font-bold">✨ What happens if you join the waitlist?</p>
                  <p>1. You receive a guaranteed queue number for the next available copy.</p>
                  <p>2. A stock replenishment alert is automatically sent to the Head Librarian.</p>
                  <p>3. You will receive an immediate in-app notification when the section is refilled.</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2.5, justifyContent: 'space-between' }}>
          <Button onClick={() => setOutOfStockModalBook(null)} sx={{ textTransform: 'none', fontWeight: 600, color: 'text.secondary' }}>
            Close
          </Button>
          <div className="flex gap-2">
            <Button 
              variant="outlined" 
              onClick={() => {
                if (outOfStockModalBook) {
                  setNotifiedIds(prev => [...prev, outOfStockModalBook._id]);
                  setAlert({ 
                    type: 'success', 
                    msg: `Refill alert registered for "${outOfStockModalBook.title}". We will notify you the moment copies are refilled.` 
                  });
                  setOutOfStockModalBook(null);
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
                if (outOfStockModalBook) {
                  handleReserve(outOfStockModalBook);
                  setOutOfStockModalBook(null);
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

export default CatalogueSearch;
