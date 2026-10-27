import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getLibraryDashboardStats, getActiveIssues, type IssueTransaction } from '../api/library.api';
import {
  LocalLibrary as LibIcon,
  LibraryBooks as CatalogIcon,
  SwapHoriz as CircIcon,
  WarningAmber as OverdueIcon,
  Bookmark as ReserveIcon,
  AttachMoney as FineIcon,
  ArrowForward as ArrowIcon,
  CheckCircle as CheckIcon,
  Schedule as DueIcon,
} from '@mui/icons-material';

const LibraryDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalBooks: '...',
    availableCopies: '...',
    issuedCopies: '...',
    overdueBooks: 0,
    pendingReservations: 0,
    finesCollected: '...'
  });
  const [recentIssues, setRecentIssues] = useState<IssueTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const d = await getLibraryDashboardStats();
        setStats({
          totalBooks: d.totalCopies?.toString() || '0',
          availableCopies: d.availableCopies?.toString() || '0',
          issuedCopies: d.issuedBooks?.toString() || '0',
          overdueBooks: d.overdueBooks || 0,
          pendingReservations: d.reservedBooks || 0,
          finesCollected: `₹ ${d.outstandingFines || 0}`
        });
        const issues = await getActiveIssues();
        const sorted = issues.sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime()).slice(0, 6);
        setRecentIssues(sorted);
      } catch (error) {
        console.error('Failed to fetch library stats', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const statCards = [
    { title: 'Total Inventory', value: stats.totalBooks, gradient: 'from-blue-500 to-indigo-600', icon: CatalogIcon, link: '/library/catalogue' },
    { title: 'Available Copies', value: stats.availableCopies, gradient: 'from-emerald-500 to-teal-600', icon: CheckIcon, link: '/library/catalogue' },
    { title: 'Active Issues', value: stats.issuedCopies, gradient: 'from-violet-500 to-purple-600', icon: CircIcon, link: '/library/circulation' },
    { title: 'Overdue Returns', value: stats.overdueBooks, gradient: 'from-rose-500 to-red-600', icon: OverdueIcon, link: '/library/fines' },
    { title: 'Reservations', value: stats.pendingReservations, gradient: 'from-amber-500 to-orange-500', icon: ReserveIcon, link: '/library/reading-programs' },
    { title: 'Fines Outstanding', value: stats.finesCollected, gradient: 'from-teal-500 to-cyan-600', icon: FineIcon, link: '/library/fines' },
  ];

  const quickLinks = [
    { label: 'Circulation Desk', path: '/library/circulation', color: 'bg-indigo-600 hover:bg-indigo-700', icon: CircIcon },
    { label: 'Book Catalogue', path: '/library/catalogue', color: 'bg-violet-600 hover:bg-violet-700', icon: CatalogIcon },
    { label: 'Member Portal', path: '/library/portal', color: 'bg-emerald-600 hover:bg-emerald-700', icon: LibIcon },
    { label: 'Manage Fines', path: '/library/fines', color: 'bg-rose-600 hover:bg-rose-700', icon: FineIcon },
    { label: 'Reading Programs', path: '/library/reading-programs', color: 'bg-amber-600 hover:bg-amber-700', icon: ReserveIcon },
    { label: 'Analytics', path: '/library/analytics', color: 'bg-teal-600 hover:bg-teal-700', icon: CheckIcon },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6 space-y-6">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-800 via-blue-700 to-teal-700 rounded-3xl p-8 text-white shadow-2xl">
        <div className="absolute -top-12 -right-12 w-56 h-56 bg-white/5 rounded-full" />
        <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-white/5 rounded-full" />
        <div className="relative flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
                <LibIcon style={{ fontSize: 28 }} />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Library Operations</h1>
                <p className="text-blue-200 text-sm">Live monitoring of circulation, inventory, and fines</p>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <Link to="/library/circulation" className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-all no-underline">
              <CircIcon fontSize="small" /> Circulation Desk
            </Link>
            <Link to="/library/catalogue" className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-all no-underline border border-white/20">
              <CatalogIcon fontSize="small" /> Manage Catalogue
            </Link>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map(({ title, value, gradient, icon: Icon, link }) => (
          <Link to={link} key={title} className="group bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 no-underline">
            <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-3 shadow-md`}>
              <Icon className="text-white" style={{ fontSize: 20 }} />
            </div>
            <p className={`text-2xl font-black text-gray-900 ${loading ? 'animate-pulse bg-gray-200 h-8 w-16 rounded' : ''}`}>
              {loading ? '' : value}
            </p>
            <p className="text-xs text-gray-500 font-medium mt-1 leading-tight">{title}</p>
            <ArrowIcon className="text-gray-200 group-hover:text-indigo-400 mt-2 transition-colors" style={{ fontSize: 16 }} />
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-sm font-bold text-gray-900 mb-4">⚡ Quick Actions</h2>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {quickLinks.map(({ label, path, color, icon: Icon }) => (
            <Link to={path} key={label} className="no-underline">
              <button className={`w-full flex flex-col items-center gap-2 px-2 py-4 rounded-2xl text-white ${color} hover:scale-105 transition-all duration-200 shadow-sm`}>
                <Icon style={{ fontSize: 24 }} />
                <span className="text-xs font-semibold text-center leading-tight">{label}</span>
              </button>
            </Link>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between p-6 pb-4">
            <h2 className="text-base font-bold text-gray-900">Recent Transactions</h2>
            <Link to="/library/circulation" className="text-xs text-indigo-600 font-medium hover:underline">View All</Link>
          </div>
          <div className="px-6 pb-6 space-y-3">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
              ))
            ) : recentIssues.length === 0 ? (
              <div className="py-10 text-center">
                <CircIcon className="text-gray-200 mb-3" style={{ fontSize: 48 }} />
                <p className="text-gray-400 text-sm">No recent transactions.</p>
              </div>
            ) : (
              recentIssues.map(issue => (
                <div key={issue._id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl hover:bg-indigo-50 transition-colors">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${issue.status === 'OVERDUE' ? 'bg-red-100' : 'bg-indigo-100'}`}>
                    <LibIcon className={issue.status === 'OVERDUE' ? 'text-red-500' : 'text-indigo-500'} style={{ fontSize: 18 }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">{(issue.bookId as any)?.title || 'Unknown Book'}</p>
                    <p className="text-xs text-gray-400 mt-0.5 truncate">
                      {(issue.userId as any)?.firstName} {(issue.userId as any)?.lastName} · #{(issue.copyId as any)?.accessionNumber}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${issue.status === 'OVERDUE' ? 'bg-red-100 text-red-700' : 'bg-indigo-100 text-indigo-700'}`}>
                      {issue.status}
                    </span>
                    <div className="flex items-center gap-1 mt-1.5 justify-end">
                      <DueIcon className="text-gray-300" style={{ fontSize: 12 }} />
                      <p className="text-xs text-gray-400">Due {new Date(issue.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Action Required */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between p-6 pb-4">
            <h2 className="text-base font-bold text-gray-900">Action Required</h2>
            <Link to="/library/fines" className="text-xs text-indigo-600 font-medium hover:underline">View All</Link>
          </div>
          <div className="px-6 pb-6 space-y-3">
            {stats.overdueBooks > 0 && (
              <Link to="/library/fines" className="no-underline">
                <div className="flex items-center gap-4 p-4 bg-red-50 border border-red-100 rounded-xl hover:border-red-200 transition-colors cursor-pointer group">
                  <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                    <OverdueIcon className="text-red-500" style={{ fontSize: 20 }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-red-800">{stats.overdueBooks} Books Overdue</p>
                    <p className="text-xs text-red-500 mt-0.5">Follow up with members immediately.</p>
                  </div>
                  <ArrowIcon className="text-red-300 group-hover:text-red-500 transition-colors" fontSize="small" />
                </div>
              </Link>
            )}
            {stats.pendingReservations > 0 && (
              <Link to="/library/reading-programs" className="no-underline">
                <div className="flex items-center gap-4 p-4 bg-amber-50 border border-amber-100 rounded-xl hover:border-amber-200 transition-colors cursor-pointer group">
                  <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                    <ReserveIcon className="text-amber-600" style={{ fontSize: 20 }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-amber-800">{stats.pendingReservations} Active Reservations</p>
                    <p className="text-xs text-amber-600 mt-0.5">Books pending for member pickup.</p>
                  </div>
                  <ArrowIcon className="text-amber-300 group-hover:text-amber-500 transition-colors" fontSize="small" />
                </div>
              </Link>
            )}
            {stats.overdueBooks === 0 && stats.pendingReservations === 0 && (
              <div className="py-10 text-center">
                <CheckIcon className="text-emerald-300 mb-3" style={{ fontSize: 48 }} />
                <p className="text-emerald-600 font-semibold text-sm">All caught up!</p>
                <p className="text-gray-400 text-xs mt-1">No urgent actions required right now.</p>
              </div>
            )}

            {/* Quick nav cards */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              {[
                { label: 'Overdue Management', path: '/library/fines', color: 'border-rose-200 hover:border-rose-300 hover:bg-rose-50' },
                { label: 'Stocktake Manager', path: '/library/stocktake', color: 'border-blue-200 hover:border-blue-300 hover:bg-blue-50' },
                { label: 'Digital Library', path: '/library/reading-log', color: 'border-violet-200 hover:border-violet-300 hover:bg-violet-50' },
                { label: 'Library Reports', path: '/library/analytics', color: 'border-teal-200 hover:border-teal-300 hover:bg-teal-50' },
              ].map(({ label, path, color }) => (
                <Link key={label} to={path} className={`flex items-center justify-between p-3 border rounded-xl transition-all no-underline group ${color}`}>
                  <span className="text-xs font-semibold text-gray-700 group-hover:text-gray-900">{label}</span>
                  <ArrowIcon className="text-gray-300 group-hover:text-indigo-400" style={{ fontSize: 14 }} />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LibraryDashboard;
