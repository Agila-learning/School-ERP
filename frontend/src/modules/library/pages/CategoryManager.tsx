import React, { useState, useEffect } from 'react';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Person as PersonIcon,
  Business as PublisherIcon,
  Category as CatIcon,
  Check as CheckIcon,
  Public as WorldIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  TextField, FormControl, InputLabel, Select, MenuItem,
} from '@mui/material';

import {
  getAuthors, createAuthor,
  getPublishers, createPublisher,
  getCategories, createCategory,
  type Author, type Publisher, type Category
} from '../api/library.api';

type TabType = 'authors' | 'publishers' | 'categories';

const tabConfig = [
  { id: 'authors' as TabType, label: 'Authors', icon: PersonIcon, color: 'from-violet-500 to-purple-600', bg: 'bg-violet-50', text: 'text-violet-700' },
  { id: 'publishers' as TabType, label: 'Publishers', icon: PublisherIcon, color: 'from-blue-500 to-indigo-600', bg: 'bg-blue-50', text: 'text-blue-700' },
  { id: 'categories' as TabType, label: 'Categories', icon: CatIcon, color: 'from-emerald-500 to-teal-600', bg: 'bg-emerald-50', text: 'text-emerald-700' },
];

const catColorPalette = [
  'from-violet-400 to-purple-500',
  'from-blue-400 to-indigo-500',
  'from-emerald-400 to-teal-500',
  'from-amber-400 to-orange-500',
  'from-rose-400 to-pink-500',
  'from-cyan-400 to-sky-500',
  'from-lime-400 to-green-500',
  'from-fuchsia-400 to-pink-500',
];

const AuthorCard: React.FC<{ author: Author; onEdit: () => void; index: number }> = ({ author, onEdit, index }) => (
  <div className="group bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
    <div className="flex items-start gap-4">
      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${catColorPalette[index % catColorPalette.length]} flex items-center justify-center text-white font-black text-lg flex-shrink-0`}>
        {author.name?.charAt(0).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-gray-900 text-sm leading-tight">{author.name}</h3>
        {(author as any).nationality && (
          <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
            <WorldIcon style={{ fontSize: 12 }} /> {(author as any).nationality}
          </p>
        )}
        {(author as any).biography && (
          <p className="text-xs text-gray-500 mt-2 line-clamp-2 leading-relaxed">{(author as any).biography}</p>
        )}
        <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-50">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${author.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
            {author.status === 'ACTIVE' ? <><CheckIcon style={{ fontSize: 10 }} className="mr-0.5" />Active</> : 'Inactive'}
          </span>
          <button onClick={onEdit} className="text-gray-300 hover:text-indigo-500 transition-colors">
            <EditIcon style={{ fontSize: 16 }} />
          </button>
        </div>
      </div>
    </div>
  </div>
);

const PublisherCard: React.FC<{ publisher: Publisher; onEdit: () => void; index: number }> = ({ publisher, onEdit, index }) => (
  <div className="group bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
    <div className="flex items-start gap-4">
      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${catColorPalette[(index + 3) % catColorPalette.length]} flex items-center justify-center text-white font-black text-lg flex-shrink-0`}>
        {publisher.name?.charAt(0).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-gray-900 text-sm">{publisher.name}</h3>
        {(publisher as any).email && (
          <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
            <EmailIcon style={{ fontSize: 12 }} /> {(publisher as any).email}
          </p>
        )}
        {(publisher as any).contact && (
          <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
            <PhoneIcon style={{ fontSize: 12 }} /> {(publisher as any).contact}
          </p>
        )}
        <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-50">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${publisher.status === 'ACTIVE' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
            {publisher.status === 'ACTIVE' ? 'Active' : 'Inactive'}
          </span>
          <button onClick={onEdit} className="text-gray-300 hover:text-indigo-500 transition-colors">
            <EditIcon style={{ fontSize: 16 }} />
          </button>
        </div>
      </div>
    </div>
  </div>
);

const CategoryCard: React.FC<{ category: Category; onEdit: () => void; index: number }> = ({ category, onEdit, index }) => (
  <div className="group relative bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
    <div className={`h-1.5 bg-gradient-to-r ${catColorPalette[index % catColorPalette.length]}`} />
    <div className="p-5">
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${catColorPalette[index % catColorPalette.length]} flex items-center justify-center mb-3`}>
          <CatIcon className="text-white" style={{ fontSize: 18 }} />
        </div>
        <button onClick={onEdit} className="text-gray-200 hover:text-indigo-500 transition-colors opacity-0 group-hover:opacity-100">
          <EditIcon style={{ fontSize: 16 }} />
        </button>
      </div>
      <h3 className="font-bold text-gray-900 text-sm">{category.name}</h3>
      {(category as any).code && (
        <p className="text-xs font-mono text-gray-400 mt-0.5">Code: {(category as any).code}</p>
      )}
      <div className="mt-3">
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${category.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
          {category.status}
        </span>
      </div>
    </div>
  </div>
);

const CategoryManager: React.FC = () => {
  const [tab, setTab] = useState<TabType>('authors');
  const [authors, setAuthors] = useState<Author[]>([]);
  const [publishers, setPublishers] = useState<Publisher[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [dialog, setDialog] = useState<{ open: boolean; type: string; item: any }>({ open: false, type: '', item: null });
  const [form, setForm] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const fetchAll = async () => {
    try {
      const [a, p, c] = await Promise.all([getAuthors(), getPublishers(), getCategories()]);
      setAuthors(a); setPublishers(p); setCategories(c);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchAll(); }, []);

  const openCreate = (type: string) => { setForm({ status: 'ACTIVE' }); setDialog({ open: true, type, item: null }); };
  const openEdit = (type: string, item: any) => { setForm({ ...item }); setDialog({ open: true, type, item }); };

  const handleSave = async () => {
    setLoading(true);
    try {
      if (dialog.type === 'author') await createAuthor(form);
      else if (dialog.type === 'publisher') await createPublisher(form);
      else if (dialog.type === 'category') await createCategory(form);
      fetchAll();
      setDialog({ open: false, type: '', item: null });
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const filterList = (list: any[]) => list.filter(x => x.name.toLowerCase().includes(search.toLowerCase()));

  const activeTab = tabConfig.find(t => t.id === tab)!;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 p-6 space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-violet-700 via-purple-700 to-indigo-800 rounded-3xl p-8 text-white shadow-2xl">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_bottom_right,_white,_transparent)]" />
        <div className="relative flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-1">🗂️ Catalogue Management</h1>
            <p className="text-purple-200 text-sm">Manage Authors, Publishers, and Book Categories in one place.</p>
          </div>
          <div className="flex gap-3">
            {[
              { v: authors.length, label: 'Authors' },
              { v: publishers.length, label: 'Publishers' },
              { v: categories.length, label: 'Categories' },
            ].map(s => (
              <div key={s.label} className="bg-white/15 backdrop-blur rounded-2xl px-4 py-2.5 text-center">
                <p className="text-xl font-black">{s.v}</p>
                <p className="text-xs text-purple-200 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="bg-white rounded-2xl p-2 shadow-sm border border-gray-100 flex gap-2">
        {tabConfig.map(t => {
          const Icon = t.icon;
          const isActive = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => { setTab(t.id); setSearch(''); }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm transition-all ${
                isActive ? `bg-gradient-to-r ${t.color} text-white shadow-md` : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <Icon style={{ fontSize: 18 }} />
              {t.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${isActive ? 'bg-white/25 text-white' : 'bg-gray-100 text-gray-500'}`}>
                {t.id === 'authors' ? authors.length : t.id === 'publishers' ? publishers.length : categories.length}
              </span>
            </button>
          );
        })}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" style={{ fontSize: 18 }} />
          <input
            type="text"
            placeholder={`Search ${activeTab.label.toLowerCase()}...`}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white transition-all"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300">
              <CloseIcon style={{ fontSize: 16 }} />
            </button>
          )}
        </div>
        <button
          onClick={() => openCreate(tab.replace('s', ''))}
          className={`flex items-center gap-2 bg-gradient-to-r ${activeTab.color} text-white font-semibold px-5 py-2.5 rounded-xl text-sm hover:opacity-90 transition-all shadow-md`}
        >
          <AddIcon style={{ fontSize: 18 }} /> Add {activeTab.label.slice(0, -1)}
        </button>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {tab === 'authors' && filterList(authors).map((a, i) => (
          <AuthorCard key={a._id} author={a} index={i} onEdit={() => openEdit('author', a)} />
        ))}
        {tab === 'publishers' && filterList(publishers).map((p, i) => (
          <PublisherCard key={p._id} publisher={p} index={i} onEdit={() => openEdit('publisher', p)} />
        ))}
        {tab === 'categories' && filterList(categories).map((c, i) => (
          <CategoryCard key={c._id} category={c} index={i} onEdit={() => openEdit('category', c)} />
        ))}
        {filterList(tab === 'authors' ? authors : tab === 'publishers' ? publishers : categories).length === 0 && (
          <div className="col-span-full bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <p className="text-gray-300 text-5xl mb-3">📭</p>
            <p className="text-gray-400 font-medium">No {tab} found.</p>
          </div>
        )}
      </div>

      {/* Dialog */}
      <Dialog open={dialog.open} onClose={() => setDialog({ open: false, type: '', item: null })} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>{dialog.item ? 'Edit' : 'Add'} {dialog.type?.charAt(0).toUpperCase()}{dialog.type?.slice(1)}</DialogTitle>
        <DialogContent dividers>
          <div className="space-y-4 pt-1">
            <TextField label="Name" value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} required fullWidth />
            {dialog.type === 'author' && <>
              <TextField label="Biography" value={form.biography || ''} onChange={e => setForm({ ...form, biography: e.target.value })} multiline rows={3} fullWidth />
              <TextField label="Nationality" value={form.nationality || ''} onChange={e => setForm({ ...form, nationality: e.target.value })} fullWidth />
            </>}
            {dialog.type === 'publisher' && <>
              <TextField label="Contact Person" value={form.contact || ''} onChange={e => setForm({ ...form, contact: e.target.value })} fullWidth />
              <TextField label="Email" value={form.email || ''} onChange={e => setForm({ ...form, email: e.target.value })} fullWidth />
              <TextField label="Address" value={form.address || ''} onChange={e => setForm({ ...form, address: e.target.value })} multiline rows={2} fullWidth />
            </>}
            {dialog.type === 'category' && (
              <TextField label="Code" value={form.code || ''} onChange={e => setForm({ ...form, code: e.target.value })} fullWidth />
            )}
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select label="Status" value={form.status || 'ACTIVE'} onChange={e => setForm({ ...form, status: e.target.value })}>
                <MenuItem value="ACTIVE">Active</MenuItem>
                <MenuItem value="INACTIVE">Inactive</MenuItem>
              </Select>
            </FormControl>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialog({ open: false, type: '', item: null })}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={loading}>Save</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default CategoryManager;
