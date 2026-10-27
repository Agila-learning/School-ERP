import React, { useState, useEffect } from 'react';
import axios from '../../../core/api/axios';
import {
  Assignment as AssessIcon,
  Timer as TimerIcon,
  TrendingUp as TrendIcon,
  Add as AddIcon,
  Quiz as QuizIcon,
  Description as PaperIcon,
  EmojiEvents as TrophyIcon,
  Science as ScienceIcon,
  Psychology as PracticalIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, FormControl, InputLabel, Select, MenuItem, LinearProgress } from '@mui/material';

type AssessType = 'UNIT_TEST' | 'QUIZ' | 'ASSIGNMENT' | 'PRACTICAL' | 'PROJECT' | 'ORAL';
type AssessStatus = 'DRAFT' | 'PUBLISHED' | 'ONGOING' | 'COMPLETED' | 'GRADED';

interface Assessment {
  _id?: string;
  id?: string;
  title: string;
  type: AssessType;
  subject: string;
  class: string;
  totalMarks: number;
  duration?: number;
  scheduledAt?: string;
  deadline?: string;
  status: AssessStatus;
  submittedCount: number;
  totalStudents: number;
  avgScore?: number;
  topScore?: number;
  passCount?: number;
  description?: string;
}

const typeConfig: Record<AssessType, { label: string; icon: React.ReactNode; color: string; gradient: string }> = {
  UNIT_TEST: { label: 'Unit Test', icon: <PaperIcon />, color: 'bg-blue-100 text-blue-700', gradient: 'from-blue-500 to-indigo-600' },
  QUIZ: { label: 'Quiz', icon: <QuizIcon />, color: 'bg-amber-100 text-amber-700', gradient: 'from-amber-500 to-orange-500' },
  ASSIGNMENT: { label: 'Assignment', icon: <AssessIcon />, color: 'bg-violet-100 text-violet-700', gradient: 'from-violet-500 to-purple-600' },
  PRACTICAL: { label: 'Practical', icon: <ScienceIcon />, color: 'bg-emerald-100 text-emerald-700', gradient: 'from-emerald-500 to-teal-600' },
  PROJECT: { label: 'Project', icon: <TrendIcon />, color: 'bg-teal-100 text-teal-700', gradient: 'from-teal-500 to-cyan-600' },
  ORAL: { label: 'Oral/Viva', icon: <PracticalIcon />, color: 'bg-rose-100 text-rose-700', gradient: 'from-rose-500 to-pink-600' },
};

const statusConfig: Record<AssessStatus, { label: string; color: string }> = {
  DRAFT: { label: 'Draft', color: 'bg-gray-100 text-gray-500' },
  PUBLISHED: { label: 'Published', color: 'bg-blue-100 text-blue-700' },
  ONGOING: { label: '🔴 Ongoing', color: 'bg-red-100 text-red-700' },
  COMPLETED: { label: 'Completed', color: 'bg-teal-100 text-teal-700' },
  GRADED: { label: '✅ Graded', color: 'bg-emerald-100 text-emerald-700' },
};

const AssessmentDashboard: React.FC = () => {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [createDialog, setCreateDialog] = useState(false);
  const [viewAssess, setViewAssess] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Partial<Assessment>>({ type: 'QUIZ', status: 'DRAFT' });

  useEffect(() => {
    fetchAssessments();
  }, []);

  const handleCreate = async (status: AssessStatus) => {
    try {
      if (!form.title || !form.subject || !form.class) {
        alert('Please fill in Assessment Title, Subject, and Class / Grade.');
        return;
      }
      setLoading(true);
      await axios.post('/learning/assessments', { ...form, status });
      setCreateDialog(false);
      setForm({ type: 'QUIZ', status: 'DRAFT', title: '', subject: '', class: '', totalMarks: 100 });
      fetchAssessments();
    } catch (err: any) {
      console.error('Failed to create assessment:', err);
      alert(err.response?.data?.message || 'Failed to create assessment');
    } finally {
      setLoading(false);
    }
  };

  const fetchAssessments = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/learning/assessments');
      if (res.data && res.data.data) {
        setAssessments(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = assessments.filter(a => {
    const matchType = filterType === 'all' || a.type === filterType;
    const matchStatus = filterStatus === 'all' || a.status === filterStatus;
    return matchType && matchStatus;
  });

  const gradedCount = assessments.filter(a => a.status === 'GRADED').length;
  const ongoingCount = assessments.filter(a => a.status === 'ONGOING').length;
  const publishedCount = assessments.filter(a => a.status === 'PUBLISHED').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-amber-50 p-6 space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-amber-600 via-orange-600 to-rose-700 rounded-3xl p-8 text-white shadow-2xl">
        <div className="absolute -top-10 -right-10 w-44 h-44 bg-white/5 rounded-full" />
        <div className="relative flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-1">📋 Assessments</h1>
            <p className="text-orange-200 text-sm">Manage all assessments – tests, quizzes, practicals, projects, and oral exams.</p>
          </div>
          <div className="flex gap-3">
            {[
              { label: 'Ongoing', value: ongoingCount, color: 'bg-red-500/30' },
              { label: 'Published', value: publishedCount, color: 'bg-white/10' },
              { label: 'Graded', value: gradedCount, color: 'bg-emerald-500/30' },
            ].map(s => (
              <div key={s.label} className={`${s.color} backdrop-blur rounded-2xl px-4 py-3 text-center`}>
                <p className="text-xl font-black">{s.value}</p>
                <p className="text-xs text-orange-200 mt-0.5">{s.label}</p>
              </div>
            ))}
            <button onClick={() => setCreateDialog(true)} className="flex items-center gap-2 bg-white text-orange-700 font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-orange-50 self-center">
              <AddIcon style={{ fontSize: 18 }} /> Create Assessment
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-3">
        <div className="flex flex-wrap gap-2">
          <span className="text-xs font-semibold text-gray-400 flex items-center mr-1">Type:</span>
          {(['all', 'UNIT_TEST', 'QUIZ', 'ASSIGNMENT', 'PRACTICAL', 'PROJECT', 'ORAL'] as const).map(t => (
            <button key={t} onClick={() => setFilterType(t)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${filterType === t ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
              {t === 'all' ? 'All' : typeConfig[t as AssessType].label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="text-xs font-semibold text-gray-400 flex items-center mr-1">Status:</span>
          {(['all', 'DRAFT', 'PUBLISHED', 'ONGOING', 'GRADED'] as const).map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${filterStatus === s ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
              {s === 'all' ? 'All' : statusConfig[s as AssessStatus].label}
            </button>
          ))}
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
        {filtered.map(a => {
          const type = typeConfig[a.type];
          const status = statusConfig[a.status];
          const submissionPct = a.totalStudents > 0 ? (a.submittedCount / a.totalStudents) * 100 : 0;
          const passPct = a.passCount ? (a.passCount / a.submittedCount) * 100 : null;

          return (
            <div key={a._id || a.id}
              onClick={() => setViewAssess(a)}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden cursor-pointer group">
              <div className={`h-1.5 bg-gradient-to-r ${type.gradient}`} />
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div style={{ fontSize: 16, display: 'flex' }}>
                      {type.icon}
                    </div>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${type.color}`}>{type.label}</span>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${status.color}`}>{status.label}</span>
                </div>

                <h3 className="font-bold text-gray-900 text-sm mb-1 leading-tight">{a.title}</h3>
                <p className="text-xs text-gray-400 mb-4">{a.subject} · {a.class} · {a.totalMarks} marks{a.duration ? ` · ${a.duration} mins` : ''}</p>

                {/* Graded stats */}
                {a.status === 'GRADED' && a.avgScore !== undefined && (
                  <div className="grid grid-cols-3 gap-2 mb-4 p-3 bg-gray-50 rounded-xl">
                    <div className="text-center">
                      <p className="text-sm font-black text-indigo-600">{a.avgScore}/{a.totalMarks}</p>
                      <p className="text-xs text-gray-400">Avg Score</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-black text-emerald-600">{a.topScore}</p>
                      <p className="text-xs text-gray-400">Top Score</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-black text-teal-600">{passPct?.toFixed(0)}%</p>
                      <p className="text-xs text-gray-400">Pass Rate</p>
                    </div>
                  </div>
                )}

                {/* Submission progress */}
                {a.status !== 'DRAFT' && (
                  <div className="mb-4">
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-gray-500">Submissions</span>
                      <span className="text-xs font-bold text-gray-700">{a.submittedCount}/{a.totalStudents}</span>
                    </div>
                    <LinearProgress variant="determinate" value={submissionPct}
                      sx={{ height: 6, borderRadius: 3, bgcolor: 'grey.100', '& .MuiLinearProgress-bar': { borderRadius: 3, bgcolor: submissionPct === 100 ? '#10b981' : '#f59e0b' } }} />
                  </div>
                )}

                {/* Schedule/deadline */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="text-xs text-gray-400 flex items-center gap-1">
                    <TimerIcon style={{ fontSize: 12 }} />
                    {a.scheduledAt
                      ? `${new Date(a.scheduledAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}`
                      : a.deadline ? `Due: ${new Date(a.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}` : 'No deadline set'}
                  </div>
                  <button className="text-gray-300 group-hover:text-orange-500 transition-colors">
                    <EditIcon style={{ fontSize: 14 }} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Dialog */}
      <Dialog open={createDialog} onClose={() => setCreateDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>📋 Create Assessment</DialogTitle>
        <DialogContent dividers>
          <div className="space-y-4 pt-1">
            <TextField label="Assessment Title" value={form.title || ''} onChange={e => setForm({ ...form, title: e.target.value })} fullWidth required />
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select label="Type" value={form.type || 'QUIZ'} onChange={e => setForm({ ...form, type: e.target.value as AssessType })}>
                {(Object.keys(typeConfig) as AssessType[]).map(t => <MenuItem key={t} value={t}>{typeConfig[t].label}</MenuItem>)}
              </Select>
            </FormControl>
            <div className="grid grid-cols-2 gap-3">
              <TextField label="Subject" value={form.subject || ''} onChange={e => setForm({ ...form, subject: e.target.value })} fullWidth />
              <TextField label="Class / Grade" value={form.class || ''} onChange={e => setForm({ ...form, class: e.target.value })} fullWidth />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <TextField label="Total Marks" type="number" value={form.totalMarks || ''} onChange={e => setForm({ ...form, totalMarks: Number(e.target.value) })} fullWidth />
              <TextField label="Duration (mins, optional)" type="number" value={form.duration || ''} onChange={e => setForm({ ...form, duration: Number(e.target.value) })} fullWidth />
            </div>
            <TextField label="Date/Time or Deadline" type="datetime-local" value={form.deadline || ''} onChange={e => setForm({ ...form, deadline: e.target.value })} fullWidth slotProps={{ inputLabel: { shrink: true } }} />
            <TextField label="Instructions / Description" value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} multiline rows={3} fullWidth />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialog(false)}>Cancel</Button>
          <Button variant="outlined" onClick={() => handleCreate('DRAFT')} disabled={loading}>Save as Draft</Button>
          <Button variant="contained" onClick={() => handleCreate('PUBLISHED')} disabled={loading}>Publish</Button>
        </DialogActions>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={!!viewAssess} onClose={() => setViewAssess(null)} maxWidth="sm" fullWidth>
        {viewAssess && (
          <>
            <DialogTitle sx={{ fontWeight: 'bold' }}>
              {viewAssess.title}
              <p className="text-sm font-normal text-gray-500 mt-1">{viewAssess.subject} · {viewAssess.class}</p>
            </DialogTitle>
            <DialogContent dividers>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Total Marks', value: viewAssess.totalMarks },
                    { label: 'Duration', value: viewAssess.duration ? `${viewAssess.duration} min` : 'Untimed' },
                    { label: 'Submitted', value: `${viewAssess.submittedCount}/${viewAssess.totalStudents}` },
                  ].map(s => (
                    <div key={s.label} className="bg-gray-50 rounded-xl p-3 text-center">
                      <p className="text-lg font-black text-gray-900">{s.value}</p>
                      <p className="text-xs text-gray-400">{s.label}</p>
                    </div>
                  ))}
                </div>
                {viewAssess.avgScore !== undefined && (
                  <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-xl p-4">
                    <p className="text-xs font-bold text-emerald-700 uppercase tracking-wide mb-3">Results Summary</p>
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div><p className="text-xl font-black text-indigo-600">{viewAssess.avgScore}</p><p className="text-xs text-gray-500">Class Average</p></div>
                      <div><p className="text-xl font-black text-emerald-600 flex items-center justify-center gap-1"><TrophyIcon style={{ fontSize: 16 }} />{viewAssess.topScore}</p><p className="text-xs text-gray-500">Top Score</p></div>
                      <div><p className="text-xl font-black text-teal-600">{viewAssess.passCount}/{viewAssess.submittedCount}</p><p className="text-xs text-gray-500">Passed</p></div>
                    </div>
                  </div>
                )}
              </div>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setViewAssess(null)}>Close</Button>
              <Button variant="contained">Enter Marks</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </div>
  );
};

export default AssessmentDashboard;
