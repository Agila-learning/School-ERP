import React from 'react';

const PerformanceAppraisalBoard: React.FC = () => {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Performance & Appraisals</h1>
          <p className="text-sm text-gray-500">Manage Q3 2026 Review Cycle</p>
        </div>
        <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold shadow hover:bg-indigo-700">
          New Cycle
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase">Self Reviews Done</p>
            <p className="text-2xl font-bold text-gray-900">45 / 50</p>
          </div>
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-xl">📝</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase">Manager Reviews</p>
            <p className="text-2xl font-bold text-amber-600">12 / 50</p>
          </div>
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center text-xl">⏳</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase">Completed</p>
            <p className="text-2xl font-bold text-emerald-600">10 / 50</p>
          </div>
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center text-xl">✅</div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
            <tr>
              <th className="px-6 py-4">Employee</th>
              <th className="px-6 py-4">Department</th>
              <th className="px-6 py-4">Self Rating</th>
              <th className="px-6 py-4">Manager Rating</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            <tr className="hover:bg-gray-50">
              <td className="px-6 py-4">
                <p className="font-bold text-gray-900">Arjun Reddy</p>
                <p className="text-xs text-gray-500">Teacher</p>
              </td>
              <td className="px-6 py-4">Academics</td>
              <td className="px-6 py-4">
                <span className="flex text-amber-400 text-lg">★★★★☆</span>
              </td>
              <td className="px-6 py-4">
                <span className="flex text-amber-400 text-lg">★★★★★</span>
              </td>
              <td className="px-6 py-4">
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded">COMPLETED</span>
              </td>
              <td className="px-6 py-4 text-right">
                <button className="text-indigo-600 hover:underline font-medium">View Final</button>
              </td>
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="px-6 py-4">
                <p className="font-bold text-gray-900">Neha Sharma</p>
                <p className="text-xs text-gray-500">Accountant</p>
              </td>
              <td className="px-6 py-4">Finance</td>
              <td className="px-6 py-4">
                <span className="flex text-amber-400 text-lg">★★★★☆</span>
              </td>
              <td className="px-6 py-4 text-gray-400">Pending</td>
              <td className="px-6 py-4">
                <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-1 rounded">UNDER_REVIEW</span>
              </td>
              <td className="px-6 py-4 text-right">
                <button className="text-indigo-600 hover:underline font-medium">Add Review</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PerformanceAppraisalBoard;
