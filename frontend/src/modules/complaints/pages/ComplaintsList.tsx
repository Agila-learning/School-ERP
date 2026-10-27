import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { getComplaints, createComplaint, updateComplaintStatus, type Complaint } from '../api/complaint.api';
import type { RootState } from '../../../store';
import { 
  ReportProblem as ReportIcon, 
  CheckCircle as ResolvedIcon,
  Add as AddIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import BackButton from '../../../shared/components/BackButton';

const ComplaintsList: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const isAdmin = user?.roles?.some(r => ['Admin', 'Super Admin', 'Principal'].includes(r.name));

  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [showForm, setShowForm] = useState(false);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Complaint['category']>('OTHER');
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const fetchComplaints = async () => {
    try {
      const data = await getComplaints();
      setComplaints(data || []);
    } catch (e) {
      console.error('Failed to fetch complaints', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) return;
    setSubmitting(true);
    setErrorMessage('');
    try {
      await createComplaint({ subject, description, category, priority: 'MEDIUM' });
      setShowForm(false);
      setSubject('');
      setDescription('');
      setSuccessMessage('Complaint raised and registered in database successfully!');
      setTimeout(() => setSuccessMessage(''), 4000);
      fetchComplaints();
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.response?.data?.message || 'Failed to submit complaint. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResolve = async (id: string) => {
    try {
      await updateComplaintStatus(id, { status: 'RESOLVED', resolution: 'Resolved by administration' });
      fetchComplaints();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6 bg-slate-50 min-h-screen">
      <BackButton to="/parent-portal" />

      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <ResolvedIcon className="text-emerald-600" />
            <span className="font-semibold text-sm">{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage('')} className="text-emerald-600 hover:text-emerald-800">
            <CloseIcon fontSize="small" />
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-xl flex items-center justify-between">
          <span className="font-semibold text-sm">{errorMessage}</span>
          <button onClick={() => setErrorMessage('')} className="text-rose-600 hover:text-rose-800">
            <CloseIcon fontSize="small" />
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-200 gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            <ReportIcon className="text-orange-500" /> Helpdesk & Complaints Desk
          </h1>
          <p className="text-sm text-slate-500 mt-1">Raise grievance tickets, track resolutions, and monitor school action</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-md shadow-indigo-200 hover:bg-indigo-700 transition-all cursor-pointer"
        >
          <AddIcon style={{ fontSize: 20 }} /> {showForm ? 'Close Form' : 'Raise New Issue'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-2xl shadow-md border border-indigo-100 animate-fade-in-up">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-600"></span> Submit New Complaint / Grievance
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Issue Category</label>
              <select 
                value={category} 
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full border border-slate-300 rounded-xl p-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all font-medium text-slate-700"
              >
                <option value="ACADEMIC">Academic / Curriculum</option>
                <option value="INFRASTRUCTURE">Campus Infrastructure & Facilities</option>
                <option value="TRANSPORT">School Transport & Bus</option>
                <option value="HOSTEL">Hostel & Dining</option>
                <option value="OTHER">Other School Grievance</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Subject / Title</label>
              <input 
                required
                type="text" 
                placeholder="e.g. Bus Route A1 delayed by 20 mins regularly"
                value={subject} 
                onChange={(e) => setSubject(e.target.value)}
                className="w-full border border-slate-300 rounded-xl p-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Detailed Description</label>
              <textarea 
                required
                rows={4}
                placeholder="Please describe the issue in detail with dates or locations if applicable..."
                value={description} 
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border border-slate-300 rounded-xl p-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button 
                type="button" 
                onClick={() => setShowForm(false)} 
                className="px-5 py-2.5 text-slate-600 font-semibold hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={submitting}
                className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-md shadow-indigo-200 hover:bg-indigo-700 transition-all disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Complaint'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid gap-4">
        {loading ? (
          <div className="text-center text-slate-500 py-12 bg-white rounded-2xl border border-slate-200">
            <p className="animate-pulse font-medium">Loading complaints...</p>
          </div>
        ) : complaints.length === 0 ? (
          <div className="text-center text-slate-500 py-12 bg-white rounded-2xl border border-slate-200">
            <ReportIcon sx={{ fontSize: 48, color: '#cbd5e1', mb: 1 }} />
            <p className="font-semibold text-slate-700">No complaints registered</p>
            <p className="text-sm text-slate-400 mt-1">Click "Raise New Issue" above to submit a ticket</p>
          </div>
        ) : (
          complaints.map(c => (
            <div key={c._id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:shadow-md transition-all">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black ${
                    c.status === 'OPEN' ? 'bg-amber-100 text-amber-800' : 
                    c.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' : 
                    'bg-emerald-100 text-emerald-800'
                  }`}>
                    {c.status}
                  </span>
                  <span className="text-xs text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded font-bold">{c.category}</span>
                </div>
                <h3 className="font-bold text-slate-800 text-lg">{c.subject}</h3>
                <p className="text-sm text-slate-600 mt-1 leading-relaxed">{c.description}</p>
                {c.resolution && (
                  <div className="mt-2 text-xs bg-slate-50 border-l-2 border-emerald-500 p-2 text-slate-700 rounded-r">
                    <span className="font-bold text-emerald-700">Resolution:</span> {c.resolution}
                  </div>
                )}
                <div className="text-xs text-slate-400 mt-3 flex items-center gap-2 flex-wrap">
                  <span>Raised by: <strong className="text-slate-600">{c.userId?.firstName ? `${c.userId.firstName} ${c.userId.lastName}` : 'Guardian/Member'}</strong></span>
                  <span>•</span>
                  <span>{new Date(c.createdAt || '').toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                </div>
              </div>
              
              {isAdmin && c.status !== 'RESOLVED' && c.status !== 'CLOSED' && (
                <button 
                  onClick={() => handleResolve(c._id!)}
                  className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl text-sm font-bold border border-emerald-300 hover:bg-emerald-100 transition-colors shrink-0"
                >
                  <ResolvedIcon style={{ fontSize: 18 }} /> Mark Resolved
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ComplaintsList;
