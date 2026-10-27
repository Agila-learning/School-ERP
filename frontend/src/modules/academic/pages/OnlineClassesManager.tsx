import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../store';
import { getOnlineClasses, createOnlineClass } from '../api/learning.api';
import { VideoCall as VideoIcon, Add as AddIcon, Group as ClassIcon, AccessTime as TimeIcon } from '@mui/icons-material';

const OnlineClassesManager = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const isTeacherOrAdmin = user?.roles?.some(r => ['Teacher', 'Admin', 'Super Admin'].includes(r.name));

  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [meetingLink, setMeetingLink] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [duration, setDuration] = useState(45);
  // Using dummy objectIds for demo unless hooked to actual classes
  const [classId] = useState('65f000000000000000000001'); // Assume valid class ID
  const [subjectId] = useState('65f000000000000000000002'); // Assume valid subject ID

  const fetchClasses = async () => {
    try {
      const data = await getOnlineClasses();
      setClasses(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createOnlineClass({
        title, meetingLink, scheduledAt, durationMinutes: duration, classId, subjectId
      });
      setShowForm(false);
      fetchClasses();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center bg-gradient-to-r from-blue-600 to-indigo-700 p-8 rounded-3xl shadow-lg text-white">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <VideoIcon style={{ fontSize: 36 }} /> Virtual Classrooms
          </h1>
          <p className="mt-2 text-blue-100">Join live sessions and manage online learning</p>
        </div>
        {isTeacherOrAdmin && (
          <button 
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-white text-indigo-600 px-5 py-2.5 rounded-xl font-bold shadow-sm hover:bg-blue-50 transition-all"
          >
            <AddIcon /> Schedule Class
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 animate-fade-in-up">
          <h2 className="text-xl font-bold text-slate-800 mb-6">Schedule New Live Session</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl">
            <div className="space-y-1">
              <label className="text-sm font-bold text-slate-700">Topic / Title</label>
              <input required type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g. Intro to Algebra" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-bold text-slate-700">Meeting Link (Zoom/Meet)</label>
              <input required type="url" value={meetingLink} onChange={e => setMeetingLink(e.target.value)} className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="https://zoom.us/j/..." />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-bold text-slate-700">Date & Time</label>
              <input required type="datetime-local" value={scheduledAt} onChange={e => setScheduledAt(e.target.value)} className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-bold text-slate-700">Duration (Minutes)</label>
              <input required type="number" min={15} value={duration} onChange={e => setDuration(Number(e.target.value))} className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            
            <div className="md:col-span-2 flex justify-end gap-3 mt-4">
              <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 text-slate-600 font-bold hover:bg-slate-50 rounded-xl">Cancel</button>
              <button type="submit" className="bg-indigo-600 text-white px-8 py-2.5 rounded-xl font-bold shadow-md hover:bg-indigo-700">Schedule Session</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <p className="text-slate-500 p-6">Loading sessions...</p>
        ) : classes.length === 0 ? (
          <div className="col-span-full bg-white p-12 text-center rounded-2xl border border-slate-100 shadow-sm">
            <VideoIcon style={{ fontSize: 48 }} className="text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No upcoming classes scheduled</p>
          </div>
        ) : (
          classes.map(c => (
            <div key={c._id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-50 to-transparent rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>
              
              <div className="flex justify-between items-start mb-4">
                <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">{c.status}</span>
                <div className="text-slate-400 bg-slate-50 p-2 rounded-lg">
                  <VideoIcon style={{ fontSize: 20 }} />
                </div>
              </div>
              
              <h3 className="font-bold text-slate-800 text-xl mb-2">{c.title}</h3>
              
              <div className="space-y-2 mt-4 mb-6">
                <p className="text-sm text-slate-600 flex items-center gap-2">
                  <TimeIcon style={{ fontSize: 16 }} className="text-slate-400" />
                  {new Date(c.scheduledAt).toLocaleString()} ({c.durationMinutes} mins)
                </p>
                <p className="text-sm text-slate-600 flex items-center gap-2">
                  <ClassIcon style={{ fontSize: 16 }} className="text-slate-400" />
                  Hosted by {c.teacherId?.firstName} {c.teacherId?.lastName}
                </p>
              </div>

              <a 
                href={c.meetingLink}
                target="_blank"
                rel="noreferrer"
                className="block w-full text-center bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-indigo-600 transition-colors"
              >
                Join Meeting
              </a>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default OnlineClassesManager;
