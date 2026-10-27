import { useState, useEffect } from 'react';
import { getExams, getExamSchedules, scheduleExam } from '../api/examination.api';
import { getClasses, getSections } from '../../academic/api/academic.api';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Alert, MenuItem, FormControl, InputLabel, Select } from '@mui/material';
import axios from '../../../core/api/axios';

const ExamScheduleView = () => {
  const [exams, setExams] = useState<any[]>([]);
  const [selectedExamId, setSelectedExamId] = useState('');
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [open, setOpen] = useState(false);
  const [classes, setClasses] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [form, setForm] = useState<any>({});
  const [formError, setFormError] = useState('');

  const loadData = async () => {
    try {
      const ex = await getExams();
      setExams(ex);
      if (ex.length > 0) setSelectedExamId(ex[0].id);
      
      const cls = await getClasses();
      setClasses(cls || []);
      
      // Fallback manual subjects load for now
      const subRes = await axios.get('/academic/subjects');
      setSubjects(subRes.data?.data || []);
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!selectedExamId) return;
    setLoading(true);
    getExamSchedules(selectedExamId).then(data => {
      setSchedules(data);
      setLoading(false);
    });
  }, [selectedExamId]);

  useEffect(() => {
    if (!form.classId) {
      setSections([]);
      return;
    }
    getSections(form.classId).then(setSections).catch(console.error);
  }, [form.classId]);

  const handleSave = async () => {
    try {
      if (!form.classId || !form.subjectId || !form.examDate || !form.startTime || !form.endTime) {
        return setFormError('Missing required fields');
      }
      await scheduleExam({ ...form, examinationId: selectedExamId });
      setOpen(false);
      
      setLoading(true);
      const data = await getExamSchedules(selectedExamId);
      setSchedules(data);
      setLoading(false);
    } catch (e: any) {
      setFormError(e.response?.data?.message || 'Failed to save schedule');
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Exam Schedule</h1>
          <p className="text-sm text-gray-500 mt-1">View and manage examination timetables</p>
        </div>
        <div className="flex space-x-3">
           <select 
              value={selectedExamId} 
              onChange={e => setSelectedExamId(e.target.value)}
              className="px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-md"
           >
             {exams.map(ex => <option key={ex.id} value={ex.id}>{ex.name}</option>)}
           </select>
           <button onClick={() => { setForm({}); setFormError(''); setOpen(true); }} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
             + Schedule Exam
           </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class/Section</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
             {loading ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500 text-sm">Loading...</td></tr>
             ) : schedules.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500 text-sm">No exam schedules found.</td></tr>
             ) : (
                schedules.map((sch: any) => (
                  <tr key={sch._id || sch.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(sch.examDate).toLocaleDateString()} <br/><span className="text-gray-500">{sch.startTime} - {sch.endTime}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sch.classId?.name} - {sch.sectionId?.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sch.subjectId?.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sch.roomId?.name || 'Unassigned'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {sch.status}
                      </span>
                    </td>
                  </tr>
                ))
             )}
          </tbody>
        </table>
      </div>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Schedule Exam</DialogTitle>
        <DialogContent>
          <div className="pt-2 flex flex-col gap-4">
            {formError && <Alert severity="error">{formError}</Alert>}
            <FormControl fullWidth size="small">
              <InputLabel>Class</InputLabel>
              <Select value={form.classId || ''} label="Class" onChange={e => setForm({ ...form, classId: e.target.value })}>
                {classes.map(c => <MenuItem key={c.id || c._id} value={c.id || c._id}>{c.name}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl fullWidth size="small" disabled={!form.classId}>
              <InputLabel>Section</InputLabel>
              <Select value={form.sectionId || ''} label="Section" onChange={e => setForm({ ...form, sectionId: e.target.value })}>
                <MenuItem value=""><em>None / All Sections</em></MenuItem>
                {sections.map(s => <MenuItem key={s.id || s._id} value={s.id || s._id}>{s.name}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl fullWidth size="small">
              <InputLabel>Subject</InputLabel>
              <Select value={form.subjectId || ''} label="Subject" onChange={e => setForm({ ...form, subjectId: e.target.value })}>
                {subjects.map(sub => <MenuItem key={sub.id || sub._id} value={sub.id || sub._id}>{sub.name}</MenuItem>)}
              </Select>
            </FormControl>
            <TextField type="date" label="Date" fullWidth size="small" slotProps={{ inputLabel: { shrink: true } }} value={form.examDate || ''} onChange={e => setForm({ ...form, examDate: e.target.value })} />
            <div className="flex gap-4">
              <TextField type="time" label="Start Time" fullWidth size="small" slotProps={{ inputLabel: { shrink: true } }} value={form.startTime || ''} onChange={e => setForm({ ...form, startTime: e.target.value })} />
              <TextField type="time" label="End Time" fullWidth size="small" slotProps={{ inputLabel: { shrink: true } }} value={form.endTime || ''} onChange={e => setForm({ ...form, endTime: e.target.value })} />
            </div>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>Save Schedule</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ExamScheduleView;
