import React, { useState, useEffect } from 'react';
import { getStudents } from '../api/student.api';
import { getClasses, getSections } from '../../academic/api/academic.api';
import type { StudentSummary } from '../api/student.api';
import type { ClassSummary, SectionSummary } from '../../academic/api/academic.api';
import { Link } from 'react-router-dom';

const StudentDirectory: React.FC = () => {
  const [students, setStudents] = useState<StudentSummary[]>([]);
  const [classes, setClasses] = useState<ClassSummary[]>([]);
  const [sections, setSections] = useState<SectionSummary[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('ALL');
  const [selectedSection, setSelectedSection] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  // Load classes on mount
  useEffect(() => {
    getClasses().then(cls => setClasses(cls || [])).catch(() => setClasses([]));
  }, []);

  // Load sections when class changes
  useEffect(() => {
    if (selectedClass && selectedClass !== 'ALL') {
      getSections(selectedClass).then(sec => setSections(sec || [])).catch(() => setSections([]));
    } else {
      setSections([]);
      setSelectedSection('ALL');
    }
  }, [selectedClass]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (search.trim()) params.search = search.trim();
      if (selectedClass !== 'ALL') params.classId = selectedClass;
      if (selectedSection !== 'ALL') params.sectionId = selectedSection;

      const data = await getStudents(params);
      setStudents(data || []);
    } catch (error) {
      console.error('API error fetching students:', error);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const debounce = setTimeout(() => fetchStudents(), 250);
    return () => clearTimeout(debounce);
  }, [search, selectedClass, selectedSection]);

  const handleResetFilters = () => {
    setSelectedClass('ALL');
    setSelectedSection('ALL');
    setSearch('');
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-5">
      {/* Header and Action Desk */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">Student Directory</h1>
          <p className="text-xs md:text-sm text-gray-500 mt-0.5">
            Centralized student registry synchronized with school enrollments, class rosters & certificates
          </p>
        </div>
        
        <div className="flex items-center gap-2.5 flex-wrap">
          <Link to="/office/bonafide" className="no-underline">
            <button className="px-3.5 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl text-xs font-bold border border-indigo-200 transition-colors cursor-pointer">
              📜 Bonafide Desk
            </button>
          </Link>
          <Link to="/office/students" className="no-underline">
            <button className="px-3.5 py-2 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-xl text-xs font-bold border border-purple-200 transition-colors cursor-pointer">
              + New Admission
            </button>
          </Link>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="bg-white p-3.5 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1">
          {/* Search Bar */}
          <div className="relative flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Search by student name, ID number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none text-xs text-gray-800"
            />
            <span className="absolute left-3 top-2.5 text-gray-400 text-xs">🔍</span>
          </div>

          {/* Class Filter */}
          <div className="w-full sm:w-44">
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-gray-300 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
            >
              <option value="ALL">All Classes</option>
              {classes.map(c => (
                <option key={c.id || (c as any)._id} value={c.id || (c as any)._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Section Filter */}
          <div className="w-full sm:w-40">
            <select
              value={selectedSection}
              disabled={selectedClass === 'ALL'}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-gray-300 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50 cursor-pointer"
            >
              <option value="ALL">All Sections</option>
              {sections.map(s => (
                <option key={s.id || (s as any)._id} value={s.id || (s as any)._id}>
                  Section {s.name}
                </option>
              ))}
            </select>
          </div>

          {(selectedClass !== 'ALL' || selectedSection !== 'ALL' || search) && (
            <button
              onClick={handleResetFilters}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-gray-600 text-xs font-semibold rounded-xl transition-colors cursor-pointer shrink-0"
            >
              Reset
            </button>
          )}
        </div>

        <div className="text-xs text-gray-500 font-medium shrink-0 self-center">
          Showing <strong>{students.length}</strong> scholars
        </div>
      </div>

      {/* Synchronized Students Table */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-gray-200 text-gray-600 uppercase font-semibold tracking-wider text-[11px]">
              <tr>
                <th className="px-5 py-3.5">Student Scholar</th>
                <th className="px-5 py-3.5">Student ID / Roll</th>
                <th className="px-5 py-3.5">Class & Section</th>
                <th className="px-5 py-3.5">Gender / DOB</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mb-2" />
                    <p className="text-xs font-medium">Synchronizing student records...</p>
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    <p className="text-sm font-semibold text-gray-600">No students found matching current filters</p>
                    <p className="text-xs text-gray-400 mt-1">Try selecting a different class, clearing search, or adding a new student.</p>
                  </td>
                </tr>
              ) : (
                students.map((student, idx) => {
                  const studentId = student.id || (student as any)._id || student.studentIdNumber || `STU-${idx + 101}`;
                  const className = student.currentClass || (student as any).class || 'Class Roster';
                  const sectionName = student.currentSection || (student as any).section || '';

                  return (
                    <tr key={studentId} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-3.5 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 border border-indigo-200 flex items-center justify-center text-indigo-700 font-bold text-xs shrink-0 shadow-sm">
                          {student.firstName?.[0] || 'S'}{student.lastName?.[0] || ''}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-gray-900 leading-tight truncate">
                            {student.firstName} {student.lastName}
                          </p>
                          <p className="text-[10px] text-gray-500 mt-0.5">
                            {student.category ? `${student.category} • ` : ''}{student.status || 'Active'}
                          </p>
                        </div>
                      </td>

                      <td className="px-5 py-3.5">
                        <span className="font-mono font-bold text-indigo-900 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 text-[11px]">
                          {student.studentIdNumber || studentId}
                        </span>
                      </td>

                      <td className="px-5 py-3.5">
                        <span className="font-semibold text-gray-800">
                          {className} {sectionName ? `• ${sectionName}` : ''}
                        </span>
                      </td>

                      <td className="px-5 py-3.5 text-gray-600">
                        <span>{student.gender || '—'}</span>
                        {student.dateOfBirth && (
                          <span className="text-[10px] text-gray-400 block mt-0.5">
                            DOB: {new Date(student.dateOfBirth).toLocaleDateString()}
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-3.5">
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[10px] font-bold">
                          {student.status || 'ACTIVE'}
                        </span>
                      </td>

                      <td className="px-5 py-3.5 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Link
                            to={`/students/profile/${studentId}`}
                            className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-[11px] font-bold no-underline transition-colors"
                          >
                            Profile 360
                          </Link>
                          <Link
                            to="/office/bonafide"
                            className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 text-[11px] font-bold no-underline transition-colors"
                            title="Issue Bonafide Certificate"
                          >
                            Bonafide
                          </Link>
                          <Link
                            to={`/students/lifecycle/${studentId}`}
                            className="text-gray-400 hover:text-gray-700 text-xs px-1 no-underline"
                          >
                            Lifecycle
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentDirectory;
