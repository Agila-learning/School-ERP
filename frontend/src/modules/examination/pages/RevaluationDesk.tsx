import React from 'react';

const RevaluationDesk: React.FC = () => {
  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Revaluation Desk</h1>
          <p className="text-sm text-gray-500">Manage re-totaling and revaluation requests from students/parents</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex gap-4 mb-6">
          <input 
            type="text" 
            placeholder="Search by Student ID, Name, or Subject..." 
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
          />
          <select className="px-4 py-2 border border-gray-300 rounded-lg outline-none">
            <option>All Statuses</option>
            <option>Pending Review</option>
            <option>Approved</option>
            <option>Rejected</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
              <tr>
                <th className="py-3 px-4">Request ID</th>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Exam & Subject</th>
                <th className="py-3 px-4">Original Marks</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-500 italic">
                  No revaluation requests found.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RevaluationDesk;
