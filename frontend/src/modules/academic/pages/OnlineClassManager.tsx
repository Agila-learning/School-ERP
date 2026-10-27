import React, { useState, useEffect } from 'react';
import axios from '../../../core/api/axios';
import {
  VideoCall as VideoIcon,
  Schedule as ScheduleIcon,
  People as PeopleIcon,
  PlayCircle as PlayIcon,
  RecordVoiceOver as RecordIcon,
  Add as AddIcon,
  Link as LinkIcon,
  Event as EventIcon,
  Timer as TimerIcon,
  School as SchoolIcon,
} from '@mui/icons-material';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material';

type ClassStatus = 'LIVE' | 'SCHEDULED' | 'COMPLETED';

interface OnlineClass {
  _id?: string;
  id?: string;
  title: string;
  subject: string;
  class: string;
  teacher: string;
  scheduledAt: string;
  duration: number; // minutes
  status: ClassStatus;
  meetingLink?: string;
  platform: 'Zoom' | 'Google Meet' | 'Microsoft Teams' | 'Internal';
  attendees: number;
  capacity: number;
  recordingUrl?: string;
  description?: string;
}

const statusConfig: Record<ClassStatus, { label: string; color: string; dot: string }> = {
  LIVE: { label: '🔴 Live Now', color: 'bg-red-100 text-red-700 border-red-200', dot: 'bg-red-500 animate-pulse' },
  SCHEDULED: { label: 'Scheduled', color: 'bg-blue-100 text-blue-700 border-blue-200', dot: 'bg-blue-500' },
  COMPLETED: { label: 'Completed', color: 'bg-gray-100 text-gray-500 border-gray-200', dot: 'bg-gray-400' },
};

const platformColors: Record<string, string> = {
  'Zoom': 'bg-blue-500',
  'Google Meet': 'bg-green-500',
  'Microsoft Teams': 'bg-purple-500',
  'Internal': 'bg-indigo-500',
};

const OnlineClassManager: React.FC = () => {
  const [classes, setClasses] = useState<OnlineClass[]>([]);
  const [filter, setFilter] = useState<'all' | ClassStatus>('all');
  const [search, setSearch] = useState('');
  const [scheduleDialog, setScheduleDialog] = useState(false);
  const [form, setForm] = useState<Partial<OnlineClass>>({ platform: 'Zoom', duration: 60 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClasses();
  }, []);

  const handleCreate = async () => {
    try {
      setLoading(true);
      await axios.post('/learning/online-classes', form);
      setScheduleDialog(false);
      setForm({ platform: 'Zoom', duration: 60 });
      fetchClasses();
    } catch (err: any) {
      console.error('Failed to schedule class:', err);
      alert(err.response?.data?.message || err.message || 'Failed to schedule class');
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/learning/online-classes');
      if (res.data && res.data.data) {
        setClasses(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = classes.filter(c => {
    const matchFilter = filter === 'all' || c.status === filter;
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) || (c.class && c.class.toLowerCase().includes(search.toLowerCase())) || (c.subject && c.subject.toLowerCase().includes(search.toLowerCase()));
    return matchFilter && matchSearch;
  });

  const liveCount = classes.filter(c => c.status === 'LIVE').length;
  const scheduledCount = classes.filter(c => c.status === 'SCHEDULED').length;
  const completedCount = classes.filter(c => c.status === 'COMPLETED').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6 space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-700 via-indigo-700 to-violet-800 rounded-3xl p-8 text-white shadow-2xl">
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/5 rounded-full" />
        <div className="absolute -bottom-8 -left-8 w-36 h-36 bg-white/5 rounded-full" />
        <div className="relative flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-1">🖥️ Online Classes</h1>
            <p className="text-blue-200 text-sm">Schedule, launch, and manage live virtual classes across all grades.</p>
          </div>
          <div className="flex gap-3">
            {[
              { label: 'Live', value: liveCount, color: 'bg-red-500/30' },
              { label: 'Scheduled', value: scheduledCount, color: 'bg-blue-500/30' },
              { label: 'Completed', value: completedCount, color: 'bg-white/10' },
            ].map(s => (
              <div key={s.label} className={`${s.color} backdrop-blur rounded-2xl px-4 py-3 text-center`}>
                <p className="text-xl font-black">{s.value}</p>
                <p className="text-xs text-blue-200 mt-0.5">{s.label}</p>
              </div>
            ))}
            <button onClick={() => setScheduleDialog(true)} className="flex items-center gap-2 bg-white text-indigo-700 font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-indigo-50 transition-colors self-center shadow-lg">
              <AddIcon style={{ fontSize: 18 }} /> Schedule Class
            </button>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-wrap items-center gap-3">
        <div className="flex gap-2">
          {(['all', 'LIVE', 'SCHEDULED', 'COMPLETED'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${filter === f ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
              {f === 'all' ? 'All Classes' : f === 'LIVE' ? '🔴 Live' : f === 'SCHEDULED' ? 'Scheduled' : 'Completed'}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Search by title, class, subject..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 min-w-48 px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
        />
      </div>

      {/* Class Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
        {filtered.map(cls => (
          <div key={cls._id || cls.id} className={`bg-white rounded-2xl border shadow-sm hover:shadow-lg transition-all overflow-hidden ${cls.status === 'LIVE' ? 'border-red-200 ring-2 ring-red-100' : 'border-gray-100'}`}>
            {cls.status === 'LIVE' && (
              <div className="h-1.5 bg-gradient-to-r from-red-500 via-rose-500 to-pink-500 animate-pulse" />
            )}
            <div className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${statusConfig[cls.status].dot}`} />
                <span className={`ml-2 flex-1 text-xs font-bold px-2.5 py-1 rounded-full border ${statusConfig[cls.status].color}`}>
                  {statusConfig[cls.status].label}
                </span>
                <span className={`ml-2 text-xs font-bold text-white px-2 py-1 rounded-lg ${platformColors[cls.platform]}`}>{cls.platform}</span>
              </div>

              <h3 className="font-bold text-gray-900 text-sm leading-snug mb-2">{cls.title}</h3>

              <div className="space-y-1.5 mb-4">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <SchoolIcon style={{ fontSize: 14 }} /> {cls.subject} · {cls.class}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <PeopleIcon style={{ fontSize: 14 }} /> {cls.teacher}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <EventIcon style={{ fontSize: 14 }} />
                  {new Date(cls.scheduledAt).toLocaleString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <TimerIcon style={{ fontSize: 14 }} /> {cls.duration} mins
                  <span className="mx-2">·</span>
                  <PeopleIcon style={{ fontSize: 14 }} />
                  {cls.status === 'COMPLETED' ? `${cls.attendees} attended` : `${cls.attendees}/${cls.capacity} enrolled`}
                </div>
              </div>

              {/* Attendance bar */}
              {cls.status === 'LIVE' && (
                <div className="mb-4">
                  <div className="flex justify-between mb-1">
                    <span className="text-xs text-gray-500">Attendance</span>
                    <span className="text-xs font-bold text-green-600">{cls.attendees}/{cls.capacity}</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full">
                    <div className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full" style={{ width: `${(cls.attendees / cls.capacity) * 100}%` }} />
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-3 border-t border-gray-100">
                {cls.status === 'LIVE' && cls.meetingLink && (
                  <a href={cls.meetingLink} target="_blank" rel="noreferrer" className="flex-1 flex items-center justify-center gap-1.5 bg-red-600 hover:bg-red-700 text-white py-2 rounded-xl text-xs font-bold transition-colors no-underline">
                    <PlayIcon style={{ fontSize: 16 }} /> Join Live
                  </a>
                )}
                {cls.status === 'SCHEDULED' && cls.meetingLink && (
                  <a href={cls.meetingLink} target="_blank" rel="noreferrer" className="flex-1 flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-xl text-xs font-bold transition-colors no-underline">
                    <LinkIcon style={{ fontSize: 16 }} /> Meeting Link
                  </a>
                )}
                {cls.status === 'COMPLETED' && cls.recordingUrl && (
                  <a href={cls.recordingUrl} target="_blank" rel="noreferrer" className="flex-1 flex items-center justify-center gap-1.5 bg-gray-700 hover:bg-gray-800 text-white py-2 rounded-xl text-xs font-bold transition-colors no-underline">
                    <RecordIcon style={{ fontSize: 16 }} /> View Recording
                  </a>
                )}
                <button className="flex items-center justify-center gap-1.5 border border-gray-200 text-gray-600 py-2 px-3 rounded-xl text-xs font-semibold hover:bg-gray-50 transition-colors">
                  <ScheduleIcon style={{ fontSize: 14 }} /> Details
                </button>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <VideoIcon className="text-gray-200 mb-4" style={{ fontSize: 64 }} />
            <p className="text-gray-400 font-medium">No classes found</p>
          </div>
        )}
      </div>

      {/* Schedule Dialog */}
      <Dialog open={scheduleDialog} onClose={() => setScheduleDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>📅 Schedule Online Class</DialogTitle>
        <DialogContent dividers>
          <div className="space-y-4 pt-1">
            <TextField label="Class Title" value={form.title || ''} onChange={e => setForm({ ...form, title: e.target.value })} fullWidth required />
            <div className="grid grid-cols-2 gap-3">
              <TextField label="Subject" value={form.subject || ''} onChange={e => setForm({ ...form, subject: e.target.value })} fullWidth />
              <TextField label="Class / Grade" value={form.class || ''} onChange={e => setForm({ ...form, class: e.target.value })} fullWidth />
            </div>
            <TextField label="Date & Time" type="datetime-local" value={form.scheduledAt || ''} onChange={e => setForm({ ...form, scheduledAt: e.target.value })} fullWidth slotProps={{ inputLabel: { shrink: true } }} />
            <div className="grid grid-cols-2 gap-3">
              <TextField label="Duration (minutes)" type="number" value={form.duration || 60} onChange={e => setForm({ ...form, duration: Number(e.target.value) })} fullWidth />
              <FormControl fullWidth>
                <InputLabel>Platform</InputLabel>
                <Select label="Platform" value={form.platform || 'Zoom'} onChange={e => setForm({ ...form, platform: e.target.value as any })}>
                  {['Zoom', 'Google Meet', 'Microsoft Teams', 'Internal'].map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
                </Select>
              </FormControl>
            </div>
            <TextField label="Meeting Link" value={form.meetingLink || ''} onChange={e => setForm({ ...form, meetingLink: e.target.value })} fullWidth placeholder="https://..." />
            <TextField label="Description (optional)" value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} fullWidth multiline rows={2} />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setScheduleDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate} disabled={loading}>Schedule Class</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default OnlineClassManager;
