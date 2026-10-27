import React, { useEffect, useState } from 'react';
import { getCandidates } from '../api/hr.api';

const RecruitmentBoard: React.FC = () => {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const data = await getCandidates();
      setCandidates(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getCount = (statuses: string[]) => candidates.filter(c => statuses.includes(c.status)).length;
  const getCandidatesByStatus = (statuses: string[]) => candidates.filter(c => statuses.includes(c.status));

  const columns = [
    { title: 'Applied', statuses: ['Applied'], color: 'bg-gray-100', border: 'border-gray-500' },
    { title: 'Screening', statuses: ['Screening', 'Shortlisted'], color: 'bg-blue-100', border: 'border-blue-500' },
    { title: 'Interview', statuses: ['Interview'], color: 'bg-purple-100', border: 'border-purple-500' },
    { title: 'Offer Stage', statuses: ['Offer Sent', 'Offer Accepted'], color: 'bg-amber-100', border: 'border-amber-500' },
    { title: 'Hired', statuses: ['Selected'], color: 'bg-green-100', border: 'border-green-500' },
  ];

  return (
    <div className="p-6 h-[calc(100vh-4rem)] flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Recruitment Pipeline</h1>
          <p className="text-sm text-gray-500">Manage candidates for open requisitions</p>
        </div>
        <select className="px-4 py-2 border border-gray-200 rounded-lg bg-white shadow-sm focus:ring-indigo-500 font-medium">
          <option value="">All Requisitions</option>
        </select>
      </div>

      <div className="flex-1 flex gap-6 overflow-x-auto pb-4">
        {loading ? (
          <div className="w-full flex justify-center items-center">Loading...</div>
        ) : (
          columns.map(col => (
            <div key={col.title} className="flex-shrink-0 w-80 flex flex-col bg-gray-50/50 rounded-xl border border-gray-200 h-full">
              <div className={`px-4 py-3 border-b border-gray-200 flex justify-between items-center rounded-t-xl ${col.color}`}>
                <h3 className="font-bold text-gray-800">{col.title}</h3>
                <span className="bg-white/50 text-gray-700 px-2.5 py-0.5 rounded-full text-xs font-bold">{getCount(col.statuses)}</span>
              </div>
              
              <div className="flex-1 p-3 space-y-3 overflow-y-auto">
                {getCandidatesByStatus(col.statuses).map((c: any) => (
                  <div key={c._id} className={`bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md cursor-grab active:cursor-grabbing border-l-4 ${col.border}`}>
                    <h4 className="font-bold text-gray-900 mb-1">{c.firstName} {c.lastName}</h4>
                    <p className="text-xs text-gray-500 mb-3">Exp: {c.totalExperienceYears || 0} Years · {c.highestQualification || 'N/A'}</p>
                    <div className="flex justify-between items-center">
                      <span className={`text-xs font-medium px-2 py-1 rounded bg-gray-50`}>{c.status}</span>
                      <button className="text-xs font-medium text-indigo-600 hover:underline">View</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RecruitmentBoard;
