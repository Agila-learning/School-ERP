import axios from '../../../core/api/axios';

// ─── INTERFACES ─────────────────────────────────────────────────────────────

export interface LibraryDashboardStats {
  totalBooks: number;
  totalCopies: number;
  availableCopies: number;
  issuedBooks: number;
  overdueBooks: number;
  reservedBooks: number;
  lostBooks: number;
  damagedBooks: number;
  activeMembers: number;
  outstandingFines: number;
}

export interface Author {
  _id: string;
  name: string;
  biography?: string;
  nationality?: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface Publisher {
  _id: string;
  name: string;
  email?: string;
  contact?: string;
  address?: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface Category {
  _id: string;
  name: string;
  code: string;
  description?: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface Book {
  _id: string;
  title: string;
  isbn: string;
  authorIds?: any[];
  publisherId?: any;
  categoryIds?: any[];
  edition?: string;
  language?: string;
  publicationYear?: number;
  totalCopies?: number;
  availableCopies?: number;
  status?: string;
}

export interface BookCopy {
  _id: string;
  bookId: string | Book;
  accessionNumber: string;
  barcode: string;
  sectionId?: string | any;
  purchaseDate?: string;
  purchasePrice?: number;
  condition: 'NEW' | 'GOOD' | 'FAIR' | 'POOR' | 'DAMAGED' | 'LOST';
  status: 'AVAILABLE' | 'ISSUED' | 'RESERVED' | 'LOST' | 'DAMAGED' | 'UNDER_REPAIR' | 'ARCHIVED';
}

export interface LibraryMember {
  _id: string;
  memberType: 'STUDENT' | 'STAFF';
  userId?: string | any;
  status: 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';
  maxBooksAllowed?: number;
  issueDurationDays?: number;
  finePerDay?: number;
  maxRenewalsAllowed?: number;
  gracePeriodDays?: number;
  totalBooksIssued?: number;
  finesDue?: number;
}

export interface IssueTransaction {
  _id: string;
  bookId: string | any;
  copyId: string | any;
  userId: string | any;
  issueDate: string;
  dueDate: string;
  returnDate?: string;
  status: 'ACTIVE' | 'RENEWED' | 'RETURNED' | 'OVERDUE' | 'LOST';
  fineAmount?: number;
  renewals?: any[];
}

export interface LibraryFine {
  _id: string;
  userId: string | any;
  issueId?: string | any;
  copyId?: string | any;
  fineType: 'OVERDUE' | 'LOST_BOOK' | 'DAMAGE' | 'OTHER';
  description?: string;
  amount: number;
  netAmount: number;
  status: 'PENDING' | 'PAID' | 'WAIVED' | 'PARTIALLY_PAID';
}

// ─── API CALLS ─────────────────────────────────────────────────────────────

// DASHBOARD
export const getLibraryDashboardStats = async (): Promise<LibraryDashboardStats> => {
  const res = await axios.get('/library/dashboard');
  return res.data.data;
};

// BOOKS
export const getBooks = async (params: any = {}): Promise<Book[]> => {
  const res = await axios.get('/library/books', { params });
  const d = res.data.data;
  const arr = Array.isArray(d) ? d : (d?.data || []);
  return arr.map((item: any) => ({ ...item, id: item.id || item._id }));
};
export const getBookById = async (bookId: string): Promise<Book> => {
  const res = await axios.get(`/library/books/${bookId}`);
  return res.data.data;
};
export const createBook = async (data: Partial<Book>): Promise<Book> => {
  const res = await axios.post('/library/books', data);
  return res.data.data;
};
export const updateBook = async (bookId: string, data: Partial<Book>): Promise<Book> => {
  const res = await axios.patch(`/library/books/${bookId}`, data);
  return res.data.data;
};

// AUTHORS
export const getAuthors = async (params: any = {}): Promise<Author[]> => {
  const res = await axios.get('/library/authors', { params });
  const d = res.data.data;
  const arr = Array.isArray(d) ? d : (d?.data || []);
  return arr.map((item: any) => ({ ...item, id: item.id || item._id }));
};
export const createAuthor = async (data: Partial<Author>): Promise<Author> => {
  const res = await axios.post('/library/authors', data);
  return res.data.data;
};

// PUBLISHERS
export const getPublishers = async (params: any = {}): Promise<Publisher[]> => {
  const res = await axios.get('/library/publishers', { params });
  const d = res.data.data;
  const arr = Array.isArray(d) ? d : (d?.data || []);
  return arr.map((item: any) => ({ ...item, id: item.id || item._id }));
};
export const createPublisher = async (data: Partial<Publisher>): Promise<Publisher> => {
  const res = await axios.post('/library/publishers', data);
  return res.data.data;
};

// CATEGORIES
export const getCategories = async (params: any = {}): Promise<Category[]> => {
  const res = await axios.get('/library/categories', { params });
  const d = res.data.data;
  const arr = Array.isArray(d) ? d : (d?.data || []);
  return arr.map((item: any) => ({ ...item, id: item.id || item._id }));
};
export const createCategory = async (data: Partial<Category>): Promise<Category> => {
  const res = await axios.post('/library/categories', data);
  return res.data.data;
};

// BOOK COPIES
export const getBookCopies = async (params: any = {}): Promise<BookCopy[]> => {
  const res = await axios.get('/library/copies', { params });
  const d = res.data.data;
  const arr = Array.isArray(d) ? d : (d?.data || []);
  return arr.map((item: any) => ({ ...item, id: item.id || item._id }));
};
export const createBookCopy = async (data: Partial<BookCopy>): Promise<BookCopy> => {
  const res = await axios.post('/library/copies', data);
  return res.data.data;
};
export const markCopyLost = async (copyId: string, notes?: string): Promise<any> => {
  const res = await axios.patch(`/library/copies/${copyId}/mark-lost`, { notes });
  return res.data.data;
};
export const markCopyDamaged = async (copyId: string, notes?: string): Promise<any> => {
  const res = await axios.patch(`/library/copies/${copyId}/mark-damaged`, { notes });
  return res.data.data;
};

// MEMBERS
export const getLibraryMembers = async (params: any = {}): Promise<LibraryMember[]> => {
  const res = await axios.get('/library/members', { params });
  const d = res.data.data;
  const arr = Array.isArray(d) ? d : (d?.data || []);
  return arr.map((item: any) => ({ ...item, id: item.id || item._id }));
};
export const registerMember = async (data: any): Promise<LibraryMember> => {
  const res = await axios.post('/library/members', data);
  return res.data.data;
};

// CIRCULATION
export const getActiveIssues = async (params: any = {}): Promise<IssueTransaction[]> => {
  const res = await axios.get('/library/circulation/issues', { params });
  const d = res.data.data;
  const arr = Array.isArray(d) ? d : (d?.data || []);
  return arr.map((item: any) => ({ ...item, id: item.id || item._id }));
};
export const issueBook = async (data: { userId: string; copyId?: string; copyBarcode?: string }): Promise<IssueTransaction> => {
  // We need to resolve the copyId if only barcode is provided, or pass it directly if backend supports barcode via copyId mapping
  // The backend `issueBook` expects `copyId`. Let's fetch the copies first if only barcode is provided.
  let copyId = data.copyId;
  if (!copyId && data.copyBarcode) {
    const copies = await getBookCopies();
    const copy = copies.find(c => c.barcode === data.copyBarcode || c.accessionNumber === data.copyBarcode);
    if (!copy) throw new Error('Book copy not found for this barcode/accession number');
    copyId = copy._id;
  }
  
  if (!copyId) throw new Error('Valid copyId or copyBarcode is required');
  
  const res = await axios.post('/library/circulation/issue', { userId: data.userId, copyId });
  return res.data.data;
};
export const returnBook = async (data: { copyBarcode: string, condition?: string }): Promise<IssueTransaction> => {
  const issues = await getActiveIssues({ copyBarcode: data.copyBarcode });
  if (!issues || issues.length === 0) {
    throw new Error('No active issue found for this barcode');
  }
  const issueId = issues[0]._id;
  const res = await axios.post(`/library/circulation/return/${issueId}`, { condition: data.condition || 'GOOD' });
  return res.data.data;
};
export const renewBook = async (issueId: string): Promise<IssueTransaction> => {
  const res = await axios.post(`/library/circulation/renew/${issueId}`);
  return res.data.data;
};

export const getReservations = async (params: any = {}): Promise<any[]> => {
  const res = await axios.get('/library/circulation/reservations', { params });
  const d = res.data.data;
  const arr = Array.isArray(d) ? d : (d?.data || []);
  return arr.map((item: any) => ({ ...item, id: item.id || item._id }));
};

export const reserveBook = async (data: { bookId: string; userId?: string; libraryId?: string }): Promise<any> => {
  const res = await axios.post('/library/circulation/reserve', data);
  return res.data.data;
};

export const cancelReservation = async (reservationId: string): Promise<any> => {
  const res = await axios.delete(`/library/circulation/reservations/${reservationId}`);
  return res.data.data;
};

// FINES
export const getFines = async (params: any = {}): Promise<LibraryFine[]> => {
  const res = await axios.get('/library/fines', { params });
  const d = res.data.data;
  const arr = Array.isArray(d) ? d : (d?.data || []);
  return arr.map((item: any) => ({ ...item, id: item.id || item._id }));
};
export const waiveFine = async (fineId: string, data: { waivedAmount: number; reason: string }): Promise<any> => {
  const res = await axios.post(`/library/fines/${fineId}/waive`, data);
  return res.data.data;
};
export const recordFinePayment = async (fineId: string, amount: number): Promise<any> => {
  const res = await axios.patch(`/library/fines/${fineId}/pay`, { amount });
  return res.data.data;
};
