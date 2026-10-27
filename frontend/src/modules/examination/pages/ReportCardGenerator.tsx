import React, { useState, useEffect } from 'react';
import {
  Search as SearchIcon,
  EmojiEvents as TrophyIcon,
  Print as PrintIcon,
  Share as ShareIcon,
  TrendingUp as TrendIcon,
} from '@mui/icons-material';
import { getExams, getStudentResults, generateReportCards } from '../api/examination.api';
import { getClasses } from '../../academic/api/academic.api';
import type { ClassSummary } from '../../academic/api/academic.api';

const ReportCardGenerator: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [exams, setExams] = useState<any[]>([]);
  const [classes, setClasses] = useState<ClassSummary[]>([]);
  
  const [selectedExam, setSelectedExam] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    Promise.all([getExams(), getClasses()]).then(([exData, clsData]) => {
      setExams(exData);
      setClasses(clsData);
    });
  }, []);

  useEffect(() => {
    if (selectedExam && selectedClass) {
      setLoading(true);
      // Fetch results
      getStudentResults({ examinationId: selectedExam, classId: selectedClass })
        .then((data) => {
          setResults(data);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    } else {
      setResults([]);
    }
  }, [selectedExam, selectedClass]);

  const handleBatchGenerate = async () => {
    if (!selectedExam || !selectedClass) return alert('Select exam and class');
    setGenerating(true);
    try {
      await generateReportCards({ examinationId: selectedExam, classId: selectedClass });
      alert('Report cards generated successfully!');
      // Refetch
      const data = await getStudentResults({ examinationId: selectedExam, classId: selectedClass });
      setResults(data);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to generate');
    } finally {
      setGenerating(false);
    }
  };

  const getRankBadge = (rank: number) => {
    if (!rank) return 'bg-gray-100 text-gray-500 border-gray-200';
    if (rank === 1) return 'bg-yellow-100 text-yellow-700 border-yellow-300';
    if (rank === 2) return 'bg-slate-200 text-slate-700 border-slate-400';
    if (rank === 3) return 'bg-orange-100 text-orange-800 border-orange-300';
    return 'bg-indigo-50 text-indigo-600 border-indigo-100';
  };

  const filteredResults = results.filter(r => 
    !searchTerm || 
    r.studentId?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.studentId?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.studentId?.admissionNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 p-6 space-y-6">
      
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-emerald-600 to-teal-700 p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full translate-x-20 -translate-y-20 blur-2xl" />
        
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
            <TrophyIcon style={{ fontSize: 28 }} />
          </div>
          <div>
            <h1 className="text-3xl font-bold leading-tight">Rank Card Generator</h1>
            <p className="text-emerald-100 text-sm mt-1">Generate beautifully formatted digital report cards and track student rankings.</p>
          </div>
        </div>
        
        <div className="relative z-10 flex gap-3">
          <button 
            onClick={handleBatchGenerate}
            disabled={generating || !selectedExam || !selectedClass}
            className="flex items-center gap-2 bg-white text-teal-700 px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg hover:bg-teal-50 transition-colors disabled:opacity-50"
          >
            <PrintIcon style={{ fontSize: 18 }} /> {generating ? 'Generating...' : 'Batch Generate'}
          </button>
        </div>
      </div>

      {/* Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <select 
          className="w-full p-3 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-teal-500 outline-none"
          value={selectedExam}
          onChange={(e) => setSelectedExam(e.target.value)}
        >
          <option value="">Select Examination</option>
          {exams.map(ex => <option key={ex.id || ex._id} value={ex.id || ex._id}>{ex.name}</option>)}
        </select>
        <select 
          className="w-full p-3 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-teal-500 outline-none"
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
        >
          <option value="">Select Class</option>
          {classes.map(cls => <option key={cls.id || cls._id} value={cls.id || cls._id}>{cls.name}</option>)}
        </select>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50/50">
          <h2 className="font-bold text-gray-800 text-lg">Results Overview</h2>
          <div className="relative w-full sm:w-64">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" style={{ fontSize: 18 }} />
            <input 
              type="text" 
              placeholder="Search student name..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all" 
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white">
                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">Student Profile</th>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 text-center">Score & Grade</th>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 text-center">Class Rank</th>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={4} className="p-8 text-center text-gray-500">Loading results...</td></tr>
              ) : filteredResults.length === 0 ? (
                <tr><td colSpan={4} className="p-8 text-center text-gray-500">No results found. Please select an exam and class.</td></tr>
              ) : filteredResults.map(res => {
                const name = `${res.studentId?.firstName || ''} ${res.studentId?.lastName || ''}`.trim();
                const roll = res.studentId?.rollNumber || res.studentId?.admissionNumber || 'N/A';
                return (
                  <tr key={res._id} className="hover:bg-slate-50 transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold uppercase">
                          {name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{name}</p>
                          <p className="text-xs text-gray-500 font-mono mt-0.5">{roll}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col items-center justify-center">
                        <div className="flex items-end gap-2">
                          <span className="text-xl font-bold text-gray-800">{res.percentage}%</span>
                          <span className={`px-2 py-0.5 rounded text-xs font-bold ${res.isOverallPassed ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                            {res.overallGrade}
                          </span>
                        </div>
                        <div className="w-24 h-1.5 bg-gray-100 rounded-full mt-2 overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${res.isOverallPassed ? 'bg-emerald-500' : 'bg-red-500'}`} 
                            style={{ width: `${res.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex justify-center">
                        <span className={`flex items-center gap-1 border px-3 py-1.5 rounded-xl font-bold shadow-sm ${getRankBadge(res.rank)}`}>
                          {res.rank <= 3 && <TrophyIcon style={{ fontSize: 16 }} />}
                          {res.rank ? `Rank ${res.rank}` : 'Unranked'}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      {res.status === 'PUBLISHED' ? (
                        <div className="flex justify-end gap-2">
                          <button className="flex items-center gap-1.5 bg-white border border-gray-200 text-gray-600 hover:text-teal-700 hover:border-teal-200 hover:bg-teal-50 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm">
                            <PrintIcon style={{ fontSize: 14 }} /> Preview
                          </button>
                          <button className="flex items-center gap-1.5 bg-teal-50 text-teal-700 hover:bg-teal-100 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">
                            <ShareIcon style={{ fontSize: 14 }} /> Share
                          </button>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-600 px-3 py-1.5 rounded-lg text-xs font-bold border border-amber-100">
                          <TrendIcon style={{ fontSize: 14 }} /> {res.status}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReportCardGenerator;
