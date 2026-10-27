import React, { useState, useEffect } from 'react';
import axios from '../../../core/api/axios';
import {
  Science as LabIcon,
  Assignment as ReportIcon,
  Warning as SafetyIcon,
  Add as AddIcon,
  PlayArrow as StartIcon,
  BarChart as GradeIcon,
} from '@mui/icons-material';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, FormControl, InputLabel, Select, MenuItem, Chip } from '@mui/material';

type LabStatus = 'UPCOMING' | 'ACTIVE' | 'GRADING' | 'COMPLETED';

interface LabExperiment {
  _id?: string;
  id?: string;
  title: string;
  experimentNo: string;
  subject: string;
  chapter: string;
  class: string;
  teacher: string;
  labRoom: string;
  scheduledAt: string;
  duration: number;
  status: LabStatus;
  aim: string;
  apparatus: string[];
  chemicals?: string[];
  safetyPrecautions: string[];
  procedure: string[];
  totalStudents: number;
  completedStudents: number;
  avgViva?: number;
  avgRecord?: number;
  maxMarks: number;
  submittedReports: number;
}

const statusConfig: Record<LabStatus, { label: string; color: string; dot: string }> = {
  UPCOMING: { label: 'Upcoming', color: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500' },
  ACTIVE: { label: '🔬 Active', color: 'bg-green-100 text-green-700', dot: 'bg-green-500 animate-pulse' },
  GRADING: { label: '📝 Grading', color: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
  COMPLETED: { label: '✅ Done', color: 'bg-gray-100 text-gray-500', dot: 'bg-gray-400' },
};

const subjectColors: Record<string, string> = {
  'Chemistry': 'from-violet-500 to-purple-600',
  'Physics': 'from-blue-500 to-indigo-600',
  'Biology': 'from-emerald-500 to-teal-600',
};

const PracticalManager: React.FC = () => {
  const [labs, setLabs] = useState<LabExperiment[]>([]);
  const [selected, setSelected] = useState<LabExperiment | null>(null);
  const [createDialog, setCreateDialog] = useState(false);
  const [filterSubject, setFilterSubject] = useState('all');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    experimentNo: '',
    subject: 'Chemistry',
    title: '',
    chapter: '',
    class: '',
    labRoom: '',
    scheduledAt: '',
    duration: 90,
    aim: '',
    apparatus: '',
    safetyPrecautions: ''
  });

  useEffect(() => {
    fetchLabs();
  }, []);

  const fetchLabs = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/learning/lab-experiments');
      if (res.data && res.data.data) {
        setLabs(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateExperiment = async () => {
    if (!form.title) {
      alert('Please enter experiment title');
      return;
    }
    try {
      setSaving(true);
      await axios.post('/learning/lab-experiments', {
        ...form,
        apparatus: form.apparatus ? form.apparatus.split(',').map(s => s.trim()).filter(Boolean) : [],
        safetyPrecautions: form.safetyPrecautions ? form.safetyPrecautions.split('\n').map(s => s.trim()).filter(Boolean) : []
      });
      setCreateDialog(false);
      setForm({
        experimentNo: '',
        subject: 'Chemistry',
        title: '',
        chapter: '',
        class: '',
        labRoom: '',
        scheduledAt: '',
        duration: 90,
        aim: '',
        apparatus: '',
        safetyPrecautions: ''
      });
      fetchLabs();
    } catch (err: any) {
      console.error('Failed to create lab experiment:', err);
      alert(err.response?.data?.message || 'Failed to save experiment');
    } finally {
      setSaving(false);
    }
  };

  const filtered = filterSubject === 'all' ? labs : labs.filter(l => l.subject === filterSubject);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50 p-6 space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-teal-700 via-emerald-700 to-green-700 rounded-3xl p-8 text-white shadow-2xl">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/5 rounded-full" />
        <div className="relative flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-1">🔬 Practical Lab Management</h1>
            <p className="text-teal-200 text-sm">Manage lab experiments, schedules, apparatus, and student records.</p>
          </div>
          <div className="flex gap-3">
            {[
              { label: 'Active Labs', value: labs.filter(l => l.status === 'ACTIVE').length, color: 'bg-green-500/30' },
              { label: 'This Week', value: labs.filter(l => l.status === 'UPCOMING').length, color: 'bg-white/10' },
              { label: 'Grading', value: labs.filter(l => l.status === 'GRADING').length, color: 'bg-amber-500/30' },
            ].map(s => (
              <div key={s.label} className={`${s.color} backdrop-blur rounded-2xl px-4 py-3 text-center`}>
                <p className="text-xl font-black">{s.value}</p>
                <p className="text-xs text-teal-200 mt-0.5">{s.label}</p>
              </div>
            ))}
            <button onClick={() => setCreateDialog(true)} className="flex items-center gap-2 bg-white text-teal-700 font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-teal-50 self-center">
              <AddIcon style={{ fontSize: 18 }} /> Add Experiment
            </button>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-2">
        {['all', 'Chemistry', 'Physics', 'Biology'].map(s => (
          <button key={s} onClick={() => setFilterSubject(s)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${filterSubject === s ? 'bg-teal-600 text-white border-transparent' : 'bg-white text-gray-600 border-gray-200 hover:border-teal-300'}`}>
            {s === 'all' ? '🔬 All Labs' : s}
          </button>
        ))}
      </div>

      {/* Lab Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {filtered.map(lab => {
          const status = statusConfig[lab.status];
          const gradient = subjectColors[lab.subject] || 'from-slate-500 to-gray-600';
          const progressPct = lab.totalStudents > 0 ? (lab.completedStudents / lab.totalStudents) * 100 : 0;

          return (
            <div key={lab._id || lab.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden cursor-pointer"
              onClick={() => setSelected(lab)}>
              <div className={`h-1.5 bg-gradient-to-r ${gradient}`} />
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white flex-shrink-0`}>
                      <LabIcon style={{ fontSize: 22 }} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-gray-400">{lab.experimentNo}</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${status.color}`}>{status.label}</span>
                      </div>
                      <h3 className="font-bold text-gray-900 text-base leading-tight">{lab.title}</h3>
                      <p className="text-xs text-gray-400 mt-0.5">{lab.subject} · {lab.chapter}</p>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-4 leading-relaxed line-clamp-2"><span className="font-semibold text-gray-700">Aim:</span> {lab.aim}</p>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400 mb-0.5">Class</p>
                    <p className="text-sm font-bold text-gray-900">{lab.class}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400 mb-0.5">Lab Room</p>
                    <p className="text-sm font-bold text-gray-900">{lab.labRoom}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400 mb-0.5">Date & Time</p>
                    <p className="text-xs font-semibold text-gray-700">{new Date(lab.scheduledAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })} · {lab.duration}min</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400 mb-0.5">Teacher</p>
                    <p className="text-xs font-semibold text-gray-700">{lab.teacher}</p>
                  </div>
                </div>

                {/* Safety */}
                <div className="flex items-start gap-2 mb-4 bg-amber-50 border border-amber-100 rounded-xl p-3">
                  <SafetyIcon className="text-amber-500 flex-shrink-0 mt-0.5" style={{ fontSize: 16 }} />
                  <p className="text-xs text-amber-700">{lab.safetyPrecautions[0]}</p>
                </div>

                {/* Progress */}
                <div className="mb-4">
                  <div className="flex justify-between mb-1.5">
                    <span className="text-xs text-gray-500">Student Progress</span>
                    <span className="text-xs font-bold text-gray-700">{lab.completedStudents}/{lab.totalStudents}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full">
                    <div className={`h-full rounded-full bg-gradient-to-r ${gradient}`} style={{ width: `${progressPct}%` }} />
                  </div>
                </div>

                {/* Graded stats */}
                {lab.status === 'GRADING' && (
                  <div className="grid grid-cols-3 gap-2 mb-4 p-3 bg-amber-50 rounded-xl border border-amber-100">
                    <div className="text-center">
                      <p className="text-sm font-black text-amber-700">{lab.avgViva ?? '—'}</p>
                      <p className="text-xs text-amber-500">Avg Viva</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-black text-amber-700">{lab.avgRecord ?? '—'}</p>
                      <p className="text-xs text-amber-500">Avg Record</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-black text-amber-700">{lab.submittedReports}/{lab.totalStudents}</p>
                      <p className="text-xs text-amber-500">Reports</p>
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-3 border-t border-gray-100">
                  <button className={`flex-1 flex items-center justify-center gap-1.5 bg-gradient-to-r ${gradient} text-white py-2 rounded-xl text-xs font-bold`} onClick={e => { e.stopPropagation(); setSelected(lab); }}>
                    {lab.status === 'ACTIVE' ? <><StartIcon style={{ fontSize: 14 }} />View Live</> : lab.status === 'GRADING' ? <><GradeIcon style={{ fontSize: 14 }} />Enter Grades</> : <><ReportIcon style={{ fontSize: 14 }} />View Details</>}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail Modal */}
      <Dialog open={!!selected} onClose={() => setSelected(null)} maxWidth="md" fullWidth>
        {selected && (
          <>
            <DialogTitle sx={{ fontWeight: 'bold' }}>
              🔬 {selected.title}
              <p className="text-sm font-mono font-normal text-gray-400 mt-0.5">{selected.experimentNo} · {selected.subject} · {selected.class}</p>
            </DialogTitle>
            <DialogContent dividers>
              <div className="space-y-5">
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Aim</p>
                  <p className="text-sm text-gray-700">{selected.aim}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Apparatus</p>
                  <div className="flex flex-wrap gap-2">
                    {selected.apparatus.map(a => <Chip key={a} label={a} size="small" variant="outlined" sx={{ fontSize: '11px' }} />)}
                  </div>
                </div>
                {selected.chemicals && (
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Chemicals/Materials</p>
                    <div className="flex flex-wrap gap-2">
                      {selected.chemicals.map(c => <Chip key={c} label={c} size="small" color="warning" variant="outlined" sx={{ fontSize: '11px' }} />)}
                    </div>
                  </div>
                )}
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Safety Precautions</p>
                  <div className="space-y-1.5">
                    {selected.safetyPrecautions.map((s, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-amber-700">
                        <SafetyIcon style={{ fontSize: 14 }} className="mt-0.5 flex-shrink-0" />
                        {s}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Procedure</p>
                  <ol className="space-y-2">
                    {selected.procedure.map((p, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                        <span className="flex-shrink-0 w-5 h-5 bg-teal-100 text-teal-700 rounded-full text-xs font-bold flex items-center justify-center">{i + 1}</span>
                        {p}
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSelected(null)}>Close</Button>
              {selected.status === 'GRADING' && <Button variant="contained" color="primary">Enter Grades</Button>}
              {selected.status === 'ACTIVE' && <Button variant="contained" color="success">Mark Complete</Button>}
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Create Dialog */}
      <Dialog open={createDialog} onClose={() => setCreateDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>🔬 Add Lab Experiment</DialogTitle>
        <DialogContent dividers>
          <div className="space-y-4 pt-1">
            <div className="grid grid-cols-2 gap-3">
              <TextField 
                label="Experiment No." 
                fullWidth 
                required 
                placeholder="e.g. EXP-101"
                value={form.experimentNo} 
                onChange={e => setForm({ ...form, experimentNo: e.target.value })} 
              />
              <FormControl fullWidth><InputLabel>Subject</InputLabel>
                <Select 
                  label="Subject" 
                  value={form.subject}
                  onChange={e => setForm({ ...form, subject: e.target.value })}
                >
                  {['Chemistry', 'Physics', 'Biology', 'Computer Science'].map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                </Select>
              </FormControl>
            </div>
            <TextField 
              label="Experiment Title" 
              fullWidth 
              required 
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-3">
              <TextField 
                label="Class / Grade" 
                fullWidth 
                value={form.class}
                onChange={e => setForm({ ...form, class: e.target.value })}
              />
              <TextField 
                label="Lab Room" 
                fullWidth 
                value={form.labRoom}
                onChange={e => setForm({ ...form, labRoom: e.target.value })}
              />
            </div>
            <TextField 
              label="Date & Time" 
              type="datetime-local" 
              fullWidth 
              slotProps={{ inputLabel: { shrink: true } }} 
              value={form.scheduledAt}
              onChange={e => setForm({ ...form, scheduledAt: e.target.value })}
            />
            <TextField 
              label="Duration (minutes)" 
              type="number" 
              fullWidth 
              value={form.duration}
              onChange={e => setForm({ ...form, duration: Number(e.target.value) })}
            />
            <TextField 
              label="Aim of Experiment" 
              multiline 
              rows={2} 
              fullWidth 
              value={form.aim}
              onChange={e => setForm({ ...form, aim: e.target.value })}
            />
            <TextField 
              label="Apparatus (comma separated)" 
              fullWidth 
              value={form.apparatus}
              onChange={e => setForm({ ...form, apparatus: e.target.value })}
              placeholder="Beakers, Test tubes, Bunsen burner"
            />
            <TextField 
              label="Safety Precautions (one per line)" 
              multiline 
              rows={2} 
              fullWidth 
              value={form.safetyPrecautions}
              onChange={e => setForm({ ...form, safetyPrecautions: e.target.value })}
              placeholder="Wear safety goggles&#10;Handle acids with tongs"
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateExperiment} disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default PracticalManager;
