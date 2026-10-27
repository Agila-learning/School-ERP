import React from 'react';

const SupplementaryExamDesk: React.FC = () => {
  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Supplementary & Make-Up Exams</h1>
          <p className="text-sm text-gray-500">Manage remedial examinations for students who failed or were absent</p>
        </div>
        <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
          + Create Exam
        </button>
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h2 className="font-semibold text-gray-900 mb-4">Active Supplementary Exams</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-12 text-center col-span-2 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
            No active supplementary exams found.
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplementaryExamDesk;
